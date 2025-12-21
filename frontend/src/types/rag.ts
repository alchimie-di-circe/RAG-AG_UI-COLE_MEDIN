/**
 * TypeScript types for the RAG Agent state.
 *
 * CRITICAL: These types MUST match the Python models in agent/state.py exactly.
 * Field names are the contract between frontend and backend.
 */

/**
 * A chunk retrieved from the knowledge base.
 */
export interface RetrievedChunk {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
  document_title: string;
  document_source: string;
  chunk_index: number;  // 1-based index within the document (e.g., Chunk 2 of Document A)
  approved: boolean;
}

/**
 * Model for a search query with metadata.
 */
export interface SearchQuery {
  query: string;
  timestamp: string;
  match_count: number;
  search_type: string;
}

/**
 * User-configurable search parameters.
 * Enables bidirectional state sync - users can adjust these
 * settings in the frontend, and the agent respects them.
 */
export interface SearchConfig {
  similarity_threshold: number;
  max_results: number;
  search_type: string;
}

/**
 * Shared state between agent and frontend via AG-UI.
 *
 * This interface demonstrates all useAgent capabilities:
 * - agent.state: All fields are readable by the frontend
 * - agent.setState: approved_chunk_ids, search_config updated by frontend
 * - STATE_SNAPSHOT: Full state sent after retrieval
 * - STATE_DELTA: Incremental updates for approvals
 */
export interface RAGState {
  // Retrieved data (agent -> frontend)
  retrieved_chunks: RetrievedChunk[];
  current_query: SearchQuery | null;
  search_history: SearchQuery[];

  // Knowledge base info
  total_chunks_in_kb: number;
  knowledge_base_status: string;

  // HITL approval workflow (frontend <-> agent)
  approved_chunk_ids: string[];
  awaiting_approval: boolean;

  // User-configurable search (frontend -> agent)
  search_config: SearchConfig;

  // UI state hints
  is_searching: boolean;
  is_synthesizing: boolean;
  error_message: string | null;
}

/**
 * Default initial state for the RAG agent.
 */
export const initialRAGState: RAGState = {
  retrieved_chunks: [],
  current_query: null,
  search_history: [],
  total_chunks_in_kb: 0,
  knowledge_base_status: "ready",
  approved_chunk_ids: [],
  awaiting_approval: false,
  search_config: {
    similarity_threshold: 0.5,
    max_results: 10,
    search_type: "semantic",
  },
  is_searching: false,
  is_synthesizing: false,
  error_message: null,
};
