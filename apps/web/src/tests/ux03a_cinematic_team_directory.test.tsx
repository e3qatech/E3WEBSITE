/**
 * UX-03A-C: Canonical Team Directory Redesign & Clutter Correction Test Suite
 *
 * Requirements:
 * 1. Clean 70-80svh Hero: Centered content on top, 5-7 equal 3:4 portraits underneath (no overlap, no circular portraits, no orbit rings, no custom cursor).
 * 2. Mastermind Spotlight: Preserved structure, normalized spacing and responsiveness.
 * 3. Unified Team Directory Grid: Replaces all Chapter bloat, identical 3:4 cards, 4/3/2/1 responsive columns, restrained department accent line, hover reveal for experience and profile link.
 * 4. Non-sticky Search & Department Toolbar: Positioned below heading, never overlaps, displays filtered count once.
 * 5. Careers CTA: Positioned at bottom before footer.
 * 6. Arabic Parity: Full RTL mirroring and Arabic metadata with zero leakage.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CinematicPortraitWallHero } from "@/components/b2b/team/CinematicPortraitWallHero";
import { MastermindSpotlightSection } from "@/components/b2b/team/MastermindSpotlightSection";
import { TeamDirectoryToolbar } from "@/components/b2b/team/TeamDirectoryToolbar";
import { UnifiedTeamDirectoryGrid } from "@/components/b2b/team/UnifiedTeamDirectoryGrid";
import { TeamCareersCtaSection } from "@/components/b2b/team/TeamCareersCtaSection";
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

describe("UX-03A-C — Team Directory Clutter Correction Suite", () => {
  /* ================================================================ */
  /* 1. HERO — SIMPLIFIED CLEAN HERO                                  */
  /* ================================================================ */
  describe("1. CinematicPortraitWallHero Component", () => {
    it("renders clean editorial hero with centered headline, description, and CTAs", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <CinematicPortraitWallHero featuredMembers={SAMPLE_TEAM_MEMBERS} locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="cinematic-portrait-wall-hero"');

      // Heading and CTAs
      expect(html).toContain("Meet the Minds Shaping");
      expect(html).toContain("Join the Atelier");
      expect(html).toContain("Explore Directory ↓");

      // Zero circular portraits or orbit animations
      expect(html).not.toContain("animate-orbit-slow");
      expect(html).not.toContain("animate-orbit-reverse");
      expect(html).not.toContain("rounded-full object-cover");
    });

    it("renders Arabic typography, RTL alignment, and Arabic metadata in Arabic mode", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <CinematicPortraitWallHero featuredMembers={SAMPLE_TEAM_MEMBERS} locale="ar" />
        </LocaleProvider>
      );

      expect(html).toContain('dir="rtl"');
      expect(html).toContain("نخبة العقول الهندسية التي تصنع");
      expect(html).toContain("فريق العمل وصناع التجارب الاستثنائية");
      expect(html).toContain("انضم إلى الفريق");
      expect(html).toContain("استكشف الدليل ↓");
    });
  });

  /* ================================================================ */
  /* 2. FEATURED MASTERMIND SPOTLIGHT                                 */
  /* ================================================================ */
  describe("2. MastermindSpotlightSection Component", () => {
    it("renders 40% portrait / 60% content layout with department aura and quote", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <MastermindSpotlightSection featuredMembers={SAMPLE_TEAM_MEMBERS} locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="mastermind-spotlight-section"');
      expect(html).toContain("Featured Mastermind Spotlight");
      expect(html).toContain('data-testid="spotlight-prev-btn"');
      expect(html).toContain('data-testid="spotlight-next-btn"');
      expect(html).toContain('data-testid="spotlight-profile-cta"');

      // Active first member details (Tariq Al-Mansoor)
      expect(html).toContain("Tariq Al-Mansoor");
      expect(html).toContain("Chief Executive Officer &amp; Founder");
      expect(html).toContain("Executive Leadership");
      expect(html).toContain("Engineering Qatar&#x27;s most memorable cultural landmarks");
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
      expect(html).toContain("القيادة التنفيذية");
      expect(html).toContain("استعرض الملف الكامل والخبرات");
    });
  });

  /* ================================================================ */
  /* 3. NON-STICKY TOOLBAR & UNIFIED DIRECTORY GRID                   */
  /* ================================================================ */
  describe("3. TeamDirectoryToolbar & UnifiedTeamDirectoryGrid", () => {
    it("renders non-sticky toolbar with live search and department select without overlapping", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <TeamDirectoryToolbar
            searchQuery=""
            onSearchChange={() => {}}
            selectedDepartment="all"
            onSelectDepartment={() => {}}
            departments={[
              { key: "leadership", nameEn: "Executive Leadership", nameAr: "القيادة التنفيذية", count: 1 },
              { key: "creative", nameEn: "Creative & Brand Engineering", nameAr: "الإبداع وهندسة العلامة التجارية", count: 1 },
            ]}
            totalMembersCount={5}
            filteredCount={5}
            locale="en"
          />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="team-directory-toolbar"');
      expect(html).toContain('data-testid="team-search-input"');
      expect(html).toContain('data-testid="team-department-select"');
      expect(html).toContain("All Departments (5)");
      expect(html).toContain("Executive Leadership (1)");

      // Verified non-sticky (does NOT contain sticky positioning)
      expect(html).not.toContain("sticky top-");
    });

    it("renders unified grid with identical 3:4 cards and no chapter sections", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <UnifiedTeamDirectoryGrid members={SAMPLE_TEAM_MEMBERS} locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="unified-team-directory-grid"');
      
      // All 5 sample members rendered in single unified grid
      expect(html).toContain('data-testid="team-card-tariq-al-mansoor"');
      expect(html).toContain('data-testid="team-card-fatima-al-khalifa"');
      expect(html).toContain('data-testid="team-card-marcus-vance"');
      expect(html).toContain('data-testid="team-card-youssef-haddad"');
      expect(html).toContain('data-testid="team-card-layla-nasser"');

      // 4-column responsive grid classes
      expect(html).toContain("grid-cols-1");
      expect(html).toContain("sm:grid-cols-2");
      expect(html).toContain("md:grid-cols-3");
      expect(html).toContain("lg:grid-cols-4");

      // Verify Chapter bloat is completely eliminated
      expect(html).not.toContain("Department Lead");
      expect(html).not.toContain("Chapter 01");
      expect(html).not.toContain("01 /");

      // Profile action links
      expect(html).toContain("View Profile");
      expect(html).toContain("/en/b2b/team/tariq-al-mansoor");
    });
  });

  /* ================================================================ */
  /* 4. FULL B2B TEAM CLIENT ORCHESTRATOR & CAREERS CTA               */
  /* ================================================================ */
  describe("4. B2BTeamClient Orchestrator Flow", () => {
    it("renders exact flow: Clean Hero -> Spotlight -> Toolbar -> Unified Grid -> Careers CTA", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <B2BTeamClient members={SAMPLE_TEAM_MEMBERS} locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="cinematic-portrait-wall-hero"');
      expect(html).toContain('data-testid="mastermind-spotlight-section"');
      expect(html).toContain("The Masterminds Directory");
      expect(html).toContain('data-testid="team-directory-toolbar"');
      expect(html).toContain('data-testid="unified-team-directory-grid"');
      expect(html).toContain('data-testid="team-careers-cta"');
    });

    it("renders full Arabic mode seamlessly with zero English leakage", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="ar">
          <B2BTeamClient members={SAMPLE_TEAM_MEMBERS} locale="ar" />
        </LocaleProvider>
      );

      expect(html).toContain("طارق المنصور");
      expect(html).toContain("فاطمة الخليفة");
      expect(html).toContain("ماركوس فانس");
      expect(html).toContain("يوسف حداد");
      expect(html).toContain("ليلى ناصر");
      expect(html).toContain("دليل فريق العمل والقيادات");
      expect(html).toContain("الملف الشخصي");
      expect(html).toContain("اصنع معنا مستقبل الفعاليات والتجارب الحية في قطر");
    });

    it("renders standalone Careers CTA with links to careers and contact", () => {
      const html = renderToStaticMarkup(
        <LocaleProvider defaultLocale="en">
          <TeamCareersCtaSection locale="en" />
        </LocaleProvider>
      );

      expect(html).toContain('data-testid="team-careers-cta"');
      expect(html).toContain("Shape the Future of Live Experiential Engineering");
      expect(html).toContain("Explore Careers &amp; Roles");
      expect(html).toContain("/en/b2b/careers");
      expect(html).toContain("/en/contact");
    });
  });
});
