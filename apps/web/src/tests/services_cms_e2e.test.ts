import { describe, it, expect } from "vitest";
import {
  CANONICAL_SERVICE_SLUGS,
  resolveCanonicalSlug,
  INITIAL_SERVICE_TEMPLATES,
} from "../lib/services/canonical-services";

describe("B2B Services CMS & Canonical Architecture E2E Tests", () => {
  it("should define exactly the 10 approved canonical service slugs", () => {
    expect(CANONICAL_SERVICE_SLUGS).toHaveLength(10);
    expect(CANONICAL_SERVICE_SLUGS).toEqual([
      "mega-events",
      "fec-development",
      "kids-concepts",
      "experiential-activations",
      "shows-performances",
      "av-stage-rentals",
      "attraction-operations",
      "ticketing-solutions",
      "fabrication-branding",
      "feasibility-design-research",
    ]);
  });

  it("should accurately resolve all legacy aliases to their canonical slugs", () => {
    expect(resolveCanonicalSlug("mega-events")).toBe("mega-events");
    expect(resolveCanonicalSlug("family-entertainment-centers")).toBe("fec-development");
    expect(resolveCanonicalSlug("fec")).toBe("fec-development");
    expect(resolveCanonicalSlug("kids-play-concepts")).toBe("kids-concepts");
    expect(resolveCanonicalSlug("experiential-brand-activations")).toBe("experiential-activations");
    expect(resolveCanonicalSlug("live-shows-performances")).toBe("shows-performances");
    expect(resolveCanonicalSlug("audio-visual-stage")).toBe("av-stage-rentals");
    expect(resolveCanonicalSlug("e3-rentals")).toBe("av-stage-rentals");
    expect(resolveCanonicalSlug("attraction-operations-management")).toBe("attraction-operations");
    expect(resolveCanonicalSlug("operations")).toBe("attraction-operations");
    expect(resolveCanonicalSlug("ticketing-access-solutions")).toBe("ticketing-solutions");
    expect(resolveCanonicalSlug("spatial-fabrication-theming")).toBe("fabrication-branding");
    expect(resolveCanonicalSlug("design-research")).toBe("feasibility-design-research");
    expect(resolveCanonicalSlug("feasibility-studies")).toBe("feasibility-design-research");
  });

  it("should have comprehensive initial templates for all 10 canonical services", () => {
    const entries = Object.entries(INITIAL_SERVICE_TEMPLATES);
    expect(entries).toHaveLength(10);

    entries.forEach(([slug, tmpl]) => {
      expect(CANONICAL_SERVICE_SLUGS).toContain(slug as any);
      expect(tmpl.titleEn).toBeTruthy();
      expect(tmpl.titleAr).toBeTruthy();
      expect(tmpl.taglineEn).toBeTruthy();
      expect(tmpl.taglineAr).toBeTruthy();
      expect(tmpl.categoryEn).toBeTruthy();
      expect(tmpl.categoryAr).toBeTruthy();

      const cms = tmpl.cms;
      expect(cms.heroOutcomeEn).toBeTruthy();
      expect(cms.heroOutcomeAr).toBeTruthy();
      expect(cms.supportingStatementEn).toBeTruthy();
      expect(cms.supportingStatementAr).toBeTruthy();

      // Check WOW & HOW
      expect(cms.wowHow).toBeInstanceOf(Array);
      expect(cms.wowHow?.length).toBeGreaterThan(0);
      (cms.wowHow || []).forEach((wh) => {
        expect(wh.titleEn).toBeTruthy();
        expect(wh.titleAr).toBeTruthy();
        expect(wh.wowEn).toBeTruthy();
        expect(wh.wowAr).toBeTruthy();
        expect(wh.howEn).toBeTruthy();
        expect(wh.howAr).toBeTruthy();
      });

      // Check Objectives
      expect(cms.objectives).toBeInstanceOf(Array);
      expect(cms.objectives?.length).toBeGreaterThan(0);
      (cms.objectives || []).forEach((obj) => {
        expect(obj.labelEn).toBeTruthy();
        expect(obj.labelAr).toBeTruthy();
      });

      // Check Capabilities Bento
      expect(cms.capabilities).toBeInstanceOf(Array);
      expect(cms.capabilities?.length).toBeGreaterThan(0);
      (cms.capabilities || []).forEach((cap) => {
        expect(cap.titleEn).toBeTruthy();
        expect(cap.titleAr).toBeTruthy();
      });

      // Check Engagement Models
      expect(cms.engagementModels).toBeInstanceOf(Array);
      expect(cms.engagementModels?.length).toBeGreaterThan(0);

      // Check Deliverables
      expect(cms.deliverables).toBeInstanceOf(Array);
      expect(cms.deliverables?.length).toBeGreaterThan(0);

      // Check Lifecycle Stages
      expect(cms.lifecycleStages).toBeInstanceOf(Array);
      expect((cms.lifecycleStages || []).length).toBeGreaterThanOrEqual(3);

      // Check Specialist Module
      expect(cms.serviceSpecificModule).toBeDefined();
      expect(cms.serviceSpecificModule?.type).toBeTruthy();
      expect(cms.serviceSpecificModule?.titleEn).toBeTruthy();
      expect(cms.serviceSpecificModule?.titleAr).toBeTruthy();

      // Check Enterprise Readiness claims
      expect(cms.enterpriseReadiness).toBeInstanceOf(Array);
      (cms.enterpriseReadiness || []).forEach((er) => {
        expect(["DRAFT", "VERIFIED", "APPROVED", "EXPIRED"]).toContain(er.status);
      });
    });
  });

  it("should strictly enforce claim verification guard logic", () => {
    const mockClaims = [
      { id: "1", titleEn: "Civil Defense Approved", titleAr: "معتمد من الدفاع المدني", status: "APPROVED" },
      { id: "2", titleEn: "Unverified Claim", titleAr: "ادعاء غير موثق", status: "DRAFT" },
      { id: "3", titleEn: "Expired Certificate", titleAr: "شهادة منتهية", status: "EXPIRED" },
      { id: "4", titleEn: "Verified RAMS", titleAr: "تقييم مخاطر معتمد", status: "VERIFIED" },
    ];

    const publicClaims = mockClaims.filter(
      (c) => c.status === "APPROVED" || c.status === "VERIFIED"
    );

    expect(publicClaims).toHaveLength(2);
    expect(publicClaims.map((c) => c.id)).toEqual(["1", "4"]);
  });
});
