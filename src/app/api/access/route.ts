import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/access";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const key = process.env.ACCESS_KEY;
  if (!key || body?.key !== key) {
    return Response.json({ error: "Invalid access key" }, { status: 401 });
  }

  (await cookies()).set(ACCESS_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return Response.json({ ok: true });
}
