/**
 * ChunksPanel component - displays retrieved chunks from agent.state.
 *
 * This component demonstrates reading from agent.state to show
 * the chunks retrieved by the RAG agent, with real-time updates
 * as new chunks are retrieved.
 */

"use client";

import { useState } from "react";
import type { RetrievedChunk, SearchConfig } from "@/types/rag";
import { ChunkCard } from "./ChunkCard";
import { SettingsPopover } from "./SettingsPopover";

interface ChunksPanelProps {
  chunks: RetrievedChunk[];
  approvedIds: string[];
  isSearching: boolean;
  currentQuery?: string;
  searchConfig: SearchConfig;
  messageCount?: number;
  onApprovalChange: (chunkId: string, approved: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onConfigChange: (config: SearchConfig) => void;
  onReset: () => void;
}

export function ChunksPanel({
  chunks,
  approvedIds,
  isSearching,
  currentQuery,
  searchConfig,
  messageCount = 0,
  onApprovalChange,
  onSelectAll,
  onDeselectAll,
  onConfigChange,
  onReset,
}: ChunksPanelProps) {
  const [filter, setFilter] = useState("");

  // Filter chunks based on search text
  const filteredChunks = chunks.filter(
    (chunk) =>
      filter === "" ||
      chunk.content.toLowerCase().includes(filter.toLowerCase()) ||
      chunk.document_title.toLowerCase().includes(filter.toLowerCase())
  );

  const approvedCount = approvedIds.length;

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Compact Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-100">Retrieved Sources</h1>
            {chunks.length > 0 && (
              <span className="text-sm text-slate-400">
                {chunks.length} chunks{approvedCount > 0 ? `, ${approvedCount} approved` : ""}
              </span>
            )}
            {isSearching && (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                <span className="text-sm">Searching...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Message count and reset */}
            {messageCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                title="New Conversation"
              >
                <ResetIcon className="w-4 h-4" />
                <span>{messageCount}</span>
              </button>
            )}
            {/* Settings popover */}
            <SettingsPopover config={searchConfig} onConfigChange={onConfigChange} />
          </div>
        </div>

        {/* Current query display */}
        {currentQuery && (
          <div className="mt-3 bg-slate-700/30 p-2.5 rounded-lg">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              Current Query
            </p>
            <p className="text-sm font-medium text-slate-200">{currentQuery}</p>
          </div>
        )}
      </div>

      {/* Filter and bulk actions */}
      {chunks.length > 0 && (
        <div className="p-4 bg-slate-800/30 border-b border-slate-700/50">
          <input
            type="text"
            placeholder="Filter chunks..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={onSelectAll}
              className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={onDeselectAll}
              className="px-3 py-1.5 text-sm bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Deselect All
            </button>
            <span className="flex-1"></span>
            <span className="text-sm text-slate-500 self-center">
              {approvedCount} of {chunks.length} selected
            </span>
          </div>
        </div>
      )}

      {/* Chunks list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredChunks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            {chunks.length === 0 ? (
              <>
                <SearchIcon className="w-16 h-16 mb-4 opacity-25" />
                <p className="text-lg font-medium mb-2 text-slate-400">
                  No chunks retrieved yet
                </p>
                <p className="text-sm text-center max-w-md text-slate-500">
                  Ask the assistant to search for information and the retrieved
                  sources will appear here for your review.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2 text-slate-400">No matching chunks</p>
                <p className="text-sm text-slate-500">Try adjusting your filter</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChunks.map((chunk) => (
              <ChunkCard
                key={chunk.chunk_id}
                chunk={chunk}
                isApproved={approvedIds.includes(chunk.chunk_id)}
                onApprovalChange={(approved) =>
                  onApprovalChange(chunk.chunk_id, approved)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
