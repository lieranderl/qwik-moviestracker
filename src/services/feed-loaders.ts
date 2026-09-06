import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { DbType, getMoviesFirestore } from "./firestore";
import type { MovieShort, TvShort } from "./models";
import { MediaType } from "./models";
import {
  MOVIE_CATEGORIES,
  TV_CATEGORIES,
  type MovieCategory,
  type TvCategory,
} from "./media-categories";
import { getMedias, getRegionFromLanguage, getTrendingMedia } from "./tmdb";

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
    dependencies.getTrendingMedia({
      page: 1,
      language: context.lang,
      type: MediaType.Movie,
    }),
    dependencies.getTrendingMedia({
      page: 1,
      language: context.lang,
      type: MediaType.Tv,
    }),
    dependencies.getMoviesFirestore({
      entriesOnPage: MEDIA_PAGE_SIZE,
      language: context.lang,
      dbName: DbType.LastMovies,
      projectId: context.projectId,
      databaseId: context.databaseId,
    }),
  ]);

  return {
    movies: movies as MovieShort[],
    tv: tv as TvShort[],
    torMovies: torMoviesPage.movies,
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
    dependencies.getTrendingMedia({
      page: 1,
      language: context.lang,
      type: MediaType.Movie,
    }),
    dependencies.getMedias({
      page: 1,
      query: "popular",
      language: context.lang,
      type: MediaType.Movie,
    }),
    dependencies.getMedias({
      page: 1,
      query: "now_playing",
      language: context.lang,
      region,
      type: MediaType.Movie,
    }),
    dependencies.getMedias({
      page: 1,
      query: "upcoming",
      language: context.lang,
      region,
      type: MediaType.Movie,
    }),
    ...([DbType.LastMovies, DbType.HDR10, DbType.DV] as const).map((dbName) =>
      dependencies.getMoviesFirestore({
        entriesOnPage: MEDIA_PAGE_SIZE,
        language: context.lang,
        dbName,
        projectId: context.projectId,
        databaseId: context.databaseId,
      }),
    ),
  ]);

  return {
    movies: movies as MovieShort[],
    popularMovies: popularMovies as MovieShort[],
    nowPlayingMovies: nowPlayingMovies as MovieShort[],
    upcomingMovies: upcomingMovies as MovieShort[],
    torMovies: torMovies.movies,
    hdrMovies: hdrMovies.movies,
    dolbyMovies: dolbyMovies.movies,
  };
};

export const loadTvCollections = async (
  { lang }: { lang: string },
  dependencies = defaultDependencies,
) => {
  const [tvtrend, tvtoprated, tvpopular, tvairingtoday, tvontheair] =
    await Promise.all([
      dependencies.getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Tv,
      }),
      ...(["top_rated", "popular", "airing_today", "on_the_air"] as const).map(
        (query) =>
          dependencies.getMedias({
            page: 1,
            query,
            language: lang,
            type: MediaType.Tv,
          }),
      ),
    ]);

  return {
    tvtrend: tvtrend as TvShort[],
    tvtoprated: tvtoprated as TvShort[],
    tvpopular: tvpopular as TvShort[],
    tvairingtoday: tvairingtoday as TvShort[],
    tvontheair: tvontheair as TvShort[],
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
