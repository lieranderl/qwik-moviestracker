import * as v from "valibot";
import type {
  TorrServerSearchResult,
  TorrServerSettingsRaw,
  TorrServerStorageSettings,
  TorrServerTMDBSettingsRaw,
  TorrServerTorrentStatusRaw,
  TorrServerViewedItem,
} from "../torrserver";
import { TorrServerHttpError } from "./transport";

const fileSchema = v.looseObject({
  id: v.number(),
  length: v.number(),
  path: v.string(),
});

const statusSchema = v.looseObject({
  file_stats: v.optional(v.array(fileSchema)),
  files: v.optional(v.array(fileSchema)),
  hash: v.optional(v.string()),
  name: v.optional(v.string()),
});

const settingsSchema = v.looseObject({});

const storageSettingsSchema = v.looseObject({
  settings: v.optional(v.string()),
  viewed: v.optional(v.string()),
  viewedCount: v.optional(v.number()),
});

const tmdbSettingsSchema = v.looseObject({
  APIKey: v.optional(v.string()),
  APIURL: v.optional(v.string()),
  ImageURL: v.optional(v.string()),
  ImageURLRu: v.optional(v.string()),
  apiKey: v.optional(v.string()),
  apiUrl: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  imageUrlRu: v.optional(v.string()),
});

const viewedItemSchema = v.looseObject({
  file_index: v.optional(v.number()),
  hash: v.optional(v.string()),
});

const searchResultSchema = v.looseObject({
  hash: v.optional(v.string()),
  link: v.optional(v.string()),
  magnet: v.optional(v.string()),
  name: v.optional(v.string()),
  seed: v.optional(v.number()),
  seeders: v.optional(v.number()),
  title: v.optional(v.string()),
  year: v.optional(v.number()),
});

const stringRecordSchema = v.record(v.string(), v.string());

const parse = <
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
): v.InferOutput<TSchema> => {
  const result = v.safeParse(schema, input);
  if (result.success) return result.output;
  throw new TorrServerHttpError("TorrServer returned an invalid response", {
    kind: "validation",
  });
};

const assertRecord = (input: unknown): void => {
  if (input && typeof input === "object" && !Array.isArray(input)) return;
  throw new TorrServerHttpError("TorrServer returned an invalid response", {
    kind: "validation",
  });
};

export const parseTorrServerStatus = (
  input: unknown,
): TorrServerTorrentStatusRaw => {
  assertRecord(input);
  return parse(statusSchema, input) as TorrServerTorrentStatusRaw;
};

export const parseTorrServerStatusList = (
  input: unknown,
): TorrServerTorrentStatusRaw[] =>
  parse(v.array(v.unknown()), input).map(parseTorrServerStatus);

export const parseTorrServerSettings = (
  input: unknown,
): TorrServerSettingsRaw => {
  assertRecord(input);
  return parse(settingsSchema, input) as TorrServerSettingsRaw;
};

export const parseTorrServerStorageSettings = (
  input: unknown,
): Partial<TorrServerStorageSettings> => {
  assertRecord(input);
  return parse(
    storageSettingsSchema,
    input,
  ) as Partial<TorrServerStorageSettings>;
};

export const parseTorrServerTmdbSettings = (
  input: unknown,
): TorrServerTMDBSettingsRaw => {
  assertRecord(input);
  return parse(tmdbSettingsSchema, input) as TorrServerTMDBSettingsRaw;
};

export const parseTorrServerViewedList = (
  input: unknown,
): TorrServerViewedItem[] =>
  parse(v.array(v.unknown()), input).map((item) => {
    assertRecord(item);
    return parse(viewedItemSchema, item) as TorrServerViewedItem;
  });

export const parseTorrServerSearchResults = (
  input: unknown,
): TorrServerSearchResult[] =>
  parse(v.array(v.unknown()), input).map((item) => {
    assertRecord(item);
    return parse(searchResultSchema, item) as TorrServerSearchResult;
  });

export const parseTorrServerStringRecord = (
  input: unknown,
): Record<string, string> => parse(stringRecordSchema, input);
