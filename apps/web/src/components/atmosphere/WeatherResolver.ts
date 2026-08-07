export type WeatherState =
  | "CLEAR_DAY"
  | "HEAT"
  | "RAIN"
  | "HEAVY_RAIN"
  | "DUST"
  | "WIND"
  | "FOG"
  | "NIGHT";

export interface WeatherData {
  state: WeatherState;
  temperature: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  cloudCover: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  pm10: number;
  pm25: number;
  visibility: number;
  conditionEn: string;
  conditionAr: string;
  cachedAt?: number;
}

const DOHA_LAT = 25.2854;
const DOHA_LNG = 51.5310;
const CACHE_KEY = "e3_weather_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const DEFAULT_WEATHER_DATA: WeatherData = {
  state: "CLEAR_DAY",
  temperature: 32,
  apparentTemperature: 35,
  isDay: true,
  precipitation: 0,
  rain: 0,
  cloudCover: 10,
  windSpeed: 14,
  windGusts: 22,
  windDirection: 45,
  pm10: 40,
  pm25: 18,
  visibility: 10000,
  conditionEn: "Clear Sky & Moderate Warmth",
  conditionAr: "سماء صافية ودرجة حرارة معتدلة",
};

export async function fetchLiveWeather(
  overrideState?: WeatherState
): Promise<WeatherData> {
  if (overrideState) {
    return {
      ...DEFAULT_WEATHER_DATA,
      state: overrideState,
    };
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: WeatherData = JSON.parse(cached);
        if (parsed.cachedAt && Date.now() - parsed.cachedAt < CACHE_TTL_MS) {
          return parsed;
        }
      }
    } catch (_e) {}
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${DOHA_LAT}&longitude=${DOHA_LNG}&current=temperature_2m,apparent_temperature,is_day,precipitation,rain,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=Asia%2FRiyadh`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error("Weather API non-200");
    const json = await res.json();
    const current = json.current || {};

    const temp = current.temperature_2m ?? 32;
    const apparentTemp = current.apparent_temperature ?? 35;
    const isDay = current.is_day === 1;
    const rainVal = current.rain ?? 0;
    const windSpeed = current.wind_speed_10m ?? 15;
    const windGusts = current.wind_gusts_10m ?? 20;

    const pm10 = windGusts > 35 ? 120 : 45;
    const pm25 = windGusts > 35 ? 65 : 20;
    const isSandstorm = pm10 > 100 || pm25 > 50 || windGusts > 40;

    let inferredState: WeatherState = isDay ? "CLEAR_DAY" : "NIGHT";
    if (rainVal > 5) inferredState = "HEAVY_RAIN";
    else if (rainVal > 0.5) inferredState = "RAIN";
    else if (isSandstorm) inferredState = "DUST";
    else if (apparentTemp > 38 && isDay) inferredState = "HEAT";
    else if (windSpeed > 28) inferredState = "WIND";

    const resolvedData: WeatherData = {
      state: inferredState,
      temperature: Math.round(temp),
      apparentTemperature: Math.round(apparentTemp),
      isDay,
      precipitation: current.precipitation ?? 0,
      rain: rainVal,
      cloudCover: current.cloud_cover ?? 10,
      windSpeed: Math.round(windSpeed),
      windGusts: Math.round(windGusts),
      windDirection: current.wind_direction_10m ?? 45,
      pm10,
      pm25,
      visibility: 10000,
      conditionEn: isSandstorm
        ? "Dusty Winds & Desert Haze"
        : apparentTemp > 38
        ? "Extreme Heat & Mirage Haze"
        : isDay
        ? "Clear Sky & Sunshine"
        : "Qatar Night Constellation Sky",
      conditionAr: isSandstorm
        ? "رياح محملة بالأتربة والغبار"
        : apparentTemp > 38
        ? "حرارة عالية مع سراب جوي"
        : isDay
        ? "سماء صافية وشمس أفقية"
        : "سماء قطر الليلية الصافية",
      cachedAt: Date.now(),
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(resolvedData));
      } catch (_e) {}
    }

    return resolvedData;
  } catch (err) {
    console.warn("[WEATHER_RESOLVER_FALLBACK_NOTICE]", err);
    return DEFAULT_WEATHER_DATA;
  }
}
