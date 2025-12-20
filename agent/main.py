"""FastAPI entry point for the Interactive RAG Agent.

This wraps the AGUI app with CORS and additional endpoints.
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agent import app as agui_app

# Create FastAPI wrapper for additional endpoints and CORS
api = FastAPI(
    title="Interactive RAG Agent API",
    description="RAG agent with human-in-the-loop source validation via AG-UI",
    version="1.0.0",
)

# Add CORS middleware for frontend communication
api.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@api.get("/health")
async def health_check():
    """Health check endpoint for load balancers."""
    return {"status": "healthy", "service": "rag-agent"}


# Mount AGUIApp at root - this handles the AG-UI protocol
api.mount("/", agui_app)


if __name__ == "__main__":
    uvicorn.run(api, host="0.0.0.0", port=8000)
