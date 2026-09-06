import { describe, expect, it } from "bun:test";
import {
  BoundedAsyncCache,
  CACHE_TTL_MS,
  DEFAULT_CACHE_MAX_ENTRIES,
} from "./server-cache";

describe("BoundedAsyncCache", () => {
  it("reports a miss followed by a hit without loading twice", async () => {
    let loads = 0;
    const cache = new BoundedAsyncCache({ now: () => 100 });
    const load = async () => ++loads;

    const first = await cache.getOrLoad("key", 1_000, load);
    const second = await cache.getOrLoad("key", 1_000, load);

    expect(first).toEqual({
      value: 1,
      cache: { status: "miss", expiresAt: 1_100 },
    });
    expect(second).toEqual({
      value: 1,
      cache: { status: "hit", expiresAt: 1_100 },
    });
    expect(loads).toBe(1);
  });

  it("expires stale entries before loading again", async () => {
    let now = 100;
    let loads = 0;
    const cache = new BoundedAsyncCache({ now: () => now });
    await cache.getOrLoad("key", 10, async () => ++loads);
    now = 110;

    const result = await cache.getOrLoad("key", 10, async () => ++loads);

    expect(result.value).toBe(2);
    expect(result.cache.status).toBe("miss");
  });

  it("evicts the least recently used live entry", async () => {
    let loads = 0;
    const cache = new BoundedAsyncCache({ maxEntries: 2, now: () => 100 });
    const load = async () => ++loads;
    await cache.getOrLoad("a", 1_000, load);
    await cache.getOrLoad("b", 1_000, load);
    await cache.getOrLoad("a", 1_000, load);
    await cache.getOrLoad("c", 1_000, load);

    const result = await cache.getOrLoad("b", 1_000, load);

    expect(result.cache.status).toBe("miss");
    expect(loads).toBe(4);
  });

  it("coalesces concurrent loads for the same key", async () => {
    let resolveLoad!: (value: string) => void;
    let loads = 0;
    const pending = new Promise<string>((resolve) => {
      resolveLoad = resolve;
    });
    const cache = new BoundedAsyncCache();
    const load = () => {
      loads += 1;
      return pending;
    };

    const first = cache.getOrLoad("key", 1_000, load);
    const second = cache.getOrLoad("key", 1_000, load);
    resolveLoad("ready");

    expect((await first).cache.status).toBe("miss");
    expect((await second).cache.status).toBe("coalesced");
    expect(loads).toBe(1);
  });

  it("removes rejected loads so the next request can recover", async () => {
    let loads = 0;
    const cache = new BoundedAsyncCache();

    await expect(
      cache.getOrLoad("key", 1_000, async () => {
        loads += 1;
        throw new Error("failed");
      }),
    ).rejects.toThrow("failed");
    const result = await cache.getOrLoad("key", 1_000, async () => ++loads);

    expect(result.value).toBe(2);
    expect(result.cache.status).toBe("miss");
  });

  it("keeps cache instances isolated", async () => {
    let loads = 0;
    const first = new BoundedAsyncCache();
    const second = new BoundedAsyncCache();
    const load = async () => ++loads;

    await first.getOrLoad("key", 1_000, load);
    const result = await second.getOrLoad("key", 1_000, load);

    expect(result.value).toBe(2);
    expect(result.cache.status).toBe("miss");
  });

  it("defaults to 500 entries and exposes provider TTL policy", () => {
    expect(DEFAULT_CACHE_MAX_ENTRIES).toBe(500);
    expect(CACHE_TTL_MS).toEqual({
      firestoreCatalog: 60_000,
      jacred: 90_000,
      tmdbCatalog: 3_600_000,
      tmdbDetail: 300_000,
      tmdbFeed: 300_000,
    });
  });
});
