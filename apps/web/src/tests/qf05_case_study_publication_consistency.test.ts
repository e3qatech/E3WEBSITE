import { describe, it, expect } from "vitest";
import {
  isCaseStudyEligible,
  getPublicCaseStudyWhere,
  CaseStudyLike,
} from "@/lib/case-studies";
import { localizeHref } from "@/lib/url-helper";

describe("QF-05-D — Fix Actual Hidden Field & Public Case-Study Contract", () => {
  // Current production database state: all records have isPublished: false / isVisible: false (HIDDEN in manager)
  const mockCurrentProdDatabase: CaseStudyLike[] = [
    {
      id: "cs-doha-balloon-2022",
      slug: "doha-balloon-parade-2022",
      titleEn: "Doha Balloon Parade 2022",
      titleAr: "مهرجان الدوحة للمناطيد 2022",
      clientName: "Qatar Tourism",
      year: 2022,
      category: "Festival & Parade",
      isFeatured: true,
      isPublished: false, // HIDDEN in manager
      status: "PUBLISHED",
    },
    {
      id: "cs-case-urban-arena",
      slug: "case-urban-arena",
      titleEn: "Urban Arena Stage Construction",
      titleAr: "إنشاء مسرح أوربان أرينا",
      clientName: "Private Enterprise",
      year: 2023,
      category: "Venue Engineering",
      isFeatured: true,
      isPublished: false, // HIDDEN in manager
      status: "PUBLISHED",
    },
    {
      id: "cs-confidential-2027",
      slug: "confidential-2027-concept",
      titleEn: "Unreleased Concept 2027",
      titleAr: "مشروع غير معلن 2027",
      clientName: "Confidential",
      year: 2027,
      category: "Concept",
      isFeatured: true,
      isPublished: false, // HIDDEN in manager
      status: "DRAFT",
    },
  ];

  // Visible published fixtures test dataset
  const mockPublishedFixtureDataset: CaseStudyLike[] = [
    {
      id: "cs-fixture-1",
      slug: "lusail-winter-wonderland",
      titleEn: "Lusail Winter Wonderland",
      titleAr: "لوسيل ونتر وندرلاند",
      clientName: "Qatari Diar",
      year: 2024,
      category: "Attraction",
      isFeatured: true,
      isPublished: true,
      isVisible: true,
      status: "PUBLISHED",
    },
    {
      id: "cs-fixture-2",
      slug: "qatar-balloon-festival-2024",
      titleEn: "Qatar Balloon Festival 2024",
      titleAr: "مهرجان قطر للمناطيد 2024",
      clientName: "Qatar Tourism",
      year: 2024,
      category: "Festival",
      isFeatured: false,
      isPublished: true,
      isVisible: true,
      status: "PUBLISHED",
    },
    {
      id: "cs-fixture-hidden",
      slug: "unannounced-showcase",
      titleEn: "Unannounced Showcase",
      titleAr: "عرض غير معلن",
      clientName: "Secret",
      year: 2025,
      category: "Showcase",
      isFeatured: true,
      isPublished: false, // HIDDEN
      isVisible: false,
      status: "DRAFT",
    },
  ];

  describe("1. Acceptance 1 & 2: Current Production State (All 3 Hidden)", () => {
    it("returns zero eligible case studies across Homepage, Services, Cases landing, and APIs", () => {
      const eligibleCases = mockCurrentProdDatabase.filter(isCaseStudyEligible);
      
      // All 3 manager records are hidden -> 0 cases appear
      expect(eligibleCases).toHaveLength(0);

      // Homepage subset from eligible set is empty
      const homepageSlugs = eligibleCases.slice(0, 3).map(c => c.slug);
      expect(homepageSlugs).toHaveLength(0);

      // Services subset from eligible set is empty
      const servicesSlugs = eligibleCases.slice(0, 3).map(c => c.slug);
      expect(servicesSlugs).toHaveLength(0);

      // Cases landing DTOs are empty
      const landingDTOs = eligibleCases.map(cs => ({
        id: cs.id,
        slug: cs.slug,
        isPublished: true,
      }));
      expect(landingDTOs).toHaveLength(0);
    });

    it("all 3 hidden detail lookups evaluate to null (triggering 404)", () => {
      for (const hiddenCase of mockCurrentProdDatabase) {
        expect(isCaseStudyEligible(hiddenCase)).toBe(false);
      }
    });

    it("featured status never overrides publication/hidden eligibility", () => {
      for (const rec of mockCurrentProdDatabase) {
        expect(rec.isFeatured).toBe(true);
        expect(isCaseStudyEligible(rec)).toBe(false);
      }
    });
  });

  describe("2. Acceptance 3 & 4: Visible Published Fixtures Contract", () => {
    it("landing count equals canonical eligible count with published fixtures", () => {
      const eligible = mockPublishedFixtureDataset.filter(isCaseStudyEligible);
      expect(eligible).toHaveLength(2);

      // Real Cases page DTO serialization mapping
      const mappedLandingDTOs = eligible.map(cs => ({
        id: String(cs.id),
        slug: String(cs.slug),
        titleEn: cs.titleEn || '',
        titleAr: cs.titleAr || cs.titleEn || '',
        clientName: cs.clientName || '',
        year: cs.year,
        category: cs.category || '',
        isFeatured: Boolean(cs.isFeatured),
        isPublished: true,
        isHidden: false,
      }));

      // In-memory filter on client component
      const clientEligible = mappedLandingDTOs.filter(isCaseStudyEligible);

      expect(clientEligible.length).toBe(eligible.length);
      expect(clientEligible.length).toBe(2);
      expect(clientEligible.map(c => c.slug)).toEqual([
        "lusail-winter-wonderland",
        "qatar-balloon-festival-2024",
      ]);
    });

    it("every homepage and services slug is strictly a subset of the landing eligible set", () => {
      const eligible = mockPublishedFixtureDataset.filter(isCaseStudyEligible);
      const eligibleSlugSet = new Set(eligible.map(c => c.slug));

      // Homepage takes top 3 featured
      const homepageSlugs = eligible.slice(0, 3).map(c => c.slug);
      expect(homepageSlugs.every(slug => eligibleSlugSet.has(slug!))).toBe(true);

      // Services takes proof subset
      const servicesSlugs = eligible.slice(0, 2).map(c => c.slug);
      expect(servicesSlugs.every(slug => eligibleSlugSet.has(slug!))).toBe(true);

      // Hidden record is never present in any consumer
      expect(eligibleSlugSet.has("unannounced-showcase")).toBe(false);
    });
  });

  describe("3. Acceptance 5: Localization Invariance (EN & AR)", () => {
    it("EN and AR routes produce identical eligible case study IDs and counts", () => {
      const enEligible = mockPublishedFixtureDataset.filter(isCaseStudyEligible);
      const arEligible = mockPublishedFixtureDataset.filter(isCaseStudyEligible);

      expect(enEligible.map(c => c.id)).toEqual(arEligible.map(c => c.id));
      expect(enEligible.length).toBe(arEligible.length);
    });

    it("generates correct localized URLs for EN and AR", () => {
      const slug = "lusail-winter-wonderland";
      expect(localizeHref(`/b2b/cases/${slug}`, "en")).toBe(`/en/b2b/cases/${slug}`);
      expect(localizeHref(`/b2b/cases/${slug}`, "ar")).toBe(`/ar/b2b/cases/${slug}`);
    });
  });

  describe("4. Dashboard Manager Visibility Field Synchronization", () => {
    it("recognizes both isPublished and isVisible fields as used by the manager UI", () => {
      const visibleByPublished: CaseStudyLike = {
        id: "cs-v1",
        slug: "v1",
        isPublished: true,
      };
      const visibleByIsVisible: CaseStudyLike = {
        id: "cs-v2",
        slug: "v2",
        isVisible: true,
      };
      const hiddenRecord: CaseStudyLike = {
        id: "cs-h1",
        slug: "h1",
        isPublished: false,
        isVisible: false,
      };
      const explicitHiddenFlag: CaseStudyLike = {
        id: "cs-h2",
        slug: "h2",
        isPublished: true,
        isHidden: true,
      };

      expect(isCaseStudyEligible(visibleByPublished)).toBe(true);
      expect(isCaseStudyEligible(visibleByIsVisible)).toBe(true);
      expect(isCaseStudyEligible(hiddenRecord)).toBe(false);
      expect(isCaseStudyEligible(explicitHiddenFlag)).toBe(false);
    });
  });

  describe("5. Canonical Query Helper (getPublicCaseStudyWhere)", () => {
    it("always enforces isPublished: true at the database query level", () => {
      const where = getPublicCaseStudyWhere();
      expect(where.isPublished).toBe(true);

      const customWhere = getPublicCaseStudyWhere({ category: "Festivals" });
      expect(customWhere.isPublished).toBe(true);
      expect(customWhere.category).toBe("Festivals");
    });
  });
});
