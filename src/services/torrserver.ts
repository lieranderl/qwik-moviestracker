import type { MediaDetails, FileStat, TSResult, Torrent } from "./models";

type JsonPrimitive = boolean | number | string;
type JsonQueryValue = JsonPrimitive | null | undefined;

export type TorrServerQueryParams = Record<string, JsonQueryValue>;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
type ResponseType = "json" | "text";

const TORR_SERVER_TIMEOUT_MS = 8000;
const VIDEO_FILE_EXTENSIONS = [
	".mkv",
	".mp4",
	".mov",
	".avi",
	".webm",
	".m4v",
	".ts",
	".m2ts",
	".mpg",
	".mpeg",
	".wmv",
	".flv",
	".iso",
];

const BROWSER_FRIENDLY_VIDEO_EXTENSIONS = [
	".mp4",
	".mov",
	".m4v",
	".ogv",
	".ogg",
	".webm",
];

export type TorrServerCategory = "movie" | "music" | "other" | "tv";

export type TorrServerFileStat = FileStat;

export type TorrServerMoviestrackerPayload = {
	moviestracker?: boolean;
	movie?: MediaDetails;
};

export type TorrServerTorrentStatusRaw = Partial<TSResult> & {
	active_peers?: number;
	bit_rate?: string;
	bytes_written_data?: number;
	category?: string;
	download_speed?: number;
	duration_seconds?: number;
	file_stats?: TorrServerFileStat[];
	files?: TorrServerFileStat[];
	half_open_peers?: number;
	pending_peers?: number;
	pieces_dirtied_bad?: number;
	posters?: string;
	preload_size?: number;
	preloaded_bytes?: number;
	stat_string?: string;
	timestamp?: number;
	total_peers?: number;
	tracker?: string;
	torrs_hash?: string;
	upload_speed?: number;
};

export type TorrServerTorrentStatus = TSResult & {
	data?: string;
	active_peers?: number;
	bit_rate?: string;
	bytes_written_data?: number;
	category?: string;
	download_speed?: number;
	duration_seconds?: number;
	fileCount: number;
	file_stats: TorrServerFileStat[];
	files: TorrServerFileStat[];
	media: MediaDetails | null;
	mediaKind: TorrServerCategory;
	pending_peers?: number;
	playableFile: TorrServerFileStat | null;
	posters?: string;
	preload_size?: number;
	preloaded_bytes?: number;
	torrs_hash?: string;
	total_peers?: number;
	tracker?: string;
	upload_speed?: number;
	statusLabel: string;
};

export type TorrServerSettingsRaw = {
	CacheSize?: number;
	ConnectionsLimit?: number;
	DisableDHT?: boolean;
	DisablePEX?: boolean;
	DisableTCP?: boolean;
	DisableUPNP?: boolean;
	DisableUTP?: boolean;
	DisableUpload?: boolean;
	DownloadRateLimit?: number;
	EnableDLNA?: boolean;
	EnableDebug?: boolean;
	EnableIPv6?: boolean;
	EnableProxy?: boolean;
	EnableRutorSearch?: boolean;
	EnableTorznabSearch?: boolean;
	ForceEncrypt?: boolean;
	FriendlyName?: string;
	PeersListenPort?: number;
	PreloadCache?: number;
	ProxyHosts?: string[];
	ReaderReadAHead?: number;
	RemoveCacheOnDrop?: boolean;
	ResponsiveMode?: boolean;
	RetrackersMode?: number;
	ShowFSActiveTorr?: boolean;
	SslCert?: string;
	SslKey?: string;
	SslPort?: number;
	StoreSettingsInJson?: boolean;
	StoreViewedInJson?: boolean;
	TMDBSettings?: TorrServerTMDBSettingsRaw;
	TorrentsSavePath?: string;
	TorrentDisconnectTimeout?: number;
	TorznabUrls?: TorrServerTorznabConfigRaw[];
	UploadRateLimit?: number;
	UseDisk?: boolean;
	cacheSize?: number;
	connectionsLimit?: number;
	disableDHT?: boolean;
	disablePEX?: boolean;
	disableTCP?: boolean;
	disableUPNP?: boolean;
	disableUTP?: boolean;
	disableUpload?: boolean;
	downloadRateLimit?: number;
	enableDLNA?: boolean;
	enableDebug?: boolean;
	enableIPv6?: boolean;
	enableProxy?: boolean;
	enableRutorSearch?: boolean;
	enableTorznabSearch?: boolean;
	forceEncrypt?: boolean;
	friendlyName?: string;
	peersListenPort?: number;
	preloadCache?: number;
	proxyHosts?: string[];
	readerReadAHead?: number;
	removeCacheOnDrop?: boolean;
	responsiveMode?: boolean;
	retrackersMode?: number;
	showFSActiveTorr?: boolean;
	sslCert?: string;
	sslKey?: string;
	sslPort?: number;
	storeSettingsInJson?: boolean;
	storeViewedInJson?: boolean;
	tmdbSettings?: TorrServerTMDBSettingsRaw;
	torrentsSavePath?: string;
	torrentDisconnectTimeout?: number;
	torznabUrls?: TorrServerTorznabConfigRaw[];
	uploadRateLimit?: number;
	useDisk?: boolean;
};

