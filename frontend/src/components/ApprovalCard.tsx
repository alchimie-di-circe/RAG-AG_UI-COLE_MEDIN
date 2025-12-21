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
import { normalizeContent } from "@/utils/text";

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
    <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-xl max-w-md">
      <h3 className="font-semibold text-slate-100 mb-2">Review Sources</h3>
      <p className="text-sm text-slate-400 mb-4">
        Select which sources to use for the answer:
      </p>

      {/* Quick actions */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={selectAll}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Select all
        </button>
        <span className="text-slate-600">|</span>
        <button
          onClick={deselectAll}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Deselect all
        </button>
      </div>

      {/* Chunk list */}
      <div className="max-h-48 overflow-y-auto space-y-0 mb-4 border border-slate-700/50 rounded-lg bg-slate-900/50">
        {chunks.map((chunk) => (
          <label
            key={chunk.chunk_id}
            className="flex items-start gap-3 p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 last:border-b-0 transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.has(chunk.chunk_id)}
              onChange={() => toggleChunk(chunk.chunk_id)}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-slate-200 truncate">
                  Chunk {chunk.chunk_index}: {chunk.document_title}
                </span>
                <span className="text-xs text-blue-400 shrink-0">
                  {(chunk.similarity * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                {normalizeContent(chunk.content).substring(0, 150)}
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
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Use {selected.size} Source{selected.size !== 1 ? "s" : ""}
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          Search Again
        </button>
      </div>
    </div>
  );
}
