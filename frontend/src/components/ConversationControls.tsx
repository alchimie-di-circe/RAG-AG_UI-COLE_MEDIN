/**
 * ConversationControls component - time travel with setMessages.
 *
 * This component demonstrates agent.setMessages() for conversation reset
 * and time travel capabilities.
 */

"use client";

interface ConversationControlsProps {
  onReset: () => void;
  messageCount?: number;
  searchCount?: number;
}

export function ConversationControls({
  onReset,
  messageCount = 0,
  searchCount = 0,
}: ConversationControlsProps) {
  return (
    <div className="p-4 bg-white border-t flex items-center justify-between">
      <div className="text-sm text-gray-500">
        <span>
          {messageCount} message{messageCount !== 1 ? "s" : ""}
        </span>
        {searchCount > 0 && (
          <span className="ml-2">
            | {searchCount} search{searchCount !== 1 ? "es" : ""}
          </span>
        )}
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
      >
        <svg
          className="w-4 h-4"
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
        New Conversation
      </button>
    </div>
  );
}
