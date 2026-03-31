import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("language switcher navigation", () => {
  it("uses routed navigation instead of forcing a full document reload", async () => {
    const source = await readFile(join(import.meta.dir, "lang-button.tsx"), "utf8");

    expect(source).toContain("const nextHref");
    expect(source).toContain('href={nextHref}');
    expect(source).not.toContain("window.location.href");
    expect(source).not.toContain("window.location.search");
  });
});
