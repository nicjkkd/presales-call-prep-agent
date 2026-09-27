# Presales Call Prep AI Agent

Turns a job post or project description into a structured prep plan for a presales discovery call.

- **Live demo:** [Vercel URL](https://presales-call-prep-agent.vercel.app/)
- **Examples:** [`examples/`](examples/)

## What it does

Input:

| Field | Required | Limit |
|---|---|---|
| Job post / project description | yes | 50 to 15,000 characters |
| Client message(s) | no | 8,000 characters |
| Team expertise / tech stack | no | 5,000 characters |
| Constraints (budget, timeline, engagement model, timezone) | no | 3,000 characters |

Output, always in this order:

1. **Opportunity Summary**: what the client is looking for.
2. **Client Needs Breakdown**: main need and possible hidden needs.
3. **Discovery Questions**: 5 to 7 questions specific to the post.
4. **Risks / Red Flags**: 3 to 5 risks, each with a reason.
5. **Suggested Positioning**: how to present the team and approach.
6. **Recommended Solution Approach**: high-level solution idea.
7. **Call Strategy**: focus points and desired outcome.
8. **Final Prep Note**: key points to review before the call.

The app is behind an access key: the first visit shows a form, a correct key sets an httpOnly cookie for 30 days, and the API rejects requests without it. The UI also shows the intermediate brief the first step extracted, lets you load the two example posts, view a stored sample output without an API call, cancel a run, and copy the result as Markdown or JSON.

## Run locally

Requires Node.js 20.9+, Yarn 1.22.x and an Anthropic API key.

```bash
git clone https://github.com/nicjkkd/presales-call-prep-agent.git
cd presales-call-prep-agent
yarn install
cp .env.example .env.local
```

Set `ANTHROPIC_API_KEY` and `ACCESS_KEY` in `.env.local`, then run `yarn dev`, open http://localhost:3000 and enter the access key.

| Script | Purpose |
|---|---|
| `yarn dev` / `yarn build` / `yarn start` | Development server, production build, serve the build |
| `yarn lint` / `yarn lint:fix` / `yarn format` | Biome check, check with fixes, format |
| `yarn typecheck` | Next.js route types plus `tsc --noEmit` |

The model is fixed to `claude-haiku-4-5` in `src/agent/llm.ts`. Both variables are read at request time, so the build works without them. If the UI reports an error, the cause is in the terminal running `yarn dev`: usually a missing key, an overloaded provider, or a plan that failed validation twice.

## How the agent works

Four steps in `src/agent/index.ts`. Two call the model, two are plain code.

1. **analyze** (LLM): extracts a `Brief` from the input, facts only: project type, tech stack, whether budget and timeline are mentioned, engagement model, scope clarity, scale expectations, technical decision maker, missing information, client signals, constraints.
2. **rules** (code): turns the brief into required risks, questions and notes. No budget mentioned adds a budget risk and question. No timeline adds a question. Low scope clarity adds a risk and proposes a written scope. Scale expectations add a risk and a volume question. Unclear engagement model, unknown technical decision maker and empty tech stack each add a question. Up to two missing-information items become "Could you clarify" questions. Provided constraints add a note to confirm them on the call.
3. **generate** (LLM): writes the eight sections from the brief, the rule findings and the original input. Rule findings are required content and must be merged and deduplicated.
4. **validate** (code): checks 5 to 7 questions, 3 to 5 risks, at least one hidden need, at least two focus points, no duplicate questions, no empty strings. On failure, generate runs once more with the issues as feedback. A second failure returns an error.

Cancel in the UI aborts the request; the route forwards `request.signal` into the model calls, so the in-flight call stops and no further step runs.

## Project structure

```
src/
  app/            Next.js routing: layout, page, api/access and api/prep-plans routes
  agent/          framework-agnostic agent: index.ts, llm.ts, format-input.ts, schemas/, steps/
  components/     page, form, access gate and result components; ui/ holds shadcn primitives
  hooks/          use-prep-plan.ts
  lib/            access check, examples, sample plan, Markdown export
examples/         sample inputs and outputs
```

`src/agent` has no imports from Next.js or the UI. The route handler checks the access cookie, validates the body with the same zod schema the form uses, calls `runAgent`, and returns JSON.

## API

`POST /api/access` with `{ "key": "..." }` sets the access cookie, or returns 401.

`POST /api/prep-plans` with a JSON body of `jobPost`, `clientMessages`, `teamExpertise`, `constraints` (limits as above).

| Status | Body |
|---|---|
| 200 | `{ "plan": PrepPlan, "brief": Brief }` |
| 400 | `{ "error": "Invalid input", "issues": [...] }` |
| 401 | `{ "error": "Access denied" }` when the access cookie is missing or wrong |
| 500 | Model call failed or the plan failed validation twice |

`maxDuration` is 120 seconds. A run takes two model calls, three with a retry, usually 20 to 60 seconds.

## Tech stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui (Base UI)
- React Hook Form + zod; one input schema shared by the form and the API
- TanStack AI with the Anthropic adapter, pinned exact and confined to `src/agent/llm.ts`
- axios for the client requests, `mdast-util-to-markdown` for the Markdown export
- Biome for lint and format, Yarn 1

Orchestration is hand-written: four functions called in order, no agent framework.

## Deployment

Deployed on Vercel. Add `ANTHROPIC_API_KEY` and `ACCESS_KEY` in the project's environment variables. Page views are counted with Vercel Web Analytics. The access key is the only protection against unknown users; there is no rate limiting, so also set a spend limit on the API key.

## Examples

`examples/saas-founding-engineer/` is a founder looking for a founding engineer, job post only. `examples/text-to-video-pipeline/` is an automated text-to-video pipeline with team expertise and constraints provided. Each folder has `input.md`, `output.md` and `output.json`, produced with the Copy buttons.

TODO: run both examples and add `output.md` and `output.json`.

## Limitations

- No rate limiting and no persistence; the access key is a shared secret, not user accounts.
- One spinner for the whole run, no per-step progress.
- Output quality depends on the model; rules guarantee presence, not sharpness.
- No automated tests.
