import type { Signal } from "@builder.io/qwik";
import type { FileStat, TSResult } from "~/services/models";
import {
  buildBrowserPlaybackHint,
  getDefaultPlayableFile,
  isBrowserLikelyToPlayVideo,
} from "~/services/torrserver";
import { MediaType } from "~/services/models";
import { paths } from "~/utils/paths";
import { writeStorageJson, writeStorageString } from "~/utils/browser";

export const TORR_SERVER_LIST_KEY = "torrServerList";
export const SELECTED_TORR_SERVER_KEY = "selectedTorServer";

export type ConnectionState = "idle" | "connecting" | "connected" | "error";
export type TorrServerStatusFilter = "all" | "active" | "database" | "other";

export type ParsedTorrentMedia = {
  id: number;
  title?: string;
  name?: string;
  seasons?: unknown;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
};

export type TorrServerState = {
  list: string[];
  selected: string;
};

export function normalizeServer(value: string): string {
  return value.trim();
}

export function normalizeServerList(list: string[]): string[] {
  return [...new Set(list.map(normalizeServer).filter(Boolean))];
}

export function resolveSelectedServer(
  list: string[],
  preferredServer: string,
): string {
  const normalizedPreferredServer = normalizeServer(preferredServer);
  if (normalizedPreferredServer && list.includes(normalizedPreferredServer)) {
    return normalizedPreferredServer;
  }
  return list[0] || "";
}

export function parseStoredServerList(rawList: string | null): string[] {
  if (!rawList) {
    return [];
  }

  try {
    const parsedList = JSON.parse(rawList) as unknown;
    if (!Array.isArray(parsedList)) {
      return [];
    }

    return parsedList.filter(
      (item): item is string =>
        typeof item === "string" && normalizeServer(item).length > 0,
    );
  } catch (error) {
    console.error("Failed to parse torrServerList", error);
    const fallbackServer = normalizeServer(rawList);
    return fallbackServer ? [fallbackServer] : [];
  }
}

export function getNormalizedServersState(
  servers: string[],
  preferredServer: string,
): TorrServerState {
  const list = normalizeServerList(servers);
  return {
    list,
    selected: resolveSelectedServer(list, preferredServer),
  };
}

export function getHydratedServersState(
  rawList: string | null,
  rawSelected: string | null,
): TorrServerState {
  const parsedList = parseStoredServerList(rawList);
  const selected = normalizeServer(rawSelected || "");
  const nextList = [...parsedList];

  if (nextList.length === 0 && selected) {
    nextList.push(selected);
  }

  return getNormalizedServersState(nextList, selected);
}

export function getStateAfterServerRemoval(
  servers: string[],
  serverToRemove: string,
): TorrServerState {
  const normalizedServerToRemove = normalizeServer(serverToRemove);
  const nextList = servers.filter(
    (server) => normalizeServer(server) !== normalizedServerToRemove,
  );

  return getNormalizedServersState(nextList, nextList[0] || "");
}

export function persistServersStorage(state: TorrServerState): void {
  writeStorageJson(TORR_SERVER_LIST_KEY, [...state.list]);
  writeStorageString(SELECTED_TORR_SERVER_KEY, normalizeServer(state.selected));
}

export function applyServersState(
  servers: string[],
  preferredServer: string,
  listSig: Signal<string[]>,
  selectedSig: Signal<string>,
): TorrServerState {
  const nextState = getNormalizedServersState(servers, preferredServer);
  listSig.value = nextState.list;
  selectedSig.value = nextState.selected;
  return nextState;
}

export function parseTorrentMedia(data?: string): ParsedTorrentMedia | null {
  if (!data) {
    return null;
  }

  try {
    const parsed = JSON.parse(data) as { movie?: ParsedTorrentMedia };
    return parsed.movie ?? null;
  } catch (error) {
    console.error("Failed to parse torrent metadata", error);
    return null;
  }
}

export function getTorrentHref(
  media: ParsedTorrentMedia | null,
  lang: string,
): string | null {
  if (!media?.id) {
    return null;
  }

  return media.seasons
    ? paths.media(MediaType.Tv, media.id, lang)
    : paths.media(MediaType.Movie, media.id, lang);
}

