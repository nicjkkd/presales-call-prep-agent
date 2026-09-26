import { generateObject, type LlmCallOptions } from "../llm";
import { buildGeneratePrompt, type GeneratePromptParams } from "../prompts/generate";
import { type PrepPlan, prepPlanSchema } from "../schemas/prep-plan";

const GENERATE_MAX_TOKENS = 8192;

export function generate(params: GeneratePromptParams, options: LlmCallOptions): Promise<PrepPlan> {
  return generateObject({
    ...buildGeneratePrompt(params),
    schema: prepPlanSchema,
    maxTokens: GENERATE_MAX_TOKENS,
    ...options,
  });
}
