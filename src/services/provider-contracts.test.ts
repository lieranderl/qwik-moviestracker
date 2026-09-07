import { describe, expect, it } from "bun:test";
import {
  parseFirestoreCursor,
  parseFirestoreMovieDocument,
  parseImdbRating,
  parseJacRedSearchResponse,
  parseTmdbCollection,
  parseTmdbCertificationList,
  parseTmdbDetail,
  parseTmdbProviderCatalog,
  parseTmdbWatchProviders,
  parseTorrServerStatus,
} from "./provider-contracts";

const expectInvalidResponse = (load: () => unknown, source: string) => {
  expect(load).toThrow();
  try {
    load();
  } catch (error) {
    expect(error).toMatchObject({
      kind: "invalid-response",
      retryable: false,
      source,
    });
  }
};

describe("provider minimum-shape contracts", () => {
  it("accepts partial TMDB media and preserves fields used by rendering", () => {
    const collection = parseTmdbCollection({
      page: 1,
      results: [{ id: 42, poster_path: "/poster.jpg", title: "Alien" }],
      total_pages: 1,
      total_results: 1,
    });

    expect(collection.results[0]).toMatchObject({
      id: 42,
      poster_path: "/poster.jpg",
      title: "Alien",
    });
    expect(
      parseTmdbDetail<{ id: number; title: string }>({
        id: 42,
        title: "Alien",
      }),
    ).toEqual({
      id: 42,
      title: "Alien",
    });
  });

  it("rejects malformed TMDB collection and detail fixtures", () => {
    expectInvalidResponse(
      () => parseTmdbCollection({ page: 1, results: "bad" }),
      "tmdb",
    );
    expectInvalidResponse(() => parseTmdbDetail({ title: "No id" }), "tmdb");
  });

  it("validates partial TMDB certification and provider catalogs", () => {
    expect(parseTmdbCertificationList({ certifications: { US: [] } })).toEqual({
      certifications: { US: [] },
    });
    expect(parseTmdbProviderCatalog({ results: [{ provider_id: 8 }] })).toEqual(
      {
        results: [{ provider_id: 8 }],
      },
    );
    expect(parseTmdbWatchProviders({ id: 1, results: {} })).toEqual({
      id: 1,
      results: {},
    });
    expectInvalidResponse(
      () => parseTmdbProviderCatalog({ results: [{ provider_id: "bad" }] }),
      "tmdb",
    );
  });

  it("accepts valid Firestore cursors and partial movie documents", () => {
    expect(
      parseFirestoreCursor({ id: "9737", timestampMillis: 1_700_000_000_000 }),
    ).toEqual({ id: "9737", timestampMillis: 1_700_000_000_000 });
    expect(
      parseFirestoreMovieDocument({ Year: "1979", title: "Alien" }),
    ).toEqual({ Year: "1979", title: "Alien" });
  });

  it("rejects malformed Firestore cursor and document fixtures", () => {
    expectInvalidResponse(
      () => parseFirestoreCursor({ id: "", timestampMillis: -1 }),
      "firestore",
    );
    expectInvalidResponse(
      () => parseFirestoreMovieDocument({ genre_ids: [1, "bad"] }),
      "firestore",
    );
  });

  it("normalizes a partial JacRed response with safe defaults", () => {
    expect(
      parseJacRedSearchResponse(
        { results: [{ magnet: "magnet:?xt=urn:btih:ABC", title: "Alien" }] },
        "Alien",
      ),
    ).toEqual({
      limit: 0,
      loaded: 0,
      open: false,
      query: "Alien",
      results: [{ magnet: "magnet:?xt=urn:btih:ABC", title: "Alien" }],
      total: 1,
    });
  });

  it("rejects malformed JacRed result fixtures", () => {
    expectInvalidResponse(
      () =>
        parseJacRedSearchResponse({ results: [{ seeders: "many" }] }, "Alien"),
      "jacred",
    );
  });

  it("accepts partial IMDb ratings and rejects malformed ratings", () => {
    expect(parseImdbRating({ Id: "tt0133093", Rating: "8.7" })).toEqual({
      Id: "tt0133093",
      Rating: "8.7",
      Votes: "",
    });
    expectInvalidResponse(
      () => parseImdbRating({ Id: "tt0133093", Rating: 8.7 }),
      "imdb",
    );
  });

  it("accepts partial TorrServer status and rejects malformed file data", () => {
    expect(
      parseTorrServerStatus({
        file_stats: [{ id: 0, length: 1_024, path: "Alien.mkv" }],
        hash: "ABC",
        name: "Alien",
      }),
    ).toEqual({
      file_stats: [{ id: 0, length: 1_024, path: "Alien.mkv" }],
      hash: "ABC",
      name: "Alien",
    });
    expect(() =>
      parseTorrServerStatus({
        file_stats: [{ id: 0, length: "large", path: "Alien.mkv" }],
      }),
    ).toThrow();
    try {
      parseTorrServerStatus({
        file_stats: [{ id: 0, length: "large", path: "Alien.mkv" }],
      });
    } catch (error) {
      expect(error).toMatchObject({ kind: "validation", retryable: false });
    }
  });
});
