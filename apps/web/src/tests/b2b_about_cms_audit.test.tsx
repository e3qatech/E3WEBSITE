import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getMergedCMSPageContent, DEFAULT_B2B_ABOUT_CONTENT } from "@/lib/cms-default-pages";
import { B2BAboutClient } from "@/components/b2b/about/B2BAboutClient";

describe("B2B About CMS & Hardcoded Content Audit Suite", () => {
  it("1. getMergedCMSPageContent('b2b-about') returns complete canonical schema", () => {
    const merged = getMergedCMSPageContent("b2b-about", null);

    expect(merged).toBeDefined();
    expect(merged.header.titleEn).toBe(DEFAULT_B2B_ABOUT_CONTENT.header.titleEn);
    expect(merged.header.titleAr).toBe(DEFAULT_B2B_ABOUT_CONTENT.header.titleAr);
    expect(merged.story.titleEn).toBe(DEFAULT_B2B_ABOUT_CONTENT.story.titleEn);
    expect(merged.stats.enabled).toBe(true);
    expect(merged.stats.items.length).toBeGreaterThanOrEqual(4);
    expect(merged.values.length).toBeGreaterThanOrEqual(3);
    expect(merged.leadership.enabled).toBe(true);
    expect(merged.cta.enabled).toBe(true);
  });

  it("2. Deep merges partial admin custom content without dropping defaults", () => {
    const customPayload = {
      header: {
        titleEn: "Custom About E3 2026",
      },
      story: {
        titleEn: "The 10-Year Journey",
      },
      stats: {
        items: [
          { id: "s1", value: "200+", labelEn: "Stadium Shows", labelAr: "عرض استاديومي" },
        ],
      },
      values: [
        {
          titleEn: "Radical Innovation",
          titleAr: "الابتكار الجذري",
          descEn: "Pushing limits of physical and digital worlds.",
          descAr: "تجاوز حدود العوالم الواقعية والرقمية.",
        },
      ],
      cta: {
        headlineEn: "Partner With Us Today",
      },
    };

    const merged = getMergedCMSPageContent("b2b-about", customPayload);

    // Overridden fields
    expect(merged.header.titleEn).toBe("Custom About E3 2026");
    expect(merged.story.titleEn).toBe("The 10-Year Journey");
    expect(merged.stats.items).toHaveLength(1);
    expect(merged.stats.items[0].value).toBe("200+");
    expect(merged.values).toHaveLength(1);
    expect(merged.values[0].titleEn).toBe("Radical Innovation");
    expect(merged.cta.headlineEn).toBe("Partner With Us Today");

    // Preserved default fields
    expect(merged.header.titleAr).toBe(DEFAULT_B2B_ABOUT_CONTENT.header.titleAr);
    expect(merged.story.titleAr).toBe(DEFAULT_B2B_ABOUT_CONTENT.story.titleAr);
    expect(merged.leadership.titleEn).toBe(DEFAULT_B2B_ABOUT_CONTENT.leadership.titleEn);
    expect(merged.cta.primaryCtaTextEn).toBe(DEFAULT_B2B_ABOUT_CONTENT.cta.primaryCtaTextEn);
  });

  it("3. B2BAboutClient renders localized English markup with all dynamic CMS elements", () => {
    const cmsData = getMergedCMSPageContent("b2b-about", {
      header: {
        titleEn: "Architects of Live Experience",
        subtitleEn: "Engineering regional mega attractions in Qatar.",
        eyebrowEn: "E3 CORPORATE PROFILE",
      },
      story: {
        titleEn: "From Doha to Global Benchmarks",
      },
      stats: {
        items: [
          { id: "stat_1", value: "150+", labelEn: "Core Specialists", labelAr: "متخصص" },
        ],
      },
      values: [
        { titleEn: "Zero Compromise", descEn: "Precision safety standards." },
      ],
      leadership: {
        titleEn: "Executive Direction",
        subtitleEn: "Pioneering entertainment leaders.",
      },
      cta: {
        headlineEn: "Start Your Entertainment Project",
        primaryCtaTextEn: "Request Executive Consultation",
      },
    });

    const mockProfiles = [
      {
        id: "emp-1",
        firstName: "Tariq",
        lastName: "Al-Mansoor",
        designation: "Managing Director",
        profileImage: "https://example.com/tariq.jpg",
      },
    ];

    const html = renderToStaticMarkup(
      <B2BAboutClient
        cmsData={cmsData}
        employeeProfiles={mockProfiles}
        locale="en"
      />
    );

    // Header copy
    expect(html).toContain("Architects of Live Experience");
    expect(html).toContain("Engineering regional mega attractions in Qatar.");
    expect(html).toContain("E3 CORPORATE PROFILE");

    // Story & Stats
    expect(html).toContain("From Doha to Global Benchmarks");
    expect(html).toContain("150+");
    expect(html).toContain("Core Specialists");

    // Values & Leadership
    expect(html).toContain("Zero Compromise");
    expect(html).toContain("Tariq Al-Mansoor");
    expect(html).toContain("Managing Director");

    // CTA
    expect(html).toContain("Start Your Entertainment Project");
    expect(html).toContain("Request Executive Consultation");
  });

  it("4. B2BAboutClient renders localized Arabic markup with RTL support", () => {
    const cmsData = getMergedCMSPageContent("b2b-about", null);

    const mockProfiles = [
      {
        id: "emp-1",
        firstName: "طارق",
        lastName: "المنصور",
        firstNameAr: "طارق",
        lastNameAr: "المنصور",
        designation: "المدير العام",
        designationAr: "المدير العام",
        profileImage: "https://example.com/tariq.jpg",
      },
    ];

    const html = renderToStaticMarkup(
      <B2BAboutClient
        cmsData={cmsData}
        employeeProfiles={mockProfiles}
        locale="ar"
      />
    );

    // RTL direction
    expect(html).toContain('dir="rtl"');

    // Arabic header copy
    expect(html).toContain(DEFAULT_B2B_ABOUT_CONTENT.header.titleAr);
    expect(html).toContain(DEFAULT_B2B_ABOUT_CONTENT.header.subtitleAr);

    // Arabic story & values
    expect(html).toContain(DEFAULT_B2B_ABOUT_CONTENT.story.titleAr);
    expect(html).toContain("الدقة الهندسية");
    expect(html).toContain("التميز التشغيلي");

    // Arabic leadership
    expect(html).toContain("طارق المنصور");
    expect(html).toContain("المدير العام");

    // Arabic CTA
    expect(html).toContain(DEFAULT_B2B_ABOUT_CONTENT.cta.headlineAr);
    expect(html).toContain(DEFAULT_B2B_ABOUT_CONTENT.cta.primaryCtaTextAr);
  });
});
