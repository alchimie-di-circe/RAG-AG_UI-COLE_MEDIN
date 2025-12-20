# Feature: Interactive RAG Agent with useAgent Hook Demonstration

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types and models. Import from the right files etc.

## Feature Description

Build an **Interactive RAG (Retrieval-Augmented Generation) Agent** that naturally demonstrates the full power of CopilotKit's `useAgent` hook (v1.50+) through a human-in-the-loop source validation workflow. The agent searches a knowledge base, displays retrieved chunks to users for review, allows users to approve/reject/edit sources in real-time, and synthesizes answers only from approved sources.

**This is not just a RAG agent** - it's a demonstration of how `useAgent` enables seamless bidirectional state synchronization between AI agents and frontend applications. Every feature showcases a specific `useAgent` capability in a natural, non-forced way.

## User Story

As a **developer learning CopilotKit**
I want to **see how useAgent enables real-time state synchronization between a Python agent and React frontend**
So that **I understand how to build interactive agentic experiences where users can control and collaborate with AI agents**

## Problem Statement

Traditional RAG systems are "black boxes" - users ask questions and receive answers without visibility into the retrieval process. They cannot:
- See which sources the AI is using
- Approve or reject irrelevant sources before synthesis
- Refine search parameters in real-time
- Understand why the AI chose certain information

The `useAgent` hook solves this by enabling **bidirectional state synchronization** - but most demos don't show its full power.

## Solution Statement

Create a RAG agent where:
1. **Retrieved chunks appear in the UI automatically** (demonstrates `agent.state` reading)
2. **Users approve/reject sources** (demonstrates `agent.setState()` writing)
3. **Agent waits for approval** (demonstrates `renderAndWaitForResponse` human-in-the-loop)
4. **Users can reset conversations** (demonstrates `agent.setMessages()` time travel)
5. **Search parameters are controllable** (demonstrates bidirectional state updates)
6. **Real-time streaming visible** (demonstrates AG-UI protocol events)

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**:
- Backend: Pydantic AI agent with AG-UI integration
- Frontend: Next.js with CopilotKit useAgent hook
- Database: PostgreSQL with pgvector
**Dependencies**:
- pydantic-ai-slim[ag-ui] >= 1.30.0
- @copilotkit/react-core >= 1.50.0
- @copilotkit/react-ui >= 1.50.0
- @copilotkit/runtime >= 1.50.0
- @ag-ui/client >= 0.0.41

---

## NATURAL useAgent DEMONSTRATIONS

### Core Philosophy: Every Feature Showcases useAgent Naturally

| useAgent Capability | Natural RAG Feature | Why It's Natural |
|---------------------|---------------------|------------------|
| `agent.state` | View retrieved chunks | Of course you'd want to see what sources the AI found |
| `agent.setState()` | Approve/reject chunks | Of course you'd want to control which sources are used |
| `renderAndWaitForResponse` | Approval blocking | Of course the AI should wait before using unapproved sources |
| `agent.setMessages()` | Reset/new conversation | Of course you'd want to start fresh sometimes |
| `STATE_SNAPSHOT` events | Real-time chunk display | Of course you'd want to see results as they're found |
| `STATE_DELTA` events | Incremental updates | Of course you'd want efficient updates for large result sets |
| Bidirectional sync | Search refinement controls | Of course you'd want to adjust search parameters |

### Feature Breakdown by useAgent Capability

#### 1. `agent.state` - Reading Shared State
**Natural Demo**: Chunks Panel that automatically updates when agent retrieves documents
- Chunk cards with similarity scores, source info, content preview
- Status indicators (searching, ready, error)
- Total chunk count from knowledge base
- Current search query display

#### 2. `agent.setState()` - Writing to Shared State
**Natural Demo**: Interactive source approval workflow
- Checkbox to approve/reject each chunk
- "Select All" / "Deselect All" buttons
- Remove irrelevant chunks entirely
- Edit chunk content before synthesis (advanced)

#### 3. `renderAndWaitForResponse` - Human-in-the-Loop
**Natural Demo**: Agent pauses for approval before synthesizing
- Agent retrieves chunks, displays them
- Custom React component renders in chat with approval UI
- Agent is blocked until user clicks "Use Selected Sources" or "Search Again"
- Response sent back to agent includes approved chunk IDs

#### 4. `agent.setMessages()` - Time Travel
**Natural Demo**: Conversation controls
- "New Conversation" button resets messages
- "Retry Last Search" replays from previous point
- Could show message history panel

#### 5. `STATE_SNAPSHOT` / `STATE_DELTA` Events
**Natural Demo**: Efficient state updates
- Full snapshot sent after initial retrieval
- Delta updates when user toggles individual chunk approval
- Real-time UI updates without full re-renders

#### 6. Bidirectional State Sync
**Natural Demo**: Search configuration panel
- Similarity threshold slider (user sets → agent respects)
- Max results control
- Search type toggle (semantic vs hybrid)
- Agent sees user preferences in state, adjusts behavior

---

## CONTEXT REFERENCES

### Relevant Codebase Files - MUST READ BEFORE IMPLEMENTING

**Backend Agent Patterns:**
- `.claude/examples/pydantic_ai_rag_agent/agent.py` (entire file) - Why: Core agent structure, StateDeps pattern, tool definitions, StateSnapshotEvent usage
- `.claude/examples/pydantic_ai_rag_agent/tools.py` (entire file) - Why: Search tool implementations, SearchResult model
- `.claude/examples/pydantic_ai_rag_agent/dependencies.py` (entire file) - Why: Dependency injection pattern, database/embedding client setup

