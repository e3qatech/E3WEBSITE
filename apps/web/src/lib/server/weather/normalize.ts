if (typeof window !== 'undefined') {
  throw new Error('Server-only module execution error');
}
import { RawWeatherData } from "./provider";

export type WeatherState =
  | "CLEAR_DAY"
  | "HEAT"
  | "RAIN"
  | "HEAVY_RAIN"
  | "DUST"
  | "WIND"
  | "FOG"
  | "NIGHT";

export interface NormalizedWeatherData {
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
  cachedAt: number;
}

export const DEFAULT_NORMALIZED_WEATHER: NormalizedWeatherData = {
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
  cachedAt: Date.now(),
};

export function normalizeRawWeather(
  raw: RawWeatherData | null,
  timestamp: number = Date.now()
): NormalizedWeatherData {
  if (!raw || !raw.current) {
    return { ...DEFAULT_NORMALIZED_WEATHER, cachedAt: timestamp };
  }

  const c = raw.current;
  const temp = c.temperature_2m ?? 32;
  const apparentTemp = c.apparent_temperature ?? 35;
  const isDay = c.is_day === 1;
  const rainVal = c.rain ?? 0;
  const windSpeed = c.wind_speed_10m ?? 15;
  const windGusts = c.wind_gusts_10m ?? 20;

  const pm10 = windGusts > 35 ? 120 : 40;
  const pm25 = windGusts > 35 ? 60 : 18;
  const isDust = pm10 > 100 || pm25 > 50 || windGusts > 38;

  let state: WeatherState = isDay ? "CLEAR_DAY" : "NIGHT";
  if (rainVal >= 5) state = "HEAVY_RAIN";
  else if (rainVal >= 0.5) state = "RAIN";
  else if (isDust) state = "DUST";
  else if (apparentTemp >= 38 && isDay) state = "HEAT";
  else if (windSpeed >= 28) state = "WIND";

  return {
    state,
    temperature: Math.round(temp),
    apparentTemperature: Math.round(apparentTemp),
    isDay,
    precipitation: c.precipitation ?? 0,
    rain: rainVal,
    cloudCover: c.cloud_cover ?? 10,
    windSpeed: Math.round(windSpeed),
    windGusts: Math.round(windGusts),
    windDirection: c.wind_direction_10m ?? 45,
    pm10,
    pm25,
    visibility: 10000,
    conditionEn: isDust
      ? "Dusty Winds & Desert Haze"
      : apparentTemp >= 38
      ? "Extreme Heat & Mirage Haze"
      : isDay
      ? "Clear Sky & Sunshine"
      : "Qatar Night Constellation Sky",
    conditionAr: isDust
      ? "رياح محملة بالأتربة والغبار"
      : apparentTemp >= 38
      ? "حرارة عالية مع سراب جوي"
      : isDay
      ? "سماء صافية وشمس أفقية"
      : "سماء قطر الليلية الصافية",
    cachedAt: timestamp,
  };
}
