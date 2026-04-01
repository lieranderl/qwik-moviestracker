import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createDevSession,
  DEV_SESSION_BYPASS_VALUE,
} from "~/routes/dev-session";

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

  it("allows an explicit dev-only Playwright session bypass outside production", () => {
    const session = createDevSession({
      bypassCookie: DEV_SESSION_BYPASS_VALUE,
      bypassFlag: "1",
      lang: "en-US",
      nodeEnv: "development",
      now: new Date("2026-03-31T00:00:00.000Z"),
    });

    expect(session?.user?.name).toBe("Playwright User");
    expect(session?.language).toBe("en-US");
  });
});