**Frontend Patterns:**
- `.claude/examples/basic_rag_frontend/page.tsx` (entire file) - Why: useCoAgent pattern (to be updated to useAgent), chunk rendering, action definitions
- `.claude/examples/basic_rag_frontend/api/copilotkit/route.ts` (entire file) - Why: CopilotRuntime setup, HttpAgent connection
- `.claude/examples/basic_rag_frontend/layout.tsx` (entire file) - Why: CopilotKit provider setup

**Database/Infrastructure:**
- `.claude/examples/pydantic_ai_rag_agent/sql/schema.sql` (entire file) - Why: PostgreSQL schema, vector search functions
- `.claude/examples/pydantic_ai_rag_agent/settings.py` (entire file) - Why: Configuration pattern
- `.claude/examples/pydantic_ai_rag_agent/ingestion/` (all files) - Why: Document ingestion pipeline

### New Files to Create

**Backend (Python):**
```
agent/
├── __init__.py
├── main.py                    # FastAPI app with AGUIApp
├── agent.py                   # Pydantic AI agent with tools
├── state.py                   # RAGState and related models
├── tools.py                   # Search tools (adapted from example)
├── dependencies.py            # Agent dependencies
├── prompts.py                 # System prompts
├── settings.py                # Configuration
├── providers.py               # Model providers
├── utils/
│   ├── __init__.py
│   ├── db_utils.py           # Database utilities
│   └── models.py             # Pydantic models
├── ingestion/
│   ├── __init__.py
│   ├── ingest.py             # Ingestion pipeline
│   ├── chunker.py            # Document chunking
│   └── embedder.py           # Embedding generation
├── sql/
│   └── schema.sql            # Database schema
└── documents/                 # Sample documents for demo
    └── sample_docs.md
```

**Frontend (Next.js):**
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with CopilotKit
│   │   ├── page.tsx           # Main page with useAgent
│   │   ├── globals.css        # Global styles
│   │   └── api/
│   │       └── copilotkit/
│   │           └── route.ts   # API route to Python backend
│   ├── components/
│   │   ├── ChunksPanel.tsx    # Retrieved chunks display
│   │   ├── ChunkCard.tsx      # Individual chunk card
│   │   ├── ApprovalCard.tsx   # HITL approval component
│   │   ├── SearchControls.tsx # Search parameter controls
│   │   └── ConversationControls.tsx # Reset/history controls
│   └── types/
│       └── rag.ts             # TypeScript types matching backend
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local
```

### Relevant Documentation - READ BEFORE IMPLEMENTING

**CopilotKit (Primary Focus):**
- [useAgent Hook Documentation](https://docs.copilotkit.ai/langgraph/use-agent-hook)
  - Section: Full API reference for useAgent
  - Why: Core hook we're demonstrating
- [CopilotKit v1.50 Release](https://www.copilotkit.ai/blog/copilotkit-v1-50-release-announcement-whats-new-for-agentic-ui-builders)
  - Section: useAgent capabilities
  - Why: Understand what's new to showcase
- [useCopilotAction Reference](https://docs.copilotkit.ai/reference/hooks/useCopilotAction)
  - Section: renderAndWaitForResponse
  - Why: Human-in-the-loop pattern
- [CopilotKit with Pydantic AI](https://docs.copilotkit.ai/pydantic-ai/)
  - Section: Integration patterns
  - Why: Framework integration

**Pydantic AI + AG-UI:**
- [AG-UI Integration](https://ai.pydantic.dev/ui/ag-ui/)
  - Section: AGUIApp, StateDeps, StateHandler
  - Why: Backend setup patterns
- [AG-UI API Reference](https://ai.pydantic.dev/api/ag_ui/)
  - Section: AGUIAdapter, ToolReturn, events
  - Why: Event emission patterns
- [AG-UI Examples](https://ai.pydantic.dev/examples/ag-ui/)
  - Section: Human in the Loop, Shared State
  - Why: Reference implementations

**AG-UI Protocol:**
- [AG-UI Events](https://docs.ag-ui.com/concepts/events)
  - Section: STATE_SNAPSHOT, STATE_DELTA
  - Why: Understand event types
- [AG-UI State Management](https://docs.ag-ui.com/concepts/state)
  - Section: Bidirectional sync
  - Why: State flow patterns

### Patterns to Follow

**Import Pattern for useAgent (v2):**
```typescript
// CORRECT - v2 subpackage
import { useAgent } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
```

**AGUIApp Pattern (Current Pydantic AI):**
```python
# CORRECT - Current API
from pydantic_ai.ui import StateDeps
from pydantic_ai.ui.ag_ui.app import AGUIApp

app = AGUIApp(agent, deps=StateDeps(RAGState()))
```

**State Event Pattern:**
```python
from ag_ui.core import StateSnapshotEvent, StateDeltaEvent, EventType
from pydantic_ai import ToolReturn

@agent.tool
async def my_tool(ctx: RunContext[StateDeps[MyState]]) -> ToolReturn:
    # Update state
    ctx.deps.state.field = new_value
    return ToolReturn(
        return_value="Tool completed",
        metadata=[
            StateSnapshotEvent(
                type=EventType.STATE_SNAPSHOT,
                snapshot=ctx.deps.state.model_dump()
            )
        ]
    )
```

**useAgent State Pattern:**
```typescript
const { agent } = useAgent<RAGState>({ agentId: "rag_agent" });

