# Interactive RAG Agent

Python backend for the Interactive RAG Agent demonstrating CopilotKit's useAgent hook with Pydantic AI + AG-UI protocol.

## Setup

```bash
# Install dependencies
uv sync

# Run the agent
uv run uvicorn main:app --reload --port 8000
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `LLM_API_KEY` - OpenAI API key
- `LLM_MODEL` - Model to use (default: gpt-4o-mini)
