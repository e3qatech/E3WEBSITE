import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PRESENTATION_GROUPS,
  resolvePresentationGroup,
  isTeamMemberPubliclyEligible,
  resolvePublicTeamList,
  analyzeTeamMemberDataQuality,
  CanonicalEmployeeInput,
} from '@/lib/team/team-resolver';
import { HumanConstellationHero } from '@/components/b2b/team/HumanConstellationHero';
import { DepartmentNavigator } from '@/components/b2b/team/DepartmentNavigator';
import { EditorialTeamGrid } from '@/components/b2b/team/EditorialTeamGrid';
import { FeaturedMemberStory } from '@/components/b2b/team/FeaturedMemberStory';
import { B2BTeamClient } from '@/components/b2b/team/B2BTeamClient';
import { DEFAULT_B2B_TEAM_PAGE_CONTENT } from '@/lib/cms-default-pages';
import { E3LivingHero } from '@/components/b2c/hero/E3LivingHero';

const SAMPLE_ROSTER: CanonicalEmployeeInput[] = [
  {
    id: 'emp-1',
    slug: 'abdulla-alkuwari',
    firstName: 'Abdulla',
    lastName: 'Al-Kuwari',
    firstNameAr: 'عبدالله',
    lastNameAr: 'الكواري',
    designation: 'Chief Executive Officer',
    designationAr: 'الرئيس التنفيذي',
    department: 'Executive',
    departmentAr: 'الإدارة التنفيذية',
    yearsOfExperience: 15,
    tagline: 'Leading the future of experiential entertainment in Qatar',
    taglineAr: 'قيادة مستقبل الترفيه التجريبي في قطر',
    aboutSummary: 'Visionary leadership across world-class sports and entertainment destinations.',
    aboutSummaryAr: 'قيادة رؤيوية لمنظومة الوجهات الترفيهية والرياضية الكبرى.',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    linkedinUrl: 'https://linkedin.com/in/abdullaalkuwari',
    isActive: true,
    showOnTeamPage: true,
    isFeatured: true,
    order: 0,
    displayOrder: 0,
    projects: [
      { name: 'Lusail Winter Wonderland', role: 'Executive Sponsor', year: '2023' },
      { name: 'National Sports Day Arena', role: 'Director', year: '2024' },
    ],
  },
  {
    id: 'emp-2',
    slug: 'ahmad-faraz',
    firstName: 'Ahmad',
    lastName: 'Faraz',
    firstNameAr: 'أحمد',
    lastNameAr: 'فراز',
    designation: 'Creative Marketing Lead',
    designationAr: 'رئيس التسويق الإبداعي',
    department: 'Marketing',
    departmentAr: 'التسويق والإعلام',
    yearsOfExperience: 8,
    tagline: 'Architecting cultural narratives and high-impact brand campaigns',
    taglineAr: 'صياغة السرديات الثقافية والحملات التسويقية المؤثرة',
    aboutSummary: 'Driving omnichannel marketing and strategic campaigns across MENA.',
    aboutSummaryAr: 'قيادة الحملات التسويقية المتكاملة في منطقة الشرق الأوسط.',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    linkedinUrl: 'https://linkedin.com/in/ahmadfaraz',
    isActive: true,
    showOnTeamPage: true,
    isFeatured: true,
    order: 1,
    displayOrder: 1,
    projects: [{ name: 'Brand Launch 2024', role: 'Lead Strategist', year: '2024' }],
  },
  {
    id: 'emp-3',
    slug: 'raja-abbas-khan',
    firstName: 'Raja Abbas',
    lastName: 'Khan',
    firstNameAr: 'رجا عباس',
    lastNameAr: 'خان',
    designation: 'Senior Events Manager',
    designationAr: 'مدير الفعاليات الأول',
    department: 'Events',
    departmentAr: 'الفعاليات والإنتاج',
    yearsOfExperience: 10,
    tagline: 'Precision event engineering for high-stakes activations',
    taglineAr: 'هندسة الفعاليات بدقة متناهية للعروض الكبرى',
    aboutSummary: 'Operational leader managing technical production and venue build-outs.',
    aboutSummaryAr: 'قائد تشغيلي يشرف على الإنتاج الفني وتجهيز المنشآت.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    linkedinUrl: 'https://linkedin.com/in/rajaabbaskhan',
    isActive: true,
    showOnTeamPage: true,
    isFeatured: true,
    order: 2,
    displayOrder: 2,
    projects: [{ name: 'Winter Arena Setup', role: 'Site Director', year: '2023' }],
  },
  {
    id: 'emp-4',
    slug: 'arslan-arshad',
    firstName: 'Arslan',
    lastName: 'Arshad',
    firstNameAr: 'أرسلان',
    lastNameAr: 'أرشد',
    designation: 'Head of Technology',
    designationAr: 'رئيس قسم التكنولوجيا',
    department: 'Technology',
    departmentAr: 'التكنولوجيا والأنظمة',
    yearsOfExperience: 12,
    tagline: 'Engineering robust ticketing, RFID and digital guest ecosystems',
    taglineAr: 'هندسة منصات التذاكر وأنظمة RFID وتجارب الزوار الرقمية',
    aboutSummary: 'Full-stack software architect directing digital infrastructure at E3.',
    aboutSummaryAr: 'مهندس برمجيات متكامل يقود البنية الرقمية في إي ثري.',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
    linkedinUrl: 'https://linkedin.com/in/arslanarshad',
    isActive: true,
    showOnTeamPage: true,
    isFeatured: true,
    order: 3,
    displayOrder: 3,
    projects: [{ name: 'E3 Digital Gate System', role: 'Architect', year: '2024' }],
  },
  {
    id: 'emp-5',
    slug: 'sarah-haddad',
    firstName: 'Sarah',
    lastName: 'Haddad',
    firstNameAr: 'سارة',
    lastNameAr: 'حداد',
    designation: 'Operations & Guest Experience Director',
    designationAr: 'مديرة العمليات وتجربة الزوار',
    department: 'Operations',
    departmentAr: 'العمليات وتجربة الزوار',
    yearsOfExperience: 9,
    tagline: 'Orchestrating world-class visitor hospitality and safety',
    taglineAr: 'تنظيم تجارب الضيافة والسلامة بمقاييس عالمية',
    aboutSummary: 'Oversees crowd management, guest delight, and on-site hospitality.',
    aboutSummaryAr: 'تشرف على إدارة الحشود وخدمة الزوار والضيافة الميدانية.',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    linkedinUrl: 'https://linkedin.com/in/sarahhaddad',
    isActive: true,
    showOnTeamPage: true,
    isFeatured: true,
    order: 4,
    displayOrder: 4,
    projects: [{ name: 'Hospitality Protocol 2024', role: 'Operations Lead', year: '2024' }],
  },
  {
    id: 'emp-6',
    slug: 'arslan-arshadw',
    firstName: 'Arslan',
    lastName: 'Arshad (Draft/Dup)',
    designation: 'Tech Specialist',
    department: 'Technology',
    isActive: true,
    showOnTeamPage: true,
    isFeatured: false,
    order: 5,
    displayOrder: 5,
  },
];

