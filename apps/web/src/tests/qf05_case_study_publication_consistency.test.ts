import { describe, it, expect } from "vitest";
import {
  isCaseStudyEligible,
  getPublicCaseStudyWhere,
  CaseStudyLike,
} from "@/lib/case-studies";
import { localizeHref } from "@/lib/url-helper";

describe("QF-05 — Case Study Publication & Visibility Consistency Verification", () => {
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

    it("excludes records missing isPublished flag (undefined/null)", () => {
      const incompleteCase: CaseStudyLike = {
        id: "cs-3",
        slug: "pending-import",
        titleEn: "Pending Import",
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

    it("enforces linked attraction visibility rules", () => {
      const linkedToUnpublishedAttraction: CaseStudyLike = {
        id: "cs-7",
        slug: "future-attraction-case",
        isPublished: true,
        attraction: {
          isPublished: false,
          isHidden: false,
        },
      };

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

      expect(isCaseStudyEligible(linkedToUnpublishedAttraction)).toBe(false);
      expect(isCaseStudyEligible(linkedToHiddenAttraction)).toBe(false);
      expect(isCaseStudyEligible(linkedToActiveAttraction)).toBe(true);
    });
  });

  describe("2. Canonical Query Filter (getPublicCaseStudyWhere)", () => {
    it("always produces a filter with isPublished: true", () => {
      const baseWhere = getPublicCaseStudyWhere();
      expect(baseWhere.isPublished).toBe(true);

      const combinedWhere = getPublicCaseStudyWhere({ category: "Entertainment", year: 2026 });
      expect(combinedWhere.isPublished).toBe(true);
      expect(combinedWhere.category).toBe("Entertainment");
      expect(combinedWhere.year).toBe(2026);
    });
  });

  describe("3. In-Memory Manual Selection & Featured Ordering Consistency", () => {
    const mockDataset: CaseStudyLike[] = [
      { id: "cs-101", slug: "project-alpha", isPublished: true, isFeatured: false, year: 2024 },
      { id: "cs-102", slug: "project-beta-draft", isPublished: false, isFeatured: true, year: 2026 }, // Draft!
      { id: "cs-103", slug: "project-gamma", isPublished: true, isFeatured: true, year: 2025 },
      { id: "cs-104", slug: "project-delta-hidden", isPublished: true, isHidden: true, year: 2025 }, // Hidden!
    ];

    it("filters manual CMS selected IDs to include only eligible published records", () => {
      const selectedIds = ["cs-102", "cs-103", "cs-101", "cs-104"];
      
      const eligible = mockDataset.filter(isCaseStudyEligible);
      const idMap = new Map(eligible.map(c => [c.id, c]));
      const resolved = selectedIds.map(id => idMap.get(id)).filter(Boolean);

      expect(resolved.map(r => r?.id)).toEqual(["cs-103", "cs-101"]);
      expect(resolved.some(r => r?.id === "cs-102")).toBe(false); // Draft excluded
      expect(resolved.some(r => r?.id === "cs-104")).toBe(false); // Hidden excluded
    });

    it("featured ordering prioritizes featured cases without including unpublished drafts", () => {
      const eligible = mockDataset.filter(isCaseStudyEligible);
      const sorted = [...eligible].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

      expect(sorted[0].id).toBe("cs-103");
      expect(sorted[1].id).toBe("cs-101");
      expect(sorted.length).toBe(2);
    });
  });

  describe("4. Fact Stream & Impact Metrics Exclusion Safety", () => {
    it("ensures unpublished case study metrics are never exposed in fact streams", () => {
      const caseStudiesWithMetrics: CaseStudyLike[] = [
        {
          id: "cs-pub",
          slug: "published-case",
          titleEn: "Published Mega Event",
          titleAr: "فعالية منشورة",
          isPublished: true,
          metrics: [{ valueEn: "1.2M", labelEn: "Visitors" }],
        },
        {
          id: "cs-unpub",
          slug: "unpublished-case",
          titleEn: "Unpublished Secret Event",
          titleAr: "فعالية سرية",
          isPublished: false,
          metrics: [{ valueEn: "999K", labelEn: "Secret Metric" }],
        },
      ];

      const eligible = caseStudiesWithMetrics.filter(isCaseStudyEligible);
      const extractedFacts = eligible.flatMap(cs => {
        return (cs.metrics || []).map((m: any) => ({
          caseStudySlug: cs.slug,
          val: m.valueEn,
        }));
      });

      expect(extractedFacts).toHaveLength(1);
      expect(extractedFacts[0].caseStudySlug).toBe("published-case");
      expect(extractedFacts.some(f => f.caseStudySlug === "unpublished-case")).toBe(false);
    });
  });

  describe("5. Empty State & Routing Safety", () => {
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
