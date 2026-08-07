if (typeof window !== 'undefined') {
  throw new Error('Server-only module execution error');
}
import { fetchRawWeatherFromProvider } from "./provider";
import { normalizeRawWeather, NormalizedWeatherData, DEFAULT_NORMALIZED_WEATHER } from "./normalize";
import { getCachedWeather, setCachedWeather } from "./cache";

const DOHA_LAT = 25.2854;
const DOHA_LNG = 51.5310;

export async function resolveWeatherForGateway(): Promise<NormalizedWeatherData> {
  // 1. Check fresh cache
  const cached = await getCachedWeather();
  if (cached.data && !cached.isStale) {
    return cached.data;
  }

  // 2. Fetch fresh provider data
  const raw = await fetchRawWeatherFromProvider(DOHA_LAT, DOHA_LNG, 3500);
  if (raw && raw.current) {
    const normalized = normalizeRawWeather(raw);
    await setCachedWeather(normalized);
    return normalized;
  }

  // 3. Use stale cached data if available
  if (cached.data) {
    return cached.data;
  }

  // 4. Default fallback
  return DEFAULT_NORMALIZED_WEATHER;
}
