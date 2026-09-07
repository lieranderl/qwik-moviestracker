import * as v from "valibot";
import type { DocumentData } from "@google-cloud/firestore";
import type {
  CertificationList,
  Images,
  MediaCollection,
  WatchProviderCatalog,
  WatchProviderResults,
} from "./models/tmdb";
import type { ImdbRating } from "./models/imdb";
import type { JacRedResult, JacRedSearchResponse } from "./torrent-search";
import { UpstreamError, type UpstreamSource } from "./upstream";
export { parseTorrServerStatus } from "./torrserver/payloads";

const mediaSchema = v.looseObject({ id: v.number() });
const tmdbCollectionSchema = v.looseObject({
  page: v.optional(v.number()),
  results: v.array(mediaSchema),
  total_pages: v.optional(v.number()),
  total_results: v.optional(v.number()),
});
const tmdbCertificationListSchema = v.looseObject({
  certifications: v.record(
    v.string(),
    v.array(v.looseObject({ certification: v.string() })),
  ),
});
const tmdbProviderCatalogSchema = v.looseObject({
  results: v.array(v.looseObject({ provider_id: v.number() })),
});
const tmdbWatchProvidersSchema = v.looseObject({
  id: v.number(),
  results: v.record(v.string(), v.looseObject({})),
});
const tmdbImageSchema = v.looseObject({
  aspect_ratio: v.optional(v.number()),
  file_path: v.pipe(v.string(), v.minLength(1)),
  height: v.optional(v.number()),
  iso_639_1: v.optional(v.nullable(v.string())),
  vote_average: v.optional(v.number()),
  vote_count: v.optional(v.number()),
  width: v.optional(v.number()),
});
const tmdbImagesSchema = v.looseObject({
  id: v.number(),
  backdrops: v.array(tmdbImageSchema),
  logos: v.optional(v.array(tmdbImageSchema), []),
  posters: v.optional(v.array(tmdbImageSchema), []),
});

const firestoreCursorSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  timestampMillis: v.pipe(v.number(), v.safeInteger(), v.minValue(0)),
});

const firestoreMovieDocumentSchema = v.looseObject({
  Year: v.optional(v.string()),
  backdrop_path: v.optional(v.string()),
  genre_ids: v.optional(v.array(v.number())),
  id: v.optional(v.union([v.number(), v.string()])),
  original_title: v.optional(v.string()),
  poster_path: v.optional(v.string()),
  release_date: v.optional(v.string()),
  title: v.optional(v.string()),
  vote_average: v.optional(v.union([v.number(), v.string()])),
  vote_count: v.optional(v.union([v.number(), v.string()])),
  year: v.optional(v.string()),
});

const jacRedResultSchema = v.looseObject({
  availability_score: v.optional(v.number()),
  categories: v.optional(v.array(v.string())),
  category_labels: v.optional(v.array(v.string())),
  created_at: v.optional(v.string()),
  id: v.optional(v.string()),
  magnet: v.optional(v.string()),
  magnet_available: v.optional(v.boolean()),
  name: v.optional(v.string()),
  original_name: v.optional(v.string()),
  peers: v.optional(v.number()),
  quality: v.optional(v.number()),
  quality_label: v.optional(v.string()),
  seasons: v.optional(v.array(v.number())),
  seeders: v.optional(v.number()),
  size: v.optional(v.number()),
  size_name: v.optional(v.string()),
  source_url: v.optional(v.string()),
  title: v.optional(v.string()),
  tracker: v.optional(v.string()),
  updated_at: v.optional(v.string()),
  video_type: v.optional(v.string()),
  voices: v.optional(v.array(v.string())),
  year: v.optional(v.number()),
});
const jacRedResponseSchema = v.looseObject({
  facets: v.optional(v.unknown()),
  limit: v.optional(v.number()),
  loaded: v.optional(v.number()),
  open: v.optional(v.boolean()),
  query: v.optional(v.string()),
  results: v.array(jacRedResultSchema),
  total: v.optional(v.number()),
});

const imdbRatingSchema = v.looseObject({
  Id: v.string(),
  Rating: v.string(),
  Votes: v.optional(v.string()),
});

const parse = <
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
  source: UpstreamSource,
): v.InferOutput<TSchema> => {
  const result = v.safeParse(schema, input);
  if (result.success) return result.output;
  throw new UpstreamError({
    source,
    kind: "invalid-response",
    retryable: false,
    message: `${source} returned an invalid response`,
  });
};

export const parseTmdbCollection = <T extends { id: number }>(input: unknown) =>
  parse(tmdbCollectionSchema, input, "tmdb") as MediaCollection<T>;

export const parseTmdbDetail = <T extends { id: number }>(input: unknown): T =>
  parse(mediaSchema, input, "tmdb") as T;

export const parseTmdbCertificationList = (input: unknown): CertificationList =>
  parse(tmdbCertificationListSchema, input, "tmdb") as CertificationList;

export const parseTmdbProviderCatalog = (
  input: unknown,
): WatchProviderCatalog =>
  parse(tmdbProviderCatalogSchema, input, "tmdb") as WatchProviderCatalog;

export const parseTmdbWatchProviders = (input: unknown): WatchProviderResults =>
  parse(tmdbWatchProvidersSchema, input, "tmdb") as WatchProviderResults;

export const parseTmdbImages = (input: unknown): Images =>
  parse(tmdbImagesSchema, input, "tmdb") as Images;

export const parseFirestoreCursor = (input: unknown) =>
  parse(firestoreCursorSchema, input, "firestore");

export const parseFirestoreMovieDocument = (input: unknown): DocumentData =>
  parse(firestoreMovieDocumentSchema, input, "firestore");

export const parseJacRedSearchResponse = (
  input: unknown,
  fallbackQuery: string,
): JacRedSearchResponse => {
  const result = parse(jacRedResponseSchema, input, "jacred");
  return {
    facets: result.facets as JacRedSearchResponse["facets"],
    limit: result.limit ?? 0,
    loaded: result.loaded ?? 0,
    open: result.open ?? false,
    query: result.query ?? fallbackQuery,
    results: result.results as JacRedResult[],
    total: result.total ?? result.results.length,
  };
};

export const parseImdbRating = (input: unknown): ImdbRating => {
  const result = parse(imdbRatingSchema, input, "imdb");
  return { ...result, Votes: result.Votes ?? "" };
};
