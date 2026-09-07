import type { MediaDetails } from "./models";
import type { FileStat, TSResult } from "./models/torrserver";

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

export * from "./torrserver/diagnostics";
export * from "./torrserver/library";
export * from "./torrserver/playback";
export * from "./torrserver/search";
export * from "./torrserver/settings";
export * from "./torrserver/viewed";
