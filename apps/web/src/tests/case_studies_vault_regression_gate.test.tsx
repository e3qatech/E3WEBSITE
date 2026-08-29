import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  adaptDbCaseStudyToPresentation,
  VerifiedCaseStudyMetric,
} from "@/lib/case-studies/case-adapters";
import { isCaseStudyEligible } from "@/lib/case-studies";
import { CASE_STUDY_LABELS } from "@/lib/case-studies/case-labels";
import { CaseScopeTimeline } from "@/components/b2b/cases/CaseScopeTimeline";
import { CaseBeforeAfterSlider } from "@/components/b2b/cases/CaseBeforeAfterSlider";
import { CaseRelatedServices } from "@/components/b2b/cases/CaseRelatedServices";
import { ImpactMetricsGrid } from "@/components/b2b/cases/ImpactMetricsGrid";
import { CaseGalleryJourney } from "@/components/b2b/cases/CaseGalleryJourney";
import { CaseTestimonialsSection } from "@/components/b2b/cases/CaseTestimonialsSection";
import { getAllCanonicalServices } from "@/lib/services/canonical-services";

describe("Case Studies Vault — Full Regression Gate & Preservation Suite", () => {
  describe("1. Typed Compatibility Adapters & Section Suppression", () => {
    it("adapts a full database case study record into a valid presentation model", () => {
      const dbCase = {
        id: "cs-123",
        slug: "doha-balloon-parade-2022",
        titleEn: "Doha Balloon Parade 2022",
        titleAr: "مهرجان الدوحة للمناطيد ٢٠٢٢",
        clientName: "Qatar Tourism",
        year: 2022,
        category: "Mega Event",
        isFeatured: true,
        isPublished: true,
        heroImageUrl: "https://eeeqa.com/hero.jpg",
        heroMediaType: "IMAGE",
        thumbnailUrl: "https://eeeqa.com/thumb.jpg",
        thumbnailMediaType: "IMAGE",
        challengeEn: "Design and execute Qatar's first giant balloon parade.",
        challengeAr: "تصميم وتنفيذ أول مهرجان مناطيد عملاقة في قطر.",
        solutionEn: "Fabricated 30 giant aerial structures with DMX lighting.",
        solutionAr: "تصنيع ٣٠ مجسماً هوائياً ضخماً مع إضاءة متزامنة.",
        resultEn: "Over 50,000 visitors attended along Lusail Boulevard.",
        resultAr: "حضور أكثر من ٥٠ ألف زائر في درب لوسيل.",
        metrics: [
          {
            valueEn: "50,000+",
            labelEn: "Spectators",
            labelAr: "زائر ومشاهد",
            prefix: "",
            suffix: "+",
            sourceEn: "Qatar Tourism Audit",
          },
        ],
        technicalSpecs: {
          durationEn: "14 Days",
          durationAr: "١٤ يوماً",
          scaleEn: "2.5km Parade Route",
          scaleAr: "مسار بطول ٢.٥ كم",
          locationEn: "Lusail Boulevard",
          locationAr: "درب لوسيل",
          deliverablesEn: ["Giant Floats", "DMX Lighting"],
          deliverablesAr: ["مجسمات هوائية", "إضاءة متزامنة"],
        },
        servicesUsed: ["mega-events", "spatial-design"],
        beforeAfter: {
          enabled: true,
          beforeImageUrl: "https://eeeqa.com/before.jpg",
          afterImageUrl: "https://eeeqa.com/after.jpg",
          beforeCaptionEn: "Empty Boulevard",
          afterCaptionEn: "Active Parade",
        },
        gallery: [
          {
            id: "g1",
            url: "https://eeeqa.com/g1.jpg",
            mediaType: "IMAGE",
            captionEn: "Opening Night",
          },
        ],
        testimonials: [
          {
            quoteEn: "A magnificent delivery that wowed audiences.",
            authorEn: "H.E. Chairman",
            companyEn: "Tourism Authority",
            isVerified: true,
          },
        ],
        teamMembers: [
          {
            id: "tm1",
            roleEn: "Project Director",
            roleAr: "مدير المشروع",
            employeeProfile: {
              id: "emp1",
              firstName: "Amaan",
              lastName: "Ali",
              designation: "Executive Producer",
            },
          },
        ],
      };

      const adapted = adaptDbCaseStudyToPresentation(dbCase);
      expect(adapted.slug).toBe("doha-balloon-parade-2022");
      expect(adapted.titleEn).toBe("Doha Balloon Parade 2022");
      expect(adapted.titleAr).toBe("مهرجان الدوحة للمناطيد ٢٠٢٢");
      expect(adapted.metrics.length).toBe(1);
      expect(adapted.metrics[0].value).toBe("50,000+");
      expect(adapted.scopeTimeline.durationEn).toBe("14 Days");
      expect(adapted.beforeAfter?.enabled).toBe(true);
      expect(adapted.gallery.length).toBe(1);
      expect(adapted.testimonials.length).toBe(1);
      expect(adapted.teamMembers.length).toBe(1);
    });

    it("suppresses missing optional sections independently without breaking surrounding model", () => {
      const minimalDbCase = {
        id: "cs-min",
        slug: "minimal-case",
        titleEn: "Minimal Project",
        titleAr: "",
        isPublished: true,
      };

      const adapted = adaptDbCaseStudyToPresentation(minimalDbCase);
      expect(adapted.slug).toBe("minimal-case");
      expect(adapted.titleAr).toBe("Minimal Project"); // Fallback
      expect(adapted.metrics).toEqual([]);
      expect(adapted.beforeAfter).toBeNull();
      expect(adapted.gallery).toEqual([]);
      expect(adapted.testimonials).toEqual([]);
      expect(adapted.teamMembers).toEqual([]);
    });

    it("filters out invalid empty metrics and testimonials", () => {
      const dbCaseWithEmptyMetrics = {
        id: "cs-empty",
        slug: "empty-metrics",
        titleEn: "Empty Metrics Project",
        metrics: [
          { value: "", labelEn: "" },
          { value: "100%", labelEn: "Uptime" },
        ],
        testimonials: [
          { quoteEn: "", authorEn: "" },
          { quoteEn: "Great job!", authorEn: "Client Lead" },
        ],
      };

      const adapted = adaptDbCaseStudyToPresentation(dbCaseWithEmptyMetrics);
      expect(adapted.metrics.length).toBe(1);
      expect(adapted.metrics[0].value).toBe("100%");
      expect(adapted.testimonials.length).toBe(1);
      expect(adapted.testimonials[0].authorEn).toBe("Client Lead");
    });
  });

  describe("2. Canonical Publication Eligibility (QF-05)", () => {
    it("returns true only for published, non-hidden case studies", () => {
      expect(isCaseStudyEligible({ isPublished: true })).toBe(true);
      expect(isCaseStudyEligible({ isPublished: false })).toBe(false);
      expect(isCaseStudyEligible({ isPublished: true, isHidden: true })).toBe(false);
      expect(isCaseStudyEligible({ isPublished: true, status: "DRAFT" })).toBe(false);
      expect(isCaseStudyEligible({ isPublished: true, seo: { isArchived: true } })).toBe(false);
    });
  });

  describe("3. Presentation Components Safe Rendering & Independent Suppression", () => {
    it("renders CaseScopeTimeline with deliverables and returns null when empty", () => {
      const scope = {
        durationEn: "3 Weeks",
        scaleEn: "5000 sqm",
        locationEn: "Doha Corniche",
        deliverablesEn: ["Stage Fabrication", "Sound Engineering"],
        disciplines: ["mega-events"],
      };

      const html = renderToStaticMarkup(<CaseScopeTimeline scope={scope} locale="en" />);
      expect(html).toContain("3 Weeks");
      expect(html).toContain("5000 sqm");
      expect(html).toContain("Stage Fabrication");

      const emptyHtml = renderToStaticMarkup(<CaseScopeTimeline scope={{}} locale="en" />);
      expect(emptyHtml).toBe("");
    });

    it("renders CaseBeforeAfterSlider when images are valid and returns null when missing", () => {
      const emptyHtml = renderToStaticMarkup(<CaseBeforeAfterSlider beforeAfter={null} locale="en" />);
      expect(emptyHtml).toBe("");

      const fullHtml = renderToStaticMarkup(
        <CaseBeforeAfterSlider
          beforeAfter={{
            enabled: true,
            beforeImageUrl: "https://eeeqa.com/b.jpg",
            afterImageUrl: "https://eeeqa.com/a.jpg",
            beforeCaptionEn: "Initial Baseline",
            afterCaptionEn: "Delivered Activation",
          }}
          locale="en"
        />
      );
      expect(fullHtml).toContain("before-after-section");
      expect(fullHtml).toContain("https://eeeqa.com/b.jpg");
    });

    it("renders CaseRelatedServices with canonical services and returns null when empty", () => {
      const emptyHtml = renderToStaticMarkup(<CaseRelatedServices serviceSlugs={[]} locale="en" />);
      expect(emptyHtml).toBe("");

      const fullHtml = renderToStaticMarkup(<CaseRelatedServices serviceSlugs={["mega-events"]} locale="en" />);
      expect(fullHtml).toContain("related-services-section");
      expect(fullHtml).toContain("mega-events");
    });

    it("renders CaseGalleryJourney and suppresses when empty", () => {
      const emptyHtml = renderToStaticMarkup(<CaseGalleryJourney gallery={[]} locale="en" />);
      expect(emptyHtml).toBe("");

      const fullHtml = renderToStaticMarkup(
        <CaseGalleryJourney
          gallery={[{ url: "https://eeeqa.com/photo.jpg", captionEn: "Site Photo" }]}
          locale="en"
        />
      );
      expect(fullHtml).toContain("case-gallery-section");
      expect(fullHtml).toContain("https://eeeqa.com/photo.jpg");
    });

    it("renders CaseTestimonialsSection and suppresses when empty", () => {
      const emptyHtml = renderToStaticMarkup(<CaseTestimonialsSection testimonials={[]} locale="en" />);
      expect(emptyHtml).toBe("");

      const fullHtml = renderToStaticMarkup(
        <CaseTestimonialsSection
          testimonials={[{ quoteEn: "Outstanding partner", authorEn: "Tourism Director", companyEn: "Authority" }]}
          locale="en"
        />
      );
      expect(fullHtml).toContain("case-testimonials-section");
      expect(fullHtml).toContain("Outstanding partner");
    });

    it("renders ImpactMetricsGrid with formatted values and citations", () => {
      const metrics: VerifiedCaseStudyMetric[] = [
        {
          value: "10,000",
          prefix: "+",
          suffix: " Visitors",
          labelEn: "Total Attendance",
          labelAr: "إجمالي الحضور",
          sourceEn: "Verified by Ministry",
        },
      ];

      const html = renderToStaticMarkup(<ImpactMetricsGrid metrics={metrics} locale="en" />);
      expect(html).toContain("Total Attendance");
      expect(html).toContain("Verified by Ministry");
    });
  });

  describe("4. Dashboard Persistence Simulation (Non-production round-trip)", () => {
    it("simulates full payload round-trip without dropping existing or new fields", () => {
      const formPayload = {
        slug: "national-day-2023",
        titleEn: "Qatar National Day 2023",
        titleAr: "اليوم الوطني القطري ٢٠٢٣",
        clientName: "State of Qatar",
        year: 2023,
        category: "National Celebration",
        heroMediaType: "VIDEO",
        heroImageUrl: "https://eeeqa.com/qnd-hero.mp4",
        thumbnailMediaType: "IMAGE",
        thumbnailUrl: "https://eeeqa.com/qnd-thumb.jpg",
        clientLogoUrl: "https://eeeqa.com/qnd-logo.png",
        challengeEn: "Challenge text",
        challengeAr: "نص التحدي",
        solutionEn: "Solution text",
        solutionAr: "نص الحل",
        resultEn: "Result text",
        resultAr: "نص النتيجة",
        isFeatured: true,
        isPublished: true,
        attractionId: null,
        metrics: [{ valueEn: "1M+", labelEn: "Attendees", prefix: "+", suffix: "", sourceEn: "Audit" }],
        gallery: [{ url: "https://eeeqa.com/g1.jpg", captionEn: "Parade" }],
        technicalSpecs: {
          durationEn: "30 Days",
          scaleEn: "Darb Al Saai",
          deliverablesEn: ["Pavilion", "Stages"],
        },
        servicesUsed: ["mega-events", "shows-performances"],
        beforeAfter: {
          enabled: true,
          beforeImageUrl: "https://eeeqa.com/before.jpg",
          afterImageUrl: "https://eeeqa.com/after.jpg",
        },
        testimonials: [{ quoteEn: "Flawless execution", authorEn: "Organizing Committee" }],
        teamMembers: [{ employeeProfileId: "emp-1", roleEn: "Lead Producer", roleAr: "المنتج الرئيسي" }],
        seo: { metaTitleEn: "QND 2023 — E3 Case Study" },
      };

      // Ensure that adaptation parses the saved payload correctly
      const adapted = adaptDbCaseStudyToPresentation({
        ...formPayload,
        id: "cs-simulated",
        teamMembers: [
          {
            id: "tm-sim",
            roleEn: formPayload.teamMembers[0].roleEn,
            roleAr: formPayload.teamMembers[0].roleAr,
            employeeProfile: { id: "emp-1", firstName: "Ali", lastName: "Ahmed", designation: "Producer" },
          },
        ],
      });

      expect(adapted.slug).toBe("national-day-2023");
      expect(adapted.scopeTimeline.durationEn).toBe("30 Days");
      expect(adapted.scopeTimeline.disciplines).toEqual(["mega-events", "shows-performances"]);
      expect(adapted.beforeAfter?.enabled).toBe(true);
      expect(adapted.metrics[0].sourceEn).toBe("Audit");
      expect(adapted.testimonials[0].quoteEn).toBe("Flawless execution");
      expect(adapted.teamMembers[0].roleAr).toBe("المنتج الرئيسي");
    });
  });

  describe("5. Centralized Label Dictionary Completeness", () => {
    it("contains complete dual-language translations for all major section headings", () => {
      expect(CASE_STUDY_LABELS.hero.title.en).toBeDefined();
      expect(CASE_STUDY_LABELS.hero.title.ar).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.challengeTitle.en).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.challengeTitle.ar).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.solutionTitle.en).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.solutionTitle.ar).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.resultTitle.en).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.resultTitle.ar).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.scopeTitle.en).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.scopeTitle.ar).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.beforeAfterTitle.en).toBeDefined();
      expect(CASE_STUDY_LABELS.detail.beforeAfterTitle.ar).toBeDefined();
    });
  });

  describe("6. Canonical Services & Multi-Page Safety Invariants", () => {
    it("preserves exactly 10 canonical services across the website", () => {
      const services = getAllCanonicalServices();
      expect(services.length).toBe(10);
    });
  });
});
