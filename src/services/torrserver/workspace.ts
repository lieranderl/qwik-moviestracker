import type {
  TorrServerSettings,
  TorrServerStorageSettings,
  TorrServerTmdbSettings,
  TorrServerTorrentStatus,
  TorrServerViewedItem,
} from "../torrserver";
import {
  getTorrServerSettings,
  getTorrServerStats,
  getTorrServerStorageSettings,
  getTorrServerTMDBSettings,
  getTorrServerVersion,
  listTorrent,
  listViewedTorrents,
} from "../torrserver";

export type TorrServerConnectionState =
  "idle" | "connecting" | "connected" | "error";

export type TorrServerWorkspaceSnapshot = {
  settings: TorrServerSettings | null;
  stats: string;
  storageSettings: TorrServerStorageSettings | null;
  tmdbSettings: TorrServerTmdbSettings | null;
  torrents: TorrServerTorrentStatus[];
  version: string;
  viewedItems: TorrServerViewedItem[];
};

export const emptyWorkspaceSnapshot = (): TorrServerWorkspaceSnapshot => ({
  settings: null,
  stats: "",
  storageSettings: null,
  tmdbSettings: null,
  torrents: [],
  version: "",
  viewedItems: [],
});

export const transitionConnection = (
  current: TorrServerConnectionState,
  event: "clear" | "connect" | "failure" | "success",
): TorrServerConnectionState => {
  switch (event) {
    case "clear":
      return "idle";
    case "connect":
      return current === "connecting" ? current : "connecting";
    case "success":
      return current === "connecting" ? "connected" : current;
    case "failure":
      return current === "connecting" ? "error" : current;
  }
};

export const nextPollDelay = (failures: number): number =>
  Math.min(30_000, 2_000 * 2 ** Math.min(Math.max(0, failures), 4));

export const mergePolledTorrents = (
  current: TorrServerTorrentStatus[],
  updated: TorrServerTorrentStatus[],
  activatingHash = "",
): TorrServerTorrentStatus[] =>
  updated.map((polled) => {
    const existing = current.find((torrent) => torrent.hash === polled.hash);
    if (!existing) return polled;
    const preserveFiles =
      existing.files.length > 0 && polled.files.length === 0;
    const preservePreload =
      polled.hash === activatingHash &&
      (existing.preloaded_bytes || 0) > (polled.preloaded_bytes || 0);
    if (!preserveFiles && !preservePreload) return polled;
    return {
      ...polled,
      ...(preserveFiles && {
        fileCount: existing.fileCount,
        file_stats: existing.file_stats,
        files: existing.files,
        playableFile: existing.playableFile,
      }),
      ...(preservePreload && { preloaded_bytes: existing.preloaded_bytes }),
    };
  });

const valueOr = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
  result.status === "fulfilled" ? result.value : fallback;

type WorkspaceDependencies = {
  getSettings: typeof getTorrServerSettings;
  getStats: typeof getTorrServerStats;
  getStorageSettings: typeof getTorrServerStorageSettings;
  getTmdbSettings: typeof getTorrServerTMDBSettings;
  getVersion: typeof getTorrServerVersion;
  listTorrents: typeof listTorrent;
  listViewed: typeof listViewedTorrents;
};

const defaultDependencies: WorkspaceDependencies = {
  getSettings: getTorrServerSettings,
  getStats: getTorrServerStats,
  getStorageSettings: getTorrServerStorageSettings,
  getTmdbSettings: getTorrServerTMDBSettings,
  getVersion: getTorrServerVersion,
  listTorrents: listTorrent,
  listViewed: listViewedTorrents,
};

export const loadTorrServerWorkspace = async (
  baseUrl: string,
  dependencies: WorkspaceDependencies = defaultDependencies,
): Promise<TorrServerWorkspaceSnapshot> => {
  const results = await Promise.allSettled([
    dependencies.getVersion(baseUrl),
    dependencies.listTorrents(baseUrl),
    dependencies.getSettings(baseUrl),
    dependencies.getStorageSettings(baseUrl),
    dependencies.getTmdbSettings(baseUrl),
    dependencies.getStats(baseUrl),
    dependencies.listViewed(baseUrl),
  ] as const);
  const version = valueOr(results[0], "");
  if (!version)
    throw results[0].status === "rejected"
      ? results[0].reason
      : new Error("TorrServer echo failed");
  return {
    version,
    torrents: valueOr(results[1], []),
    settings: valueOr(results[2], null),
    storageSettings: valueOr(results[3], null),
    tmdbSettings: valueOr(results[4], null),
    stats: valueOr(results[5], ""),
    viewedItems: valueOr(results[6], []),
  };
};
