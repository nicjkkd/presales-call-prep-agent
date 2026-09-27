# Handoff

## Goal

Strip over-engineering from the Presales Call Prep Agent so it becomes a lean MVP, while keeping the core agent logic the task requires: a 4-step flow (analyze → rules → generate → validate with one retry), not a single prompt.

The user's requests, round 1:
1. Use axios instead of `fetch` on the client.
2. Drop the heavy error handling (custom error classes, error-kind maps).
3. Remove the hand-written SSE code.
4. Replace the wrapper/class machinery with a plain function call chain.
5. Keep `route.ts` small: `if` checks, no try/catch blocks.
6. Remove the redundant `src/lib` folder (`sse-response.ts`, `rate-limit.ts`, `env.ts`, `utils.ts`).

The user's requests, round 2 (after an architecture and per-file audit):
7. Remove the remaining micro-abstractions (items 1 to 7 of the audit, listed under "What changed").
8. Stop writing Markdown by hand: use a trusted library for the "Copy as Markdown" export, and tell the model to return plain text so the copied output always pastes as clean structured text.
9. Keep the Markdown export file short and readable.
10. Do not commit anything. The user reviews and commits. Do not write the README yet; the user will do it last.

## Current state

- Last commit is `945e081` ("refactor: remove sse, rate limiting and custom error classes for a plain axios json flow"). It holds round 1.
- Everything after that is **uncommitted and unstaged**, on purpose:
  - Modified: `components.json`, `package.json`, `yarn.lock`, `src/agent/index.ts`, `src/agent/llm.ts`, `src/agent/steps/analyze.ts`, `src/agent/steps/generate.ts`, `src/agent/steps/rules.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/features/call-prep/components/call-prep-page.tsx`, `prep-form.tsx`, `prep-result.tsx`, `result-actions.tsx`, `src/features/call-prep/hooks/use-prep-plan.ts`, `src/features/call-prep/lib/markdown.ts`
  - Deleted: `src/agent/prompts/` (3 files), `src/features/call-prep/index.ts`, `src/features/call-prep/lib/clipboard.ts`, `src/features/call-prep/lib/fixtures/sample-prep-plan.ts`, `src/lib/utils.ts`
  - New (untracked): `src/agent/format-input.ts`, `src/features/call-prep/lib/sample-prep-plan.ts`, `handoff.md`
  - The two "new" files are moves. `git add -A` pairs them with their deletions as renames.
- `yarn typecheck`, `yarn lint` and `yarn build` all pass on the current working tree.
- The real generate flow has **not been run** (project rule: never call the Anthropic API). The user must test it manually with `ANTHROPIC_API_KEY` set.

### How the app works now

- **Client:** `use-prep-plan.ts` makes one `axios.post("/api/prep-plans", input, { signal })` call. It keeps three pieces of state (status, result, error), and an `AbortController` handles Cancel. The UI shows a spinner while it runs. There is no per-step progress.
- **Route:** `src/app/api/prep-plans/route.ts` parses the body (`.catch(() => null)`), validates it with `prepInputSchema`, and returns 400 on bad input. Then it calls `runAgent` and returns `Response.json({ plan, brief })`. If the agent throws, Next.js logs the error and returns a 500. `maxDuration = 120` is kept for Vercel.
- **Agent (`src/agent/index.ts`):** a plain chain: `analyze` → `applyRules` → `generate` → `validatePrepPlan`. If validation fails, it calls `generate` once more with the validation issues as feedback and throws a plain `Error` if the retry also fails.
- **Steps (`src/agent/steps/`):** one file per step. `analyze.ts` and `generate.ts` each contain their own system prompt, build the user message, and call `generateObject`. `rules.ts` is plain `if` blocks. `validate.ts` is unchanged.
- **LLM (`src/agent/llm.ts`):** `generateObject` is a thin wrapper over TanStack AI `chat({ outputSchema, stream: false })`. The model is fixed to `claude-haiku-4-5`, `max_tokens` is one constant (8192), and `anthropicText()` reads `ANTHROPIC_API_KEY` from the environment itself.
- **Markdown export (`src/features/call-prep/lib/markdown.ts`):** builds an mdast tree top to bottom (one line per heading, paragraph or list) and serializes it with `mdast-util-to-markdown`, which escapes Markdown characters in the model's text.

### Current folder layout

