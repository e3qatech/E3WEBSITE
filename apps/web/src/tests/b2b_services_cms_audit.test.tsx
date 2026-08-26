import React from "react";
import { describe, it, expect } from "vitest";
import { getMergedCMSPageContent, DEFAULT_B2B_SERVICES_CONTENT } from "@/lib/cms-default-pages";

describe("B2B Services CMS & Data Path Audit Suite", () => {
  it("1. getMergedCMSPageContent('b2b-services') returns complete canonical schema", () => {
    const merged = getMergedCMSPageContent("b2b-services", null);

    expect(merged).toBeDefined();
    expect(merged.hero.titleEn).toBe(DEFAULT_B2B_SERVICES_CONTENT.hero.titleEn);
    expect(merged.hero.titleAr).toBe(DEFAULT_B2B_SERVICES_CONTENT.hero.titleAr);
    expect(merged.capabilityCount.enabled).toBe(true);
    expect(merged.philosophy.creativeBullets.length).toBeGreaterThanOrEqual(4);
    expect(merged.philosophy.engineeringBullets.length).toBeGreaterThanOrEqual(4);
    expect(merged.navigator.cardCtaEn).toBe("Explore Capability");
    expect(merged.featuredSpotlights.spotlightCtaEn).toBe("View Service Scope");
    expect(merged.deliveryMethodology.steps.length).toBeGreaterThanOrEqual(5);
    expect(merged.cta.enabled).toBe(true);
  });

  it("2. Deep merges partial admin custom content without dropping defaults", () => {
    const customPayload = {
      hero: {
        titleEn: "Custom Mega Staging & Rigging",
      },
      philosophy: {
        titleEn: "Engineering Over Everything",
      },
      cta: {
        headlineEn: "Start Engineering Your Vision",
      },
    };

    const merged = getMergedCMSPageContent("b2b-services", customPayload);

    // Overridden fields
    expect(merged.hero.titleEn).toBe("Custom Mega Staging & Rigging");
    expect(merged.philosophy.titleEn).toBe("Engineering Over Everything");
    expect(merged.cta.headlineEn).toBe("Start Engineering Your Vision");

    // Preserved default fields
    expect(merged.hero.titleAr).toBe(DEFAULT_B2B_SERVICES_CONTENT.hero.titleAr);
    expect(merged.deliveryMethodology.steps).toHaveLength(5);
    expect(merged.navigator.cardCtaAr).toBe(DEFAULT_B2B_SERVICES_CONTENT.navigator.cardCtaAr);
  });
});
