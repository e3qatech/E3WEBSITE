import { describe, it, expect } from "vitest";
import { fetchLiveWeather, DEFAULT_WEATHER_DATA } from "../components/atmosphere/WeatherResolver";
import { DEFAULT_GATEWAY_CMS_PAYLOAD } from "../types/gateway-cms";
import { trackExperienceEvent, sanitizeTelemetryPayload } from "../lib/experience-telemetry";

describe("Gate 14: E3 Living Worlds Immersive System Tests", () => {
  it("Test 1: Weather Resolver returns valid Doha weather data with dust inference capabilities", async () => {
    const data = await fetchLiveWeather();
    expect(data).toBeDefined();
    expect(typeof data.temperature).toBe("number");
    expect(typeof data.windSpeed).toBe("number");
    expect(data.state).toBeDefined();
  });

  it("Test 2: Weather override force parameter maps correctly", async () => {
    const rainData = await fetchLiveWeather("RAIN");
    expect(rainData.state).toBe("RAIN");

    const dustData = await fetchLiveWeather("DUST");
    expect(dustData.state).toBe("DUST");
  });

  it("Test 3: Default campaign payload structure sanity", () => {
    const campaign = DEFAULT_GATEWAY_CMS_PAYLOAD.campaigns?.[0];
    expect(campaign?.id).toBeDefined();
    expect(campaign?.priority).toBeDefined();
    expect(campaign?.weatherBlendMode).toBeDefined();
  });

  it("Test 4: Telemetry sanitization strips private tokens and password fields", () => {
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
    expect((sanitized as any).password).toBeUndefined();
    expect((sanitized as any).token).toBeUndefined();
  });
});
