import "server-only";

const WINDOW_MS = 10 * 60_000;
const MAX_REQUESTS = 5;
const PRUNE_THRESHOLD = 1_000;
const ENABLED = process.env.NODE_ENV === "production";

const requestsByKey = new Map<string, number[]>();

type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  if (!ENABLED) return { ok: true };
  if (requestsByKey.size > PRUNE_THRESHOLD) pruneExpired(now);

  const recent = (requestsByKey.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  const oldest = recent[0];
  if (recent.length >= MAX_REQUESTS && oldest !== undefined) {
    requestsByKey.set(key, recent);
    return { ok: false, retryAfterSeconds: Math.ceil((oldest + WINDOW_MS - now) / 1000) };
  }
  requestsByKey.set(key, [...recent, now]);
  return { ok: true };
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip")?.trim() || "unknown-client";
}

function pruneExpired(now: number) {
  for (const [key, times] of requestsByKey) {
    if (times.every((time) => now - time >= WINDOW_MS)) requestsByKey.delete(key);
  }
}
