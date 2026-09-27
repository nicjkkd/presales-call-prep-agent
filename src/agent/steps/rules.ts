import type { Brief } from "../schemas/brief";

export type RuleFindings = {
  risks: { title: string; why: string }[];
  questions: string[];
  notes: string[];
};

export function applyRules(brief: Brief): RuleFindings {
  const risks: RuleFindings["risks"] = [];
  const questions: string[] = [];
  const notes: string[] = [];

  if (!brief.budget.mentioned) {
    risks.push({
      title: "No budget stated",
      why: "The post gives no budget or rate, so there is no anchor to check whether the expected scope and quality are affordable.",
    });
    questions.push(
      "What budget range do you have in mind for this work, or how will you compare cost between proposals?",
    );
  }

  if (!brief.timeline.mentioned) {
    questions.push("What are your target dates, and what should the first milestone deliver?");
  }

  if (brief.scopeClarity === "low") {
    risks.push({
      title: "Scope is not defined enough to estimate",
      why: "The deliverables are too vague to estimate reliably; any quote given now would rest on large hidden assumptions.",
    });
    questions.push(
      "Would it work if we send a written scope summary after this call, so we agree on deliverables before estimating?",
    );
  }

  const scale = brief.scaleExpectations.trim();
  if (scale) {
    risks.push({
      title: "Gap between the initial scope and the target scale",
      why: `The client expects growth (${scale}); a design that fits the first version may not hold at that volume or cost.`,
    });
    questions.push(
      `What volume do you expect at scale (${scale}), and what cost per unit would make that viable for you?`,
    );
  }

  if (brief.engagementModel === "unclear") {
    questions.push(
      "How would you like to engage: a fixed-price project, hourly work, or a dedicated team?",
    );
  }

  if (
    brief.technicalDecisionMaker === "non-technical" ||
    brief.technicalDecisionMaker === "unknown"
  ) {
    questions.push(
      "Who on your side makes technical decisions and reviews deliverables during the project?",
    );
  }

  if (brief.techStack.length === 0) {
    questions.push(
      "Which existing systems, stack constraints, or integrations should the solution work with?",
    );
  }

  for (const item of brief.missingInformation.slice(0, 2)) {
    questions.push(`Could you clarify: ${item}?`);
  }

  const constraints = brief.constraintsSummary.trim();
  if (constraints) {
    notes.push(`Confirm each of these constraints with the client on the call: ${constraints}`);
  }

  return { risks, questions, notes };
}
