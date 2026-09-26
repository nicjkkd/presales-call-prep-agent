import { AgentError } from "./errors";
import { type LlmCallOptions, LlmError, type LlmErrorKind } from "./llm";
import type { AgentStepId, ProgressEvent } from "./progress";
import type { Brief } from "./schemas/brief";
import type { PrepInput } from "./schemas/input";
import type { PrepPlan } from "./schemas/prep-plan";
import { analyze } from "./steps/analyze";
import { generate } from "./steps/generate";
import { applyRules, type RuleFindings } from "./steps/rules";
import { validatePrepPlan } from "./steps/validate";

export type PrepPlanResult = { plan: PrepPlan; brief: Brief; findings: RuleFindings };

const MAX_GENERATE_ATTEMPTS = 2;
const RUN_BUDGET_MS = 110_000;
const ANALYZE_TIMEOUT_MS = 40_000;
const GENERATE_TIMEOUT_MS = 60_000;

const GENERIC_MESSAGE = "Something went wrong while generating the plan. Please try again.";
const INCOMPLETE_TWICE_MESSAGE = "The model returned an incomplete plan twice. Please try again.";

const USER_MESSAGES: Record<LlmErrorKind, string> = {
  config: "Server is not configured",
  busy: "The model is busy, try again in a minute",
  timeout: "Generation timed out",
  aborted: "The request was cancelled",
  "invalid-output": GENERIC_MESSAGE,
  unknown: GENERIC_MESSAGE,
};

export async function runAgent(
  input: PrepInput,
  onProgress?: (event: ProgressEvent) => void,
  signal?: AbortSignal,
): Promise<PrepPlanResult> {
  const normalized = normalizeInput(input);
  const deadline = Date.now() + RUN_BUDGET_MS;

  const callOptions = (maxMs: number): LlmCallOptions => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new LlmError("timeout", "The run exceeded its time budget.");
    return { timeoutMs: Math.min(maxMs, remaining), signal };
  };

  const runStep = async <T>(step: AgentStepId, task: () => T | Promise<T>, attempt?: number) => {
    onProgress?.({ type: "step", step, status: "started", ...(attempt && { attempt }) });
    try {
      const result = await task();
      onProgress?.({ type: "step", step, status: "completed", ...(attempt && { attempt }) });
      return result;
    } catch (error) {
      throw toAgentError(step, error);
    }
  };

  const brief = await runStep("analyze", () =>
    analyze(normalized, callOptions(ANALYZE_TIMEOUT_MS)),
  );
  const findings = await runStep("rules", () => applyRules(brief));

  let validationFeedback: string[] | undefined;
  for (let attempt = 1; attempt <= MAX_GENERATE_ATTEMPTS; attempt++) {
    const plan = await runStep(
      "generate",
      () =>
        generate(
          { input: normalized, brief, findings, validationFeedback },
          callOptions(GENERATE_TIMEOUT_MS),
        ),
      attempt,
    );
    const validation = await runStep("validate", () => validatePrepPlan(plan), attempt);
    if (validation.ok) return { plan, brief, findings };
    validationFeedback = validation.issues;
  }

  throw new AgentError("validate", INCOMPLETE_TWICE_MESSAGE, {
    cause: new Error(validationFeedback?.join(" ")),
  });
}

function normalizeInput(input: PrepInput): PrepInput {
  return {
    jobPost: input.jobPost.trim(),
    clientMessages: optionalText(input.clientMessages),
    teamExpertise: optionalText(input.teamExpertise),
    constraints: optionalText(input.constraints),
  };
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toAgentError(step: AgentStepId, error: unknown): AgentError {
  if (error instanceof AgentError) return error;
  if (error instanceof LlmError) {
    if (error.kind !== "aborted")
      console.error(`[agent] step "${step}" failed (${error.kind})`, error);
    return new AgentError(step, USER_MESSAGES[error.kind], { cause: error });
  }
  console.error(`[agent] step "${step}" failed`, error);
  return new AgentError(step, GENERIC_MESSAGE, { cause: error });
}
