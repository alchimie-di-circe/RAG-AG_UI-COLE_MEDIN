/**
 * SettingsPopover component - compact search configuration.
 *
 * This component provides a gear icon that opens a dropdown popover
 * containing search settings (similarity threshold, max results, search type).
 * Replaces the top-level SearchControls for a more compact layout.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import type { SearchConfig } from "@/types/rag";

interface SettingsPopoverProps {
  config: SearchConfig;
  onConfigChange: (config: SearchConfig) => void;
}

export function SettingsPopover({ config, onConfigChange }: SettingsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleUpdate = (updates: Partial<SearchConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Gear Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        title="Search Settings"
      >
        <GearIcon className="w-5 h-5" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl p-4 z-50">
          <h3 className="text-sm font-medium text-slate-200 mb-4">Search Settings</h3>

          {/* Similarity Threshold */}
          <label className="block text-xs text-slate-400 mb-4">
            <div className="flex justify-between mb-2">
              <span>Minimum Similarity</span>
              <span className="text-slate-200 font-medium">
                {(config.similarity_threshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.similarity_threshold * 100}
              onChange={(e) => handleUpdate({ similarity_threshold: parseInt(e.target.value) / 100 })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>More results</span>
              <span>Higher quality</span>
            </div>
          </label>

          {/* Max Results */}
          <label className="block text-xs text-slate-400 mb-4">
            <div className="flex justify-between mb-2">
              <span>Max Results</span>
              <span className="text-slate-200 font-medium">{config.max_results}</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={config.max_results}
              onChange={(e) => handleUpdate({ max_results: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </label>

          {/* Search Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdate({ search_type: "semantic" })}
              className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${
                config.search_type === "semantic"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Semantic
            </button>
            <button
              onClick={() => handleUpdate({ search_type: "hybrid" })}
              className={`flex-1 px-3 py-2 text-xs rounded-lg transition-colors ${
                config.search_type === "hybrid"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Hybrid
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
