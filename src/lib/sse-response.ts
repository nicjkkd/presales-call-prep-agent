import "server-only";

type SendEvent = (event: string, data: unknown) => void;

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

export function createSseResponse(
  signal: AbortSignal,
  run: (send: SendEvent) => Promise<void>,
): Response {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send: SendEvent = (event, data) => {
        if (closed || signal.aborted) return;
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      try {
        await run(send);
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
