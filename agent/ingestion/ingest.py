"""Simple document ingestion script for the RAG agent demo."""

import asyncio
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

import asyncpg

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.chunker import ChunkingConfig, create_chunker
from settings import load_settings


async def generate_embedding(client, text: str, model: str) -> list[float]:
    """Generate embedding for text using OpenAI."""
    response = await client.embeddings.create(model=model, input=text)
    return response.data[0].embedding


async def ingest_document(
    pool: asyncpg.Pool,
    client,
    chunker,
    settings,
    file_path: str,
    progress_callback=None,
) -> dict:
    """Ingest a single document.

    Args:
        pool: Database connection pool.
        client: OpenAI client for embeddings.
        chunker: Document chunker.
        settings: Application settings.
        file_path: Path to the document.
        progress_callback: Optional progress callback.

    Returns:
        Ingestion result dict.
    """
    # Read document
    with open(file_path, encoding="utf-8") as f:
        content = f.read()

    # Extract title from first heading or filename
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = title_match.group(1) if title_match else Path(file_path).stem
    source = os.path.basename(file_path)

    # Chunk the document
    chunks = chunker.chunk_document(
        content=content,
        title=title,
        source=source,
        metadata={"file_path": file_path, "ingestion_date": datetime.now().isoformat()},
    )

    if not chunks:
        return {"title": title, "chunks_created": 0, "error": "No chunks created"}

    # Insert document
    async with pool.acquire() as conn:
        doc_result = await conn.fetchrow(
            """
            INSERT INTO documents (title, source, content, metadata)
            VALUES ($1, $2, $3, $4)
            RETURNING id::text
            """,
            title,
            source,
            content,
            json.dumps({"file_path": file_path}),
        )
        doc_id = doc_result["id"]

        # Generate embeddings and insert chunks
        for i, chunk in enumerate(chunks):
            if progress_callback:
                progress_callback(f"  Embedding chunk {i + 1}/{len(chunks)}")

            embedding = await generate_embedding(
                client, chunk.content, settings.embedding_model
            )

            # Convert to PostgreSQL vector format
            embedding_str = "[" + ",".join(map(str, embedding)) + "]"

            await conn.execute(
                """
                INSERT INTO chunks (document_id, content, embedding, chunk_index, metadata, token_count)
                VALUES ($1::uuid, $2, $3::vector, $4, $5, $6)
                """,
                doc_id,
                chunk.content,
                embedding_str,
                chunk.index,
                json.dumps(chunk.metadata),
                chunk.token_count,
            )

    return {"title": title, "chunks_created": len(chunks), "document_id": doc_id}


async def main():
    """Main ingestion function."""
    import openai

    print("=" * 50)
    print("Interactive RAG Agent - Document Ingestion")
    print("=" * 50)

    # Load settings
    try:
        settings = load_settings()
    except Exception as e:
        print(f"Error: Failed to load settings: {e}")
        print("Make sure you have a .env file with DATABASE_URL and LLM_API_KEY")
        return

    # Initialize OpenAI client
    client = openai.AsyncOpenAI(
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
    )

    # Initialize database pool
    print("Connecting to database...")
    pool = await asyncpg.create_pool(
        settings.database_url,
        min_size=1,
        max_size=5,
    )

    # Create chunker
    config = ChunkingConfig(chunk_size=500, chunk_overlap=50)
    chunker = create_chunker(config)

    # Find documents folder
    docs_folder = Path(__file__).parent.parent / "documents"
    if not docs_folder.exists():
        print(f"Error: Documents folder not found: {docs_folder}")
        return

    # Find markdown files
    files = list(docs_folder.glob("*.md"))
    if not files:
        print(f"No markdown files found in {docs_folder}")
        return

    print(f"Found {len(files)} document(s) to ingest")
    print()

    # Process each file
    results = []
    for i, file_path in enumerate(files):
        print(f"[{i + 1}/{len(files)}] Processing: {file_path.name}")

        def progress(msg):
            print(msg)

        try:
            result = await ingest_document(
                pool, client, chunker, settings, str(file_path), progress
            )
            results.append(result)
            print(f"  Created {result['chunks_created']} chunks")
        except Exception as e:
            print(f"  Error: {e}")
            results.append({"title": file_path.name, "error": str(e)})

        print()

    # Print summary
    print("=" * 50)
    print("INGESTION SUMMARY")
    print("=" * 50)
    total_chunks = sum(r.get("chunks_created", 0) for r in results)
    errors = [r for r in results if "error" in r]
    print(f"Documents processed: {len(results)}")
    print(f"Total chunks created: {total_chunks}")
    print(f"Errors: {len(errors)}")

    if errors:
        print("\nErrors:")
        for r in errors:
            print(f"  - {r['title']}: {r['error']}")

    # Close pool
    await pool.close()
    print("\nIngestion complete!")


if __name__ == "__main__":
    asyncio.run(main())
