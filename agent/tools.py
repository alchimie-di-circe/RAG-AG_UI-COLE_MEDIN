"""Search tools for the Interactive RAG Agent."""

import json
from typing import Any

from pydantic import BaseModel, Field

from dependencies import AgentDependencies


class SearchResult(BaseModel):
    """Model for search results."""

    chunk_id: str = Field(description="Unique identifier for the chunk")
    document_id: str = Field(description="ID of the source document")
    content: str = Field(description="The actual text content")
    similarity: float = Field(description="Similarity score (0-1)")
    metadata: dict[str, Any] = Field(default_factory=dict)
    document_title: str = Field(description="Title of the source document")
    document_source: str = Field(description="Source/path of the document")


async def semantic_search(
    deps: AgentDependencies,
    query: str,
    match_count: int | None = None,
    similarity_threshold: float | None = None,
) -> list[SearchResult]:
    """Perform pure semantic search using vector similarity.

    Args:
        deps: Agent dependencies with database pool and embedding client.
        query: Search query text.
        match_count: Number of results to return (default from settings).
        similarity_threshold: Minimum similarity score (default from settings).

    Returns:
        List of search results ordered by similarity.
    """
    assert deps.settings is not None
    assert deps.db_pool is not None

    # Use defaults if not specified
    if match_count is None:
        match_count = deps.settings.default_match_count
    if similarity_threshold is None:
        similarity_threshold = deps.settings.default_similarity_threshold

    # Validate match count
    match_count = min(match_count, deps.settings.max_match_count)

    # Generate embedding for query
    query_embedding = await deps.get_embedding(query)

    # Convert embedding to PostgreSQL vector string format
    embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"

    # Execute semantic search
    async with deps.db_pool.acquire() as conn:
        results = await conn.fetch(
            """
            SELECT * FROM match_chunks($1::vector, $2)
            WHERE similarity >= $3
            """,
            embedding_str,
            match_count,
            similarity_threshold,
        )

    # Convert to SearchResult objects
    return [
        SearchResult(
            chunk_id=str(row["chunk_id"]),
            document_id=str(row["document_id"]),
            content=row["content"],
            similarity=row["similarity"],
            metadata=json.loads(row["metadata"]) if row["metadata"] else {},
            document_title=row["document_title"],
            document_source=row["document_source"],
        )
        for row in results
    ]


async def hybrid_search(
    deps: AgentDependencies,
    query: str,
    match_count: int | None = None,
    text_weight: float | None = None,
) -> list[dict[str, Any]]:
    """Perform hybrid search combining semantic and keyword matching.

    Args:
        deps: Agent dependencies with database pool and embedding client.
        query: Search query text.
        match_count: Number of results to return (default from settings).
        text_weight: Weight for text matching (0-1, default from settings).

    Returns:
        List of search results with combined scores.
    """
    assert deps.settings is not None
    assert deps.db_pool is not None

    # Use defaults if not specified
    if match_count is None:
        match_count = deps.settings.default_match_count
    if text_weight is None:
        text_weight = deps.user_preferences.get(
            "text_weight", deps.settings.default_text_weight
        )

    # Validate parameters
    match_count = min(match_count, deps.settings.max_match_count)
    text_weight = max(0.0, min(1.0, text_weight))

    # Generate embedding for query
    query_embedding = await deps.get_embedding(query)

    # Convert embedding to PostgreSQL vector string format
    # PostgreSQL vector format: '[1.0,2.0,3.0]' (no spaces after commas)
    embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"

    # Execute hybrid search
    async with deps.db_pool.acquire() as conn:
        results = await conn.fetch(
            """
            SELECT * FROM hybrid_search($1::vector, $2, $3, $4)
            """,
            embedding_str,
            query,
            match_count,
            text_weight,
        )

    # Convert to dictionaries with additional scores
    return [
        {
            "chunk_id": str(row["chunk_id"]),
            "document_id": str(row["document_id"]),
            "content": row["content"],
            "combined_score": row["combined_score"],
            "vector_similarity": row["vector_similarity"],
            "text_similarity": row["text_similarity"],
            "metadata": json.loads(row["metadata"]) if row["metadata"] else {},
            "document_title": row["document_title"],
            "document_source": row["document_source"],
        }
        for row in results
    ]


async def get_chunk_count(deps: AgentDependencies) -> int:
    """Get the total number of chunks in the knowledge base.

    Args:
        deps: Agent dependencies with database pool.

    Returns:
        Total count of chunks.
    """
    assert deps.db_pool is not None

    async with deps.db_pool.acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM chunks")
        return count or 0
