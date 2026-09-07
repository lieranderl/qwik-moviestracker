import type { CacheMetadata } from "./server-cache";

export type UpstreamSource =
  "tmdb" | "firestore" | "jacred" | "imdb" | "torrserver";

export type UpstreamFailureKind =
  | "empty"
  | "not-found"
  | "rate-limited"
  | "timeout"
  | "invalid-response"
  | "unavailable";

interface UpstreamErrorOptions {
  source: UpstreamSource;
  kind: UpstreamFailureKind;
  retryable: boolean;
  status?: number;
  message?: string;
  cause?: unknown;
}

export class UpstreamError extends Error {
  readonly source: UpstreamSource;
  readonly kind: UpstreamFailureKind;
  readonly retryable: boolean;
  readonly status?: number;

  constructor(options: UpstreamErrorOptions) {
    super(options.message ?? `${options.source} ${options.kind}`, {
      cause: options.cause,
    });
    this.name = "UpstreamError";
    this.source = options.source;
    this.kind = options.kind;
    this.retryable = options.retryable;
    this.status = options.status;
  }
}

export interface UpstreamFailureDetails {
  source: UpstreamSource;
  kind: UpstreamFailureKind;
  retryable: boolean;
  status?: number;
}

export type UpstreamResult<T> =
  | { ok: true; data: T; cache: CacheMetadata }
  | { ok: false; error: UpstreamFailureDetails };

export function upstreamSuccess<T>(
  data: T,
  cache: CacheMetadata,
): UpstreamResult<T> {
  return { ok: true, data, cache };
}

export function toUpstreamFailure(
  error: unknown,
  source: UpstreamSource,
): UpstreamResult<never> {
  const normalized = normalizeUpstreamError(error, source);
  return {
    ok: false,
    error: {
      source: normalized.source,
      kind: normalized.kind,
      retryable: normalized.retryable,
      ...(normalized.status === undefined ? {} : { status: normalized.status }),
    },
  };
}

export function upstreamHttpError(
  source: UpstreamSource,
  status: number,
): UpstreamError {
  return new UpstreamError({
    source,
    kind:
      status === 404
        ? "not-found"
        : status === 429
          ? "rate-limited"
          : "unavailable",
    retryable: status === 429 || status >= 500,
    status,
  });
}

interface RetryOptions {
  source: UpstreamSource;
  timeoutMs: number;
  maxRetries?: number;
  baseDelayMs?: number;
  signal?: AbortSignal;
  random?: () => number;
  sleep?: (delayMs: number, signal: AbortSignal) => Promise<void>;
}

const defaultSleep = (delayMs: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const timeout = setTimeout(resolve, delayMs);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(signal.reason);
      },
      { once: true },
    );
  });

export async function requestWithRetry<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const retries = Math.max(0, Math.min(3, options.maxRetries ?? 2));
  const baseDelayMs = Math.max(0, options.baseDelayMs ?? 100);
  const random = options.random ?? Math.random;
  const sleep = options.sleep ?? defaultSleep;

  if (options.signal?.aborted) {
    throw callerAbortedError(options.source, options.signal.reason);
  }

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await runTimedAttempt(operation, options);
    } catch (error) {
      if (options.signal?.aborted) {
        throw callerAbortedError(options.source, options.signal.reason);
      }
      const normalized = normalizeUpstreamError(error, options.source);
      if (!normalized.retryable || attempt >= retries) throw normalized;
      const delay = Math.min(
        5_000,
        baseDelayMs * 2 ** attempt + baseDelayMs * random(),
      );
      const retryController = new AbortController();
      const onAbort = () => retryController.abort(options.signal?.reason);
      options.signal?.addEventListener("abort", onAbort, { once: true });
      try {
        await sleep(delay, retryController.signal);
      } catch (error) {
        if (options.signal?.aborted) {
          throw callerAbortedError(options.source, options.signal.reason);
        }
        throw error;
      } finally {
        options.signal?.removeEventListener("abort", onAbort);
      }
    }
  }
}

async function runTimedAttempt<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const controller = new AbortController();
  const onCallerAbort = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", onCallerAbort, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new DOMException("Timed out", "TimeoutError")),
    Math.max(1, options.timeoutMs),
  );
  const aborted = new Promise<never>((_resolve, reject) => {
    controller.signal.addEventListener(
      "abort",
      () => reject(controller.signal.reason),
      { once: true },
    );
  });
  try {
    return await Promise.race([operation(controller.signal), aborted]);
  } catch (error) {
    if (controller.signal.aborted && !options.signal?.aborted) {
      throw new UpstreamError({
        source: options.source,
        kind: "timeout",
        retryable: true,
        cause: error,
      });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", onCallerAbort);
  }
}

function normalizeUpstreamError(
  error: unknown,
  source: UpstreamSource,
): UpstreamError {
  if (error instanceof UpstreamError) return error;
  if (error instanceof TypeError) {
    return new UpstreamError({
      source,
      kind: "unavailable",
      retryable: true,
      cause: error,
    });
  }
  return new UpstreamError({
    source,
    kind: "unavailable",
    retryable: false,
    cause: error,
  });
}

function callerAbortedError(
  source: UpstreamSource,
  cause: unknown,
): UpstreamError {
  return new UpstreamError({
    source,
    kind: "unavailable",
    retryable: false,
    cause,
  });
}
