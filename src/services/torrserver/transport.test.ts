import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  buildTorrServerUrl,
  requestTorrServer,
  TorrServerHttpError,
} from "./transport";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("TorrServer transport", () => {
  test("builds encoded URLs without leaking invalid input", () => {
    expect(
      buildTorrServerUrl(" https://example.com/base/ ", ["play", "a/b"], {
        enabled: true,
        page: 2,
      }),
    ).toBe("https://example.com/base/play/a/b?enabled&page=2");
    expect(() => buildTorrServerUrl("not a URL", ["echo"])).toThrow(
      TorrServerHttpError,
    );
  });

  test("throws typed HTTP errors without upstream response bodies", async () => {
    globalThis.fetch = mock(
      async () => new Response("secret upstream detail", { status: 503 }),
    ) as unknown as typeof fetch;
    try {
      await requestTorrServer("https://example.com", { path: "echo" });
      throw new Error("expected request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TorrServerHttpError);
      expect((error as TorrServerHttpError).status).toBe(503);
      expect((error as TorrServerHttpError).retryable).toBe(true);
      expect((error as Error).message).not.toContain("secret");
    }
  });

  test("classifies invalid JSON as validation failure", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response("not-json", {
          headers: { "Content-Type": "application/json" },
        }),
    ) as unknown as typeof fetch;
    await expect(
      requestTorrServer("https://example.com", { path: "status" }),
    ).rejects.toMatchObject({ kind: "validation", retryable: false });
  });
});
