import { generateObject } from "../llm";
import { buildAnalyzePrompt } from "../prompts/analyze";
import { type Brief, briefSchema } from "../schemas/brief";
import type { PrepInput } from "../schemas/input";

export type LlmCallOptions = { timeoutMs: number; signal?: AbortSignal };

const ANALYZE_MAX_TOKENS = 4096;

export function analyze(input: PrepInput, options: LlmCallOptions): Promise<Brief> {
  return generateObject({
    ...buildAnalyzePrompt(input),
    schema: briefSchema,
    maxTokens: ANALYZE_MAX_TOKENS,
    ...options,
  });
}
