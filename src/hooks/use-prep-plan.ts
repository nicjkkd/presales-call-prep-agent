"use client";

import axios from "axios";
import { useRef, useState } from "react";
import type { Brief } from "@/agent/schemas/brief";
import type { PrepInput } from "@/agent/schemas/input";
import type { PrepPlan } from "@/agent/schemas/prep-plan";
import { SAMPLE_PREP_PLAN } from "@/lib/sample-prep-plan";

type Status = "idle" | "running" | "success" | "error";
type Result = { plan: PrepPlan; brief?: Brief };

export function usePrepPlan() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  async function run(input: PrepInput) {
    controllerRef.current = new AbortController();
    setStatus("running");
    setResult(null);
    setError(null);

    try {
      const { data } = await axios.post<Result>("/api/prep-plans", input, {
        signal: controllerRef.current.signal,
      });
      setResult(data);
      setStatus("success");
    } catch (err) {
      if (axios.isCancel(err)) {
        setStatus("idle");
        return;
      }
      setError("Something went wrong while generating the plan. Please try again.");
      setStatus("error");
    }
  }

  function cancel() {
    controllerRef.current?.abort();
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  function showSample() {
    setResult({ plan: SAMPLE_PREP_PLAN });
    setError(null);
    setStatus("success");
  }

  return { status, result, error, run, cancel, reset, showSample };
}
