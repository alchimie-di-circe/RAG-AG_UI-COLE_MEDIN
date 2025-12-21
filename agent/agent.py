"""Main AGUI-enabled RAG agent implementation with shared state.

This agent demonstrates the full power of CopilotKit's useAgent hook through
a natural human-in-the-loop source validation workflow.
"""

from collections import defaultdict
from datetime import datetime

import structlog
from ag_ui.core import EventType, StateSnapshotEvent
from pydantic_ai import Agent, RunContext, ToolReturn
from pydantic_ai.ag_ui import StateDeps

from dependencies import AgentDependencies
from prompts import MAIN_SYSTEM_PROMPT
from providers import get_llm_model
from state import RAGState, RetrievedChunk, SearchQuery
from tools import get_chunk_count, hybrid_search, semantic_search

logger = structlog.get_logger(__name__)


def _assign_chunk_indices(chunks: list[RetrievedChunk]) -> list[RetrievedChunk]:
    """Assign per-document chunk indices to a list of chunks.

    For each document, chunks are numbered 1, 2, 3, etc. based on
    the order they appear in the list (which is typically sorted by similarity).

    Args:
        chunks: List of chunks to assign indices to.

    Returns:
        The same list with chunk_index fields populated.
    """
    doc_counters: dict[str, int] = defaultdict(int)
    for chunk in chunks:
        doc_counters[chunk.document_id] += 1
        chunk.chunk_index = doc_counters[chunk.document_id]
    return chunks

# Create the RAG agent with AGUI support
rag_agent = Agent(
    get_llm_model(),
    deps_type=StateDeps[RAGState],
    system_prompt=MAIN_SYSTEM_PROMPT,
)


@rag_agent.tool
async def search_knowledge_base(
    ctx: RunContext[StateDeps[RAGState]],
    query: str,
) -> ToolReturn:
    """Search the knowledge base for relevant information.

    WHEN TO USE: When the user asks a question that requires information
    from the knowledge base.

    WORKFLOW: After calling this tool, STOP and tell the user to review the
    sources displayed in the left panel. Do NOT synthesize an answer until
    they have approved sources.

    Args:
        ctx: Agent runtime context with state dependencies.
        query: The search query text.

    Returns:
        ToolReturn with search results and state snapshot for UI sync.
    """
    state = ctx.deps.state
    config = state.search_config

    # Update state to show searching
    state.is_searching = True
    state.error_message = None

    # Create search query record
    search_query = SearchQuery(
        query=query,
        timestamp=datetime.now().isoformat(),
        match_count=config.max_results,
        search_type=config.search_type,
    )
    state.current_query = search_query

    try:
        # Initialize dependencies for database access
        agent_deps = AgentDependencies()
        await agent_deps.initialize()

        logger.info(
            "search.started",
            query=query,
            search_type=config.search_type,
            max_results=config.max_results,
            similarity_threshold=config.similarity_threshold,
        )

        # Perform the search based on user's config
        if config.search_type == "hybrid":
            results = await hybrid_search(
                deps=agent_deps,
                query=query,
                match_count=config.max_results,
            )
            # Convert hybrid results to RetrievedChunk format
            chunks = [
                RetrievedChunk(
                    chunk_id=str(result["chunk_id"]),
                    document_id=str(result["document_id"]),
                    content=result["content"],
                    similarity=result["combined_score"],
                    metadata={
                        **result["metadata"],
                        "vector_similarity": result["vector_similarity"],
                        "text_similarity": result["text_similarity"],
                    },
                    document_title=result["document_title"],
                    document_source=result["document_source"],
                    approved=False,
                )
                for result in results
                if result["combined_score"] >= config.similarity_threshold
            ]
        else:
            results = await semantic_search(
                deps=agent_deps,
                query=query,
                match_count=config.max_results,
                similarity_threshold=config.similarity_threshold,
            )
            # Convert SearchResult to RetrievedChunk
            chunks = [
                RetrievedChunk(
                    chunk_id=result.chunk_id,
                    document_id=result.document_id,
                    content=result.content,
                    similarity=result.similarity,
                    metadata=result.metadata,
                    document_title=result.document_title,
                    document_source=result.document_source,
                    approved=False,
                )
                for result in results
            ]

        # Assign per-document chunk indices and update state
        state.retrieved_chunks = _assign_chunk_indices(chunks)
        state.is_searching = False

        logger.info(
            "search.completed",
            query=query,
            chunks_found=len(chunks),
            chunks=[
                {
                    "chunk_index": c.chunk_index,
                    "document_title": c.document_title,
                    "similarity": f"{c.similarity:.0%}",
                }
                for c in chunks
            ],
        )
        state.awaiting_approval = len(chunks) > 0
        state.approved_chunk_ids = []  # Reset approvals for new search

        # Update search history (keep last 10)
        state.search_history.append(search_query)
        if len(state.search_history) > 10:
            state.search_history = state.search_history[-10:]

        # Get knowledge base stats
        state.total_chunks_in_kb = await get_chunk_count(agent_deps)
        state.knowledge_base_status = "ready"

        # Clean up
        await agent_deps.cleanup()

        # Build message for the LLM (include chunk indices so agent can reference them)
        if chunks:
            sources = [
                f"- Chunk {c.chunk_index} of {c.document_title} ({c.similarity:.0%} match)"
                for c in chunks[:5]
            ]
            message = f"Found {len(chunks)} sources. They are now displayed in the UI for user review.\n" + "\n".join(sources)
        else:
            message = "No relevant sources found in the knowledge base."

        # Return ToolReturn with both the LLM message AND the state snapshot
        return ToolReturn(
            return_value=message,
            metadata=[
                StateSnapshotEvent(
                    type=EventType.STATE_SNAPSHOT,
                    snapshot=state.model_dump(),
                ),
            ],
        )

    except Exception as e:
        # Handle errors gracefully
        state.is_searching = False
        state.retrieved_chunks = []
        state.error_message = str(e)
        state.knowledge_base_status = f"error: {str(e)}"

        return ToolReturn(
            return_value=f"Search failed: {str(e)}",
            metadata=[
                StateSnapshotEvent(
                    type=EventType.STATE_SNAPSHOT,
                    snapshot=state.model_dump(),
                ),
            ],
        )


