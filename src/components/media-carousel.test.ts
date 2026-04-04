import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("media carousel structure", () => {
  it("uses task-based overflow sync with labeled controls", async () => {
    const source = await readFile(
      join(import.meta.dir, "media-carousel.tsx"),
      "utf8",
    );

    expect(source).toContain("useTask$");
    expect(source).not.toContain("useVisibleTask$");
    expect(source).toContain("ResizeObserver");
    expect(source).toContain("aria-labelledby={headingId}");
    expect(source).toContain("aria-controls={trackId}");
    expect(source).toContain('id={trackId}');
  });
});
