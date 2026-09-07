import type { MediaDetails } from "../models";
import type {
  TorrServerCategory,
  TorrServerFileStat,
  TorrServerMoviestrackerPayload,
  TorrServerSettings,
  TorrServerSettingsRaw,
  TorrServerTMDBSettingsRaw,
  TorrServerTmdbSettings,
  TorrServerTorrentStatus,
  TorrServerTorrentStatusRaw,
  TorrServerTorznabConfigRaw,
  TorrServerViewedItem,
} from "../torrserver";
import { parseTorrServerStatus } from "./payloads";

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

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const asNumber = (value: unknown, fallback = 0): number =>
  isFiniteNumber(value) ? value : fallback;

const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

export const asString = (value: unknown, fallback = ""): string =>
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

export const parseTorrentMedia = (data?: string): MediaDetails | null =>
  parseMoviestrackerPayload(data)?.movie ?? null;

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

  return (
    [...playablePool].sort((left, right) => right.length - left.length)[0] ??
    null
  );
};

export const getDefaultPlayableFile = inferPlayableFile;

export const normalizeTorrentStatus = (
  raw: TorrServerTorrentStatusRaw,
): TorrServerTorrentStatus => {
  raw = parseTorrServerStatus(raw);
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

export const normalizeTmdbSettings = (
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
  downloadRateLimit: asNumber(
    raw.DownloadRateLimit ?? raw.downloadRateLimit,
    0,
  ),
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
  showFSActiveTorr: asBoolean(
    raw.ShowFSActiveTorr ?? raw.showFSActiveTorr,
    false,
  ),
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

export const normalizeViewedItem = (
  item: TorrServerViewedItem,
): TorrServerViewedItem => ({
  file_index: isFiniteNumber(item.file_index) ? item.file_index : undefined,
  hash: asString(item.hash, ""),
});
