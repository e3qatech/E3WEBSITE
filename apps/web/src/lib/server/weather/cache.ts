if (typeof window !== 'undefined') {
  throw new Error('Server-only module execution error');
}
import { NormalizedWeatherData } from "./normalize";
import { unstable_cache } from "next/cache";

const MEMORY_CACHE: { data?: NormalizedWeatherData; cachedAt?: number } = {};
const DEFAULT_FRESH_TTL_MS = 30 * 60 * 1000; // 30 mins default fallback
const DEFAULT_STALE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours default fallback

/**
 * Shared Weather Cache Architecture & Effective CMS TTL Policy:
 *
 * 1. CMS-Managed Effective TTL Resolution:
 *    - The fresh cache TTL is dynamically governed by published CMS configuration (`experienceConfig.cacheTtlMin`).
 *    - revalidate window in Data Cache acts as the upper physical bound (1800s / 30m).
 *
 * 2. Next.js 16 Migration Plan:
 *    - When upgrading to Next.js 16+, `unstable_cache` will be replaced with the native `'use cache'` directive
 *      and `cacheTag('e3-weather')` / `cacheLife('minutes')`.
 *
 * 3. Multi-Region Serverless Support:
 *    - Distributed Next.js Data Cache handles revalidation across worker instances on Vercel.
 */
export async function getCachedWeather(
  cacheKey: string = "e3_weather_key",
  cmsFreshTtlMin?: number,
  cmsStaleTtlHours?: number
): Promise<{ data: NormalizedWeatherData | null; isStale: boolean }> {
  const freshTtlMs = (cmsFreshTtlMin || 30) * 60 * 1000;
  const staleTtlMs = (cmsStaleTtlHours || 24) * 60 * 60 * 1000;

  try {
    const getPersistentCache = unstable_cache(
      async () => MEMORY_CACHE.data || null,
      ["e3-weather-gateway-key"],
      { revalidate: Math.min(Math.floor(freshTtlMs / 1000), 1800), tags: ["e3-weather"] }
    );
    const persistentData = await getPersistentCache();
    if (persistentData && persistentData.cachedAt) {
      const age = Date.now() - persistentData.cachedAt;
      if (age <= freshTtlMs) {
        return { data: persistentData, isStale: false };
      }
      if (age <= staleTtlMs) {
        return { data: persistentData, isStale: true };
      }
    }
  } catch (_e) {}

  if (MEMORY_CACHE.data && MEMORY_CACHE.cachedAt) {
    const age = Date.now() - MEMORY_CACHE.cachedAt;
    if (age <= freshTtlMs) {
      return { data: MEMORY_CACHE.data, isStale: false };
    }
    if (age <= staleTtlMs) {
      return { data: MEMORY_CACHE.data, isStale: true };
    }
  }
  return { data: null, isStale: true };
}

export async function setCachedWeather(
  data: NormalizedWeatherData,
  cacheKey: string = "e3_weather_key"
): Promise<void> {
  MEMORY_CACHE.data = data;
  MEMORY_CACHE.cachedAt = Date.now();
}
