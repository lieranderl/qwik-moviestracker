import { afterEach, describe, expect, it, mock } from "bun:test";
import {
	clearTorrentSearchCacheForTests,
	getTorrentSearch,
	getTorrents,
	normalizeJacRedResults,
} from "./torrent-search";

const originalConsoleError = console.error;
const originalFetch = globalThis.fetch;
const originalEnv = {
	JACRED_API_BASE_URL: process.env.JACRED_API_BASE_URL,
	JACRED_SEARCH_LIMIT: process.env.JACRED_SEARCH_LIMIT,
	JACRED_SEARCH_PATH: process.env.JACRED_SEARCH_PATH,
	JACRED_SEARCH_TIMEOUT_MS: process.env.JACRED_SEARCH_TIMEOUT_MS,
};

const createJsonResponse = (body: unknown, status = 200) =>
	({
		json: async () => body,
		ok: status >= 200 && status < 300,
		status,
	}) as Response;

const restoreEnv = () => {
	for (const [key, value] of Object.entries(originalEnv)) {
		if (value === undefined) {
			delete process.env[key as keyof typeof originalEnv];
		} else {
			process.env[key as keyof typeof originalEnv] = value;
		}
	}
};

afterEach(() => {
	clearTorrentSearchCacheForTests();
	console.error = originalConsoleError;
	globalThis.fetch = originalFetch;
	restoreEnv();
});

