import { generateObject, type LlmCallOptions } from "../llm";
import { buildAnalyzePrompt } from "../prompts/analyze";
import { type Brief, briefSchema } from "../schemas/brief";
import type { PrepInput } from "../schemas/input";

const ANALYZE_MAX_TOKENS = 4096;

export function analyze(input: PrepInput, options: LlmCallOptions): Promise<Brief> {
  return generateObject({
    ...buildAnalyzePrompt(input),
    schema: briefSchema,
    maxTokens: ANALYZE_MAX_TOKENS,
    ...options,
  });
}
