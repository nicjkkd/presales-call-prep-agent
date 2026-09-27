# Examples

Each folder holds one sample job post and the prep plan the agent produced for it.

| Folder | Input | Optional inputs used |
|---|---|---|
| `saas-founding-engineer/` | Founding Engineer / Senior Full-Stack Engineer (Product-Led SaaS) | none |
| `text-to-video-pipeline/` | AI Automation Engineer, scalable text-to-video pipeline | team expertise, constraints |

Files in each folder:

- `input.md`: the job post verbatim, plus the optional inputs when used. The same text is behind the "Load example" buttons in the UI (`src/lib/examples.ts`).
- `output.md`: the generated plan, saved from the UI with "Copy as Markdown".
- `output.json`: the same plan as structured JSON, saved with "Copy JSON".

Outputs come from the deployed app with the default model (`claude-haiku-4-5`). Runs are not deterministic, so a fresh run will differ in wording while keeping the same structure.
