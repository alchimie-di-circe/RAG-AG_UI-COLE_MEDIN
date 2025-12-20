/**
 * CopilotKit API route connecting to the Python backend.
 *
 * This route uses HttpAgent from @ag-ui/client to forward requests
 * to the Pydantic AI agent running on port 8000.
 */

import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";

// Service adapter for single-agent mode
const serviceAdapter = new ExperimentalEmptyAdapter();

// Create the CopilotRuntime with our RAG agent
const runtime = new CopilotRuntime({
  agents: {
    // Connect to the Python backend running the AG-UI enabled agent
    rag_agent: new HttpAgent({
      url: process.env.AGENT_URL || "http://localhost:8000/",
    }),
  },
});

/**
 * POST handler for CopilotKit requests.
 * All agent communication flows through this endpoint.
 */
export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
