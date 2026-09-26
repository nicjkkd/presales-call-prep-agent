import { z } from "zod";

export const AGENT_STEPS = [
  { id: "analyze", label: "Analyzing the request" },
  { id: "rules", label: "Checking for gaps and red flags" },
  { id: "generate", label: "Building the prep plan" },
  { id: "validate", label: "Validating the result" },
] as const;

export type AgentStepId = (typeof AGENT_STEPS)[number]["id"];

export const agentStepIdSchema = z.enum(AGENT_STEPS.map((step) => step.id));

export const progressEventSchema = z.object({
  type: z.literal("step"),
  step: agentStepIdSchema,
  status: z.enum(["started", "completed"]),
  attempt: z.number().int().positive().optional(),
});

export type ProgressEvent = z.infer<typeof progressEventSchema>;
