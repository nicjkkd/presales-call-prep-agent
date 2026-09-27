# Presales Call Prep Agent

Next.js 16 app that turns a job post into a presales call prep plan through a four-step agent: analyze (LLM) → rules (code) → generate (LLM) → validate (code, one retry). It is a test-task deliverable: a small, lean MVP that a reviewer reads cold. Every extra layer, file or dependency is a cost.

## Commands

- `yarn install`, `yarn add`, `yarn remove`: Yarn 1 only. Never npm, pnpm, Yarn Berry, a `packageManager` field or Corepack.
- `yarn typecheck && yarn lint && yarn build`: the gate. Run it before reporting any change as done.
- `yarn lint:fix`: Biome formatting and safe fixes. Biome is the only linter and formatter; no ESLint, no Prettier.
- `yarn dev`: only to confirm the app boots, then stop it. Before starting a server on a port, run `lsof -ti:<port>` and kill what holds it; a stale server answers with old code.
- `npx shadcn@latest add <component>`: the only way to add UI primitives. They land in `src/components/ui/`.

## Hard rules

- Never call the Anthropic API: do not run the generate flow, do not `curl` `/api/prep-plans` with a valid body and cookie, do not write scripts that hit the model. The user tests manually with a real key.
- `README.md` describes only what the code does. Update it in the same change whenever behavior, env vars, scripts or the API change.

## Layout

```
src/app/         routing only: layout, page, api/access, api/prep-plans
src/agent/       framework-agnostic agent: index.ts (runAgent), llm.ts (only TanStack import),
                 format-input.ts, schemas/, steps/
src/components/  page, form, access gate, result components; ui/ is shadcn output
src/hooks/       use-prep-plan.ts
src/lib/         access.ts (server-only cookie check), examples, sample plan, Markdown export
examples/        sample inputs; outputs are produced by the user through the UI
```

## Boundaries

- `src/agent/` imports nothing from `next/*`, `@/app`, `@/components`, `@/hooks` or `@/lib`. It takes a standard `AbortSignal`, never a Next request.
- Client code imports from the agent only `@/agent/schemas/*`. Never `@/agent` itself: that pulls the TanStack SDK into the browser bundle.
- Route handlers do four things: check access, validate with `prepInputSchema`, call `runAgent`, return JSON. No prompts, LLM calls, business rules or try/catch there.
- `src/lib/access.ts` uses `next/headers`; import it only from server files.
- Prompts live in `steps/analyze.ts` and `steps/generate.ts`. Field-level guidance lives in the zod `.meta({ description })` calls in `schemas/`.

## Conventions

- Env: `ANTHROPIC_API_KEY` (read by the TanStack adapter) and `ACCESS_KEY` (the gate). Both server-only, read at request time, never `NEXT_PUBLIC_`. Anything else (model id, token limit, cookie name) is configuration and stays hardcoded.
- Model is `claude-haiku-4-5`, fixed in `src/agent/llm.ts`.
- The model writes plain text in every field, no Markdown. The app adds all formatting.
- The eight output section titles come from `PREP_PLAN_SECTION_TITLES` in `schemas/prep-plan.ts`; the UI and the Markdown export both use it.
- Inline a helper unless it has two real callers. Prefer plain `if` blocks over generic abstractions; `steps/rules.ts` and `steps/validate.ts` are the reference style.
- `next dev` started by a coding agent writes `AGENTS.md` and `CLAUDE.md` at the repo root. Delete them. The only instruction file is `.claude/CLAUDE.md`.

## Reporting

After a change: run the gate, then report what changed (files), what was verified and how, what the user must still do (env vars, deploy, manual test), and the commit message.