```
src/
  app/                          layout, page, globals.css, api/prep-plans/route.ts
  agent/
    index.ts                    runAgent
    llm.ts                      generateObject
    format-input.ts             input sections → tagged prompt text
    schemas/                    input.ts, brief.ts, prep-plan.ts
    steps/                      analyze.ts, rules.ts, generate.ts, validate.ts
  components/ui/                shadcn primitives
  features/call-prep/
    components/                 call-prep-page, prep-form, example-buttons, prep-result, result-section, result-actions
    hooks/use-prep-plan.ts
    lib/                        examples.ts, sample-prep-plan.ts, markdown.ts
```

## Files worked on

### Round 1 (committed in `945e081`, plus the first uncommitted batch)

**Deleted**
- `src/lib/sse-response.ts`: server-side SSE stream helper.
- `src/lib/rate-limit.ts`: in-memory per-IP rate limiter.
- `src/lib/env.ts`: zod-validated env loader.
- `src/lib/utils.ts`: re-export of `cn` (the whole `src/lib` folder is gone).
- `src/features/call-prep/lib/sse.ts`: client-side SSE parser.
- `src/agent/errors.ts`: the `AgentError` class.
- `src/agent/progress.ts`: step ids, labels and the progress event schema.
- `src/features/call-prep/components/step-progress.tsx`: the live step list UI.
- `src/features/call-prep/index.ts`: barrel re-export of `CallPrepPage`.

**Rewritten or edited**
- `src/agent/index.ts`: plain function chain, no `runStep`, deadlines or timeouts.
- `src/agent/llm.ts`: minimal `generateObject`, with no error classes, no timers/abort handling, no `temperature`, and no `server-only` import.
- `src/app/api/prep-plans/route.ts`: 15 lines, no try/catch.
- `src/features/call-prep/hooks/use-prep-plan.ts`: axios-based hook, down from about 190 lines to about 55.
- `src/features/call-prep/components/call-prep-page.tsx`: the spinner replaces `StepProgress`, and Cancel calls `reset`.
- `src/app/layout.tsx`, `src/features/call-prep/components/prep-form.tsx`: now `import { cn } from "cn"`.
- `src/app/page.tsx`: imports `CallPrepPage` from `@/features/call-prep/components/call-prep-page`.
- `components.json`: the `aliases.utils` alias is now `"cn"`.
- `package.json` / `yarn.lock`: `axios` added, `server-only` removed.
- `.env.example`: only `ANTHROPIC_API_KEY` is left (`ANTHROPIC_MODEL` removed).
- `CLAUDE.md`: the route rule now says "return the JSON result" instead of "stream the result".

### Round 2 (uncommitted)

**Deleted or moved**
- `src/agent/prompts/analyze.ts`, `src/agent/prompts/generate.ts`: merged into the matching step files.
- `src/agent/prompts/format-input.ts`: moved to `src/agent/format-input.ts`.
- `src/features/call-prep/lib/clipboard.ts`: inlined into `result-actions.tsx`.
- `src/features/call-prep/lib/fixtures/sample-prep-plan.ts`: moved to `src/features/call-prep/lib/sample-prep-plan.ts`.

**Rewritten or edited**
- `src/agent/steps/analyze.ts`: holds the analyze system prompt; adds a plain-text rule.
- `src/agent/steps/generate.ts`: holds the generate system prompt and user message builder; the params type is local; adds a plain-text rule.
- `src/agent/steps/rules.ts`: nine plain `if` blocks pushing into three arrays.
- `src/agent/llm.ts`: `maxTokens` option removed; one `MAX_TOKENS` constant.
- `src/agent/index.ts`: the retry reassigns `plan`.
- `src/features/call-prep/hooks/use-prep-plan.ts`: result state is `{ plan: PrepPlan; brief?: Brief }`; the exported `PrepPlanResultView` and `PrepPlanStatus` types are gone.
- `src/features/call-prep/components/prep-result.tsx`: takes `plan` and `brief` as separate props.
- `src/features/call-prep/components/call-prep-page.tsx`: passes `plan` and `brief` to `PrepResult`. The error message and the "Try again" button now sit on one row (message left, button right; wraps on narrow screens), and the button uses the default size instead of `sm`.
- `src/features/call-prep/components/result-actions.tsx`: clipboard try/catch inline.
- `src/features/call-prep/lib/markdown.ts`: rewritten on `mdast-util-to-markdown` as a flat, top-to-bottom tree (66 lines).
- `package.json` / `yarn.lock`: `mdast-util-to-markdown` added, `@types/mdast` added as a dev dependency.

