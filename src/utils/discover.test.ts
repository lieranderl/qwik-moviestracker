import { describe, expect, it } from "bun:test";
import type { CertificationList, WatchProviderCatalog } from "~/services/models";
import {
  createMovieDiscoverFilters,
  createTvDiscoverFilters,
  getCertificationOptions,
  getDiscoverRegions,
  getProviderOptions,
} from "./discover";

const movieCertifications: CertificationList = {
  certifications: {
    US: [
      { certification: "PG", meaning: "Parental Guidance", order: 2 },
      { certification: "R", meaning: "Restricted", order: 4 },
    ],
    DE: [{ certification: "12", meaning: "Ages 12+", order: 2 }],
  },
};

const providerCatalog: WatchProviderCatalog = {
  results: [
    {
      display_priorities: { DE: 2, US: 10 },
      provider_id: 8,
      provider_name: "Netflix",
    },
    {
      display_priorities: { DE: 1 },
      provider_id: 531,
      provider_name: "WOW",
    },
    {
      display_priority: 50,
      provider_id: 2,
      provider_name: "Apple TV",
    },
  ],
};

describe("discover helpers", () => {
  it("builds region options from certification lists with the default region first", () => {
    expect(getDiscoverRegions(movieCertifications, "US")).toEqual(["US", "DE"]);
  });

  it("returns region-specific certification options", () => {
    expect(getCertificationOptions(movieCertifications, "DE")).toEqual([
      { label: "12", meaning: "Ages 12+", value: "12" },
    ]);
  });

  it("sorts provider options using region-specific display priority", () => {
    expect(getProviderOptions(providerCatalog, "DE")).toEqual([
      { label: "WOW", value: 531 },
      { label: "Netflix", value: 8 },
    ]);
  });

  it("normalizes movie discover filters against the available TMDB metadata", () => {
    const filters = createMovieDiscoverFilters({
      certifications: movieCertifications,
      defaultRegion: "US",
      providerCatalog,
      searchParams: new URLSearchParams({
        certification: "12",
        minVotes: "250",
        page: "3",
        provider: "531",
        region: "DE",
        sortBy: "vote_average.desc",
        year: "2024",
      }),
    });

    expect(filters).toEqual({
      certification: "12",
      minVotes: 250,
      page: 3,
      providerId: 531,
      region: "DE",
      sortBy: "vote_average.desc",
      year: 2024,
    });
  });

  it("rejects invalid discover filter values and falls back safely", () => {
    const filters = createMovieDiscoverFilters({
      certifications: movieCertifications,
      defaultRegion: "US",
      providerCatalog,
      searchParams: new URLSearchParams({
        certification: "18",
        minVotes: "-5",
        page: "0",
        provider: "99999",
        region: "FR",
        sortBy: "not-real",
        year: "1700",
      }),
    });

    expect(filters).toEqual({
      certification: undefined,
      minVotes: 100,
      page: 1,
      providerId: undefined,
      region: "US",
      sortBy: "popularity.desc",
      year: undefined,
    });
  });

  it("normalizes tv discover filters using the available regional data", () => {
    const filters = createTvDiscoverFilters({
      certifications: movieCertifications,
      defaultRegion: "US",
      providerCatalog,
      searchParams: new URLSearchParams({
        minVotes: "80",
        page: "2",
        provider: "8",
        region: "DE",
        sortBy: "first_air_date.desc",
        year: "2023",
      }),
    });

    expect(filters).toEqual({
      minVotes: 80,
      page: 2,
      providerId: 8,
      region: "DE",
      sortBy: "first_air_date.desc",
      year: 2023,
    });
  });
});
