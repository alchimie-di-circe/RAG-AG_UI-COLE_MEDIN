/**
 * ChunkCard component - displays a single retrieved chunk.
 *
 * Features:
 * - Similarity score with color coding
 * - Expandable content view
 * - Approval checkbox for HITL workflow
 * - Document metadata display
 */

"use client";

import { useState } from "react";
import type { RetrievedChunk } from "@/types/rag";

interface ChunkCardProps {
  chunk: RetrievedChunk;
  index: number;
  isApproved: boolean;
  onApprovalChange: (approved: boolean) => void;
}

export function ChunkCard({
  chunk,
  index,
  isApproved,
  onApprovalChange,
}: ChunkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Color code based on similarity score
  const getRelevanceColor = (similarity: number) => {
    if (similarity >= 0.8) return "bg-green-100 text-green-800";
    if (similarity >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200
        ${isApproved ? "ring-2 ring-blue-500 ring-offset-2" : ""}
        ${isExpanded ? "shadow-lg" : "hover:shadow-lg"}
      `}
    >
      <div className="p-4">
        {/* Header with checkbox and metadata */}
        <div className="flex items-start gap-3 mb-3">
          <input
            type="checkbox"
            checked={isApproved}
            onChange={(e) => onApprovalChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-medium text-gray-500">
                #{index + 1}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${getRelevanceColor(chunk.similarity)}`}
              >
                {(chunk.similarity * 100).toFixed(1)}% match
              </span>
              {isApproved && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                  Approved
                </span>
              )}
            </div>
            <h3 className="font-medium text-gray-900">
              {chunk.document_title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{chunk.document_source}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronIcon expanded={isExpanded} />
          </button>
        </div>

        {/* Content preview */}
        <p className="text-sm text-gray-700 line-clamp-2 ml-7">
          {chunk.content.substring(0, 200)}
          {chunk.content.length > 200 && !isExpanded && "..."}
        </p>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t">
          <div className="mt-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Full Content
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {chunk.content}
              </p>
            </div>
          </div>

          {/* Metadata */}
          {Object.keys(chunk.metadata).length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Metadata
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                {Object.entries(chunk.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600">{key}:</span>
                    <span className="text-gray-700">
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
          <div className="mt-4 flex gap-4 text-xs text-gray-400">
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
