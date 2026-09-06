import { describe, expect, it } from "bun:test";
import { DbType } from "./firestore";
import {
  MediaType,
  type MovieCatalog,
  type MovieShort,
  type TvShort,
} from "./models";
import {
  loadHomeFeed,
  loadMovieCategoryPage,
  loadMovieCollections,
  loadTvCategoryPage,
  loadTvCollections,
  type FeedLoaderDependencies,
} from "./feed-loaders";
import {
  isMovieCategory,
  isTvCategory,
  MOVIE_CATEGORIES,
  TV_CATEGORIES,
  type MovieCategory,
  type TvCategory,
} from "./media-categories";

const movie = {
  id: 1,
  title: "Alien",
  backdrop_path: "/alien-backdrop.jpg",
  poster_path: "/alien-poster.jpg",
} as MovieShort;
const tv = {
  id: 2,
  name: "Severance",
  backdrop_path: "/severance-backdrop.jpg",
  poster_path: "/severance-poster.jpg",
} as TvShort;
const catalogMovie = { ...movie, year: "1979" } as MovieCatalog;

const createDependencies = () => {
  const counts = { firestore: 0, tmdb: 0 };
  const calls = {
    firestore: [] as Array<
      Parameters<FeedLoaderDependencies["getMoviesFirestore"]>[0]
    >,
    medias: [] as Array<Parameters<FeedLoaderDependencies["getMedias"]>[0]>,
    trending: [] as Array<
      Parameters<FeedLoaderDependencies["getTrendingMedia"]>[0]
    >,
  };
  const dependencies: FeedLoaderDependencies = {
    getTrendingMedia: async (args) => {
      counts.tmdb += 1;
      calls.trending.push(args);
      return args.type === MediaType.Movie ? [movie] : [tv];
    },
    getMedias: async (args) => {
      counts.tmdb += 1;
      calls.medias.push(args);
      return args.type === MediaType.Movie ? [movie] : [tv];
    },
    getMoviesFirestore: async (args) => {
      counts.firestore += 1;
      calls.firestore.push(args);
      return { movies: [catalogMovie], nextCursor: null };
    },
  };
  return { calls, counts, dependencies };
};

describe("feed loaders", () => {
  it("loads home with two TMDB requests and one Firestore request", async () => {
    const { counts, dependencies } = createDependencies();
    const result = await loadHomeFeed(
      { lang: "en-US", projectId: "project", databaseId: "moviestracker" },
      dependencies,
    );

    expect(counts).toEqual({ tmdb: 2, firestore: 1 });
    expect(result).toEqual({
      movies: [movie],
      tv: [tv],
      torMovies: [catalogMovie],
    });
  });

  it("loads movies with four TMDB requests and three Firestore requests", async () => {
    const { counts, dependencies } = createDependencies();
    const result = await loadMovieCollections(
      { lang: "en-US", projectId: "project", databaseId: "moviestracker" },
      dependencies,
    );

    expect(counts).toEqual({ tmdb: 4, firestore: 3 });
    expect(result.torMovies[0]?.backdrop_path).toBe("/alien-backdrop.jpg");
    expect(result.hdrMovies[0]?.poster_path).toBe("/alien-poster.jpg");
    expect(result.dolbyMovies[0]?.backdrop_path).toBe("/alien-backdrop.jpg");
  });

  it("loads TV collections with five TMDB requests", async () => {
    const { counts, dependencies } = createDependencies();
    const result = await loadTvCollections({ lang: "en-US" }, dependencies);

    expect(counts).toEqual({ tmdb: 5, firestore: 0 });
    expect(result.tvtrend).toEqual([tv]);
    expect(result.tvontheair).toEqual([tv]);
  });

  const movieCases: Array<{
    category: MovieCategory;
    source: "firestore" | "medias" | "trending";
    mapping: DbType | null | string;
  }> = [
    { category: "trending", source: "trending", mapping: null },
    { category: "popular", source: "medias", mapping: "popular" },
    { category: "nowplaying", source: "medias", mapping: "now_playing" },
    { category: "upcoming", source: "medias", mapping: "upcoming" },
    { category: "updated", source: "firestore", mapping: DbType.LastMovies },
    { category: "hdr10", source: "firestore", mapping: DbType.HDR10 },
    { category: "dolbyvision", source: "firestore", mapping: DbType.DV },
  ];

  for (const testCase of movieCases) {
    it(`maps movie category ${testCase.category} to one ${testCase.source} request`, async () => {
      const { calls, counts, dependencies } = createDependencies();
      const page = await loadMovieCategoryPage(
        {
          category: testCase.category,
          databaseId: "moviestracker",
          lang: "en-US",
          page: 2,
          projectId: "project",
        },
        dependencies,
      );

      expect(counts.tmdb + counts.firestore).toBe(1);
      expect((calls.trending[0]?.type ?? null) as unknown).toBe(
        testCase.source === "trending" ? MediaType.Movie : null,
      );
      expect((calls.medias[0]?.query ?? null) as unknown).toBe(
        testCase.source === "medias" ? testCase.mapping : null,
      );
      expect((calls.firestore[0]?.dbName ?? null) as unknown).toBe(
        testCase.source === "firestore" ? testCase.mapping : null,
      );
      expect(page.movies[0]?.backdrop_path).toBe("/alien-backdrop.jpg");
    });
  }

  const tvCases: Array<{
    category: TvCategory;
    source: "medias" | "trending";
    query: null | string;
  }> = [
    { category: "trending", source: "trending", query: null },
    { category: "toprated", source: "medias", query: "top_rated" },
    { category: "popular", source: "medias", query: "popular" },
    { category: "airingtoday", source: "medias", query: "airing_today" },
    { category: "ontheair", source: "medias", query: "on_the_air" },
  ];

  for (const testCase of tvCases) {
    it(`maps TV category ${testCase.category} to one ${testCase.source} request`, async () => {
      const { calls, counts, dependencies } = createDependencies();
      const page = await loadTvCategoryPage(
        { category: testCase.category, lang: "en-US", page: 2 },
        dependencies,
      );

      expect(counts.tmdb + counts.firestore).toBe(1);
      expect((calls.trending[0]?.type ?? null) as unknown).toBe(
        testCase.source === "trending" ? MediaType.Tv : null,
      );
      expect((calls.medias[0]?.query ?? null) as unknown).toBe(testCase.query);
      expect(page).toEqual([tv]);
    });
  }

  it("uses category definitions as the validation source of truth", () => {
    expect(Object.keys(MOVIE_CATEGORIES)).toEqual(
      movieCases.map(({ category }) => category),
    );
    expect(Object.keys(TV_CATEGORIES)).toEqual(
      tvCases.map(({ category }) => category),
    );
    expect(isMovieCategory("dolbyvision")).toBe(true);
    expect(isMovieCategory("unknown")).toBe(false);
    expect(isTvCategory("ontheair")).toBe(true);
    expect(isTvCategory("unknown")).toBe(false);
  });
});
