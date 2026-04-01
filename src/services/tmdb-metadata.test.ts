import { describe, expect, it } from "bun:test";
import {
  getRegionFromLanguage,
  resolveMovieCertification,
  resolveRegionalWatchProviders,
  resolveTvCertification,
} from "./tmdb";

describe("tmdb metadata helpers", () => {
  it("derives a region from the active app language", () => {
    expect(getRegionFromLanguage("en-US")).toBe("US");
    expect(getRegionFromLanguage("ru-RU")).toBe("RU");
    expect(getRegionFromLanguage("en")).toBe("US");
    expect(getRegionFromLanguage("")).toBe("US");
  });

  it("prefers the requested movie certification and falls back to US", () => {
    const releaseDates = {
      id: 1,
      results: [
        {
          iso_3166_1: "GB",
          release_dates: [{ certification: "15", type: 3 }],
        },
        {
          iso_3166_1: "US",
          release_dates: [{ certification: "PG-13", type: 3 }],
        },
      ],
    };

    expect(resolveMovieCertification(releaseDates, "GB")).toEqual({
      rating: "15",
      region: "GB",
    });
    expect(resolveMovieCertification(releaseDates, "DE")).toEqual({
      rating: "PG-13",
      region: "US",
    });
  });

  it("prefers the requested tv certification and falls back to US", () => {
    const contentRatings = {
      id: 1,
      results: [
        {
          iso_3166_1: "RU",
          rating: "18+",
        },
        {
          iso_3166_1: "US",
          rating: "TV-MA",
        },
      ],
    };

    expect(resolveTvCertification(contentRatings, "RU")).toEqual({
      rating: "18+",
      region: "RU",
    });
    expect(resolveTvCertification(contentRatings, "FR")).toEqual({
      rating: "TV-MA",
      region: "US",
    });
  });

  it("builds regional watch provider availability with provider buckets", () => {
    const watchProviders = {
      id: 1,
      results: {
        RU: {
          link: "https://www.themoviedb.org/movie/1/watch?locale=RU",
          flatrate: [
            {
              provider_id: 8,
              provider_name: "Netflix",
              logo_path: "/netflix.png",
              display_priority: 1,
            },
          ],
          ads: [
            {
              provider_id: 531,
              provider_name: "Kinopoisk",
              logo_path: "/kinopoisk.png",
              display_priority: 2,
            },
          ],
        },
        US: {
          link: "https://www.themoviedb.org/movie/1/watch?locale=US",
          rent: [
            {
              provider_id: 2,
              provider_name: "Apple TV",
              logo_path: "/apple.png",
              display_priority: 1,
            },
          ],
        },
      },
    };

    expect(resolveRegionalWatchProviders(watchProviders, "RU")).toEqual({
      region: "RU",
      link: "https://www.themoviedb.org/movie/1/watch?locale=RU",
      flatrate: [
        {
          provider_id: 8,
          provider_name: "Netflix",
          logo_path: "/netflix.png",
          display_priority: 1,
        },
      ],
      ads: [
        {
          provider_id: 531,
          provider_name: "Kinopoisk",
          logo_path: "/kinopoisk.png",
          display_priority: 2,
        },
      ],
      rent: [],
      buy: [],
      free: [],
    });
    expect(resolveRegionalWatchProviders(watchProviders, "DE")?.region).toBe(
      "US",
    );
  });
});
