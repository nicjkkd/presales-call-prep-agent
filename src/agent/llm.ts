import { chat } from "@tanstack/ai";
import { anthropicText } from "@tanstack/ai-anthropic";
import type { z } from "zod";

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 8192;

type GenerateObjectOptions<TSchema extends z.ZodType> = {
  system: string;
  user: string;
  schema: TSchema;
  signal: AbortSignal;
};

export function generateObject<TSchema extends z.ZodType>({
  system,
  user,
  schema,
  signal,
}: GenerateObjectOptions<TSchema>) {
  return chat({
    adapter: anthropicText(MODEL),
    systemPrompts: [system],
    messages: [{ role: "user", content: user }],
    outputSchema: schema,
    stream: false,
    modelOptions: { max_tokens: MAX_TOKENS },
    abortController: toAbortController(signal),
  });
}

function toAbortController(signal: AbortSignal): AbortController {
  const controller = new AbortController();
  if (signal.aborted) controller.abort(signal.reason);
  else signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  return controller;
}
