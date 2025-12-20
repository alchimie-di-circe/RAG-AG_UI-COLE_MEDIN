/**
 * ApprovalCard component - human-in-the-loop approval UI.
 *
 * This component is rendered inside the chat via renderAndWaitForResponse.
 * It blocks the agent until the user approves sources, demonstrating
 * true human-in-the-loop control over AI behavior.
 */

"use client";

import { useState } from "react";
import type { RetrievedChunk } from "@/types/rag";

interface ApprovalCardProps {
  chunks: RetrievedChunk[];
  onApprove: (chunkIds: string[]) => void;
  onReject: () => void;
}

export function ApprovalCard({ chunks, onApprove, onReject }: ApprovalCardProps) {
  // Start with all chunks selected
  const [selected, setSelected] = useState<Set<string>>(
    new Set(chunks.map((c) => c.chunk_id))
  );

  const toggleChunk = (chunkId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(chunkId)) {
      newSelected.delete(chunkId);
    } else {
      newSelected.add(chunkId);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    setSelected(new Set(chunks.map((c) => c.chunk_id)));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm max-w-md">
      <h3 className="font-semibold text-gray-900 mb-2">Review Sources</h3>
      <p className="text-sm text-gray-600 mb-4">
        Select which sources to use for the answer:
      </p>

      {/* Quick actions */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={selectAll}
          className="text-xs text-blue-600 hover:underline"
        >
          Select all
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={deselectAll}
          className="text-xs text-blue-600 hover:underline"
        >
          Deselect all
        </button>
      </div>

      {/* Chunk list */}
      <div className="max-h-48 overflow-y-auto space-y-2 mb-4 border rounded-lg">
        {chunks.map((chunk) => (
          <label
            key={chunk.chunk_id}
            className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
          >
            <input
              type="checkbox"
              checked={selected.has(chunk.chunk_id)}
              onChange={() => toggleChunk(chunk.chunk_id)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900 truncate">
                  {chunk.document_title}
                </span>
                <span className="text-xs text-blue-600 shrink-0">
                  {(chunk.similarity * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                {chunk.content}
              </p>
            </div>
          </label>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(Array.from(selected))}
          disabled={selected.size === 0}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Use {selected.size} Source{selected.size !== 1 ? "s" : ""}
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Search Again
        </button>
      </div>
    </div>
  );
}
