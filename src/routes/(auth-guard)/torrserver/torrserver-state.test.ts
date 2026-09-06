import { describe, expect, it } from "bun:test";
import type { FileStat, TSResult } from "~/services/models";
import {
  connectionAlertClass,
  filterTorrServerTorrents,
  formatBinarySize,
  formatDurationSeconds,
  formatStatusLabel,
  formatTransferSpeed,
  getDefaultSelectedTorrentHash,
  getNormalizedServersState,
  getPlaybackSupportState,
  getSelectedFile,
  getStateAfterServerRemoval,
  getTorrentHref,
  getTorrentStatusFilter,
  getHydratedServersState,
  normalizeServerList,
  parseStoredServerList,
  parseTorrentMedia,
  sortTorrents,
} from "./torrserver-state";

const fileStats: FileStat[] = [
  { id: 1, path: "Movie/sample.mkv", length: 1000 },
  { id: 2, path: "Movie/sample.mp4", length: 900 },
];

const torrents: TSResult[] = [
  {
    hash: "working-hash",
    name: "Avatar Fire and Ash",
    title: "Avatar Fire and Ash",
    poster: "",
    stat: 3,
    stat_string: "Torrent working",
    torrent_size: 1000,
    file_stats: fileStats,
    active_peers: 2,
    timestamp: 1,
  },
  {
    hash: "db-hash",
    name: "10 Cloverfield Lane",
    title: "10 Cloverfield Lane",
    poster: "",
    stat: 5,
    stat_string: "Torrent in db",
    torrent_size: 1000,
    timestamp: 1,
    data: JSON.stringify({
      movie: { id: 333371, title: "10 Cloverfield Lane" },
    }),
  },
];

describe("torrserver state helpers", () => {
  it("hydrates the selected server from storage when the list is empty", () => {
    expect(getHydratedServersState(null, "http://192.168.0.109:8090")).toEqual({
      list: ["http://192.168.0.109:8090"],
      selected: "http://192.168.0.109:8090",
    });
  });

  it("classifies active torrents using runtime status signals", () => {
    expect(getTorrentStatusFilter(torrents[0])).toBe("active");
    expect(getTorrentStatusFilter(torrents[1])).toBe("database");
  });

  it("filters torrents by status", () => {
    expect(filterTorrServerTorrents(torrents, "all")).toEqual(torrents);
    expect(filterTorrServerTorrents(torrents, "database")).toEqual([
      torrents[1],
    ]);
  });

  it("keeps the selected hash when it still exists", () => {
    expect(getDefaultSelectedTorrentHash(torrents, "db-hash")).toBe("db-hash");
    expect(getDefaultSelectedTorrentHash(torrents, "missing")).toBe(
      "working-hash",
    );
  });

  it("prefers a browser-friendly file when auto-selecting playback", () => {
    expect(getSelectedFile(fileStats, null)).toEqual(fileStats[1]);
  });

  it("returns playback support hints based on file type", () => {
    expect(getPlaybackSupportState(fileStats[1])).toEqual({
      hint: ".mp4 should be playable in most modern browsers if the codec is supported.",
      isLikelyPlayable: true,
    });
    expect(getPlaybackSupportState(fileStats[0])).toEqual({
      hint: ".mkv often needs an external player. The in-page player remains available as an experimental option.",
      isLikelyPlayable: false,
    });
  });

  it("normalizes, deduplicates, selects, and removes server endpoints", () => {
    expect(
      normalizeServerList([" https://one.test/ ", "https://one.test"]),
    ).toEqual(["https://one.test"]);
    expect(getNormalizedServersState(["https://one.test"], "missing")).toEqual({
      list: ["https://one.test"],
      selected: "https://one.test",
    });
    expect(getStateAfterServerRemoval(["one", "two"], "one")).toEqual({
      list: ["two"],
      selected: "two",
    });
    expect(parseStoredServerList("not-json")).toEqual(["not-json"]);
    expect(parseStoredServerList("{}")).toEqual([]);
  });

  it("parses media metadata and creates media links", () => {
    const media = parseTorrentMedia(torrents[1].data);
    expect(media?.id).toBe(333371);
    expect(getTorrentHref(media, "en-US")).toContain("/movie/333371");
    expect(parseTorrentMedia("{")).toBeNull();
    expect(getTorrentHref(null, "en-US")).toBeNull();
  });

  it("formats operational values and connection state", () => {
    expect(formatBinarySize(1536)).toBe("1.5 KB");
    expect(formatBinarySize()).toBe("Unknown size");
    expect(formatTransferSpeed(1024)).toBe("1.0 KB/s");
    expect(formatDurationSeconds(3660)).toBe("1h 1m");
    expect(formatStatusLabel("getting_info")).toBe("Getting Info");
    expect(connectionAlertClass("connected")).toBe("alert-success");
    expect(connectionAlertClass("error")).toBe("alert-error");
  });

  it("sorts a copy by title, peers, preload, and recency", () => {
    const rows = [
      {
        title: "B",
        total_peers: 1,
        preloaded_bytes: 90,
        torrent_size: 100,
        timestamp: 1,
      },
      {
        title: "A",
        total_peers: 5,
        preloaded_bytes: 10,
        torrent_size: 100,
        timestamp: 2,
      },
    ];
    expect(sortTorrents(rows, "title")[0].title).toBe("A");
    expect(sortTorrents(rows, "peers")[0].title).toBe("A");
    expect(sortTorrents(rows, "preload")[0].title).toBe("B");
    expect(sortTorrents(rows, "recent")[0].title).toBe("A");
    expect(rows[0].title).toBe("B");
  });
});
