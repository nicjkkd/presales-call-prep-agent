import { z } from "zod";

export const prepPlanSchema = z.object({
  opportunitySummary: z.string().meta({
    description: "Short overview (2-4 sentences) of what the client is looking for.",
  }),
  clientNeeds: z
    .object({
      mainNeed: z
        .string()
        .meta({ description: "The client's primary need, in one or two sentences." }),
      hiddenNeeds: z.array(z.string()).meta({
        description: "Possible needs the client has not stated explicitly, inferred from the post.",
      }),
    })
    .meta({ description: "Client needs breakdown: the main need and possible hidden needs." }),
  discoveryQuestions: z.array(z.string()).meta({
    description: "5 to 7 questions, each specific to this job post",
  }),
  risks: z
    .array(
      z.object({
        title: z.string().meta({ description: "Short name of the risk or red flag." }),
        why: z.string().meta({ description: "Why this is a risk for this specific client." }),
      }),
    )
    .meta({ description: "3 to 5 risks" }),
  positioning: z.string().meta({
    description: "How to present the team, its expertise, and its approach to this client.",
  }),
  solutionApproach: z.string().meta({
    description: "High-level idea of how the problem could be solved.",
  }),
  callStrategy: z
    .object({
      focus: z.array(z.string()).meta({ description: "What to focus on during the call." }),
      desiredOutcome: z.string().meta({ description: "The desired outcome of the call." }),
    })
    .meta({ description: "Call strategy: focus points and the desired outcome." }),
  finalPrepNote: z.string().meta({
    description: "Short summary with the key focus points to review right before the call.",
  }),
});

export type PrepPlan = z.infer<typeof prepPlanSchema>;
