import { describe, it, expect } from "vitest";
import { getMergedCMSPageContent, DEFAULT_B2B_HOME_CONTENT } from "@/lib/cms-default-pages";

describe("B2B Home CMS & Data Path Audit Suite", () => {
  it("1. getMergedCMSPageContent('b2b-home') returns complete canonical schema", () => {
    const merged = getMergedCMSPageContent("b2b-home", null);

    expect(merged).toBeDefined();
    expect(merged.hero.titleEn).toBe(DEFAULT_B2B_HOME_CONTENT.hero.titleEn);
    expect(merged.hero.titleAr).toBe(DEFAULT_B2B_HOME_CONTENT.hero.titleAr);
    expect(merged.stats.length).toBeGreaterThanOrEqual(3);
    expect(merged.wowAndHow.titleEn).toBe(DEFAULT_B2B_HOME_CONTENT.wowAndHow.titleEn);
    expect(merged.capabilities.titleEn).toBe(DEFAULT_B2B_HOME_CONTENT.capabilities.titleEn);
    expect(merged.deliveryProcess.steps.length).toBeGreaterThanOrEqual(4);
  });

  it("2. Deep merges partial admin custom content without dropping defaults", () => {
    const customPayload = {
      hero: {
        titleEn: "Empowering Next-Gen Entertainment in Qatar",
      },
      stats: [
        { value: "50+", labelEn: "Stadium Productions", labelAr: "إنتاج استاديومي" },
      ],
    };

    const merged = getMergedCMSPageContent("b2b-home", customPayload);

    // Overridden fields
    expect(merged.hero.titleEn).toBe("Empowering Next-Gen Entertainment in Qatar");
    expect(merged.stats).toHaveLength(1);
    expect(merged.stats[0].value).toBe("50+");

    // Preserved default fields
    expect(merged.hero.titleAr).toBe(DEFAULT_B2B_HOME_CONTENT.hero.titleAr);
    expect(merged.wowAndHow.titleEn).toBe(DEFAULT_B2B_HOME_CONTENT.wowAndHow.titleEn);
    expect(merged.deliveryProcess.steps).toHaveLength(5);
  });
});
