import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CinematicCaseHero } from "@/components/b2b/cases/CinematicCaseHero";
import { ProjectIdentityBar } from "@/components/b2b/cases/ProjectIdentityBar";
import { TransformationNarrative } from "@/components/b2b/cases/TransformationNarrative";
import { ImpactMetricsGrid } from "@/components/b2b/cases/ImpactMetricsGrid";
import { LinkedAttractionFeature } from "@/components/b2b/cases/LinkedAttractionFeature";
import { CaseGalleryJourney } from "@/components/b2b/cases/CaseGalleryJourney";
import { ProjectTeamSection } from "@/components/b2b/cases/ProjectTeamSection";
import { CaseTestimonialsSection } from "@/components/b2b/cases/CaseTestimonialsSection";
import { NextProjectTransition } from "@/components/b2b/cases/NextProjectTransition";

describe("UX-05C — Case Study Detail Page Enhancement Suite", () => {
  const mockAttraction = {
    id: "attr-1",
    slug: "inflatapark-qatar",
    nameEn: "InflataPark Qatar",
    nameAr: "إنفلاتابارك قطر",
    taglineEn: "The Ultimate Inflatable Adventure Park",
    taglineAr: "الحديقة المطاطية الأضخم في قطر",
    heroImageUrl: "/images/inflatapark-hero.webp",
    locationEn: "City Center Doha",
    locationAr: "سيتي سنتر الدوحة",
  };

  const mockTeamMembers = [
    {
      id: "tm-1",
      role: "Lead Experience Architect",
      member: {
        id: "mem-1",
        nameEn: "Tariq Al-Mansoor",
        nameAr: "طارق المنصور",
        roleEn: "VP of Creative & Experience",
        roleAr: "نائب الرئيس للتجارب الإبداعية",
        avatarUrl: "/avatars/tariq.webp",
        email: "tariq.secret@e3.qa", // Must never be rendered
      },
    },
  ];

  const mockTestimonials = [
    {
      quoteEn: "E3 transformed our vision into an iconic national landmark with record attendance.",
      quoteAr: "حولت إي ثري رؤيتنا إلى معلم وطني بارز بحضور قياسي.",
      authorNameEn: "Sheikh Khalid Al-Thani",
      authorNameAr: "الشيخ خالد آل ثاني",
      authorRoleEn: "Managing Director",
      authorRoleAr: "العضو المنتدب",
      authorCompany: "Qatar Tourism",
      rating: 5,
    },
  ];

  const mockMetrics = [
    { valueEn: "600K+", valueAr: "+600 ألف", labelEn: "Total Attendees", labelAr: "إجمالي الزوار" },
    { valueEn: "99.8%", valueAr: "99.8%", labelEn: "Safety Rating", labelAr: "معدل السلامة التشغيلية" },
    { valueEn: "3.2M", valueAr: "3.2 مليون", labelEn: "Social Impressions", labelAr: "الظهور الرقمي" },
    { valueEn: "14 Days", valueAr: "14 يوماً", labelEn: "Rapid Deployment", labelAr: "سرعة التنفيذ" },
  ];

  const mockGallery = [
    { url: "/gallery/1.webp", type: "IMAGE", captionEn: "Main Parade Avenue Setup", captionAr: "تجهيز مسار العرض الرئيسي" },
    { url: "/gallery/2.webp", type: "IMAGE", captionEn: "Nighttime Illumination Stage", captionAr: "إضاءة المسرح الليلي" },
  ];

  it("1. Renders Cinematic Hero with full visual hierarchy and metadata", () => {
    const html = renderToStaticMarkup(
      <CinematicCaseHero
        locale="en"
        title="Doha Balloon Parade 2022"
        clientName="Visit Qatar"
        category="Immersive Festivals"
        year={2022}
        heroImageUrl="/images/hero.webp"
        isFeatured={true}
        attraction={mockAttraction}
      />
    );

    expect(html).toContain('data-testid="cinematic-case-hero"');
    expect(html).toContain("Doha Balloon Parade 2022");
    expect(html).toContain("Visit Qatar");
    expect(html).toContain("Immersive Festivals");
    expect(html).toContain("2022");
    expect(html).toContain("/en/b2c/attractions/inflatapark-qatar");
  });

  it("2. Renders Project Identity Bar with sticky navigation and linked attraction chip", () => {
    const html = renderToStaticMarkup(
      <ProjectIdentityBar
        locale="en"
        clientName="Visit Qatar"
        category="Immersive Festivals"
        year={2022}
        isFeatured={true}
        attraction={mockAttraction}
        hasChallenge={true}
        hasSolution={true}
        hasResult={true}
        hasImpact={true}
        hasGallery={true}
        hasTeam={true}
        hasTestimonials={true}
      />
    );

    expect(html).toContain('data-testid="project-identity-bar"');
    expect(html).toContain('data-testid="identity-attraction-link"');
    expect(html).toContain('href="/en/b2c/attractions/inflatapark-qatar"');
    expect(html).toContain('data-testid="nav-link-overview"');
    expect(html).toContain('data-testid="nav-link-challenge"');
    expect(html).toContain('data-testid="nav-link-impact"');
    expect(html).toContain('data-testid="nav-link-attraction"');
    expect(html).toContain('data-testid="nav-link-gallery"');
    expect(html).toContain('data-testid="nav-link-team"');
    expect(html).toContain('data-testid="nav-link-testimonials"');
  });

  it("3. Renders Transformation Narrative with 3 Acts and hides when text is empty", () => {
    const html = renderToStaticMarkup(
      <TransformationNarrative
        locale="en"
        challengeText="High wind conditions along the Doha Corniche required specialized ballast engineering."
        solutionText="Custom aerodynamics modeling and high-capacity tethering systems developed in-house."
        resultText="Flawless 3-day execution with zero safety incidents and over 600,000 live spectators."
        heroImageUrl="/images/hero.webp"
        galleryMedia={mockGallery}
      />
    );

    expect(html).toContain('data-testid="transformation-narrative-section"');
    expect(html).toContain('data-testid="narrative-act-challenge"');
    expect(html).toContain('data-testid="narrative-act-solution"');
    expect(html).toContain('data-testid="narrative-act-result"');
    expect(html).toContain("High wind conditions along the Doha Corniche");

    // Verify empty state hiding
    const emptyHtml = renderToStaticMarkup(
      <TransformationNarrative
        locale="en"
        challengeText={null}
        solutionText={null}
        resultText={null}
      />
    );
    expect(emptyHtml).toBe("");
  });

  it("4. Renders Impact Metrics with 4 desktop columns, and hides when empty", () => {
    const html = renderToStaticMarkup(
      <ImpactMetricsGrid locale="en" metrics={mockMetrics} />
    );

    expect(html).toContain('data-testid="impact-metrics-section"');
    expect(html).toContain('data-testid="metric-card-0"');
    expect(html).toContain('data-testid="metric-card-3"');
    expect(html).toContain("Total Attendees");

    // Verify empty state hiding
    const emptyHtml = renderToStaticMarkup(<ImpactMetricsGrid locale="en" metrics={[]} />);
    expect(emptyHtml).toBe("");
  });

  it("5. Renders Linked Attraction feature card linking to /b2c/attractions/[slug]", () => {
    const html = renderToStaticMarkup(
      <LinkedAttractionFeature locale="en" attraction={mockAttraction} />
    );

    expect(html).toContain('data-testid="linked-attraction-feature"');
    expect(html).toContain("InflataPark Qatar");
    expect(html).toContain('data-testid="explore-experience-link"');
    expect(html).toContain('href="/en/b2c/attractions/inflatapark-qatar"');

    // Verify empty state hiding
    const emptyHtml = renderToStaticMarkup(<LinkedAttractionFeature locale="en" attraction={null} />);
    expect(emptyHtml).toBe("");
  });

  it("6. Renders Visual Gallery with first full width and modal triggers", () => {
    const html = renderToStaticMarkup(
      <CaseGalleryJourney locale="en" gallery={mockGallery} />
    );

    expect(html).toContain('data-testid="case-gallery-section"');
    expect(html).toContain('data-testid="gallery-item-0"');
    expect(html).toContain('data-testid="gallery-item-1"');
    expect(html).toContain("Main Parade Avenue Setup");

    // Verify empty state hiding
    const emptyHtml = renderToStaticMarkup(<CaseGalleryJourney locale="en" gallery={[]} />);
    expect(emptyHtml).toBe("");
  });

  it("7. Renders Project Team with strict email redaction", () => {
    const html = renderToStaticMarkup(
      <ProjectTeamSection locale="en" teamMembers={mockTeamMembers} />
    );

    expect(html).toContain('data-testid="project-team-section"');
    expect(html).toContain("Tariq Al-Mansoor");
    expect(html).toContain("Lead Experience Architect");

    // CRITICAL SECURITY: Ensure email is never rendered in output HTML
    expect(html).not.toContain("tariq.secret@e3.qa");

    // Verify empty state hiding
    const emptyHtml = renderToStaticMarkup(<ProjectTeamSection locale="en" teamMembers={[]} />);
    expect(emptyHtml).toBe("");
  });

  it("8. Renders Client Testimonials and Next Project Transition", () => {
    const testimonialsHtml = renderToStaticMarkup(
      <CaseTestimonialsSection locale="en" testimonials={mockTestimonials} />
    );
    expect(testimonialsHtml).toContain('data-testid="case-testimonials-section"');
    expect(testimonialsHtml).toContain("Sheikh Khalid Al-Thani");
    expect(testimonialsHtml).toContain("Qatar Tourism");

    const nextProjectHtml = renderToStaticMarkup(
      <NextProjectTransition
        locale="en"
        nextProject={{
          id: "next-1",
          slug: "lusail-winter-wonderland-2023",
          titleEn: "Lusail Winter Wonderland",
          titleAr: "لوسيل ونتر وندرلاند",
          clientName: "Estithmar Holding",
          year: 2023,
          thumbnailUrl: "/images/lusail-thumb.webp",
        }}
      />
    );
    expect(nextProjectHtml).toContain('data-testid="next-project-transition"');
    expect(nextProjectHtml).toContain("Lusail Winter Wonderland");
    expect(nextProjectHtml).toContain("/en/b2b/cases/lusail-winter-wonderland-2023");
  });

  it("9. Supports Arabic RTL layout and bilingual localization correctly", () => {
    const html = renderToStaticMarkup(
      <CinematicCaseHero
        locale="ar"
        title="موكب الدوحة للمناطيد 2022"
        clientName="قطر للسياحة"
        category="المهرجانات الترفيهية"
        year={2022}
        heroImageUrl="/images/hero.webp"
        isFeatured={true}
        attraction={mockAttraction}
      />
    );

    expect(html).toContain('dir="rtl"');
    expect(html).toContain("موكب الدوحة للمناطيد 2022");
    expect(html).toContain("قطر للسياحة");
    expect(html).toContain("إنفلاتابارك قطر");
  });
});
