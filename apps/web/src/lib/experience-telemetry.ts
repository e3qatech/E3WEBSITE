export interface TelemetryEvent {
  event: string;
  category: "NAVIGATION" | "EXPERIENCE" | "WEATHER" | "CAMPAIGN" | "PERFORMANCE";
  portal?: "b2b" | "b2c" | "gateway";
  value?: string | number;
  metadata?: Record<string, any>;
  timestamp?: number;
}

const LOCAL_STORAGE_KEY = "e3_experience_telemetry";
const MAX_LOCAL_LOGS = 100;

export function sanitizeTelemetryPayload(event: TelemetryEvent): TelemetryEvent {
  const sanitizedMetadata = event.metadata ? { ...event.metadata } : undefined;
  if (sanitizedMetadata) {
    delete sanitizedMetadata.password;
    delete sanitizedMetadata.email;
    delete sanitizedMetadata.token;
    delete sanitizedMetadata.cv;
  }

  return {
    ...event,
    metadata: sanitizedMetadata,
    timestamp: Date.now(),
  };
}

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

  // Send to backend endpoint asynchronously without blocking UI
  try {
    navigator.sendBeacon(
      "/api/telemetry/experience",
      JSON.stringify(payload)
    );
  } catch (_e) {}
}
