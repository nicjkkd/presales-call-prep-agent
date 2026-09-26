import { runAgent } from "@/agent";
import { AgentError } from "@/agent/errors";
import { prepInputSchema } from "@/agent/schemas/input";
import { getEnv } from "@/lib/env";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { createSseResponse } from "@/lib/sse-response";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsed = prepInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    getEnv();
  } catch {
    return Response.json({ error: "Server is not configured" }, { status: 500 });
  }

  const limit = checkRateLimit(getClientKey(request));
  if (!limit.ok) {
    return Response.json(
      { error: "Too many requests", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  return createSseResponse(request.signal, async (send) => {
    try {
      const result = await runAgent(
        parsed.data,
        (event) => send("progress", event),
        request.signal,
      );
      send("result", result);
    } catch (error) {
      const agentError = error instanceof AgentError ? error : null;
      send("error", {
        message: agentError?.userMessage ?? "Something went wrong. Please try again.",
        ...(agentError && { step: agentError.step }),
      });
    }
  });
}
