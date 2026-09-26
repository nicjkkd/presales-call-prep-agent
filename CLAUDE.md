@AGENTS.md

## Project rules

- **Yarn 1 (Classic) only** for installs and scripts. Never npm/pnpm installs, no Yarn Berry, no `packageManager` field, no Corepack.
- **Biome only** for linting and formatting (`yarn lint`, `yarn lint:fix`, `yarn format`). No ESLint, no Prettier.
- **Never call the Anthropic API**: do not run the generate flow, do not `curl` `/api/prep-plans`, do not write scripts that hit the model. The user tests the agent manually.
- **Docs first** for TanStack AI, shadcn/ui (Base UI) and Next.js 16: read the current docs before writing code that touches them; training memory is out of date.
- `src/agent/` is framework-agnostic: no imports from `next/*`, `@/features`, `@/components` or `@/app`.
- Route handlers stay thin: validate input, call `runAgent`, return the JSON result. No prompts, LLM calls or business rules in `src/app/`.
- End of each step: run `yarn typecheck && yarn lint && yarn build`, commit, post a step report, then stop and wait for the user.
