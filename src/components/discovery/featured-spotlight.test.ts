import { describe, expect, it } from "bun:test";
import {
  getAdjacentFeaturedIndex,
  getVisibleFeaturedMeta,
} from "./featured-spotlight";

describe("featured spotlight", () => {
  it("wraps featured carousel navigation in both directions", () => {
    expect(getAdjacentFeaturedIndex(3, 4, 1)).toBe(0);
    expect(getAdjacentFeaturedIndex(0, 4, -1)).toBe(3);
    expect(getAdjacentFeaturedIndex(0, 0, 1)).toBe(0);
  });

  it("removes empty and zero metadata", () => {
    expect(getVisibleFeaturedMeta(["Trending", "", "  ", "0", "2026"]))
      .toEqual(["Trending", "2026"]);
  });
});
