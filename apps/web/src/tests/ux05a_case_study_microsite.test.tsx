/**
 * UX-05A: Build the Cinematic Case-Study Microsite System Test Suite
 *
 * Requirements:
 * 1. Cinematic Hero: Universal media (Image/Video/3D), single H1, client/category/year/attraction, parallax, fallback.
 * 2. Project Identity Bar: Overview strip + compact sticky desktop section navigator (Overview, Challenge, Solution, Result, Impact, Team, Gallery).
 * 3. Transformation Narrative: 3 connected acts (Challenge, Solution, Result) with editorial numbering (01, 02, 03) and EN/AR parity.
 * 4. Impact Metrics: Value EN/AR, Label EN/AR, count-up reveal, responsive grid, hidden when empty.
 * 5. Linked Attraction: "From Project to Live Experience" card, locale-preserving link, hidden when null.
 * 6. Project Team: "People Behind the Build", portrait, name, designation, project role EN/AR, public team profile link (no email).
 * 7. Testimonials: Filtered isVisible !== false, single quote or carousel, localized EN/AR.
 * 8. Gallery: Editorial alternating full-width/2-col media journey with modal/lightbox.
 * 9. Next Project Transition: Visual transition to next case + "Back to All Case Studies".
 * 10. SEO & Legacy Redirects: Metadata, canonical/alternate URLs, OG images, doha-balloon-parade permanent redirect.
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => ({ success: true })),
}));

vi.mock("@/lib/db", () => ({
  db: {
    caseStudy: {
      findUnique: vi.fn(async () => null),
      findFirst: vi.fn(async () => null),
      findMany: vi.fn(async () => []),
    },
    attraction: {
      findMany: vi.fn(async () => []),
    },
    employeeProfile: {
      findMany: vi.fn(async () => []),
    },
  },
}));

import { CinematicCaseHero } from "@/components/b2b/cases/CinematicCaseHero";
import { ProjectIdentityBar } from "@/components/b2b/cases/ProjectIdentityBar";
import { TransformationNarrative } from "@/components/b2b/cases/TransformationNarrative";
import { ImpactMetricsGrid } from "@/components/b2b/cases/ImpactMetricsGrid";
import { LinkedAttractionFeature } from "@/components/b2b/cases/LinkedAttractionFeature";
import { ProjectTeamSection } from "@/components/b2b/cases/ProjectTeamSection";
import { CaseTestimonialsSection } from "@/components/b2b/cases/CaseTestimonialsSection";
import { CaseGalleryJourney } from "@/components/b2b/cases/CaseGalleryJourney";
import { NextProjectTransition } from "@/components/b2b/cases/NextProjectTransition";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { generateMetadata } from "@/app/[locale]/b2b/case-studies/[slug]/page";
import * as CaseStudiesLib from "@/lib/case-studies";

const MOCK_CASE_STUDY = {
  id: "case-lusail-2024",
  slug: "lusail-kinetic-lights-2024",
  titleEn: "Lusail Kinetic Light Canopy",
  titleAr: "مظلة لوسيل الضوئية الحركية",
  clientName: "Lusail Real Estate Development",
  category: "Spatial Architecture",
  categoryAr: "العمارة المكانية",
  year: 2024,
  isFeatured: true,
  isPublished: true,
  heroMediaType: "VIDEO",
  heroImageUrl: "https://e3.qa/media/lusail-hero.mp4",
  thumbnailUrl: "https://e3.qa/media/lusail-thumb.jpg",
  clientLogoUrl: "https://e3.qa/media/lusail-logo.png",
  challengeEn: "Synchronizing 400 kinetic winches across a 2,000 sqm open-air pedestrian plaza under extreme desert thermal conditions.",
  challengeAr: "تزامن 400 رافعة حركية عبر ساحة مشاة مفتوحة بمساحة 2000 متر مربع تحت ظروف مناخية صحراوية قاسية.",
  solutionEn: "Engineered proprietary thermal cooling enclosures and high-speed fiber-optic Art-Net control topology.",
  solutionAr: "تصميم وتنفيذ حاويات تبريد حرارية خاصة وشبكة تحكم ألياف بصرية فائقة السرعة ببروتوكول Art-Net.",
  resultEn: "Over 1.2M visitors experienced zero downtime throughout the 60-day festival season.",
  resultAr: "أكثر من 1.2 مليون زائر بدون أي توقف تشغيلي طوال موسم المهرجان الممتد لـ 60 يوماً.",
  metrics: [
    { valueEn: "1.2M+", valueAr: "1.2M+", labelEn: "Total Visitors", labelAr: "إجمالي الزوار" },
    { valueEn: "400", valueAr: "400", labelEn: "Kinetic Winches", labelAr: "رافعات حركية" },
    { valueEn: "100%", valueAr: "100%", labelEn: "Operational Uptime", labelAr: "جاهزية تشغيلية" },
  ],
  gallery: [
    { url: "https://e3.qa/media/lusail-gal-1.jpg", captionEn: "Canopy overhead array at dusk", captionAr: "المصفوفة الضوئية العلوية وقت الغسق" },
    { url: "https://e3.qa/media/lusail-gal-2.jpg", captionEn: "Central control rig console", captionAr: "منظومة التحكم المركزية" },
  ],
  testimonials: [
    {
      quoteEn: "E3 delivered Qatar's most sophisticated kinetic installation with flawless engineering precision.",
      quoteAr: "نفذت إي ثري أكثر المشاريع الحركية تطوراً في قطر بدقة هندسية متناهية.",
      authorName: "Eng. Hamad Al-Marri",
      authorRole: "Director of Infrastructure, Lusail",
      isVisible: true,
    },
    {
      quoteEn: "Hidden internal draft note",
      quoteAr: "ملاحظة مسودة مخفية",
      authorName: "Internal Tester",
      isVisible: false,
    },
  ],
  attraction: {
    id: "attr-lusail-blvd",
    slug: "lusail-boulevard-world",
    nameEn: "Lusail Boulevard Experience",
    nameAr: "تجربة درب لوسيل التفاعلية",
    taglineEn: "Qatar's flagship kinetic entertainment boulevard",
    taglineAr: "الوجهة الترفيهية الحركية الرائدة في دولة قطر",
    locationEn: "Lusail, Qatar",
    locationAr: "لوسيل، قطر",
    heroImageUrl: "https://e3.qa/media/lusail-attr.jpg",
  },
  teamMembers: [
    {
      id: "cstm-1",
      roleEn: "Lead Kinetic Systems Architect",
      roleAr: "كبير مهندسي الأنظمة الحركية",
      employeeProfile: {
        id: "emp-tariq",
        slug: "tariq-al-mansoor",
        firstName: "Tariq",
        lastName: "Al-Mansoor",
        designation: "VP of Engineering",
        designationAr: "نائب الرئيس للشؤون الهندسية",
        avatarUrl: "https://e3.qa/media/team/tariq.jpg",
      },
    },
  ],
  seo: {
    metaTitleEn: "Lusail Kinetic Canopy Case Study",
    metaTitleAr: "دراسة حالة مظلة لوسيل الحركية",
    metaDescriptionEn: "Discover how E3 engineered Qatar's landmark kinetic lighting installation in Lusail.",
    metaDescriptionAr: "استكشف كيف صممت ونفذت إي ثري أضخم عمل حركي ضوئي في درب لوسيل.",
  },
};

describe("UX-05A — Build the Cinematic Case-Study Microsite System Suite", () => {
  /* ================================================================ */
  /* 1. CINEMATIC CASE HERO                                           */
  /* ================================================================ */
  describe("1. CinematicCaseHero Component", () => {
    it("renders hero with title as exactly one H1, client, category, year, and linked attraction", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CinematicCaseHero
            locale="en"
            title={MOCK_CASE_STUDY.titleEn}
            clientName={MOCK_CASE_STUDY.clientName}
            category={MOCK_CASE_STUDY.category}
            year={MOCK_CASE_STUDY.year}
            heroMediaType={MOCK_CASE_STUDY.heroMediaType}
            heroImageUrl={MOCK_CASE_STUDY.heroImageUrl}
            clientLogoUrl={MOCK_CASE_STUDY.clientLogoUrl}
            isFeatured={MOCK_CASE_STUDY.isFeatured}
            attraction={MOCK_CASE_STUDY.attraction}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="cinematic-case-hero"');
      expect(html).toContain('data-testid="case-study-title"');
      expect(html).toContain("<h1");
      expect(html.match(/<h1/g)?.length).toBe(1);
      expect(html).toContain("Lusail Kinetic Light Canopy");
      expect(html).toContain("Lusail Real Estate Development");
      expect(html).toContain("Spatial Architecture");
      expect(html).toContain("2024");
      expect(html).toContain('data-testid="hero-featured-badge"');
      expect(html).toContain('data-testid="hero-linked-attraction-badge"');
      expect(html).toContain("Live at Lusail Boulevard Experience");
      expect(html).toContain('data-testid="hero-client-logo"');
      expect(html).toContain('data-testid="hero-back-link"');
      expect(html).toContain("/en/b2b/case-studies");
    });

    it("renders fallback when hero image is absent without rendering an empty black hero", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CinematicCaseHero
            locale="en"
            title="Minimal Case Title"
            thumbnailUrl="https://e3.qa/media/thumb.jpg"
          />
        </LocaleProvider>
      );

      expect(html).toContain("Minimal Case Title");
      expect(html).toContain("https://e3.qa/media/thumb.jpg");
    });
  });

  /* ================================================================ */
  /* 2. PROJECT IDENTITY BAR & NAVIGATOR                              */
  /* ================================================================ */
  describe("2. ProjectIdentityBar Component", () => {
    it("renders overview details and sticky desktop section navigator with valid anchors", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ProjectIdentityBar
            locale="en"
            clientName={MOCK_CASE_STUDY.clientName}
            category={MOCK_CASE_STUDY.category}
            year={MOCK_CASE_STUDY.year}
            isFeatured={MOCK_CASE_STUDY.isFeatured}
            attraction={MOCK_CASE_STUDY.attraction}
            hasChallenge={true}
            hasSolution={true}
            hasResult={true}
            hasImpact={true}
            hasTeam={true}
            hasTestimonials={true}
            hasGallery={true}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="project-identity-bar"');
      expect(html).toContain("Lusail Real Estate Development");
      expect(html).toContain('data-testid="identity-attraction-link"');
      expect(html).toContain("/en/b2c/attractions/lusail-boulevard-world");

      // Desktop section navigator links
      expect(html).toContain('data-testid="nav-link-overview"');
      expect(html).toContain('data-testid="nav-link-challenge"');
      expect(html).toContain('data-testid="nav-link-solution"');
      expect(html).toContain('data-testid="nav-link-result"');
      expect(html).toContain('data-testid="nav-link-impact"');
      expect(html).toContain('data-testid="nav-link-team"');
      expect(html).toContain('data-testid="nav-link-testimonials"');
      expect(html).toContain('data-testid="nav-link-gallery"');
    });

    it("hides section links in navigator when content is absent", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ProjectIdentityBar
            locale="en"
            clientName="Test Client"
            hasChallenge={true}
            hasSolution={false}
            hasResult={false}
            hasImpact={false}
            hasTeam={false}
            hasTestimonials={false}
            hasGallery={false}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="nav-link-challenge"');
      expect(html).not.toContain('data-testid="nav-link-solution"');
      expect(html).not.toContain('data-testid="nav-link-gallery"');
    });
  });

  /* ================================================================ */
  /* 3. TRANSFORMATION NARRATIVE                                      */
  /* ================================================================ */
  describe("3. TransformationNarrative Component", () => {
    it("renders 3 connected acts with editorial numbers and localized copy", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <TransformationNarrative
            locale="en"
            challengeText={MOCK_CASE_STUDY.challengeEn}
            solutionText={MOCK_CASE_STUDY.solutionEn}
            resultText={MOCK_CASE_STUDY.resultEn}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="transformation-narrative-section"');
      expect(html).toContain('data-testid="narrative-act-challenge"');
      expect(html).toContain('data-testid="narrative-act-solution"');
      expect(html).toContain('data-testid="narrative-act-result"');
      expect(html).toContain("01");
      expect(html).toContain("02");
      expect(html).toContain("03");
      expect(html).toContain("Synchronizing 400 kinetic winches");
      expect(html).toContain("Engineered proprietary thermal cooling enclosures");
      expect(html).toContain("Over 1.2M visitors experienced zero downtime");
    });

    it("returns null when all narrative fields are empty", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <TransformationNarrative locale="en" />
        </LocaleProvider>
      );

      expect(html).toBe("");
    });
  });

  /* ================================================================ */
  /* 4. IMPACT METRICS GRID                                           */
  /* ================================================================ */
  describe("4. ImpactMetricsGrid Component", () => {
    it("renders impact metrics cards without inventing numbers", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ImpactMetricsGrid
            locale="en"
            metrics={MOCK_CASE_STUDY.metrics}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="impact-metrics-section"');
      expect(html).toContain('data-testid="metric-card-0"');
      expect(html).toContain('data-testid="metric-card-1"');
      expect(html).toContain('data-testid="metric-card-2"');
      expect(html).toContain("1.2M+");
      expect(html).toContain("Total Visitors");
      expect(html).toContain("Kinetic Winches");
      expect(html).toContain("Operational Uptime");
    });

    it("returns null when metrics array is empty", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ImpactMetricsGrid locale="en" metrics={[]} />
        </LocaleProvider>
      );

      expect(html).toBe("");
    });
  });

  /* ================================================================ */
  /* 5. LINKED ATTRACTION FEATURE                                     */
  /* ================================================================ */
  describe("5. LinkedAttractionFeature Component", () => {
    it("renders 'From Project to Live Experience' with canonical attraction link", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <LinkedAttractionFeature
            locale="en"
            attraction={MOCK_CASE_STUDY.attraction}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="linked-attraction-feature"');
      expect(html).toContain("FROM PROJECT TO LIVE EXPERIENCE");
      expect(html).toContain("Lusail Boulevard Experience");
      expect(html).toContain('data-testid="explore-experience-link"');
      expect(html).toContain("/en/b2c/attractions/lusail-boulevard-world");
    });

    it("returns null when no attraction is linked", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <LinkedAttractionFeature locale="en" attraction={null} />
        </LocaleProvider>
      );

      expect(html).toBe("");
    });
  });

  /* ================================================================ */
  /* 6. PROJECT TEAM SECTION                                          */
  /* ================================================================ */
  describe("6. ProjectTeamSection Component", () => {
    it("renders team cards with localized role and public profile link without exposing email", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ProjectTeamSection
            locale="en"
            teamMembers={MOCK_CASE_STUDY.teamMembers}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="project-team-section"');
      expect(html).toContain('data-testid="team-member-card-tariq-al-mansoor"');
      expect(html).toContain("Tariq Al-Mansoor");
      expect(html).toContain("Lead Kinetic Systems Architect");
      expect(html).toContain("/en/b2b/team/tariq-al-mansoor");
      expect(html).not.toContain("@");
    });

    it("returns null when team members array is empty", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <ProjectTeamSection locale="en" teamMembers={[]} />
        </LocaleProvider>
      );

      expect(html).toBe("");
    });
  });

  /* ================================================================ */
  /* 7. CASE TESTIMONIALS SECTION                                     */
  /* ================================================================ */
  describe("7. CaseTestimonialsSection Component", () => {
    it("renders only testimonials marked isVisible !== false", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CaseTestimonialsSection
            locale="en"
            testimonials={MOCK_CASE_STUDY.testimonials}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="case-testimonials-section"');
      expect(html).toContain("Eng. Hamad Al-Marri");
      expect(html).toContain("E3 delivered Qatar&#x27;s most sophisticated kinetic installation");
      expect(html).not.toContain("Hidden internal draft note");
    });

    it("returns null when testimonials are empty or all hidden", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CaseTestimonialsSection
            locale="en"
            testimonials={[{ quoteEn: "Hidden", isVisible: false }]}
          />
        </LocaleProvider>
      );

      expect(html).toBe("");
    });
  });

  /* ================================================================ */
  /* 8. CASE GALLERY JOURNEY                                          */
  /* ================================================================ */
  describe("8. CaseGalleryJourney Component", () => {
    it("renders alternating editorial gallery layout with captions", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CaseGalleryJourney
            locale="en"
            gallery={MOCK_CASE_STUDY.gallery}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="case-gallery-section"');
      expect(html).toContain('data-testid="gallery-item-0"');
      expect(html).toContain('data-testid="gallery-item-1"');
      expect(html).toContain("Canopy overhead array at dusk");
      expect(html).toContain("Central control rig console");
    });

    it("returns null when gallery is empty", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CaseGalleryJourney locale="en" gallery={[]} />
        </LocaleProvider>
      );

      expect(html).toBe("");
    });
  });

  /* ================================================================ */
  /* 9. NEXT PROJECT TRANSITION                                       */
  /* ================================================================ */
  describe("9. NextProjectTransition Component", () => {
    it("renders full-width visual transition to next case study with category and title", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <NextProjectTransition
            locale="en"
            nextProject={{
              id: "case-doha-balloon",
              slug: "doha-balloon-parade-2022",
              titleEn: "Doha Balloon Festival Parade",
              category: "Live Entertainment",
              thumbnailUrl: "https://e3.qa/media/balloon-thumb.jpg",
            }}
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="next-project-transition"');
      expect(html).toContain('data-testid="next-case-link"');
      expect(html).toContain("Doha Balloon Festival Parade");
      expect(html).toContain("Live Entertainment");
      expect(html).toContain("/en/b2b/case-studies/doha-balloon-parade-2022");
      expect(html).toContain('data-testid="back-to-all-cases-btn"');
    });

    it("renders 'Back to All Case Studies' fallback when no next project is returned", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <NextProjectTransition locale="en" nextProject={null} />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="back-to-all-cases-btn"');
      expect(html).toContain("/en/b2b/case-studies");
    });
  });

  /* ================================================================ */
  /* 10. SEO & PERMANENT REDIRECTS                                    */
  /* ================================================================ */
  describe("10. SEO Metadata Generation & Legacy Redirects", () => {
    it("generates correct metadata, canonical URL, and OpenGraph image", async () => {
      vi.spyOn(CaseStudiesLib, "getPublicCaseStudyBySlug").mockResolvedValueOnce(MOCK_CASE_STUDY as any);

      const meta = await generateMetadata({
        params: Promise.resolve({ slug: "lusail-kinetic-lights-2024", locale: "en" }),
      });

      expect(meta.title).toBe("Lusail Kinetic Canopy Case Study — E3 Case Study");
      expect(meta.alternates?.canonical).toBe("https://e3.qa/en/b2b/case-studies/lusail-kinetic-lights-2024");
      expect(meta.openGraph?.images).toEqual([{ url: "https://e3.qa/media/lusail-hero.mp4" }]);
    });

    it("handles legacy doha-balloon-parade slug via redirect in generateMetadata", async () => {
      await expect(
        generateMetadata({
          params: Promise.resolve({ slug: "doha-balloon-parade", locale: "en" }),
        })
      ).rejects.toThrow();
    });
  });
});
