"""RAG State models for bidirectional state synchronization via AG-UI.

This module defines the shared state between the Python agent and the React frontend.
These models are the contract - field names must match exactly in the TypeScript types.
"""

from typing import Any

from pydantic import BaseModel, Field


class RetrievedChunk(BaseModel):
    """A chunk retrieved from the knowledge base.

    This model represents a document chunk with similarity scoring
    and approval status for human-in-the-loop validation.
    """

    chunk_id: str = Field(description="Unique identifier for the chunk")
    document_id: str = Field(description="ID of the source document")
    content: str = Field(description="The actual text content of the chunk")
    similarity: float = Field(description="Similarity score to the query (0-1)")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )
    document_title: str = Field(description="Title of the source document")
    document_source: str = Field(description="Source/path of the document")
    chunk_index: int = Field(
        default=1,
        description="1-based index of this chunk within its document (e.g., Chunk 2 of Document A)",
    )
    approved: bool = Field(
        default=False, description="Whether this chunk has been approved by the user"
    )


class SearchQuery(BaseModel):
    """Model for a search query with metadata."""

    query: str = Field(description="The search query text")
    timestamp: str = Field(description="ISO timestamp when the query was made")
    match_count: int = Field(default=10, description="Number of results requested")
    search_type: str = Field(
        default="semantic", description="Type of search (semantic or hybrid)"
    )


class SearchConfig(BaseModel):
    """User-configurable search parameters.

    This model enables bidirectional state sync - users can adjust
    these settings in the frontend, and the agent respects them.
    """

    similarity_threshold: float = Field(
        default=0.5, description="Minimum similarity score for results (0-1)"
    )
    max_results: int = Field(default=10, description="Maximum number of results")
    search_type: str = Field(
        default="semantic", description="Search type: 'semantic' or 'hybrid'"
    )


class RAGState(BaseModel):
    """Shared state between agent and frontend via AG-UI.

    This model demonstrates all useAgent capabilities:
    - agent.state: All fields are readable by the frontend
    - agent.setState: approved_chunk_ids, search_config updated by frontend
    - STATE_SNAPSHOT: Full state sent after retrieval
    - STATE_DELTA: Incremental updates for approvals

    CRITICAL: Field names must match exactly in TypeScript types.
    """

    # Retrieved data (agent -> frontend)
    retrieved_chunks: list[RetrievedChunk] = Field(
        default_factory=list, description="List of chunks retrieved from knowledge base"
    )
    current_query: SearchQuery | None = Field(
        default=None, description="The current search query being processed"
    )
    search_history: list[SearchQuery] = Field(
        default_factory=list, description="History of search queries"
    )

    # Knowledge base info
    total_chunks_in_kb: int = Field(
        default=0, description="Total number of chunks in the knowledge base"
    )
    knowledge_base_status: str = Field(
        default="ready", description="Status: ready, indexing, error"
    )

    # HITL approval workflow (frontend <-> agent)
    approved_chunk_ids: list[str] = Field(
        default_factory=list, description="IDs of chunks approved by the user"
    )
    awaiting_approval: bool = Field(
        default=False, description="Whether the agent is waiting for user approval"
    )

    # User-configurable search (frontend -> agent)
    search_config: SearchConfig = Field(
        default_factory=SearchConfig, description="User-adjustable search parameters"
    )

    # UI state hints
    is_searching: bool = Field(
        default=False, description="Whether a search is currently in progress"
    )
    is_synthesizing: bool = Field(
        default=False, description="Whether the agent is synthesizing an answer"
    )
    error_message: str | None = Field(
        default=None, description="Error message if something went wrong"
    )