## What changed (behavior)

| Before | Now |
|---|---|
| Live per-step progress over SSE | One spinner until the JSON response arrives |
| Distinct error messages (not configured / model busy / timed out) | One generic client message; details only in server logs |
| Per-IP rate limit (5 requests / 10 min, 429) | No rate limit; the endpoint is open |
| Cancel aborted the model call on the server | Cancel only stops waiting on the client; the server finishes the run |
| Model chosen via `ANTHROPIC_MODEL` | Fixed to `claude-haiku-4-5` in `llm.ts` |
| Response `{ plan, brief, findings }` | Response `{ plan, brief }` (the UI never used `findings`) |
| Missing-information questions read "Could you clarify the {item}?" with acronym-aware lowercasing | They read "Could you clarify: {item}?" |
| The model could put Markdown (bold, "1." prefixes, `#`) inside field text | Both prompts ask for plain text in every field; the app adds all formatting |
| Markdown characters in model text broke or changed the copied Markdown | They are escaped (`\*`, `\#`, `1\.`), so the pasted text shows exactly what the model wrote |

For clean model text, the copied Markdown is byte-for-byte identical to the previous hand-written version (checked by rendering the sample plan before and after).

## What was tried and did not work out

- **TanStack AI's SSE helpers instead of the hand-written SSE.** `toServerSentEventsResponse` / `toServerSentEventsStream` in `@tanstack/ai` are built for streaming chat tokens (AG-UI `StreamChunk` events), not our custom step events. Wrapping our events in that format added complexity, so streaming was dropped entirely.
- **Axios with streaming.** Axios can't consume a streaming response in the browser without awkward workarounds. That conflicted with keeping live progress, and it is the main reason progress was dropped.
- **TanStack Markdown for the export.** Rejected: it parses and renders Markdown (text → AST → HTML/React), which is the opposite direction of our export (object → Markdown text).
- **Other "JSON to Markdown" libraries.** `json2md`, `ts-markdown` and `ts-markdown-builder` were rejected on supply-chain grounds: each is controlled by a single maintainer, and none escapes model text. `mdast-util-to-markdown` was chosen because it is maintained by the unified/remark team, has about 59M weekly downloads, and escapes correctly.
- **Having the model return finished Markdown.** Rejected: it would lose the structured JSON that drives zod validation, the retry, and the result cards.
- **First mdast version of `markdown.ts`.** It kept the old `[title, content]` pair array and wrapped every list item in `paragraph(...)`, so it read worse than the hand-written file. It was replaced by the flat top-to-bottom tree with string-accepting helpers.
- **Resolved from round 1:** the shadcn alias `aliases.utils: "cn"` is now verified. `shadcn add badge --dry-run --view` writes `import { cn } from "cn"`.

## Next steps

1. **Manual test** with a real key: load both examples, generate, and check the result and the intermediate brief. Check that the model follows the plain-text rule (no `**`, no "1." prefixes in questions). Use "Copy as Markdown" and paste into a Markdown viewer. Also test Cancel, and an invalid input to confirm it returns 400.
2. **Review and commit** the uncommitted work. Run `git add -A` so the two moved files register as renames. Suggested split: `refactor: remove server-only, src/lib and feature barrel`, `refactor(agent): merge prompts into steps and simplify rules`, `refactor(call-prep): inline clipboard, type brief, flatten fixture`, `feat(call-prep): export markdown with mdast-util-to-markdown`. No AI attribution trailer.
3. **Optional cleanups left out on purpose:**
   - Flatten `src/features/call-prep/` into `src/components/`, `src/hooks/` and `src/lib/`. With one feature, the `features/` layer has no second user.
   - Remove `tw-animate-css`: it is imported in `globals.css`, but no class from it is used.
   - Return `findings` from `runAgent` again and show them under the brief collapsible. Without step progress, that is the only visible proof the rules step ran.
4. **Update docs.** `IMPLEMENTATION_PLAN.md` still describes SSE, the rate limiter, `env.ts`, `ANTHROPIC_MODEL` and the `prompts/` folder. The user writes `README.md` last, from the current code, not from the plan.
5. **Before a public deploy**, decide on cost protection now that the rate limit is gone. A spend limit in the Anthropic console is the simplest option.
