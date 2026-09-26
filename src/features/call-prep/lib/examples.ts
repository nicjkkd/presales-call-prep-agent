import type { PrepInput } from "@/agent/schemas/input";

export type ExampleInput = {
  id: string;
  label: string;
  input: PrepInput;
};

const SAAS_FOUNDING_ENGINEER_POST = `Founding Engineer / Senior Full-Stack Engineer (Product-Led SaaS)

Hello,
We're building a product-led SaaS platform focused on automation, operational clarity, and long-term scalability. The product itself is already fully defined at the system level — including workflows, logic, and core functionality — and we're now looking for the right technical partner to help translate that vision into a well-architected V1.
This role is for a senior, product-minded engineer who enjoys building from first principles. You'll work closely with the founder to turn a detailed product specification into a real system by shaping the architecture, defining data models and event flows, and helping execute the build. The direction is clear, but critical thinking is essential — you'll be expected to ask the right questions and help make technical decisions that will last.
You should be comfortable owning both backend and frontend decisions in a modern SaaS environment. Experience with APIs, integrations, and event-driven or async systems is important. Just as important is how you think: you care about clarity, simplicity, and building systems that are reliable and maintainable — not just "good enough to ship."
This is an early-stage role with real ownership and influence. If you're the kind of engineer who prefers building a product properly rather than rushing features or working from vague requirements, this role will feel refreshing. We're focused on long-term quality and thoughtful execution.`;

const TEXT_TO_VIDEO_PIPELINE_POST = `AI Automation Engineer – Build a Scalable Text to Video Pipeline (Documentary Style)

Overview
I'm building a system to automatically generate short, documentary-style videos (60–90 seconds) from written scripts—focused initially on true crime content with a more procedural, factual tone (less dramatic, more "detective-style").
The goal is to create a lean, automated pipeline that can eventually scale to high-volume production (50+ videos/week), but we'll start with a simple prototype first.

Phase 1 (Prototype Scope) — We'll begin with a focused pilot to validate the workflow:
- Input: 1 script (provided)
- Basic scene breakdown from script
- Image generation or selection (placeholder quality is fine)
- AI voice narration
- Simple Ken Burns-style motion (pan/zoom)
- Final vertical video output (MP4)

The goal is not perfection, but proving the end-to-end automation works.

Core Requirements (Full Vision) — Script ingestion (text input); Image generation/selection based on content; AI voice narration; Motion effects (pan/zoom/parallax); Video assembly (images + audio + text); Export to MP4

Preferred Tech (Flexible) — Python; LLM APIs (e.g., OpenAI API, Anthropic); Image generation tools (Stable Diffusion, Midjourney, etc.); Voice tools (e.g., ElevenLabs); Video tools (e.g., FFmpeg)

Key Challenges — Matching images to script context (core problem); Maintaining consistent visual style; Building a pipeline that can scale from 1 → 50+ videos/week

Future Scope — If Phase 1 is successful, we'll expand into: Batch processing (multiple scripts); Improved visual consistency and branding; Human-in-the-loop editing (for copyright and quality); Scalable production system

Ideal Candidate — Experience building AI automation pipelines; Strong Python + API integration skills; Experience with text → image/video workflows; Focus on practical, working solutions (not over-engineered systems)`;

export const EXAMPLE_INPUTS: ExampleInput[] = [
  {
    id: "saas-founding-engineer",
    label: "SaaS founding engineer",
    input: {
      jobPost: SAAS_FOUNDING_ENGINEER_POST,
      clientMessages: "",
      teamExpertise: "",
      constraints: "",
    },
  },
  {
    id: "text-to-video-pipeline",
    label: "Text-to-video pipeline",
    input: {
      jobPost: TEXT_TO_VIDEO_PIPELINE_POST,
      clientMessages: "",
      teamExpertise:
        "Node.js/TypeScript team, 4 engineers. Built two AI content pipelines (LLM + ElevenLabs + FFmpeg) and a batch media-processing service on AWS (SQS + Lambda + S3). Comfortable with Python for ML tooling.",
      constraints:
        "Fixed-price pilot preferred, 2–3 weeks for Phase 1. Team in EET (UTC+2/+3), overlap with US East mornings. Budget for the pilot not yet discussed.",
    },
  },
];
