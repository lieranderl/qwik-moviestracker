import { describe, expect, it } from "bun:test";
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
  const dependencies: FeedLoaderDependencies = {
    getTrendingMedia: async ({ type }) => {
      counts.tmdb += 1;
      return type === MediaType.Movie ? [movie] : [tv];
    },
    getMedias: async ({ type }) => {
      counts.tmdb += 1;
      return type === MediaType.Movie ? [movie] : [tv];
    },
    getMoviesFirestore: async () => {
      counts.firestore += 1;
      return { movies: [catalogMovie], nextCursor: null };
    },
  };
  return { counts, dependencies };
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

  it("loads each TMDB category page with one upstream request", async () => {
    const { counts, dependencies } = createDependencies();

    const moviePage = await loadMovieCategoryPage(
      {
        category: "popular",
        databaseId: "moviestracker",
        lang: "en-US",
        page: 2,
        projectId: "project",
      },
      dependencies,
    );
    const tvPage = await loadTvCategoryPage(
      { category: "toprated", lang: "en-US", page: 2 },
      dependencies,
    );

    expect(counts).toEqual({ tmdb: 2, firestore: 0 });
    expect(moviePage.movies[0]?.backdrop_path).toBe("/alien-backdrop.jpg");
    expect(tvPage).toEqual([tv]);
  });

  it("loads each Firestore category page once without changing stored images", async () => {
    const { counts, dependencies } = createDependencies();

    const page = await loadMovieCategoryPage(
      {
        category: "updated",
        databaseId: "moviestracker",
        lang: "en-US",
        page: 1,
        projectId: "project",
      },
      dependencies,
    );

    expect(counts).toEqual({ tmdb: 0, firestore: 1 });
    expect(page.movies[0]?.backdrop_path).toBe("/alien-backdrop.jpg");
  });
});
