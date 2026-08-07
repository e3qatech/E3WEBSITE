if (typeof window !== 'undefined') {
  throw new Error('Server-only module execution error');
}
import { NormalizedWeatherData } from "./normalize";
import { unstable_cache } from "next/cache";

const MEMORY_CACHE: { data?: NormalizedWeatherData; cachedAt?: number } = {};
const FRESH_TTL_MS = 30 * 60 * 1000; // 30 mins
const STALE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedWeather(
  cacheKey: string = "e3_weather_key"
): Promise<{ data: NormalizedWeatherData | null; isStale: boolean }> {
  try {
    const getPersistentCache = unstable_cache(
      async () => MEMORY_CACHE.data || null,
      ["e3-weather-gateway-key"],
      { revalidate: 1800, tags: ["e3-weather"] }
    );
    const persistentData = await getPersistentCache();
    if (persistentData) {
      return { data: persistentData, isStale: false };
    }
  } catch (_e) {}

  if (MEMORY_CACHE.data && MEMORY_CACHE.cachedAt) {
    const age = Date.now() - MEMORY_CACHE.cachedAt;
    if (age <= FRESH_TTL_MS) {
      return { data: MEMORY_CACHE.data, isStale: false };
    }
    if (age <= STALE_TTL_MS) {
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
