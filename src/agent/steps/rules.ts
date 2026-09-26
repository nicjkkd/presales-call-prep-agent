import type { Brief } from "../schemas/brief";

type RuleRisk = { title: string; why: string };

export type RuleFindings = {
  risks: RuleRisk[];
  questions: string[];
  notes: string[];
};

type Rule = (brief: Brief) => Partial<RuleFindings> | null;

const MAX_MISSING_INFO_QUESTIONS = 2;

const noBudget: Rule = (brief) =>
  brief.budget.mentioned
    ? null
    : {
        risks: [
          {
            title: "No budget stated",
            why: "The post gives no budget or rate, so there is no anchor to check whether the expected scope and quality are affordable.",
          },
        ],
        questions: [
          "What budget range do you have in mind for this work, or how will you compare cost between proposals?",
        ],
      };

const noTimeline: Rule = (brief) =>
  brief.timeline.mentioned
    ? null
    : { questions: ["What are your target dates, and what should the first milestone deliver?"] };

const lowScopeClarity: Rule = (brief) =>
  brief.scopeClarity !== "low"
    ? null
    : {
        risks: [
          {
            title: "Scope is not defined enough to estimate",
            why: "The deliverables are too vague to estimate reliably; any quote given now would rest on large hidden assumptions.",
          },
        ],
        questions: [
          "Would it work if we send a written scope summary after this call, so we agree on deliverables before estimating?",
        ],
      };

const scaleGap: Rule = (brief) => {
  const scale = brief.scaleExpectations.trim();
  if (!scale) return null;
  return {
    risks: [
      {
        title: "Gap between the initial scope and the target scale",
        why: `The client expects growth (${scale}); a design that fits the first version may not hold at that volume or cost.`,
      },
    ],
    questions: [
      `What volume do you expect at scale (${scale}), and what cost per unit would make that viable for you?`,
    ],
  };
};

const unclearEngagement: Rule = (brief) =>
  brief.engagementModel !== "unclear"
    ? null
    : {
        questions: [
          "How would you like to engage: a fixed-price project, hourly work, or a dedicated team?",
        ],
      };

const noTechnicalDecisionMaker: Rule = (brief) =>
  brief.technicalDecisionMaker === "non-technical" || brief.technicalDecisionMaker === "unknown"
    ? {
        questions: [
          "Who on your side makes technical decisions and reviews deliverables during the project?",
        ],
      }
    : null;

const noTechStack: Rule = (brief) =>
  brief.techStack.length > 0
    ? null
    : {
        questions: [
          "Which existing systems, stack constraints, or integrations should the solution work with?",
        ],
      };

const missingInformation: Rule = (brief) => {
  const items = brief.missingInformation
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_MISSING_INFO_QUESTIONS);
  if (items.length === 0) return null;
  return { questions: items.map((item) => `Could you clarify the ${toPhrase(item)}?`) };
};

const constraintsToConfirm: Rule = (brief) => {
  const constraints = brief.constraintsSummary.trim();
  if (!constraints) return null;
  return {
    notes: [`Confirm each of these constraints with the client on the call: ${constraints}`],
  };
};

const RULES: Rule[] = [
  noBudget,
  noTimeline,
  lowScopeClarity,
  scaleGap,
  unclearEngagement,
  noTechnicalDecisionMaker,
  noTechStack,
  missingInformation,
  constraintsToConfirm,
];

export function applyRules(brief: Brief): RuleFindings {
  const findings: RuleFindings = { risks: [], questions: [], notes: [] };
  for (const rule of RULES) {
    const result = rule(brief);
    if (!result) continue;
    findings.risks.push(...(result.risks ?? []));
    findings.questions.push(...(result.questions ?? []));
    findings.notes.push(...(result.notes ?? []));
  }
  return findings;
}

function toPhrase(item: string): string {
  const withoutPeriod = item.replace(/[.?!]+$/, "");
  const startsWithAcronym = /^[A-Z]{2}/.test(withoutPeriod);
  return startsWithAcronym
    ? withoutPeriod
    : withoutPeriod.charAt(0).toLowerCase() + withoutPeriod.slice(1);
}
