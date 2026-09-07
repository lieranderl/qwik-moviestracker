import { describe, expect, it } from "bun:test";
import {
  UpstreamError,
  requestWithRetry,
  toUpstreamFailure,
  upstreamSuccess,
} from "./upstream";

describe("upstream result and retry infrastructure", () => {
  it("returns validated success data with cache metadata", () => {
    expect(
      upstreamSuccess({ id: 1 }, { status: "hit", expiresAt: 500 }),
    ).toEqual({
      ok: true,
      data: { id: 1 },
      cache: { status: "hit", expiresAt: 500 },
    });
  });

  it("normalizes failures without exposing messages or response bodies", () => {
    const failure = toUpstreamFailure(
      new UpstreamError({
        source: "tmdb",
        kind: "rate-limited",
        retryable: true,
        status: 429,
        message: "secret-key raw response body",
      }),
      "tmdb",
    );

    expect(failure).toEqual({
      ok: false,
      error: {
        source: "tmdb",
        kind: "rate-limited",
        retryable: true,
        status: 429,
      },
    });
    expect(JSON.stringify(failure)).not.toContain("secret-key");
  });

  it("retries network errors, 429, and 5xx with bounded backoff", async () => {
    for (const error of [
      new TypeError("network"),
      new UpstreamError({
        source: "tmdb",
        kind: "rate-limited",
        retryable: true,
        status: 429,
      }),
      new UpstreamError({
        source: "tmdb",
        kind: "unavailable",
        retryable: true,
        status: 503,
      }),
    ]) {
      let attempts = 0;
      const delays: number[] = [];
      const result = await requestWithRetry(
        async () => {
          attempts += 1;
          if (attempts === 1) throw error;
          return "ok";
        },
        {
          source: "tmdb",
          timeoutMs: 100,
          maxRetries: 2,
          baseDelayMs: 100,
          random: () => 0.5,
          sleep: async (ms) => void delays.push(ms),
        },
      );

      expect(result).toBe("ok");
      expect(attempts).toBe(2);
      expect(delays).toEqual([150]);
    }
  });

  it("does not retry validation failures or non-429 4xx", async () => {
    for (const error of [
      new UpstreamError({
        source: "tmdb",
        kind: "invalid-response",
        retryable: false,
      }),
      new UpstreamError({
        source: "tmdb",
        kind: "not-found",
        retryable: false,
        status: 404,
      }),
    ]) {
      let attempts = 0;
      await expect(
        requestWithRetry(
          async () => {
            attempts += 1;
            throw error;
          },
          {
            source: "tmdb",
            timeoutMs: 100,
            maxRetries: 2,
            sleep: async () => undefined,
          },
        ),
      ).rejects.toBe(error);
      expect(attempts).toBe(1);
    }
  });

  it("classifies per-attempt timeouts and stops at the retry bound", async () => {
    let attempts = 0;
    await expect(
      requestWithRetry(
        (signal) =>
          new Promise((_resolve, reject) => {
            attempts += 1;
            signal.addEventListener("abort", () => reject(signal.reason));
          }),
        { source: "jacred", timeoutMs: 5, maxRetries: 1, baseDelayMs: 0 },
      ),
    ).rejects.toMatchObject({
      kind: "timeout",
      source: "jacred",
      retryable: true,
    });
    expect(attempts).toBe(2);
  });

  it("enforces timeout when an operation ignores its abort signal", async () => {
    const started = Date.now();
    await expect(
      requestWithRetry(
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 40));
          return "late";
        },
        { source: "tmdb", timeoutMs: 5, maxRetries: 0 },
      ),
    ).rejects.toMatchObject({ kind: "timeout", source: "tmdb" });
    expect(Date.now() - started).toBeLessThan(30);
  });

  it("honors an already-aborted caller signal without invoking the request", async () => {
    const controller = new AbortController();
    controller.abort();
    let attempts = 0;

    await expect(
      requestWithRetry(
        async () => {
          attempts += 1;
          return "unexpected";
        },
        { source: "tmdb", timeoutMs: 100, signal: controller.signal },
      ),
    ).rejects.toMatchObject({ kind: "unavailable", retryable: false });
    expect(attempts).toBe(0);
  });

  it("cancels retry backoff when the caller aborts", async () => {
    const controller = new AbortController();
    let beginBackoff!: () => void;
    const backoffStarted = new Promise<void>((resolve) => {
      beginBackoff = resolve;
    });
    const pending = requestWithRetry(
      async () => {
        throw new TypeError("network");
      },
      {
        source: "tmdb",
        timeoutMs: 100,
        maxRetries: 2,
        baseDelayMs: 1_000,
        signal: controller.signal,
        sleep: async (_delay, signal) => {
          beginBackoff();
          await new Promise((_resolve, reject) =>
            signal.addEventListener("abort", () => reject(signal.reason)),
          );
        },
      },
    );
    await backoffStarted;
    controller.abort();

    await expect(pending).rejects.toMatchObject({
      kind: "unavailable",
      retryable: false,
      source: "tmdb",
    });
  });
});
