/**
 * High-performance, in-memory cache with TTL and promise deduplication.
 * Optimizes server-side rendering and API response times by eliminating
 * redundant cross-network database roundtrips on high-frequency public reads.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cacheStore = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

export const memoryCache = {
  get<T>(key: string): T | null {
    const entry = cacheStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cacheStore.delete(key);
      return null;
    }
    return entry.data as T;
  },

  set<T>(key: string, data: T, ttlMs: number = 60_000): void {
    cacheStore.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  },

  async getOrSet<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // Deduplicate simultaneous requests for the exact same key
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const fresh = await fetcher();
        if (fresh !== null && fresh !== undefined) {
          this.set(key, fresh, ttlMs);
        }
        return fresh;
      } finally {
        inFlightRequests.delete(key);
      }
    })();

    inFlightRequests.set(key, promise);
    return promise;
  },

  invalidate(keyOrPrefix: string): void {
    cacheStore.forEach((_, k) => {
      if (k === keyOrPrefix || k.startsWith(keyOrPrefix)) {
        cacheStore.delete(k);
      }
    });
  },

  clear(): void {
    cacheStore.clear();
    inFlightRequests.clear();
  },
};
