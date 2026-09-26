import { runAgent } from "@/agent";
import { AgentError } from "@/agent/errors";
import { prepInputSchema } from "@/agent/schemas/input";
import { getEnv } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 120;

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

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

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed || request.signal.aborted) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      try {
        const result = await runAgent(parsed.data, (e) => send("progress", e), request.signal);
        send("result", result);
      } catch (error) {
        send("error", {
          message: error instanceof AgentError ? error.userMessage : "Something went wrong.",
          ...(error instanceof AgentError && { step: error.step }),
        });
      } finally {
        if (!closed) {
          closed = true;
          controller.close();
        }
      }
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
