import { chat } from "@tanstack/ai";
import { anthropicText } from "@tanstack/ai-anthropic";
import type { z } from "zod";

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 8192;

type GenerateObjectOptions<TSchema extends z.ZodType> = {
  system: string;
  user: string;
  schema: TSchema;
};

export function generateObject<TSchema extends z.ZodType>({
  system,
  user,
  schema,
}: GenerateObjectOptions<TSchema>) {
  return chat({
    adapter: anthropicText(MODEL),
    systemPrompts: [system],
    messages: [{ role: "user", content: user }],
    outputSchema: schema,
    stream: false,
    modelOptions: { max_tokens: MAX_TOKENS },
  });
}
