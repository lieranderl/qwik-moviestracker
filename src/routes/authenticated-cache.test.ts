import { describe, expect, it } from "bun:test";
import { applyAuthenticatedCachePolicy } from "./authenticated-cache";

describe("authenticated cache policy", () => {
  it("prevents browsers and shared caches from retaining personalized pages", () => {
    let received: unknown;
    applyAuthenticatedCachePolicy((policy) => {
      received = policy;
    });

    expect(received).toEqual({
      public: false,
      maxAge: 0,
      sMaxAge: 0,
      staleWhileRevalidate: 0,
    });
  });
});
