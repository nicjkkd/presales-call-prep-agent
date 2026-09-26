"use client";

import { CheckIcon, CopyIcon, RotateCcwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { PrepPlan } from "@/agent/schemas/prep-plan";
import { Button } from "@/components/ui/button";
import { copyText } from "../lib/clipboard";
import { prepPlanToMarkdown } from "../lib/markdown";

type CopyTarget = "markdown" | "json";

const COPIED_RESET_MS = 2000;

type ResultActionsProps = {
  plan: PrepPlan;
  onNewAnalysis: () => void;
};

export function ResultActions({ plan, onNewAnalysis }: ResultActionsProps) {
  const [copied, setCopied] = useState<CopyTarget | null>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy(target: CopyTarget) {
    const text = target === "markdown" ? prepPlanToMarkdown(plan) : JSON.stringify(plan, null, 2);
    if (await copyText(text)) setCopied(target);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => copy("markdown")}>
        {copied === "markdown" ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
        {copied === "markdown" ? "Copied" : "Copy as Markdown"}
      </Button>
      <Button variant="outline" onClick={() => copy("json")}>
        {copied === "json" ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
        {copied === "json" ? "Copied" : "Copy JSON"}
      </Button>
      <Button variant="ghost" onClick={onNewAnalysis}>
        <RotateCcwIcon aria-hidden />
        New analysis
      </Button>
    </div>
  );
}
