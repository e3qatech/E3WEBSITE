export interface TelemetryEvent {
  eventName?: string;
  event?: string;
  category?: "NAVIGATION" | "EXPERIENCE" | "WEATHER" | "CAMPAIGN" | "PERFORMANCE";
  portal?: "b2b" | "b2c" | "gateway";
  locale?: "en" | "ar";
  theme?: "dark" | "light";
  sceneType?: string;
  campaignSlug?: string;
  capabilityTier?: string;
  reducedMotion?: boolean;
  fallbackReason?: string;
  interactionType?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

const ALLOWED_KEYS = new Set([
  "eventName",
  "event",
  "category",
  "portal",
  "locale",
  "theme",
  "sceneType",
  "campaignSlug",
  "capabilityTier",
  "reducedMotion",
  "fallbackReason",
  "interactionType",
  "timestamp",
]);

export function sanitizeTelemetryPayload(raw: TelemetryEvent): TelemetryEvent {
  const sanitized: Record<string, any> = {};

  for (const key of Object.keys(raw)) {
    if (ALLOWED_KEYS.has(key)) {
      sanitized[key] = (raw as any)[key];
    }
  }

  sanitized.timestamp = Date.now();
  return sanitized as TelemetryEvent;
}

const LOCAL_STORAGE_KEY = "e3_experience_telemetry";
const MAX_LOCAL_LOGS = 100;

export function trackExperienceEvent(event: TelemetryEvent) {
  if (typeof window === "undefined") return;

  const payload = sanitizeTelemetryPayload(event);

  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    const logs: TelemetryEvent[] = existing ? JSON.parse(existing) : [];
    logs.unshift(payload);
    if (logs.length > MAX_LOCAL_LOGS) logs.pop();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
  } catch (_e) {}

  try {
    navigator.sendBeacon("/api/telemetry/experience", JSON.stringify(payload));
  } catch (_e) {}
}