// Read state (reactive)
const chunks = agent.state?.retrieved_chunks || [];

// Write state (bidirectional)
const handleApprove = (chunkId: string) => {
  agent.setState({
    ...agent.state,
    approved_chunk_ids: [...(agent.state?.approved_chunk_ids || []), chunkId]
  });
};

// Time travel
const handleReset = () => {
  agent.setMessages([]);
};
```

**Human-in-the-Loop Pattern:**
```typescript
useCopilotAction({
  name: "request_approval",
  parameters: [
    { name: "chunks", type: "object[]", required: true }
  ],
  renderAndWaitForResponse: ({ args, status, respond }) => {
    if (status === "complete") return <ApprovedMessage />;
    return (
      <ApprovalCard
        chunks={args.chunks}
        onApprove={(ids) => respond?.({ approved: true, chunk_ids: ids })}
        onReject={() => respond?.({ approved: false })}
      />
    );
  },
});
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Backend Core)

**Goal:** Set up the Python backend with Pydantic AI agent and AG-UI integration.

**Tasks:**
1. Create project structure with proper directory layout
2. Set up Pydantic settings and environment configuration
3. Create database schema (reuse from example)
4. Implement RAGState model with approval workflow fields
5. Set up AGUIApp with StateDeps
6. Create basic agent with instructions

### Phase 2: Backend Tools & Search

**Goal:** Implement search tools that emit state events and support human-in-the-loop.

**Tasks:**
1. Implement semantic search tool with StateSnapshotEvent
2. Implement hybrid search tool
3. Create approval-aware synthesis tool
4. Add knowledge base stats tool
5. Implement dynamic instructions based on state

### Phase 3: Frontend Foundation

**Goal:** Set up Next.js with CopilotKit and useAgent hook.

**Tasks:**
1. Initialize Next.js project with TypeScript
2. Install CopilotKit dependencies
3. Set up CopilotKit provider in layout
4. Create API route with HttpAgent
5. Create TypeScript types matching backend state

### Phase 4: useAgent State Display (agent.state)

**Goal:** Build UI that reads from agent.state to display chunks.

**Tasks:**
1. Create ChunksPanel component
2. Create ChunkCard component with similarity display
3. Wire up to agent.state.retrieved_chunks
4. Add status and query display
5. Implement filtering and expansion

### Phase 5: Bidirectional State (agent.setState)

**Goal:** Enable users to modify state that flows back to agent.

**Tasks:**
1. Add approval checkboxes to ChunkCard
2. Implement approve/reject handlers with setState
3. Create SearchControls component (threshold, max results)
4. Wire search controls to state
5. Show agent respecting user preferences

### Phase 6: Human-in-the-Loop (renderAndWaitForResponse)

**Goal:** Agent pauses for user approval before synthesis.

**Tasks:**
1. Create ApprovalCard component for chat
2. Implement useCopilotAction with renderAndWaitForResponse
3. Update agent to call approval tool
4. Handle approve/reject responses
5. Agent synthesizes only with approved chunks

### Phase 7: Time Travel & Conversation Control

**Goal:** Demonstrate setMessages for conversation reset.

**Tasks:**
1. Create ConversationControls component
2. Implement "New Conversation" with setMessages([])
3. Add "Retry Search" functionality
4. Optional: Message history display

### Phase 8: Polish & Demo Preparation

**Goal:** Finalize for YouTube demo quality.

**Tasks:**
1. Add loading states and animations
2. Implement error handling
3. Create sample documents for demo
4. Add AG-UI Inspector visibility (showDevConsole)
5. Write demo script and talking points

---

## STEP-BY-STEP TASKS

### Phase 1: Backend Foundation

#### Task 1.1: CREATE agent/ directory structure

- **IMPLEMENT**: Create all directories and __init__.py files
- **VALIDATE**: `ls -la agent/` shows expected structure

```bash
mkdir -p agent/{utils,ingestion,sql,documents}
touch agent/__init__.py agent/utils/__init__.py agent/ingestion/__init__.py
```

#### Task 1.2: CREATE agent/settings.py

- **IMPLEMENT**: Configuration class with pydantic_settings
- **PATTERN**: Mirror `.claude/examples/pydantic_ai_rag_agent/settings.py`
- **IMPORTS**: `from pydantic_settings import BaseSettings`
- **VALIDATE**: `python -c "from agent.settings import load_settings; print(load_settings())"`

```python
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = Field(..., description="PostgreSQL connection URL")
    db_pool_min_size: int = Field(default=5)
    db_pool_max_size: int = Field(default=20)

    # LLM
    llm_api_key: str = Field(..., description="OpenAI API key")
    llm_model: str = Field(default="gpt-4o-mini")
    llm_base_url: str = Field(default="https://api.openai.com/v1")

    # Embeddings
    embedding_model: str = Field(default="text-embedding-3-small")

    # Search defaults
    default_match_count: int = Field(default=10)
    max_match_count: int = Field(default=50)
    default_similarity_threshold: float = Field(default=0.5)

    class Config:
        env_file = ".env"
        extra = "ignore"

def load_settings() -> Settings:
    return Settings()
```

#### Task 1.3: CREATE agent/state.py - RAGState Model