@rag_agent.tool
async def get_state(
    ctx: RunContext[StateDeps[RAGState]],
) -> ToolReturn:
    """Get the current UI state including retrieved chunks, user selections, and settings.

    WHEN TO USE: When you need to know ANYTHING about the current state of the application.
    This includes:
    - What chunks have been retrieved
    - Which chunks the user has selected/approved
    - Current search settings (similarity threshold, max results, search type)
    - The current query
    - Whether a search is in progress

    IMPORTANT: You do NOT automatically see the UI state. You MUST call this tool to
    check what the user has done in the interface (selections, settings changes, etc.).

    Args:
        ctx: Agent runtime context with state dependencies.

    Returns:
        ToolReturn with a summary of the current application state.
    """
    state = ctx.deps.state
    approved_ids = set(state.approved_chunk_ids)

    # Build state summary
    lines = ["## Current Application State\n"]

    # Search status
    if state.is_searching:
        lines.append("**Status:** Currently searching...")
    elif state.is_synthesizing:
        lines.append("**Status:** Currently synthesizing answer...")
    else:
        lines.append("**Status:** Idle")

    # Current query
    if state.current_query:
        lines.append(f"**Last Query:** \"{state.current_query.query}\"")

    # Search config
    config = state.search_config
    lines.append("\n**Search Settings:**")
    lines.append(f"- Similarity threshold: {config.similarity_threshold:.0%}")
    lines.append(f"- Max results: {config.max_results}")
    lines.append(f"- Search type: {config.search_type}")

    # Retrieved chunks
    lines.append(f"\n**Retrieved Chunks:** {len(state.retrieved_chunks)} total")
    if state.retrieved_chunks:
        for chunk in state.retrieved_chunks:
            selected = "SELECTED" if chunk.chunk_id in approved_ids else "not selected"
            lines.append(
                f"- Chunk {chunk.chunk_index} of {chunk.document_title} "
                f"({chunk.similarity:.0%} match) - {selected}"
            )

    # Selection summary
    selected_count = len(approved_ids)
    lines.append(f"\n**User Selections:** {selected_count} chunk(s) selected")
    if selected_count > 0:
        selected_chunks = [c for c in state.retrieved_chunks if c.chunk_id in approved_ids]
        for chunk in selected_chunks:
            lines.append(f"- Chunk {chunk.chunk_index} of {chunk.document_title}")

    # Error if any
    if state.error_message:
        lines.append(f"\n**Error:** {state.error_message}")

    return ToolReturn(
        return_value="\n".join(lines),
        metadata=[],
    )


