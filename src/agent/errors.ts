import type { AgentStepId } from "./progress";

export class AgentError extends Error {
  readonly step: AgentStepId;
  readonly userMessage: string;

  constructor(step: AgentStepId, userMessage: string, options: { cause?: unknown } = {}) {
    super(`Agent step "${step}" failed: ${userMessage}`, { cause: options.cause });
    this.name = "AgentError";
    this.step = step;
    this.userMessage = userMessage;
  }
}
