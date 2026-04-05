import { describe, expect, it } from "bun:test";
import type { FileStat, TSResult } from "~/services/models";
import {
  filterTorrServerTorrents,
  getDefaultSelectedTorrentHash,
  getPlaybackSupportState,
  getSelectedFile,
  getTorrentStatusFilter,
  getHydratedServersState,
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

  it("filters torrents by query and status", () => {
    expect(filterTorrServerTorrents(torrents, "avatar", "all")).toEqual([
      torrents[0],
    ]);
    expect(filterTorrServerTorrents(torrents, "", "database")).toEqual([
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
});
