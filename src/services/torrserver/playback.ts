import type {
  TorrServerFileStat,
  TorrServerPlaylistOptions,
  TorrServerStreamOptions,
  TorrServerTorrentStatus,
  TorrServerTorrentStatusRaw,
} from "../torrserver";
import { normalizeTorrentStatus } from "./normalizers";
import {
  buildTorrServerUrl,
  fetchTorrServer,
  normalizeTorrServerBaseUrl,
  requestTorrServer,
  TORR_SERVER_TIMEOUT_MS,
  TorrServerHttpError,
} from "./transport";

export const normalizeBaseUrl = (value: string): string =>
  normalizeTorrServerBaseUrl(value);

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
  try {
    const response = await fetchTorrServer(
      buildTorrentPlayUrl(baseUrl, hash, fileIndex),
      {
        headers: { Range: "bytes=0-1" },
        method: "GET",
        timeout: 2500,
      },
    );
    return response.ok;
  } catch {
    return false;
  }
};

export const activateTorrent = async (
  baseUrl: string,
  hash: string,
  signal?: AbortSignal,
): Promise<TorrServerTorrentStatus> => {
  const raw = await requestTorrServer<TorrServerTorrentStatusRaw | null>(
    baseUrl,
    {
      method: "GET",
      path: "stream",
      query: { link: hash, stat: true, preload: true },
      signal,
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

type ActivationPollOptions = {
  attempts?: number;
  intervalMs?: number;
  onUpdate?: (torrent: TorrServerTorrentStatus) => void;
  signal?: AbortSignal;
  activate?: typeof activateTorrent;
  wait?: (delayMs: number, signal?: AbortSignal) => Promise<void>;
};

const waitForActivation = (
  delayMs: number,
  signal?: AbortSignal,
): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    signal?.addEventListener("abort", onAbort, { once: true });
  });

export const activateTorrentUntilReady = async (
  baseUrl: string,
  hash: string,
  options: ActivationPollOptions = {},
): Promise<TorrServerTorrentStatus | null> => {
  const attempts = Math.min(30, Math.max(1, options.attempts ?? 16));
  const intervalMs = Math.max(0, options.intervalMs ?? 2_000);
  const activate = options.activate ?? activateTorrent;
  const wait = options.wait ?? waitForActivation;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) await wait(intervalMs, options.signal);
    if (options.signal?.aborted) throw options.signal.reason;
    try {
      const torrent = await activate(baseUrl, hash, options.signal);
      options.onUpdate?.(torrent);
      if (torrent.files.length > 0) return torrent;
    } catch (error) {
      if (options.signal?.aborted || attempt === attempts - 1) throw error;
    }
  }
  return null;
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
): string =>
  buildTorrServerUrl(baseUrl, filename ? ["stream", filename] : ["stream"], {
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

export const getTorrentPlaylist = async (
  baseUrl: string,
  hash: string,
  options: TorrServerPlaylistOptions = {},
): Promise<string> =>
  requestTorrServer<string>(baseUrl, {
    method: "GET",
    path: "playlist",
    query: { fromlast: options.fromLast, hash },
    responseType: "text",
  });

export const getAllTorrentsPlaylist = async (
  baseUrl: string,
): Promise<string> =>
  requestTorrServer<string>(baseUrl, {
    method: "GET",
    path: "playlistall/all.m3u",
    responseType: "text",
  });

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
