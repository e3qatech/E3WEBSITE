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

export async function fetchRawWeatherFromProvider(
  lat: number,
  lng: number,
  timeoutMs: number = 4000
): Promise<RawWeatherData | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,is_day,precipitation,rain,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=Asia%2FRiyadh`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
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
