"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { FileTextIcon, SparklesIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { PREP_INPUT_LIMITS, type PrepInput, prepInputSchema } from "@/agent/schemas/input";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_INPUTS } from "@/lib/examples";

const EMPTY_INPUT: PrepInput = {
  jobPost: "",
  clientMessages: "",
  teamExpertise: "",
  constraints: "",
};

type FieldConfig = {
  name: keyof PrepInput;
  label: string;
  description: string;
  placeholder: string;
  minHeightClass: string;
};

const FIELDS: FieldConfig[] = [
  {
    name: "jobPost",
    label: "Job post / project description",
    description: "Required. Paste the job post or describe the client's project.",
    placeholder: "Paste the Upwork job post or project description…",
    minHeightClass: "min-h-48",
  },
  {
    name: "clientMessages",
    label: "Client messages",
    description: "Optional. One or more messages from the client with additional context.",
    placeholder: "Messages exchanged with the client so far…",
    minHeightClass: "min-h-24",
  },
  {
    name: "teamExpertise",
    label: "Team expertise / tech stack",
    description: "Optional. Your team's experience, technologies, or relevant background.",
    placeholder: "e.g. 4 engineers, TypeScript and Python, built two AI content pipelines…",
    minHeightClass: "min-h-24",
  },
  {
    name: "constraints",
    label: "Constraints",
    description: "Optional. Budget, timeline, engagement model, timezone, etc.",
    placeholder: "e.g. Fixed-price pilot preferred, EET timezone…",
    minHeightClass: "min-h-20",
  },
];

const numberFormat = new Intl.NumberFormat("en-US");

type PrepFormProps = {
  isRunning: boolean;
  onSubmit: (input: PrepInput) => void;
  onClear: () => void;
  onShowSample: () => void;
};

export function PrepForm({ isRunning, onSubmit, onClear, onShowSample }: PrepFormProps) {
  const form = useForm<PrepInput>({
    resolver: zodResolver(prepInputSchema),
    defaultValues: EMPTY_INPUT,
  });

  function handleClear() {
    form.reset(EMPTY_INPUT);
    onClear();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Load example:</span>
        {EXAMPLE_INPUTS.map((example) => (
          <Button
            key={example.id}
            type="button"
            variant="outline"
            size="sm"
            disabled={isRunning}
            onClick={() => form.reset(example.input)}
          >
            <FileTextIcon aria-hidden />
            {example.label}
          </Button>
        ))}
        <Button type="button" variant="link" size="sm" disabled={isRunning} onClick={onShowSample}>
          <SparklesIcon aria-hidden />
          View sample output (no API call)
        </Button>
      </div>

      <FieldGroup>
        {FIELDS.map((config) => (
          <Controller
            key={config.name}
            name={config.name}
            control={form.control}
            render={({ field, fieldState }) => {
              const id = `prep-${config.name}`;
              const length = field.value?.length ?? 0;
              const max = PREP_INPUT_LIMITS[config.name].max;
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={id}>{config.label}</FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    id={id}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={`${id}-description`}
                    placeholder={config.placeholder}
                    disabled={isRunning}
                    className={cn("max-h-96", config.minHeightClass)}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <FieldDescription id={`${id}-description`}>
                      {config.description}
                    </FieldDescription>
                    <span
                      className={cn(
                        "shrink-0 text-muted-foreground text-xs tabular-nums",
                        length > max && "text-destructive",
                      )}
                    >
                      {numberFormat.format(length)} / {numberFormat.format(max)}
                    </span>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
          />
        ))}
      </FieldGroup>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" disabled={isRunning}>
          Generate prep plan
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isRunning}
          onClick={handleClear}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
