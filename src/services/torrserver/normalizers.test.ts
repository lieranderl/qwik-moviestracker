import { describe, expect, test } from "bun:test";
import {
  asNumber,
  asString,
  buildBrowserPlaybackHint,
  getFileExtension,
  inferPlayableFile,
  inferTorrentCategory,
  isBrowserLikelyToPlayVideo,
  normalizeSettings,
  normalizeTmdbSettings,
  normalizeTorrentStatus,
  normalizeViewedItem,
  parseMoviestrackerPayload,
  parseTorrentMedia,
} from "./normalizers";

describe("TorrServer normalizers", () => {
  test("normalizes scalar values and metadata defensively", () => {
    expect(asNumber(4)).toBe(4);
    expect(asNumber("4", 2)).toBe(2);
    expect(asString("value")).toBe("value");
    expect(asString(4, "fallback")).toBe("fallback");
    expect(parseMoviestrackerPayload()).toBeNull();
    expect(parseMoviestrackerPayload("null")).toBeNull();
    expect(parseMoviestrackerPayload("{")).toBeNull();
    const data = JSON.stringify({ movie: { id: 10, media_type: "movie" } });
    expect(parseTorrentMedia(data)?.id).toBe(10);
  });

  test("infers media categories and the best playable file", () => {
    expect(inferTorrentCategory(null)).toBe("other");
    expect(inferTorrentCategory({ media_type: "movie" } as never)).toBe(
      "movie",
    );
    expect(
      inferTorrentCategory({ media_type: "tv", seasons: [] } as never),
    ).toBe("tv");
    const files = [
      { id: 1, length: 500, path: "notes.txt" },
      { id: 2, length: 900, path: "large.mkv" },
      { id: 3, length: 100, path: "small.mp4" },
    ];
    expect(inferPlayableFile(files, 1)?.id).toBe(1);
    expect(inferPlayableFile(files)?.id).toBe(3);
    expect(inferPlayableFile([])).toBeNull();
  });

  test("normalizes a validated torrent status", () => {
    const normalized = normalizeTorrentStatus({
      active_peers: 2,
      data: JSON.stringify({ movie: { id: 3, seasons: [] } }),
      file_stats: [{ id: 4, length: 100, path: "episode.mkv" }],
      hash: "abc",
      name: "Name",
      stat: 3,
      stat_string: "getting_info",
      timestamp: 4,
      title: "Title",
      torrent_size: 100,
    } as never);
    expect(normalized.hash).toBe("abc");
    expect(normalized.fileCount).toBe(1);
    expect(normalized.mediaKind).toBe("tv");
    expect(normalized.statusLabel).toBe("Getting Info");
    expect(normalized.download_speed).toBe(0);
  });

  test("normalizes legacy and camel-case settings with safe defaults", () => {
    const settings = normalizeSettings({
      CacheSize: 32,
      DisableDHT: true,
      EnableRutorSearch: true,
      FriendlyName: "Living room",
      ProxyHosts: ["one", 2] as never,
      TMDBSettings: { APIKey: "key", APIURL: "https://tmdb.test" },
      TorznabUrls: [{ name: "indexer" }],
      UseDisk: true,
    });
    expect(settings).toMatchObject({
      cacheSize: 32,
      disableDHT: true,
      enableRutorSearch: true,
      friendlyName: "Living room",
      proxyHosts: ["one"],
      useDisk: true,
    });
    expect(settings.tmdbSettings.apiKey).toBe("key");
    expect(settings.tmdbSettings.imageUrl).toBe("https://image.tmdb.org");
    expect(normalizeSettings({}).connectionsLimit).toBe(0);
  });

  test("normalizes TMDB and viewed settings", () => {
    expect(
      normalizeTmdbSettings({ imageUrlRu: "https://images.test" }),
    ).toMatchObject({
      apiUrl: "https://api.themoviedb.org",
      imageUrlRu: "https://images.test",
    });
    expect(
      normalizeViewedItem({ file_index: Number.NaN, hash: "hash" }),
    ).toEqual({
      file_index: undefined,
      hash: "hash",
    });
  });

  test("describes browser playback support", () => {
    expect(getFileExtension("movie.MP4")).toBe("mp4");
    expect(getFileExtension("readme.txt")).toBe("");
    expect(isBrowserLikelyToPlayVideo("movie.webm")).toBe(true);
    expect(buildBrowserPlaybackHint("readme.txt")).toContain("unknown");
  });
});
