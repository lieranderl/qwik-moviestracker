import { describe, expect, test } from "bun:test";
import type { TorrServerTorrentStatus } from "../torrserver";
import {
  loadTorrServerWorkspace,
  mergePolledTorrents,
  nextPollDelay,
  transitionConnection,
} from "./workspace";

const torrent = (
  patch: Partial<TorrServerTorrentStatus>,
): TorrServerTorrentStatus =>
  ({
    fileCount: 0,
    file_stats: [],
    files: [],
    hash: "hash",
    media: null,
    mediaKind: "other",
    playableFile: null,
    stat_string: "",
    statusLabel: "",
    ...patch,
  }) as TorrServerTorrentStatus;

describe("TorrServer workspace state", () => {
  test("allows only valid connection lifecycle transitions", () => {
    expect(transitionConnection("idle", "connect")).toBe("connecting");
    expect(transitionConnection("connecting", "success")).toBe("connected");
    expect(transitionConnection("connected", "failure")).toBe("connected");
    expect(transitionConnection("connected", "clear")).toBe("idle");
  });

  test("backs polling off to a bounded maximum", () => {
    expect(nextPollDelay(0)).toBe(2_000);
    expect(nextPollDelay(2)).toBe(8_000);
    expect(nextPollDelay(99)).toBe(30_000);
  });

  test("preserves file and preload state missing from lightweight polls", () => {
    const file = { id: 2, length: 100, path: "movie.mkv" };
    const current = torrent({
      fileCount: 1,
      file_stats: [file],
      files: [file],
      playableFile: file,
      preloaded_bytes: 50,
    });
    const [merged] = mergePolledTorrents(
      [current],
      [torrent({ preloaded_bytes: 10 })],
      "hash",
    );
    expect(merged.files).toEqual([file]);
    expect(merged.preloaded_bytes).toBe(50);
  });

  test("keeps optional workspace sections when one endpoint fails", async () => {
    const snapshot = await loadTorrServerWorkspace("https://server.test", {
      getVersion: async () => "1.2.3",
      listTorrents: async () => [torrent({})],
      getSettings: async () => null,
      getStorageSettings: async () => {
        throw new Error("unsupported");
      },
      getTmdbSettings: async () => null,
      getStats: async () => "healthy",
      listViewed: async () => [{ hash: "hash" }],
    });
    expect(snapshot.version).toBe("1.2.3");
    expect(snapshot.torrents).toHaveLength(1);
    expect(snapshot.storageSettings).toBeNull();
    expect(snapshot.stats).toBe("healthy");
  });

  test("requires the echo endpoint for a connected snapshot", async () => {
    const unavailable = async () => null;
    await expect(
      loadTorrServerWorkspace("https://server.test", {
        getVersion: async () => "",
        listTorrents: async () => [],
        getSettings: unavailable,
        getStorageSettings: unavailable,
        getTmdbSettings: unavailable,
        getStats: async () => "",
        listViewed: async () => [],
      }),
    ).rejects.toThrow("echo failed");
  });
});