- **IMPLEMENT**: State model with all fields for useAgent demonstration
- **PATTERN**: Extend beyond basic example to include approval workflow
- **IMPORTS**: `from pydantic import BaseModel, Field`
- **GOTCHA**: Field names must match frontend TypeScript types exactly
- **VALIDATE**: `python -c "from agent.state import RAGState; print(RAGState().model_dump())"`

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RetrievedChunk(BaseModel):
    """A chunk retrieved from the knowledge base."""
    chunk_id: str
    document_id: str
    content: str
    similarity: float
    metadata: Dict[str, Any] = Field(default_factory=dict)
    document_title: str
    document_source: str
    approved: bool = False  # For HITL approval

class SearchQuery(BaseModel):
    """Current search query information."""
    query: str
    timestamp: str
    search_type: str = "semantic"  # semantic or hybrid
    match_count: int = 10

class SearchConfig(BaseModel):
    """User-configurable search parameters (bidirectional state)."""
    similarity_threshold: float = 0.5
    max_results: int = 10
    search_type: str = "semantic"

class RAGState(BaseModel):
    """
    Shared state between agent and frontend via AG-UI.

    This model demonstrates all useAgent capabilities:
    - agent.state: All fields readable by frontend
    - agent.setState: approved_chunk_ids, search_config updated by frontend
    - STATE_SNAPSHOT: Full state sent after retrieval
    - STATE_DELTA: Incremental updates for approvals
    """
    # Retrieved data (agent → frontend)
    retrieved_chunks: List[RetrievedChunk] = Field(default_factory=list)
    current_query: Optional[SearchQuery] = None
    search_history: List[SearchQuery] = Field(default_factory=list)

    # Knowledge base info
    total_chunks_in_kb: int = 0
    knowledge_base_status: str = "initializing"

    # HITL approval workflow (frontend ↔ agent)
    approved_chunk_ids: List[str] = Field(default_factory=list)
    awaiting_approval: bool = False

    # User-configurable search (frontend → agent)
    search_config: SearchConfig = Field(default_factory=SearchConfig)

    # UI state hints
    is_searching: bool = False
    is_synthesizing: bool = False
    error_message: Optional[str] = None
```

#### Task 1.4: CREATE agent/sql/schema.sql

- **IMPLEMENT**: PostgreSQL schema with pgvector
- **PATTERN**: Copy from `.claude/examples/pydantic_ai_rag_agent/sql/schema.sql`
- **VALIDATE**: Schema creates successfully in PostgreSQL

#### Task 1.5: CREATE agent/utils/db_utils.py

- **IMPLEMENT**: Database connection pool and utilities
- **PATTERN**: Mirror `.claude/examples/pydantic_ai_rag_agent/utils/db_utils.py`
- **IMPORTS**: `import asyncpg`
- **VALIDATE**: `python -c "from agent.utils.db_utils import test_connection; import asyncio; print(asyncio.run(test_connection()))"`

#### Task 1.6: CREATE agent/providers.py

- **IMPLEMENT**: LLM and embedding provider factories
- **PATTERN**: Mirror `.claude/examples/pydantic_ai_rag_agent/providers.py`
- **VALIDATE**: `python -c "from agent.providers import get_llm_model; print(get_llm_model())"`

#### Task 1.7: CREATE agent/dependencies.py

- **IMPLEMENT**: AgentDependencies dataclass
- **PATTERN**: Mirror `.claude/examples/pydantic_ai_rag_agent/dependencies.py`
- **VALIDATE**: `python -c "from agent.dependencies import AgentDependencies; d = AgentDependencies(); print(d)"`

---

### Phase 2: Backend Tools & Agent

#### Task 2.1: CREATE agent/tools.py - Search Tools

- **IMPLEMENT**: semantic_search and hybrid_search functions
- **PATTERN**: Mirror `.claude/examples/pydantic_ai_rag_agent/tools.py`
- **IMPORTS**: `from pydantic_ai import RunContext`
- **GOTCHA**: Return SearchResult objects, not raw database rows
- **VALIDATE**: Unit test with mock database

```python
# Key difference: Tools now work with StateDeps
async def semantic_search(
    ctx,  # Will be wrapped by agent tool
    query: str,
    match_count: int = 10,
    similarity_threshold: float = 0.5
) -> List[SearchResult]:
    """Pure vector search."""
    # ... implementation
```

#### Task 2.2: CREATE agent/prompts.py

- **IMPLEMENT**: System prompts for RAG agent
- **PATTERN**: Adapt from `.claude/examples/pydantic_ai_rag_agent/prompts.py`
- **GOTCHA**: Include instructions about waiting for user approval
- **VALIDATE**: Prompts render without errors

```python
MAIN_SYSTEM_PROMPT = """You are a RAG assistant with human-in-the-loop source validation.

WORKFLOW:
1. When user asks a question, search the knowledge base
2. Present retrieved chunks to the user for approval
3. WAIT for user to approve sources before synthesizing
4. Only use approved sources in your final answer
5. Include citations to the approved sources

The user can:
- Approve or reject individual sources
- Adjust search parameters (you'll see updated state)
- Ask for a new search if results aren't relevant

IMPORTANT: Never synthesize an answer until the user has approved sources."""
```

#### Task 2.3: CREATE agent/agent.py - Main Agent

- **IMPLEMENT**: Pydantic AI agent with StateDeps and tools
- **PATTERN**: Adapt from `.claude/examples/pydantic_ai_rag_agent/agent.py`
- **IMPORTS**:
  ```python
  from pydantic_ai import Agent, RunContext
  from pydantic_ai.ui import StateDeps
  from pydantic_ai import ToolReturn
  from ag_ui.core import StateSnapshotEvent, EventType
  ```
- **GOTCHA**: Import AGUIApp from correct path: `from pydantic_ai.ui.ag_ui.app import AGUIApp`
- **VALIDATE**: Agent instantiates without errors

```python
from pydantic_ai import Agent, RunContext
from pydantic_ai.ui import StateDeps
from pydantic_ai.ui.ag_ui.app import AGUIApp
from pydantic_ai import ToolReturn
from ag_ui.core import StateSnapshotEvent, EventType

