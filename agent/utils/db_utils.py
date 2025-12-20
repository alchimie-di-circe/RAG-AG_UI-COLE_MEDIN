"""Database utilities for the RAG agent."""

import sys
from pathlib import Path
from typing import Any

import asyncpg

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from settings import load_settings


class DatabasePool:
    """Wrapper for asyncpg connection pool with lifecycle management."""

    _pool: asyncpg.Pool | None = None

    @classmethod
    async def get_pool(cls) -> asyncpg.Pool:
        """Get or create the database connection pool."""
        if cls._pool is None:
            settings = load_settings()
            cls._pool = await asyncpg.create_pool(
                settings.database_url,
                min_size=settings.db_pool_min_size,
                max_size=settings.db_pool_max_size,
            )
        return cls._pool

    @classmethod
    async def close(cls) -> None:
        """Close the database connection pool."""
        if cls._pool is not None:
            await cls._pool.close()
            cls._pool = None


async def get_document_by_id(
    pool: asyncpg.Pool, document_id: str
) -> dict[str, Any] | None:
    """Retrieve a document by ID.

    Args:
        pool: Database connection pool.
        document_id: The document UUID.

    Returns:
        Document data as a dictionary or None if not found.
    """
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, title, source, content, metadata, created_at, updated_at
            FROM documents
            WHERE id = $1
            """,
            document_id,
        )
        if row:
            return dict(row)
        return None


async def list_documents(
    pool: asyncpg.Pool, limit: int = 100, offset: int = 0
) -> list[dict[str, Any]]:
    """List documents with pagination.

    Args:
        pool: Database connection pool.
        limit: Maximum number of documents to return.
        offset: Number of documents to skip.

    Returns:
        List of document dictionaries.
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, title, source, metadata, created_at, updated_at
            FROM documents
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            """,
            limit,
            offset,
        )
        return [dict(row) for row in rows]


async def get_document_chunks(
    pool: asyncpg.Pool, document_id: str
) -> list[dict[str, Any]]:
    """Get all chunks for a document.

    Args:
        pool: Database connection pool.
        document_id: The document UUID.

    Returns:
        List of chunk dictionaries ordered by chunk_index.
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, content, chunk_index, metadata, token_count
            FROM chunks
            WHERE document_id = $1
            ORDER BY chunk_index
            """,
            document_id,
        )
        return [dict(row) for row in rows]