export type TorrServerTmdbSettings = {
	apiKey: string;
	apiUrl: string;
	imageUrl: string;
	imageUrlRu: string;
};

export type TorrServerTMDBSettingsRaw = {
	APIKey?: string;
	APIURL?: string;
	ImageURL?: string;
	ImageURLRu?: string;
	apiKey?: string;
	apiUrl?: string;
	imageUrl?: string;
	imageUrlRu?: string;
};

export type TorrServerTorznabConfigRaw = {
	host?: string;
	key?: string;
	name?: string;
};

export type TorrServerSettings = {
	cacheSize: number;
	connectionsLimit: number;
	disableDHT: boolean;
	disablePEX: boolean;
	disableTCP: boolean;
	disableUPNP: boolean;
	disableUTP: boolean;
	disableUpload: boolean;
	downloadRateLimit: number;
	enableDLNA: boolean;
	enableDebug: boolean;
	enableIPv6: boolean;
	enableProxy: boolean;
	enableRutorSearch: boolean;
	enableTorznabSearch: boolean;
	forceEncrypt: boolean;
	friendlyName: string;
	peersListenPort: number;
	preloadCache: number;
	proxyHosts: string[];
	readerReadAhead: number;
	removeCacheOnDrop: boolean;
	responsiveMode: boolean;
	retrackersMode: number;
	showFSActiveTorr: boolean;
	sslCert: string;
	sslKey: string;
	sslPort: number;
	storeSettingsInJson: boolean;
	storeViewedInJson: boolean;
	tmdbSettings: TorrServerTmdbSettings;
	torrentsSavePath: string;
	torrentDisconnectTimeout: number;
	torznabUrls: TorrServerTorznabConfigRaw[];
	uploadRateLimit: number;
	useDisk: boolean;
};

export type TorrServerStorageSettings = {
	settings: "bbolt" | "json" | string;
	viewed: "bbolt" | "json" | string;
	viewedCount: number;
};

export type TorrServerStorageSettingsUpdate = {
	settings: "bbolt" | "json";
	viewed: "bbolt" | "json";
};

export type TorrServerViewedItem = {
	file_index?: number;
	hash?: string;
};

export type TorrServerSearchResult = {
	audioQuality?: string;
	categories?: string;
	category?: string;
	createDate?: string;
	date?: string;
	hash?: string;
	imdbid?: string;
	link?: string;
	magnet?: string;
	name?: string;
	names?: string[];
	peer?: number;
	poster?: string;
	seed?: number;
	seeders?: number;
	size?: string;
	title?: string;
	torrent?: string;
	tracker?: string;
	trackers?: string[];
	videoQuality?: string;
	year?: number;
};

export type TorrServerAddLinkRequest = {
	category?: string;
	data?: string;
	link: string;
	poster?: string;
	saveToDb?: boolean;
	title?: string;
};

export type TorrServerUploadRequest = {
	category?: string;
	data?: string;
	file: Blob;
	fileName?: string;
	poster?: string;
	saveToDb?: boolean;
	title?: string;
};

export type TorrServerReaderState = {
	end?: number;
	reader?: number;
	start?: number;
};

export type TorrServerCachePieceState = {
	completed?: boolean;
	id?: number;
	length?: number;
	priority?: number;
	size?: number;
};

export type TorrServerCacheState = {
	capacity?: number;
	filled?: number;
	hash?: string;
	pieces?: Record<string, TorrServerCachePieceState>;
	piecesCount?: number;
	piecesLength?: number;
	readers?: TorrServerReaderState[];
	torrent?: TorrServerTorrentStatus | null;
};

export type TorrServerPlaylistOptions = {
	fromLast?: boolean;
};

export type TorrServerStreamOptions = {
	category?: TorrServerCategory;
	filename?: string;
	fromlast?: boolean;
	index?: number;
	link: string;
	m3u?: boolean;
	play?: boolean;
	poster?: string;
	preload?: boolean;
	save?: boolean;
	stat?: boolean;
	title?: string;
};

const isFiniteNumber = (value: unknown): value is number =>
	typeof value === "number" && Number.isFinite(value);

const asNumber = (value: unknown, fallback = 0): number =>
	isFiniteNumber(value) ? value : fallback;

const asBoolean = (value: unknown, fallback = false): boolean =>
	typeof value === "boolean" ? value : fallback;

const asString = (value: unknown, fallback = ""): string =>
	typeof value === "string" ? value : fallback;