export function formatBinarySize(size?: number): string {
  if (!size || size <= 0) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = value >= 100 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

export function formatTorrentSize(size?: number): string {
  return formatBinarySize(size);
}

export function formatTransferSpeed(speed?: number): string {
  if (!speed || speed <= 0) {
    return "0 B/s";
  }

  return `${formatBinarySize(speed)}/s`;
}

export function formatDurationSeconds(seconds?: number): string {
  if (!seconds || seconds <= 0) {
    return "0m";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatStatusLabel(value?: string): string {
  if (!value) {
    return "";
  }

  return value
    .replaceAll(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function connectionAlertClass(state: ConnectionState): string {
  switch (state) {
    case "connected":
      return "alert-success";
    case "connecting":
      return "alert-info";
    case "error":
      return "alert-error";
    default:
      return "alert-ghost border-base-200";
  }
}

export function getTorrentStatusFilter(torrent: TSResult): TorrServerStatusFilter {
  const normalizedStatus = torrent.stat_string.toLowerCase();

  if (
    torrent.active_peers ||
    torrent.connected_seeders ||
    (torrent.download_speed ?? 0) > 0 ||
    normalizedStatus.includes("working") ||
    normalizedStatus.includes("preload") ||
    normalizedStatus.includes("getting info")
  ) {
    return "active";
  }

  if (normalizedStatus.includes("db")) {
    return "database";
  }

  return "other";
}

export function filterTorrServerTorrents(
  torrents: TSResult[],
  query: string,
  status: TorrServerStatusFilter,
): TSResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  return torrents.filter((torrent) => {
    if (status !== "all" && getTorrentStatusFilter(torrent) !== status) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const media = parseTorrentMedia(torrent.data);
    const searchableValues = [
      torrent.title,
      torrent.name,
      torrent.hash,
      torrent.category,
      media?.title,
      media?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableValues.includes(normalizedQuery);
  });
}

export function getDefaultSelectedTorrentHash(
  torrents: TSResult[],
  currentHash: string,
): string {
  if (currentHash && torrents.some((torrent) => torrent.hash === currentHash)) {
    return currentHash;
  }

  return torrents[0]?.hash || "";
}

export function getSelectedFile(
  files: FileStat[] | undefined,
  currentId: number | null,
): FileStat | null {
  if (!files || files.length === 0) {
    return null;
  }

  if (currentId !== null) {
    const exactMatch = files.find((file) => file.id === currentId);
    if (exactMatch) {
      return exactMatch;
    }
  }

  return getDefaultPlayableFile(files);
}

export function getPlaybackSupportState(file: FileStat | null): {
  hint: string;
  isLikelyPlayable: boolean;
} {
  if (!file) {
    return {
      hint: "Select a file to generate a stream URL and enable playback actions.",
      isLikelyPlayable: false,
    };
  }

  return {
    hint: buildBrowserPlaybackHint(file.path),
    isLikelyPlayable: isBrowserLikelyToPlayVideo(file.path),
  };
}

/* ── Sort & filter helpers used by the route page ────────── */

export type TorrServerSortKey = "peers" | "preload" | "recent" | "title";

export const STATUS_FILTERS: TorrServerStatusFilter[] = [
  "all",
  "active",
  "database",
  "other",
];

export const SORT_OPTIONS: TorrServerSortKey[] = [
  "recent",
  "peers",
  "preload",
  "title",
];

export function sortTorrents<T extends { title?: string; name?: string; total_peers?: number; preloaded_bytes?: number; torrent_size?: number; timestamp?: number }>(
  torrents: T[],
  sortKey: TorrServerSortKey,
): T[] {
  return [...torrents].sort((left, right) => {
    if (sortKey === "title") {
      return (left.title || left.name || "").localeCompare(
        right.title || right.name || "",
      );
    }
    if (sortKey === "peers") {
      return (right.total_peers || 0) - (left.total_peers || 0);
    }
    if (sortKey === "preload") {
      const lp = left.torrent_size ? (left.preloaded_bytes || 0) / left.torrent_size : 0;
      const rp = right.torrent_size ? (right.preloaded_bytes || 0) / right.torrent_size : 0;
      return rp - lp;
    }
    return (right.timestamp || 0) - (left.timestamp || 0);
  });
}
