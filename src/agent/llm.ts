import "server-only";
import { chat } from "@tanstack/ai";
import { anthropicText } from "@tanstack/ai-anthropic";
import type { z } from "zod";

const MODEL = "claude-haiku-4-5";

type GenerateObjectOptions<TSchema extends z.ZodType> = {
  system: string;
  user: string;
  schema: TSchema;
  maxTokens: number;
};

export function generateObject<TSchema extends z.ZodType>({
  system,
  user,
  schema,
  maxTokens,
}: GenerateObjectOptions<TSchema>) {
  return chat({
    adapter: anthropicText(MODEL),
    systemPrompts: [system],
    messages: [{ role: "user", content: user }],
    outputSchema: schema,
    stream: false,
    modelOptions: { max_tokens: maxTokens },
  });
}