@rag_agent.tool
async def get_knowledge_base_stats(
    ctx: RunContext[StateDeps[RAGState]],
) -> ToolReturn:
    """Get statistics about the knowledge base.

    WHEN TO USE: When the user asks about the knowledge base size or status.

    Args:
        ctx: Agent runtime context with state dependencies.

    Returns:
        ToolReturn with knowledge base statistics.
    """
    state = ctx.deps.state

    try:
        agent_deps = AgentDependencies()
        await agent_deps.initialize()

        state.total_chunks_in_kb = await get_chunk_count(agent_deps)
        state.knowledge_base_status = "ready"

        await agent_deps.cleanup()

        return ToolReturn(
            return_value=f"Knowledge base has {state.total_chunks_in_kb} chunks. Status: ready.",
            metadata=[
                StateSnapshotEvent(
                    type=EventType.STATE_SNAPSHOT,
                    snapshot=state.model_dump(),
                ),
            ],
        )

    except Exception as e:
        state.knowledge_base_status = f"error: {str(e)}"
        return ToolReturn(
            return_value=f"Error getting knowledge base stats: {str(e)}",
            metadata=[
                StateSnapshotEvent(
                    type=EventType.STATE_SNAPSHOT,
                    snapshot=state.model_dump(),
                ),
            ],
        )


@rag_agent.tool
async def synthesize_with_sources(
    ctx: RunContext[StateDeps[RAGState]],
) -> ToolReturn:
    """Synthesize an answer using the approved sources.

    WHEN TO USE: ONLY after the user has explicitly approved sources and told
    you to proceed. Check that approved_chunk_ids is not empty.

    Args:
        ctx: Agent runtime context with state dependencies.

    Returns:
        ToolReturn with the approved source content for synthesis.
    """
    state = ctx.deps.state

    # Get approved chunks
    approved_chunks = [
        chunk
        for chunk in state.retrieved_chunks
        if chunk.chunk_id in state.approved_chunk_ids
    ]

    logger.info(
        "synthesis.started",
        total_chunks_available=len(state.retrieved_chunks),
        approved_chunk_ids=state.approved_chunk_ids,
        approved_chunks_count=len(approved_chunks),
        approved_chunks=[
            {
                "chunk_index": c.chunk_index,
                "document_title": c.document_title,
                "similarity": f"{c.similarity:.0%}",
                "content_preview": c.content[:100] + "..." if len(c.content) > 100 else c.content,
            }
            for c in approved_chunks
        ],
    )

    if not approved_chunks:
        logger.warning("synthesis.no_approved_chunks")
        return ToolReturn(
            return_value="No sources have been approved yet. Please wait for the user to approve sources in the UI.",
            metadata=[],
        )

    # Update state
    state.is_synthesizing = True
    state.awaiting_approval = False
    state.error_message = None

    # Build context from approved chunks (include chunk index for reference)
    context_parts = []
    for chunk in approved_chunks:
        context_parts.append(
            f"[Source: Chunk {chunk.chunk_index} of {chunk.document_title}]\n{chunk.content}"
        )

    context = "\n\n---\n\n".join(context_parts)

    # Mark synthesis complete
    state.is_synthesizing = False

    logger.info(
        "synthesis.completed",
        chunks_used=len(approved_chunks),
        chunk_summaries=[
            f"Chunk {c.chunk_index} of {c.document_title}"
            for c in approved_chunks
        ],
    )

    return ToolReturn(
        return_value=f"Here are the {len(approved_chunks)} approved sources to use for your answer:\n\n{context}",
        metadata=[
            StateSnapshotEvent(
                type=EventType.STATE_SNAPSHOT,
                snapshot=state.model_dump(),
            ),
        ],
    )


# Convert agent to AGUI app
app = rag_agent.to_ag_ui(deps=StateDeps(RAGState()))
