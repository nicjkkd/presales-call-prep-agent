import type { PrepPlan } from "@/agent/schemas/prep-plan";

export const SAMPLE_PREP_PLAN: PrepPlan = {
  opportunitySummary:
    "A non-engineering founder has a fully specified product-led SaaS for automation and operational clarity and needs a senior full-stack partner to turn that specification into a well-architected V1. The work covers architecture, data models, event flows, integrations, and hands-on build, with long-term maintainability valued over shipping speed.",
  clientNeeds: {
    mainNeed:
      "A senior engineer who can own the V1 architecture end to end (data model, event-driven backend, frontend) and translate a detailed product spec into a reliable, maintainable system.",
    hiddenNeeds: [
      "A technical counterpart to challenge the spec: the founder expects pushback and questions, not just execution.",
      "Architecture that will survive the next hires, with documentation and conventions a future team can follow.",
      "Confidence that 'fully defined at the system level' translates into realistic V1 scope and sequencing.",
      "A long-term relationship: the 'founding engineer' framing suggests they may want ongoing ownership, not a one-off build.",
    ],
  },
  discoveryQuestions: [
    "Can you walk us through the product specification: what format is it in, and which workflows are the must-haves for V1 versus later?",
    "Which external systems does V1 need to integrate with on day one, and do any of them push events (webhooks) that the platform must react to?",
    "Where do you expect asynchronous or event-driven behaviour to matter most — long-running automations, scheduled jobs, or third-party callbacks?",
    "Is this engagement a fixed V1 build, an ongoing hourly partnership, or a path toward a full-time founding-engineer role?",
    "What does a successful V1 look like for you in concrete terms: first paying customers, a design-partner pilot, or an internal demo?",
    "Are there constraints on stack, hosting, or data residency we should design around, or is the technical direction fully open?",
    "Who else will review technical decisions and code, and how do you prefer to make and record architecture decisions together?",
  ],
  risks: [
    {
      title: "Engagement model is unclear",
      why: "The post reads like a full-time hire ('founding engineer', 'early-stage role') but is posted as a project; a mismatch on commitment, equity expectations, or hourly versus fixed price can derail the deal late.",
    },
    {
      title: "Spec may be detailed but not buildable as-is",
      why: "'Fully defined at the system level' often means workflows and logic are clear while data ownership, edge cases, and failure handling are not; estimating from the spec alone risks under-scoping V1.",
    },
    {
      title: "No budget or timeline stated",
      why: "The client emphasises quality over speed but gives no budget or dates, so there is no anchor to judge whether 'properly built' V1 expectations match what they can fund.",
    },
    {
      title: "High expectations of ownership and judgment",
      why: "The founder wants someone who 'asks the right questions' and makes decisions 'that will last'; a proposal that only lists technologies will be judged as execution-only and screened out.",
    },
  ],
  positioning:
    "Present the team as a product-minded engineering partner rather than a pair of hands: lead with how the team turns specifications into architecture (domain modelling, event design, decision records) and show one example where challenging a spec early saved rework. Emphasise ownership of both backend and frontend, experience with integrations and async systems, and a bias for simple, maintainable designs over clever ones.",
  solutionApproach:
    "Start with a short paid discovery phase: review the specification together, derive the core domain model and event catalogue, and agree on V1 boundaries in a written scope. Build V1 as a modular monolith with a clear domain layer, a relational database, and a job/event queue for async workflows and integrations, so services can be split later only if needed. Deliver in thin vertical slices (one workflow end to end at a time) with architecture decision records and CI from the first week.",
  callStrategy: {
    focus: [
      "Understand the spec's depth: ask to see it and identify which workflows define V1.",
      "Clarify the engagement model, budget range, and expected time commitment early.",
      "Demonstrate judgment by asking one or two sharp architecture questions about events and integrations.",
      "Agree on how technical decisions will be made and documented with the founder.",
    ],
    desiredOutcome:
      "The founder shares the specification and agrees to a paid discovery phase that ends with a written V1 scope, architecture outline, and estimate.",
  },
  finalPrepNote:
    "This founder is buying judgment, not hours. Come prepared to ask about the spec, integrations, and async needs; pin down the engagement model and budget; and steer toward a paid discovery phase that produces a written V1 scope before any fixed estimate.",
};
