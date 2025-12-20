/**
 * SearchControls component - bidirectional search configuration.
 *
 * This component demonstrates agent.setState() for bidirectional state sync.
 * Users can adjust search parameters, and the agent respects these settings
 * when performing searches.
 */

"use client";

import type { SearchConfig } from "@/types/rag";

interface SearchControlsProps {
  config?: SearchConfig;
  onConfigChange: (config: SearchConfig) => void;
}

export function SearchControls({ config, onConfigChange }: SearchControlsProps) {
  const similarityThreshold = config?.similarity_threshold ?? 0.5;
  const maxResults = config?.max_results ?? 10;
  const searchType = config?.search_type ?? "semantic";

  const handleUpdate = (updates: Partial<SearchConfig>) => {
    onConfigChange({
      similarity_threshold: similarityThreshold,
      max_results: maxResults,
      search_type: searchType,
      ...updates,
    });
  };

  return (
    <div className="p-4 bg-white border-b">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Search Settings</h3>

      {/* Similarity Threshold */}
      <label className="block text-xs text-gray-600 mb-3">
        <div className="flex justify-between mb-1">
          <span>Minimum Similarity</span>
          <span className="font-medium">{(similarityThreshold * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={similarityThreshold * 100}
          onChange={(e) =>
            handleUpdate({
              similarity_threshold: parseInt(e.target.value) / 100,
            })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>More results</span>
          <span>Higher quality</span>
        </div>
      </label>

      {/* Max Results */}
      <label className="block text-xs text-gray-600 mb-3">
        <div className="flex justify-between mb-1">
          <span>Max Results</span>
          <span className="font-medium">{maxResults}</span>
        </div>
        <input
          type="range"
          min="5"
          max="25"
          value={maxResults}
          onChange={(e) =>
            handleUpdate({ max_results: parseInt(e.target.value) })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </label>

      {/* Search Type Toggle */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => handleUpdate({ search_type: "semantic" })}
          className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${
            searchType === "semantic"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="font-medium">Semantic</div>
          <div className="text-xs opacity-75">Meaning-based</div>
        </button>
        <button
          onClick={() => handleUpdate({ search_type: "hybrid" })}
          className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${
            searchType === "hybrid"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <div className="font-medium">Hybrid</div>
          <div className="text-xs opacity-75">Semantic + Keywords</div>
        </button>
      </div>
    </div>
  );
}
