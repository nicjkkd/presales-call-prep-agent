"use client";

import { FileTextIcon, SparklesIcon } from "lucide-react";
import type { PrepInput } from "@/agent/schemas/input";
import { Button } from "@/components/ui/button";
import { EXAMPLE_INPUTS } from "../lib/examples";

type ExampleButtonsProps = {
  disabled: boolean;
  onLoad: (input: PrepInput) => void;
  onShowSample: () => void;
};

export function ExampleButtons({ disabled, onLoad, onShowSample }: ExampleButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm">Load example:</span>
      {EXAMPLE_INPUTS.map((example) => (
        <Button
          key={example.id}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onLoad(example.input)}
        >
          <FileTextIcon aria-hidden />
          {example.label}
        </Button>
      ))}
      <Button type="button" variant="link" size="sm" disabled={disabled} onClick={onShowSample}>
        <SparklesIcon aria-hidden />
        View sample output (no API call)
      </Button>
    </div>
  );
}
