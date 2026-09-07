import { afterEach, describe, expect, it, mock } from "bun:test";
import { MediaType } from "./models";
import type { MovieShort, TvShort } from "./models";
import {
  clearTmdbCacheForTests,
  getCollectionMovies,
  getMovieCertificationList,
  getMovieDetails,
  getMediaRecom,
  getMedias,
  getTrendingMedia,
} from "./tmdb";

const originalFetch = globalThis.fetch;
const originalTmdbApiKey = process.env.TMDB_API_KEY;

const createJsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

afterEach(() => {
  clearTmdbCacheForTests();
  globalThis.fetch = originalFetch;

  if (originalTmdbApiKey === undefined) {
    delete process.env.TMDB_API_KEY;
  } else {
    process.env.TMDB_API_KEY = originalTmdbApiKey;
  }
});

describe("tmdb service", () => {
  it("coalesces equivalent feed requests and validates the response", async () => {
    process.env.TMDB_API_KEY = "tmdb-test-key";
    let resolveResponse!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const fetchMock = mock(async () => pending);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const first = getTrendingMedia({
      page: 1,
      language: "en-US",
      type: MediaType.Movie,
    });
    const second = getTrendingMedia({
      page: 1,
      language: "en-US",
      type: MediaType.Movie,
    });
    resolveResponse(
      createJsonResponse({
        page: 1,
        results: [{ id: 1 }],
        total_pages: 1,
        total_results: 1,
      }),
    );

    expect((await first)[0]?.id).toBe(1);
    expect((await second)[0]?.id).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("caches detail and provider catalog responses independently", async () => {
    process.env.TMDB_API_KEY = "tmdb-test-key";
    const fetchMock = mock(async (input: RequestInfo | URL) => {
      const path = new URL(String(input)).pathname;
      return path.endsWith("/certification/movie/list")
        ? createJsonResponse({ certifications: {} })
        : createJsonResponse({ id: 1, title: "Alien" });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await getMovieDetails({ id: 1, language: "en-US" });
    await getMovieDetails({ id: 1, language: "en-US" });
    await getMovieCertificationList();
    await getMovieCertificationList();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects malformed TMDB feeds instead of returning empty results", async () => {
    globalThis.fetch = (async () =>
      createJsonResponse({ results: "bad" })) as unknown as typeof fetch;

    await expect(
      getTrendingMedia({
        page: 1,
        language: "en-US",
        type: MediaType.Movie,
      }),
    ).rejects.toMatchObject({ kind: "invalid-response", source: "tmdb" });
  });

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

  it("keeps trending image paths from the feed without extra requests", async () => {
    process.env.TMDB_API_KEY = "tmdb-test-key";
    const payload = {
      page: 1,
      results: [
        {
          id: 1,
          title: "Alien",
          backdrop_path: "/alien-backdrop.jpg",
          poster_path: "/alien-poster.jpg",
        },
      ],
      total_pages: 1,
      total_results: 1,
    };
    let requests = 0;
    globalThis.fetch = (async () => {
      requests += 1;
      return createJsonResponse(payload);
    }) as unknown as typeof fetch;

    const result = (await getTrendingMedia({
      page: 1,
      language: "en-US",
      type: MediaType.Movie,
    })) as MovieShort[];

    expect(requests).toBe(1);
    expect(result[0]?.backdrop_path).toBe("/alien-backdrop.jpg");
    expect(result[0]?.poster_path).toBe("/alien-poster.jpg");
  });

  it("keeps category image paths from the feed without extra requests", async () => {
    process.env.TMDB_API_KEY = "tmdb-test-key";
    const payload = {
      page: 1,
      results: [
        {
          id: 2,
          name: "Severance",
          backdrop_path: "/severance-backdrop.jpg",
          poster_path: "/severance-poster.jpg",
        },
      ],
      total_pages: 1,
      total_results: 1,
    };
    let requests = 0;
    globalThis.fetch = (async () => {
      requests += 1;
      return createJsonResponse(payload);
    }) as unknown as typeof fetch;

    const result = (await getMedias({
      page: 1,
      query: "popular",
      language: "en-US",
      type: MediaType.Tv,
    })) as TvShort[];

    expect(requests).toBe(1);
    expect(result[0]?.backdrop_path).toBe("/severance-backdrop.jpg");
    expect(result[0]?.poster_path).toBe("/severance-poster.jpg");
  });

  it("sorts recommendations while preserving feed image paths in one request", async () => {
    process.env.TMDB_API_KEY = "tmdb-test-key";

    const tmdbPayload = {
      page: 1,
      results: [
        {
          id: 10,
          title: "Older",
          release_date: "1999-10-10",
          backdrop_path: "/older-backdrop.jpg",
        },
        {
          id: 20,
          title: "Newer",
          release_date: "2024-05-05",
          backdrop_path: "/newer-backdrop.jpg",
        },
      ],
      total_pages: 1,
      total_results: 2,
    };

    const fetchMock = mock(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));

      if (url.pathname.endsWith("/movie/99/recommendations")) {
        return createJsonResponse(tmdbPayload);
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
      },
      {
        id: 10,
        title: "Older",
        release_date: "1999-10-10",
        backdrop_path: "/older-backdrop.jpg",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(tmdbPayload.results).toEqual([
      {
        id: 10,
        title: "Older",
        release_date: "1999-10-10",
        backdrop_path: "/older-backdrop.jpg",
      },
      {
        id: 20,
        title: "Newer",
        release_date: "2024-05-05",
        backdrop_path: "/newer-backdrop.jpg",
      },
    ]);
  });

  it("sorts collection movies while preserving collection image paths in one request", async () => {
    process.env.TMDB_API_KEY = "tmdb-test-key";
    const payload = {
      id: 10,
      name: "Saga",
      parts: [
        {
          id: 1,
          title: "First",
          release_date: "2000-01-01",
          backdrop_path: "/first.jpg",
        },
        {
          id: 2,
          title: "Second",
          release_date: "2010-01-01",
          backdrop_path: "/second.jpg",
        },
      ],
    };
    let requests = 0;
    globalThis.fetch = (async () => {
      requests += 1;
      return createJsonResponse(payload);
    }) as unknown as typeof fetch;

    const result = await getCollectionMovies({ id: 10, language: "en-US" });

    expect(requests).toBe(1);
    expect(result).toEqual([payload.parts[1], payload.parts[0]]);
  });
});
