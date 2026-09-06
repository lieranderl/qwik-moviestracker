import type { Torrent } from "./models/torrent";
import { parseJacRedSearchResponse } from "./provider-contracts";
import { BoundedAsyncCache, CACHE_TTL_MS } from "./server-cache";
import {
  requestWithRetry,
  toUpstreamFailure,
  upstreamHttpError,
  UpstreamError,
  type UpstreamFailureKind,
} from "./upstream";

const DEFAULT_JACRED_API_BASE_URL = "https://api.jacred.su";
const DEFAULT_JACRED_SEARCH_PATH = "/api/search";
const DEFAULT_JACRED_SEARCH_LIMIT = 80;
const DEFAULT_JACRED_SEARCH_TIMEOUT_MS = 7000;
const JACRED_SEARCH_LIMIT_MAX = 120;

export type TorrentSearchRequest = {
  name: string;
  year: number;
  isMovie: boolean;
  season?: number;
  limit?: number;
};

export type getTorrentsType = TorrentSearchRequest;

export type TorrentSearchResult = {
  facets?: JacRedFacets;
  limit: number;
  loaded: number;
  torrents: Torrent[];
  total: number;
  status: "found" | UpstreamFailureKind;
};

export type JacRedFacet = {
  count: number;
  label?: string;
  value: number | string;
};

export type JacRedFacets = {
  categories?: JacRedFacet[];
  qualities?: JacRedFacet[];
  seasons?: JacRedFacet[];
  trackers?: JacRedFacet[];
  video_types?: JacRedFacet[];
  voices?: JacRedFacet[];
  years?: JacRedFacet[];
};

export type JacRedSearchResponse = {
  facets?: JacRedFacets;
  limit: number;
  loaded: number;
  open: boolean;
  query: string;
  results: JacRedResult[];
  total: number;
};

export type JacRedResult = {
  availability_score?: number;
  categories?: string[];
  category_labels?: string[];
  created_at?: string;
  id?: string;
  magnet?: string;
  magnet_available?: boolean;
  name?: string;
  original_name?: string;
  peers?: number;
  quality?: number;
  quality_label?: string;
  seasons?: number[];
  seeders?: number;
  size?: number;
  size_name?: string;
  source_url?: string;
  title?: string;
  tracker?: string;
  updated_at?: string;
  video_type?: string;
  voices?: string[];
  year?: number;
};

const sharedTorrentCache = new BoundedAsyncCache();

const clampInteger = (value: number, fallback: number, max: number) => {
  if (!Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.min(Math.trunc(value), max);
};

const readIntegerEnv = (key: string, fallback: number, max: number) => {
  const raw = process.env[key];
  if (!raw) {
    return fallback;
  }

  return clampInteger(Number.parseInt(raw, 10), fallback, max);
};

const getJacRedConfig = () => ({
  baseUrl: process.env.JACRED_API_BASE_URL || DEFAULT_JACRED_API_BASE_URL,
  limit: readIntegerEnv(
    "JACRED_SEARCH_LIMIT",
    DEFAULT_JACRED_SEARCH_LIMIT,
    JACRED_SEARCH_LIMIT_MAX,
  ),
  path: process.env.JACRED_SEARCH_PATH || DEFAULT_JACRED_SEARCH_PATH,
  timeout: readIntegerEnv(
    "JACRED_SEARCH_TIMEOUT_MS",
    DEFAULT_JACRED_SEARCH_TIMEOUT_MS,
    60_000,
  ),
});

const isPositiveInteger = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

const getRequestLimit = (request: TorrentSearchRequest) => {
  const config = getJacRedConfig();
  return clampInteger(
    request.limit ?? config.limit,
    config.limit,
    JACRED_SEARCH_LIMIT_MAX,
  );
};

const normalizeSearchRequest = (request: TorrentSearchRequest) => ({
  isMovie: request.isMovie,
  limit: getRequestLimit(request),
  name: request.name.trim(),
  season: isPositiveInteger(request.season) ? request.season : undefined,
  year: isPositiveInteger(request.year) ? request.year : undefined,
});

const buildCacheKey = (request: TorrentSearchRequest) => {
  const normalized = normalizeSearchRequest(request);
  return JSON.stringify({
    category: normalized.isMovie ? "movie" : "",
    limit: normalized.limit,
    name: normalized.name.toLocaleLowerCase(),
    season: normalized.season ?? null,
    year: normalized.year ?? null,
  });
};

export const buildJacRedSearchUrl = (request: TorrentSearchRequest) => {
  const config = getJacRedConfig();
  const normalizedBaseUrl = config.baseUrl.endsWith("/")
    ? config.baseUrl
    : `${config.baseUrl}/`;
  const normalizedPath = config.path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, normalizedBaseUrl);
  const normalized = normalizeSearchRequest(request);

  url.searchParams.set("query", normalized.name);
  url.searchParams.set("sort", "sid");
  url.searchParams.set("limit", String(normalized.limit));

  if (normalized.year) {
    url.searchParams.set("year", String(normalized.year));
  }

  if (normalized.isMovie) {
    url.searchParams.set("category", "movie");
  }

  if (normalized.season) {
    url.searchParams.set("season", String(normalized.season));
  }

  return url;
};

