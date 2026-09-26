import "server-only";
import { chat } from "@tanstack/ai";
import {
  ANTHROPIC_MODELS,
  type AnthropicChatModel,
  createAnthropicChat,
} from "@tanstack/ai-anthropic";
import type { z } from "zod";
import { getEnv } from "@/lib/env";

export type LlmErrorKind = "config" | "busy" | "timeout" | "aborted" | "invalid-output" | "unknown";

export class LlmError extends Error {
  readonly kind: LlmErrorKind;
  readonly rawText?: string;

  constructor(
    kind: LlmErrorKind,
    message: string,
    options: { cause?: unknown; rawText?: string } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "LlmError";
    this.kind = kind;
    this.rawText = options.rawText;
  }
}

type GenerateObjectOptions<TSchema extends z.ZodType> = {
  system: string;
  user: string;
  schema: TSchema;
  timeoutMs?: number;
  maxTokens?: number;
  signal?: AbortSignal;
};

const TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 8192;

const MODELS_WITHOUT_SAMPLING_PARAMS: ReadonlySet<AnthropicChatModel> = new Set([
  "claude-opus-4-7",
  "claude-opus-4-8",
  "claude-fable-5",
  "claude-fable-5-1",
  "claude-sonnet-5",
]);

const BUSY_STATUS_CODES = new Set(["429", "500", "502", "503", "504", "529"]);
const CONFIG_STATUS_CODES = new Set(["400", "401", "403", "404"]);
const OUTPUT_ERROR_CODES = new Set([
  "structured-output-parse-failed",
  "structured-output-validation-failed",
  "structured-output-missing-result",
  "max_tokens",
]);

export async function generateObject<TSchema extends z.ZodType>({
  system,
  user,
  schema,
  timeoutMs = 60_000,
  maxTokens = DEFAULT_MAX_TOKENS,
  signal,
}: GenerateObjectOptions<TSchema>): Promise<z.infer<TSchema>> {
  const { model, apiKey } = resolveConfig();
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener("abort", abortFromCaller, { once: true });

  let result: unknown;
  try {
    if (signal?.aborted) throw new LlmError("aborted", "The request was cancelled.");
    result = await chat({
      adapter: createAnthropicChat(model, apiKey),
      systemPrompts: [system],
      messages: [{ role: "user", content: user }],
      outputSchema: schema,
      stream: false,
      modelOptions: {
        max_tokens: maxTokens,
        ...(MODELS_WITHOUT_SAMPLING_PARAMS.has(model) ? {} : { temperature: TEMPERATURE }),
      },
      abortController: controller,
    });
  } catch (error) {
    if (timedOut)
      throw new LlmError("timeout", `Model call timed out after ${timeoutMs} ms.`, {
        cause: error,
      });
    if (signal?.aborted)
      throw new LlmError("aborted", "The request was cancelled.", { cause: error });
    throw toLlmError(error);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromCaller);
  }

  const parsed = schema.safeParse(result);
  if (!parsed.success) {
    throw new LlmError("invalid-output", "Model output does not match the schema.", {
      cause: parsed.error,
    });
  }
  return parsed.data;
}

function resolveConfig(): { model: AnthropicChatModel; apiKey: string } {
  let env: ReturnType<typeof getEnv>;
  try {
    env = getEnv();
  } catch (error) {
    throw new LlmError("config", "Anthropic environment variables are missing or invalid.", {
      cause: error,
    });
  }
  const model = env.ANTHROPIC_MODEL;
  if (!isAnthropicChatModel(model)) {
    throw new LlmError(
      "config",
      `ANTHROPIC_MODEL "${model}" is not supported. Use one of: ${ANTHROPIC_MODELS.join(", ")}.`,
    );
  }
  return { model, apiKey: env.ANTHROPIC_API_KEY };
}

function isAnthropicChatModel(value: string): value is AnthropicChatModel {
  return ANTHROPIC_MODELS.some((model) => model === value);
}

function toLlmError(error: unknown): LlmError {
  if (error instanceof LlmError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const code = readStringProperty(error, "code") ?? "";
  const rawText = readStringProperty(error, "rawText");
  const options = { cause: error, rawText };

  if (OUTPUT_ERROR_CODES.has(code)) return new LlmError("invalid-output", message, options);
  if (
    CONFIG_STATUS_CODES.has(code) ||
    /authentication_error|permission_error|api key/i.test(message)
  ) {
    return new LlmError("config", message, options);
  }
  if (BUSY_STATUS_CODES.has(code) || /rate_limit|overloaded/i.test(message)) {
    return new LlmError("busy", message, options);
  }
  return new LlmError("unknown", message, options);
}

function readStringProperty(value: unknown, key: string): string | undefined {
  if (typeof value !== "object" || value === null || !(key in value)) return undefined;
  const property: unknown = Reflect.get(value, key);
  return typeof property === "string" ? property : undefined;
}
