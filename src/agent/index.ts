import type { Brief } from "./schemas/brief";
import type { PrepInput } from "./schemas/input";
import type { PrepPlan } from "./schemas/prep-plan";
import { analyze } from "./steps/analyze";
import { generate } from "./steps/generate";
import { applyRules } from "./steps/rules";
import { validatePrepPlan } from "./steps/validate";

export type PrepPlanResult = { plan: PrepPlan; brief: Brief };

export async function runAgent(input: PrepInput): Promise<PrepPlanResult> {
  const brief = await analyze(input);
  const findings = applyRules(brief);

  const plan = await generate({ input, brief, findings });
  const validation = validatePrepPlan(plan);
  if (validation.ok) return { plan, brief };

  const retryPlan = await generate({
    input,
    brief,
    findings,
    validationFeedback: validation.issues,
  });
  if (!validatePrepPlan(retryPlan).ok) {
    throw new Error("The model returned an incomplete plan twice");
  }
  return { plan: retryPlan, brief };
}