const requestValidatedJacRedSearch = async (
  request: TorrentSearchRequest,
): Promise<JacRedSearchResponse> => {
  const config = getJacRedConfig();
  const url = buildJacRedSearchUrl(request);
  return requestWithRetry(
    async (signal) => {
      let response: Response;
      try {
        response = await fetch(String(url), {
          headers: { "X-JacRed-Client": "moviestracker" },
          signal,
        });
      } catch (error) {
        if (error instanceof UpstreamError) throw error;
        throw new TypeError("JacRed network failure", { cause: error });
      }
      if (!response.ok) throw upstreamHttpError("jacred", response.status);
      let input: unknown;
      try {
        input = await response.json();
      } catch (error) {
        throw new UpstreamError({
          source: "jacred",
          kind: "invalid-response",
          retryable: false,
          cause: error,
        });
      }
      return parseJacRedSearchResponse(input, request.name);
    },
    {
      source: "jacred",
      timeoutMs: config.timeout,
      maxRetries: 1,
      baseDelayMs: 150,
    },
  );
};

export const extractTorrentHash = (magnet: string) => {
  const match = magnet.match(/xt=urn:btih:([^&]+)/i);
  if (!match) {
    return "";
  }

  try {
    return decodeURIComponent(match[1]).toUpperCase();
  } catch {
    return match[1].toUpperCase();
  }
};

const includesToken = (value: string, pattern: RegExp) => pattern.test(value);

export const normalizeJacRedResults = (
  results: JacRedResult[],
  request: TorrentSearchRequest,
): Torrent[] => {
  const seen = new Set<string>();
  const torrents: Torrent[] = [];

  for (const result of results) {
    const magnet = result.magnet?.trim();
    if (!magnet) {
      continue;
    }

    const title = result.title ?? result.name ?? "";
    const normalizedTitle = title.toLocaleLowerCase();
    const hash = extractTorrentHash(magnet) || result.id || "";
    const dedupeKey = hash || magnet;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);

    const quality = Number(result.quality ?? 0);
    const videoType = (result.video_type ?? "").toLocaleLowerCase();
    const isHdr =
      videoType === "hdr" ||
      includesToken(normalizedTitle, /\bhdr\b/i) ||
      includesToken(normalizedTitle, /\bhdr10\b/i);
    const isHdr10Plus = includesToken(title, /hdr10\+|hdr10plus/i);
    const isHdr10 = !isHdr10Plus && includesToken(title, /\bhdr10\b|hdr10/i);

    torrents.push({
      AvailabilityScore: Number(result.availability_score ?? 0),
      Categories: result.categories ?? [],
      CategoryLabels: result.category_labels ?? [],
      Date: result.created_at ?? result.updated_at ?? "",
      DetailsUrl: result.source_url ?? "",
      DV: includesToken(title, /dolby\s*vision|\bdv\b/i),
      FHD: quality === 1080,
      HDR: isHdr,
      HDR10: isHdr10,
      HDR10plus: isHdr10Plus,
      Hash: hash,
      K4: quality === 2160,
      Leeches: Number(result.peers ?? 0),
      Magnet: magnet,
      Name: title,
      OriginalName: result.original_name ?? "",
      Peers: Number(result.peers ?? 0),
      Quality: quality || undefined,
      QualityLabel: result.quality_label,
      RussianName: result.name ?? "",
      Seeds: Number(result.seeders ?? 0),
      Seasons: result.seasons ?? [],
      Size: Number(result.size ?? 0) / 1024 / 1024 / 1024,
      SizeName: result.size_name,
      Tracker: result.tracker,
      UpdatedDate: result.updated_at,
      VideoType: result.video_type,
      Voices: result.voices ?? [],
      Year: String(result.year ?? request.year),
    });
  }

  return torrents;
};

const logJacRedSearchFailure = (
  error: unknown,
  request: TorrentSearchRequest,
) => {
  const status = error instanceof UpstreamError ? error.status : undefined;
  console.error("JacRed torrent search failed", {
    isMovie: request.isMovie,
    nameLength: request.name.trim().length,
    provider: "jacred",
    season: request.season,
    status,
    year: request.year,
  });
};

export const getTorrentSearch = async (
  request: TorrentSearchRequest,
): Promise<TorrentSearchResult> => {
  if (request.name.trim().length < 2) {
    return {
      limit: getRequestLimit(request),
      loaded: 0,
      torrents: [],
      total: 0,
      status: "empty",
    };
  }

  const cacheKey = buildCacheKey(request);

  try {
    return (
      await sharedTorrentCache.getOrLoad(
        cacheKey,
        CACHE_TTL_MS.jacred,
        async () => {
          const response = await requestValidatedJacRedSearch(request);
          const torrents = normalizeJacRedResults(response.results, request);
          const status: TorrentSearchResult["status"] =
            torrents.length > 0 ? "found" : "empty";
          return {
            facets: response.facets,
            limit: response.limit,
            loaded: response.loaded,
            torrents,
            total: response.total,
            status,
          };
        },
      )
    ).value;
  } catch (error) {
    logJacRedSearchFailure(error, request);
    const failure = toUpstreamFailure(error, "jacred");
    return {
      limit: getRequestLimit(request),
      loaded: 0,
      torrents: [],
      total: 0,
      status: failure.ok ? "unavailable" : failure.error.kind,
    };
  }
};

export const getTorrents = async (
  request: TorrentSearchRequest,
): Promise<Torrent[]> => (await getTorrentSearch(request)).torrents;

export const clearTorrentSearchCacheForTests = () => {
  sharedTorrentCache.clear();
};
