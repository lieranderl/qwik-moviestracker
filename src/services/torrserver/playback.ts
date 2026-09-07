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
): Promise<TorrServerTorrentStatus> => {
  const raw = await requestTorrServer<TorrServerTorrentStatusRaw | null>(
    baseUrl,
    {
      method: "GET",
      path: "stream",
      query: { link: hash, stat: true, preload: true },
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
