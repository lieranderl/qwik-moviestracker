import { describe, expect, it } from "bun:test";
import {
  buildBrowserPlaybackHint,
  buildTorrServerDownloadTestUrl,
  buildTorrentPlayUrl,
  buildTorrentPlaylistUrl,
  buildTorrentStreamUrl,
  getDefaultPlayableFile,
  isBrowserLikelyToPlayVideo,
  primeTorrentPlayback,
} from "./torrserver";

describe("torrserver helpers", () => {
  it("builds playlist URLs for a saved torrent hash", () => {
    expect(
      buildTorrentPlaylistUrl("http://192.168.0.109:8090", "abc123", {
        fromLast: true,
      }),
    ).toBe("http://192.168.0.109:8090/playlist?fromlast&hash=abc123");
  });

  it("builds direct stream URLs using the file path", () => {
    expect(
      buildTorrentStreamUrl("http://192.168.0.109:8090", {
        filename: "Sample.Movie.mp4",
        index: 7,
        link: "abc123",
        play: true,
      }),
    ).toBe(
      "http://192.168.0.109:8090/stream/Sample.Movie.mp4?link=abc123&index=7&play",
    );
  });

  it("detects browser-friendly video containers", () => {
    expect(isBrowserLikelyToPlayVideo("Folder/Sample.Movie.mp4")).toBe(true);
    expect(isBrowserLikelyToPlayVideo("Folder/Sample.Movie.mkv")).toBe(false);
  });

  it("prefers the first browser-friendly file for autoplay decisions", () => {
    expect(
      getDefaultPlayableFile([
        { id: 1, length: 10, path: "Movie/file.mkv" },
        { id: 2, length: 10, path: "Movie/file.mp4" },
      ]),
    ).toEqual({ id: 2, length: 10, path: "Movie/file.mp4" });
  });

  it("returns a compatibility hint for unsupported containers", () => {
    expect(buildBrowserPlaybackHint("Movie/file.mkv")).toBe(
      ".mkv often needs an external player. The in-page player remains available as an experimental option.",
    );
  });

  it("builds /play URL for torrent priming", () => {
    expect(
      buildTorrentPlayUrl("http://192.168.0.109:8090", "abc123", 4),
    ).toBe("http://192.168.0.109:8090/play/abc123/4");
  });

  it("builds /download URL for throughput probing", () => {
    expect(buildTorrServerDownloadTestUrl("http://192.168.0.109:8090", 64)).toBe(
      "http://192.168.0.109:8090/download/64",
    );
  });

  it("uses ranged request when priming playback", async () => {
    const originalFetch = globalThis.fetch;
    let receivedRange = "";
    let receivedUrl = "";

    globalThis.fetch = (async (input, init) => {
      receivedUrl = String(input);
      receivedRange = String((init?.headers as Record<string, string>)?.Range);
      return new Response("", { status: 200 });
    }) as typeof fetch;

    try {
      const ok = await primeTorrentPlayback(
        "http://192.168.0.109:8090",
        "abc123",
        2,
      );
      expect(ok).toBe(true);
      expect(receivedUrl).toBe("http://192.168.0.109:8090/play/abc123/2");
      expect(receivedRange).toBe("bytes=0-1");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
