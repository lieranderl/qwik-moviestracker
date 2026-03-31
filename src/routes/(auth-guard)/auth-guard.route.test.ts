import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("auth guard redirect behavior", () => {
  it("preserves the lang query parameter when redirecting unauthenticated users", async () => {
    const routeFile = join(import.meta.dir, "layout.tsx");
    const source = await readFile(routeFile, "utf8");

    expect(source).toContain('event.url.searchParams.get("lang")');
    expect(source).toContain("`/auth/?lang=${encodeURIComponent(lang)}`");
    expect(source).toContain("event.redirect(302, authPath)");
  });

  it("does not serialize server secrets through route loader state", async () => {
    const routeFile = join(import.meta.dir, "layout.tsx");
    const source = await readFile(routeFile, "utf8");

    expect(source).not.toContain("export const useEnv");
    expect(source).not.toContain("envMongoUrl");
  });
});
