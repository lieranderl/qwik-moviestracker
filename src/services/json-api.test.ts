import { afterEach, describe, expect, it, mock } from "bun:test";
import { createJsonApiClient } from "./json-api";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("JSON API transport", () => {
  it("retries a network failure and passes an abort signal", async () => {
    let attempts = 0;
    const fetchMock = mock(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        attempts += 1;
        expect(init?.signal).toBeInstanceOf(AbortSignal);
        if (attempts === 1) throw new TypeError("network");
        return new Response(JSON.stringify({ id: 1 }), { status: 200 });
      },
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const client = createJsonApiClient({
      baseUrl: "https://example.test",
      name: "Example",
      source: "tmdb",
      retry: { baseDelayMs: 0, maxRetries: 1, timeoutMs: 100 },
    });

    expect(await client.request<{ id: number }>("item")).toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("classifies non-retryable HTTP failures without reading raw bodies", async () => {
    const fetchMock = mock(
      async () => new Response("secret body", { status: 404 }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const client = createJsonApiClient({
      baseUrl: "https://example.test",
      name: "Example",
      source: "tmdb",
    });

    await expect(client.request("missing")).rejects.toMatchObject({
      kind: "not-found",
      retryable: false,
      source: "tmdb",
      status: 404,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
