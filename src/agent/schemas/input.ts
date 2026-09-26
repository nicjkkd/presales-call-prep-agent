import { z } from "zod";

/** Character limits shared by the schema, the form counters, and the API. */
export const PREP_INPUT_LIMITS = {
  jobPost: { min: 50, max: 15_000 },
  clientMessages: { max: 8_000 },
  teamExpertise: { max: 5_000 },
  constraints: { max: 3_000 },
} as const;

export const prepInputSchema = z.object({
  jobPost: z
    .string()
    .trim()
    .min(
      PREP_INPUT_LIMITS.jobPost.min,
      `The job post must be at least ${PREP_INPUT_LIMITS.jobPost.min} characters.`,
    )
    .max(
      PREP_INPUT_LIMITS.jobPost.max,
      `The job post must be at most ${PREP_INPUT_LIMITS.jobPost.max} characters.`,
    ),
  clientMessages: z.string().trim().max(PREP_INPUT_LIMITS.clientMessages.max).optional(),
  teamExpertise: z.string().trim().max(PREP_INPUT_LIMITS.teamExpertise.max).optional(),
  constraints: z.string().trim().max(PREP_INPUT_LIMITS.constraints.max).optional(),
});

/** Optional fields may be `""`; the agent treats an empty string as "not provided". */
export type PrepInput = z.infer<typeof prepInputSchema>;
