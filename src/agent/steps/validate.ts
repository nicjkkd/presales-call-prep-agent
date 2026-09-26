import type { PrepPlan } from "../schemas/prep-plan";

type ValidationResult = { ok: true } | { ok: false; issues: string[] };

const QUESTIONS = { min: 5, max: 7 };
const RISKS = { min: 3, max: 5 };
const MIN_HIDDEN_NEEDS = 1;
const MIN_FOCUS_POINTS = 2;

export function validatePrepPlan(plan: PrepPlan): ValidationResult {
  const issues = [
    ...checkCount("discoveryQuestions", plan.discoveryQuestions.length, QUESTIONS),
    ...checkCount("risks", plan.risks.length, RISKS),
    ...checkCount("clientNeeds.hiddenNeeds", plan.clientNeeds.hiddenNeeds.length, {
      min: MIN_HIDDEN_NEEDS,
    }),
    ...checkCount("callStrategy.focus", plan.callStrategy.focus.length, { min: MIN_FOCUS_POINTS }),
    ...findEmptyStrings(plan).map((path) => `${path} is empty; write meaningful content.`),
    ...findDuplicateQuestions(plan.discoveryQuestions),
  ];
  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}

function checkCount(field: string, count: number, range: { min: number; max?: number }): string[] {
  if (count < range.min || (range.max !== undefined && count > range.max)) {
    const expected =
      range.max === undefined ? `at least ${range.min}` : `${range.min} to ${range.max}`;
    return [`${field} has ${count} items; it must have ${expected}.`];
  }
  return [];
}

function findEmptyStrings(value: unknown, path = ""): string[] {
  if (typeof value === "string") return value.trim() === "" ? [path] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findEmptyStrings(item, `${path}[${index}]`));
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, item]) =>
      findEmptyStrings(item, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

function findDuplicateQuestions(questions: string[]): string[] {
  const seen = new Set<string>();
  const issues: string[] = [];
  for (const question of questions) {
    const key = question.trim().toLowerCase();
    if (seen.has(key))
      issues.push(`discoveryQuestions contains a duplicate: "${question.trim()}".`);
    seen.add(key);
  }
  return issues;
}
