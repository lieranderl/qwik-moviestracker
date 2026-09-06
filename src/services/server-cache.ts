export const DEFAULT_CACHE_MAX_ENTRIES = 500;

export const CACHE_TTL_MS = {
  tmdbFeed: 5 * 60 * 1_000,
  tmdbDetail: 5 * 60 * 1_000,
  tmdbCatalog: 60 * 60 * 1_000,
  firestoreCatalog: 60 * 1_000,
  jacred: 90 * 1_000,
} as const;

export type CacheStatus = "hit" | "miss" | "coalesced";

export interface CacheMetadata {
  status: CacheStatus;
  expiresAt: number;
}

export interface CachedValue<T> {
  value: T;
  cache: CacheMetadata;
}

interface CacheEntry<T> {
  promise: Promise<T>;
  value?: T;
  settled: boolean;
  expiresAt: number;
  lastAccess: number;
}

interface CacheOptions {
  maxEntries?: number;
  now?: () => number;
}

export class BoundedAsyncCache {
  private readonly entries = new Map<string, CacheEntry<unknown>>();
  private readonly maxEntries: number;
  private readonly now: () => number;
  private accessSequence = 0;

  constructor(options: CacheOptions = {}) {
    this.maxEntries = Math.min(
      DEFAULT_CACHE_MAX_ENTRIES,
      Math.max(1, Math.floor(options.maxEntries ?? DEFAULT_CACHE_MAX_ENTRIES)),
    );
    this.now = options.now ?? Date.now;
  }

  async getOrLoad<T>(
    key: string,
    ttlMs: number,
    loader: () => Promise<T>,
  ): Promise<CachedValue<T>> {
    const now = this.now();
    this.removeExpired(now);
    const existing = this.entries.get(key) as CacheEntry<T> | undefined;
    if (existing) {
      existing.lastAccess = ++this.accessSequence;
      if (existing.settled) {
        return {
          value: existing.value as T,
          cache: { status: "hit", expiresAt: existing.expiresAt },
        };
      }
      return {
        value: await existing.promise,
        cache: { status: "coalesced", expiresAt: existing.expiresAt },
      };
    }

    this.evictLeastRecentlyUsed();
    const ttl = Math.max(0, ttlMs);
    const promise = Promise.resolve().then(loader);
    const entry: CacheEntry<T> = {
      promise,
      settled: false,
      // An in-flight load must remain coalescible even when it takes longer
      // than the eventual value TTL. Expiration starts only after success.
      expiresAt: Number.POSITIVE_INFINITY,
      lastAccess: ++this.accessSequence,
    };
    this.entries.set(key, entry as CacheEntry<unknown>);

    try {
      const value = await promise;
      entry.value = value;
      entry.settled = true;
      entry.expiresAt = this.now() + ttl;
      return {
        value,
        cache: { status: "miss", expiresAt: entry.expiresAt },
      };
    } catch (error) {
      if (this.entries.get(key) === entry) this.entries.delete(key);
      throw error;
    }
  }

  clear(): void {
    this.entries.clear();
  }

  private removeExpired(now: number): void {
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(key);
    }
  }

  private evictLeastRecentlyUsed(): void {
    if (this.entries.size < this.maxEntries) return;
    let oldestKey: string | undefined;
    let oldestAccess = Number.POSITIVE_INFINITY;
    for (const [key, entry] of this.entries) {
      if (entry.lastAccess < oldestAccess) {
        oldestKey = key;
        oldestAccess = entry.lastAccess;
      }
    }
    if (oldestKey !== undefined) this.entries.delete(oldestKey);
  }
}
