import { describe, expect, it } from "bun:test";
import { MediaType } from "~/services/models";
import { categoryToTitle, paths } from "./paths";

describe("category title labels", () => {
  it("maps TMDB movie discovery categories to localized titles", () => {
    expect(categoryToTitle("popular", MediaType.Movie, "en-US")).toBe(
      "All popular movies",
    );
    expect(categoryToTitle("nowplaying", MediaType.Movie, "en-US")).toBe(
      "All now playing",
    );
    expect(categoryToTitle("upcoming", MediaType.Movie, "en-US")).toBe(
      "All upcoming movies",
    );
  });

  it("maps TMDB tv discovery categories to localized titles", () => {
    expect(categoryToTitle("popular", MediaType.Tv, "en-US")).toBe(
      "All popular series",
    );
    expect(categoryToTitle("airingtoday", MediaType.Tv, "en-US")).toBe(
      "All airing today",
    );
    expect(categoryToTitle("ontheair", MediaType.Tv, "en-US")).toBe(
      "All on the air",
    );
  });
});

describe("category paths", () => {
  it("preserves category slugs and language in discovery links", () => {
    expect(paths.category("movie", "nowplaying", "en-US")).toBe(
      "/movie/category/nowplaying/?lang=en-US",
    );
    expect(paths.category("tv", "airingtoday", "ru-RU")).toBe(
      "/tv/category/airingtoday/?lang=ru-RU",
    );
  });

  it("builds dedicated discover routes for movies and tv", () => {
    expect(paths.movieDiscover("en-US")).toBe("/movie/discover/?lang=en-US");
    expect(paths.tvDiscover("ru-RU")).toBe("/tv/discover/?lang=ru-RU");
  });
});
