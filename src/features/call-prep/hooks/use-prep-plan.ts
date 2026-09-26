"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  AGENT_STEPS,
  type AgentStepId,
  agentStepIdSchema,
  type ProgressEvent,
  progressEventSchema,
} from "@/agent/progress";
import type { PrepInput } from "@/agent/schemas/input";
import { type PrepPlan, prepPlanSchema } from "@/agent/schemas/prep-plan";
import { SAMPLE_PREP_PLAN } from "../lib/fixtures/sample-prep-plan";
import { parseSseStream } from "../lib/sse";

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

const ENDPOINT = "/api/prep-plans";

const MESSAGES = {
  network: "Could not reach the server. Check your connection and try again.",
  unexpected: "The server sent an unexpected response. Please try again.",
  closedEarly: "The connection closed before the plan was ready. Please try again.",
};

const resultEventSchema = z.object({ plan: prepPlanSchema, brief: z.unknown() });
const errorEventSchema = z.object({ message: z.string(), step: agentStepIdSchema.optional() });
const errorResponseSchema = z.object({ error: z.string() });

type SseOutcome = { done: false } | { done: true; state: Partial<PrepPlanState> };

export function usePrepPlan() {
  const [state, setState] = useState<PrepPlanState>(INITIAL_STATE);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(async (input: PrepInput) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const isCurrent = () => controllerRef.current === controller && !controller.signal.aborted;
    const fail = (error: string) => {
      if (isCurrent()) setState((s) => ({ ...s, status: "error", error }));
    };

    setState({ ...INITIAL_STATE, status: "running" });

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        fail(await readErrorMessage(response));
        return;
      }

      for await (const message of parseSseStream(response.body.getReader())) {
        if (!isCurrent()) return;
        const outcome = handleSseMessage(message.event, message.data, setState);
        if (outcome.done) {
          setState((s) => ({ ...s, ...outcome.state }));
          return;
        }
      }
      fail(MESSAGES.closedEarly);
    } catch {
      fail(MESSAGES.network);
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  const showSample = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState({ ...INITIAL_STATE, status: "success", result: { plan: SAMPLE_PREP_PLAN } });
  }, []);

  return { ...state, run, cancel, reset, showSample };
}

function handleSseMessage(
  event: string,
  data: string,
  setState: (update: (s: PrepPlanState) => PrepPlanState) => void,
): SseOutcome {
  const payload = parseJson(data);

  if (event === "progress") {
    const parsed = progressEventSchema.safeParse(payload);
    if (!parsed.success) return { done: true, state: errorState(MESSAGES.unexpected) };
    setState((s) => applyProgress(s, parsed.data));
    return { done: false };
  }

  if (event === "result") {
    const parsed = resultEventSchema.safeParse(payload);
    if (!parsed.success) return { done: true, state: errorState(MESSAGES.unexpected) };
    return {
      done: true,
      state: { status: "success", currentStep: null, result: parsed.data, error: null },
    };
  }

  if (event === "error") {
    const parsed = errorEventSchema.safeParse(payload);
    if (!parsed.success) return { done: true, state: errorState(MESSAGES.unexpected) };
    return { done: true, state: errorState(parsed.data.message, parsed.data.step) };
  }

  return { done: false };
}

function applyProgress(state: PrepPlanState, event: ProgressEvent): PrepPlanState {
  if (event.status === "started") {
    const stepIndex = AGENT_STEPS.findIndex((step) => step.id === event.step);
    const stepsFromHere = new Set(AGENT_STEPS.slice(stepIndex).map((step) => step.id));
    return {
      ...state,
      currentStep: event.step,
      attempt: event.attempt ?? state.attempt,
      completedSteps: state.completedSteps.filter((id) => !stepsFromHere.has(id)),
    };
  }
  return {
    ...state,
    currentStep: state.currentStep === event.step ? null : state.currentStep,
    completedSteps: state.completedSteps.includes(event.step)
      ? state.completedSteps
      : [...state.completedSteps, event.step],
  };
}

function errorState(error: string, step?: AgentStepId): Partial<PrepPlanState> {
  return { status: "error", error, ...(step && { currentStep: step }) };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const parsed = errorResponseSchema.safeParse(await response.json().catch(() => undefined));
  return parsed.success ? parsed.data.error : `Request failed with status ${response.status}.`;
}
