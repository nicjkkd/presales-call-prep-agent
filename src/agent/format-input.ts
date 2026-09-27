import type { PrepInput } from "./schemas/input";

export function formatInputSections(input: PrepInput): string {
  const sections: [string, string | undefined][] = [
    ["job_post", input.jobPost],
    ["client_messages", input.clientMessages],
    ["team_expertise", input.teamExpertise],
    ["constraints", input.constraints],
  ];
  return sections
    .filter(([, value]) => value)
    .map(([tag, value]) => `<${tag}>\n${value}\n</${tag}>`)
    .join("\n\n");
}
