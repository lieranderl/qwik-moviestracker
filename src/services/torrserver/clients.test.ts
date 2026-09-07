import { afterEach, describe, expect, it } from "bun:test";
import {
  addTorrent,
  addTorrentByLink,
  buildAllTorrentsPlaylistUrl,
  buildFileStreamUrl,
  buildMagnetFromHash,
  buildPlaylistUrl,
  dropTorrent,
  getAllTorrentsPlaylist,
  getTorrentCache,
  getTorrentFfprobe,
  getTorrentPlaylist,
  getTorrServerMagnetsPage,
  getTorrServerSettings,
  getTorrServerStats,
  getTorrServerStorageSettings,
  getTorrServerTMDBSettings,
  getTorrServerTorrent,
  getTorrServerVersion,
  listTorrent,
  listViewedTorrents,
  markViewedTorrent,
  normalizeBaseUrl,
  removeTorrent,
  removeViewedTorrent,
  searchRutor,
  searchTorznab,
  updateTorrServerStorageSettings,
  uploadTorrentFile,
} from "../torrserver";

const baseUrl = "http://127.0.0.1:8090";
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const jsonResponse = (value: unknown, status = 200): Response =>
  new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
    status,
  });

const mockFetch = (...responses: Response[]): string[] => {
  const urls: string[] = [];
  globalThis.fetch = (async (input) => {
    urls.push(String(input));
    const response = responses.shift();
    if (!response) throw new Error("unexpected fetch");
    return response;
  }) as typeof fetch;
  return urls;
};

const torrentStatus = {
  file_stats: [{ id: 1, length: 10, path: "Movie.mp4" }],
  hash: "abc123",
  name: "Movie",
};

describe("TorrServer domain clients", () => {
  it("serves diagnostics and optional cache data", async () => {
    const urls = mockFetch(
      new Response("MatriX.136"),
      new Response("stats"),
      new Response("magnets"),
      jsonResponse({ streams: [] }),
      jsonResponse({ torrent: torrentStatus }),
    );

    expect(await getTorrServerVersion(baseUrl)).toBe("MatriX.136");
    expect(await getTorrServerStats(baseUrl)).toBe("stats");
    expect(await getTorrServerMagnetsPage(baseUrl)).toBe("magnets");
    expect(await getTorrentFfprobe(baseUrl, "abc123", 1)).toEqual({
      streams: [],
    });
    expect((await getTorrentCache(baseUrl, "abc123"))?.torrent?.hash).toBe(
      "abc123",
    );
    expect(urls).toHaveLength(5);
  });

  it("searches Rutor and Torznab through one normalized boundary", async () => {
    mockFetch(
      jsonResponse([{ title: "Movie", hash: "one" }]),
      jsonResponse([{ title: "Series", hash: "two" }]),
    );
    expect(await searchRutor(baseUrl, "movie")).toHaveLength(1);
    expect(await searchTorznab(baseUrl, "series")).toHaveLength(1);
  });

  it("reads and updates settings", async () => {
    mockFetch(
      jsonResponse({ FriendlyName: "Home", UseDisk: true }),
      jsonResponse({ settings: "json", viewed: "bbolt", viewedCount: 4 }),
      jsonResponse({ saved: "true" }),
      jsonResponse({ APIKey: "key", APIURL: "api", ImageURL: "image" }),
    );

    expect((await getTorrServerSettings(baseUrl))?.friendlyName).toBe("Home");
    expect((await getTorrServerStorageSettings(baseUrl))?.viewedCount).toBe(4);
    expect(
      await updateTorrServerStorageSettings(baseUrl, {
        settings: "json",
        viewed: "bbolt",
      }),
    ).toEqual({ saved: "true" });
    expect((await getTorrServerTMDBSettings(baseUrl))?.apiKey).toBe("key");
  });

  it("lists and mutates viewed state", async () => {
    mockFetch(
      jsonResponse([{ hash: "one", file_index: 1 }]),
      jsonResponse([{ hash: "one", file_index: 2 }]),
      jsonResponse([]),
    );
    expect(await listViewedTorrents(baseUrl)).toEqual([
      { hash: "one", file_index: 1 },
    ]);
    expect(await markViewedTorrent(baseUrl, "one", 2)).toEqual([
      { hash: "one", file_index: 2 },
    ]);
    expect(await removeViewedTorrent(baseUrl, "one", 2)).toEqual([]);
  });

  it("manages the torrent library through typed operations", async () => {
    mockFetch(
      jsonResponse([torrentStatus]),
      jsonResponse(torrentStatus),
      jsonResponse([torrentStatus]),
      jsonResponse([torrentStatus]),
      jsonResponse(torrentStatus),
      jsonResponse({ ok: true }),
      jsonResponse({ ok: true }),
    );

    expect(await listTorrent(baseUrl)).toHaveLength(1);
    expect((await getTorrServerTorrent(baseUrl, "abc123"))?.hash).toBe(
      "abc123",
    );
    expect(
      await addTorrent(
        baseUrl,
        { Magnet: "magnet:?xt=urn:btih:abc123", Name: "Movie" } as never,
        { id: 1, media_type: "movie", poster_path: "/poster.jpg" } as never,
      ),
    ).toHaveLength(1);
    expect(
      await addTorrentByLink(baseUrl, {
        link: "magnet:?xt=urn:btih:abc123",
      }),
    ).toHaveLength(1);
    expect(
      await uploadTorrentFile(baseUrl, {
        file: new Blob(["torrent"], { type: "application/x-bittorrent" }),
        fileName: "movie.torrent",
      }),
    ).toMatchObject({ hash: "abc123" });
    await expect(dropTorrent(baseUrl, "abc123")).resolves.toEqual({ ok: true });
    await expect(removeTorrent(baseUrl, "abc123")).resolves.toEqual({
      ok: true,
    });
  });

  it("builds compatibility playback URLs and fetches playlists", async () => {
    mockFetch(new Response("#EXTM3U"), new Response("#EXTM3U\nall"));

    expect(normalizeBaseUrl(`${baseUrl}/`)).toBe(baseUrl);
    expect(buildMagnetFromHash(" abc123 ")).toContain("abc123");
    expect(buildAllTorrentsPlaylistUrl(baseUrl)).toContain("playlistall");
    expect(buildPlaylistUrl(baseUrl, "abc123", true)).toContain("fromlast");
    expect(
      buildFileStreamUrl(baseUrl, "abc123", {
        id: 1,
        length: 10,
        path: "Folder/Movie.mp4",
      }),
    ).toContain("Movie.mp4");
    expect(await getTorrentPlaylist(baseUrl, "abc123")).toBe("#EXTM3U");
    expect(await getAllTorrentsPlaylist(baseUrl)).toContain("all");
  });
});
