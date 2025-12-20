"""Tests for state models."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from state import RAGState, RetrievedChunk, SearchConfig, SearchQuery


class TestRetrievedChunk:
    """Tests for RetrievedChunk model."""

    def test_create_chunk(self):
        """Test creating a retrieved chunk."""
        chunk = RetrievedChunk(
            chunk_id="test-id",
            document_id="doc-id",
            content="Test content",
            similarity=0.85,
            metadata={"key": "value"},
            document_title="Test Doc",
            document_source="test.md",
        )
        assert chunk.chunk_id == "test-id"
        assert chunk.similarity == 0.85
        assert chunk.approved is False  # default

    def test_chunk_defaults(self):
        """Test chunk default values."""
        chunk = RetrievedChunk(
            chunk_id="test-id",
            document_id="doc-id",
            content="Test content",
            similarity=0.5,
            document_title="Test",
            document_source="test.md",
        )
        assert chunk.metadata == {}
        assert chunk.approved is False


class TestSearchConfig:
    """Tests for SearchConfig model."""

    def test_default_config(self):
        """Test default search configuration."""
        config = SearchConfig()
        assert config.similarity_threshold == 0.5
        assert config.max_results == 10
        assert config.search_type == "semantic"

    def test_custom_config(self):
        """Test custom search configuration."""
        config = SearchConfig(
            similarity_threshold=0.8,
            max_results=5,
            search_type="hybrid",
        )
        assert config.similarity_threshold == 0.8
        assert config.max_results == 5
        assert config.search_type == "hybrid"


class TestSearchQuery:
    """Tests for SearchQuery model."""

    def test_create_query(self):
        """Test creating a search query."""
        query = SearchQuery(
            query="test query",
            timestamp="2025-01-01T00:00:00",
            match_count=10,
            search_type="semantic",
        )
        assert query.query == "test query"
        assert query.match_count == 10


class TestRAGState:
    """Tests for RAGState model."""

    def test_default_state(self):
        """Test default RAG state."""
        state = RAGState()
        assert state.retrieved_chunks == []
        assert state.current_query is None
        assert state.search_history == []
        assert state.total_chunks_in_kb == 0
        assert state.knowledge_base_status == "ready"
        assert state.approved_chunk_ids == []
        assert state.awaiting_approval is False
        assert state.is_searching is False
        assert state.is_synthesizing is False
        assert state.error_message is None

    def test_state_with_chunks(self):
        """Test state with retrieved chunks."""
        chunk = RetrievedChunk(
            chunk_id="test-id",
            document_id="doc-id",
            content="Test content",
            similarity=0.85,
            document_title="Test",
            document_source="test.md",
        )
        state = RAGState(
            retrieved_chunks=[chunk],
            awaiting_approval=True,
        )
        assert len(state.retrieved_chunks) == 1
        assert state.awaiting_approval is True

    def test_state_serialization(self):
        """Test state can be serialized to dict."""
        state = RAGState()
        state_dict = state.model_dump()
        assert isinstance(state_dict, dict)
        assert "retrieved_chunks" in state_dict
        assert "search_config" in state_dict

    def test_search_config_nested(self):
        """Test nested search config."""
        state = RAGState()
        assert state.search_config.similarity_threshold == 0.5
        assert state.search_config.search_type == "semantic"
