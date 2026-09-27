# Input: Text-to-video pipeline

## Job post / project description

AI Automation Engineer – Build a Scalable Text to Video Pipeline (Documentary Style)

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

Ideal Candidate — Experience building AI automation pipelines; Strong Python + API integration skills; Experience with text → image/video workflows; Focus on practical, working solutions (not over-engineered systems)

## Client messages

none

## Team expertise / tech stack

Node.js/TypeScript team, 4 engineers. Built two AI content pipelines (LLM + ElevenLabs + FFmpeg) and a batch media-processing service on AWS (SQS + Lambda + S3). Comfortable with Python for ML tooling.

## Constraints

Fixed-price pilot preferred, 2–3 weeks for Phase 1. Team in EET (UTC+2/+3), overlap with US East mornings. Budget for the pilot not yet discussed.
