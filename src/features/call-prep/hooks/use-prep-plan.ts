"use client";

import { useCallback, useRef, useState } from "react";
import { AGENT_STEPS, type AgentStepId } from "@/agent/progress";
import type { PrepInput } from "@/agent/schemas/input";
import type { PrepPlan } from "@/agent/schemas/prep-plan";
import { SAMPLE_PREP_PLAN } from "../lib/fixtures/sample-prep-plan";

export type PrepPlanStatus = "idle" | "running" | "success" | "error";

export type PrepPlanResultView = { plan: PrepPlan; brief?: unknown };

type PrepPlanState = {
  status: PrepPlanStatus;
  currentStep: AgentStepId | null;
  completedSteps: AgentStepId[];
  attempt: number;
  result: PrepPlanResultView | null;
  error: string | null;
};

const INITIAL_STATE: PrepPlanState = {
  status: "idle",
  currentStep: null,
  completedSteps: [],
  attempt: 1,
  result: null,
  error: null,
};

const FAKE_STEP_DELAY_MS = 600;

export function usePrepPlan() {
  const [state, setState] = useState<PrepPlanState>(INITIAL_STATE);
  const runIdRef = useRef(0);

  const run = useCallback(async (_input: PrepInput) => {
    const runId = ++runIdRef.current;
    setState({ ...INITIAL_STATE, status: "running" });

    for (const step of AGENT_STEPS) {
      setState((s) => ({ ...s, currentStep: step.id }));
      await delay(FAKE_STEP_DELAY_MS);
      if (runIdRef.current !== runId) return;
      setState((s) => ({ ...s, completedSteps: [...s.completedSteps, step.id] }));
    }

    setState((s) => ({
      ...s,
      status: "success",
      currentStep: null,
      result: { plan: SAMPLE_PREP_PLAN },
    }));
  }, []);

  const cancel = useCallback(() => {
    runIdRef.current++;
    setState(INITIAL_STATE);
  }, []);

  const reset = useCallback(() => {
    runIdRef.current++;
    setState(INITIAL_STATE);
  }, []);

  const showSample = useCallback(() => {
    runIdRef.current++;
    setState({ ...INITIAL_STATE, status: "success", result: { plan: SAMPLE_PREP_PLAN } });
  }, []);

  return { ...state, run, cancel, reset, showSample };
}

export type UsePrepPlan = ReturnType<typeof usePrepPlan>;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
