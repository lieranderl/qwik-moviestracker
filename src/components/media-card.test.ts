import { describe, expect, it } from "bun:test";
import {
  getCardWidthClass,
  getDefaultMediaCardLoading,
  getMediaCardImageWidth,
  getPlaceholderLabel,
  getSafeRating,
} from "./media-card";

describe("media card helpers", () => {
  it("uses full-width sizing for grid layouts", () => {
    expect(
      getCardWidthClass({
        layout: "grid",
        variant: "poster",
      }),
    ).toBe("w-full");
  });

  it("keeps carousel sizing aligned to the media variant", () => {
    expect(
      getCardWidthClass({
        layout: "carousel",
        variant: "landscape",
      }),
    ).toContain("w-[16rem]");
    expect(
      getCardWidthClass({
        layout: "carousel",
        variant: "person",
      }),
    ).toContain("w-[7.25rem]");
  });

  it("normalizes image width defaults without overriding explicit widths", () => {
    expect(
      getMediaCardImageWidth({
        layout: "grid",
        variant: "poster",
      }),
    ).toBe(300);
    expect(
      getMediaCardImageWidth({
        layout: "carousel",
        variant: "landscape",
      }),
    ).toBe(500);
    expect(
      getMediaCardImageWidth({
        layout: "grid",
        variant: "poster",
        width: 780,
      }),
    ).toBe(780);
  });

  it("builds stable placeholder labels from the title", () => {
    expect(getPlaceholderLabel("Arrival")).toBe("AR");
    expect(getPlaceholderLabel("The Matrix")).toBe("TM");
    expect(getPlaceholderLabel("")).toBe("NA");
  });

  it("omits empty and zero ratings from card metadata", () => {
    expect(getSafeRating(7.8)).toBe(7.8);
    expect(getSafeRating("8.1")).toBe(8.1);
    expect(getSafeRating(0)).toBeNull();
    expect(getSafeRating("0")).toBeNull();
    expect(getSafeRating(null)).toBeNull();
    expect(getSafeRating("nope")).toBeNull();
  });

  it("defaults image loading to lazy", () => {
    expect(getDefaultMediaCardLoading()).toBe("lazy");
    expect(getDefaultMediaCardLoading("eager")).toBe("eager");
  });
});
