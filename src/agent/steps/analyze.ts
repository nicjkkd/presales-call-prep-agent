import { generateObject } from "../llm";
import { buildAnalyzePrompt } from "../prompts/analyze";
import { type Brief, briefSchema } from "../schemas/brief";
import type { PrepInput } from "../schemas/input";

export function analyze(input: PrepInput): Promise<Brief> {
  return generateObject({ ...buildAnalyzePrompt(input), schema: briefSchema, maxTokens: 4096 });
}