from .state import RAGState, RetrievedChunk, SearchQuery
from .providers import get_llm_model
from .prompts import MAIN_SYSTEM_PROMPT

# Create agent with StateDeps for AG-UI state management
agent = Agent(
    get_llm_model(),
    deps_type=StateDeps[RAGState],
    system_prompt=MAIN_SYSTEM_PROMPT
)

@agent.tool
async def search_knowledge_base(
    ctx: RunContext[StateDeps[RAGState]],
    query: str
) -> ToolReturn:
    """Search the knowledge base for relevant information."""
    state = ctx.deps.state
    config = state.search_config

    # Update state to show searching
    state.is_searching = True
    state.current_query = SearchQuery(
        query=query,
        timestamp=datetime.now().isoformat(),
        search_type=config.search_type,
        match_count=config.max_results
    )

    # Perform search (respecting user's config from state)
    results = await _perform_search(
        query=query,
        search_type=config.search_type,
        match_count=config.max_results,
        similarity_threshold=config.similarity_threshold
    )

    # Update state with results
    state.retrieved_chunks = [
        RetrievedChunk(
            chunk_id=r.chunk_id,
            document_id=r.document_id,
            content=r.content,
            similarity=r.similarity,
            metadata=r.metadata,
            document_title=r.document_title,
            document_source=r.document_source,
            approved=False  # Not yet approved
        )
        for r in results
    ]
    state.is_searching = False
    state.awaiting_approval = True  # Signal HITL needed
    state.search_history.append(state.current_query)

    return ToolReturn(
        return_value=f"Found {len(results)} relevant chunks. Please review and approve the sources you'd like me to use.",
        metadata=[
            StateSnapshotEvent(
                type=EventType.STATE_SNAPSHOT,
                snapshot=state.model_dump()
            )
        ]
    )

@agent.tool
async def synthesize_answer(
    ctx: RunContext[StateDeps[RAGState]]
) -> ToolReturn:
    """Synthesize an answer using only approved sources."""
    state = ctx.deps.state

    # Get approved chunks
    approved_chunks = [
        chunk for chunk in state.retrieved_chunks
        if chunk.chunk_id in state.approved_chunk_ids
    ]

    if not approved_chunks:
        return ToolReturn(
            return_value="No sources have been approved. Please approve at least one source to generate an answer."
        )

    state.is_synthesizing = True
    state.awaiting_approval = False

    # Build context from approved chunks
    context = "\n\n".join([
        f"[Source: {chunk.document_title}]\n{chunk.content}"
        for chunk in approved_chunks
    ])

    # Update state
    return ToolReturn(
        return_value=f"Synthesizing answer from {len(approved_chunks)} approved sources:\n\n{context}",
        metadata=[
            StateSnapshotEvent(
                type=EventType.STATE_SNAPSHOT,
                snapshot=state.model_dump()
            )
        ]
    )

# Create ASGI application
app = AGUIApp(agent, deps=StateDeps(RAGState()))
```

#### Task 2.4: CREATE agent/main.py - FastAPI Entry

- **IMPLEMENT**: FastAPI app wrapping AGUIApp with CORS
- **PATTERN**: Standard FastAPI setup with CORS middleware
- **VALIDATE**: `uvicorn agent.main:app --reload` starts successfully

```python
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .agent import app as agui_app

# Create FastAPI wrapper for additional endpoints
api = FastAPI(title="RAG Agent API")

api.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount AGUIApp at root
api.mount("/", agui_app)

@api.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(api, host="0.0.0.0", port=8000)
```

---

### Phase 3: Frontend Foundation

#### Task 3.1: Initialize Next.js Project

- **IMPLEMENT**: Create Next.js project with TypeScript and Tailwind
- **VALIDATE**: `npm run dev` starts successfully

```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
cd frontend
```

#### Task 3.2: Install CopilotKit Dependencies

- **IMPLEMENT**: Add CopilotKit packages
- **GOTCHA**: Use exact versions for v1.50+
- **VALIDATE**: `npm ls @copilotkit/react-core` shows correct version

```bash
npm install @copilotkit/react-core@latest @copilotkit/react-ui@latest @copilotkit/runtime@latest @ag-ui/client
```

#### Task 3.3: CREATE frontend/src/types/rag.ts

- **IMPLEMENT**: TypeScript types matching backend RAGState exactly
- **GOTCHA**: Field names must match Python models exactly
- **VALIDATE**: TypeScript compiles without errors

```typescript
export interface RetrievedChunk {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
  document_title: string;
  document_source: string;
  approved: boolean;
}

export interface SearchQuery {
  query: string;
  timestamp: string;
  search_type: string;
  match_count: number;
}

export interface SearchConfig {
  similarity_threshold: number;
  max_results: number;
  search_type: string;
}

