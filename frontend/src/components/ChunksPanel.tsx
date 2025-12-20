/**
 * ChunksPanel component - displays retrieved chunks from agent.state.
 *
 * This component demonstrates reading from agent.state to show
 * the chunks retrieved by the RAG agent, with real-time updates
 * as new chunks are retrieved.
 */

"use client";

import { useState } from "react";
import type { RetrievedChunk } from "@/types/rag";
import { ChunkCard } from "./ChunkCard";

interface ChunksPanelProps {
  chunks: RetrievedChunk[];
  approvedIds: string[];
  isSearching: boolean;
  currentQuery?: string;
  onApprovalChange: (chunkId: string, approved: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function ChunksPanel({
  chunks,
  approvedIds,
  isSearching,
  currentQuery,
  onApprovalChange,
  onSelectAll,
  onDeselectAll,
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Retrieved Sources</h1>
        <div className="flex items-center justify-between">
          <p className="text-sm opacity-90">
            {chunks.length > 0
              ? `${chunks.length} chunks found${approvedCount > 0 ? `, ${approvedCount} approved` : ""}`
              : "No chunks retrieved yet"}
          </p>
          {isSearching && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span className="text-sm">Searching...</span>
            </div>
          )}
        </div>

        {/* Current query display */}
        {currentQuery && (
          <div className="mt-4 bg-white/10 p-3 rounded-lg">
            <p className="text-xs uppercase tracking-wide opacity-75 mb-1">
              Current Query
            </p>
            <p className="font-medium">{currentQuery}</p>
          </div>
        )}
      </div>

      {/* Filter and bulk actions */}
      {chunks.length > 0 && (
        <div className="p-4 bg-white border-b">
          <input
            type="text"
            placeholder="Filter chunks..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={onSelectAll}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={onDeselectAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Deselect All
            </button>
            <span className="flex-1"></span>
            <span className="text-sm text-gray-500 self-center">
              {approvedCount} of {chunks.length} selected
            </span>
          </div>
        </div>
      )}

      {/* Chunks list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredChunks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {chunks.length === 0 ? (
              <>
                <SearchIcon className="w-16 h-16 mb-4 opacity-25" />
                <p className="text-lg font-medium mb-2">
                  No chunks retrieved yet
                </p>
                <p className="text-sm text-center max-w-md">
                  Ask the assistant to search for information and the retrieved
                  sources will appear here for your review.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">No matching chunks</p>
                <p className="text-sm">Try adjusting your filter</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChunks.map((chunk, index) => (
              <ChunkCard
                key={chunk.chunk_id}
                chunk={chunk}
                index={index}
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