describe("JacRed torrent search service", () => {
	it("normalizes JacRed results into the legacy Torrent shape", () => {
		const [torrent] = normalizeJacRedResults(
			[
				{
					created_at: "2026-06-03",
					id: "jacred-id",
					magnet:
						"magnet:?xt=urn:btih:61065ea115b7cc3e8db9fb5ab1f6f327f08bd1c9",
					name: "Матрица",
					original_name: "The Matrix",
					peers: 27,
					quality: 2160,
					quality_label: "4K",
					seeders: 449,
					size_name: "2.00 GB",
					size: 2 * 1024 * 1024 * 1024,
					source_url: "https://rutracker.org/forum/viewtopic.php?t=6306464",
					title:
						"Матрица / The Matrix [1999, WEB-DL 2160p, HDR10+, Dolby Vision]",
					tracker: "rutracker",
					video_type: "hdr",
					voices: ["Дубляж"],
					year: 1999,
				},
			],
			{ isMovie: true, name: "The Matrix", year: 1999 },
		);

		expect(torrent).toEqual({
			AvailabilityScore: 0,
			Categories: [],
			CategoryLabels: [],
			Date: "2026-06-03",
			DetailsUrl: "https://rutracker.org/forum/viewtopic.php?t=6306464",
			DV: true,
			FHD: false,
			HDR: true,
			HDR10: false,
			HDR10plus: true,
			Hash: "61065EA115B7CC3E8DB9FB5AB1F6F327F08BD1C9",
			K4: true,
			Leeches: 27,
			Magnet:
				"magnet:?xt=urn:btih:61065ea115b7cc3e8db9fb5ab1f6f327f08bd1c9",
			Name: "Матрица / The Matrix [1999, WEB-DL 2160p, HDR10+, Dolby Vision]",
			OriginalName: "The Matrix",
			Peers: 27,
			Quality: 2160,
			QualityLabel: "4K",
			RussianName: "Матрица",
			Seeds: 449,
			Seasons: [],
			Size: 2,
			SizeName: "2.00 GB",
			Tracker: "rutracker",
			UpdatedDate: undefined,
			VideoType: "hdr",
			Voices: ["Дубляж"],
			Year: "1999",
		});
	});

	it("drops missing magnets and de-duplicates by BTIH hash", () => {
		const torrents = normalizeJacRedResults(
			[
				{ id: "missing", title: "No magnet" },
				{
					magnet: "magnet:?xt=urn:btih:ABC123",
					quality: 1080,
					title: "First",
				},
				{
					magnet: "magnet:?xt=urn:btih:abc123&tr=http://tracker",
					quality: 1080,
					title: "Duplicate",
				},
			],
			{ isMovie: false, name: "Show", year: 2024 },
		);

		expect(torrents).toHaveLength(1);
		expect(torrents[0].Name).toBe("First");
		expect(torrents[0].FHD).toBe(true);
	});

	it("sends movie category and clamps JacRed limit", async () => {
		process.env.JACRED_API_BASE_URL = "https://jacred.example";
		process.env.JACRED_SEARCH_LIMIT = "200";

		const fetchMock = mock(async () =>
			createJsonResponse({
				limit: 120,
				loaded: 0,
				open: true,
				query: "Matrix",
				results: [],
				total: 0,
			}),
		);
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await getTorrents({
			isMovie: true,
			limit: 500,
			name: " Matrix ",
			year: 1999,
		});

		const firstCall = fetchMock.mock.calls[0] as unknown[] | undefined;
		if (!firstCall) {
			throw new Error("Expected JacRed fetch to be called");
		}

		const requestUrl = String(firstCall[0]);
		const url = new URL(requestUrl);
		expect(`${url.origin}${url.pathname}`).toBe(
			"https://jacred.example/api/search",
		);
		expect(url.searchParams.get("query")).toBe("Matrix");
		expect(url.searchParams.get("year")).toBe("1999");
		expect(url.searchParams.get("category")).toBe("movie");
		expect(url.searchParams.get("sort")).toBe("sid");
		expect(url.searchParams.get("limit")).toBe("120");
	});

	it("sends TV season without forcing a category", async () => {
		process.env.JACRED_API_BASE_URL = "https://jacred.example";

		const fetchMock = mock(async () =>
			createJsonResponse({
				limit: 80,
				loaded: 0,
				open: true,
				query: "Castlevania",
				results: [],
				total: 0,
			}),
		);
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await getTorrents({
			isMovie: false,
			name: "Castlevania",
			season: 2,
			year: 2018,
		});

		const firstCall = fetchMock.mock.calls[0] as unknown[] | undefined;
		if (!firstCall) {
			throw new Error("Expected JacRed fetch to be called");
		}

		const url = new URL(String(firstCall[0]));
		expect(url.searchParams.get("season")).toBe("2");
		expect(url.searchParams.get("category")).toBeNull();
	});

	it("returns cached results for repeated equivalent requests", async () => {
		const fetchMock = mock(async () =>
			createJsonResponse({
				limit: 80,
				loaded: 1,
				open: true,
				query: "Matrix",
				results: [
					{
						magnet: "magnet:?xt=urn:btih:CACHE123",
						title: "Cached",
					},
				],
				total: 1,
			}),
		);
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const first = await getTorrents({
			isMovie: true,
			name: "Matrix",
			year: 1999,
		});
		const second = await getTorrents({
			isMovie: true,
			name: " matrix ",
			year: 1999,
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(second).toEqual(first);
	});

	it("returns JacRed source counts with normalized torrents", async () => {
		const fetchMock = mock(async () =>
			createJsonResponse({
				limit: 80,
				loaded: 80,
				open: true,
				query: "Matrix",
				results: [
					{
						magnet: "magnet:?xt=urn:btih:SUMMARY123",
						title: "Summary",
					},
				],
				total: 197,
			}),
		);
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await getTorrentSearch({
			isMovie: true,
			name: "Matrix",
			year: 1999,
		});

		expect(result.total).toBe(197);
		expect(result.loaded).toBe(80);
		expect(result.torrents).toHaveLength(1);
	});

	it("returns an empty list for short queries without fetching", async () => {
		const fetchMock = mock(async () => createJsonResponse({ results: [] }));
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await getTorrents({ isMovie: true, name: "m", year: 1999 });

		expect(result).toEqual([]);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("fails closed for JacRed proof-of-work and rate-limit responses", async () => {
		const consoleErrorMock = mock(() => undefined);
		const fetchMock = mock(async () => createJsonResponse({}, 428));
		console.error = consoleErrorMock;
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await getTorrents({
			isMovie: true,
			name: "Matrix",
			year: 1999,
		});

		expect(result).toEqual([]);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(consoleErrorMock).toHaveBeenCalledTimes(1);
	});

	it("retries transient JacRed failures once", async () => {
		const consoleErrorMock = mock(() => undefined);
		const fetchMock = mock(async () => createJsonResponse({}, 503));
		console.error = consoleErrorMock;
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await getTorrents({
			isMovie: true,
			name: "Matrix",
			year: 1999,
		});

		expect(result).toEqual([]);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(consoleErrorMock).toHaveBeenCalledTimes(1);
	});

	it("retries network failures once", async () => {
		const consoleErrorMock = mock(() => undefined);
		const fetchMock = mock(async () => {
			throw new Error("socket closed");
		});
		console.error = consoleErrorMock;
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await getTorrents({
			isMovie: true,
			name: "Matrix",
			year: 1999,
		});

		expect(result).toEqual([]);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(consoleErrorMock).toHaveBeenCalledTimes(1);
	});
});
