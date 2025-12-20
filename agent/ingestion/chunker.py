"""Simple document chunking for the RAG agent demo."""

import re
from dataclasses import dataclass
from typing import Any


@dataclass
class ChunkingConfig:
    """Configuration for chunking."""

    chunk_size: int = 500
    chunk_overlap: int = 50
    min_chunk_size: int = 100


@dataclass
class DocumentChunk:
    """Represents a document chunk."""

    content: str
    index: int
    metadata: dict[str, Any]
    token_count: int | None = None

    def __post_init__(self):
        """Calculate token count if not provided."""
        if self.token_count is None:
            # Rough estimation: ~4 characters per token
            self.token_count = len(self.content) // 4


class SimpleChunker:
    """Simple document chunker using paragraph boundaries."""

    def __init__(self, config: ChunkingConfig):
        self.config = config

    def chunk_document(
        self,
        content: str,
        title: str,
        source: str,
        metadata: dict[str, Any] | None = None,
    ) -> list[DocumentChunk]:
        """Chunk a document into smaller pieces.

        Args:
            content: Document content.
            title: Document title.
            source: Document source path.
            metadata: Additional metadata.

        Returns:
            List of document chunks.
        """
        if not content.strip():
            return []

        base_metadata = {
            "title": title,
            "source": source,
            **(metadata or {}),
        }

        # Split on section headers first
        sections = self._split_on_sections(content)

        chunks = []
        chunk_index = 0

        for section in sections:
            section = section.strip()
            if len(section) < self.config.min_chunk_size:
                continue

            # If section is small enough, use as-is
            if len(section) <= self.config.chunk_size:
                chunks.append(
                    DocumentChunk(
                        content=section,
                        index=chunk_index,
                        metadata=base_metadata.copy(),
                    )
                )
                chunk_index += 1
            else:
                # Split large sections
                section_chunks = self._split_section(section)
                for chunk_text in section_chunks:
                    chunks.append(
                        DocumentChunk(
                            content=chunk_text,
                            index=chunk_index,
                            metadata=base_metadata.copy(),
                        )
                    )
                    chunk_index += 1

        # Update total_chunks in metadata
        for chunk in chunks:
            chunk.metadata["total_chunks"] = len(chunks)

        return chunks

    def _split_on_sections(self, content: str) -> list[str]:
        """Split content on section headers."""
        # Split on markdown headers
        pattern = r"(?=^#{1,3}\s+)"
        sections = re.split(pattern, content, flags=re.MULTILINE)
        return [s for s in sections if s.strip()]

    def _split_section(self, text: str) -> list[str]:
        """Split a large section into smaller chunks."""
        chunks = []
        paragraphs = re.split(r"\n\s*\n", text)

        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            potential = current_chunk + "\n\n" + para if current_chunk else para

            if len(potential) <= self.config.chunk_size:
                current_chunk = potential
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = para

        if current_chunk:
            chunks.append(current_chunk)

        return chunks


def create_chunker(config: ChunkingConfig | None = None) -> SimpleChunker:
    """Create a chunker with the given configuration."""
    return SimpleChunker(config or ChunkingConfig())
