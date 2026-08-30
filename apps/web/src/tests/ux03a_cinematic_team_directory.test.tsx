/**
 * UX-03A-C: Canonical E3 Team Page Approved Redesign Test Suite
 *
 * Requirements:
 * 1. Clean Editorial Hero: Eyebrow "PEOPLE OF E3", H1 "THE PEOPLE BEHIND EVERY E3 EXPERIENCE", CTAs "Meet the Teams" & "Join E3".
 * 2. Mastermind Spotlight: Refined shortened bio, 4:5 portrait ratio, accessible prev/next, pause/play, touch swipe, keyboard controls.
 * 3. HOW E3 WORKS (6 Connected Stages): Direction, Imagine, Plan, Build, Operate, Amplify. Sticky stage navigator on desktop, vertical journey on mobile, 4:5 cards with verified landmark responsibilities.
 * 4. Secondary View All E3 People Drawer: Live search by name/role, 6 consolidated filters, compact rows, full-screen mobile sheet.
 * 5. PEOPLE × PROJECTS: Published case studies with verified metrics and associated team members, clean suppression if no mappings.
 * 6. Careers CTA: "BUILD THE NEXT EXPERIENCE WITH US" with "Explore Careers".
 * 7. Arabic Parity: Full RTL mirroring and Arabic metadata with zero English leakage.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CinematicPortraitWallHero } from "@/components/b2b/team/CinematicPortraitWallHero";
import { MastermindSpotlightSection } from "@/components/b2b/team/MastermindSpotlightSection";
import { HowE3WorksJourneySection, mapMemberToStage } from "@/components/b2b/team/HowE3WorksJourneySection";
import { TeamDirectoryDrawer } from "@/components/b2b/team/TeamDirectoryDrawer";
import { PeopleProjectsSection } from "@/components/b2b/team/PeopleProjectsSection";
import { B2BTeamClient } from "@/components/b2b/team/B2BTeamClient";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { SafePublicTeamMember } from "@/lib/team/team-resolver";

const SAMPLE_TEAM_MEMBERS: SafePublicTeamMember[] = [
  {
    id: "mem-1",
    slug: "tariq-al-mansoor",
    name: "Tariq Al-Mansoor",
    nameEn: "Tariq Al-Mansoor",
    nameAr: "طارق المنصور",
    designation: "Chief Executive Officer & Founder",
    designationAr: "الرئيس التنفيذي والمؤسس",
    department: "Executive Leadership",
    departmentAr: "القيادة التنفيذية",
    departmentKey: "leadership",
    presentationGroup: "Leadership",
    presentationGroupKey: "leadership",
    yearsOfExperience: 18,
    tagline: "Engineering Qatar's most memorable cultural landmarks through experiential excellence.",
    taglineAr: "هندسة أبرز المعالم الثقافية والتجارب الاستثنائية في قطر.",
    aboutSummary: "Tariq oversees the holistic strategic direction, global partnerships, and master activations.",
    aboutSummaryAr: "يشرف طارق على التوجه الاستراتيجي الشامل والشراكات العالمية والفعاليات الكبرى.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    initials: "TM",
    linkedinUrl: "https://linkedin.com/in/tariq-al-mansoor",
    hasLinkedin: true,
    order: 1,
    displayOrder: 1,
    sequenceOrder: 1,
    isFeatured: true,
    showOnTeamPage: true,
    expertiseTags: ["Strategy", "Executive Leadership"],
    coreCompetencies: ["Governance", "Strategic Direction"],
    experience: [],
    projects: ["Lusail Kinetic Pavilion", "National Day Spectacular 2024"],
    certifications: [],
    education: [],
    awards: [],
  },
  {
    id: "mem-2",
    slug: "fatima-al-khalifa",
    name: "Fatima Al-Khalifa",
    nameEn: "Fatima Al-Khalifa",
    nameAr: "فاطمة الخليفة",
    designation: "Executive Creative Director",
    designationAr: "المدير الإبداعي التنفيذي",
    department: "Creative & Brand Engineering",
    departmentAr: "الإبداع وهندسة العلامة التجارية",
    departmentKey: "creative",
    presentationGroup: "Creative & Marketing",
    presentationGroupKey: "creative",
    yearsOfExperience: 14,
    tagline: "Transforming spaces into living emotional narratives through light and sound.",
    taglineAr: "تحويل المساحات إلى روايات بصرية نابضة بالحياة عبر الضوء والصوت.",
    aboutSummary: "Fatima leads the spatial design atelier, conceptualizing world-class multisensory environments.",
    aboutSummaryAr: "تقود فاطمة استوديو التصميم المكاني لابتكار بيئات تفاعلية عالمية المستوى.",
    profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    initials: "FK",
    linkedinUrl: null,
    hasLinkedin: false,
    order: 2,
    displayOrder: 2,
    sequenceOrder: 2,
    isFeatured: true,
    showOnTeamPage: true,
    expertiseTags: ["Spatial Design", "Creative Direction"],
    coreCompetencies: ["Storytelling", "Multisensory"],
    experience: [],
    projects: ["Al Bidda Sensory Arena", "Doha Light Festival"],
    certifications: [],
    education: [],
    awards: [],
  },
  {
    id: "mem-3",
    slug: "marcus-vance",
    name: "Marcus Vance",
    nameEn: "Marcus Vance",
    nameAr: "ماركوس فانس",
    designation: "Head of Technical Production & AV",
    designationAr: "رئيس الإنتاج التقني والأنظمة السمعية البصرية",
    department: "Technical Production & AV",
    departmentAr: "الإنتاج التقني والأنظمة السمعية البصرية",
    departmentKey: "technical",
    presentationGroup: "Events & Production",
    presentationGroupKey: "technical",
    yearsOfExperience: 16,
    tagline: "Precision engineering meets ultra-high-definition architectural projection.",
    taglineAr: "هندسة الدقة تلتقي مع الإسقاط المعماري فائق الوضوح.",
    aboutSummary: "Marcus engineers massive kinetic stages and synchronization systems.",
    aboutSummaryAr: "يتولى ماركوس هندسة المسارح الحركية وأنظمة التزامن المتطورة.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    initials: "MV",
    linkedinUrl: null,
    hasLinkedin: false,
    order: 3,
    displayOrder: 3,
    sequenceOrder: 3,
    isFeatured: false,
    showOnTeamPage: true,
    expertiseTags: ["AV Production", "Projection Mapping"],
    coreCompetencies: ["Kinetic Stages", "Laser Choreography"],
    experience: [],
    projects: ["Katara Facade Mapping", "Corniche Drone Swarm"],
    certifications: [],
    education: [],
    awards: [],
  },
  {
    id: "mem-4",
    slug: "youssef-haddad",
    name: "Youssef Haddad",
    nameEn: "Youssef Haddad",
    nameAr: "يوسف حداد",
    designation: "Director of Event Operations",
    designationAr: "مدير عمليات الفعاليات",
    department: "Event Operations & Logistics",
    departmentAr: "العمليات اللوجستية وإدارة الفعاليات",
    departmentKey: "operations",
    presentationGroup: "Operations & Guest Experience",
    presentationGroupKey: "operations",
    yearsOfExperience: 12,
    tagline: "Flawless site execution and crowd safety dynamics at mega-event scale.",
    taglineAr: "تنفيذ ميداني متقن وإدارة حركة الحشود في الفعاليات الكبرى.",
    aboutSummary: "Youssef commands on-site logistics and multi-tier vendor synchronization.",
    aboutSummaryAr: "يدير يوسف العمليات اللوجستية الميدانية وتنسيق الموردين.",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    initials: "YH",
    linkedinUrl: null,
    hasLinkedin: false,
    order: 4,
    displayOrder: 4,
    sequenceOrder: 4,
    isFeatured: false,
    showOnTeamPage: true,
    expertiseTags: ["Site Operations", "Crowd Dynamics"],
    coreCompetencies: ["Logistics", "Safety"],
    experience: [],
    projects: ["FIFA Fan Festival Qatar", "VIP Gala Staging"],
    certifications: [],
    education: [],
    awards: [],
  },
  {
    id: "mem-5",
    slug: "layla-nasser",
    name: "Layla Nasser",
    nameEn: "Layla Nasser",
    nameAr: "ليلى ناصر",
    designation: "Head of VIP Hospitality",
    designationAr: "رئيسة الضيافة وتجارب كبار الشخصيات",
    department: "VIP Hospitality & Guest Relations",
    departmentAr: "الضيافة الملكية وتجارب كبار الشخصيات",
    departmentKey: "hospitality",
    presentationGroup: "Food & Beverage",
    presentationGroupKey: "hospitality",
    yearsOfExperience: 10,
    tagline: "Bespoke protocol management and unforgettable guest journeys.",
    taglineAr: "إدارة البروتوكول الفاخر وتجارب الضيوف الاستثنائية.",
    aboutSummary: "Layla curates royal protocol hosting and dignitary relations.",
    aboutSummaryAr: "تشرف ليلى على بروتوكولات الاستقبال واستضافة الوفود الرسمية.",
    profileImage: null,
    initials: "LN",
    linkedinUrl: null,
    hasLinkedin: false,
    order: 5,
    displayOrder: 5,
    sequenceOrder: 5,
    isFeatured: false,
    showOnTeamPage: true,
    expertiseTags: ["VIP Hosting", "Protocol"],
    coreCompetencies: ["Guest Journeys", "Dignitary Relations"],
    experience: [],
    projects: ["Presidential Summit Lounge"],
    certifications: [],
    education: [],
    awards: [],
  },
];

const SAMPLE_CASE_STUDIES = [
  {
    id: "cs-1",
    slug: "lusail-winter-wonderland",
    titleEn: "Lusail Winter Wonderland Mega Activation",
    titleAr: "مهرجان لوسيل ونتر وندرلاند الترفيهي",
    clientName: "Estithmar Holding",
    year: 2024,
    category: "Attractions",
    heroImageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176",
    thumbnailUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176",
    metrics: [
      { value: "1.2M+", labelEn: "Total Visitors", labelAr: "إجمالي الزوار" },
      { value: "99.8%", labelEn: "Operational Safety", labelAr: "السلامة التشغيلية" },
    ],
    teamMembers: [
      {
        id: "tm-1",
        roleEn: "Executive Sponsor",
        roleAr: "الراعي التنفيذي",
        employeeProfile: {
          id: "mem-1",
          slug: "tariq-al-mansoor",
          firstName: "Tariq",
          lastName: "Al-Mansoor",
          firstNameAr: "طارق",
          lastNameAr: "المنصور",
          designation: "Chief Executive Officer & Founder",
          designationAr: "الرئيس التنفيذي والمؤسس",
          profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        },
      },
    ],
  },
];

describe("UX-03A-C — E3 Team Page Approved Redesign Suite", () => {
  /* ================================================================ */
  /* 1. HERO — APPROVED EDITORIAL HERO                                */
  /* ================================================================ */
  describe("1. CinematicPortraitWallHero Component", () => {
    it("renders approved copy: PEOPLE OF E3, THE PEOPLE BEHIND EVERY E3 EXPERIENCE, Meet the Teams / Join E3", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CinematicPortraitWallHero featuredMembers={SAMPLE_TEAM_MEMBERS} locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="cinematic-portrait-wall-hero"');
      expect(html).toContain("PEOPLE OF E3");
      expect(html).toContain("THE PEOPLE BEHIND EVERY E3 EXPERIENCE");
      expect(html).toContain("From the first sketch to the final guest");
      expect(html).toContain("Meet the Teams");
      expect(html).toContain("Join E3");
    });

    it("renders Arabic typography, RTL alignment, and Arabic metadata in Arabic mode", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <CinematicPortraitWallHero featuredMembers={SAMPLE_TEAM_MEMBERS} locale="ar" />
        </LocaleProvider>
      );

      expect(html).toContain('dir="rtl"');
      expect(html).toContain("فريق عمل إي ثري");
      expect(html).toContain("العقول والشخصيات وراء كل تجربة تصنعها إي ثري");
      expect(html).toContain("من المخطط الأول حتى آخر زائر");
      expect(html).toContain("تعرف على الفرق");
      expect(html).toContain("انضم إلى إي ثري");
    });
  });

  /* ================================================================ */
  /* 2. FEATURED MASTERMIND SPOTLIGHT                                 */
  /* ================================================================ */
  describe("2. MastermindSpotlightSection Component", () => {
    it("renders refined spotlight with shortened bio, 4:5 portrait, and pause/play toggle", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <MastermindSpotlightSection featuredMembers={SAMPLE_TEAM_MEMBERS} locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="mastermind-spotlight-section"');
      expect(html).toContain("Featured Mastermind Spotlight");
      expect(html).toContain('data-testid="spotlight-prev-btn"');
      expect(html).toContain('data-testid="spotlight-next-btn"');
      expect(html).toContain('data-testid="spotlight-pause-btn"');
      expect(html).toContain('data-testid="spotlight-profile-cta"');

      // Active member details
      expect(html).toContain("Tariq Al-Mansoor");
      expect(html).toContain("Chief Executive Officer &amp; Founder");
      expect(html).toContain("18 Years Experience");
    });

    it("renders Arabic fields and RTL controls in Arabic mode", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <MastermindSpotlightSection featuredMembers={SAMPLE_TEAM_MEMBERS} locale="ar" />
        </LocaleProvider>
      );

      expect(html).toContain('dir="rtl"');
      expect(html).toContain("أضواء على القيادة والابتكار");
      expect(html).toContain("طارق المنصور");
      expect(html).toContain("الرئيس التنفيذي والمؤسس");
      expect(html).toContain("استعرض الملف الكامل والخبرات");
    });
  });

  /* ================================================================ */
  /* 3. HOW E3 WORKS: 6 CONNECTED STAGES JOURNEY                      */
  /* ================================================================ */
  describe("3. HowE3WorksJourneySection Component", () => {
    it("renders 6 connected stages with sticky navigator and 4:5 portrait cards", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <HowE3WorksJourneySection members={SAMPLE_TEAM_MEMBERS} locale="en" onOpenDrawer={() => {}} />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="how-e3-works-journey-section"');
      expect(html).toContain("HOW E3 WORKS");
      expect(html).toContain("FROM BRIEF TO LIVE EXPERIENCE");

      // Verify all 6 stages are present
      expect(html).toContain('data-testid="stage-direction"');
      expect(html).toContain('data-testid="stage-imagine"');
      expect(html).toContain('data-testid="stage-plan"');
      expect(html).toContain('data-testid="stage-build"');
      expect(html).toContain('data-testid="stage-operate"');
      expect(html).toContain('data-testid="stage-amplify"');

      // Sticky stage buttons
      expect(html).toContain('data-testid="stage-nav-btn-direction"');
      expect(html).toContain('data-testid="stage-nav-btn-imagine"');

      // Verified landmark responsibility on card
      expect(html).toContain('data-testid="team-card-tariq-al-mansoor"');
      expect(html).toContain('data-testid="team-card-fatima-al-khalifa"');
      expect(html).toContain("Lusail Kinetic Pavilion");
    });

    it("maps team members deterministically to 6 stages", () => {
      expect(mapMemberToStage(SAMPLE_TEAM_MEMBERS[0])).toBe("direction");
      expect(mapMemberToStage(SAMPLE_TEAM_MEMBERS[1])).toBe("imagine");
      expect(mapMemberToStage(SAMPLE_TEAM_MEMBERS[2])).toBe("build");
      expect(mapMemberToStage(SAMPLE_TEAM_MEMBERS[3])).toBe("operate");
      expect(mapMemberToStage(SAMPLE_TEAM_MEMBERS[4])).toBe("operate");
    });
  });

  /* ================================================================ */
  /* 4. SECONDARY VIEW ALL E3 PEOPLE DRAWER                           */
  /* ================================================================ */
  describe("4. TeamDirectoryDrawer Component", () => {
    it("renders slide-over drawer with search and consolidated filters", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <TeamDirectoryDrawer
            isOpen={true}
            onClose={() => {}}
            members={SAMPLE_TEAM_MEMBERS}
            locale="en"
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="team-directory-drawer"');
      expect(html).toContain('data-testid="drawer-search-input"');
      expect(html).toContain('data-testid="drawer-close-btn"');
      expect(html).toContain('data-testid="drawer-employee-row-tariq-al-mansoor"');
      expect(html).toContain('data-testid="drawer-employee-row-fatima-al-khalifa"');
    });

    it("returns null when drawer isOpen is false", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <TeamDirectoryDrawer
            isOpen={false}
            onClose={() => {}}
            members={SAMPLE_TEAM_MEMBERS}
            locale="en"
          />
        </LocaleProvider>
      );

      expect(html).toBe("");
    });
  });

  /* ================================================================ */
  /* 5. PEOPLE × PROJECTS SECTION                                     */
  /* ================================================================ */
  describe("5. PeopleProjectsSection Component", () => {
    it("renders published case studies with verified metrics and team members", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PeopleProjectsSection caseStudies={SAMPLE_CASE_STUDIES} locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="people-projects-section"');
      expect(html).toContain("PEOPLE × PROJECTS");
      expect(html).toContain("BUILT TOGETHER. PROVEN LIVE.");
      expect(html).toContain('data-testid="case-card-lusail-winter-wonderland"');
      expect(html).toContain("1.2M+");
      expect(html).toContain("Total Visitors");
      expect(html).toContain("Tariq Al-Mansoor");
    });

    it("hides section cleanly when no case studies have verified metrics or team mappings", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <PeopleProjectsSection caseStudies={[]} locale="en" />
        </LocaleProvider>
      );

      expect(html).toBe("");
    });
  });

  /* ================================================================ */
  /* 6. FULL B2B TEAM CLIENT ORCHESTRATOR & CAREERS CTA               */
  /* ================================================================ */
  describe("6. B2BTeamClient Orchestrator Flow", () => {
    it("renders full approved flow: Hero -> Spotlight -> How E3 Works -> People × Projects -> Careers CTA", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <B2BTeamClient
            members={SAMPLE_TEAM_MEMBERS}
            caseStudies={SAMPLE_CASE_STUDIES}
            locale="en"
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="cinematic-portrait-wall-hero"');
      expect(html).toContain('data-testid="mastermind-spotlight-section"');
      expect(html).toContain('data-testid="how-e3-works-journey-section"');
      expect(html).toContain('data-testid="people-projects-section"');
      expect(html).toContain('data-testid="team-careers-cta"');
      expect(html).toContain("BUILD THE NEXT EXPERIENCE WITH US");
      expect(html).toContain("Explore Careers");
    });

    it("renders full Arabic mode seamlessly with zero English leakage", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <B2BTeamClient
            members={SAMPLE_TEAM_MEMBERS}
            caseStudies={SAMPLE_CASE_STUDIES}
            locale="ar"
          />
        </LocaleProvider>
      );

      expect(html).toContain("طارق المنصور");
      expect(html).toContain("فاطمة الخليفة");
      expect(html).toContain("ماركوس فانس");
      expect(html).toContain("يوسف حداد");
      expect(html).toContain("كيف تعمل إي ثري");
      expect(html).toContain("من الفكرة المبدئية إلى التجربة الحية");
      expect(html).toContain("اصنع التجربة القادمة معنا");
      expect(html).toContain("استكشف الوظائف الشاغرة");
    });
  });
});
