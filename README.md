# Interactive RAG Agent

**A fullstack AI agent demonstrating CopilotKit's `useAgent` hook with Pydantic AI and the AG-UI protocol for human-in-the-loop source validation.**

This project showcases how modern AI agents can maintain **bidirectional state synchronization** between a Python backend and React frontend, enabling users to control and validate AI decisions in real-time. The agent searches a knowledge base, presents sources for approval, and only synthesizes answers from user-approved content—demonstrating true human-AI collaboration.

## Why This Matters

Traditional chatbots are black boxes. This agent is transparent: users see exactly what sources the AI found, can approve or reject them, and control search behavior through the UI. The `useAgent` hook makes this possible by treating agent state as reactive data that flows seamlessly between frontend and backend.

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL with pgvector extension
- OpenAI API key (or compatible endpoint)

### 1. Clone and Setup Backend

```bash
cd agent

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:pass@localhost:5432/rag_db
LLM_API_KEY=sk-your-openai-key
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
EOF

# Install dependencies
uv sync

# Start the agent (port 8000)
uv run uvicorn main:api --reload --port 8000
```

### 2. Setup Frontend

```bash
cd frontend

# Create .env.local
echo "AGENT_URL=http://localhost:8000" > .env.local

# Install dependencies
npm install

# Start frontend (port 3000)
npm run dev
```

### 3. Open the App

Navigate to `http://localhost:3000` and start asking questions about your knowledge base.

---

## Architecture

### The AG-UI Protocol

AG-UI (Agent-User Interaction) is a protocol for real-time communication between AI agents and user interfaces. It uses Server-Sent Events (SSE) to stream structured events:

```
Frontend (React) ←→ CopilotKit ←→ AG-UI Protocol ←→ Pydantic AI (Python)
```

**Key Events:**
- `STATE_SNAPSHOT` — Full state sync from agent to frontend
- `STATE_DELTA` — Incremental state updates
- `TOOL_CALL_START/END` — Tool execution lifecycle
- `TEXT_MESSAGE_CONTENT` — Streaming text responses

### State Synchronization

The `RAGState` model is the contract between frontend and backend:

```
┌─────────────────────────────────────────────────────────────────┐
│                         RAGState                                 │
├─────────────────────────────────────────────────────────────────┤
│  retrieved_chunks    │ Agent → Frontend  │ Search results       │
│  approved_chunk_ids  │ Frontend → Agent  │ User approvals       │
│  search_config       │ Bidirectional     │ User preferences     │
│  awaiting_approval   │ Agent → Frontend  │ HITL trigger         │
│  is_searching        │ Agent → Frontend  │ Loading state        │
└─────────────────────────────────────────────────────────────────┘
```

**Python (source of truth):**
```python
class RAGState(BaseModel):
    retrieved_chunks: list[RetrievedChunk] = []
    approved_chunk_ids: list[str] = []
    search_config: SearchConfig = SearchConfig()
    awaiting_approval: bool = False
```

**TypeScript (must match exactly):**
```typescript
interface RAGState {
  retrieved_chunks: RetrievedChunk[];
  approved_chunk_ids: string[];
  search_config: SearchConfig;
  awaiting_approval: boolean;
}
```

### useAgent Hook

The `useAgent` hook from CopilotKit v2 provides reactive state access:

```typescript
const { agent } = useAgent({ agentId: "rag_agent" });

// Read state (reactive - triggers re-render)
const chunks = agent.state?.retrieved_chunks ?? [];

// Write state (flows to backend)
agent.setState({ ...state, approved_chunk_ids: [...approved, chunkId] });

// Time travel
agent.setMessages([]);  // Clear conversation
```

### Human-in-the-Loop Flow

```
1. User asks: "What is OpenAI's funding?"
              ↓
2. Agent calls search_knowledge_base tool
              ↓
3. Tool sets awaiting_approval = true
              ↓
4. STATE_SNAPSHOT event sent to frontend
              ↓
5. Frontend renders ApprovalCard (agent blocked)
              ↓
6. User selects sources and clicks "Approve"
              ↓
7. respond() unblocks agent with approved IDs
              ↓
8. Agent synthesizes answer from approved sources only
```

