import { generateObject } from "../llm";
import { buildGeneratePrompt, type GeneratePromptParams } from "../prompts/generate";
import { type PrepPlan, prepPlanSchema } from "../schemas/prep-plan";

export function generate(params: GeneratePromptParams): Promise<PrepPlan> {
  return generateObject({
    ...buildGeneratePrompt(params),
    schema: prepPlanSchema,
    maxTokens: 8192,
  });
}
