import { writeStorageJson, writeStorageString } from "~/utils/browser";
import { MediaType } from "~/services/models";
import { paths } from "~/utils/paths";

export const TORR_SERVER_LIST_KEY = "torrServerList";
export const SELECTED_TORR_SERVER_KEY = "selectedTorServer";

export type ConnectionState = "idle" | "connecting" | "connected" | "error";

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

export function formatTorrentSize(size?: number): string {
  if (!size || size <= 0) {
    return "Unknown size";
  }

  const sizeInGb = size / 1024 ** 3;
  return `${sizeInGb.toFixed(sizeInGb >= 100 ? 0 : 1)} GB`;
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
