/**
 * ChunkCard component - displays a single retrieved chunk.
 *
 * Features:
 * - Similarity score with color coding
 * - Expandable content view
 * - Approval checkbox for HITL workflow
 * - Document metadata display
 * - Dark theme with glassmorphism
 */

"use client";

import { useState } from "react";
import type { RetrievedChunk } from "@/types/rag";
import { normalizeContent } from "@/utils/text";

interface ChunkCardProps {
  chunk: RetrievedChunk;
  isApproved: boolean;
  onApprovalChange: (approved: boolean) => void;
}

export function ChunkCard({
  chunk,
  isApproved,
  onApprovalChange,
}: ChunkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Color code based on similarity score
  const getRelevanceColor = (similarity: number) => {
    if (similarity >= 0.8) return "bg-emerald-500/20 text-emerald-400";
    if (similarity >= 0.6) return "bg-amber-500/20 text-amber-400";
    return "bg-slate-600/50 text-slate-400";
  };

  return (
    <div
      className={`
        bg-slate-800/50 backdrop-blur-sm rounded-xl border transition-all duration-200 overflow-hidden
        ${isApproved
          ? "border-blue-500/50 ring-1 ring-blue-500/30"
          : "border-slate-700/50 hover:border-slate-600/50"}
        ${isExpanded ? "shadow-lg shadow-black/20" : "hover:shadow-lg hover:shadow-black/20"}
      `}
    >
      <div className="p-4">
        {/* Header with checkbox and metadata */}
        <div className="flex items-start gap-3 mb-3">
          <input
            type="checkbox"
            checked={isApproved}
            onChange={(e) => onApprovalChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs px-2 py-1 rounded-full ${getRelevanceColor(chunk.similarity)}`}
              >
                {(chunk.similarity * 100).toFixed(1)}% match
              </span>
              {isApproved && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                  Approved
                </span>
              )}
            </div>
            <h3 className="font-medium text-slate-100">
              Chunk {chunk.chunk_index}: {chunk.document_title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{chunk.document_source}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronIcon expanded={isExpanded} />
          </button>
        </div>

        {/* Content preview */}
        <p className="text-sm text-slate-300 line-clamp-3 ml-7">
          {normalizeContent(chunk.content).substring(0, 250)}
          {chunk.content.length > 250 && !isExpanded && "..."}
        </p>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50">
          <div className="mt-4">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Full Content
            </h4>
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <p className="text-sm text-slate-300 whitespace-pre-line">
                {normalizeContent(chunk.content)}
              </p>
            </div>
          </div>

          {/* Metadata */}
          {Object.keys(chunk.metadata).length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Metadata
              </h4>
              <div className="bg-slate-900/50 p-3 rounded-lg">
                {Object.entries(chunk.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-400">{key}:</span>
                    <span className="text-slate-300">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chunk details */}
          <div className="mt-4 flex gap-4 text-xs text-slate-600">
            <span>Chunk ID: {chunk.chunk_id.slice(0, 8)}...</span>
            <span>Document ID: {chunk.document_id.slice(0, 8)}...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 transform transition-transform ${
        expanded ? "rotate-180" : ""
      }`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
