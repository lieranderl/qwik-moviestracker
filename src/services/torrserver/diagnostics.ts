import type { TorrServerCacheState } from "../torrserver";
import { normalizeTorrentStatus } from "./normalizers";
import {
  buildTorrServerUrl,
  isOptionalTorrServerFailure,
  requestTorrServer,
} from "./transport";

export const torrServerEcho = async (baseUrl: string): Promise<string> => {
  const response = await requestTorrServer<string>(baseUrl, {
    method: "GET",
    path: "echo",
    responseType: "text",
  });
  return response.trim();
};

export const getTorrServerVersion = torrServerEcho;

export const buildTorrServerDownloadTestUrl = (
  baseUrl: string,
  sizeMb: number,
): string => {
  const size = Number.isFinite(sizeMb) ? Math.max(1, Math.floor(sizeMb)) : 1;
  return buildTorrServerUrl(baseUrl, ["download", String(size)]);
};

export const getTorrServerStats = async (baseUrl: string): Promise<string> =>
  requestTorrServer<string>(baseUrl, {
    method: "GET",
    path: "stat",
    responseType: "text",
  });

export const getTorrServerMagnetsPage = async (
  baseUrl: string,
): Promise<string> =>
  requestTorrServer<string>(baseUrl, {
    method: "GET",
    path: "magnets",
    responseType: "text",
  });

export const getTorrentFfprobe = async (
  baseUrl: string,
  hash: string,
  fileIndex: number,
): Promise<unknown> =>
  requestTorrServer<unknown>(baseUrl, {
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
      body: { action: "get", hash },
      method: "POST",
      path: "cache",
    });
    return {
      ...raw,
      torrent: raw.torrent ? normalizeTorrentStatus(raw.torrent) : null,
    };
  } catch (error) {
    if (isOptionalTorrServerFailure(error)) return null;
    throw error;
  }
};

export const getTorrServerFfprobe = getTorrentFfprobe;
