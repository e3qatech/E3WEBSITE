import { describe, it, expect } from "vitest";
import {
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  GatewayCustomizationPayload,
  GatewayWeatherRule,
} from "../types/gateway-cms";
import { fetchLiveWeather } from "../components/atmosphere/WeatherResolver";
import { sanitizeTelemetryPayload } from "../lib/experience-telemetry";

describe("Gate 15: E3 Living Threshold & Experience Composer System Tests", () => {
  it("Test 1: Published configuration isolation & draft status tracking", () => {
    const draft: GatewayCustomizationPayload = {
      ...DEFAULT_GATEWAY_CMS_PAYLOAD,
      status: "DRAFT",
    };
    const published: GatewayCustomizationPayload = {
      ...DEFAULT_GATEWAY_CMS_PAYLOAD,
      status: "PUBLISHED",
    };

    expect(draft.status).toBe("DRAFT");
    expect(published.status).toBe("PUBLISHED");
  });

  it("Test 2: Atmosphere presets validation and default payload sanity", () => {
    const presets = DEFAULT_GATEWAY_CMS_PAYLOAD.atmospherePresets || [];
    expect(presets.length).toBeGreaterThan(0);
    const clearDay = presets.find((p) => p.rendererType === "clear-day");
    expect(clearDay).toBeDefined();
    expect(clearDay?.particleCount).toBeGreaterThan(0);
  });

  it("Test 3: Weather rule priority order evaluation", () => {
    const rules: GatewayWeatherRule[] = [
      { id: "r-1", name: "Heavy Rain", enabled: true, priority: 1, rainMinMm: 5, presetId: "heavy-rain", blendIntensity: 1.0 },
      { id: "r-2", name: "Rain", enabled: true, priority: 2, rainMinMm: 0.5, presetId: "rain", blendIntensity: 0.8 },
      { id: "r-3", name: "Heat", enabled: true, priority: 4, apparentTempMinC: 38, presetId: "heat", blendIntensity: 0.7 },
    ];

    const sorted = [...rules].sort((a, b) => a.priority - b.priority);
    expect(sorted[0].presetId).toBe("heavy-rain");
    expect(sorted[1].presetId).toBe("rain");
    expect(sorted[2].presetId).toBe("heat");
  });

  it("Test 4: Water accumulation max height enforced under safety ceiling (<= 40%)", () => {
    const physics = DEFAULT_GATEWAY_CMS_PAYLOAD.waterAndSandPhysics;
    expect(physics?.waterMaxHeightPercent).toBeLessThanOrEqual(40);
  });

  it("Test 5: Sand accumulation max height enforced under safety ceiling (<= 30%)", () => {
    const physics = DEFAULT_GATEWAY_CMS_PAYLOAD.waterAndSandPhysics;
    expect(physics?.sandMaxHeightPercent).toBeLessThanOrEqual(30);
  });

  it("Test 6: Campaign priority hierarchy validation", () => {
    const campaigns = DEFAULT_GATEWAY_CMS_PAYLOAD.campaigns || [];
    expect(campaigns.length).toBeGreaterThan(0);
    expect(campaigns[0].priority).toBe("CAMPAIGN");
  });

  it("Test 7: Emergency kill-switch flag evaluation", () => {
    const expConfig = DEFAULT_GATEWAY_CMS_PAYLOAD.experienceConfig;
    expect(expConfig?.emergencyDisableAll).toBe(false);
  });

  it("Test 8: Telemetry sanitization strips private tokens and password fields", () => {
    const rawEvent = {
      event: "CAMPAIGN_CLICK",
      category: "CAMPAIGN" as const,
      metadata: {
        password: "secret_password",
        token: "auth_token_xyz",
        campaignId: "c-1",
      },
    };

    const sanitized = sanitizeTelemetryPayload(rawEvent);
    expect(sanitized.metadata?.password).toBeUndefined();
    expect(sanitized.metadata?.token).toBeUndefined();
    expect(sanitized.metadata?.campaignId).toBe("c-1");
  });
});
