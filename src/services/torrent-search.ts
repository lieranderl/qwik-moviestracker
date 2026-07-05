import type { Torrent } from "./models";

const DEFAULT_JACRED_API_BASE_URL = "https://api.jacred.su";
const DEFAULT_JACRED_SEARCH_PATH = "/api/search";
const DEFAULT_JACRED_SEARCH_LIMIT = 80;
const DEFAULT_JACRED_SEARCH_TIMEOUT_MS = 7000;
const JACRED_SEARCH_LIMIT_MAX = 120;
const JACRED_CACHE_TTL_MS = 90_000;
const JACRED_CACHE_MAX_ENTRIES = 200;
const JACRED_RETRY_STATUSES = new Set([502, 503, 504]);

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

type CacheEntry = {
	expiresAt: number;
	value: TorrentSearchResult;
};

export class JacRedSearchError extends Error {
	constructor(
		message: string,
		readonly status?: number,
		readonly retryable = false,
	) {
		super(message);
		this.name = "JacRedSearchError";
	}
}

const torrentCache = new Map<string, CacheEntry>();

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

const getCachedTorrents = (cacheKey: string) => {
	const entry = torrentCache.get(cacheKey);
	if (!entry) {
		return null;
	}

	if (entry.expiresAt <= Date.now()) {
		torrentCache.delete(cacheKey);
		return null;
	}

	return entry.value;
};

const setCachedTorrents = (cacheKey: string, value: TorrentSearchResult) => {
	torrentCache.set(cacheKey, {
		expiresAt: Date.now() + JACRED_CACHE_TTL_MS,
		value,
	});

	if (torrentCache.size <= JACRED_CACHE_MAX_ENTRIES) {
		return;
	}

	const [oldestKey] = torrentCache.keys();
	if (oldestKey) {
		torrentCache.delete(oldestKey);
	}
};

const fetchWithTimeout = async (
	resource: string,
	timeout: number,
): Promise<Response> => {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeout);

	try {
		return await fetch(resource, {
			headers: {
				"X-JacRed-Client": "moviestracker",
			},
			signal: controller.signal,
		});
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw new JacRedSearchError(
				`JacRed search timed out after ${timeout}ms`,
				undefined,
				true,
			);
		}

		throw new JacRedSearchError("JacRed search network failure", undefined, true);
	} finally {
		clearTimeout(timer);
	}
};

const delay = (ms: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

const requestJacRedSearch = async (
	request: TorrentSearchRequest,
): Promise<JacRedSearchResponse> => {
	const config = getJacRedConfig();
	const url = buildJacRedSearchUrl(request);
	let lastError: unknown = null;

	for (let attempt = 0; attempt < 2; attempt += 1) {
		try {
			const response = await fetchWithTimeout(String(url), config.timeout);

			if (!response.ok) {
				const retryable = JACRED_RETRY_STATUSES.has(response.status);
				throw new JacRedSearchError(
					`JacRed search failed with status ${response.status}`,
					response.status,
					retryable,
				);
			}

			const body = (await response.json()) as Partial<JacRedSearchResponse>;
			if (!Array.isArray(body.results)) {
				throw new JacRedSearchError("JacRed search returned an invalid body");
			}

			return {
				facets: body.facets,
				limit: Number(body.limit ?? 0),
				loaded: Number(body.loaded ?? 0),
				open: Boolean(body.open),
				query: String(body.query ?? request.name),
				results: body.results,
				total: Number(body.total ?? body.results.length),
			};
		} catch (error) {
			lastError = error;

			const retryable =
				error instanceof JacRedSearchError &&
				error.retryable &&
				error.status !== 428 &&
				error.status !== 429;

			if (!retryable || attempt > 0) {
				break;
			}

			await delay(150 + Math.floor(Math.random() * 100));
		}
	}

	throw lastError;
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
		const isHdr10 =
			!isHdr10Plus && includesToken(title, /\bhdr10\b|hdr10/i);

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
	const status = error instanceof JacRedSearchError ? error.status : undefined;
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
		};
	}

	const cacheKey = buildCacheKey(request);
	const cached = getCachedTorrents(cacheKey);
	if (cached) {
		return cached;
	}

	try {
		const response = await requestJacRedSearch(request);
		const torrents = normalizeJacRedResults(response.results, request);
		const result = {
			facets: response.facets,
			limit: response.limit,
			loaded: response.loaded,
			torrents,
			total: response.total,
		};
		setCachedTorrents(cacheKey, result);
		return result;
	} catch (error) {
		logJacRedSearchFailure(error, request);
		return {
			limit: getRequestLimit(request),
			loaded: 0,
			torrents: [],
			total: 0,
		};
	}
};

export const getTorrents = async (
	request: TorrentSearchRequest,
): Promise<Torrent[]> => (await getTorrentSearch(request)).torrents;

export const clearTorrentSearchCacheForTests = () => {
	torrentCache.clear();
};
