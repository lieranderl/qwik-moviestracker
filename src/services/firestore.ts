import {
  FieldPath,
  Firestore,
  Timestamp,
  type DocumentData,
} from "@google-cloud/firestore";
import type { MovieCatalog } from "./models/catalog";
import {
  parseFirestoreCursor,
  parseFirestoreMovieDocument,
} from "./provider-contracts";
import { BoundedAsyncCache, CACHE_TTL_MS } from "./server-cache";

export enum DbType {
  LastMovies = "latesttorrentsmovies",
  HDR10 = "hdr10movies",
  DV = "dvmovies",
}

type MovieCursor = {
  id: string;
  timestampMillis: number;
};

type GetMoviesFirestore = {
  cursor?: string | null;
  databaseId?: string;
  dbName: string;
  entriesOnPage: number;
  language?: string;
  projectId: string;
};

export type MoviePage = {
  movies: MovieCatalog[];
  nextCursor: string | null;
};

type FirestoreGlobal = typeof globalThis & {
  __moviesFirestoreClients?: Map<string, Firestore>;
};

const firestoreCatalogCache = new BoundedAsyncCache();

export const clearFirestoreCatalogCacheForTests = () =>
  firestoreCatalogCache.clear();

export const loadFirestoreCatalog = async (
  key: string,
  load: () => Promise<MoviePage>,
) =>
  (
    await firestoreCatalogCache.getOrLoad(
      key,
      CACHE_TTL_MS.firestoreCatalog,
      load,
    )
  ).value;

export const encodeMovieCursor = (cursor: MovieCursor) =>
  Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");

export const decodeMovieCursor = (value: string): MovieCursor => {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return parseFirestoreCursor(parsed);
  } catch {
    throw new Error("Invalid movie cursor");
  }
};

const optionalString = (value: unknown) =>
  typeof value === "string" ? value : undefined;
const optionalNumber = (value: unknown) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
};

export const mapMovieDocument = (
  documentId: string,
  data: DocumentData,
): MovieCatalog => {
  const parsed = parseFirestoreMovieDocument(data);
  return {
    backdrop_path: optionalString(parsed.backdrop_path),
    genre_ids: Array.isArray(data.genre_ids)
      ? data.genre_ids.filter(
          (value): value is number => typeof value === "number",
        )
      : undefined,
    id: optionalNumber(data.id) ?? Number(documentId),
    lasttimefound:
      data.lasttimefound instanceof Timestamp
        ? data.lasttimefound.toDate()
        : undefined,
    original_title: optionalString(data.original_title),
    poster_path: optionalString(data.poster_path),
    release_date: optionalString(data.release_date),
    title: optionalString(data.title),
    vote_average: optionalNumber(data.vote_average),
    vote_count: optionalNumber(data.vote_count),
    year: optionalString(parsed.Year) ?? optionalString(parsed.year) ?? "",
  };
};

const getClient = (projectId: string, databaseId: string) => {
  if (!projectId.trim()) {
    throw new Error("GCP_PROJECT is required");
  }
  const globalState = globalThis as FirestoreGlobal;
  globalState.__moviesFirestoreClients ??= new Map();
  const key = `${projectId}/${databaseId}`;
  let client = globalState.__moviesFirestoreClients.get(key);
  if (!client) {
    client = new Firestore({ projectId, databaseId });
    globalState.__moviesFirestoreClients.set(key, client);
  }
  return client;
};

export const getMoviesFirestore = async ({
  cursor,
  databaseId = "moviestracker",
  dbName,
  entriesOnPage,
  language,
  projectId,
}: GetMoviesFirestore): Promise<MoviePage> => {
  if (!Object.values(DbType).includes(dbName as DbType)) {
    throw new Error(`Unsupported movie collection: ${dbName}`);
  }
  if (
    !Number.isSafeInteger(entriesOnPage) ||
    entriesOnPage < 1 ||
    entriesOnPage > 100
  ) {
    throw new Error("entriesOnPage must be between 1 and 100");
  }

  const cacheKey = JSON.stringify({
    cursor: cursor ?? null,
    databaseId,
    dbName,
    entriesOnPage,
    language: language ?? null,
    projectId,
  });
  return loadFirestoreCatalog(cacheKey, async () => {
    let query = getClient(projectId, databaseId)
      .collection(dbName)
      .orderBy("lasttimefound", "desc")
      .orderBy(FieldPath.documentId(), "desc")
      .limit(entriesOnPage);
    if (cursor) {
      const position = decodeMovieCursor(cursor);
      query = query.startAfter(
        Timestamp.fromMillis(position.timestampMillis),
        position.id,
      );
    }

    const snapshot = await query.get();
    const movies = snapshot.docs.map((document) => {
      const movie = mapMovieDocument(document.id, document.data());
      if (language === "en-US" && movie.original_title) {
        movie.title = movie.original_title;
      }
      return movie;
    });
    const last = snapshot.docs.at(-1);
    const timestamp = last?.get("lasttimefound");
    const nextCursor =
      last && snapshot.size === entriesOnPage && timestamp instanceof Timestamp
        ? encodeMovieCursor({
            id: last.id,
            timestampMillis: timestamp.toMillis(),
          })
        : null;

    return { movies, nextCursor };
  });
};
