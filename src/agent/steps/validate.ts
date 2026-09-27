import type { PrepPlan } from "../schemas/prep-plan";

export function validatePrepPlan(plan: PrepPlan): string[] {
  const issues: string[] = [];
  const questions = plan.discoveryQuestions.length;
  const risks = plan.risks.length;

  if (questions < 5 || questions > 7) {
    issues.push(`discoveryQuestions has ${questions} items; it must have 5 to 7.`);
  }
  if (risks < 3 || risks > 5) {
    issues.push(`risks has ${risks} items; it must have 3 to 5.`);
  }
  if (plan.clientNeeds.hiddenNeeds.length < 1) {
    issues.push("clientNeeds.hiddenNeeds is empty; list at least 1 hidden need.");
  }
  if (plan.callStrategy.focus.length < 2) {
    issues.push("callStrategy.focus has fewer than 2 items; list at least 2.");
  }

  const normalized = plan.discoveryQuestions.map((question) => question.trim().toLowerCase());
  if (new Set(normalized).size !== normalized.length) {
    issues.push("discoveryQuestions contains duplicates; every question must be different.");
  }

  for (const path of emptyStringPaths(plan)) {
    issues.push(`${path} is empty; write meaningful content.`);
  }

  return issues;
}

function emptyStringPaths(value: unknown, path = ""): string[] {
  if (typeof value === "string") return value.trim() ? [] : [path];
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    emptyStringPaths(child, path ? `${path}.${key}` : key),
  );
}