export interface RAGState {
  retrieved_chunks: RetrievedChunk[];
  current_query: SearchQuery | null;
  search_history: SearchQuery[];
  total_chunks_in_kb: number;
  knowledge_base_status: string;
  approved_chunk_ids: string[];
  awaiting_approval: boolean;
  search_config: SearchConfig;
  is_searching: boolean;
  is_synthesizing: boolean;
  error_message: string | null;
}
```

#### Task 3.4: UPDATE frontend/src/app/layout.tsx

- **IMPLEMENT**: Add CopilotKit provider
- **PATTERN**: Mirror `.claude/examples/basic_rag_frontend/layout.tsx`
- **GOTCHA**: Set `showDevConsole={true}` for AG-UI Inspector demo
- **VALIDATE**: Page loads with CopilotKit initialized

```typescript
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="rag_agent"
          showDevConsole={true}  // Show AG-UI Inspector for demo
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

#### Task 3.5: CREATE frontend/src/app/api/copilotkit/route.ts

- **IMPLEMENT**: API route connecting to Python backend
- **PATTERN**: Mirror `.claude/examples/basic_rag_frontend/api/copilotkit/route.ts`
- **VALIDATE**: POST to /api/copilotkit returns response

```typescript
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

const runtime = new CopilotRuntime({
  agents: {
    rag_agent: new HttpAgent({
      url: process.env.AGENT_URL || "http://localhost:8000",
    }),
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
```

---

### Phase 4: useAgent State Display

#### Task 4.1: CREATE frontend/src/app/page.tsx - Main Page with useAgent

- **IMPLEMENT**: Main page using useAgent hook (v2)
- **PATTERN**: Adapt `.claude/examples/basic_rag_frontend/page.tsx` to use useAgent
- **IMPORTS**: `import { useAgent } from "@copilotkit/react-core/v2";`
- **GOTCHA**: useAgent returns `{ agent }` object, not direct state
- **VALIDATE**: Page loads, agent.state is accessible

```typescript
"use client";

import { useAgent } from "@copilotkit/react-core/v2";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import { RAGState } from "@/types/rag";
import { ChunksPanel } from "@/components/ChunksPanel";
import { SearchControls } from "@/components/SearchControls";
import { ConversationControls } from "@/components/ConversationControls";
import { ApprovalCard } from "@/components/ApprovalCard";

export default function RAGAgentPage() {
  // THE KEY HOOK - demonstrates agent.state reading
  const { agent } = useAgent<RAGState>({ agentId: "rag_agent" });

  // Destructure for convenience
  const { state, setState, messages, setMessages } = agent;

  // ... human-in-the-loop action setup
  // ... component rendering

  return (
    <div className="flex h-screen">
      {/* Left: Chunks Panel - reads from agent.state */}
      <div className="flex-1 flex flex-col">
        <SearchControls
          config={state?.search_config}
          onConfigChange={(newConfig) => {
            // Demonstrates agent.setState() - bidirectional!
            setState({
              ...state,
              search_config: newConfig
            });
          }}
        />
        <ChunksPanel
          chunks={state?.retrieved_chunks || []}
          approvedIds={state?.approved_chunk_ids || []}
          isSearching={state?.is_searching || false}
          onApprovalChange={(chunkId, approved) => {
            // Demonstrates agent.setState() for approvals
            const newApproved = approved
              ? [...(state?.approved_chunk_ids || []), chunkId]
              : (state?.approved_chunk_ids || []).filter(id => id !== chunkId);
            setState({
              ...state,
              approved_chunk_ids: newApproved
            });
          }}
        />
        <ConversationControls
          onReset={() => {
            // Demonstrates agent.setMessages() - time travel!
            setMessages([]);
            setState({
              ...state,
              retrieved_chunks: [],
              approved_chunk_ids: [],
              awaiting_approval: false
            });
          }}
        />
      </div>

      {/* Right: Chat Sidebar */}
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "RAG Assistant",
          initial: "Ask me anything! I'll find relevant sources for you to review before answering."
        }}
      />
    </div>
  );
}
```

#### Task 4.2: CREATE frontend/src/components/ChunksPanel.tsx

- **IMPLEMENT**: Panel displaying retrieved chunks from agent.state
- **PATTERN**: Adapt RAGKnowledgeBaseView from example
- **VALIDATE**: Renders chunks when state has data

#### Task 4.3: CREATE frontend/src/components/ChunkCard.tsx

- **IMPLEMENT**: Individual chunk display with approval checkbox
- **PATTERN**: Adapt ChunkCard from example, add approval UI
- **VALIDATE**: Clicking checkbox triggers onApprovalChange

---

### Phase 5: Bidirectional State (agent.setState)

#### Task 5.1: CREATE frontend/src/components/SearchControls.tsx

- **IMPLEMENT**: Controls that update search_config via setState
- **VALIDATE**: Changing slider updates agent.state.search_config

