import "server-only";
import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  ANTHROPIC_MODEL: z.string().min(1).default("claude-haiku-4-5-20251001"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Parses and validates server env vars on first call, then returns the memoized result.
 * Parsing is deferred so `next build` succeeds without the API key being set.
 */
export function getEnv(): Env {
  cached ??= envSchema.parse(process.env);
  return cached;
}