---

## Codebase Structure

```
interactive-rag-agent/
├── agent/                          # Python Backend
│   ├── main.py                     # FastAPI + CORS wrapper
│   ├── agent.py                    # Pydantic AI agent with AG-UI tools
│   ├── state.py                    # RAGState model (source of truth)
│   ├── tools.py                    # semantic_search, hybrid_search
│   ├── dependencies.py             # Database + embedding clients
│   ├── providers.py                # LLM provider configuration
│   ├── prompts.py                  # System prompts for HITL workflow
│   ├── settings.py                 # Environment configuration
│   └── pyproject.toml              # Python dependencies (uv)
│
├── frontend/                       # React Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Main page with useAgent hook
│   │   │   ├── layout.tsx          # CopilotKit provider setup
│   │   │   └── api/copilotkit/
│   │   │       └── route.ts        # HttpAgent bridge to backend
│   │   ├── components/
│   │   │   ├── ChunksPanel.tsx     # Displays retrieved sources
│   │   │   ├── ChunkCard.tsx       # Individual source card
│   │   │   ├── ApprovalCard.tsx    # HITL approval UI
│   │   │   ├── SearchControls.tsx  # Bidirectional config sliders
│   │   │   └── ConversationControls.tsx
│   │   └── types/
│   │       └── rag.ts              # TypeScript types (must match Python)
│   └── package.json
│
└── README.md
```

### Key Files

| File | Purpose |
|------|---------|
| `agent/agent.py` | Defines tools that return `StateSnapshotEvent` for state sync |
| `agent/state.py` | The `RAGState` model—contract between frontend and backend |
| `frontend/src/app/page.tsx` | Uses `useAgent` hook for reactive state |
| `frontend/src/types/rag.ts` | TypeScript types that must match Python exactly |

---

## How It Works

### Backend: Pydantic AI + AG-UI

1. **Agent Definition** — Uses `StateDeps[RAGState]` for type-safe state:
   ```python
   rag_agent = Agent(
       get_llm_model(),
       deps_type=StateDeps[RAGState],
   )
   ```

2. **Tools Return State Snapshots** — Every tool mutation syncs to frontend:
   ```python
   @rag_agent.tool
   async def search_knowledge_base(ctx, query):
       state = ctx.deps.state
       state.retrieved_chunks = chunks
       state.awaiting_approval = True
       return StateSnapshotEvent(snapshot=state.model_dump())
   ```

3. **AG-UI App** — Single line converts agent to protocol handler:
   ```python
   app = rag_agent.to_ag_ui(deps=StateDeps(RAGState()))
   ```

### Frontend: CopilotKit + useAgent

1. **Provider Setup** — Wraps app with CopilotKit:
   ```typescript
   <CopilotKit runtimeUrl="/api/copilotkit" agent="rag_agent">
   ```

2. **Reactive State** — `agent.state` triggers re-renders:
   ```typescript
   const { agent } = useAgent({ agentId: "rag_agent" });
   const chunks = agent.state?.retrieved_chunks ?? [];
   ```

3. **Bidirectional Updates** — Frontend changes flow to backend:
   ```typescript
   agent.setState({ ...state, search_config: newConfig });
   ```

4. **HITL Blocking** — `renderAndWaitForResponse` pauses agent:
   ```typescript
   useCopilotAction({
     name: "request_source_approval",
     renderAndWaitForResponse: ({ respond }) => (
       <ApprovalCard onApprove={(ids) => respond({ approved: true, chunk_ids: ids })} />
     ),
   });
   ```

---

## Testing

```bash
# Backend unit tests
cd agent && uv run pytest -v

# AG-UI protocol tests
cd frontend && npx tsx test_agui.ts

# Deep state sync validation
cd frontend && npx tsx test_agui_deep.ts

# Real knowledge base queries
cd agent && uv run python test_real_agent.py
```

---

## License

MIT
