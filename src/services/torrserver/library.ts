import type { MediaDetails } from "../models";
import type { Torrent } from "../models/torrent";
import type {
  TorrServerAddLinkRequest,
  TorrServerTorrentStatus,
  TorrServerTorrentStatusRaw,
  TorrServerUploadRequest,
} from "../torrserver";
import { inferTorrentCategory, normalizeTorrentStatus } from "./normalizers";
import { parseTorrServerStatusList } from "./payloads";
import {
  buildTorrServerUrl,
  fetchTorrServer,
  requestTorrServer,
  TORR_SERVER_TIMEOUT_MS,
  TorrServerHttpError,
} from "./transport";
import { validateTorrServerUploadFile } from "./upload-validation";

const normalizeTorrentList = (raw: unknown): TorrServerTorrentStatus[] =>
  parseTorrServerStatusList(raw).map(normalizeTorrentStatus);

export const listTorrent = async (
  baseUrl: string,
  signal?: AbortSignal,
): Promise<TorrServerTorrentStatus[]> =>
  normalizeTorrentList(
    await requestTorrServer<TorrServerTorrentStatusRaw[] | null>(baseUrl, {
      body: { action: "list" },
      method: "POST",
      path: "torrents",
      signal,
    }),
  );

export const getTorrServerTorrent = async (
  baseUrl: string,
  hash: string,
): Promise<TorrServerTorrentStatus | null> => {
  const raw = await requestTorrServer<TorrServerTorrentStatusRaw | null>(
    baseUrl,
    { body: { action: "get", hash }, method: "POST", path: "torrents" },
  );
  return raw ? normalizeTorrentStatus(raw) : null;
};

export const addTorrent = async (
  baseUrl: string,
  torrent: Torrent,
  media: MediaDetails,
): Promise<TorrServerTorrentStatus[]> =>
  normalizeTorrentList(
    await requestTorrServer<TorrServerTorrentStatusRaw[] | null>(baseUrl, {
      body: {
        action: "add",
        category: inferTorrentCategory(media),
        data: JSON.stringify({ moviestracker: true, movie: media }),
        link: torrent.Magnet,
        poster: `https://image.tmdb.org/t/p/w300${media.poster_path ?? ""}`,
        save_to_db: true,
        title: `[MT] ${torrent.Name}`,
      },
      method: "POST",
      path: "torrents",
    }),
  );

export const addTorrentByLink = async (
  baseUrl: string,
  request: TorrServerAddLinkRequest,
): Promise<TorrServerTorrentStatus[]> =>
  normalizeTorrentList(
    await requestTorrServer<TorrServerTorrentStatusRaw[] | null>(baseUrl, {
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
    }),
  );

export const uploadTorrentFile = async (
  baseUrl: string,
  request: TorrServerUploadRequest,
): Promise<TorrServerTorrentStatus> => {
  const validation = validateTorrServerUploadFile(
    request.file,
    request.fileName,
  );
  if (!validation.ok) {
    throw new TorrServerHttpError(validation.message, { kind: "validation" });
  }

  const form = new FormData();
  form.set("file", request.file, validation.fileName);
  form.set("save", request.saveToDb === false ? "false" : "true");
  if (request.title) form.set("title", request.title);
  if (request.category) form.set("category", request.category);
  if (request.poster) form.set("poster", request.poster);
  if (request.data) form.set("data", request.data);

  const response = await fetchTorrServer(
    buildTorrServerUrl(baseUrl, ["torrent", "upload"]),
    { body: form, method: "POST", timeout: TORR_SERVER_TIMEOUT_MS * 3 },
  );
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

const mutateTorrent = (
  baseUrl: string,
  action: "drop" | "rem",
  hash: string,
): Promise<unknown> =>
  requestTorrServer(baseUrl, {
    body: { action, hash },
    method: "POST",
    path: "torrents",
  });

export const dropTorrent = (baseUrl: string, hash: string): Promise<unknown> =>
  mutateTorrent(baseUrl, "drop", hash);

export const removeTorrent = (
  baseUrl: string,
  hash: string,
): Promise<unknown> => mutateTorrent(baseUrl, "rem", hash);
