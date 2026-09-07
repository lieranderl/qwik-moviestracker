import type { TorrServerViewedItem } from "../torrserver";
import { normalizeViewedItem } from "./normalizers";
import { isOptionalTorrServerFailure, requestTorrServer } from "./transport";

const normalizeViewed = (
  raw: TorrServerViewedItem[] | null,
): TorrServerViewedItem[] =>
  Array.isArray(raw) ? raw.map(normalizeViewedItem) : [];

export const listViewedTorrents = async (
  baseUrl: string,
): Promise<TorrServerViewedItem[]> => {
  try {
    return normalizeViewed(
      await requestTorrServer<TorrServerViewedItem[]>(baseUrl, {
        method: "POST",
        path: "viewed",
        body: { action: "list" },
      }),
    );
  } catch (error) {
    if (isOptionalTorrServerFailure(error)) return [];
    throw error;
  }
};

const mutateViewed = async (
  baseUrl: string,
  action: "rem" | "set",
  hash: string,
  fileIndex?: number,
): Promise<TorrServerViewedItem[]> =>
  normalizeViewed(
    await requestTorrServer<TorrServerViewedItem[] | null>(baseUrl, {
      body: { action, file_index: fileIndex, hash },
      method: "POST",
      path: "viewed",
    }),
  );

export const markViewedTorrent = (
  baseUrl: string,
  hash: string,
  fileIndex: number,
): Promise<TorrServerViewedItem[]> =>
  mutateViewed(baseUrl, "set", hash, fileIndex);

export const removeViewedTorrent = (
  baseUrl: string,
  hash: string,
  fileIndex?: number,
): Promise<TorrServerViewedItem[]> =>
  mutateViewed(baseUrl, "rem", hash, fileIndex);
