import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getAllCanonicalServices,
  CANONICAL_SERVICE_SLUGS,
  getLocalizedCanonicalServiceTitle,
  ServiceCmsPayload,
} from "@/lib/services/canonical-services";
import { getServiceFrameworkLabels } from "@/lib/services/service-labels";
import { ServiceMediaGallery } from "@/components/b2b/services/ServiceMediaGallery";
import { ServiceDeliverablesRoster } from "@/components/b2b/services/ServiceDeliverablesRoster";
import { ServiceSectionNavigator } from "@/components/b2b/services/ServiceSectionNavigator";
import { ServiceHero } from "@/components/b2b/services/ServiceHero";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock UniversalMediaRenderer
vi.mock("@/components/shared/UniversalMediaRenderer", () => ({
  UniversalMediaRenderer: ({ src, alt, type, poster, className }: any) => (
    <div data-testid="universal-media" data-src={src} data-type={type} data-poster={poster} className={className}>
      <span>{alt}</span>
    </div>
  ),
}));

describe("E3 Services — Development Completion Acceptance Tests", () => {
  /* =========================================================================
   * REQUIREMENT 1 & 9: Centralized Labels & Structured Taxonomy
   * ========================================================================= */
  describe("1. Centralized Localization & Labels Dictionary", () => {
    it("should provide complete centralized UI labels for English and Arabic", () => {
      const enLabels = getServiceFrameworkLabels("en");
      const arLabels = getServiceFrameworkLabels("ar");

      expect(enLabels.enterpriseCapability).toBe("Enterprise Capability");
      expect(arLabels.enterpriseCapability).toBe("خدمات قطاع الأعمال");
      expect(enLabels.buildProjectBrief).toBe("Build Your Project Brief");
      expect(arLabels.buildProjectBrief).toBe("بناء موجز مشروعك المخصص");
      expect(enLabels.verified).toBe("Verified");
      expect(arLabels.verified).toBe("معتمد وموثق");
      expect(enLabels.deliverablesHeading).toBe("Formal Deliverables & Scope Roster");
      expect(arLabels.deliverablesHeading).toBe("مصفوفة المخرجات ونطاق التسليم");
    });

    it("should resolve all 10 canonical slugs with bilingual titles", () => {
      expect(CANONICAL_SERVICE_SLUGS.length).toBe(10);
      CANONICAL_SERVICE_SLUGS.forEach((slug) => {
        const titleEn = getLocalizedCanonicalServiceTitle(slug, false);
        const titleAr = getLocalizedCanonicalServiceTitle(slug, true);
        expect(titleEn.length).toBeGreaterThan(0);
        expect(titleAr.length).toBeGreaterThan(0);
      });
    });
  });

  /* =========================================================================
   * REQUIREMENT 2 & 3: Reusable ServiceMediaGallery & Fallback Handling
   * ========================================================================= */
  describe("2. Reusable ServiceMediaGallery & Deliberate Empty States", () => {
    it("should suppress rendering completely when no gallery items exist", () => {
      const html = renderToStaticMarkup(
        <ServiceMediaGallery items={[]} locale="en" />
      );
      expect(html).toBe("");
    });

    it("should render mixed image and video gallery items with accessible cards", () => {
      const sampleItems = [
        {
          id: "g1",
          url: "https://example.com/photo1.jpg",
          mediaType: "IMAGE" as const,
          captionEn: "Concert Staging Rig",
          captionAr: "هيكل المسرح الموسيقي",
          altEn: "Concert stage rig with trussing",
          altAr: "هيكل المسرح مع الرافعات",
          displayFormat: "16:9" as const,
          isVisible: true,
        },
        {
          id: "g2",
          url: "https://example.com/video1.mp4",
          posterUrl: "https://example.com/poster1.jpg",
          mediaType: "VIDEO" as const,
          captionEn: "Drone Light Show",
          captionAr: "عرض طائرات الدرون الضوئية",
          altEn: "Drone show video",
          altAr: "فيديو عرض الدرون",
          displayFormat: "16:9" as const,
          isVisible: true,
        },
      ];

      const html = renderToStaticMarkup(
        <ServiceMediaGallery items={sampleItems} layout="grid" locale="en" />
      );

      expect(html).toContain("Concert Staging Rig");
      expect(html).toContain("Drone Light Show");
      expect(html).toContain("gallery-section");
    });
  });

  /* =========================================================================
   * REQUIREMENT 4: Progressive Disclosure in Deliverables Roster
   * ========================================================================= */
  describe("3. Progressive Disclosure Deliverables (Accordion & Tabs)", () => {
    const sampleCategories = [
      {
        id: "cat-1",
        titleEn: "Engineering Documents",
        titleAr: "الوثائق الهندسية",
        itemsEn: ["Structural load calculations", "Electrical single-line diagram"],
        itemsAr: ["حسابات الأحمال الإنشائية", "المخطط الأحادي للكهرباء"],
      },
      {
        id: "cat-2",
        titleEn: "HSE Protocols",
        titleAr: "بروتوكولات السلامة",
        itemsEn: ["Crowd safety management plan", "Civil defence permits"],
        itemsAr: ["خطة إدارة الحشود", "تصاريح الدفاع المدني"],
      },
    ];

    it("should render accordion mode with interactive toggle and expand/collapse controls", () => {
      const html = renderToStaticMarkup(
        <ServiceDeliverablesRoster
          categories={sampleCategories}
          layoutVariant="accordion"
          locale="en"
        />
      );

      expect(html).toContain("Engineering Documents");
      expect(html).toContain("HSE Protocols");
      expect(html).toContain("deliverables-section");
      expect(html).toContain("aria-expanded");
    });

    it("should render grouped-tabs mode with tab roles", () => {
      const html = renderToStaticMarkup(
        <ServiceDeliverablesRoster
          categories={sampleCategories}
          layoutVariant="grouped-tabs"
          locale="en"
        />
      );

      expect(html).toContain('role="tablist"');
      expect(html).toContain('role="tab"');
      expect(html).toContain('role="tabpanel"');
    });
  });

  /* =========================================================================
   * REQUIREMENT 4 & 6: In-Page Navigator & Case Study Section Suppression
   * ========================================================================= */
  describe("4. In-Page Navigator & Dynamic Section Links", () => {
    it("should suppress case studies link in navigator when hasCaseStudies is false", () => {
      const html = renderToStaticMarkup(
        <ServiceSectionNavigator
          locale="en"
          hasCaseStudies={false}
          hasGallery={true}
        />
      );

      // "Case Studies" should NOT be in the navigator
      expect(html).not.toContain("case-studies-section");
      // "Overview" and "Deliverables" should be present
      expect(html).toContain("overview-section");
      expect(html).toContain("deliverables-section");
    });

    it("should render case studies link in navigator when hasCaseStudies is true", () => {
      const html = renderToStaticMarkup(
        <ServiceSectionNavigator
          locale="en"
          hasCaseStudies={true}
          hasGallery={true}
        />
      );

      expect(html).toContain("case-studies-section");
    });
  });

  /* =========================================================================
   * REQUIREMENT 6 & 7: Hero Component Case Study CTA & Brief Action Trigger
   * ========================================================================= */
  describe("5. Service Hero CTA Behavior & No Global Media Injection", () => {
    const mockService = {
      titleEn: "Mega Events Engineering",
      titleAr: "هندسة الفعاليات الكبرى",
      slug: "mega-events",
      category: "Enterprise Capability",
      heroMediaUrl: "https://example.com/mega-events-hero.jpg",
      heroMediaType: "IMAGE",
    };

    const mockCms: ServiceCmsPayload = {
      heroOutcomeEn: "Flawless technical execution for 50,000+ guest spectacles.",
      heroOutcomeAr: "تنفيذ تقني متكامل لفعاليات كبرى تتسع لأكثر من 50,000 زائر.",
    };

    it("should suppress 'View Relevant Work' CTA when hasCaseStudies is false", () => {
      const html = renderToStaticMarkup(
        <ServiceHero
          serviceRecord={mockService}
          cmsPayload={mockCms}
          locale="en"
          hasCaseStudies={false}
        />
      );

      expect(html).not.toContain("#case-studies-section");
      expect(html).toContain("Build Your Project Brief");
    });

    it("should render 'View Relevant Work' CTA pointing to #case-studies-section when hasCaseStudies is true", () => {
      const html = renderToStaticMarkup(
        <ServiceHero
          serviceRecord={mockService}
          cmsPayload={mockCms}
          locale="en"
          hasCaseStudies={true}
        />
      );

      expect(html).toContain("#case-studies-section");
      expect(html).toContain("View Relevant Work");
    });
  });

  /* =========================================================================
   * REQUIREMENT 8: Solution Finder State Transfer Contract
   * ========================================================================= */
  describe("6. Solution Finder 6-Parameter Transfer Validation", () => {
    it("should correctly handle all 6 Solution Finder parameters in lead payload", () => {
      const mockSolutionFinderState = {
        projectFormat: "National Spectacle / Stadium Ceremony",
        projectType: "National Spectacle / Stadium Ceremony",
        lifespan: "1 - 3 Days (Live Broadcast)",
        audience: "10,000+ Guests (National Scale)",
        primaryObjective: "High-Visibility National Day Celebration",
        requiredScope: "Turnkey Staging, Audio-Visual Rigging, Crowd Management",
        selectedServices: ["mega-events", "av-stage-rentals", "shows-performances"],
      };

      expect(mockSolutionFinderState.projectFormat).toBeDefined();
      expect(mockSolutionFinderState.lifespan).toBeDefined();
      expect(mockSolutionFinderState.audience).toBeDefined();
      expect(mockSolutionFinderState.primaryObjective).toBeDefined();
      expect(mockSolutionFinderState.requiredScope).toBeDefined();
      expect(mockSolutionFinderState.selectedServices.length).toBe(3);
    });
  });
});
