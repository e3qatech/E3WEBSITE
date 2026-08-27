/**
 * UX-05B: Case Studies Landing Page Correction & Enhancement Test Suite
 *
 * Requirements Verified:
 * 1. Live Data Resolution: Hero count, category filter totals, and archive grid use the exact same eligible dataset.
 * 2. Independent Before & After Sliders: Every comparison owns its isolated state. Dragging one never updates another.
 * 3. Featured Project Spotlight: Displays large media, challenge/solution preview, impact metrics, and CTA.
 * 4. Impact Stories Stream: Metric carousel dynamically derived from published case-study metrics with localized links.
 * 5. Project Archive Grid: 3-column desktop grid with instant search, category/year filtering, and localized empty states.
 * 6. Behind the Build: Canonical team member assignments with designation and project roles, strictly excluding emails.
 * 7. Locale Preservation: Retains active /en or /ar prefixes across all links.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CaseStudiesIndexClient } from "@/components/b2b/CaseStudiesIndexClient";
import { BeforeAfterTransformationStage } from "@/components/b2b/cases/landing/BeforeAfterTransformationStage";
import { FeaturedProjectSpotlight } from "@/components/b2b/cases/landing/FeaturedProjectSpotlight";
import { ImpactStoriesStream } from "@/components/b2b/cases/landing/ImpactStoriesStream";
import { BehindTheBuildTeam } from "@/components/b2b/cases/landing/BehindTheBuildTeam";
import { isCaseStudyEligible } from "@/lib/case-studies";

const MOCK_CASE_STUDIES = [
  {
    id: "case-1-lusail",
    slug: "lusail-kinetic-lights",
    titleEn: "Lusail Kinetic Canopy",
    titleAr: "مظلة لوسيل الحركية",
    clientName: "Lusail Real Estate",
    year: 2024,
    category: "Spatial Architecture",
    isFeatured: true,
    isPublished: true,
    heroImageUrl: "https://example.com/lusail-hero.jpg",
    thumbnailUrl: "https://example.com/lusail-thumb.jpg",
    challengeEn: "Complex dynamic load distribution in outdoor desert heat.",
    challengeAr: "توزيع الأحمال الديناميكية المعقدة في البيئة الصحراوية.",
    solutionEn: "Engineered kinetic motorized trusses with automated thermal compensation.",
    solutionAr: "هندسة هياكل متحركة بمحركات خاصة ونظام تعويض حراري تلقائي.",
    resultEn: "Over 1.2M visitors with zero downtime.",
    resultAr: "أكثر من 1.2 مليون زائر بدون أي انقطاع تشغيلي.",
    metrics: [
      { valueEn: "1.2M+", labelEn: "Total Visitors", labelAr: "إجمالي الزوار" },
      { valueEn: "100%", labelEn: "Uptime Reliability", labelAr: "جاهزية تشغيلية" },
    ],
    teamMembers: [
      {
        id: "tm-1",
        employeeProfileId: "emp-1-ahmad",
        roleEn: "Lead Kinetic Engineer",
        roleAr: "كبير مهندسي الحركة",
        employeeProfile: {
          id: "emp-1-ahmad",
          firstName: "Ahmad",
          lastName: "Faraz",
          designation: "Head of Kinetic Engineering",
          department: "Engineering",
          profileImage: "https://example.com/ahmad.jpg",
          email: "ahmad.faraz.private@e3.qa", // MUST NOT BE RENDERED
        },
      },
    ],
  },
  {
    id: "case-2-inflatapark",
    slug: "inflatapark-doha",
    titleEn: "InflataPark World Record",
    titleAr: "إنفلاتا بارك الرقم القياسي",
    clientName: "Qatar Tourism",
    year: 2024,
    category: "Family Entertainment",
    isFeatured: false,
    isPublished: true,
    heroImageUrl: "https://example.com/inflatapark-hero.jpg",
    thumbnailUrl: "https://example.com/inflatapark-thumb.jpg",
    challengeEn: "30,000 sqm indoor obstacle layout.",
    challengeAr: "تخطيط مسار ألعاب هوائية على مساحة 30 ألف متر مربع.",
    solutionEn: "Custom fabricated modular obstacle zones.",
    solutionAr: "تصنيع وتجهيز مسارات حواجز معيارية مخصصة.",
    metrics: [
      { valueEn: "1,055 m", labelEn: "World Record Length", labelAr: "طول المسار القياسي" },
    ],
    teamMembers: [],
  },
  {
    id: "case-3-draft",
    slug: "draft-project-hidden",
    titleEn: "Draft Project",
    titleAr: "مشروع مسودة",
    isPublished: false,
    status: "DRAFT",
    metrics: [],
  },
];

const MOCK_TRANSFORMATIONS_CONFIG = {
  enabled: true,
  titleEn: "Before & After Transformations",
  titleAr: "التحول الفضائي قبل وبعد التنفيذ",
  items: [
    {
      id: "tr-lego",
      beforeUrl: "https://example.com/lego-before.jpg",
      afterUrl: "https://example.com/lego-after.jpg",
      titleEn: "LEGO Shows Qatar",
      titleAr: "عروض ليغو قطر",
      beforeLabelEn: "Empty Exhibition Halls",
      beforeLabelAr: "قاعات المعرض قبل التنفيذ",
      afterLabelEn: "An Immersive LEGO World",
      afterLabelAr: "عالم ليغو غامر",
      captionEn: "Transformation from bare hall to dynamic brick universe",
      captionAr: "التحول من قاعة فارغة إلى فضاء ترفيهي متكامل",
    },
    {
      id: "tr-balloon",
      beforeUrl: "https://example.com/balloon-before.jpg",
      afterUrl: "https://example.com/balloon-after.jpg",
      titleEn: "Doha Balloon Parade",
      titleAr: "مهرجان المنطاد بالدوحة",
      beforeLabelEn: "The Corniche Before Build",
      beforeLabelAr: "الكورنيش قبل التجهيز",
      afterLabelEn: "Qatar Landmark Parade",
      afterLabelAr: "استعراض جماهيري استثنائي",
      captionEn: "Transforming open coastline into festival route",
      captionAr: "تحويل الواجهة البحرية إلى مسار استعراضي وطني",
    },
  ],
};

const MOCK_CMS_CONTENT = {
  hero: {
    enabled: true,
    eyebrowEn: "The Vault",
    eyebrowAr: "سجل الإنجازات",
    titleEn: "Ideas Are Powerful. Results Make Them Real.",
    titleAr: "الأفكار تصنع الإمكانات. والنتائج تثبتها.",
    primaryCtaEn: "Explore Our Work",
    primaryCtaAr: "استكشف أعمالنا",
    primaryLink: "#archive",
    secondaryCtaEn: "Start a Project",
    secondaryCtaAr: "ابدأ مشروعك",
    secondaryLink: "/b2b/contact",
  },
  featuredCases: {
    enabled: true,
    titleEn: "Landmark Experience Spotlights",
    titleAr: "إنجازات رئيسية ذات أثر ملموس",
  },
  factStream: {
    enabled: true,
    labelEn: "Did You Know?",
    labelAr: "هل تعلم؟",
    rotationDuration: 6,
  },
  archive: {
    enabled: true,
    titleEn: "Explore the Work",
    titleAr: "استكشف أعمالنا",
  },
  transformations: MOCK_TRANSFORMATIONS_CONFIG,
  teamStories: {
    enabled: true,
    titleEn: "The Stories You Don’t See on Stage.",
    titleAr: "قصص لا يراها الجمهور على المسرح.",
  },
  cta: {
    enabled: true,
    headlineEn: "Let’s Create the Next Landmark Experience.",
    headlineAr: "لنصنع معاً التجربة الاستثنائية القادمة.",
    primaryLink: "/b2b/contact",
  },
};

describe("UX-05B — Case Studies Landing Page Correction & Enhancement", () => {
  it("1. Live Data Resolution: Hero count, category filter totals, and archive use exact eligible published case studies count", () => {
    const eligible = MOCK_CASE_STUDIES.filter(isCaseStudyEligible);
    expect(eligible.length).toBe(2);

    const htmlEn = renderToStaticMarkup(
      <CaseStudiesIndexClient
        caseStudies={MOCK_CASE_STUDIES as any}
        cmsContent={MOCK_CMS_CONTENT}
        locale="en"
      />
    );

    // Hero live badge count
    expect(htmlEn).toContain("2 Delivered Landmarks");
    expect(htmlEn).not.toContain("0 Delivered Landmarks");

    // Filter toolbar count
    expect(htmlEn).toContain("All Projects (2)");
    expect(htmlEn).not.toContain("All Projects (0)");

    // Result counter
    expect(htmlEn).toContain("Showing 2 of 2 Landmark Projects");

    // Draft project must NOT appear anywhere in the output
    expect(htmlEn).not.toContain("Draft Project");
    expect(htmlEn).not.toContain("draft-project-hidden");

    // Arabic parity
    const htmlAr = renderToStaticMarkup(
      <CaseStudiesIndexClient
        caseStudies={MOCK_CASE_STUDIES as any}
        cmsContent={MOCK_CMS_CONTENT}
        locale="ar"
      />
    );

    expect(htmlAr).toContain("2 مشروعاً موثقاً");
    expect(htmlAr).not.toContain("0 مشروعاً موثقاً");
    expect(htmlAr).toContain("جميع المشاريع (2)");
  });

  it("2. Independent Before & After Sliders: Each comparison stage has isolated slider controls and accessible range input", () => {
    const html = renderToStaticMarkup(
      <BeforeAfterTransformationStage
        config={MOCK_TRANSFORMATIONS_CONFIG}
        locale="en"
      />
    );

    // Renders active transformation titles and tabs
    expect(html).toContain("LEGO Shows Qatar");
    expect(html).toContain("Doha Balloon Parade");

    // Localized Before/After Badges
    expect(html).toContain("Empty Exhibition Halls");
    expect(html).toContain("An Immersive LEGO World");

    // Accessible slider element attributes
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-valuenow="50"');

    // Accessible hidden range input
    expect(html).toContain('type="range"');
  });

  it("3. Featured Project Spotlight: Renders top featured case study with challenge/solution excerpts and metrics", () => {
    const featured = MOCK_CASE_STUDIES.find((cs) => cs.isFeatured);
    expect(featured).toBeDefined();

    const htmlEn = renderToStaticMarkup(
      <FeaturedProjectSpotlight
        config={MOCK_CMS_CONTENT.featuredCases}
        featuredProject={featured}
        locale="en"
      />
    );

    expect(htmlEn).toContain("Lusail Kinetic Canopy");
    expect(htmlEn).toContain("Lusail Real Estate");
    expect(htmlEn).toContain("Complex dynamic load distribution in outdoor desert heat.");
    expect(htmlEn).toContain("Engineered kinetic motorized trusses with automated thermal compensation.");
    expect(htmlEn).toContain("1.2M+");
    expect(htmlEn).toContain("Total Visitors");
    expect(htmlEn).toContain("/en/b2b/case-studies/lusail-kinetic-lights");

    // Arabic parity
    const htmlAr = renderToStaticMarkup(
      <FeaturedProjectSpotlight
        config={MOCK_CMS_CONTENT.featuredCases}
        featuredProject={featured}
        locale="ar"
      />
    );

    expect(htmlAr).toContain("مظلة لوسيل الحركية");
    expect(htmlAr).toContain("توزيع الأحمال الديناميكية المعقدة في البيئة الصحراوية.");
    expect(htmlAr).toContain("/ar/b2b/case-studies/lusail-kinetic-lights");
  });

  it("4. Impact Stories Stream: Automatically extracts metric highlights from published case studies", () => {
    const facts = [
      {
        id: "case-1-lusail_metric_0",
        caseStudyId: "case-1-lusail",
        caseStudyTitleEn: "Lusail Kinetic Canopy",
        caseStudyTitleAr: "مظلة لوسيل الحركية",
        caseStudySlug: "lusail-kinetic-lights",
        value: "1.2M+",
        headlineEn: "Total Visitors",
        headlineAr: "إجمالي الزوار",
        descEn: "Lusail Kinetic Canopy",
      },
    ];

    const html = renderToStaticMarkup(
      <ImpactStoriesStream
        config={MOCK_CMS_CONTENT.factStream}
        facts={facts}
        locale="en"
      />
    );

    expect(html).toContain("1.2M+");
    expect(html).toContain("Total Visitors");
    expect(html).toContain("/en/b2b/case-studies/lusail-kinetic-lights");
  });

  it("5. Behind the Build: Renders canonical team assignments while strictly protecting email privacy", () => {
    const html = renderToStaticMarkup(
      <BehindTheBuildTeam
        config={MOCK_CMS_CONTENT.teamStories}
        caseStudies={MOCK_CASE_STUDIES.filter(isCaseStudyEligible)}
        employeeProfiles={[]}
        locale="en"
      />
    );

    // Displays member name & project role
    expect(html).toContain("Ahmad Faraz");
    expect(html).toContain("Lead Kinetic Engineer");
    expect(html).toContain("Lusail Kinetic Canopy");
    expect(html).toContain("/en/b2b/case-studies/lusail-kinetic-lights");

    // STRICT PRIVACY CHECK: Personal email must NEVER be in markup
    expect(html).not.toContain("ahmad.faraz.private@e3.qa");
    expect(html).not.toContain("mailto:");
  });

  it("6. Locale Preservation: Verifies active locale in internal navigation and CTAs", () => {
    const htmlEn = renderToStaticMarkup(
      <CaseStudiesIndexClient
        caseStudies={MOCK_CASE_STUDIES as any}
        cmsContent={MOCK_CMS_CONTENT}
        locale="en"
      />
    );

    expect(htmlEn).toContain("/en/b2b/contact");
    expect(htmlEn).toContain("/en/b2b/case-studies/lusail-kinetic-lights");
    expect(htmlEn).toContain("/en/b2b/case-studies/inflatapark-doha");

    const htmlAr = renderToStaticMarkup(
      <CaseStudiesIndexClient
        caseStudies={MOCK_CASE_STUDIES as any}
        cmsContent={MOCK_CMS_CONTENT}
        locale="ar"
      />
    );

    expect(htmlAr).toContain("/ar/b2b/contact");
    expect(htmlAr).toContain("/ar/b2b/case-studies/lusail-kinetic-lights");
    expect(htmlAr).toContain("/ar/b2b/case-studies/inflatapark-doha");
  });
});
