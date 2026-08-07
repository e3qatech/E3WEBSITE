if (typeof window !== 'undefined') {
  throw new Error('Server-only module execution error');
}

export interface RawWeatherData {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    is_day?: number;
    precipitation?: number;
    rain?: number;
    cloud_cover?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
  };
}

/**
 * Commercial Weather Provider Policy:
 * Enforces server-side API key protection and commercial licensing compliance.
 *
 * Environment Variable Specifications:
 * - WEATHER_PROVIDER: 'open_meteo_commercial' | 'self_hosted_open_meteo' | 'open_meteo_dev'
 * - OPEN_METEO_COMMERCIAL_API_KEY: Server-side commercial license key
 * - OPEN_METEO_COMMERCIAL_URL: Commercial API host (e.g., customer-api.open-meteo.com)
 * - OPEN_METEO_SELF_HOSTED_URL: Enterprise internal gateway host
 */
export async function fetchRawWeatherFromProvider(
  lat: number,
  lng: number,
  timeoutMs: number = 4000
): Promise<RawWeatherData | null> {
  const providerMode = process.env.WEATHER_PROVIDER || (process.env.NODE_ENV === 'production' ? 'open_meteo_commercial' : 'open_meteo_dev');
  const apiKey = process.env.OPEN_METEO_COMMERCIAL_API_KEY;

  // Commercial Licensing Policy Check in Production
  if (process.env.NODE_ENV === 'production') {
    if (providerMode === 'open_meteo_commercial' && !apiKey) {
      console.warn('[WEATHER_COMMERCIAL_POLICY_NOTICE] Missing commercial API key in production. Triggering safe fallback mode.');
      return null;
    }
    if (providerMode === 'open_meteo_dev') {
      console.warn('[WEATHER_COMMERCIAL_POLICY_NOTICE] Non-commercial provider mode blocked in production. Triggering safe fallback mode.');
      return null;
    }
  }

  let baseUrl = 'https://api.open-meteo.com/v1/forecast';
  if (providerMode === 'open_meteo_commercial') {
    baseUrl = process.env.OPEN_METEO_COMMERCIAL_URL || 'https://customer-api.open-meteo.com/v1/forecast';
  } else if (providerMode === 'self_hosted_open_meteo') {
    baseUrl = process.env.OPEN_METEO_SELF_HOSTED_URL || 'https://weather-api.e3.qa/v1/forecast';
  }

  const queryParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: 'temperature_2m,apparent_temperature,is_day,precipitation,rain,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    timezone: 'Asia/Riyadh',
  });

  if (apiKey) {
    queryParams.append('apikey', apiKey);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${baseUrl}?${queryParams.toString()}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    return json as RawWeatherData;
  } catch (_e) {
    clearTimeout(timer);
    return null;
  }
}
