import { describe, expect, it } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("search route form fallback", () => {
  it("uses the same query parameter for the input name and URL restoration", async () => {
    const routeFile = join(import.meta.dir, "index.tsx");
    const source = await readFile(routeFile, "utf8");

    expect(source).toContain('searchParams.get("q")');
    expect(source).toContain('name="q"');
    expect(source).toContain('name="lang"');
    expect(source).toContain('method="get"');
  });

  it("submits with plain GET navigation instead of client event handlers", async () => {
    const routeFile = join(import.meta.dir, "index.tsx");
    const source = await readFile(routeFile, "utf8");

    expect(source).not.toContain("onSubmit$={");
    expect(source).not.toContain("onInput$={");
  });

  it("tracks recent searches from a browser-guarded task", async () => {
    const routeFile = join(import.meta.dir, "index.tsx");
    const source = await readFile(routeFile, "utf8");

    expect(source).toContain("useTask$(() =>");
    expect(source).toContain("if (!isBrowser)");
    expect(source).toContain("pushRecentSearch({");
  });
});
