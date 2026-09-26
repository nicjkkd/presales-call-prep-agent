import { z } from "zod";

export const briefSchema = z.object({
  projectSummary: z.string().meta({
    description:
      "2-3 sentences stating only facts from the input: what is being built and for whom.",
  }),
  projectType: z.string().meta({
    description:
      'Short category of the project, e.g. "SaaS platform", "AI automation pipeline". "Unclear" if the post does not allow a category.',
  }),
  techStack: z.array(z.string()).meta({
    description:
      "Technologies explicitly mentioned or clearly implied by the post. Empty array if none are mentioned.",
  }),
  budget: z
    .object({
      mentioned: z
        .boolean()
        .meta({ description: "True only if the input states a budget or rate." }),
      details: z.string().meta({
        description:
          "The budget or rate as stated. Empty string if the post does not mention a budget.",
      }),
    })
    .meta({ description: "Budget information from the input." }),
  timeline: z
    .object({
      mentioned: z.boolean().meta({
        description: "True only if the input states a deadline, duration, or start date.",
      }),
      details: z.string().meta({
        description:
          "The timeline as stated. Empty string if the post does not mention a timeline.",
      }),
    })
    .meta({ description: "Timeline information from the input." }),
  engagementModel: z
    .enum(["fixed-price", "hourly", "dedicated-team", "full-time", "unclear"])
    .meta({
      description:
        'How the client wants to engage. "unclear" if the input does not say or is ambiguous.',
    }),
  scopeClarity: z.enum(["low", "medium", "high"]).meta({
    description:
      '"high" if deliverables are concrete enough to estimate, "medium" if partly defined, "low" if vague.',
  }),
  scaleExpectations: z.string().meta({
    description:
      'Expected growth in volume or users, e.g. "prototype first, then 50+ videos/week". Empty string if none.',
  }),
  technicalDecisionMaker: z
    .enum(["client-is-technical", "has-technical-contact", "non-technical", "unknown"])
    .meta({
      description:
        'Who on the client side makes technical decisions, as far as the input shows. "unknown" if it does not say.',
    }),
  missingInformation: z.array(z.string()).meta({
    description:
      'Facts a vendor needs to scope and price the work that the input does not give, as short noun phrases (e.g. "number of users at launch"). Empty array if nothing important is missing.',
  }),
  clientSignals: z.array(z.string()).meta({
    description:
      "Tone, priorities, and concerns visible in the post and client messages. Empty array if none.",
  }),
  constraintsSummary: z.string().meta({
    description:
      "The user-provided constraints restated briefly. Empty string if no constraints were provided.",
  }),
});

export type Brief = z.infer<typeof briefSchema>;
