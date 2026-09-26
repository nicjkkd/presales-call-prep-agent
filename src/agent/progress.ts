export const AGENT_STEPS = [
  { id: "analyze", label: "Analyzing the request" },
  { id: "rules", label: "Checking for gaps and red flags" },
  { id: "generate", label: "Building the prep plan" },
  { id: "validate", label: "Validating the result" },
] as const;

export type AgentStepId = (typeof AGENT_STEPS)[number]["id"];

export type ProgressEvent = {
  type: "step";
  step: AgentStepId;
  status: "started" | "completed";
  attempt?: number;
};