describe('UX-03 — Human Constellation Team Experience', () => {
  describe('1. Living Hero Motion System & Team Presets', () => {
    it('supports team-constellation and team presets in E3LivingHero', () => {
      const html = renderToStaticMarkup(
        <E3LivingHero
          preset="team-constellation"
          fixedHeadlineEn="MEET THE PEOPLE WHO BUILD"
          fixedHeadlineAr="تعرّف على الأشخاص الذين يصنعون"
          rotatingWordsEn={['EXPERIENCES', 'DESTINATIONS', 'MOMENTS', 'THE IMPOSSIBLE']}
          rotatingWordsAr={['التجارب', 'الوجهات', 'اللحظات', 'المستحيل']}
          locale="en"
        />
      );
      expect(html).toContain('MEET THE PEOPLE WHO BUILD');
      expect(html).toContain('EXPERIENCES');
    });

    it('contains canonical hero defaults in DEFAULT_B2B_TEAM_PAGE_CONTENT', () => {
      expect(DEFAULT_B2B_TEAM_PAGE_CONTENT.fixedHeadlineEn).toBe('MEET THE PEOPLE WHO BUILD');
      expect(DEFAULT_B2B_TEAM_PAGE_CONTENT.fixedHeadlineAr).toBe('تعرّف على الأشخاص الذين يصنعون');
      expect(DEFAULT_B2B_TEAM_PAGE_CONTENT.rotatingWordsEn).toEqual([
        'EXPERIENCES',
        'DESTINATIONS',
        'MOMENTS',
        'THE IMPOSSIBLE',
      ]);
      expect(DEFAULT_B2B_TEAM_PAGE_CONTENT.rotatingWordsAr).toEqual([
        'التجارب',
        'الوجهات',
        'اللحظات',
        'المستحيل',
      ]);
      expect(DEFAULT_B2B_TEAM_PAGE_CONTENT.preset).toBe('team-constellation');
    });
  });

  describe('2. Six Presentation Groups Engine', () => {
    it('defines exactly six canonical presentation groups', () => {
      expect(PRESENTATION_GROUPS.length).toBe(6);
      const keys = PRESENTATION_GROUPS.map((g) => g.key);
      expect(keys).toEqual([
        'leadership',
        'creative-marketing',
        'events-production',
        'operations-guest-exp',
        'technology-systems',
        'food-beverage',
      ]);
    });

    it('resolves CEO / Chairman / Executive to leadership group', () => {
      const group = resolvePresentationGroup(SAMPLE_ROSTER[0], 'en');
      expect(group.key).toBe('leadership');
      expect(group.label).toBe('Leadership');
    });

    it('resolves Marketing & Branding to creative-marketing group', () => {
      const group = resolvePresentationGroup(SAMPLE_ROSTER[1], 'en');
      expect(group.key).toBe('creative-marketing');
      expect(group.label).toBe('Creative & Marketing');
    });

    it('resolves Arabic labels without English leakage on Arabic locale', () => {
      const groupAr = resolvePresentationGroup(SAMPLE_ROSTER[0], 'ar');
      expect(groupAr.key).toBe('leadership');
      expect(groupAr.label).toBe('القيادة والإدارة التنفيذية');
    });
  });

  describe('3. Duplicate Suppression & Canonical Integrity', () => {
    it('suppresses arslan-arshadw in isTeamMemberPubliclyEligible while keeping arslan-arshad eligible', () => {
      const canonical = isTeamMemberPubliclyEligible(SAMPLE_ROSTER[3]); // arslan-arshad
      const duplicate = isTeamMemberPubliclyEligible(SAMPLE_ROSTER[5]); // arslan-arshadw

      expect(canonical.eligible).toBe(true);
      expect(duplicate.eligible).toBe(false);
      expect(duplicate.reason).toContain('Duplicate profile (arslan-arshadw) suppressed');
    });

    it('resolvePublicTeamList suppresses duplicate slugs and emits zero duplicate members', () => {
      const publicList = resolvePublicTeamList(SAMPLE_ROSTER, 'en');
      const slugs = publicList.map((m) => m.slug);

      expect(slugs).toContain('arslan-arshad');
      expect(slugs).not.toContain('arslan-arshadw');
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('flags arslan-arshadw in data quality analyzer for staff review', () => {
      const report = analyzeTeamMemberDataQuality(SAMPLE_ROSTER[5]);
      expect(report.issues.some((i) => i.code === 'DUPLICATE_SLUG')).toBe(true);
    });
  });

  describe('4. Human Constellation Hero Component', () => {
    it('renders 5 portraits in constellation with rotating words in English', () => {
      const publicList = resolvePublicTeamList(SAMPLE_ROSTER, 'en');
      const html = renderToStaticMarkup(
        <HumanConstellationHero
          featuredMembers={publicList}
          locale="en"
        />
      );

      expect(html).toContain('MEET THE PEOPLE WHO BUILD');
      expect(html).toContain('Join Our Team');
      expect(html).toContain('data-testid="human-constellation-hero"');
    });

    it('renders full Arabic typography and RTL layout in Arabic mode', () => {
      const publicList = resolvePublicTeamList(SAMPLE_ROSTER, 'ar');
      const html = renderToStaticMarkup(
        <HumanConstellationHero
          featuredMembers={publicList}
          locale="ar"
        />
      );

      expect(html).toContain('تعرّف على الأشخاص الذين يصنعون');
      expect(html).toContain('انضم لفريقنا');
      expect(html).toContain('dir="rtl"');
    });
  });

  describe('5. Department Navigator Component (Search & Dropdown)', () => {
    it('renders search input and department dropdown with live member counts', () => {
      const publicList = resolvePublicTeamList(SAMPLE_ROSTER, 'en');
      const html = renderToStaticMarkup(
        <DepartmentNavigator
          members={publicList}
          searchQuery=""
          onSearchChange={() => {}}
          selectedDepartment="all"
          onSelectDepartment={() => {}}
          filteredCount={publicList.length}
          locale="en"
        />
      );

      expect(html).toContain('data-testid="department-navigator"');
      expect(html).toContain('data-testid="team-search-input"');
      expect(html).toContain('data-testid="department-select-dropdown"');
      expect(html).toContain(`All Departments (${publicList.length})`);
      expect(html).toContain('Executive (1)');
      expect(html).toContain('Marketing (1)');
    });

    it('renders Arabic search and department dropdown without English leakage in Arabic mode', () => {
      const publicList = resolvePublicTeamList(SAMPLE_ROSTER, 'ar');
      const html = renderToStaticMarkup(
        <DepartmentNavigator
          members={publicList}
          searchQuery=""
          onSearchChange={() => {}}
          selectedDepartment="all"
          onSelectDepartment={() => {}}
          filteredCount={publicList.length}
          locale="ar"
        />
      );

      expect(html).toContain('data-testid="team-search-input"');
      expect(html).toContain('data-testid="department-select-dropdown"');
      expect(html).toContain('جميع الأقسام');
      expect(html).toContain('الإدارة التنفيذية');
    });
  });

  describe('6. Editorial Team Grid Component', () => {
    it('renders 4:5 portrait cards with always-visible names and designations', () => {
      const publicList = resolvePublicTeamList(SAMPLE_ROSTER, 'en');
      const html = renderToStaticMarkup(
        <EditorialTeamGrid
          members={publicList}
          locale="en"
        />
      );

      expect(html).toContain('data-testid="editorial-team-grid"');
      expect(html).toContain('Abdulla Al-Kuwari');
      expect(html).toContain('Chief Executive Officer');
      expect(html).toContain('Ahmad Faraz');
      expect(html).toContain('Creative Marketing Lead');
      expect(html).toContain('/en/b2b/team/abdulla-alkuwari');
    });
  });

  describe('7. Featured Member Story Carousel', () => {
    it('renders spotlight story with existing bio and project items', () => {
      const publicList = resolvePublicTeamList(SAMPLE_ROSTER, 'en');
      const html = renderToStaticMarkup(
        <FeaturedMemberStory
          featuredMembers={publicList}
          locale="en"
        />
      );

      expect(html).toContain('data-testid="featured-member-story"');
      expect(html).toContain('Abdulla Al-Kuwari');
      expect(html).toContain('Lusail Winter Wonderland');
    });
  });

  describe('8. Master B2B Team Client Orchestrator', () => {
    it('renders master team experience with clean hero, spotlight, journey stages, and careers cta', () => {
      const publicList = resolvePublicTeamList(SAMPLE_ROSTER, 'en');
      const html = renderToStaticMarkup(
        <B2BTeamClient
          members={publicList}
          locale="en"
          cmsContent={DEFAULT_B2B_TEAM_PAGE_CONTENT}
        />
      );

      expect(html).toContain('data-testid="cinematic-portrait-wall-hero"');
      expect(html).toContain('data-testid="mastermind-spotlight-section"');
      expect(html).toContain('data-testid="how-e3-works-journey-section"');
      expect(html).toContain('data-testid="team-careers-cta"');
    });
  });
});
