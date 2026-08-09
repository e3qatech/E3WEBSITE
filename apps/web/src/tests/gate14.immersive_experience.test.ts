import { describe, it, expect } from "vitest";
import { DEFAULT_GATEWAY_CMS_PAYLOAD } from "../types/gateway-cms";

describe("Gate 14: Restored E3 Gateway & B2C/B2B Experience Tests", () => {
  it("1. Weather modules are completely absent from gateway CMS defaults", () => {
    const payload = DEFAULT_GATEWAY_CMS_PAYLOAD as any;
    expect(payload.experienceConfig).toBeUndefined();
    expect(payload.atmospherePresets).toBeUndefined();
    expect(payload.weatherRules).toBeUndefined();
    expect(payload.waterAndSandPhysics).toBeUndefined();
  });

  it("2. Official default English and Arabic gateway copy is correctly structured", () => {
    const { english, arabic } = DEFAULT_GATEWAY_CMS_PAYLOAD;

    expect(english.eyebrowEn).toBe("WELCOME TO E3");
    expect(english.headlineEn).toBe("TWO WORLDS. ONE E3.");
    expect(english.supportingTextEn).toContain("Whether you’re looking for your next unforgettable experience");

    expect(arabic.eyebrowAr).toBe("مرحباً بكم في E3");
    expect(arabic.headlineAr).toBe("عالمان. وجهة واحدة: E3");
    expect(arabic.supportingTextAr).toContain("سواء كنت تبحث عن تجربتك القادمة");
  });

  it("3. B2C & B2B destination URLs are properly configured in default CMS payload", () => {
    const { english, arabic } = DEFAULT_GATEWAY_CMS_PAYLOAD;

    expect(english.b2cDestinationUrl).toBe("/b2c");
    expect(english.b2bDestinationUrl).toBe("/b2b");
    expect(arabic.b2cDestinationUrl).toBe("/ar/b2c");
    expect(arabic.b2bDestinationUrl).toBe("/ar/b2b");
  });

  it("4. Mandatory fallback image URLs exist on all desktop and mobile media holders", () => {
    const { b2cDesktopMedia, b2cMobileMedia, b2bDesktopMedia, b2bMobileMedia } =
      DEFAULT_GATEWAY_CMS_PAYLOAD;

    expect(b2cDesktopMedia.fallbackImageUrl).toBeTruthy();
    expect(b2cMobileMedia.fallbackImageUrl).toBeTruthy();
    expect(b2bDesktopMedia.fallbackImageUrl).toBeTruthy();
    expect(b2bMobileMedia.fallbackImageUrl).toBeTruthy();
  });
});
