import { type PrepPlan, PREP_PLAN_SECTION_TITLES as T } from "@/agent/schemas/prep-plan";

export function prepPlanToMarkdown(plan: PrepPlan): string {
  const sections = [
    [T.opportunitySummary, plan.opportunitySummary],
    [
      T.clientNeeds,
      [
        `**Main need:** ${plan.clientNeeds.mainNeed}`,
        "**Possible hidden needs:**",
        bullets(plan.clientNeeds.hiddenNeeds),
      ].join("\n\n"),
    ],
    [T.discoveryQuestions, plan.discoveryQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")],
    [T.risks, bullets(plan.risks.map((r) => `**${r.title}** — ${r.why}`))],
    [T.positioning, plan.positioning],
    [T.solutionApproach, plan.solutionApproach],
    [
      T.callStrategy,
      [
        "**Focus on:**",
        bullets(plan.callStrategy.focus),
        `**Desired outcome:** ${plan.callStrategy.desiredOutcome}`,
      ].join("\n\n"),
    ],
    [T.finalPrepNote, plan.finalPrepNote],
  ];

  const body = sections.map(([title, content], i) => `## ${i + 1}. ${title}\n\n${content}`);
  return `# Call Prep Plan\n\n${body.join("\n\n")}\n`;
}

function bullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}
