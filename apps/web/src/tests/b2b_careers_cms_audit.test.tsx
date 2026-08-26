import React from "react";
import { describe, it, expect } from "vitest";
import { getMergedCMSPageContent, DEFAULT_B2B_CAREERS_CONTENT } from "@/lib/cms-default-pages";

describe("B2B Careers CMS & Data Path Audit Suite", () => {
  it("1. getMergedCMSPageContent('b2b-careers') returns complete canonical schema", () => {
    const merged = getMergedCMSPageContent("b2b-careers", null);

    expect(merged).toBeDefined();
    expect(merged.hero.titleEn).toBe(DEFAULT_B2B_CAREERS_CONTENT.hero.titleEn);
    expect(merged.hero.titleAr).toBe(DEFAULT_B2B_CAREERS_CONTENT.hero.titleAr);
    expect(merged.activeJobs.titleEn).toBe(DEFAULT_B2B_CAREERS_CONTENT.activeJobs.titleEn);
    expect(merged.generalApplication.enabled).toBe(true);
    expect(merged.portalBanner.enabled).toBe(true);
    expect(merged.lifeAtE3.items.length).toBeGreaterThanOrEqual(4);
    expect(merged.hiringJourney.steps.length).toBeGreaterThanOrEqual(4);
    expect(merged.enquiries.enabled).toBe(true);
  });

  it("2. Deep merges partial admin custom content without dropping defaults", () => {
    const customPayload = {
      hero: {
        titleEn: "Pioneer Live Entertainment With E3",
      },
      generalApplication: {
        titleEn: "Join the VIP Talent Registry",
      },
      lifeAtE3: {
        items: [
          {
            id: "custom_item",
            titleEn: "Custom Engineering Pods",
            titleAr: "فرق هندسية متخصصة",
            categoryEn: "Hardware",
            categoryAr: "العتاد",
            descriptionEn: "High-spec laser and kinetics.",
            descriptionAr: "ليزر وأنظمة حركية فائقة.",
            icon: "cpu",
          },
        ],
      },
    };

    const merged = getMergedCMSPageContent("b2b-careers", customPayload);

    // Overridden fields
    expect(merged.hero.titleEn).toBe("Pioneer Live Entertainment With E3");
    expect(merged.generalApplication.titleEn).toBe("Join the VIP Talent Registry");
    expect(merged.lifeAtE3.items).toHaveLength(1);
    expect(merged.lifeAtE3.items[0].titleEn).toBe("Custom Engineering Pods");

    // Preserved default fields
    expect(merged.hero.titleAr).toBe(DEFAULT_B2B_CAREERS_CONTENT.hero.titleAr);
    expect(merged.hiringJourney.steps).toHaveLength(4);
    expect(merged.portalBanner.titleEn).toBe(DEFAULT_B2B_CAREERS_CONTENT.portalBanner.titleEn);
  });
});
