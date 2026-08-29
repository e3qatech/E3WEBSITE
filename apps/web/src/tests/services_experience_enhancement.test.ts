import { describe, it, expect } from "vitest";
import {
  CANONICAL_SERVICE_SLUGS,
  resolveCanonicalSlug,
  isApprovedClaim,
  ServiceCmsPayload,
  ServicePresentationOptions
} from "@/lib/services/canonical-services";

describe("E3 Canonical Ten Public Services & Governance", () => {
  const EXACT_TEN_SERVICES = [
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

  it("should contain exactly the ten approved canonical public services", () => {
    expect(CANONICAL_SERVICE_SLUGS).toHaveLength(10);
    expect([...CANONICAL_SERVICE_SLUGS].sort()).toEqual([...EXACT_TEN_SERVICES].sort());
  });

  it("should resolve legacy historical slugs to the correct canonical targets", () => {
    expect(resolveCanonicalSlug("family-entertainment-centers")).toBe("fec-development");
    expect(resolveCanonicalSlug("fec")).toBe("fec-development");
    expect(resolveCanonicalSlug("kids-play-concepts")).toBe("kids-concepts");
    expect(resolveCanonicalSlug("immersive-attractions")).toBe("kids-concepts");
    expect(resolveCanonicalSlug("event-engineering")).toBe("mega-events");
    expect(resolveCanonicalSlug("experiential-brand-activations")).toBe("experiential-activations");
    expect(resolveCanonicalSlug("brand-activation")).toBe("experiential-activations");
    expect(resolveCanonicalSlug("live-shows-performances")).toBe("shows-performances");
    expect(resolveCanonicalSlug("seasonal-campaigns")).toBe("shows-performances");
    expect(resolveCanonicalSlug("audio-visual-stage")).toBe("av-stage-rentals");
    expect(resolveCanonicalSlug("av-multimedia")).toBe("av-stage-rentals");
    expect(resolveCanonicalSlug("attraction-operations-management")).toBe("attraction-operations");
    expect(resolveCanonicalSlug("venue-management")).toBe("attraction-operations");
    expect(resolveCanonicalSlug("ticketing-access-solutions")).toBe("ticketing-solutions");
    expect(resolveCanonicalSlug("bookingqube")).toBe("ticketing-solutions");
    expect(resolveCanonicalSlug("spatial-fabrication-theming")).toBe("fabrication-branding");
    expect(resolveCanonicalSlug("custom-fabrication")).toBe("fabrication-branding");
    expect(resolveCanonicalSlug("design-research")).toBe("feasibility-design-research");
    expect(resolveCanonicalSlug("entertainment-consulting")).toBe("feasibility-design-research");
  });

  it("should return null for unknown or arbitrary slugs", () => {
    expect(resolveCanonicalSlug("unknown-random-service")).toBeNull();
    expect(resolveCanonicalSlug("")).toBeNull();
  });
});

describe("CMS-Managed Presentation & Layout Variants", () => {
  it("should validate allowed presentation options and structure", () => {
    const presentation: ServicePresentationOptions = {
      accentColor: "emerald",
      heroComposition: "fullscreen-cinematic",
      sectionSequenceTheme: "dark-dominant",
      capabilityLayout: "bento-grid",
      galleryLayout: "mosaic"
    };

    expect(presentation.accentColor).toBe("emerald");
    expect(presentation.heroComposition).toBe("fullscreen-cinematic");
    expect(presentation.capabilityLayout).toBe("bento-grid");
    expect(presentation.galleryLayout).toBe("mosaic");
  });

  it("should support section visibility suppression cleanly", () => {
    const payload: ServiceCmsPayload = {
      sectionVisibility: {
        hero: true,
        wowHow: false,
        capabilities: true,
        projectMoment: false,
        gallery: false,
        enterpriseReadiness: true
      }
    };

    expect(payload.sectionVisibility?.wowHow).toBe(false);
    expect(payload.sectionVisibility?.projectMoment).toBe(false);
    expect(payload.sectionVisibility?.gallery).toBe(false);
    expect(payload.sectionVisibility?.hero).toBe(true);
    expect(payload.sectionVisibility?.objectives).toBeUndefined();
  });
});

describe("Solution Finder Recommendation Engine", () => {
  function getRecommendedServices(finder: {
    projectType: string;
    lifespan: string;
    audience: string;
    objective: string;
    scope: string;
  }) {
    const recs = new Set<string>();

    if (finder.projectType === "mega-event") {
      recs.add("mega-events");
      recs.add("av-stage-rentals");
    } else if (finder.projectType === "fec-destination") {
      recs.add("fec-development");
      recs.add("attraction-operations");
    } else if (finder.projectType === "kids-edutainment") {
      recs.add("kids-concepts");
      recs.add("fabrication-branding");
    } else {
      recs.add("experiential-activations");
      recs.add("shows-performances");
    }

    if (finder.scope === "turnkey") {
      recs.add("feasibility-design-research");
    }
    if (finder.scope === "ticketing" || finder.objective === "revenue") {
      recs.add("ticketing-solutions");
    }
    if (finder.objective === "spectacle") {
      recs.add("shows-performances");
    }

    return Array.from(recs).slice(0, 3);
  }

  it("should recommend mega-events and staging for national festivals", () => {
    const result = getRecommendedServices({
      projectType: "mega-event",
      lifespan: "temporary",
      audience: "mass-public",
      objective: "spectacle",
      scope: "turnkey"
    });

    expect(result).toContain("mega-events");
    expect(result).toContain("av-stage-rentals");
  });

  it("should recommend FEC and Operations for permanent family destinations", () => {
    const result = getRecommendedServices({
      projectType: "fec-destination",
      lifespan: "permanent",
      audience: "families",
      objective: "revenue",
      scope: "turnkey"
    });

    expect(result).toContain("fec-development");
    expect(result).toContain("attraction-operations");
  });
});

describe("Claim Evidence Governance & Privacy Safeguards", () => {
  it("should strictly require APPROVED status and evidence string for public rendering", () => {
    const validClaim = {
      id: "c-1",
      titleEn: "Certified Rigging Compliance",
      titleAr: "مطابقة السلامة والتركيب",
      status: "APPROVED",
      evidence: "E3 Internal HSE Audit 2026",
      isPublicEvidence: false
    };

    const draftClaim = {
      id: "c-2",
      titleEn: "Draft Metric",
      titleAr: "مقياس مسودة",
      status: "DRAFT",
      evidence: "Internal Notes",
      isPublicEvidence: false
    };

    const emptyEvidenceClaim = {
      id: "c-3",
      titleEn: "Unverified Claim",
      titleAr: "ادعاء غير موثق",
      status: "APPROVED",
      evidence: "",
      isPublicEvidence: false
    };

    expect(isApprovedClaim(validClaim)).toBe(true);
    expect(isApprovedClaim(draftClaim)).toBe(false);
    expect(isApprovedClaim(emptyEvidenceClaim)).toBe(false);
  });

  it("should reject expired claims", () => {
    const expiredClaim = {
      id: "c-4",
      titleEn: "Expired ISO Certification",
      titleAr: "شهادة منتهية الصلاحية",
      status: "APPROVED",
      evidence: "ISO-9001-2020.pdf",
      expiryDate: "2022-01-01T00:00:00Z"
    };

    expect(isApprovedClaim(expiredClaim)).toBe(false);
  });
});
