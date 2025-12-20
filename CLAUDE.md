# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Interactive RAG Agent**: A fullstack AI agent demonstrating **CopilotKit v1.50+ useAgent hook** with **Pydantic AI + AG-UI protocol** for human-in-the-loop source validation. Python 3.12+ backend, Next.js 15+ frontend, PostgreSQL with pgvector.

**Purpose**: YouTube demo showcasing how `useAgent` enables bidirectional state synchronization between AI agents and React frontends in a natural RAG workflow.

## Core Principles

**KISS** (Keep It Simple, Stupid)

- Prefer simple, readable solutions over clever abstractions
- State management flows through AG-UI, not custom solutions

**YAGNI** (You Aren't Gonna Need It)

- Don't build features until needed for the demo
- Focus on useAgent demonstration, not enterprise features

**Fullstack Type Safety (CRITICAL)**

- Backend: Strict type checking with MyPy/Pyright
- Frontend: TypeScript strict mode
- **State models must match exactly** between Python and TypeScript
- Zero type suppressions allowed without justification
- State field names are the contract between frontend and backend

**AG-UI First**

- All agent-frontend communication uses AG-UI protocol
- State updates via `STATE_SNAPSHOT` and `STATE_DELTA` events
- Human-in-the-loop via `renderAndWaitForResponse`
- No custom WebSocket or polling implementations

**useAgent Hook as Primary Interface**

- `agent.state` for reading shared state (reactive)
- `agent.setState()` for bidirectional updates
- `agent.setMessages()` for conversation control
- Import from `@copilotkit/react-core/v2` (v2 subpackage!)

## Essential Commands

### Backend Development

```bash
# Navigate to backend
cd agent

# Start development server (port 8000)
uv run uvicorn main:app --reload --port 8000

# Or with FastAPI wrapper
uv run python -m main
```

### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Start development server (port 3000)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Run Both (Development)

```bash
# Terminal 1 - Backend
cd agent && uv run uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Testing

```bash
# Backend tests
cd agent && uv run pytest -v

# Frontend tests
cd frontend && npm test

# Type checking (both)
cd agent && uv run mypy . && uv run pyright .
cd frontend && npm run type-check
```

### Linting & Formatting

```bash
# Backend
cd agent
uv run ruff check .
uv run ruff format .

# Frontend
cd frontend
npm run lint
npm run format
```

### Database Setup

```bash
# Start PostgreSQL with pgvector (Docker)
docker-compose up -d postgres

# Run schema migrations
cd agent && psql $DATABASE_URL -f sql/schema.sql

# Ingest sample documents
cd agent && uv run python -m ingestion.ingest --documents documents/
```

### Validation Commands

```bash
# Full validation before commit
cd agent && uv run ruff check . && uv run mypy . && uv run pytest -v
cd frontend && npm run lint && npm run type-check && npm test

# Test AG-UI endpoint
curl -X POST http://localhost:8000 \
  -H "Accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{"messages": [], "state": {}}'

# Test CopilotKit route
curl -X POST http://localhost:3000/api/copilotkit \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

## Architecture

### Directory Structure

```
interactive-rag-agent/
├── agent/                    # Python backend (Pydantic AI + AG-UI)
│   ├── main.py              # FastAPI wrapper with CORS + AGUIApp mount
│   ├── agent.py             # Pydantic AI agent with StateDeps
│   ├── state.py             # RAGState and related Pydantic models (SOURCE OF TRUTH)
│   ├── tools.py             # Search tools with StateSnapshotEvent returns
│   ├── dependencies.py      # AgentDependencies dataclass
│   ├── settings.py          # Pydantic BaseSettings configuration
│   ├── providers.py         # LLM/embedding provider factories
│   ├── prompts.py           # System prompts for RAG workflow
│   ├── utils/
│   │   ├── db_utils.py      # asyncpg connection pool
│   │   └── models.py        # Pydantic models for search results
│   ├── ingestion/           # Document ingestion pipeline
│   │   ├── ingest.py        # Pipeline orchestrator
│   │   ├── chunker.py       # Semantic/simple chunking
│   │   └── embedder.py      # OpenAI embedding generation
│   ├── sql/
│   │   └── schema.sql       # PostgreSQL + pgvector schema
│   └── documents/           # Sample documents for demo
│
├── frontend/                 # Next.js frontend (CopilotKit + useAgent)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx   # CopilotKit provider wrapper
│   │   │   ├── page.tsx     # Main page with useAgent hook
│   │   │   └── api/copilotkit/route.ts  # HttpAgent to Python backend
│   │   ├── components/
│   │   │   ├── ChunksPanel.tsx    # Displays agent.state.retrieved_chunks
│   │   │   ├── ChunkCard.tsx      # Individual chunk with approval
│   │   │   ├── ApprovalCard.tsx   # HITL renderAndWaitForResponse component
│   │   │   ├── SearchControls.tsx # Bidirectional search config
│   │   │   └── ConversationControls.tsx  # Reset with setMessages
│   │   └── types/
│   │       └── rag.ts       # TypeScript types MATCHING agent/state.py
│   └── package.json
│
└── CLAUDE.md                # This file
```

### State Model Synchronization (CRITICAL)

**The `RAGState` model is the contract between backend and frontend.**

**Python (agent/state.py) - SOURCE OF TRUTH:**
```python
from pydantic import BaseModel, Field
from typing import List, Optional

class RAGState(BaseModel):
    retrieved_chunks: List[RetrievedChunk] = Field(default_factory=list)
    approved_chunk_ids: List[str] = Field(default_factory=list)
    search_config: SearchConfig = Field(default_factory=SearchConfig)
    awaiting_approval: bool = False
    is_searching: bool = False
    # ... all fields
```

**TypeScript (frontend/src/types/rag.ts) - MUST MATCH:**
```typescript
export interface RAGState {
  retrieved_chunks: RetrievedChunk[];
  approved_chunk_ids: string[];
  search_config: SearchConfig;
  awaiting_approval: boolean;
  is_searching: boolean;
  // ... exact same fields with matching types
}
```

**Rules:**
- Python model is source of truth
- TypeScript must mirror exactly (field names, types, defaults)
- `Optional[X]` in Python → `X | null` in TypeScript
- `List[X]` in Python → `X[]` in TypeScript
- `Dict[str, Any]` in Python → `Record<string, any>` in TypeScript
- Run `npm run type-check` after any state model changes

### AG-UI Integration Pattern

**Agent Setup (AGUIApp):**
```python
from pydantic_ai import Agent
from pydantic_ai.ui import StateDeps
from pydantic_ai.ui.ag_ui.app import AGUIApp

agent = Agent(
    'openai:gpt-4o',
    deps_type=StateDeps[RAGState],
    system_prompt=SYSTEM_PROMPT
)

# Create ASGI app - this IS the AG-UI endpoint
app = AGUIApp(agent, deps=StateDeps(RAGState()))
```

**Tool State Updates (StateSnapshotEvent):**
```python
from ag_ui.core import StateSnapshotEvent, EventType
from pydantic_ai import ToolReturn, RunContext

@agent.tool
async def search_knowledge_base(
    ctx: RunContext[StateDeps[RAGState]],
    query: str
) -> ToolReturn:
    # Update state
    ctx.deps.state.retrieved_chunks = results
    ctx.deps.state.awaiting_approval = True

    # Return with state snapshot event
    return ToolReturn(
        return_value="Found results. Please approve sources.",
        metadata=[
            StateSnapshotEvent(
                type=EventType.STATE_SNAPSHOT,
                snapshot=ctx.deps.state.model_dump()
            )
        ]
    )
```

**Frontend Connection (HttpAgent):**
```typescript
// api/copilotkit/route.ts
import { CopilotRuntime } from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";

const runtime = new CopilotRuntime({
  agents: {
    rag_agent: new HttpAgent({ url: "http://localhost:8000" }),
  },
});
```

### useAgent Hook Pattern (CRITICAL)

**Import from v2 subpackage:**
```typescript
// CORRECT
import { useAgent } from "@copilotkit/react-core/v2";

// WRONG - old API
import { useCoAgent } from "@copilotkit/react-core";
```

**Basic Usage:**
```typescript
const { agent } = useAgent<RAGState>({ agentId: "rag_agent" });

// Reading state (reactive - triggers re-render on change)
const chunks = agent.state?.retrieved_chunks || [];
const isSearching = agent.state?.is_searching || false;

// Writing state (bidirectional - flows to backend)
const handleApprove = (chunkId: string) => {
  agent.setState({
    ...agent.state,
    approved_chunk_ids: [...(agent.state?.approved_chunk_ids || []), chunkId]
  });
};

// Time travel / reset
const handleReset = () => {
  agent.setMessages([]);
  agent.setState({ ...initialState });
};
```

**Available Properties:**
- `agent.state` - Current shared state from backend
- `agent.setState(newState)` - Update state bidirectionally
- `agent.messages` - Conversation history array
- `agent.setMessages(msgs)` - Replace message history (time travel)
- `agent.sendMessage(content)` - Programmatically send user message

### Human-in-the-Loop Pattern

**renderAndWaitForResponse blocks agent until user responds:**

```typescript
useCopilotAction({
  name: "request_source_approval",
  parameters: [
    { name: "chunks", type: "object[]", required: true }
  ],
  renderAndWaitForResponse: ({ args, status, respond }) => {
    if (status === "complete") {
      return <div>Sources approved!</div>;
    }

    return (
      <ApprovalCard
        chunks={args.chunks}
        onApprove={(ids) => {
          // Update local state
          agent.setState({
            ...agent.state,
            approved_chunk_ids: ids,
            awaiting_approval: false
          });
          // Send response back to agent
          respond?.({
            approved: true,
            chunk_ids: ids
          });
        }}
        onReject={() => {
          respond?.({ approved: false });
        }}
      />
    );
  },
});
```

**Key Points:**
- Agent execution pauses at tool call
- Custom React component renders in chat
- `respond()` must be called to unblock agent
- Response value available to agent for next step

### Database

**PostgreSQL with pgvector:**
- Vector search via `match_chunks(embedding, count)` function
- Hybrid search via `hybrid_search(embedding, text, count, weight)` function
- Connection pooling with asyncpg (min=5, max=20)
- Schema in `agent/sql/schema.sql`

**Core Tables:**
- `documents` - Full documents with metadata (JSONB)
- `chunks` - Document chunks with `vector(1536)` embeddings

### Logging

**Backend (structlog):**
```python
from structlog import get_logger
logger = get_logger(__name__)

# Tool execution
logger.info("agent.tool.search_started", query=query, search_type=search_type)
logger.info("agent.tool.search_completed", result_count=len(results))

# State updates
logger.info("state.snapshot_emitted", chunk_count=len(state.retrieved_chunks))

# Errors
logger.error("agent.tool.search_failed", error=str(e), exc_info=True)
```

**Frontend (console for demo):**
```typescript
// Debug AG-UI events
console.log("[useAgent] state updated:", agent.state);
console.log("[HITL] approval received:", response);
```

**AG-UI Inspector:**
- Enable with `showDevConsole={true}` in CopilotKit provider
- Shows real-time event streaming for demo visibility

### Configuration

**Backend (.env):**
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/rag_db

# LLM
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1

# Embeddings
EMBEDDING_MODEL=text-embedding-3-small
```

**Frontend (.env.local):**
```bash
AGENT_URL=http://localhost:8000
```

## Development Guidelines

**When Creating Agent Tools**

1. Always return `ToolReturn` with `StateSnapshotEvent` metadata for state changes
2. Access state via `ctx.deps.state` (RunContext with StateDeps)
3. Write LLM-optimized docstrings explaining when/how to use tool
4. Update all relevant state fields atomically
5. Test with `TestModel` from pydantic_ai for unit tests

```python
@agent.tool
async def my_tool(
    ctx: RunContext[StateDeps[RAGState]],
    param: str
) -> ToolReturn:
    """Tool description for LLM selection.

    WHEN TO USE: Describe the scenario.
    WORKFLOW: Explain what happens next.

    Args:
        param: Description of parameter.

    Returns:
        ToolReturn with state update.
    """
    # Update state
    ctx.deps.state.some_field = new_value

    return ToolReturn(
        return_value="Human-readable result",
        metadata=[
            StateSnapshotEvent(
                type=EventType.STATE_SNAPSHOT,
                snapshot=ctx.deps.state.model_dump()
            )
        ]
    )
```

**When Creating Frontend Components**

1. Read from `agent.state` - it's reactive
2. Write with `agent.setState()` - it's bidirectional
3. Never duplicate state in local `useState` if it exists in agent.state
4. Handle null/undefined gracefully (initial state may be empty)
5. Use TypeScript types from `types/rag.ts`

```typescript
interface Props {
  // Props should reference agent state types
}

export function MyComponent() {
  const { agent } = useAgent<RAGState>({ agentId: "rag_agent" });

  // Read from shared state
  const data = agent.state?.field || defaultValue;

  // Write to shared state
  const handleChange = (value: string) => {
    agent.setState({
      ...agent.state,
      field: value
    });
  };

  return <div>{/* ... */}</div>;
}
```

**When Modifying State Models**

1. Update Python model first (`agent/state.py`)
2. Update TypeScript types (`frontend/src/types/rag.ts`)
3. Run `npm run type-check` to verify
4. Update any components using changed fields
5. Test bidirectional sync works

**Testing Patterns**

**Backend - Test service functions, not tool wrappers:**
```python
# ✅ CORRECT - test search logic directly
async def test_semantic_search():
    results = await semantic_search(deps, query="test", match_count=5)
    assert len(results) <= 5

# ❌ WRONG - RunContext setup is complex
async def test_search_tool():
    ctx = RunContext(...)  # Hard to set up correctly
    result = await search_knowledge_base(ctx, "test")
```

**Frontend - Test components with mocked agent:**
```typescript
// Mock useAgent hook
jest.mock("@copilotkit/react-core/v2", () => ({
  useAgent: () => ({
    agent: {
      state: mockState,
      setState: jest.fn(),
      // ...
    }
  })
}));
```

**API Patterns**

- **AG-UI Endpoint**: `POST /` (root) - handled by AGUIApp
- **Health Check**: `GET /health` - for load balancers
- **CopilotKit Route**: `POST /api/copilotkit` - Next.js API route

**CORS Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Common Gotchas**

1. **Import paths changed**: Use `pydantic_ai.ui.ag_ui.app.AGUIApp`, not `agent.to_ag_ui()`
2. **useAgent from v2**: `import { useAgent } from "@copilotkit/react-core/v2"`
3. **StateDeps import**: `from pydantic_ai.ui import StateDeps`
4. **State must be serializable**: No complex objects, only JSON-compatible types
5. **Accept header for SSE**: AG-UI endpoint needs `Accept: text/event-stream`
6. **Null safety**: Always use optional chaining (`agent.state?.field`)

**Demo Preparation Checklist**

- [ ] AG-UI Inspector visible (`showDevConsole={true}`)
- [ ] Sample documents ingested
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Database has pgvector extension
- [ ] All chunks have embeddings
- [ ] CORS configured for localhost:3000
