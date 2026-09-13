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
  loadFeaturedMovies,
  loadMovieCategoryPage,
  loadMovieCollections,
  loadTvCategoryPage,
  loadTvCollections,
  selectFeaturedMovieCandidates,
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
    artwork: [] as Array<{
      id: number;
      language: string;
      type: MediaType.Movie | MediaType.Tv;
    }>,
    firestore: [] as Array<
      Parameters<FeedLoaderDependencies["getMoviesFirestore"]>[0]
    >,
    medias: [] as Array<Parameters<FeedLoaderDependencies["getMedias"]>[0]>,
    trending: [] as Array<
      Parameters<FeedLoaderDependencies["getTrendingMedia"]>[0]
    >,
  };
  const dependencies: FeedLoaderDependencies = {
    getFeaturedArtwork: async (args) => {
      counts.tmdb += 1;
      calls.artwork.push(args);
      return {
        backdropPath: "/alien-localized-backdrop.jpg",
        logoPath: "/alien-logo.png",
        posterPath: "/alien-localized-poster.jpg",
      };
    },
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
  it("selects eight complete featured movies while preserving TMDB order", () => {
    const candidates = selectFeaturedMovieCandidates([
      { id: 1, title: "No backdrop" },
      {
        id: 2,
        title: "Complete first",
        backdrop_path: "/2.jpg",
        poster_path: "/2-poster.jpg",
        overview: "Overview",
      },
      { id: 3, title: "Backdrop only", backdrop_path: "/3.jpg" },
      {
        id: 4,
        title: "Complete second",
        backdrop_path: "/4.jpg",
        poster_path: "/4-poster.jpg",
        overview: "Overview",
      },
      {
        id: 5,
        title: "Poster only",
        backdrop_path: "/5.jpg",
        poster_path: "/5-poster.jpg",
      },
      {
        id: 6,
        title: "Complete third",
        backdrop_path: "/6.jpg",
        poster_path: "/6-poster.jpg",
        overview: "Overview",
      },
      {
        id: 7,
        title: "Complete fourth",
        backdrop_path: "/7.jpg",
        poster_path: "/7-poster.jpg",
        overview: "Overview",
      },
      {
        id: 8,
        title: "Complete fifth",
        backdrop_path: "/8.jpg",
        poster_path: "/8-poster.jpg",
        overview: "Overview",
      },
      {
        id: 9,
        title: "Complete sixth",
        backdrop_path: "/9.jpg",
        poster_path: "/9-poster.jpg",
        overview: "Overview",
      },
      {
        id: 10,
        title: "Complete seventh",
        backdrop_path: "/10.jpg",
        poster_path: "/10-poster.jpg",
        overview: "Overview",
      },
      {
        id: 11,
        title: "Complete eighth",
        backdrop_path: "/11.jpg",
        poster_path: "/11-poster.jpg",
        overview: "Overview",
      },
    ]);

    expect(candidates.map(({ id }) => id)).toEqual([2, 4, 6, 7, 8, 9, 10, 11]);
  });

  it("starts all featured artwork requests in parallel", async () => {
    const started: number[] = [];
    let release!: () => void;
    const pendingArtwork = new Promise<void>((resolve) => {
      release = resolve;
    });
    const movies = [1, 2, 3, 4].map(
      (id) =>
        ({
          id,
          title: `Movie ${id}`,
          backdrop_path: `/${id}.jpg`,
          poster_path: `/${id}-poster.jpg`,
          overview: "Overview",
        }) satisfies MovieShort,
    );

    const pending = loadFeaturedMovies(movies, "ru-RU", async ({ id }) => {
      started.push(id);
      await pendingArtwork;
      return {
        backdropPath: `/${id}-localized.jpg`,
        logoPath: null,
        posterPath: `/${id}-localized-poster.jpg`,
      };
    });
    await Promise.resolve();

    expect(started).toEqual([1, 2, 3, 4]);
    release();
    await pending;
  });

  it("skips a featured movie when its artwork request fails", async () => {
    const movies = [1, 2].map(
      (id) =>
        ({
          id,
          title: `Movie ${id}`,
          backdrop_path: `/${id}.jpg`,
          poster_path: `/${id}-poster.jpg`,
          overview: "Overview",
        }) satisfies MovieShort,
    );

    const featured = await loadFeaturedMovies(
      movies,
      "en-US",
      async ({ id }) => {
        if (id === 1) throw new TypeError("network");
        return {
          backdropPath: "/2-localized.jpg",
          logoPath: null,
          posterPath: "/2-localized-poster.jpg",
        };
      },
    );

    expect(featured.map(({ movie }) => movie.id)).toEqual([2]);
  });

  it("skips a featured movie when TMDB has no clean backdrop", async () => {
    const featured = await loadFeaturedMovies(
      [
        {
          id: 1,
          title: "Movie 1",
          backdrop_path: "/fallback-with-title.jpg",
          poster_path: "/1-poster.jpg",
          overview: "Overview",
        } as MovieShort,
      ],
      "en-US",
      async () => ({
        backdropPath: null,
        logoPath: "/1-logo.png",
        posterPath: "/1-localized-poster.jpg",
      }),
    );

    expect(featured).toEqual([]);
  });

  it("loads home feeds and localized featured artwork", async () => {
    const { counts, dependencies } = createDependencies();
    const result = await loadHomeFeed(
      { lang: "en-US", projectId: "project", databaseId: "moviestracker" },
      dependencies,
    );

    expect(counts).toEqual({ tmdb: 3, firestore: 1 });
    expect(result).toEqual({
      featuredMovies: [
        {
          artwork: {
            backdropPath: "/alien-localized-backdrop.jpg",
            logoPath: "/alien-logo.png",
            posterPath: "/alien-localized-poster.jpg",
          },
          movie,
        },
      ],
      movies: [movie],
      tv: [tv],
      torMovies: [catalogMovie],
      failures: {
        movies: undefined,
        tv: undefined,
        torMovies: undefined,
      },
    });
  });

  it("keeps successful home sections when one provider fails", async () => {
    const { counts, dependencies } = createDependencies();
    dependencies.getTrendingMedia = async (args) => {
      counts.tmdb += 1;
      if (args.type === MediaType.Movie) throw new TypeError("network");
      return [tv];
    };

    const result = await loadHomeFeed(
      { lang: "en-US", projectId: "project", databaseId: "moviestracker" },
      dependencies,
    );

    expect(counts).toEqual({ tmdb: 2, firestore: 1 });
    expect(result.movies).toEqual([]);
    expect(result.tv).toEqual([tv]);
    expect(result.torMovies).toEqual([catalogMovie]);
    expect(result.failures.movies).toMatchObject({
      source: "tmdb",
      kind: "unavailable",
    });
  });

  it("settles every movie and TV collection independently", async () => {
    const movieDeps = createDependencies();
    movieDeps.dependencies.getMedias = async (args) => {
      movieDeps.counts.tmdb += 1;
      if (args.query === "upcoming") throw new TypeError("network");
      return [movie];
    };
    const movies = await loadMovieCollections(
      { lang: "en-US", projectId: "project", databaseId: "moviestracker" },
      movieDeps.dependencies,
    );
    expect(movieDeps.counts).toEqual({ tmdb: 3, firestore: 3 });
    expect(movies.upcomingMovies).toEqual([]);
    expect(movies.movies).toEqual([movie]);
    expect(movies.failures.upcomingMovies?.source).toBe("tmdb");

    const tvDeps = createDependencies();
    tvDeps.dependencies.getMedias = async (args) => {
      tvDeps.counts.tmdb += 1;
      if (args.query === "top_rated") throw new TypeError("network");
      return [tv];
    };
    const television = await loadTvCollections(
      { lang: "en-US" },
      tvDeps.dependencies,
    );
    expect(tvDeps.counts).toEqual({ tmdb: 5, firestore: 0 });
    expect(television.tvtoprated).toEqual([]);
    expect(television.tvpopular).toEqual([tv]);
    expect(television.failures.tvtoprated?.source).toBe("tmdb");
  });

  it("loads the movie landing collections without popular or now-playing requests", async () => {
    const { calls, counts, dependencies } = createDependencies();
    const result = await loadMovieCollections(
      { lang: "en-US", projectId: "project", databaseId: "moviestracker" },
      dependencies,
    );

    expect(counts).toEqual({ tmdb: 3, firestore: 3 });
    expect(calls.medias.map(({ query }) => query)).toEqual(["upcoming"]);
    expect(result.featuredMovies.map(({ movie }) => movie.id)).toEqual([1]);
    expect(result.torMovies[0]?.backdrop_path).toBe("/alien-backdrop.jpg");
    expect(result.hdrMovies[0]?.poster_path).toBe("/alien-poster.jpg");
    expect(result.dolbyMovies[0]?.backdrop_path).toBe("/alien-backdrop.jpg");
  });

  it("builds eight unique featured movies by alternating HDR and Dolby Vision", async () => {
    const { calls, counts, dependencies } = createDependencies();
    const catalog = (id: number) =>
      ({
        ...movie,
        id,
        title: `Movie ${id}`,
        backdrop_path: `/${id}.jpg`,
        poster_path: `/${id}-poster.jpg`,
        overview: "Overview",
        year: "2026",
      }) satisfies MovieCatalog;
    const hdrMovies = [catalog(11), catalog(13), catalog(15), catalog(17)];
    const dolbyMovies = [catalog(12), catalog(14), catalog(16), catalog(18)];

    dependencies.getMoviesFirestore = async (args) => {
      counts.firestore += 1;
      calls.firestore.push(args);
      if (args.dbName === DbType.HDR10) {
        return { movies: hdrMovies, nextCursor: null };
      }
      if (args.dbName === DbType.DV) {
        return { movies: dolbyMovies, nextCursor: null };
      }
      return { movies: [catalogMovie], nextCursor: null };
    };
    dependencies.getFeaturedArtwork = async (args) => {
      counts.tmdb += 1;
      calls.artwork.push(args);
      return {
        backdropPath: `/${args.id}-clean.jpg`,
        logoPath: `/${args.id}-logo.png`,
        posterPath: `/${args.id}-localized-poster.jpg`,
      };
    };

    const result = await loadMovieCollections(
      { lang: "en-US", projectId: "project", databaseId: "moviestracker" },
      dependencies,
    );

    expect(result.featuredMovies.map(({ movie }) => movie.id)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18,
    ]);
    expect(calls.artwork.map(({ id }) => id)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18,
    ]);
  });

  it("loads TV landing collections without an Airing Today request", async () => {
    const { calls, counts, dependencies } = createDependencies();
    const result = await loadTvCollections({ lang: "en-US" }, dependencies);

    expect(counts).toEqual({ tmdb: 5, firestore: 0 });
    expect(calls.medias.map(({ query }) => query)).toEqual([
      "top_rated",
      "popular",
      "on_the_air",
    ]);
    expect(result.featuredTv.map(({ tv }) => tv.id)).toEqual([2]);
    expect(result.tvtrend).toEqual([tv]);
    expect(result.tvontheair).toEqual([tv]);
  });

  it("builds eight unique featured series by alternating Trending and Popular", async () => {
    const { calls, counts, dependencies } = createDependencies();
    const series = (id: number) =>
      ({
        ...tv,
        id,
        name: `Series ${id}`,
        backdrop_path: `/${id}.jpg`,
        poster_path: `/${id}-poster.jpg`,
        overview: "Overview",
        first_air_date: "2026-01-01",
        release_date: "2026-01-01",
      }) satisfies TvShort;
    const trending = [series(11), series(13), series(15), series(17)];
    const popular = [series(12), series(14), series(16), series(18)];

    dependencies.getTrendingMedia = async (args) => {
      counts.tmdb += 1;
      calls.trending.push(args);
      return trending;
    };
    dependencies.getMedias = async (args) => {
      counts.tmdb += 1;
      calls.medias.push(args);
      return args.query === "popular" ? popular : [tv];
    };
    dependencies.getFeaturedArtwork = async (args) => {
      counts.tmdb += 1;
      calls.artwork.push(args);
      return {
        backdropPath: `/${args.id}-clean.jpg`,
        logoPath: `/${args.id}-logo.png`,
        posterPath: `/${args.id}-localized-poster.jpg`,
      };
    };

    const result = await loadTvCollections({ lang: "en-US" }, dependencies);

    expect(result.featuredTv.map(({ tv }) => tv.id)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18,
    ]);
    expect(calls.artwork).toEqual(
      [11, 12, 13, 14, 15, 16, 17, 18].map((id) => ({
        id,
        language: "en-US",
        type: MediaType.Tv,
      })),
    );
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
