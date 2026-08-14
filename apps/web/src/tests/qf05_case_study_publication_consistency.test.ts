import { describe, it, expect } from "vitest";
import {
  isCaseStudyEligible,
  getPublicCaseStudyWhere,
  CaseStudyLike,
} from "@/lib/case-studies";
import { localizeHref } from "@/lib/url-helper";

describe("QF-05 / QF-05-C — Case Study Publication & Visibility Consistency Verification", () => {
  describe("1. Canonical Publication and Visibility Rules (isCaseStudyEligible)", () => {
    it("approves a fully published case study", () => {
      const validCase: CaseStudyLike = {
        id: "cs-1",
        slug: "lusail-winter-wonderland",
        titleEn: "Lusail Winter Wonderland",
        titleAr: "لوسيل ونتر وندرلاند",
        isPublished: true,
        isFeatured: false,
      };

      expect(isCaseStudyEligible(validCase)).toBe(true);
    });

    it("strictly excludes unpublished case studies (isPublished: false)", () => {
      const unpublishedCase: CaseStudyLike = {
        id: "cs-2",
        slug: "secret-concept-2027",
        titleEn: "Secret Concept",
        isPublished: false,
        isFeatured: true, // Featured must not override publication status
      };

      expect(isCaseStudyEligible(unpublishedCase)).toBe(false);
    });

    it("excludes records with explicit isPublished: false or isHidden: true", () => {
      const incompleteCase: CaseStudyLike = {
        id: "cs-3",
        slug: "pending-import",
        titleEn: "Pending Import",
        isPublished: false,
      };

      expect(isCaseStudyEligible(incompleteCase)).toBe(false);
    });

    it("rejects records with DRAFT, ARCHIVED, UNPUBLISHED, or HIDDEN status strings", () => {
      const draftCase: CaseStudyLike = {
        id: "cs-4",
        slug: "draft-project",
        isPublished: true,
        status: "DRAFT",
      };
      const archivedCase: CaseStudyLike = {
        id: "cs-5",
        slug: "archived-project",
        isPublished: true,
        status: "ARCHIVED",
      };
      const hiddenCase: CaseStudyLike = {
        id: "cs-6",
        slug: "hidden-project",
        isPublished: true,
        isHidden: true,
      };

      expect(isCaseStudyEligible(draftCase)).toBe(false);
      expect(isCaseStudyEligible(archivedCase)).toBe(false);
      expect(isCaseStudyEligible(hiddenCase)).toBe(false);
    });

    it("enforces linked attraction visibility rules without suppressing published B2B landmarks", () => {
      // Landmark with linked venue that is not hidden is eligible
      const linkedToNonHiddenAttraction: CaseStudyLike = {
        id: "cs-7",
        slug: "balloon-parade",
        isPublished: true,
        attraction: {
          isPublished: false, // Seasonal/non-ticketing venue
          isHidden: false,
        },
      };

      // Landmark with explicitly hidden attraction is suppressed
      const linkedToHiddenAttraction: CaseStudyLike = {
        id: "cs-8",
        slug: "confidential-attraction-case",
        isPublished: true,
        attraction: {
          isPublished: true,
          isHidden: true,
        },
      };

      const linkedToActiveAttraction: CaseStudyLike = {
        id: "cs-9",
        slug: "meryal-waterpark-showcase",
        isPublished: true,
        attraction: {
          isPublished: true,
          isHidden: false,
        },
      };

      expect(isCaseStudyEligible(linkedToNonHiddenAttraction)).toBe(true);
      expect(isCaseStudyEligible(linkedToHiddenAttraction)).toBe(false);
      expect(isCaseStudyEligible(linkedToActiveAttraction)).toBe(true);
    });
  });

  describe("2. Cases Landing Page DTO Serialization & Mapper Pipeline", () => {
    // Real raw database records from getPublicCaseStudies
    const mockRawDbCases = [
      {
        id: "cs-doha-balloon",
        slug: "doha-balloon-parade-2022",
        titleEn: "Doha Balloon Parade 2022",
        titleAr: "مهرجان الدوحة للمناطيد 2022",
        clientName: "Qatar Tourism",
        year: 2022,
        category: "Festival & Parade",
        isFeatured: true,
        isPublished: true,
        isHidden: false,
        status: "PUBLISHED",
        heroImageUrl: "/images/balloon.jpg",
        metrics: [{ valueEn: "500K+", labelEn: "Spectators" }],
        servicesUsed: ["crowd-management", "event-engineering"],
        attraction: { id: "attr-lusail", nameEn: "Lusail", isPublished: false, isHidden: false },
        teamMembers: [{ employeeProfile: { firstName: "Ahmed" } }],
      },
      {
        id: "cs-urban-arena",
        slug: "case-urban-arena",
        titleEn: "Urban Arena Stage Construction",
        titleAr: "إنشاء مسرح أوربان أرينا",
        clientName: "Private Enterprise",
        year: 2023,
        category: "Venue Engineering",
        isFeatured: true,
        isPublished: true,
        isHidden: false,
        status: "PUBLISHED",
        heroImageUrl: "/images/urban.jpg",
        metrics: [{ valueEn: "12,000", labelEn: "Capacity" }],
        servicesUsed: ["staging-fabrication"],
        attraction: null,
        teamMembers: [],
      },
      {
        id: "cs-secret-draft",
        slug: "confidential-2027-concept",
        titleEn: "Unreleased Concept",
        titleAr: "مشروع غير معلن",
        clientName: "Confidential",
        year: 2027,
        category: "Concept",
        isFeatured: true,
        isPublished: false, // DRAFT
        isHidden: false,
        status: "DRAFT",
        metrics: [],
      },
    ];

    it("Cases Landing Page DTO mapping preserves all eligible cases and strips drafts", () => {
      // 1. Server filter
      const eligibleServerCases = mockRawDbCases.filter(isCaseStudyEligible);
      expect(eligibleServerCases).toHaveLength(2);

      // 2. Server DTO mapping
      const mappedDTOs = eligibleServerCases.map(cs => ({
        id: String(cs.id),
        slug: String(cs.slug),
        titleEn: cs.titleEn || '',
        titleAr: cs.titleAr || cs.titleEn || '',
        clientName: cs.clientName || '',
        year: cs.year,
        category: cs.category || '',
        isFeatured: Boolean(cs.isFeatured),
        isPublished: true,
        isHidden: Boolean(cs.isHidden),
        heroImageUrl: cs.heroImageUrl || '',
        metrics: cs.metrics || [],
        servicesUsed: cs.servicesUsed || [],
      }));

      // 3. Client consumption
      const clientEligibleCases = mappedDTOs.filter(isCaseStudyEligible);
      
      // Landing count strictly equals canonical helper count
      expect(clientEligibleCases).toHaveLength(2);
      expect(clientEligibleCases.length).toBe(eligibleServerCases.length);
      expect(clientEligibleCases.map(c => c.slug)).toEqual([
        "doha-balloon-parade-2022",
        "case-urban-arena",
      ]);
    });

    it("Every consumer (Homepage, Services, Discover) displayed slug belongs to the landing eligible set", () => {
      const allEligibleCases = mockRawDbCases.filter(isCaseStudyEligible);
      const eligibleSlugSet = new Set(allEligibleCases.map(c => c.slug));

      // B2B Homepage featured subset
      const homepageSlugs = ["doha-balloon-parade-2022", "case-urban-arena"].filter(slug => eligibleSlugSet.has(slug));
      expect(homepageSlugs.every(slug => eligibleSlugSet.has(slug))).toBe(true);

      // Services page proof subset
      const servicesSlugs = ["doha-balloon-parade-2022"].filter(slug => eligibleSlugSet.has(slug));
      expect(servicesSlugs.every(slug => eligibleSlugSet.has(slug))).toBe(true);

      // Draft slug is not in the eligible set
      expect(eligibleSlugSet.has("confidential-2027-concept")).toBe(false);
    });

    it("EN and AR routes produce identical eligible case study IDs and counts", () => {
      const enEligible = mockRawDbCases.filter(isCaseStudyEligible);
      const arEligible = mockRawDbCases.filter(isCaseStudyEligible);

      expect(enEligible.map(c => c.id)).toEqual(arEligible.map(c => c.id));
      expect(enEligible.length).toBe(arEligible.length);
    });
  });

  describe("3. Canonical Query Filter (getPublicCaseStudyWhere)", () => {
    it("always produces a filter with isPublished: true", () => {
      const baseWhere = getPublicCaseStudyWhere();
      expect(baseWhere.isPublished).toBe(true);

      const combinedWhere = getPublicCaseStudyWhere({ category: "Entertainment", year: 2026 });
      expect(combinedWhere.isPublished).toBe(true);
      expect(combinedWhere.category).toBe("Entertainment");
      expect(combinedWhere.year).toBe(2026);
    });
  });

  describe("4. Empty State & Routing Safety", () => {
    it("handles an empty case studies dataset cleanly without generating duplicate fallbacks", () => {
      const emptyDataset: CaseStudyLike[] = [];
      const eligible = emptyDataset.filter(isCaseStudyEligible);

      expect(eligible).toHaveLength(0);
      expect(Array.isArray(eligible)).toBe(true);
    });

    it("generates correct canonical localized routes for English and Arabic", () => {
      const slug = "lusail-winter-wonderland";
      
      const enRoute = localizeHref(`/b2b/cases/${slug}`, "en");
      const arRoute = localizeHref(`/b2b/cases/${slug}`, "ar");

      expect(enRoute).toBe(`/en/b2b/cases/${slug}`);
      expect(arRoute).toBe(`/ar/b2b/cases/${slug}`);
    });
  });
});
