import { describe, expect, it } from "bun:test";
import type { TorrServerTorrentStatus } from "../torrserver";
import { activateTorrentUntilReady } from "./playback";

const torrent = (files: TorrServerTorrentStatus["files"]) =>
  ({ files }) as TorrServerTorrentStatus;

describe("TorrServer activation polling", () => {
  it("stops as soon as files become available", async () => {
    const updates: TorrServerTorrentStatus[] = [];
    let calls = 0;
    const result = await activateTorrentUntilReady("https://server", "hash", {
      attempts: 5,
      activate: async () =>
        torrent(
          ++calls === 2 ? [{ id: 1, length: 10, path: "movie.mp4" }] : [],
        ),
      onUpdate: (update) => updates.push(update),
      wait: async () => {},
    });

    expect(calls).toBe(2);
    expect(updates).toHaveLength(2);
    expect(result?.files).toHaveLength(1);
  });

  it("cancels without starting another activation request", async () => {
    const controller = new AbortController();
    let calls = 0;

    await expect(
      activateTorrentUntilReady("https://server", "hash", {
        attempts: 5,
        activate: async () => {
          calls += 1;
          return torrent([]);
        },
        wait: async (_delay, signal) => {
          controller.abort(new Error("cancelled"));
          if (signal?.aborted) throw signal.reason;
        },
        signal: controller.signal,
      }),
    ).rejects.toThrow("cancelled");

    expect(calls).toBe(1);
  });
});
