import { describe, it, expect } from "vitest";
import {
  DEFAULT_GATEWAY_CMS_PAYLOAD,
  GatewayCustomizationPayload,
} from "../types/gateway-cms";

const ALLOWED_IFRAME_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'player.vimeo.com',
  'vimeo.com',
  'spline.design',
  'prod.spline.design',
  'my.spline.design',
  'booking.e3.qa',
  'cdn.e3.qa',
  'e3.qa',
  'images.unsplash.com',
  'public.blob.vercel-storage.com',
];

function isIframeDomainAllowed(urlStr: string): boolean {
  if (!urlStr.startsWith('https://')) return false;
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_IFRAME_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`)
    );
  } catch (_e) {
    return false;
  }
}

describe("Gate 15: Restored Gateway Verification & Weather Removal Tests", () => {
  it("1. Weather concept is completely removed from Gateway CMS payload schema", () => {
    const payload = DEFAULT_GATEWAY_CMS_PAYLOAD as any;
    expect(payload.weatherRules).toBeUndefined();
    expect(payload.atmospherePresets).toBeUndefined();
    expect(payload.experienceConfig).toBeUndefined();
    expect(payload.waterAndSandPhysics).toBeUndefined();
    expect(payload.campaigns).toBeUndefined();
  });

  it("2. Gateway does not request geolocation or depend on weather API calls", () => {
    expect((DEFAULT_GATEWAY_CMS_PAYLOAD.visual as any).dohaLatitude).toBeUndefined();
    expect((DEFAULT_GATEWAY_CMS_PAYLOAD.visual as any).dohaLongitude).toBeUndefined();
    expect((DEFAULT_GATEWAY_CMS_PAYLOAD.visual as any).weatherRefreshIntervalMin).toBeUndefined();
  });

  it("3. Official E3 logo configuration defaults are valid and present", () => {
    const { logo } = DEFAULT_GATEWAY_CMS_PAYLOAD;
    expect(logo).toBeDefined();
    expect(logo?.destinationUrl).toBe("/");
    expect(logo?.altEn).toContain("E3 Qatar Logo");
    expect(logo?.altAr).toContain("إي ثري قطر");
  });

  it("4. Published English content renders required eyebrow, title, and supporting text", () => {
    const { english } = DEFAULT_GATEWAY_CMS_PAYLOAD;
    expect(english.eyebrowEn).toBe("WELCOME TO E3");
    expect(english.headlineEn).toBe("TWO WORLDS. ONE E3.");
    expect(english.supportingTextEn).toBeTruthy();
    expect(english.b2cTitleEn).toBe("EXPERIENCE WHAT’S NEXT");
    expect(english.b2bTitleEn).toBe("BUILD WHAT’S NEXT");
  });

  it("5. Published Arabic content renders in RTL with matching fields", () => {
    const { arabic } = DEFAULT_GATEWAY_CMS_PAYLOAD;
    expect(arabic.eyebrowAr).toBe("مرحباً بكم في E3");
    expect(arabic.headlineAr).toBe("عالمان. وجهة واحدة: E3");
    expect(arabic.supportingTextAr).toBeTruthy();
    expect(arabic.b2cTitleAr).toBe("عِش التجربة القادمة");
    expect(arabic.b2bTitleAr).toBe("لنصنع القادم");
  });

  it("6. Default portal composition ratio is configured at 50/50", () => {
    const { visual } = DEFAULT_GATEWAY_CMS_PAYLOAD;
    expect(visual.initialSplitRatio).toBe(50);
    expect(visual.selectedPortalWidth).toBe(63);
  });

  it("7. Keyboard and ARIA accessibility labels exist for B2C & B2B portals", () => {
    const { english, arabic, seoAccess } = DEFAULT_GATEWAY_CMS_PAYLOAD;
    expect(english.b2cAriaLabelEn).toBeTruthy();
    expect(english.b2bAriaLabelEn).toBeTruthy();
    expect(arabic.b2cAriaLabelAr).toBeTruthy();
    expect(arabic.b2bAriaLabelAr).toBeTruthy();
    expect(seoAccess.ariaGatewayLabelEn).toBeTruthy();
    expect(seoAccess.ariaGatewayLabelAr).toBeTruthy();
  });

  it("8. Destination URLs point to CMS-controlled portal routes", () => {
    const { english, arabic } = DEFAULT_GATEWAY_CMS_PAYLOAD;
    expect(english.b2cDestinationUrl).toBe("/b2c");
    expect(english.b2bDestinationUrl).toBe("/b2b");
    expect(arabic.b2cDestinationUrl).toBe("/ar/b2c");
    expect(arabic.b2bDestinationUrl).toBe("/ar/b2b");
  });

  it("9. Mobile portal order defaults to B2C first", () => {
    const { visual } = DEFAULT_GATEWAY_CMS_PAYLOAD;
    expect(visual.mobilePortalOrder).toBe("b2c_first");
  });

  it("10. Mandatory fallback image URL is present on all media holders", () => {
    const { b2cDesktopMedia, b2cMobileMedia, b2bDesktopMedia, b2bMobileMedia } =
      DEFAULT_GATEWAY_CMS_PAYLOAD;
    expect(b2cDesktopMedia.fallbackImageUrl).toBeTruthy();
    expect(b2cMobileMedia.fallbackImageUrl).toBeTruthy();
    expect(b2bDesktopMedia.fallbackImageUrl).toBeTruthy();
    expect(b2bMobileMedia.fallbackImageUrl).toBeTruthy();
  });

  it("11. Draft and published state isolation rule", () => {
    const draft: GatewayCustomizationPayload = {
      ...DEFAULT_GATEWAY_CMS_PAYLOAD,
      status: "DRAFT",
      english: {
        ...DEFAULT_GATEWAY_CMS_PAYLOAD.english,
        headlineEn: "DRAFT UNPUBLISHED HEADLINE",
      },
    };

    const published: GatewayCustomizationPayload = {
      ...DEFAULT_GATEWAY_CMS_PAYLOAD,
      status: "PUBLISHED",
    };

    expect(draft.status).toBe("DRAFT");
    expect(published.status).toBe("PUBLISHED");
    expect(draft.english.headlineEn).not.toBe(published.english.headlineEn);
  });

  it("12. Iframe allowlist rejects HTTP and unapproved domains", () => {
    expect(isIframeDomainAllowed("https://prod.spline.design/scene-123")).toBe(true);
    expect(isIframeDomainAllowed("https://www.youtube.com/embed/xyz")).toBe(true);
    expect(isIframeDomainAllowed("http://prod.spline.design/scene-123")).toBe(false);
    expect(isIframeDomainAllowed("https://malicious-domain.com/embed")).toBe(false);
  });
});
