import { describe, it, expect } from "vitest";
import {
  getAllCanonicalServices,
  getCanonicalService,
  resolveServiceSlug,
  CANONICAL_SERVICES
} from "@/lib/services/canonical-services";

describe("E3 Canonical Services Taxonomy & Verification Layer", () => {
  it("should have exactly 10 canonical services defined", () => {
    const services = getAllCanonicalServices();
    expect(services.length).toBe(10);
  });

  const expectedSlugs = [
    "mega-events",
    "fec-development",
    "kids-concepts",
    "experiential-activations",
    "shows-performances",
    "av-stage-rentals",
    "attraction-operations",
    "ticketing-solutions",
    "fabrication-branding",
    "feasibility-design-research"
  ];

  it("should contain all expected canonical slugs", () => {
    const slugs = CANONICAL_SERVICES.map((s) => s.slug);
    expectedSlugs.forEach((slug) => {
      expect(slugs).toContain(slug);
    });
  });

  it("should resolve legacy aliases to canonical slugs", () => {
    expect(resolveServiceSlug("family-entertainment-centers")).toBe("fec-development");
    expect(resolveServiceSlug("event-engineering")).toBe("mega-events");
    expect(resolveServiceSlug("av-rentals")).toBe("av-stage-rentals");
    expect(resolveServiceSlug("operations")).toBe("attraction-operations");
    expect(resolveServiceSlug("ticketing")).toBe("ticketing-solutions");
    expect(resolveServiceSlug("fabrication")).toBe("fabrication-branding");
    expect(resolveServiceSlug("feasibility-research")).toBe("feasibility-design-research");
  });

  it("should guarantee every service has complete bilingual metadata and WOW & HOW pairs", () => {
    CANONICAL_SERVICES.forEach((service) => {
      expect(service.titleEn.length).toBeGreaterThan(3);
      expect(service.titleAr.length).toBeGreaterThan(3);
      expect(service.heroOutcomeEn.length).toBeGreaterThan(10);
      expect(service.heroOutcomeAr.length).toBeGreaterThan(10);

      // WOW & HOW verification
      expect(service.wowHow.length).toBeGreaterThanOrEqual(1);
      service.wowHow.forEach((wh) => {
        expect(wh.wowEn.length).toBeGreaterThan(15);
        expect(wh.howEn.length).toBeGreaterThan(15);
        expect(wh.wowAr.length).toBeGreaterThan(15);
        expect(wh.howAr.length).toBeGreaterThan(15);
      });

      // Objectives & Capabilities
      expect(service.objectives.length).toBeGreaterThanOrEqual(1);
      expect(service.capabilities.length).toBeGreaterThanOrEqual(2);
      expect(service.engagementModels.length).toBeGreaterThanOrEqual(1);
      expect(service.deliverables.length).toBeGreaterThanOrEqual(1);
      expect(service.lifecycleStages.length).toBeGreaterThanOrEqual(3);
      expect(service.serviceSpecificModule).toBeDefined();
      expect(service.enterpriseReadiness.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should not contain unsupported / unverified claims in canonical copy", () => {
    const rawDataString = JSON.stringify(CANONICAL_SERVICES);
    // Ensure no unverified downtime or unauthorized claim strings exist
    expect(rawDataString).not.toContain("0.00% Live Show Redundancy Downtime");
    expect(rawDataString).not.toContain("Qatar Civil Defence Grade-A Certified");
    expect(rawDataString).not.toContain("12-Hour Rapid Mobilization Fleet");
    expect(rawDataString).not.toContain("Speak with Senior Technical Director");
  });
});
