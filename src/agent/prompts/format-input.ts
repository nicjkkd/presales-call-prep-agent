import type { PrepInput } from "../schemas/input";

const INPUT_SECTIONS = [
  { key: "jobPost", tag: "job_post" },
  { key: "clientMessages", tag: "client_messages" },
  { key: "teamExpertise", tag: "team_expertise" },
  { key: "constraints", tag: "constraints" },
] as const satisfies ReadonlyArray<{ key: keyof PrepInput; tag: string }>;

export function formatInputSections(input: PrepInput): string {
  return INPUT_SECTIONS.flatMap(({ key, tag }) => {
    const value = input[key]?.trim();
    return value ? [`<${tag}>\n${value}\n</${tag}>`] : [];
  }).join("\n\n");
}
