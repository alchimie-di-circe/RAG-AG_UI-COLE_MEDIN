# Feature: Frontend Dark Theme & Layout Overhaul

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Complete overhaul of the Interactive RAG Agent frontend to implement a beautiful dark theme with glassmorphism effects, restructure the layout for better space utilization, and improve chunk display formatting. The goal is to transform the current plain white/blue design into a modern, professional dark interface with depth and visual polish suitable for a YouTube demo.

## User Story

As a **developer viewing the YouTube demo**
I want to **see a polished, modern dark-themed interface with glassmorphism effects**
So that **the application looks professional and the UI showcases best practices for AI agent interfaces**

## Problem Statement

Current UI issues:
1. Plain white/ugly blue color scheme - looks unprofessional
2. SearchControls spans full width at top - wastes vertical space
3. Chunks only fill ~40% of available screen height
4. Chat sidebar requires clicking to open - should be always visible
5. Multiple chunks with same title look like duplicates
6. Chunk content has excessive whitespace between lines

## Solution Statement

1. Implement dark theme with CSS variables and glassmorphism utility classes
2. Move SearchControls into a compact settings popover triggered by gear icon
3. Restructure layout to maximize chunk viewing area
4. Replace CopilotSidebar with CopilotChat for always-visible chat
5. Prefix chunk titles with "Chunk N:" to differentiate same-titled chunks
6. Create whitespace normalization utility for chunk content

## Feature Metadata

**Feature Type**: Enhancement (Visual Overhaul)
**Estimated Complexity**: Medium-High
**Primary Systems Affected**:
- `frontend/src/app/globals.css` - Theme variables
- `frontend/src/app/page.tsx` - Layout structure
- `frontend/src/components/*` - All UI components
**Dependencies**:
- `@copilotkit/react-ui` - CopilotChat component
- Tailwind CSS 4 - backdrop-blur, opacity utilities

---

## CONTEXT REFERENCES

### Relevant Codebase Files - MUST READ BEFORE IMPLEMENTING

**Theme & Styling:**
- `frontend/src/app/globals.css` (entire file) - Current theme variables, scrollbar styling
- `frontend/postcss.config.mjs` - PostCSS/Tailwind configuration

**Layout & Main Page:**
- `frontend/src/app/page.tsx` (entire file) - Main layout structure, useAgent integration
- `frontend/src/app/layout.tsx` (entire file) - CopilotKit provider, root layout

**Components to Modify:**
- `frontend/src/components/ChunksPanel.tsx` (entire file) - Blue header, filter, chunk list container
- `frontend/src/components/ChunkCard.tsx` (entire file) - Individual chunk display, whitespace handling
- `frontend/src/components/SearchControls.tsx` (entire file) - Will become SettingsPopover
- `frontend/src/components/ConversationControls.tsx` (entire file) - Footer controls
- `frontend/src/components/ApprovalCard.tsx` (entire file) - HITL approval UI in chat

**Types:**
- `frontend/src/types/rag.ts` - RetrievedChunk interface (for chunk display)

### New Files to Create

- `frontend/src/components/SettingsPopover.tsx` - Compact settings dropdown with sliders
- `frontend/src/utils/text.ts` - Text normalization utilities

### Relevant Documentation

