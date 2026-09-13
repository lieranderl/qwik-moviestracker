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
import {
  getFeaturedArtwork,
  getMedias,
  getRegionFromLanguage,
  getTrendingMedia,
  type FeaturedArtwork,
} from "./tmdb";
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
  getFeaturedArtwork: typeof getFeaturedArtwork;
  getMedias: (args: Parameters<typeof getMedias>[0]) => Promise<unknown[]>;
  getMoviesFirestore: typeof getMoviesFirestore;
  getTrendingMedia: (
    args: Parameters<typeof getTrendingMedia>[0],
  ) => Promise<unknown[]>;
};

const defaultDependencies: FeedLoaderDependencies = {
  getFeaturedArtwork,
  getMedias,
  getMoviesFirestore,
  getTrendingMedia,
};

type CatalogContext = {
  databaseId: string;
  lang: string;
  projectId: string;
};

const FEATURED_ITEM_LIMIT = 8;

export const selectFeaturedMovieCandidates = (
  movies: MovieShort[],
  limit = FEATURED_ITEM_LIMIT,
) =>
  movies
    .map((movie, index) => ({
      index,
      movie,
      quality:
        Number(Boolean(movie.poster_path)) + Number(Boolean(movie.overview)),
    }))
    .filter(
      ({ movie }) =>
        Boolean(movie.title?.trim()) && Boolean(movie.backdrop_path),
    )
    .sort(
      (left, right) => right.quality - left.quality || left.index - right.index,
    )
    .slice(0, Math.max(0, limit))
    .map(({ movie }) => movie);

export type FeaturedMovie = {
  artwork: FeaturedArtwork;
  movie: MovieShort;
};

export type FeaturedTv = {
  artwork: FeaturedArtwork;
  tv: TvShort;
};

const enrichFeaturedMovies = async (
  movies: MovieShort[],
  language: string,
  loadArtwork: typeof getFeaturedArtwork,
): Promise<FeaturedMovie[]> => {
  const results = await Promise.allSettled(
    movies.map(async (movie) => ({
      artwork: await loadArtwork({
        id: movie.id,
        language,
        type: MediaType.Movie,
      }),
      movie,
    })),
  );

  return results.flatMap((result) =>
    result.status === "fulfilled" && result.value.artwork.backdropPath
      ? [result.value]
      : [],
  );
};

export const loadFeaturedMovies = async (
  movies: MovieShort[],
  language: string,
  loadArtwork: typeof getFeaturedArtwork = getFeaturedArtwork,
): Promise<FeaturedMovie[]> =>
  enrichFeaturedMovies(
    selectFeaturedMovieCandidates(movies),
    language,
    loadArtwork,
  );

const selectFeaturedTvCandidates = (
  items: TvShort[],
  limit = FEATURED_ITEM_LIMIT,
) =>
  items
    .map((tv, index) => ({
      index,
      quality: Number(Boolean(tv.poster_path)) + Number(Boolean(tv.overview)),
      tv,
    }))
    .filter(({ tv }) => Boolean(tv.name?.trim()) && Boolean(tv.backdrop_path))
    .sort(
      (left, right) => right.quality - left.quality || left.index - right.index,
    )
    .slice(0, Math.max(0, limit))
    .map(({ tv }) => tv);

const interleaveUniqueMedia = <T extends { id: number }>(
  sources: T[][],
  limit: number,
) => {
  const positions = sources.map(() => 0);
  const selected: T[] = [];
  const selectedIds = new Set<number>();

  while (
    selected.length < limit &&
    sources.some((source, index) => positions[index] < source.length)
  ) {
    for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
      const source = sources[sourceIndex];
      while (positions[sourceIndex] < source.length) {
        const item = source[positions[sourceIndex]];
        positions[sourceIndex] += 1;
        if (!selectedIds.has(item.id)) {
          selected.push(item);
          selectedIds.add(item.id);
          break;
        }
      }
      if (selected.length >= limit) break;
    }
  }

  return selected;
};

const selectHdrDolbyFeaturedMovies = (
  hdrMovies: MovieShort[],
  dolbyMovies: MovieShort[],
  limit = FEATURED_ITEM_LIMIT,
) => {
  const sources = [
    selectFeaturedMovieCandidates(hdrMovies, limit),
    selectFeaturedMovieCandidates(dolbyMovies, limit),
  ];
  return interleaveUniqueMedia(sources, limit);
};

const loadFeaturedTv = async (
  trending: TvShort[],
  popular: TvShort[],
  language: string,
  loadArtwork: typeof getFeaturedArtwork,
): Promise<FeaturedTv[]> => {
  const selected = interleaveUniqueMedia(
    [selectFeaturedTvCandidates(trending), selectFeaturedTvCandidates(popular)],
    FEATURED_ITEM_LIMIT,
  );
  const results = await Promise.allSettled(
    selected.map(async (tv) => ({
      artwork: await loadArtwork({
        id: tv.id,
        language,
        type: MediaType.Tv,
      }),
      tv,
    })),
  );

  return results.flatMap((result) =>
    result.status === "fulfilled" && result.value.artwork.backdropPath
      ? [result.value]
      : [],
  );
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

  const homeMovies = (movies.data ?? []) as MovieShort[];
  const featuredMovies = await loadFeaturedMovies(
    homeMovies,
    context.lang,
    dependencies.getFeaturedArtwork,
  );

  return {
    featuredMovies,
    movies: homeMovies,
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
  const [movies, upcomingMovies, torMovies, hdrMovies, dolbyMovies] =
    await Promise.all([
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

  const hdrMovieItems = hdrMovies.data?.movies ?? [];
  const dolbyMovieItems = dolbyMovies.data?.movies ?? [];
  const featuredMovies = await enrichFeaturedMovies(
    selectHdrDolbyFeaturedMovies(hdrMovieItems, dolbyMovieItems),
    context.lang,
    dependencies.getFeaturedArtwork,
  );

  return {
    featuredMovies,
    movies: (movies.data ?? []) as MovieShort[],
    upcomingMovies: (upcomingMovies.data ?? []) as MovieShort[],
    torMovies: torMovies.data?.movies ?? [],
    hdrMovies: hdrMovieItems,
    dolbyMovies: dolbyMovieItems,
    failures: {
      movies: movies.failure,
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
  const [tvtrend, tvtoprated, tvpopular, tvontheair] = await Promise.all([
    settleFeedSection(
      "tmdb",
      dependencies.getTrendingMedia({
        page: 1,
        language: lang,
        type: MediaType.Tv,
      }),
    ),
    ...(["top_rated", "popular", "on_the_air"] as const).map((query) =>
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

  const trendingItems = (tvtrend.data ?? []) as TvShort[];
  const popularItems = (tvpopular.data ?? []) as TvShort[];
  const featuredTv = await loadFeaturedTv(
    trendingItems,
    popularItems,
    lang,
    dependencies.getFeaturedArtwork,
  );

  return {
    featuredTv,
    tvtrend: trendingItems,
    tvtoprated: (tvtoprated.data ?? []) as TvShort[],
    tvpopular: popularItems,
    tvontheair: (tvontheair.data ?? []) as TvShort[],
    failures: {
      tvtrend: tvtrend.failure,
      tvtoprated: tvtoprated.failure,
      tvpopular: tvpopular.failure,
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
