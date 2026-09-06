import { MEDIA_PAGE_SIZE } from "~/utils/constants";
import { categoryToDb } from "~/utils/paths";
import { DbType, getMoviesFirestore } from "./firestore";
import type { MovieShort, TvShort } from "./models";
import { MediaType } from "./models";
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

const MOVIE_CATEGORY_QUERIES: Record<string, string | null> = {
  trending: null,
  popular: "popular",
  nowplaying: "now_playing",
  upcoming: "upcoming",
};

const TV_CATEGORY_QUERIES: Record<string, string | null> = {
  trending: null,
  toprated: "top_rated",
  popular: "popular",
  airingtoday: "airing_today",
  ontheair: "on_the_air",
};

type MovieCategoryContext = CatalogContext & {
  category: string;
  cursor?: string | null;
  page: number;
};

export type MovieCategoryItem = MovieShort & { year?: string };

export const loadMovieCategoryPage = async (
  context: MovieCategoryContext,
  dependencies = defaultDependencies,
): Promise<{ movies: MovieCategoryItem[]; nextCursor: string | null }> => {
  const query = MOVIE_CATEGORY_QUERIES[context.category];
  if (query === null) {
    const movies = await dependencies.getTrendingMedia({
      page: context.page,
      language: context.lang,
      type: MediaType.Movie,
    });
    return { movies: movies as MovieCategoryItem[], nextCursor: null };
  }
  if (query) {
    const movies = await dependencies.getMedias({
      page: context.page,
      language: context.lang,
      query,
      region:
        context.category === "nowplaying" || context.category === "upcoming"
          ? getRegionFromLanguage(context.lang)
          : undefined,
      type: MediaType.Movie,
    });
    return { movies: movies as MovieCategoryItem[], nextCursor: null };
  }

  const result = await dependencies.getMoviesFirestore({
    entriesOnPage: MEDIA_PAGE_SIZE,
    dbName: categoryToDb(context.category),
    cursor: context.cursor,
    language: context.lang,
    projectId: context.projectId,
    databaseId: context.databaseId,
  });
  return { movies: result.movies, nextCursor: result.nextCursor };
};

export const loadTvCategoryPage = async (
  context: { category: string; lang: string; page: number },
  dependencies = defaultDependencies,
): Promise<TvShort[]> => {
  const query = TV_CATEGORY_QUERIES[context.category];
  if (query === null) {
    return (await dependencies.getTrendingMedia({
      page: context.page,
      language: context.lang,
      type: MediaType.Tv,
    })) as TvShort[];
  }
  if (!query) return [];
  return (await dependencies.getMedias({
    page: context.page,
    language: context.lang,
    query,
    type: MediaType.Tv,
  })) as TvShort[];
};