- [CopilotChat Component](https://docs.copilotkit.ai/reference/components/chat/CopilotChat)
  - Standalone chat without sidebar wrapper
  - Why: Replacing CopilotSidebar for always-visible chat

- [CopilotKit CSS Variables](https://docs.copilotkit.ai/guides/custom-look-and-feel/customize-built-in-ui-components)
  - CSS custom properties for theming
  - Why: Dark theme integration with CopilotKit components

### Patterns to Follow

**CopilotKit Dark Theme CSS Variables:**
```css
/* Apply to root or parent element */
--copilot-kit-primary-color: rgb(255, 255, 255);
--copilot-kit-contrast-color: rgb(28, 28, 28);
--copilot-kit-background-color: rgb(17, 17, 17);
--copilot-kit-secondary-color: rgb(28, 28, 28);
--copilot-kit-input-background-color: #2c2c2c;
--copilot-kit-secondary-contrast-color: rgb(255, 255, 255);
--copilot-kit-separator-color: rgb(45, 45, 45);
--copilot-kit-muted-color: rgb(45, 45, 45);
```

**Glassmorphism Pattern:**
```tsx
className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl"
```

**Dark Card Pattern:**
```tsx
className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg"
```

**CopilotChat Usage (replacing CopilotSidebar):**
```tsx
import { CopilotChat } from "@copilotkit/react-ui";

<div className="w-[400px] flex-shrink-0 border-l border-slate-700">
  <CopilotChat
    labels={{
      title: "RAG Assistant",
      initial: "Welcome message..."
    }}
    className="h-full"
  />
</div>
```

---

## IMPLEMENTATION PLAN

### Phase 1: Theme Foundation

Set up dark theme CSS variables and glassmorphism utilities in globals.css.

**Tasks:**
- Update CSS custom properties for dark color palette
- Add CopilotKit dark theme variables
- Create glassmorphism utility classes
- Update scrollbar styling for dark theme

### Phase 2: Layout Restructure

Restructure page.tsx layout to maximize chunk space and integrate chat.

**Tasks:**
- Replace CopilotSidebar with CopilotChat in fixed-width container
- Remove SearchControls from top-level layout
- Create compact header with integrated settings popover
- Streamline or remove ConversationControls

### Phase 3: Settings Popover

Transform SearchControls into a compact popover component.

**Tasks:**
- Create SettingsPopover component with gear icon trigger
- Move sliders and search type toggle into popover
- Add popover positioning and click-outside-to-close

### Phase 4: Component Dark Theme Updates

Update all components with dark theme styling.

**Tasks:**
- Update ChunksPanel with dark theme classes
- Update ChunkCard with dark theme and glassmorphism
- Update ApprovalCard for dark chat context
- Update ConversationControls (if retained)

### Phase 5: Chunk Display Improvements

Fix chunk numbering and whitespace issues.

**Tasks:**
- Create text normalization utility
- Update ChunkCard to show "Chunk N: Title" format
- Apply whitespace normalization to content display
- Update ApprovalCard with same improvements

---

## STEP-BY-STEP TASKS

### Phase 1: Theme Foundation

#### Task 1.1: UPDATE globals.css - Dark Theme Variables

- **IMPLEMENT**: Replace light theme variables with dark palette, add CopilotKit variables, glassmorphism utilities
- **PATTERN**: Use slate color scale for professional dark look
- **VALIDATE**: `npm run dev` - page should have dark background

```css
/* Replace entire globals.css content */
@import "tailwindcss";

:root {
  /* Dark Theme Base Colors */
  --background: #0f172a;        /* slate-900 */
  --foreground: #e2e8f0;        /* slate-200 */
  --card: #1e293b;              /* slate-800 */
  --card-foreground: #f1f5f9;   /* slate-100 */
  --muted: #334155;             /* slate-700 */
  --muted-foreground: #94a3b8;  /* slate-400 */
  --accent: #3b82f6;            /* blue-500 */
  --accent-muted: #1e40af;      /* blue-800 */
  --border: #334155;            /* slate-700 */

  /* CopilotKit Dark Theme Variables */
  --copilot-kit-primary-color: #3b82f6;
  --copilot-kit-contrast-color: #ffffff;
  --copilot-kit-background-color: #1e293b;
  --copilot-kit-secondary-color: #0f172a;
  --copilot-kit-input-background-color: #334155;
  --copilot-kit-secondary-contrast-color: #e2e8f0;
  --copilot-kit-separator-color: #475569;
  --copilot-kit-muted-color: #64748b;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
}

/* Dark scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

### Phase 2: Layout Restructure

#### Task 2.1: UPDATE page.tsx - Replace CopilotSidebar with CopilotChat

- **IMPLEMENT**: Replace `CopilotSidebar` import and usage with `CopilotChat` in fixed container
- **IMPORTS**: `import { CopilotChat } from "@copilotkit/react-ui";`
- **PATTERN**: CopilotChat in a flex-shrink-0 container with fixed width
- **GOTCHA**: CopilotChat doesn't wrap children - it's a standalone component
- **VALIDATE**: `npm run dev` - chat should be visible on right side, no toggle button

**Key changes to page.tsx:**
```tsx
// Change import
import { CopilotChat } from "@copilotkit/react-ui";

// In the return statement, replace CopilotSidebar with:
<div className="w-[420px] flex-shrink-0 border-l border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
  <CopilotChat
    labels={{
      title: "RAG Assistant",
      initial: `Welcome! Ask me anything about AI industry news.

Try: "What is OpenAI's latest funding?" or "Tell me about NVIDIA's market share"

I'll search the knowledge base and show sources for your review.`,
    }}
    className="h-full"
  />
</div>
```

#### Task 2.2: UPDATE page.tsx - Remove Top-Level SearchControls

- **IMPLEMENT**: Remove `<SearchControls>` from the layout, integrate settings into ChunksPanel header
- **PATTERN**: Settings will be accessed via gear icon popover in ChunksPanel
- **VALIDATE**: No sliders at top of page

#### Task 2.3: UPDATE page.tsx - Streamline Layout Structure

- **IMPLEMENT**: Simplify flex layout for maximum chunk space
- **PATTERN**: Remove ConversationControls or make it minimal (just reset button in header)
- **VALIDATE**: Chunks panel fills most of left side

**Final page.tsx layout structure:**
```tsx
<main className="flex h-screen bg-slate-900">
  {/* Left side: Chunks panel (takes remaining space) */}
  <div className="flex-1 flex flex-col overflow-hidden">
    <ChunksPanel
      chunks={state.retrieved_chunks}
      approvedIds={state.approved_chunk_ids}
      isSearching={state.is_searching}
      currentQuery={state.current_query?.query}
      searchConfig={state.search_config}
      messageCount={messages.length}
      onApprovalChange={handleApprovalChange}
      onSelectAll={handleSelectAll}
      onDeselectAll={handleDeselectAll}
      onConfigChange={handleConfigChange}
      onReset={handleReset}
    />
  </div>

  {/* Right side: Chat (fixed width) */}
  <div className="w-[420px] flex-shrink-0 border-l border-slate-700/50">
    <CopilotChat ... />
  </div>
</main>
```

---

### Phase 3: Settings Popover

#### Task 3.1: CREATE SettingsPopover.tsx

- **IMPLEMENT**: New component with gear icon button and dropdown popover containing search settings
- **PATTERN**: Use React state for open/close, position absolute below trigger
- **IMPORTS**: React useState, SearchConfig type
- **VALIDATE**: Clicking gear opens popover, clicking outside closes it

```tsx
// frontend/src/components/SettingsPopover.tsx
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
```

---

### Phase 4: Component Dark Theme Updates

#### Task 4.1: UPDATE ChunksPanel.tsx - Dark Theme & Compact Header

- **IMPLEMENT**: Replace all light theme classes, integrate SettingsPopover, compact header design
- **PATTERN**: Use slate color scale, glassmorphism for header
- **IMPORTS**: Add SettingsPopover, SearchConfig type
- **GOTCHA**: Props need to include searchConfig and onConfigChange now
- **VALIDATE**: Dark background, compact header with gear icon

**Key styling changes:**
- Header: `bg-slate-800/50 backdrop-blur-sm` instead of `bg-blue-600`
- Background: `bg-slate-900` instead of `bg-gray-50`
- Filter input: `bg-slate-800 border-slate-700 text-slate-200`
- Buttons: `bg-slate-700/50 hover:bg-slate-700 text-slate-300`

**Updated interface:**
```tsx
interface ChunksPanelProps {
  chunks: RetrievedChunk[];
  approvedIds: string[];
  isSearching: boolean;
  currentQuery?: string;
  searchConfig: SearchConfig;      // NEW
  messageCount?: number;           // NEW (from ConversationControls)
  onApprovalChange: (chunkId: string, approved: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onConfigChange: (config: SearchConfig) => void;  // NEW
  onReset: () => void;             // NEW (from ConversationControls)
}
```

#### Task 4.2: UPDATE ChunkCard.tsx - Dark Theme & Chunk Numbering

- **IMPLEMENT**: Dark theme styling, combine index with title, normalize whitespace
- **PATTERN**: `bg-slate-800/50 backdrop-blur-sm border-slate-700/50`
- **IMPORTS**: Add normalizeContent utility (after creating it)
- **VALIDATE**: Cards have dark glass effect, titles show "Chunk N: Title"

**Title change (line ~71):**
```tsx
// Before
<h3 className="font-medium text-gray-900">
  {chunk.document_title}
</h3>

// After
<h3 className="font-medium text-slate-100">
  Chunk {index + 1}: {chunk.document_title}
</h3>
```

**Remove the separate index display (line ~57-59).**

**Relevance color update:**
```tsx
const getRelevanceColor = (similarity: number) => {
  if (similarity >= 0.8) return "bg-emerald-500/20 text-emerald-400";
  if (similarity >= 0.6) return "bg-amber-500/20 text-amber-400";
  return "bg-slate-600/50 text-slate-400";
};
```

**Card container styling:**
```tsx
className={`
  bg-slate-800/50 backdrop-blur-sm rounded-xl border transition-all duration-200
  ${isApproved
    ? "border-blue-500/50 ring-1 ring-blue-500/30"
    : "border-slate-700/50 hover:border-slate-600/50"}
  ${isExpanded ? "shadow-lg shadow-black/20" : "hover:shadow-lg hover:shadow-black/20"}
`}
```

#### Task 4.3: UPDATE ApprovalCard.tsx - Dark Theme

- **IMPLEMENT**: Dark theme styling for the HITL approval UI in chat
- **PATTERN**: Glass card on dark background
- **VALIDATE**: Approval card in chat matches dark theme

**Key changes:**
```tsx
// Container
className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-xl max-w-md"

// Text colors
className="font-semibold text-slate-100 mb-2"  // h3
className="text-sm text-slate-400 mb-4"        // description

// Chunk labels
className="flex items-start gap-3 p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 last:border-b-0"

// Buttons
className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
```

#### Task 4.4: DELETE SearchControls.tsx (optional) or keep for reference

- **IMPLEMENT**: Can delete since functionality moved to SettingsPopover
- **VALIDATE**: No import errors

#### Task 4.5: DELETE ConversationControls.tsx (optional) or keep for reference

- **IMPLEMENT**: Functionality merged into ChunksPanel header
- **VALIDATE**: No import errors

---

### Phase 5: Chunk Display Improvements

#### Task 5.1: CREATE utils/text.ts - Whitespace Normalization

- **IMPLEMENT**: Utility function to normalize chunk content whitespace
- **VALIDATE**: `npm run type-check` passes

```tsx
// frontend/src/utils/text.ts

/**
 * Normalize whitespace in text content.
 * - Trims leading/trailing whitespace
 * - Collapses multiple blank lines to single blank line
 * - Trims each line individually
 * - Collapses multiple spaces to single space
 */
export function normalizeContent(content: string): string {
  return content
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')  // Collapse 3+ newlines to 2
    .replace(/[ \t]+/g, ' ')     // Collapse multiple spaces
    .trim();
}
```

#### Task 5.2: UPDATE ChunkCard.tsx - Apply Whitespace Normalization

- **IMPLEMENT**: Import and use normalizeContent for content display
- **IMPORTS**: `import { normalizeContent } from "@/utils/text";`
- **VALIDATE**: Chunk content displays without excessive spacing

**Apply in preview (line ~85):**
```tsx
<p className="text-sm text-slate-300 line-clamp-3">
  {normalizeContent(chunk.content).substring(0, 250)}
  {chunk.content.length > 250 && !isExpanded && "..."}
</p>
```

**Apply in expanded view (line ~99):**
```tsx
<p className="text-sm text-slate-300 whitespace-pre-line">
  {normalizeContent(chunk.content)}
</p>
```

Note: Changed from `whitespace-pre-wrap` to `whitespace-pre-line` to better handle normalized content.

#### Task 5.3: UPDATE ApprovalCard.tsx - Apply Chunk Numbering and Normalization

- **IMPLEMENT**: Show chunk numbers in approval list, normalize content preview
- **IMPORTS**: `import { normalizeContent } from "@/utils/text";`
- **GOTCHA**: ApprovalCard receives chunks array but may not have index - use array index from map
- **VALIDATE**: Approval card shows "Chunk 1:", "Chunk 2:", etc.

**Update chunk list (around line 70-95):**
```tsx
{chunks.map((chunk, index) => (
  <label
    key={chunk.chunk_id}
    className="flex items-start gap-3 p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 last:border-b-0"
  >
    <input ... />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-slate-200 truncate">
          Chunk {index + 1}: {chunk.document_title}
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
```

---

## TESTING STRATEGY

### Visual Testing (Primary)

Since this is a visual overhaul, primary testing is visual verification:

1. **Dark Theme Applied**: All backgrounds are dark slate colors
2. **Glassmorphism Effects**: Backdrop blur visible on cards and panels
3. **Chat Always Visible**: No toggle button, chat panel fixed on right
4. **Settings Popover**: Gear icon opens dropdown with sliders
5. **Chunk Display**: Shows "Chunk N: Title" format, no excessive whitespace
6. **Responsive**: Layout works at various window sizes

### Unit Tests

No new unit tests required for visual changes. Existing functionality preserved.

### Type Checking

```bash
cd frontend && npm run type-check
```

Must pass with 0 errors - verifies all component props and imports are correct.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
cd frontend

# TypeScript type checking (must pass)
npm run type-check

# ESLint (should pass with 0 errors)
npm run lint
```

**Expected**: All commands pass with exit code 0

### Level 2: Build Verification

```bash
cd frontend

# Development build
npm run build
```

**Expected**: Build succeeds without errors

### Level 3: Visual Verification

```bash
# Start frontend (in frontend directory)
npm run dev

# In another terminal, start backend (in agent directory)
cd ../agent && uv run uvicorn main:api --reload --port 8000
```

**Manual checks at http://localhost:3000:**
- [ ] Page has dark background (slate-900)
- [ ] Chat panel visible on right side (no toggle button)
- [ ] Gear icon visible in header area
- [ ] Clicking gear opens settings popover
- [ ] Sliders work in popover
- [ ] Search type toggle works
- [ ] Ask a question - chunks appear with "Chunk N: Title" format
- [ ] Chunk content has no excessive whitespace
- [ ] Chunk cards have glassmorphism effect (subtle backdrop blur)
- [ ] Approval card in chat has dark styling
- [ ] Scrollbar is dark themed

---

## ACCEPTANCE CRITERIA

- [ ] Dark theme applied to all components (no white backgrounds)
- [ ] CopilotChat replaces CopilotSidebar (always visible, no toggle)
- [ ] Settings popover works (gear icon → dropdown with sliders)
- [ ] Chunks fill majority of left panel (no wasted space)
- [ ] Chunk titles show "Chunk N: Title" format
- [ ] Chunk content whitespace is normalized
- [ ] Glassmorphism effects on cards (backdrop-blur)
- [ ] All validation commands pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Build succeeds

---

## COMPLETION CHECKLIST

- [ ] Phase 1: Theme Foundation
  - [ ] globals.css updated with dark variables
  - [ ] CopilotKit CSS variables added
  - [ ] Scrollbar styling updated
- [ ] Phase 2: Layout Restructure
  - [ ] page.tsx uses CopilotChat instead of CopilotSidebar
  - [ ] SearchControls removed from top
  - [ ] Layout maximizes chunk space
- [ ] Phase 3: Settings Popover
  - [ ] SettingsPopover.tsx created
  - [ ] Gear icon triggers popover
  - [ ] Click outside closes popover
- [ ] Phase 4: Component Updates
  - [ ] ChunksPanel.tsx dark theme
  - [ ] ChunkCard.tsx dark theme + numbered titles
  - [ ] ApprovalCard.tsx dark theme
- [ ] Phase 5: Chunk Display
  - [ ] utils/text.ts created with normalizeContent
  - [ ] ChunkCard uses normalized content
  - [ ] ApprovalCard uses normalized content
- [ ] All validation commands pass
- [ ] Visual verification complete

---

## NOTES

### Design Decisions

1. **Slate color scale over gray**: Slate has a subtle blue undertone that complements the blue accent color and creates a more professional look.

2. **CopilotChat over CopilotSidebar**: CopilotChat is a standalone component that gives us full layout control. No toggle button, no sidebar animation - just a fixed chat panel.

3. **Settings popover over collapsible panel**: A popover triggered by gear icon has minimal footprint while keeping settings easily accessible. It's a common pattern in modern apps.

4. **Backdrop-blur for glassmorphism**: Using Tailwind's `backdrop-blur-sm` and `backdrop-blur-md` with semi-transparent backgrounds creates depth without heavy performance impact.

5. **"Chunk N: Title" format**: Combining the index with title in a single heading makes it immediately clear these are different chunks even when titles are identical.

6. **Whitespace normalization at display time**: Processing content in the frontend (not backend) keeps the original data intact while improving display. Using `whitespace-pre-line` allows intentional line breaks while collapsing excessive spacing.

### Color Palette Reference

| Purpose | Light Value | Dark Value | Tailwind Class |
|---------|------------|------------|----------------|
| Background | #f9fafb | #0f172a | bg-slate-900 |
| Card | #ffffff | #1e293b | bg-slate-800 |
| Muted | #f1f5f9 | #334155 | bg-slate-700 |
| Border | #e5e7eb | #334155 | border-slate-700 |
| Text Primary | #171717 | #e2e8f0 | text-slate-200 |
| Text Muted | #6b7280 | #94a3b8 | text-slate-400 |
| Accent | #3b82f6 | #3b82f6 | text-blue-500 |

### Verified Assumptions (High Confidence)

All critical assumptions have been verified in the installed packages:

1. **CopilotChat export confirmed**: `node_modules/@copilotkit/react-ui/dist/index.d.ts` line 4:
   ```typescript
   export { CopilotChat } from './components/chat/Chat.js';
   ```

2. **CopilotChat accepts className prop**: `Chat.tsx` line 300 confirms `className?: string`

3. **CSS variables confirmed**: `node_modules/@copilotkit/react-ui/src/css/colors.css` contains all `--copilot-kit-*` variables

4. **Dark mode trigger confirmed**: CopilotKit supports `.dark` class, `[data-theme="dark"]`, or direct CSS variable override (we use direct override)

5. **CSS import order is correct**: In `layout.tsx`, `globals.css` is imported AFTER `@copilotkit/react-ui/styles.css`, so our `:root` variables will override CopilotKit defaults

6. **Tailwind 4 backdrop-blur confirmed**: Classes `backdrop-blur-sm`, `backdrop-blur-md`, `backdrop-blur-lg` are available (4px, 12px, 16px respectively)

### Remaining Considerations

1. **Popover z-index**: Ensure popover has high enough z-index (50+) to appear above other elements.

2. **Chat height**: CopilotChat needs explicit height. Using `h-full` requires parent to have defined height (our layout provides this via `h-screen`).
