import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { DbType, getMoviesFirestore } from "./firestore";
import type { MovieShort, TvShort } from "./models/tmdb";
import { MediaType } from "./models/tmdb";
import {
  MOVIE_CATEGORIES,
  TV_CATEGORIES,
  type MovieCategory,
  type TvCategory,
} from "./media-categories";
import { getMedias, getRegionFromLanguage, getTrendingMedia } from "./tmdb";
import {
  toUpstreamFailure,
  type UpstreamFailureDetails,
  type UpstreamSource,
} from "./upstream";

export type FeedFailures = Record<string, UpstreamFailureDetails | undefined>;

const settleFeedSection = async <T>(
  source: UpstreamSource,
  load: Promise<T>,
): Promise<{ data: T | null; failure?: UpstreamFailureDetails }> => {
  try {
    return { data: await load };
  } catch (error) {
    const result = toUpstreamFailure(error, source);
    return { data: null, failure: result.ok ? undefined : result.error };
  }
};

export type FeedLoaderDependencies = {
  getMedias: (args: Parameters<typeof getMedias>[0]) => Promise<unknown[]>;
  getMoviesFirestore: typeof getMoviesFirestore;
  getTrendingMedia: (
    args: Parameters<typeof getTrendingMedia>[0],
  ) => Promise<unknown[]>;
};

const defaultDependencies: FeedLoaderDependencies = {
  getMedias,
  getMoviesFirestore,
  getTrendingMedia,
};

type CatalogContext = {
  databaseId: string;
  lang: string;
  projectId: string;
};

export const loadHomeFeed = async (
  context: CatalogContext,
  dependencies = defaultDependencies,
) => {
  const [movies, tv, torMoviesPage] = await Promise.all([
    settleFeedSection(
      "tmdb",
      dependencies.getTrendingMedia({
        page: 1,
        language: context.lang,
        type: MediaType.Movie,
      }),
    ),
    settleFeedSection(
      "tmdb",
      dependencies.getTrendingMedia({
        page: 1,
        language: context.lang,
        type: MediaType.Tv,
      }),
    ),
    settleFeedSection(
      "firestore",
      dependencies.getMoviesFirestore({
        entriesOnPage: MEDIA_PAGE_SIZE,
        language: context.lang,
        dbName: DbType.LastMovies,
        projectId: context.projectId,
        databaseId: context.databaseId,
      }),
    ),
  ]);

  return {
    movies: (movies.data ?? []) as MovieShort[],
    tv: (tv.data ?? []) as TvShort[],
    torMovies: torMoviesPage.data?.movies ?? [],
    failures: {
      movies: movies.failure,
      tv: tv.failure,
      torMovies: torMoviesPage.failure,
    } satisfies FeedFailures,
  };
};

export const loadMovieCollections = async (
  context: CatalogContext,
  dependencies = defaultDependencies,
) => {
  const region = getRegionFromLanguage(context.lang);
  const [
    movies,
    popularMovies,
    nowPlayingMovies,
    upcomingMovies,
    torMovies,
    hdrMovies,
    dolbyMovies,
  ] = await Promise.all([
    settleFeedSection(
      "tmdb",
      dependencies.getTrendingMedia({
        page: 1,
        language: context.lang,
        type: MediaType.Movie,
      }),
    ),
    settleFeedSection(
      "tmdb",
      dependencies.getMedias({
        page: 1,
        query: "popular",
        language: context.lang,
        type: MediaType.Movie,
      }),
    ),
    settleFeedSection(
      "tmdb",
      dependencies.getMedias({
        page: 1,
        query: "now_playing",
        language: context.lang,
        region,
        type: MediaType.Movie,
      }),
    ),
    settleFeedSection(
      "tmdb",
      dependencies.getMedias({
        page: 1,
        query: "upcoming",
        language: context.lang,
        region,
        type: MediaType.Movie,
      }),
    ),
    ...([DbType.LastMovies, DbType.HDR10, DbType.DV] as const).map((dbName) =>
      settleFeedSection(
        "firestore",
        dependencies.getMoviesFirestore({
          entriesOnPage: MEDIA_PAGE_SIZE,
          language: context.lang,
          dbName,
          projectId: context.projectId,
          databaseId: context.databaseId,
        }),
      ),
    ),
  ]);

  return {
    movies: (movies.data ?? []) as MovieShort[],
    popularMovies: (popularMovies.data ?? []) as MovieShort[],
    nowPlayingMovies: (nowPlayingMovies.data ?? []) as MovieShort[],
    upcomingMovies: (upcomingMovies.data ?? []) as MovieShort[],
    torMovies: torMovies.data?.movies ?? [],
    hdrMovies: hdrMovies.data?.movies ?? [],
    dolbyMovies: dolbyMovies.data?.movies ?? [],
    failures: {
      movies: movies.failure,
      popularMovies: popularMovies.failure,
      nowPlayingMovies: nowPlayingMovies.failure,
      upcomingMovies: upcomingMovies.failure,
      torMovies: torMovies.failure,
      hdrMovies: hdrMovies.failure,
      dolbyMovies: dolbyMovies.failure,
    } satisfies FeedFailures,
  };
};