const asStringArray = (value: unknown): string[] => {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((item): item is string => typeof item === "string");
};

const asFileStats = (value: unknown): TorrServerFileStat[] => {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((item): item is TorrServerFileStat => {
		if (!item || typeof item !== "object") {
			return false;
		}

		const file = item as Partial<TorrServerFileStat>;
		return isFiniteNumber(file.id) && typeof file.path === "string";
	});
};

export const normalizeBaseUrl = (value: string): string => {
	return value.trim().replace(/\/+$/, "");
};

const ensureBaseUrl = (value: string): string => {
	const normalized = normalizeBaseUrl(value);
	if (!normalized) {
		throw new Error("TorrServer base URL is required");
	}

	try {
		new URL(normalized);
		return normalized;
	} catch (error) {
		throw new Error(`Invalid TorrServer base URL: ${normalized}`, {
			cause: error,
		});
	}
};

const encodePathValue = (value: string): string =>
	value
		.split("/")
		.map((part) => encodeURIComponent(part))
		.join("/");

const joinPathSegments = (segments: string[]): string =>
	segments
		.map((segment) => segment.trim())
		.filter(Boolean)
		.map((segment) => encodePathValue(segment))
		.join("/");

const buildQueryString = (query?: TorrServerQueryParams): string => {
	const parts: string[] = [];

	for (const [key, value] of Object.entries(query ?? {})) {
		if (value === null || value === undefined || value === false) {
			continue;
		}

		if (value === true || value === "") {
			parts.push(encodeURIComponent(key));
			continue;
		}

		parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
	}

	return parts.length > 0 ? `?${parts.join("&")}` : "";
};

const buildUrl = (
	baseUrl: string,
	pathSegments: string[],
	query?: TorrServerQueryParams,
): string => {
	const normalizedBaseUrl = ensureBaseUrl(baseUrl);
	const url = new URL(`${normalizedBaseUrl}/`);
	const basePath = url.pathname.replace(/\/+$/, "");
	const nextPath = joinPathSegments(pathSegments);

	url.pathname = basePath ? `${basePath}/${nextPath}` : `/${nextPath}`;
	url.search = buildQueryString(query);
	return url.toString();
};

const isVideoFile = (path: string): boolean => {
	const normalizedPath = path.trim().toLowerCase();
	return VIDEO_FILE_EXTENSIONS.some((extension) =>
		normalizedPath.endsWith(extension),
	);
};

export const getFileExtension = (path: string): string => {
	const normalizedPath = path.trim().toLowerCase();
	const matchingExtension = VIDEO_FILE_EXTENSIONS.find((extension) =>
		normalizedPath.endsWith(extension),
	);

	return matchingExtension ? matchingExtension.replace(".", "") : "";
};

export const isBrowserLikelyToPlayVideo = (path: string): boolean => {
	const normalizedPath = path.trim().toLowerCase();
	return BROWSER_FRIENDLY_VIDEO_EXTENSIONS.some((extension) =>
		normalizedPath.endsWith(extension),
	);
};

export const buildBrowserPlaybackHint = (path: string): string => {
	const normalizedPath = path.trim().toLowerCase();
	const matchingExtension = VIDEO_FILE_EXTENSIONS.find((extension) =>
		normalizedPath.endsWith(extension),
	);

	if (!matchingExtension) {
		return "The browser player will try to open this file directly, but playback support is unknown.";
	}

	if (isBrowserLikelyToPlayVideo(path)) {
		return `${matchingExtension} should be playable in most modern browsers if the codec is supported.`;
	}

	return `${matchingExtension} often needs an external player. The in-page player remains available as an experimental option.`;
};

