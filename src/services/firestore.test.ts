import { describe, expect, it } from "bun:test";
import { Timestamp } from "@google-cloud/firestore";
import {
  decodeMovieCursor,
  encodeMovieCursor,
  mapMovieDocument,
} from "./firestore";

describe("Firestore movie pagination", () => {
  it("round-trips an opaque stable cursor", () => {
    const cursor = encodeMovieCursor({
      id: "9737",
      timestampMillis: 1_700_000_000_000,
    });

    expect(cursor).not.toContain("9737");
    expect(decodeMovieCursor(cursor)).toEqual({
      id: "9737",
      timestampMillis: 1_700_000_000_000,
    });
  });

  it("rejects malformed cursors", () => {
    expect(() => decodeMovieCursor("not-a-cursor")).toThrow(
      "Invalid movie cursor",
    );
  });

  it("maps native timestamps and the legacy Year field", () => {
    const movie = mapMovieDocument("9737", {
      id: "9737",
      title: "Bad Boys",
      Year: "1995",
      lasttimefound: Timestamp.fromMillis(1_700_000_000_000),
    });

    expect(movie.id).toBe(9737);
    expect(movie.year).toBe("1995");
    expect(movie.lasttimefound).toEqual(new Date(1_700_000_000_000));
  });
});