export const loadTvCollections = async (
  { lang }: { lang: string },
  dependencies = defaultDependencies,
) => {
  const [tvtrend, tvtoprated, tvpopular, tvairingtoday, tvontheair] =
    await Promise.all([
      settleFeedSection(
        "tmdb",
        dependencies.getTrendingMedia({
          page: 1,
          language: lang,
          type: MediaType.Tv,
        }),
      ),
      ...(["top_rated", "popular", "airing_today", "on_the_air"] as const).map(
        (query) =>
          settleFeedSection(
            "tmdb",
            dependencies.getMedias({
              page: 1,
              query,
              language: lang,
              type: MediaType.Tv,
            }),
          ),
      ),
    ]);

  return {
    tvtrend: (tvtrend.data ?? []) as TvShort[],
    tvtoprated: (tvtoprated.data ?? []) as TvShort[],
    tvpopular: (tvpopular.data ?? []) as TvShort[],
    tvairingtoday: (tvairingtoday.data ?? []) as TvShort[],
    tvontheair: (tvontheair.data ?? []) as TvShort[],
    failures: {
      tvtrend: tvtrend.failure,
      tvtoprated: tvtoprated.failure,
      tvpopular: tvpopular.failure,
      tvairingtoday: tvairingtoday.failure,
      tvontheair: tvontheair.failure,
    } satisfies FeedFailures,
  };
};

type MovieCategoryContext = CatalogContext & {
  category: MovieCategory;
  cursor?: string | null;
  page: number;
};

export type MovieCategoryItem = MovieShort & { year?: string };

export const loadMovieCategoryPage = async (
  context: MovieCategoryContext,
  dependencies = defaultDependencies,
): Promise<{ movies: MovieCategoryItem[]; nextCursor: string | null }> => {
  const definition = MOVIE_CATEGORIES[context.category];
  if (definition.source === "trending") {
    const movies = await dependencies.getTrendingMedia({
      page: context.page,
      language: context.lang,
      type: MediaType.Movie,
    });
    return { movies: movies as MovieCategoryItem[], nextCursor: null };
  }
  if (definition.source === "tmdb") {
    const movies = await dependencies.getMedias({
      page: context.page,
      language: context.lang,
      query: definition.query,
      region:
        "useRegion" in definition && definition.useRegion
          ? getRegionFromLanguage(context.lang)
          : undefined,
      type: MediaType.Movie,
    });
    return { movies: movies as MovieCategoryItem[], nextCursor: null };
  }

  const result = await dependencies.getMoviesFirestore({
    entriesOnPage: MEDIA_PAGE_SIZE,
    dbName: definition.dbName,
    cursor: context.cursor,
    language: context.lang,
    projectId: context.projectId,
    databaseId: context.databaseId,
  });
  return { movies: result.movies, nextCursor: result.nextCursor };
};

export const loadTvCategoryPage = async (
  context: { category: TvCategory; lang: string; page: number },
  dependencies = defaultDependencies,
): Promise<TvShort[]> => {
  const definition = TV_CATEGORIES[context.category];
  if (definition.source === "trending") {
    return (await dependencies.getTrendingMedia({
      page: context.page,
      language: context.lang,
      type: MediaType.Tv,
    })) as TvShort[];
  }
  return (await dependencies.getMedias({
    page: context.page,
    language: context.lang,
    query: definition.query,
    type: MediaType.Tv,
  })) as TvShort[];
};
