import { afterEach, describe, expect, it, mock } from "bun:test";
import { MediaType } from "./models";
import {
  buildHorizontalPosterRequestUrl,
  clearHorizontalPosterRequestsForTests,
  loadHorizontalPosterPath,
  parseHorizontalPosterResponse,
} from "./horizontal-poster";

afterEach(() => clearHorizontalPosterRequestsForTests());

describe("horizontal poster client", () => {
  it("builds an authenticated same-origin request for the selected locale", () => {
    expect(
      buildHorizontalPosterRequestUrl({
        id: 95350,
        language: "en-US",
        type: MediaType.Tv,
      }),
    ).toBe("/api/tmdb-horizontal-poster?id=95350&language=en-US&type=tv");
  });

  it("accepts a TMDB file path and rejects malformed payloads", () => {
    expect(parseHorizontalPosterResponse({ filePath: "/title-art.jpg" })).toBe(
      "/title-art.jpg",
    );
    expect(parseHorizontalPosterResponse({ filePath: null })).toBeNull();
    expect(() => parseHorizontalPosterResponse({ filePath: 42 })).toThrow();
  });

  it("coalesces duplicate visible-card requests in the browser", async () => {
    const fetcher = mock(async () =>
      Response.json({ filePath: "/title-art.jpg" }),
    );
    const request = {
      id: 95350,
      language: "en-US",
      type: MediaType.Tv,
    } as const;

    const [first, second] = await Promise.all([
      loadHorizontalPosterPath(request, fetcher),
      loadHorizontalPosterPath(request, fetcher),
    ]);

    expect(first).toBe("/title-art.jpg");
    expect(second).toBe("/title-art.jpg");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
