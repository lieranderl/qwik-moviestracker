import type { MediaDetails } from "./models";
import type { Torrent } from "./models/torrent";
import type { FileStat, TSResult } from "./models/torrserver";
import {
  buildTorrServerUrl,
  fetchTorrServer,
  isOptionalTorrServerFailure,
  normalizeTorrServerBaseUrl,
  requestTorrServer,
  TORR_SERVER_TIMEOUT_MS,
  TorrServerHttpError,
} from "./torrserver/transport";
import {
  asNumber,
  asString,
  inferTorrentCategory,
  normalizeSettings,
  normalizeTmdbSettings,
  normalizeTorrentStatus,
  normalizeViewedItem,
} from "./torrserver/normalizers";
import { validateTorrServerUploadFile } from "./torrserver/upload-validation";

export {
  buildBrowserPlaybackHint,
  getDefaultPlayableFile,
  getFileExtension,
  inferPlayableFile,
  inferTorrentCategory,
  isBrowserLikelyToPlayVideo,
  normalizeSettings,
  normalizeTorrentStatus,
  parseMoviestrackerPayload,
  parseTorrentMedia,
} from "./torrserver/normalizers";
export {
  TorrServerHttpError,
  type TorrServerQueryParams,
} from "./torrserver/transport";
export {
  TORR_SERVER_UPLOAD_MAX_BYTES,
  type TorrServerUploadValidationResult,
  validateTorrServerUploadFile,
} from "./torrserver/upload-validation";
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

export const normalizeBaseUrl = (value: string): string => {
  return normalizeTorrServerBaseUrl(value);
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
): string => buildTorrServerUrl(baseUrl, ["play", hash, String(fileIndex)]);

export const primeTorrentPlayback = async (
  baseUrl: string,
  hash: string,
  fileIndex: number,
): Promise<boolean> => {
  const playUrl = buildTorrentPlayUrl(baseUrl, hash, fileIndex);

  try {
    const response = await fetchTorrServer(playUrl, {
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
): Promise<TorrServerTorrentStatus> => {
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
  if (!raw) {
    throw new TorrServerHttpError("TorrServer activation returned no status", {
      kind: "validation",
    });
  }
  return normalizeTorrentStatus(raw);
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

  return buildTorrServerUrl(baseUrl, pathSegments, {
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
  buildTorrServerUrl(baseUrl, ["playlist"], {
    fromlast: options.fromLast,
    hash,
  });

export const buildAllTorrentsPlaylistUrl = (baseUrl: string): string =>
  buildTorrServerUrl(baseUrl, ["playlistall", "all.m3u"]);

export const buildTorrServerDownloadTestUrl = (
  baseUrl: string,
  sizeMb: number,
): string => {
  const normalizedSize = Number.isFinite(sizeMb)
    ? Math.max(1, Math.floor(sizeMb))
    : 1;
  return buildTorrServerUrl(baseUrl, ["download", String(normalizedSize)]);
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
  const raw = await requestTorrServer<TorrServerSearchResult[] | null>(
    baseUrl,
    {
      method: "GET",
      path: "search",
      query: {
        query,
      },
    },
  );

  return Array.isArray(raw) ? raw : [];
};

export const searchTorznab = async (
  baseUrl: string,
  query: string,
): Promise<TorrServerSearchResult[]> => {
  const raw = await requestTorrServer<TorrServerSearchResult[] | null>(
    baseUrl,
    {
      method: "GET",
      path: "torznab/search",
      query: {
        query,
      },
    },
  );

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
    if (isOptionalTorrServerFailure(error)) {
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
    if (isOptionalTorrServerFailure(error)) {
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
    if (isOptionalTorrServerFailure(error)) {
      return null;
    }

    throw error;
  }
};

export const updateTorrServerStorageSettings = async (
  baseUrl: string,
  update: TorrServerStorageSettingsUpdate,
): Promise<Record<string, string>> => {
  const url = buildTorrServerUrl(baseUrl, ["storage", "settings"]);
  const form = new FormData();
  form.set("settings", update.settings);
  form.set("viewed", update.viewed);

  const response = await fetchTorrServer(url, {
    body: form,
    method: "POST",
    timeout: TORR_SERVER_TIMEOUT_MS,
  });

  if (!response.ok) {
    throw new TorrServerHttpError("TorrServer storage update failed", {
      kind: "http",
      retryable: response.status === 429 || response.status >= 500,
      status: response.status,
    });
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
    if (isOptionalTorrServerFailure(error)) {
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
    if (isOptionalTorrServerFailure(error)) {
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
  signal?: AbortSignal,
): Promise<TorrServerTorrentStatus[]> => {
  const raw = await requestTorrServer<TorrServerTorrentStatusRaw[] | null>(
    baseUrl,
    {
      body: {
        action: "list",
      },
      method: "POST",
      path: "torrents",
      signal,
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
): Promise<TorrServerTorrentStatus> => {
  const validation = validateTorrServerUploadFile(
    request.file,
    request.fileName,
  );
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const form = new FormData();

  form.set("file", request.file, validation.fileName);
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

  const uploadUrl = buildTorrServerUrl(baseUrl, ["torrent", "upload"]);
  const response = await fetchTorrServer(uploadUrl, {
    body: form,
    method: "POST",
    timeout: TORR_SERVER_TIMEOUT_MS * 3,
  });

  if (!response.ok) {
    throw new TorrServerHttpError("TorrServer upload failed", {
      kind: "http",
      retryable: response.status === 429 || response.status >= 500,
      status: response.status,
    });
  }

  const payload = (await response.json().catch((cause) => {
    throw new TorrServerHttpError("TorrServer upload returned invalid JSON", {
      cause,
      kind: "validation",
    });
  })) as TorrServerTorrentStatusRaw | null;
  if (!payload) {
    throw new TorrServerHttpError("TorrServer upload returned no status", {
      kind: "validation",
    });
  }
  return normalizeTorrentStatus(payload);
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