```typescript
interface SearchControlsProps {
  config?: SearchConfig;
  onConfigChange: (config: SearchConfig) => void;
}

export function SearchControls({ config, onConfigChange }: SearchControlsProps) {
  return (
    <div className="p-4 bg-gray-50 border-b">
      <h3 className="text-sm font-medium mb-3">Search Settings</h3>

      {/* Similarity Threshold - user can adjust, agent respects */}
      <label className="block text-xs mb-2">
        Minimum Similarity: {((config?.similarity_threshold || 0.5) * 100).toFixed(0)}%
        <input
          type="range"
          min="0"
          max="100"
          value={(config?.similarity_threshold || 0.5) * 100}
          onChange={(e) => onConfigChange({
            ...config!,
            similarity_threshold: parseInt(e.target.value) / 100
          })}
          className="w-full"
        />
      </label>

      {/* Max Results */}
      <label className="block text-xs mb-2">
        Max Results: {config?.max_results || 10}
        <input
          type="range"
          min="5"
          max="20"
          value={config?.max_results || 10}
          onChange={(e) => onConfigChange({
            ...config!,
            max_results: parseInt(e.target.value)
          })}
          className="w-full"
        />
      </label>

      {/* Search Type Toggle */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onConfigChange({ ...config!, search_type: "semantic" })}
          className={`px-3 py-1 text-xs rounded ${
            config?.search_type === "semantic" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Semantic
        </button>
        <button
          onClick={() => onConfigChange({ ...config!, search_type: "hybrid" })}
          className={`px-3 py-1 text-xs rounded ${
            config?.search_type === "hybrid" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Hybrid
        </button>
      </div>
    </div>
  );
}
```

---

### Phase 6: Human-in-the-Loop

#### Task 6.1: CREATE frontend/src/components/ApprovalCard.tsx

- **IMPLEMENT**: Approval component for renderAndWaitForResponse
- **VALIDATE**: Renders in chat, respond() works correctly

```typescript
interface ApprovalCardProps {
  chunks: RetrievedChunk[];
  onApprove: (chunkIds: string[]) => void;
  onReject: () => void;
}

export function ApprovalCard({ chunks, onApprove, onReject }: ApprovalCardProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(chunks.map(c => c.chunk_id))
  );

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm max-w-md">
      <h3 className="font-semibold mb-2">Review Sources</h3>
      <p className="text-sm text-gray-600 mb-4">
        Select which sources to use for the answer:
      </p>

      <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
        {chunks.map((chunk) => (
          <label key={chunk.chunk_id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
            <input
              type="checkbox"
              checked={selected.has(chunk.chunk_id)}
              onChange={(e) => {
                const newSelected = new Set(selected);
                if (e.target.checked) {
                  newSelected.add(chunk.chunk_id);
                } else {
                  newSelected.delete(chunk.chunk_id);
                }
                setSelected(newSelected);
              }}
              className="mt-1"
            />
            <div className="flex-1 text-sm">
              <div className="font-medium">{chunk.document_title}</div>
              <div className="text-gray-500 line-clamp-2">{chunk.content}</div>
              <div className="text-blue-600 text-xs mt-1">
                {(chunk.similarity * 100).toFixed(0)}% match
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onApprove(Array.from(selected))}
          disabled={selected.size === 0}
          className="flex-1 bg-green-600 text-white py-2 rounded disabled:opacity-50"
        >
          Use {selected.size} Source{selected.size !== 1 ? "s" : ""}
        </button>
        <button
          onClick={onReject}
          className="px-4 py-2 border rounded"
        >
          Search Again
        </button>
      </div>
    </div>
  );
}
```

#### Task 6.2: ADD useCopilotAction to page.tsx

- **IMPLEMENT**: renderAndWaitForResponse for HITL approval
- **VALIDATE**: Agent pauses, custom component renders, response received

```typescript
// In page.tsx, add this action
useCopilotAction({
  name: "request_source_approval",
  description: "Request user approval for retrieved sources before synthesizing answer",
  parameters: [
    {
      name: "chunks",
      type: "object[]",
      description: "The retrieved chunks to review",
      required: true,
    },
  ],
  renderAndWaitForResponse: ({ args, status, respond }) => {
    if (status === "complete") {
      return (
        <div className="text-green-600 text-sm">
          ✓ Sources approved! Generating answer...
        </div>
      );
    }

    return (
      <ApprovalCard
        chunks={args.chunks || []}
        onApprove={(chunkIds) => {
          // Update state with approved IDs
          setState({
            ...state,
            approved_chunk_ids: chunkIds,
            awaiting_approval: false,
          });
          // Send response back to agent
          respond?.({
            approved: true,
            chunk_ids: chunkIds,
            message: `User approved ${chunkIds.length} sources`,
          });
        }}
        onReject={() => {
          respond?.({
            approved: false,
            message: "User rejected sources, please search again",
          });
        }}
      />
    );
  },
});
```

---

### Phase 7: Time Travel & Conversation Control

#### Task 7.1: CREATE frontend/src/components/ConversationControls.tsx

- **IMPLEMENT**: Reset button using setMessages
- **VALIDATE**: Clicking reset clears messages and state

```typescript
interface ConversationControlsProps {
  onReset: () => void;
  messageCount?: number;
}

export function ConversationControls({ onReset, messageCount = 0 }: ConversationControlsProps) {
  return (
    <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
      <span className="text-sm text-gray-500">
        {messageCount} message{messageCount !== 1 ? "s" : ""} in conversation
      </span>
      <button
        onClick={onReset}
        className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        New Conversation
      </button>
    </div>
  );
}
```

---

### Phase 8: Polish & Demo

#### Task 8.1: CREATE agent/documents/sample_docs.md

- **IMPLEMENT**: Sample documents about AI/ML for demo
- **VALIDATE**: Documents ingest successfully

#### Task 8.2: ADD Loading States and Error Handling

- **IMPLEMENT**: Visual feedback for all async operations
- **VALIDATE**: Loading spinners appear during search

#### Task 8.3: CREATE Demo Script

- **IMPLEMENT**: Documented demo flow for YouTube video
- **VALIDATE**: Demo runs smoothly

---

## TESTING STRATEGY

### Backend Unit Tests

**Test Files:** `agent/tests/`

```python
# test_agent.py
import pytest
from pydantic_ai.models.test import TestModel
from agent.agent import agent
from agent.state import RAGState
from pydantic_ai.ui import StateDeps

@pytest.mark.anyio
async def test_search_updates_state():
    """Test that search_knowledge_base updates state correctly."""
    deps = StateDeps(RAGState())
    with agent.override(model=TestModel()):
        result = await agent.run(
            "Search for information about machine learning",
            deps=deps
        )
    assert len(deps.state.retrieved_chunks) > 0
    assert deps.state.awaiting_approval == True

@pytest.mark.anyio
async def test_synthesize_requires_approval():
    """Test that synthesize fails without approved chunks."""
    deps = StateDeps(RAGState(
        retrieved_chunks=[...],
        approved_chunk_ids=[]
    ))
    with agent.override(model=TestModel()):
        result = await agent.run("Synthesize answer", deps=deps)
    assert "No sources have been approved" in result.output
```

### Frontend Component Tests

**Test Files:** `frontend/src/__tests__/`

```typescript
// ChunksPanel.test.tsx
import { render, screen } from "@testing-library/react";
import { ChunksPanel } from "@/components/ChunksPanel";

describe("ChunksPanel", () => {
  it("displays chunks from state", () => {
    const chunks = [
      { chunk_id: "1", content: "Test content", similarity: 0.9, ... }
    ];
    render(<ChunksPanel chunks={chunks} approvedIds={[]} />);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });
});
```

### Integration Tests

**Test AG-UI endpoint:**
```bash
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"messages": [{"role": "user", "content": "Hello"}], "state": {}, "tools": []}'
```

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

**Backend:**
```bash
cd agent
ruff check .
ruff format --check .
mypy .
```

**Frontend:**
```bash
cd frontend
npm run lint
npm run type-check
```

### Level 2: Unit Tests

```bash
# Backend
cd agent
pytest tests/ -v

# Frontend
cd frontend
npm test
```

### Level 3: Integration Tests

```bash
# Start backend
cd agent && uvicorn main:app --port 8000 &

# Start frontend
cd frontend && npm run dev &

# Test AG-UI endpoint
curl -X POST http://localhost:8000 \
  -H "Accept: text/event-stream" \
  -d '{"messages": [], "state": {}}'

# Test CopilotKit route
curl -X POST http://localhost:3000/api/copilotkit \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

### Level 4: Manual Validation

1. Open http://localhost:3000
2. Verify AG-UI Inspector appears (bottom right)
3. Ask a question in chat
4. Verify chunks appear in left panel (tests agent.state)
5. Toggle chunk approval (tests agent.setState)
6. Verify approval card appears in chat (tests renderAndWaitForResponse)
7. Approve sources and verify answer generation
8. Click "New Conversation" (tests agent.setMessages)
9. Verify conversation resets

---

## ACCEPTANCE CRITERIA

- [ ] **useAgent hook working**: Can read `agent.state` with retrieved chunks
- [ ] **Bidirectional state**: `agent.setState()` updates propagate to backend
- [ ] **Human-in-the-loop**: `renderAndWaitForResponse` blocks agent until user approval
- [ ] **Time travel**: `agent.setMessages([])` resets conversation
- [ ] **STATE_SNAPSHOT events**: Full state sent after retrieval
- [ ] **Search config respected**: Agent uses user's similarity threshold and max results
- [ ] **AG-UI Inspector visible**: Shows real-time event streaming for demo
- [ ] **Clean UI**: Professional appearance suitable for YouTube demo
- [ ] **Error handling**: Graceful degradation on failures
- [ ] **All validation commands pass**

---

## COMPLETION CHECKLIST

- [ ] All Phase 1-8 tasks completed
- [ ] Backend starts with `uvicorn agent.main:app`
- [ ] Frontend starts with `npm run dev`
- [ ] Full demo flow works end-to-end
- [ ] AG-UI Inspector shows events in real-time
- [ ] useAgent hook demonstrates all capabilities naturally
- [ ] No TypeScript errors
- [ ] No Python linting errors
- [ ] Tests pass
- [ ] Demo script prepared

---

## NOTES

### Design Decisions

1. **Why StateDeps over custom StateHandler?**
   - Simpler API, automatic validation
   - Recommended pattern in Pydantic AI docs
   - Matches CopilotKit examples

2. **Why show AG-UI Inspector?**
   - Makes state flow visible for educational demo
   - Shows events streaming in real-time
   - Helps debugging during development

3. **Why SearchConfig in state instead of just tools?**
   - Demonstrates bidirectional state sync
   - Shows agent respecting user preferences
   - Natural UX pattern (configure before search)

4. **Why renderAndWaitForResponse for approval?**
   - True human-in-the-loop (agent actually waits)
   - Shows blocking pattern for important decisions
   - Better UX than polling or optimistic updates

### Key useAgent Demonstration Points for Video

1. **0:00-2:00**: Show import from `/v2`, explain what's new
2. **2:00-5:00**: `agent.state` - chunks appear automatically after search
3. **5:00-8:00**: `agent.setState()` - user toggles approvals, agent sees updates
4. **8:00-12:00**: `renderAndWaitForResponse` - agent waits for approval
5. **12:00-15:00**: `agent.setMessages()` - reset conversation
6. **15:00-18:00**: SearchControls - bidirectional config sync
7. **18:00-20:00**: AG-UI Inspector - show events flowing
8. **20:00-25:00**: Full demo flow, recap key points

### Potential Issues

1. **State type mismatch**: Ensure TypeScript types exactly match Python models
2. **CORS errors**: Backend must allow frontend origin
3. **Event streaming**: Ensure Accept header is `text/event-stream`
4. **useState vs agent.state**: Don't duplicate state management
