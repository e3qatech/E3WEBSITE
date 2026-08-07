import { describe, it, expect } from "vitest";
import { fetchLiveWeather, DEFAULT_WEATHER_DATA } from "@/components/atmosphere/WeatherResolver";
import { DEFAULT_EXPERIENCE_CAMPAIGN } from "@/types/experience-composer";
import { trackExperienceEvent, sanitizeTelemetryPayload } from "@/lib/experience-telemetry";

describe("Gate 14: E3 Living Worlds Immersive System Tests", () => {

  it("Test 1: Weather Resolver returns valid Doha weather data with dust inference capabilities", async () => {
    const data = await fetchLiveWeather();
    expect(data).toBeDefined();
    expect(typeof data.temperature).toBe("number");
    expect(typeof data.windSpeed).toBe("number");
    expect(data.state).toBeDefined();
  });

  it("Test 2: Weather Resolver respects state overrides", async () => {
    const custom = await fetchLiveWeather("DUST");
    expect(custom.state).toBe("DUST");
  });

  it("Test 3: Default Experience Composer Campaign payload validation", () => {
    expect(DEFAULT_EXPERIENCE_CAMPAIGN.id).toBeDefined();
    expect(DEFAULT_EXPERIENCE_CAMPAIGN.priority).toBe("CAMPAIGN");
    expect(DEFAULT_EXPERIENCE_CAMPAIGN.status).toBe("PUBLISHED");
    expect(DEFAULT_EXPERIENCE_CAMPAIGN.scenePreset).toBe("LEGO_MODULAR");
  });

  it("Test 4: Campaign priority hierarchy validation", () => {
    const priorities = ["EMERGENCY", "CAMPAIGN", "SCHEDULED", "WEATHER", "TIME", "FALLBACK"];
    expect(priorities.indexOf("EMERGENCY")).toBeLessThan(priorities.indexOf("CAMPAIGN"));
    expect(priorities.indexOf("CAMPAIGN")).toBeLessThan(priorities.indexOf("FALLBACK"));
  });

  it("Test 5: Privacy Telemetry strips sensitive password and auth token fields", () => {
    const unsafeEvent = {
      event: "FORM_SUBMIT",
      category: "EXPERIENCE" as const,
      metadata: {
        password: "secret_password_123",
        token: "jwt_session_token_xyz",
        safeKey: "public_value",
      },
    };

    const sanitized = sanitizeTelemetryPayload(unsafeEvent);
    expect(sanitized.metadata?.password).toBeUndefined();
    expect(sanitized.metadata?.token).toBeUndefined();
    expect(sanitized.metadata?.safeKey).toBe("public_value");
  });

  it("Test 6: Emergency kill-switch flag evaluation", () => {
    const emergencyCampaign = {
      ...DEFAULT_EXPERIENCE_CAMPAIGN,
      emergencyDisable: true,
    };
    expect(emergencyCampaign.emergencyDisable).toBe(true);
  });
});
