import type { PrepInput } from "./schemas/input";

export function tag(name: string, value: string): string {
  return `<${name}>\n${value}\n</${name}>`;
}

export function formatInputSections(input: PrepInput): string {
  const sections: [string, string | undefined][] = [
    ["job_post", input.jobPost],
    ["client_messages", input.clientMessages],
    ["team_expertise", input.teamExpertise],
    ["constraints", input.constraints],
  ];
  return sections.flatMap(([name, value]) => (value ? [tag(name, value)] : [])).join("\n\n");
}
