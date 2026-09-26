"use client";

import { CircleCheckIcon, CircleIcon, CircleXIcon, LoaderCircleIcon } from "lucide-react";
import { AGENT_STEPS, type AgentStepId } from "@/agent/progress";
import { cn } from "@/lib/utils";
import type { PrepPlanStatus } from "../hooks/use-prep-plan";

type StepState = "pending" | "active" | "done" | "failed";

type StepProgressProps = {
  status: PrepPlanStatus;
  currentStep: AgentStepId | null;
  completedSteps: AgentStepId[];
  attempt: number;
};

export function StepProgress({ status, currentStep, completedSteps, attempt }: StepProgressProps) {
  return (
    <ol aria-live="polite" className="flex flex-col gap-2">
      {AGENT_STEPS.map((step) => {
        const state = getStepState(step.id, status, currentStep, completedSteps);
        return (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-2 text-sm",
              state === "pending" && "text-muted-foreground",
              state === "failed" && "text-destructive",
            )}
          >
            <StepIcon state={state} />
            <span className={cn(state === "active" && "font-medium")}>{step.label}</span>
            {state !== "pending" && attempt > 1 && isRetriedStep(step.id) && (
              <span className="text-muted-foreground text-xs">(attempt {attempt})</span>
            )}
            <span className="sr-only">— {state}</span>
          </li>
        );
      })}
    </ol>
  );
}

function StepIcon({ state }: { state: StepState }) {
  const className = "size-4 shrink-0";
  switch (state) {
    case "active":
      return <LoaderCircleIcon aria-hidden className={cn(className, "animate-spin")} />;
    case "done":
      return <CircleCheckIcon aria-hidden className={cn(className, "text-emerald-600")} />;
    case "failed":
      return <CircleXIcon aria-hidden className={className} />;
    default:
      return <CircleIcon aria-hidden className={className} />;
  }
}

function getStepState(
  id: AgentStepId,
  status: PrepPlanStatus,
  currentStep: AgentStepId | null,
  completedSteps: AgentStepId[],
): StepState {
  if (id === currentStep) return status === "error" ? "failed" : "active";
  if (completedSteps.includes(id)) return "done";
  return "pending";
}

/** Only generate and validate run again when validation fails. */
function isRetriedStep(id: AgentStepId): boolean {
  return id === "generate" || id === "validate";
}
