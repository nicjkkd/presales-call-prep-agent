import { z } from "zod";

export const PREP_INPUT_LIMITS = {
  jobPost: { min: 50, max: 15_000 },
  clientMessages: { max: 8_000 },
  teamExpertise: { max: 5_000 },
  constraints: { max: 3_000 },
} as const;

const formatCount = (value: number) => value.toLocaleString("en-US");

const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${formatCount(max)} characters.`)
    .optional();

export const prepInputSchema = z.object({
  jobPost: z
    .string()
    .trim()
    .min(
      PREP_INPUT_LIMITS.jobPost.min,
      `The job post must be at least ${formatCount(PREP_INPUT_LIMITS.jobPost.min)} characters.`,
    )
    .max(
      PREP_INPUT_LIMITS.jobPost.max,
      `The job post must be at most ${formatCount(PREP_INPUT_LIMITS.jobPost.max)} characters.`,
    ),
  clientMessages: optionalText("Client messages", PREP_INPUT_LIMITS.clientMessages.max),
  teamExpertise: optionalText("Team expertise", PREP_INPUT_LIMITS.teamExpertise.max),
  constraints: optionalText("Constraints", PREP_INPUT_LIMITS.constraints.max),
});

export type PrepInput = z.infer<typeof prepInputSchema>;