const formatStatusLabel = (value?: string): string => {
	if (!value) {
		return "";
	}

	return value
		.replaceAll(/[_-]+/g, " ")
		.trim()
		.replace(/\s+/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const parseMoviestrackerPayload = (
	data?: string,
): TorrServerMoviestrackerPayload | null => {
	if (!data) {
		return null;
	}

	try {
		const parsed = JSON.parse(data) as TorrServerMoviestrackerPayload;
		if (!parsed || typeof parsed !== "object") {
			return null;
		}

		return parsed;
	} catch (error) {
		console.error("Failed to parse TorrServer metadata payload", error);
		return null;
	}
};

export const parseTorrentMedia = (
	data?: string,
): MediaDetails | null => parseMoviestrackerPayload(data)?.movie ?? null;

export const inferTorrentCategory = (
	media: MediaDetails | null | undefined,
): TorrServerCategory => {
	if (!media) {
		return "other";
	}

	if ("seasons" in media) {
		return "tv";
	}

	if (media.media_type === "tv") {
		return "tv";
	}

	if (media.media_type === "movie") {
		return "movie";
	}

	return "other";
};

export const inferPlayableFile = (
	files: TorrServerFileStat[],
	preferredIndex?: number,
): TorrServerFileStat | null => {
	if (files.length === 0) {
		return null;
	}

	if (isFiniteNumber(preferredIndex)) {
		const preferredFile = files.find((file) => file.id === preferredIndex);
		if (preferredFile) {
			return preferredFile;
		}
	}

	const videoFiles = files.filter((file) => isVideoFile(file.path));
	const browserFriendlyFiles = videoFiles.filter((file) =>
		isBrowserLikelyToPlayVideo(file.path),
	);
	const playablePool =
		browserFriendlyFiles.length > 0
			? browserFriendlyFiles
			: videoFiles.length > 0
				? videoFiles
				: files;

	return [...playablePool].sort((left, right) => right.length - left.length)[0] ?? null;
};

export const getDefaultPlayableFile = inferPlayableFile;

export const normalizeTorrentStatus = (
	raw: TorrServerTorrentStatusRaw,
): TorrServerTorrentStatus => {
	const files = asFileStats(raw.file_stats ?? raw.files);
	const media = parseTorrentMedia(raw.data);

	return {
		...raw,
		active_peers: asNumber(raw.active_peers, 0),
		bit_rate: asString(raw.bit_rate, ""),
		bytes_read: asNumber(raw.bytes_read, 0),
		bytes_read_data: asNumber(raw.bytes_read_data, 0),
		bytes_read_useful_data: asNumber(raw.bytes_read_useful_data, 0),
		bytes_written: asNumber(raw.bytes_written, 0),
		category: asString(raw.category, ""),
		connected_seeders: asNumber(raw.connected_seeders, 0),
		download_speed: asNumber(raw.download_speed, 0),
		fileCount: files.length,
		file_stats: files,
		files,
		hash: asString(raw.hash, ""),
		loaded_size: asNumber(raw.loaded_size, 0),
		media,
		mediaKind: inferTorrentCategory(media),
		name: asString(raw.name, ""),
		pending_peers: asNumber(raw.pending_peers, 0),
		pieces_dirtied_good: asNumber(raw.pieces_dirtied_good, 0),
		playableFile: inferPlayableFile(files),
		poster: asString(raw.poster, ""),
		preloaded_bytes: asNumber(raw.preloaded_bytes, 0),
		stat: asNumber(raw.stat, 0),
		stat_string: asString(raw.stat_string, ""),
		statusLabel: formatStatusLabel(raw.stat_string),
		timestamp: asNumber(raw.timestamp, 0),
		title: asString(raw.title, ""),
		total_peers: asNumber(raw.total_peers, 0),
		torrent_size: asNumber(raw.torrent_size, 0),
		upload_speed: asNumber(raw.upload_speed, 0),
	};
};

const normalizeTmdbSettings = (
	raw?: TorrServerTMDBSettingsRaw | null,
): TorrServerTmdbSettings => ({
	apiKey: asString(raw?.apiKey ?? raw?.APIKey, ""),
	apiUrl: asString(raw?.apiUrl ?? raw?.APIURL, "https://api.themoviedb.org"),
	imageUrl: asString(raw?.imageUrl ?? raw?.ImageURL, "https://image.tmdb.org"),
	imageUrlRu: asString(
		raw?.imageUrlRu ?? raw?.ImageURLRu,
		"https://imagetmdb.com",
	),
});

export const normalizeSettings = (
	raw: TorrServerSettingsRaw,
): TorrServerSettings => ({
	cacheSize: asNumber(raw.CacheSize ?? raw.cacheSize, 0),
	connectionsLimit: asNumber(raw.ConnectionsLimit ?? raw.connectionsLimit, 0),
	disableDHT: asBoolean(raw.DisableDHT ?? raw.disableDHT, false),
	disablePEX: asBoolean(raw.DisablePEX ?? raw.disablePEX, false),
	disableTCP: asBoolean(raw.DisableTCP ?? raw.disableTCP, false),
	disableUPNP: asBoolean(raw.DisableUPNP ?? raw.disableUPNP, false),
	disableUTP: asBoolean(raw.DisableUTP ?? raw.disableUTP, false),
	disableUpload: asBoolean(raw.DisableUpload ?? raw.disableUpload, false),
	downloadRateLimit: asNumber(raw.DownloadRateLimit ?? raw.downloadRateLimit, 0),
	enableDLNA: asBoolean(raw.EnableDLNA ?? raw.enableDLNA, false),
	enableDebug: asBoolean(raw.EnableDebug ?? raw.enableDebug, false),
	enableIPv6: asBoolean(raw.EnableIPv6 ?? raw.enableIPv6, false),
	enableProxy: asBoolean(raw.EnableProxy ?? raw.enableProxy, false),
	enableRutorSearch: asBoolean(
		raw.EnableRutorSearch ?? raw.enableRutorSearch,
		false,
	),
	enableTorznabSearch: asBoolean(
		raw.EnableTorznabSearch ?? raw.enableTorznabSearch,
		false,
	),
	forceEncrypt: asBoolean(raw.ForceEncrypt ?? raw.forceEncrypt, false),
	friendlyName: asString(raw.FriendlyName ?? raw.friendlyName, ""),
	peersListenPort: asNumber(raw.PeersListenPort ?? raw.peersListenPort, 0),
	preloadCache: asNumber(raw.PreloadCache ?? raw.preloadCache, 0),
	proxyHosts: asStringArray(raw.ProxyHosts ?? raw.proxyHosts),
	readerReadAhead: asNumber(raw.ReaderReadAHead ?? raw.readerReadAHead, 0),
	removeCacheOnDrop: asBoolean(
		raw.RemoveCacheOnDrop ?? raw.removeCacheOnDrop,
		false,
	),
	responsiveMode: asBoolean(raw.ResponsiveMode ?? raw.responsiveMode, false),
	retrackersMode: asNumber(raw.RetrackersMode ?? raw.retrackersMode, 0),
	showFSActiveTorr: asBoolean(raw.ShowFSActiveTorr ?? raw.showFSActiveTorr, false),
	sslCert: asString(raw.SslCert ?? raw.sslCert, ""),
	sslKey: asString(raw.SslKey ?? raw.sslKey, ""),
	sslPort: asNumber(raw.SslPort ?? raw.sslPort, 0),
	storeSettingsInJson: asBoolean(
		raw.StoreSettingsInJson ?? raw.storeSettingsInJson,
		false,
	),
	storeViewedInJson: asBoolean(
		raw.StoreViewedInJson ?? raw.storeViewedInJson,
		false,
	),
	tmdbSettings: normalizeTmdbSettings(raw.TMDBSettings ?? raw.tmdbSettings),
	torrentsSavePath: asString(raw.TorrentsSavePath ?? raw.torrentsSavePath, ""),
	torrentDisconnectTimeout: asNumber(
		raw.TorrentDisconnectTimeout ?? raw.torrentDisconnectTimeout,
		0,
	),
	torznabUrls: Array.isArray(raw.TorznabUrls ?? raw.torznabUrls)
		? ((raw.TorznabUrls ?? raw.torznabUrls) as TorrServerTorznabConfigRaw[])
		: [],
	uploadRateLimit: asNumber(raw.UploadRateLimit ?? raw.uploadRateLimit, 0),
	useDisk: asBoolean(raw.UseDisk ?? raw.useDisk, false),
});

const normalizeViewedItem = (
	item: TorrServerViewedItem,
): TorrServerViewedItem => ({
	file_index: isFiniteNumber(item.file_index) ? item.file_index : undefined,
	hash: asString(item.hash, ""),
});

const isOptionalFailure = (error: unknown): boolean => {
	if (!(error instanceof Error)) {
		return false;
	}

	return (
		error.message.includes("(401)") ||
		error.message.includes("(403)") ||
		error.message.includes("(404)") ||
		error.message.includes("(500)")
	);
};

type RequestOptions = {
	body?: unknown;
	method?: HttpMethod;
	path: string;
	query?: TorrServerQueryParams;
	responseType?: ResponseType;
	timeout?: number;
};

async function fetchWithTimeout(
	resource: string,
	options: RequestInit & { timeout?: number },
): Promise<Response> {
	const { timeout = TORR_SERVER_TIMEOUT_MS, ...requestOptions } = options;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeout);

	try {
		return await fetch(resource, {
			...requestOptions,
			signal: controller.signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw new Error(
				`TorrServer request timed out after ${timeout}ms for ${resource}`,
				{
					cause: error,
				},
			);
		}

		throw error;
	} finally {
		clearTimeout(timer);
	}
}

const requestTorrServer = async <T = unknown>(
	baseUrl: string,
	{
		body,
		method = "GET",
		path,
		query,
		responseType = "json",
		timeout = TORR_SERVER_TIMEOUT_MS,
	}: RequestOptions,
): Promise<T> => {
	const url = buildUrl(baseUrl, [path], query);
	const requestOptions: RequestInit & { timeout?: number } = {
		headers: {
			"Content-Type": "application/json",
		},
		method,
		timeout,
	};

	if (body !== undefined) {
		requestOptions.body = JSON.stringify(body);
	}

	const response = await fetchWithTimeout(url, requestOptions);

	if (!response.ok) {
		const errorText = await response.text().catch(() => "");
		throw new Error(
			`TorrServer request failed (${response.status}) for ${path}${
				errorText ? `: ${errorText.slice(0, 300)}` : ""
			}`,
		);
	}

	if (response.status === 204 || method === "HEAD") {
		return undefined as T;
	}

	if (responseType === "text") {
		return (await response.text()) as T;
	}

	const contentType = response.headers.get("Content-Type")?.toLowerCase() || "";
	if (contentType.includes("application/json")) {
		return (await response.json()) as T;
	}
	if (contentType.includes("text/")) {
		return (await response.text()) as T;
	}

	const rawResponse = await response.text();
	if (!rawResponse) {
		return undefined as T;
	}

	try {
		return JSON.parse(rawResponse) as T;
	} catch {
		return rawResponse as T;
	}
};

export const torrServerEcho = async (baseUrl: string): Promise<string> => {
	const response = await requestTorrServer<string>(baseUrl, {
		method: "GET",
		path: "echo",
		responseType: "text",
	});
	return response.trim();
};

export const getTorrServerVersion = torrServerEcho;

export const buildMagnetFromHash = (hash: string): string =>
	`magnet:?xt=urn:btih:${hash.trim()}`;

export const buildTorrentPlayUrl = (
	baseUrl: string,
	hash: string,
	fileIndex: number,
): string =>
	buildUrl(baseUrl, ["play", hash, String(fileIndex)]);

export const primeTorrentPlayback = async (
	baseUrl: string,
	hash: string,
	fileIndex: number,
): Promise<boolean> => {
	const playUrl = buildTorrentPlayUrl(baseUrl, hash, fileIndex);

	try {
		const response = await fetchWithTimeout(playUrl, {
			headers: {
				Range: "bytes=0-1",
			},
			method: "GET",
			timeout: 2500,
		});

		return response.ok;
	} catch {
		return false;
	}
};

export const activateTorrent = async (
	baseUrl: string,
	hash: string,
): Promise<TorrServerTorrentStatus | null> => {
	try {
		const raw = await requestTorrServer<TorrServerTorrentStatusRaw | null>(
			baseUrl,
			{
				method: "GET",
				path: "stream",
				query: {
					link: hash,
					stat: true,
					preload: true,
				},
				timeout: TORR_SERVER_TIMEOUT_MS * 2,
			},
		);

		return raw ? normalizeTorrentStatus(raw) : null;
	} catch {
		return null;
	}
};

export const buildTorrentStreamUrl = (
	baseUrl: string,
	{
		category,
		filename,
		fromlast,
		index,
		link,
		m3u,
		play = true,
		poster,
		preload,
		save,
		stat,
		title,
	}: TorrServerStreamOptions,
): string => {
	const pathSegments = filename ? ["stream", filename] : ["stream"];

	return buildUrl(baseUrl, pathSegments, {
		link,
		index,
		play,
		category,
		fromlast,
		m3u,
		poster,
		preload,
		save,
		stat,
		title,
	});
};

export const buildTorrentPlaylistUrl = (
	baseUrl: string,
	hash: string,
	options: TorrServerPlaylistOptions = {},
): string =>
	buildUrl(baseUrl, ["playlist"], {
		fromlast: options.fromLast,
		hash,
	});

export const buildAllTorrentsPlaylistUrl = (baseUrl: string): string =>
	buildUrl(baseUrl, ["playlistall", "all.m3u"]);

export const buildTorrServerDownloadTestUrl = (
	baseUrl: string,
	sizeMb: number,
): string => {
	const normalizedSize = Number.isFinite(sizeMb)
		? Math.max(1, Math.floor(sizeMb))
		: 1;
	return buildUrl(baseUrl, ["download", String(normalizedSize)]);
};

export const getTorrentPlaylist = async (
	baseUrl: string,
	hash: string,
	options: TorrServerPlaylistOptions = {},
): Promise<string> => {
	return await requestTorrServer<string>(baseUrl, {
		method: "GET",
		path: "playlist",
		query: {
			fromlast: options.fromLast,
			hash,
		},
		responseType: "text",
	});
};

export const getAllTorrentsPlaylist = async (
	baseUrl: string,
): Promise<string> =>
	await requestTorrServer<string>(baseUrl, {
		method: "GET",
		path: "playlistall/all.m3u",
		responseType: "text",
	});

export const getTorrServerStats = async (baseUrl: string): Promise<string> =>
	await requestTorrServer<string>(baseUrl, {
		method: "GET",
		path: "stat",
		responseType: "text",
	});

export const getTorrServerMagnetsPage = async (
	baseUrl: string,
): Promise<string> =>
	await requestTorrServer<string>(baseUrl, {
		method: "GET",
		path: "magnets",
		responseType: "text",
	});

export const searchRutor = async (
	baseUrl: string,
	query: string,
): Promise<TorrServerSearchResult[]> => {
	const raw = await requestTorrServer<TorrServerSearchResult[] | null>(baseUrl, {
		method: "GET",
		path: "search",
		query: {
			query,
		},
	});

	return Array.isArray(raw) ? raw : [];
};

export const searchTorznab = async (
	baseUrl: string,
	query: string,
): Promise<TorrServerSearchResult[]> => {
	const raw = await requestTorrServer<TorrServerSearchResult[] | null>(baseUrl, {
		method: "GET",
		path: "torznab/search",
		query: {
			query,
		},
	});

	return Array.isArray(raw) ? raw : [];
};

export const getTorrentFfprobe = async (
	baseUrl: string,
	hash: string,
	fileIndex: number,
): Promise<unknown> =>
	await requestTorrServer<unknown>(baseUrl, {
		method: "GET",
		path: `ffp/${hash}/${fileIndex}`,
		responseType: "json",
	});

export const getTorrentCache = async (
	baseUrl: string,
	hash: string,
): Promise<TorrServerCacheState | null> => {
	try {
		const raw = await requestTorrServer<TorrServerCacheState>(baseUrl, {
			body: {
				action: "get",
				hash,
			},
			method: "POST",
			path: "cache",
		});

		return {
			...raw,
			torrent: raw.torrent ? normalizeTorrentStatus(raw.torrent) : null,
		};
	} catch (error) {
		if (isOptionalFailure(error)) {
			return null;
		}

		throw error;
	}
};

export const getTorrServerSettings = async (
	baseUrl: string,
): Promise<TorrServerSettings | null> => {
	try {
		const raw = await requestTorrServer<TorrServerSettingsRaw>(baseUrl, {
			body: {
				action: "get",
			},
			method: "POST",
			path: "settings",
		});

		return normalizeSettings(raw);
	} catch (error) {
		if (isOptionalFailure(error)) {
			return null;
		}

		throw error;
	}
};

export const getTorrServerStorageSettings = async (
	baseUrl: string,
): Promise<TorrServerStorageSettings | null> => {
	try {
		const raw = await requestTorrServer<Partial<TorrServerStorageSettings>>(
			baseUrl,
			{
				method: "GET",
				path: "storage/settings",
			},
		);

		return {
			settings: asString(raw?.settings, "json"),
			viewed: asString(raw?.viewed, "json"),
			viewedCount: asNumber(raw?.viewedCount, 0),
		};
	} catch (error) {
		if (isOptionalFailure(error)) {
			return null;
		}

		throw error;
	}
};

export const updateTorrServerStorageSettings = async (
	baseUrl: string,
	update: TorrServerStorageSettingsUpdate,
): Promise<Record<string, string>> => {
	const url = buildUrl(baseUrl, ["storage", "settings"]);
	const form = new FormData();
	form.set("settings", update.settings);
	form.set("viewed", update.viewed);

	const response = await fetchWithTimeout(url, {
		body: form,
		method: "POST",
		timeout: TORR_SERVER_TIMEOUT_MS,
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => "");
		throw new Error(
			`TorrServer storage update failed (${response.status})${
				errorText ? `: ${errorText.slice(0, 300)}` : ""
			}`,
		);
	}

	const payload = (await response.json().catch(() => ({}))) as Record<
		string,
		string
	>;
	return payload;
};

export const getTorrServerTMDBSettings = async (
	baseUrl: string,
): Promise<TorrServerTmdbSettings | null> => {
	try {
		const raw = await requestTorrServer<TorrServerTMDBSettingsRaw>(baseUrl, {
			method: "GET",
			path: "tmdb/settings",
		});

		return normalizeTmdbSettings(raw);
	} catch (error) {
		if (isOptionalFailure(error)) {
			return null;
		}

		throw error;
	}
};

export const buildPlaylistUrl = (
	baseUrl: string,
	hash: string,
	fromLast = false,
): string => buildTorrentPlaylistUrl(baseUrl, hash, { fromLast });

export const buildFileStreamUrl = (
	baseUrl: string,
	hash: string,
	file: TorrServerFileStat,
): string =>
	buildTorrentStreamUrl(baseUrl, {
		filename: file.path.split("/").filter(Boolean).pop() ?? file.path,
		index: file.id,
		link: hash,
		play: true,
	});

export const getTorrServerFfprobe = getTorrentFfprobe;
export const getTorrServerTmdbSettings = getTorrServerTMDBSettings;

export const listViewedTorrents = async (
	baseUrl: string,
): Promise<TorrServerViewedItem[]> => {
	try {
		const raw = await requestTorrServer<TorrServerViewedItem[]>(baseUrl, {
			method: "POST",
			path: "viewed",
			body: {
				action: "list",
			},
		});

		return Array.isArray(raw) ? raw.map(normalizeViewedItem) : [];
	} catch (error) {
		if (isOptionalFailure(error)) {
			return [];
		}

		throw error;
	}
};

export const markViewedTorrent = async (
	baseUrl: string,
	hash: string,
	fileIndex: number,
): Promise<TorrServerViewedItem[]> => {
	const raw = await requestTorrServer<TorrServerViewedItem[] | null>(baseUrl, {
		body: {
			action: "set",
			file_index: fileIndex,
			hash,
		},
		method: "POST",
		path: "viewed",
	});

	return Array.isArray(raw) ? raw.map(normalizeViewedItem) : [];
};

export const removeViewedTorrent = async (
	baseUrl: string,
	hash: string,
	fileIndex?: number,
): Promise<TorrServerViewedItem[]> => {
	const raw = await requestTorrServer<TorrServerViewedItem[] | null>(baseUrl, {
		body: {
			action: "rem",
			file_index: fileIndex,
			hash,
		},
		method: "POST",
		path: "viewed",
	});

	return Array.isArray(raw) ? raw.map(normalizeViewedItem) : [];
};

export const listTorrent = async (
	baseUrl: string,
): Promise<TorrServerTorrentStatus[]> => {
	const raw = await requestTorrServer<TorrServerTorrentStatusRaw[] | null>(
		baseUrl,
		{
			body: {
				action: "list",
			},
			method: "POST",
			path: "torrents",
		},
	);

	return Array.isArray(raw) ? raw.map(normalizeTorrentStatus) : [];
};

export const getTorrServerTorrent = async (
	baseUrl: string,
	hash: string,
): Promise<TorrServerTorrentStatus | null> => {
	const raw = await requestTorrServer<TorrServerTorrentStatusRaw | null>(
		baseUrl,
		{
			body: {
				action: "get",
				hash,
			},
			method: "POST",
			path: "torrents",
		},
	);

	return raw ? normalizeTorrentStatus(raw) : null;
};

export const addTorrent = async (
	baseUrl: string,
	torrent: Torrent,
	media: MediaDetails,
): Promise<TorrServerTorrentStatus[]> => {
	const payload = {
		action: "add",
		category: inferTorrentCategory(media),
		data: JSON.stringify({
			moviestracker: true,
			movie: media,
		}),
		link: torrent.Magnet,
		poster: `https://image.tmdb.org/t/p/w300${media.poster_path ?? ""}`,
		save_to_db: true,
		title: `[MT] ${torrent.Name}`,
	};

	const raw = await requestTorrServer<TorrServerTorrentStatusRaw[] | null>(
		baseUrl,
		{
			body: payload,
			method: "POST",
			path: "torrents",
		},
	);

	return Array.isArray(raw) ? raw.map(normalizeTorrentStatus) : [];
};

export const addTorrentByLink = async (
	baseUrl: string,
	request: TorrServerAddLinkRequest,
): Promise<TorrServerTorrentStatus[]> => {
	const raw = await requestTorrServer<TorrServerTorrentStatusRaw[] | null>(
		baseUrl,
		{
			body: {
				action: "add",
				category: request.category ?? "other",
				data: request.data ?? "",
				link: request.link,
				poster: request.poster ?? "",
				save_to_db: request.saveToDb ?? true,
				title: request.title ?? request.link,
			},
			method: "POST",
			path: "torrents",
		},
	);

	return Array.isArray(raw) ? raw.map(normalizeTorrentStatus) : [];
};

export const uploadTorrentFile = async (
	baseUrl: string,
	request: TorrServerUploadRequest,
): Promise<TorrServerTorrentStatus | null> => {
	const form = new FormData();
	const fileName = request.fileName ?? "upload.torrent";

	form.set("file", request.file, fileName);
	form.set("save", request.saveToDb === false ? "false" : "true");

	if (request.title) {
		form.set("title", request.title);
	}
	if (request.category) {
		form.set("category", request.category);
	}
	if (request.poster) {
		form.set("poster", request.poster);
	}
	if (request.data) {
		form.set("data", request.data);
	}

	const uploadUrl = buildUrl(baseUrl, ["torrent", "upload"]);
	const response = await fetchWithTimeout(uploadUrl, {
		body: form,
		method: "POST",
		timeout: TORR_SERVER_TIMEOUT_MS * 3,
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => "");
		throw new Error(
			`TorrServer upload failed (${response.status})${
				errorText ? `: ${errorText.slice(0, 300)}` : ""
			}`,
		);
	}

	const payload = (await response.json().catch(() => null)) as
		| TorrServerTorrentStatusRaw
		| null;

	return payload ? normalizeTorrentStatus(payload) : null;
};

export const dropTorrent = async (
	baseUrl: string,
	hash: string,
): Promise<unknown> =>
	await requestTorrServer(baseUrl, {
		body: {
			action: "drop",
			hash,
		},
		method: "POST",
		path: "torrents",
	});

export const removeTorrent = async (
	baseUrl: string,
	hash: string,
): Promise<unknown> =>
	await requestTorrServer(baseUrl, {
		body: {
			action: "rem",
			hash,
		},
		method: "POST",
		path: "torrents",
	});
