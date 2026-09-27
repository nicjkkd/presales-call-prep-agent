import type { BlockContent, PhrasingContent, RootContent } from "mdast";
import { toMarkdown } from "mdast-util-to-markdown";
import { type PrepPlan, PREP_PLAN_SECTION_TITLES as T } from "@/agent/schemas/prep-plan";

type Inline = string | PhrasingContent[];

export function prepPlanToMarkdown(plan: PrepPlan): string {
  const { clientNeeds, callStrategy } = plan;
  const children: RootContent[] = [
    heading(1, "Call Prep Plan"),
    heading(2, `1. ${T.opportunitySummary}`),
    paragraph(plan.opportunitySummary),
    heading(2, `2. ${T.clientNeeds}`),
    labeled("Main need:", clientNeeds.mainNeed),
    paragraph([strong("Possible hidden needs:")]),
    list(clientNeeds.hiddenNeeds),
    heading(2, `3. ${T.discoveryQuestions}`),
    list(plan.discoveryQuestions, true),
    heading(2, `4. ${T.risks}`),
    list(plan.risks.map((risk) => [strong(risk.title), text(` — ${risk.why}`)])),
    heading(2, `5. ${T.positioning}`),
    paragraph(plan.positioning),
    heading(2, `6. ${T.solutionApproach}`),
    paragraph(plan.solutionApproach),
    heading(2, `7. ${T.callStrategy}`),
    paragraph([strong("Focus on:")]),
    list(callStrategy.focus),
    labeled("Desired outcome:", callStrategy.desiredOutcome),
    heading(2, `8. ${T.finalPrepNote}`),
    paragraph(plan.finalPrepNote),
  ];
  return toMarkdown({ type: "root", children }, { bullet: "-" });
}

function text(value: string): PhrasingContent {
  return { type: "text", value };
}

function strong(value: string): PhrasingContent {
  return { type: "strong", children: [text(value)] };
}

function paragraph(content: Inline): BlockContent {
  return { type: "paragraph", children: typeof content === "string" ? [text(content)] : content };
}

function labeled(label: string, value: string): BlockContent {
  return paragraph([strong(label), text(` ${value}`)]);
}

function heading(depth: 1 | 2, value: string): RootContent {
  return { type: "heading", depth, children: [text(value)] };
}

function list(items: Inline[], ordered = false): BlockContent {
  return {
    type: "list",
    ordered,
    spread: false,
    children: items.map((item) => ({
      type: "listItem",
      spread: false,
      children: [paragraph(item)],
    })),
  };
}
