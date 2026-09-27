import type { Brief } from "./schemas/brief";
import type { PrepInput } from "./schemas/input";
import type { PrepPlan } from "./schemas/prep-plan";
import { analyze } from "./steps/analyze";
import { generate } from "./steps/generate";
import { applyRules } from "./steps/rules";
import { validatePrepPlan } from "./steps/validate";

export async function runAgent(input: PrepInput): Promise<{ plan: PrepPlan; brief: Brief }> {
  const brief = await analyze(input);
  const findings = applyRules(brief);

  let plan = await generate({ input, brief, findings });
  const issues = validatePrepPlan(plan);
  if (issues.length > 0) {
    plan = await generate({ input, brief, findings, validationFeedback: issues });
    if (validatePrepPlan(plan).length > 0) {
      throw new Error("The model returned an incomplete plan twice");
    }
  }

  return { plan, brief };
}
