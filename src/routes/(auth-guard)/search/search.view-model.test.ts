import { describe, expect, it } from "bun:test";
import { MediaType } from "~/services/models";
import {
  createSearchAssistLinks,
  createSearchFormViewModel,
  normalizeSearchResults,
} from "./search.view-model";

describe("createSearchFormViewModel", () => {
  it("keeps valid queries ready for execution", () => {
    expect(createSearchFormViewModel("  alien  ")).toEqual({
      query: "alien",
      searchPhrase: "alien",
      shortQueryMessage: null,
    });
  });

  it("creates a focused short-query message without blocking GET restoration", () => {
    expect(createSearchFormViewModel(" ab ")).toEqual({
      query: "ab",
      searchPhrase: "",
      shortQueryMessage:
        "Search starts after 3 characters. Add 1 more character and submit again.",
    });
  });
});

describe("createSearchAssistLinks", () => {
  it("keeps the current language on every discovery link", () => {
    const links = createSearchAssistLinks("en-US");

    expect(links).toHaveLength(5);
    expect(links.every((link) => link.href.includes("lang=en-US"))).toBe(true);
  });
});

describe("normalizeSearchResults", () => {
  it("normalizes movie, tv, and person items into media-card props", () => {
    const results = normalizeSearchResults({
      language: "en-US",
      results: [
        {
          id: 1,
          media_type: MediaType.Movie,
          poster_path: "/movie.jpg",
          release_date: "1979-05-25",
          title: "Alien",
          vote_average: 8.5,
        },
        {
          first_air_date: "2016-07-15",
          id: 2,
          media_type: MediaType.Tv,
          name: "Stranger Things",
          poster_path: "/tv.jpg",
          vote_average: 8.7,
        },
        {
          id: 3,
          media_type: MediaType.Person,
          name: "Sigourney Weaver",
          profile_path: "/person.jpg",
        },
      ],
    });

    expect(results).toEqual([
      {
        href: "/movie/1/?lang=en-US",
        id: 1,
        picfile: "/movie.jpg",
        rating: 8.5,
        title: "Alien",
        variant: "poster",
        year: 1979,
      },
      {
        href: "/tv/2/?lang=en-US",
        id: 2,
        picfile: "/tv.jpg",
        rating: 8.7,
        title: "Stranger Things",
        variant: "poster",
        year: 2016,
      },
      {
        href: "/person/3/?lang=en-US",
        id: 3,
        picfile: "/person.jpg",
        rating: 0,
        title: "Sigourney Weaver",
        variant: "person",
        year: 0,
      },
    ]);
  });
});
