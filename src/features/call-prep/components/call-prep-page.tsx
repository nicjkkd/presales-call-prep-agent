"use client";

import { CircleXIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PrepInput } from "@/agent/schemas/input";
import { Button } from "@/components/ui/button";
import { usePrepPlan } from "../hooks/use-prep-plan";
import { PrepForm } from "./prep-form";
import { PrepResult } from "./prep-result";
import { ResultActions } from "./result-actions";
import { StepProgress } from "./step-progress";

export function CallPrepPage() {
  const prep = usePrepPlan();
  const [lastInput, setLastInput] = useState<PrepInput | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  const isRunning = prep.status === "running";

  useEffect(() => {
    if (prep.status === "success") {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [prep.status]);

  function handleSubmit(input: PrepInput) {
    setLastInput(input);
    void prep.run(input);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
          Presales Call Prep Agent
        </h1>
        <p className="text-muted-foreground">
          Paste a job post or project description and get a structured prep plan for your discovery
          call: needs, questions, risks, positioning, and call strategy.
        </p>
      </header>

      <PrepForm
        isRunning={isRunning}
        onSubmit={handleSubmit}
        onClear={prep.reset}
        onShowSample={prep.showSample}
      />

      {(isRunning || prep.status === "error") && (
        <section
          aria-label="Agent progress"
          className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-foreground/10"
        >
          <StepProgress
            status={prep.status}
            currentStep={prep.currentStep}
            completedSteps={prep.completedSteps}
            attempt={prep.attempt}
          />
          {isRunning && (
            <Button variant="outline" size="sm" className="self-start" onClick={prep.cancel}>
              Cancel
            </Button>
          )}
          {prep.status === "error" && (
            <div role="alert" className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-destructive text-sm">
                <CircleXIcon aria-hidden className="size-4 shrink-0" />
                {prep.error ?? "Something went wrong."}
              </p>
              {lastInput && (
                <Button size="sm" className="self-start" onClick={() => prep.run(lastInput)}>
                  Try again
                </Button>
              )}
            </div>
          )}
        </section>
      )}

      {prep.status === "success" && prep.result && (
        <section ref={resultRef} aria-label="Prep plan" className="flex scroll-mt-4 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-xl">Call Prep Plan</h2>
            <ResultActions plan={prep.result.plan} onNewAnalysis={prep.reset} />
          </div>
          <PrepResult result={prep.result} />
        </section>
      )}
    </main>
  );
}
