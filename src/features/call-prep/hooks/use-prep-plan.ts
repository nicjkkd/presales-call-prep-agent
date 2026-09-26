"use client";

import axios from "axios";
import { useRef, useState } from "react";
import type { PrepPlanResult } from "@/agent";
import type { PrepInput } from "@/agent/schemas/input";
import type { PrepPlan } from "@/agent/schemas/prep-plan";
import { SAMPLE_PREP_PLAN } from "../lib/fixtures/sample-prep-plan";

export type PrepPlanStatus = "idle" | "running" | "success" | "error";

export type PrepPlanResultView = { plan: PrepPlan; brief?: unknown };

export function usePrepPlan() {
  const [status, setStatus] = useState<PrepPlanStatus>("idle");
  const [result, setResult] = useState<PrepPlanResultView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  async function run(input: PrepInput) {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus("running");
    setResult(null);
    setError(null);

    try {
      const { data } = await axios.post<PrepPlanResult>("/api/prep-plans", input, {
        signal: controller.signal,
      });
      setResult(data);
      setStatus("success");
    } catch (err) {
      if (axios.isCancel(err)) return;
      setError("Something went wrong while generating the plan. Please try again.");
      setStatus("error");
    }
  }

  function reset() {
    controllerRef.current?.abort();
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  function showSample() {
    controllerRef.current?.abort();
    setResult({ plan: SAMPLE_PREP_PLAN });
    setError(null);
    setStatus("success");
  }

  return { status, result, error, run, reset, showSample };
}
