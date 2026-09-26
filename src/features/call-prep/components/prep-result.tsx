"use client";

import { ChevronDownIcon } from "lucide-react";
import { PREP_PLAN_SECTION_TITLES as T } from "@/agent/schemas/prep-plan";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { PrepPlanResultView } from "../hooks/use-prep-plan";
import { ResultSection } from "./result-section";

export function PrepResult({ result }: { result: PrepPlanResultView }) {
  const { plan, brief } = result;

  return (
    <div className="flex flex-col gap-4">
      <ResultSection index={1} title={T.opportunitySummary}>
        <p>{plan.opportunitySummary}</p>
      </ResultSection>

      <ResultSection index={2} title={T.clientNeeds}>
        <p>
          <span className="font-medium">Main need:</span> {plan.clientNeeds.mainNeed}
        </p>
        <div>
          <p className="font-medium">Possible hidden needs:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {plan.clientNeeds.hiddenNeeds.map((need) => (
              <li key={need}>{need}</li>
            ))}
          </ul>
        </div>
      </ResultSection>

      <ResultSection
        index={3}
        title={T.discoveryQuestions}
        action={<CountBadge count={plan.discoveryQuestions.length} noun="question" />}
      >
        <ol className="list-decimal space-y-2 pl-5">
          {plan.discoveryQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </ResultSection>

      <ResultSection
        index={4}
        title={T.risks}
        action={<CountBadge count={plan.risks.length} noun="risk" />}
      >
        <ul className="space-y-3">
          {plan.risks.map((risk) => (
            <li key={risk.title}>
              <p className="font-medium">{risk.title}</p>
              <p className="text-muted-foreground">{risk.why}</p>
            </li>
          ))}
        </ul>
      </ResultSection>

      <ResultSection index={5} title={T.positioning}>
        <p>{plan.positioning}</p>
      </ResultSection>

      <ResultSection index={6} title={T.solutionApproach}>
        <p>{plan.solutionApproach}</p>
      </ResultSection>

      <ResultSection index={7} title={T.callStrategy}>
        <div>
          <p className="font-medium">Focus on:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {plan.callStrategy.focus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p>
          <span className="font-medium">Desired outcome:</span> {plan.callStrategy.desiredOutcome}
        </p>
      </ResultSection>

      <ResultSection index={8} title={T.finalPrepNote}>
        <p>{plan.finalPrepNote}</p>
      </ResultSection>

      {brief !== undefined && (
        <Collapsible className="rounded-xl ring-1 ring-foreground/10">
          <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-3 font-medium text-sm">
            Intermediate brief (step 1 output)
            <ChevronDownIcon
              aria-hidden
              className="size-4 transition-transform group-data-panel-open:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="overflow-x-auto border-t px-4 py-3 text-xs">
              {JSON.stringify(brief, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function CountBadge({ count, noun }: { count: number; noun: string }) {
  return <Badge variant="secondary">{`${count} ${noun}${count === 1 ? "" : "s"}`}</Badge>;
}
