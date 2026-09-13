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

  it("keeps only the localized backdrop from landscape artwork", () => {
    expect(
      parseHorizontalPosterResponse({
        backdropPath: "/backdrop.jpg",
        logoPath: "/title-art.png",
      }),
    ).toEqual({
      backdropPath: "/backdrop.jpg",
    });
    expect(
      parseHorizontalPosterResponse({ backdropPath: null, logoPath: null }),
    ).toEqual({ backdropPath: null });
    expect(() =>
      parseHorizontalPosterResponse({ backdropPath: 42, logoPath: null }),
    ).toThrow();
  });

  it("coalesces duplicate visible-card requests in the browser", async () => {
    const fetcher = mock(async () =>
      Response.json({
        backdropPath: "/backdrop.jpg",
        logoPath: "/title-art.png",
      }),
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

    expect(first).toEqual({
      backdropPath: "/backdrop.jpg",
    });
    expect(second).toEqual({
      backdropPath: "/backdrop.jpg",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
