"""Tests for document chunker."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.chunker import ChunkingConfig, DocumentChunk, SimpleChunker, create_chunker


class TestChunkingConfig:
    """Tests for ChunkingConfig."""

    def test_default_config(self):
        """Test default chunking configuration."""
        config = ChunkingConfig()
        assert config.chunk_size == 500
        assert config.chunk_overlap == 50
        assert config.min_chunk_size == 100

    def test_custom_config(self):
        """Test custom chunking configuration."""
        config = ChunkingConfig(chunk_size=1000, chunk_overlap=100, min_chunk_size=200)
        assert config.chunk_size == 1000
        assert config.chunk_overlap == 100
        assert config.min_chunk_size == 200


class TestDocumentChunk:
    """Tests for DocumentChunk."""

    def test_create_chunk(self):
        """Test creating a document chunk."""
        chunk = DocumentChunk(
            content="Test content here",
            index=0,
            metadata={"title": "Test"},
        )
        assert chunk.content == "Test content here"
        assert chunk.index == 0
        assert chunk.metadata == {"title": "Test"}

    def test_token_count_auto(self):
        """Test automatic token count calculation."""
        chunk = DocumentChunk(
            content="A" * 400,  # 400 characters
            index=0,
            metadata={},
        )
        # Should be approximately 400 / 4 = 100 tokens
        assert chunk.token_count == 100

    def test_token_count_explicit(self):
        """Test explicit token count."""
        chunk = DocumentChunk(
            content="Test",
            index=0,
            metadata={},
            token_count=50,
        )
        assert chunk.token_count == 50


class TestSimpleChunker:
    """Tests for SimpleChunker."""

    def test_create_chunker(self):
        """Test creating a chunker."""
        chunker = create_chunker()
        assert isinstance(chunker, SimpleChunker)

    def test_empty_content(self):
        """Test chunking empty content."""
        chunker = create_chunker()
        chunks = chunker.chunk_document(
            content="",
            title="Test",
            source="test.md",
        )
        assert chunks == []

    def test_whitespace_content(self):
        """Test chunking whitespace-only content."""
        chunker = create_chunker()
        chunks = chunker.chunk_document(
            content="   \n\n   ",
            title="Test",
            source="test.md",
        )
        assert chunks == []

    def test_small_content(self):
        """Test chunking content smaller than chunk size."""
        config = ChunkingConfig(chunk_size=500, min_chunk_size=10)
        chunker = SimpleChunker(config)
        content = "This is a short piece of content."
        chunks = chunker.chunk_document(
            content=content,
            title="Test",
            source="test.md",
        )
        assert len(chunks) == 1
        assert content in chunks[0].content

    def test_chunking_with_headers(self):
        """Test chunking content with markdown headers."""
        config = ChunkingConfig(chunk_size=500, min_chunk_size=50)
        chunker = SimpleChunker(config)
        content = """# Section 1

This is the first section with some content.

## Section 2

This is the second section with more content here.

### Section 3

And this is the third section.
"""
        chunks = chunker.chunk_document(
            content=content,
            title="Test",
            source="test.md",
        )
        assert len(chunks) >= 1
        # All chunks should have metadata
        for chunk in chunks:
            assert "title" in chunk.metadata
            assert chunk.metadata["title"] == "Test"

    def test_metadata_preservation(self):
        """Test that metadata is preserved in chunks."""
        chunker = create_chunker(ChunkingConfig(min_chunk_size=10))
        chunks = chunker.chunk_document(
            content="# Test\n\nSome content here.",
            title="My Document",
            source="document.md",
            metadata={"author": "Test Author"},
        )
        assert len(chunks) >= 1
        assert chunks[0].metadata["title"] == "My Document"
        assert chunks[0].metadata["source"] == "document.md"
        assert chunks[0].metadata["author"] == "Test Author"

    def test_total_chunks_in_metadata(self):
        """Test that total_chunks is added to metadata."""
        config = ChunkingConfig(chunk_size=100, min_chunk_size=20)
        chunker = SimpleChunker(config)
        content = """# Section 1

First paragraph with content.

# Section 2

Second paragraph with content.
"""
        chunks = chunker.chunk_document(
            content=content,
            title="Test",
            source="test.md",
        )
        for chunk in chunks:
            assert "total_chunks" in chunk.metadata
            assert chunk.metadata["total_chunks"] == len(chunks)
