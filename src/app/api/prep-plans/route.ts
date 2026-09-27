import { runAgent } from "@/agent";
import { prepInputSchema } from "@/agent/schemas/input";
import { hasAccess } from "@/lib/access";

export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await hasAccess())) {
    return Response.json({ error: "Access denied" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = prepInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await runAgent(parsed.data, request.signal);
  return Response.json(result);
}
