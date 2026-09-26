import { runAgent } from "@/agent";
import { prepInputSchema } from "@/agent/schemas/input";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = prepInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await runAgent(parsed.data);
  return Response.json(result);
}
