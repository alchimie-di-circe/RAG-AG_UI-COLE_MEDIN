/**
 * Interactive RAG Agent - Main Page
 *
 * Demonstrates CopilotKit's useAgent hook:
 * - agent.state: Reading shared state (retrieved chunks)
 * - agent.setState(): Writing state (approvals, search config)
 * - agent.setMessages(): Time travel (reset conversation)
 */

"use client";

import { useEffect } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-ui";

import type { RAGState, SearchConfig } from "@/types/rag";
import { initialRAGState } from "@/types/rag";
import { ChunksPanel } from "@/components/ChunksPanel";
import { SearchControls } from "@/components/SearchControls";
import { ConversationControls } from "@/components/ConversationControls";

export default function RAGAgentPage() {
  // THE KEY HOOK - demonstrates agent.state reading
  const { agent } = useAgent({ agentId: "rag_agent" });

  // Merge agent state with defaults to ensure all fields exist
  const rawState = agent.state as Partial<RAGState> | null;
  const state: RAGState = {
    retrieved_chunks: rawState?.retrieved_chunks ?? initialRAGState.retrieved_chunks,
    current_query: rawState?.current_query ?? initialRAGState.current_query,
    search_history: rawState?.search_history ?? initialRAGState.search_history,
    total_chunks_in_kb: rawState?.total_chunks_in_kb ?? initialRAGState.total_chunks_in_kb,
    knowledge_base_status: rawState?.knowledge_base_status ?? initialRAGState.knowledge_base_status,
    approved_chunk_ids: rawState?.approved_chunk_ids ?? initialRAGState.approved_chunk_ids,
    awaiting_approval: rawState?.awaiting_approval ?? initialRAGState.awaiting_approval,
    search_config: {
      ...initialRAGState.search_config,
      ...rawState?.search_config,
    },
    is_searching: rawState?.is_searching ?? initialRAGState.is_searching,
    is_synthesizing: rawState?.is_synthesizing ?? initialRAGState.is_synthesizing,
    error_message: rawState?.error_message ?? initialRAGState.error_message,
  };
  const messages = agent.messages ?? [];

  // Debug logging to see state updates
  useEffect(() => {
    console.log("[useAgent] Raw state:", rawState);
    console.log("[useAgent] Merged state:", state);
    console.log("[useAgent] Chunks count:", state.retrieved_chunks?.length);
  }, [rawState]);

  // Handler for approval changes - demonstrates agent.setState()
  const handleApprovalChange = (chunkId: string, approved: boolean) => {
    const currentApproved = state.approved_chunk_ids ?? [];
    const newApproved = approved
      ? [...currentApproved, chunkId]
      : currentApproved.filter((id: string) => id !== chunkId);

    agent.setState({
      ...state,
      approved_chunk_ids: newApproved,
    });
  };

  // Handler for search config changes - demonstrates bidirectional sync
  const handleConfigChange = (newConfig: SearchConfig) => {
    agent.setState({
      ...state,
      search_config: newConfig,
    });
  };

  // Handler for reset - demonstrates agent.setMessages()
  const handleReset = () => {
    agent.setMessages([]);
    agent.setState({
      ...initialRAGState,
    });
  };

  // Select/deselect all handlers
  const handleSelectAll = () => {
    const allIds = state.retrieved_chunks.map((c: { chunk_id: string }) => c.chunk_id);
    agent.setState({
      ...state,
      approved_chunk_ids: allIds,
    });
  };

  const handleDeselectAll = () => {
    agent.setState({
      ...state,
      approved_chunk_ids: [],
    });
  };

  return (
    <main className="flex h-screen">
      {/* Left side: Chunks panel with controls */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search configuration controls */}
        <SearchControls
          config={state.search_config}
          onConfigChange={handleConfigChange}
        />

        {/* Retrieved chunks display */}
        <div className="flex-1 overflow-hidden">
          <ChunksPanel
            chunks={state.retrieved_chunks}
            approvedIds={state.approved_chunk_ids}
            isSearching={state.is_searching}
            currentQuery={state.current_query?.query}
            onApprovalChange={handleApprovalChange}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </div>

        {/* Conversation controls */}
        <ConversationControls
          onReset={handleReset}
          messageCount={messages.length}
          searchCount={state.search_history.length}
        />
      </div>

      {/* Right side: Chat sidebar */}
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "RAG Assistant",
          initial: `Welcome! Ask me anything about AI industry news.

Try: "What is OpenAI's latest funding?" or "Tell me about NVIDIA's market share"

I'll search the knowledge base and show sources on the left panel.`,
        }}
      />
    </main>
  );
}
