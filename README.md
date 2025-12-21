# Human-in-the-Loop RAG Agent

A fullstack AI agent demonstrating **CopilotKit's `useAgent` hook** with **Pydantic AI** and the **AG-UI protocol** for human-in-the-loop source validation.

This project showcases how modern AI agents can maintain **bidirectional state synchronization** between a Python backend and React frontend, enabling users to control and validate AI decisions in real-time. The agent searches a knowledge base, presents sources for approval, and only synthesizes answers from user-approved content.

## Why This Matters

Traditional chatbots are black boxes. This agent is transparent: users see exactly what sources the AI found, can approve or reject them, and control search behavior through the UI. The `useAgent` hook makes this possible by treating agent state as reactive data that flows seamlessly between frontend and backend.

---

## Quick Start

### Prerequisites

- Python 3.12+ with [uv](https://docs.astral.sh/uv/) installed
- Node.js 18+
- PostgreSQL with pgvector extension
- OpenAI API key (or compatible endpoint)

### 1. Clone the Repository

```bash
git clone https://github.com/coleam00/human-in-the-loop-rag-agent.git
cd human-in-the-loop-rag-agent
```

### 2. Setup Backend

```bash
cd agent
uv sync
```

Create a `.env` file in the `agent` folder with your configuration:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/rag_db
LLM_API_KEY=sk-your-openai-key
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1
EMBEDDING_MODEL=text-embedding-3-small
```

Start the backend server:

```bash
uv run uvicorn main:api --reload --port 8000
```

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` folder:

```env
AGENT_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the App

Navigate to [http://localhost:3000](http://localhost:3000) and start asking questions about your knowledge base.

---

## Architecture

### The AG-UI Protocol

AG-UI (Agent-User Interaction) is a protocol for real-time communication between AI agents and user interfaces using Server-Sent Events (SSE):

```
Frontend (React) <-> CopilotKit <-> AG-UI Protocol <-> Pydantic AI (Python)
```

**Key Events:**
- `STATE_SNAPSHOT` - Full state sync from agent to frontend
- `STATE_DELTA` - Incremental state updates
- `TOOL_CALL_START/END` - Tool execution lifecycle
- `TEXT_MESSAGE_CONTENT` - Streaming text responses

### State Synchronization

The `RAGState` model is the contract between frontend and backend:

| Field | Direction | Purpose |
|-------|-----------|---------|
| `retrieved_chunks` | Agent -> Frontend | Search results |
| `approved_chunk_ids` | Frontend -> Agent | User approvals |
| `search_config` | Bidirectional | User preferences |
| `awaiting_approval` | Agent -> Frontend | HITL trigger |
| `is_searching` | Agent -> Frontend | Loading state |

### Human-in-the-Loop Flow

1. User asks a question
2. Agent calls `search_knowledge_base` tool
3. Tool sets `awaiting_approval = true`
4. `STATE_SNAPSHOT` event sent to frontend
5. Frontend renders approval UI (agent blocked)
6. User selects sources and clicks "Approve"
7. `respond()` unblocks agent with approved IDs
8. Agent synthesizes answer from approved sources only

---

## Codebase Structure

```
human-in-the-loop-rag-agent/
├── agent/                          # Python Backend
│   ├── main.py                     # FastAPI + CORS wrapper
│   ├── agent.py                    # Pydantic AI agent with AG-UI tools
│   ├── state.py                    # RAGState model (source of truth)
│   ├── tools.py                    # semantic_search, hybrid_search
│   ├── dependencies.py             # Database + embedding clients
│   ├── providers.py                # LLM provider configuration
│   ├── prompts.py                  # System prompts for HITL workflow
│   └── settings.py                 # Environment configuration
│
├── frontend/                       # React Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Main page with useAgent hook
│   │   │   ├── layout.tsx          # CopilotKit provider setup
│   │   │   └── api/copilotkit/     # HttpAgent bridge to backend
│   │   ├── components/
│   │   │   ├── ChunksPanel.tsx     # Displays retrieved sources
│   │   │   ├── ChunkCard.tsx       # Individual source card
│   │   │   ├── ApprovalCard.tsx    # HITL approval UI
│   │   │   └── SearchControls.tsx  # Bidirectional config sliders
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
| `agent/state.py` | The `RAGState` model - contract between frontend and backend |
| `frontend/src/app/page.tsx` | Uses `useAgent` hook for reactive state |
| `frontend/src/types/rag.ts` | TypeScript types that must match Python exactly |

---

## Testing

```bash
# Backend unit tests
cd agent && uv run pytest -v

# AG-UI protocol tests
cd frontend && npx tsx test_agui.ts

# Real knowledge base queries
cd agent && uv run python test_real_agent.py
```
