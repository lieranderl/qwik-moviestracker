import { afterEach, describe, expect, it, mock } from "bun:test";
import { MediaType } from "./models";
import { getMediaRecom, getTrendingMedia } from "./tmdb";

const originalFetch = globalThis.fetch;
const originalTmdbApiKey = process.env.TMDB_API_KEY;

const createJsonResponse = (body: unknown, status = 200) =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: async () => body,
	}) as Response;

afterEach(() => {
	globalThis.fetch = originalFetch;

	if (originalTmdbApiKey === undefined) {
		delete process.env.TMDB_API_KEY;
	} else {
		process.env.TMDB_API_KEY = originalTmdbApiKey;
	}
});

describe("tmdb service", () => {
	it("builds TMDB requests with the API key and search params", async () => {
		process.env.TMDB_API_KEY = "tmdb-test-key";

		const fetchMock = mock(async () =>
			createJsonResponse({
				page: 2,
				results: [{ id: 1, title: "Alien", year: "1979" }],
				total_pages: 10,
				total_results: 1,
			}),
		);

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await getTrendingMedia({
			page: 2,
			language: "en-US",
			type: MediaType.Movie,
			needbackdrop: false,
		});

		expect(result).toEqual([{ id: 1, title: "Alien", year: "1979" }]);

		const firstCall = fetchMock.mock.calls[0] as unknown[] | undefined;
		if (!firstCall) {
			throw new Error("Expected fetch to be called");
		}

		const requestUrl = firstCall[0];
		const url = new URL(String(requestUrl));

		expect(`${url.origin}${url.pathname}`).toBe(
			"https://api.themoviedb.org/3/trending/movie/week",
		);
		expect(url.searchParams.get("api_key")).toBe("tmdb-test-key");
		expect(url.searchParams.get("language")).toBe("en-US");
		expect(url.searchParams.get("page")).toBe("2");
	});

	it("decorates recommendation results without mutating the TMDB payload", async () => {
		process.env.TMDB_API_KEY = "tmdb-test-key";

		const tmdbPayload = {
			page: 1,
			results: [
				{ id: 10, title: "Older", release_date: "1999-10-10" },
				{ id: 20, title: "Newer", release_date: "2024-05-05" },
			],
			total_pages: 1,
			total_results: 2,
		};

		const fetchMock = mock(async (input: RequestInfo | URL) => {
			const url = new URL(String(input));

			if (url.pathname.endsWith("/movie/99/recommendations")) {
				return createJsonResponse(tmdbPayload);
			}

			if (url.pathname.endsWith("/movie/10/images")) {
				return createJsonResponse({
					id: 10,
					backdrops: [{ file_path: "/older-backdrop.jpg" }],
					logos: [],
					posters: [],
				});
			}

			if (url.pathname.endsWith("/movie/20/images")) {
				return createJsonResponse({
					id: 20,
					backdrops: [{ file_path: "/newer-backdrop.jpg" }],
					logos: [],
					posters: [],
				});
			}

			throw new Error(`Unexpected TMDB request: ${url.toString()}`);
		});

		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await getMediaRecom({
			id: 99,
			language: "en-US",
			query: "recommendations",
			type: MediaType.Movie,
		});

		expect(result).toEqual([
			{
				id: 20,
				title: "Newer",
				release_date: "2024-05-05",
				backdrop_path: "/newer-backdrop.jpg",
				media_type: MediaType.Movie,
			},
			{
				id: 10,
				title: "Older",
				release_date: "1999-10-10",
				backdrop_path: "/older-backdrop.jpg",
				media_type: MediaType.Movie,
			},
		]);

		expect(tmdbPayload.results).toEqual([
			{ id: 10, title: "Older", release_date: "1999-10-10" },
			{ id: 20, title: "Newer", release_date: "2024-05-05" },
		]);
	});
});
