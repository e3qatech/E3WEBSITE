import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { proxy } from '../proxy';
import {
  resolvePublicTeamMember,
  isAllowlistedLatinOrNumeric,
} from '@/lib/team/team-resolver';

// 22-person roster test fixtures
const FULL_22_PERSON_ROSTER = [
  {
    id: 'cmscbl39y00008ayz90qlf3t0',
    slug: 'adil-ahmed',
    firstName: 'Adil',
    lastName: 'Ahmed',
    designation: 'Managing Director & CEO',
    department: 'Executive Management',
    isActive: true,
    order: 0,
  },
  {
    id: 'cmscbmtxu00018ayzj1dh8l1k',
    slug: 'mohammad-ali-awada',
    firstName: 'Mohammad Ali',
    lastName: 'Awada',
    designation: 'General Manager',
    department: 'Executive Management',
    isActive: true,
    order: 0,
  },
  {
    id: 'cmsd1j7vk0000hzt5zb0zaqtk',
    slug: 'raja-abbas-khan',
    firstName: 'Raja Abbas',
    lastName: 'Khan',
    designation: 'Senior Events Manager',
    department: 'Events',
    expertiseTags: ['Event Operations', 'Guest Experience', 'Logistics'],
    coreCompetencies: ['Production coordination', 'Contractor negotiation', 'Event planning'],
    isActive: true,
    order: 0,
  },
  {
    id: 'cmscbrh0200058ayz1lv7aqjr',
    slug: 'amaan-malik',
    firstName: 'Amaan',
    lastName: 'Malik',
    designation: 'AI Generalist & Senior Graphic Designer',
    department: 'Branding, Design & Marketing',
    isActive: true,
    order: 0,
  },
  {
    id: 'cmsc8edoh0000r6mpzrb4w64i',
    slug: 'mohasin-mohammadaly-parayil',
    firstName: 'Mohasin',
    lastName: 'Mohammadaly Parayil',
    designation: 'Senior 3D Visualizer',
    department: 'Design',
    isActive: true,
    order: 0,
  },
  {
    id: 'cmsednevn0001ya8dpxr5hill',
    slug: 'abdullah-al-kubaisi',
    firstName: 'Abdullah',
    lastName: 'Al Kubaisi',
    designation: 'Chairman',
    department: 'Executive',
    isActive: true,
    order: 1,
  },
  {
    id: 'cmscbp8qa00048ayzdmzo9x9j',
    slug: 'ahmad-faraz',
    firstName: 'Ahmad',
    lastName: 'Faraz',
    designation: 'Creative Marketing Lead',
    department: 'Marketing',
    tagline: 'Brand Strategist',
    aboutSummary: 'Driving marketing campaigns across MENA.',
    expertiseTags: ['Digital Campaigns', 'Brand Growth', 'Content Strategy'],
    coreCompetencies: ['Omnichannel Campaign Execution', 'Performance Marketing', 'Creative Briefing'],
    isActive: true,
    order: 1,
  },
  {
    id: 'cmsd1j8de0002hzt53lwz7zyd',
    slug: 'abdulla-alkuwari',
    firstName: 'Abdulla',
    lastName: 'Al-Kuwari',
    designation: 'Chief Executive Officer',
    department: 'Executive',
    expertiseTags: ['Executive Leadership', 'Strategic Investments', 'Global Partnerships'],
    coreCompetencies: ['Enterprise Scaling', 'Market Disruption', 'IP Licensing & Negotiation'],
    certifications: [
      { name: 'Executive Leadership Program - Harvard Business School', issuer: 'Professional Organization' },
    ],
    isActive: true,
    order: 2,
  },
  {
    id: 'cmsd1j8in0003hzt54hgeubf0',
    slug: 'sarah-haddad',
    firstName: 'Sarah',
    lastName: 'Haddad',
    designation: 'Head of Experiential Design',
    department: 'Design',
    expertiseTags: ['Experiential Design', '3D Modeling', 'Interactive Environments'],
    coreCompetencies: ['Venue Conceptualization', 'User Flow Optimization', 'Lighting & Sound Integration'],
    certifications: [
      { name: 'Autodesk Certified Professional', issuer: 'Professional Organization' },
    ],
    isActive: true,
    order: 3,
  },
  {
    id: 'cmsbu61zz0000q5psvlhv7y0g',
    slug: 'arslan-arshad',
    firstName: 'Arslan',
    lastName: 'Arshad',
    designation: 'Project & Logistics Coordinator',
    department: 'Logistics',
    isActive: true,
    order: 4,
  },
  {
    id: 'cmsbup9u20000ru2xkhymf3df',
    slug: 'asghar-bhatti',
    firstName: 'Asghar',
    lastName: 'Bhatti',
    designation: 'Site Manager - City Center',
    department: 'Operations',
    isActive: true,
    order: 5,
  },
  {
    id: 'cmsbuxulo0000ywv1ev7rxe7x',
    slug: 'quasain-ali',
    firstName: 'Quasain',
    lastName: 'Ali',
    designation: 'Logistics Operations Manager',
    department: 'Logistics',
    isActive: true,
    order: 6,
  },
  {
    id: 'cmsbvb4uz0000v09p2qedfrjl',
    slug: 'amal-jose',
    firstName: 'Amal',
    lastName: 'Jose',
    designation: 'Production Supervisor',
    department: 'Logistics & Production',
    isActive: true,
    order: 7,
  },
  {
    id: 'cmsbvg05q0001v09pbqcut7wm',
    slug: 'nicole-bernido',
    firstName: 'Nicole',
    lastName: 'Bernido',
    designation: 'Marketing & Partnerships',
    department: 'Marketing & Sales',
    isActive: true,
    order: 8,
  },
  {
    id: 'cmsbvikv00002v09pobgv5p5m',
    slug: 'rajan-pathak',
    firstName: 'Rajan',
    lastName: 'Pathak',
    designation: 'Head of Operations - FEC / IT',
    department: 'Operations / IT',
    isActive: true,
    order: 9,
  },
  {
    id: 'cmsd1j9ts000ahzt5sdwo396z',
    slug: 'mohasin-mohammadaly',
    firstName: 'Mohasin',
    lastName: 'Mohammadaly Parayil',
    designation: '3D Visualizer',
    department: 'Operations',
    expertiseTags: ['3D visualization', 'Spatial design', 'Site supervision'],
    coreCompetencies: ['Spatial visualization', 'Team collaboration', 'Site coordination'],
    isActive: true,
    order: 10,
  },
  {
    id: 'cmsc8k58g0001r6mpbyq2wm7v',
    slug: 'waqar-asghar',
    firstName: 'Waqar',
    lastName: 'Asghar',
    designation: 'Event Supervisor',
    department: 'Operations',
    isActive: true,
    order: 11,
  },
  {
    id: 'cmsc8n8tj0002r6mptdhr2czo',
    slug: 'ebrahim-karolia',
    firstName: 'Ebrahim',
    lastName: 'Karolia',
    designation: 'Project Manager',
    department: 'Events',
    isActive: true,
    order: 12,
  },
  {
    id: 'cmsc8weug0003r6mpl9z3vr8o',
    slug: 'muhammad-izaan-shahid',
    firstName: 'Muhammad',
    lastName: 'Izaan Shahid',
    designation: 'Software Engineer',
    department: 'IT',
    isActive: true,
    order: 13,
  },
  {
    id: 'cmsc9lauh0000p651qyrt89l8',
    slug: 'marcialou-macatangay',
    firstName: 'Marcialou',
    lastName: 'M. Macatangay',
    designation: 'Events & Entertainment Coordinator',
    department: 'Events & Entertainment',
    isActive: true,
    order: 14,
  },
  {
    id: 'cmscb4ii30000f39ywcvf739z',
    slug: 'lucian-moldovan',
    firstName: 'Lucian',
    lastName: 'Moldovan',
    designation: 'Operations Manager',
    department: 'Operations & Guest Experience',
    isActive: true,
    order: 15,
  },
  {
    id: 'cmscb8zng0001f39y8l9hpfq5',
    slug: 'ruben-yaralyan',
    firstName: 'Ruben',
    lastName: 'Yaralyan',
    designation: 'F&B Manager',
    department: 'Food & Beverage',
    isActive: true,
    order: 16,
  },
];

// DB Mock
const mocks = vi.hoisted(() => ({
  session: null as any,
  db: {
    employeeProfile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    setting: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    siteSettings: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => mocks.session),
}));

vi.mock('@/lib/db', () => ({
  default: mocks.db,
  db: mocks.db,
}));

function createMockNextRequest(urlStr: string) {
  const url = new URL(urlStr);
  return new NextRequest(url);
}

describe('QF-24-D — Non-Streamed HTTP Canonicalization & Arabic Fail-Closed Presentation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mocks.db.employeeProfile.findMany as any).mockResolvedValue(FULL_22_PERSON_ROSTER);
    (mocks.db.employeeProfile.findUnique as any).mockImplementation(({ where }: any) => {
      const match = FULL_22_PERSON_ROSTER.find((m) => m.slug === where.slug || m.id === where.id || m.id === where.slug);
      return Promise.resolve(match || null);
    });
  });

  // =========================================================================
  // 1. NON-STREAMED HTTP TRANSPORT CANONICALIZATION & 404 BOUNDARY
  // =========================================================================
  describe('1. Non-Streamed HTTP Transport Canonicalization & 404 Guard', () => {
    const ARSLAN_CUID = 'cmsbu61zz0000q5psvlhv7y0g';

    it('EN B2B legacy CUID returns real permanent redirect (HTTP 308) with Location to canonical EN B2B slug', () => {
      const req = createMockNextRequest(`https://e3.qa/en/b2b/team/${ARSLAN_CUID}`);
      const res = proxy(req);

      expect(res.status).toBe(308);
      expect(res.headers.get('location')).toBe('https://e3.qa/en/b2b/team/arslan-arshad');
    });

    it('AR B2B legacy CUID returns real permanent redirect (HTTP 308) with Location to canonical AR B2B slug', () => {
      const req = createMockNextRequest(`https://e3.qa/ar/b2b/team/${ARSLAN_CUID}`);
      const res = proxy(req);

      expect(res.status).toBe(308);
      expect(res.headers.get('location')).toBe('https://e3.qa/ar/b2b/team/arslan-arshad');
    });

    it('EN B2C legacy CUID returns real permanent redirect (HTTP 308) with Location to canonical EN B2C slug', () => {
      const req = createMockNextRequest(`https://e3.qa/en/b2c/team/${ARSLAN_CUID}`);
      const res = proxy(req);

      expect(res.status).toBe(308);
      expect(res.headers.get('location')).toBe('https://e3.qa/en/b2c/team/arslan-arshad');
    });

    it('AR B2C legacy CUID returns real permanent redirect (HTTP 308) with Location to canonical AR B2C slug', () => {
      const req = createMockNextRequest(`https://e3.qa/ar/b2c/team/${ARSLAN_CUID}`);
      const res = proxy(req);

      expect(res.status).toBe(308);
      expect(res.headers.get('location')).toBe('https://e3.qa/ar/b2c/team/arslan-arshad');
    });

    it('Unknown, inactive, or malformed identifiers return actual HTTP 404 across EN/AR B2B/B2C', () => {
      const unknownRoutes = [
        'https://e3.qa/en/b2b/team/unknown-slug-xyz',
        'https://e3.qa/ar/b2b/team/unknown-slug-xyz',
        'https://e3.qa/en/b2c/team/unknown-slug-xyz',
        'https://e3.qa/ar/b2c/team/unknown-slug-xyz',
        'https://e3.qa/en/b2b/team/draft-intern-999',
        'https://e3.qa/ar/b2c/team/malformed!slug',
      ];

      for (const url of unknownRoutes) {
        const req = createMockNextRequest(url);
        const res = proxy(req);
        expect(res.status).toBe(404);
      }
    });

    it('Canonical eligible slugs pass through for server rendering (HTTP 200)', () => {
      const canonicalRoutes = [
        'https://e3.qa/en/b2b/team/arslan-arshad',
        'https://e3.qa/ar/b2b/team/arslan-arshad',
        'https://e3.qa/en/b2c/team/sarah-haddad',
        'https://e3.qa/ar/b2c/team/sarah-haddad',
      ];

      for (const url of canonicalRoutes) {
        const req = createMockNextRequest(url);
        const res = proxy(req);
        // Proxy passes through (NextResponse.next())
        expect(res.status).toBe(200);
      }
    });
  });

  // =========================================================================
  // 2. ARABIC FAIL-CLOSED NESTED PRESENTATION FIXTURES
  // =========================================================================
  describe('2. Arabic Fail-Closed Nested Presentation Fixtures', () => {
    it('Abdulla Al-Kuwari fixture: Enterprise Scaling, Market Disruption, IP Licensing are localized in Arabic without English residue', () => {
      const raw = FULL_22_PERSON_ROSTER.find((m) => m.slug === 'abdulla-alkuwari')!;
      const resolvedAr = resolvePublicTeamMember(raw, 'ar');

      expect(resolvedAr.name).toBe('عبدالله الكواري');
      expect(resolvedAr.designation).toBe('الرئيس التنفيذي');

      // Core Competencies are cleanly in Arabic
      expect(resolvedAr.coreCompetencies).toContain('توسيع وتنمية الشركات الكبرى');
      expect(resolvedAr.coreCompetencies).toContain('ابتكار ونقلة نوعية في السوق');
      expect(resolvedAr.coreCompetencies).toContain('ترخيص الملكية الفكرية والتفاوض');

      // Zero English residue in competencies or tags
      for (const comp of resolvedAr.coreCompetencies) {
        expect(/^[A-Za-z\s]+$/.test(comp) && !isAllowlistedLatinOrNumeric(comp)).toBe(false);
      }
      for (const tag of resolvedAr.expertiseTags) {
        expect(/^[A-Za-z\s]+$/.test(tag) && !isAllowlistedLatinOrNumeric(tag)).toBe(false);
      }

      // Certifications
      expect(resolvedAr.certifications[0].name).toContain('كلية هارفارد للأعمال');
      expect(resolvedAr.certifications[0].issuer).toBe('هيئة مهنية معتمدة');
    });

    it('Sarah Haddad fixture: Venue Conceptualization, User Flow, Lighting & Sound are localized in Arabic without English residue', () => {
      const raw = FULL_22_PERSON_ROSTER.find((m) => m.slug === 'sarah-haddad')!;
      const resolvedAr = resolvePublicTeamMember(raw, 'ar');

      expect(resolvedAr.name).toBe('سارة حداد');
      expect(resolvedAr.designation).toBe('رئيس قسم التصميم التجريبي');

      expect(resolvedAr.coreCompetencies).toContain('تطوير المفاهيم والتصميم المبتكر للمواقع');
      expect(resolvedAr.coreCompetencies).toContain('تحسين تدفق وحركة الزوار');
      expect(resolvedAr.coreCompetencies).toContain('تكامل أنظمة الإضاءة والصوتيات');

      expect(resolvedAr.certifications[0].name).toContain('Autodesk');
      expect(resolvedAr.certifications[0].issuer).toBe('هيئة مهنية معتمدة');
    });

    it('Mohasin Mohammadaly fixture: Spatial visualization, Team collaboration, Site coordination are localized in Arabic without English residue', () => {
      const raw = FULL_22_PERSON_ROSTER.find((m) => m.slug === 'mohasin-mohammadaly')!;
      const resolvedAr = resolvePublicTeamMember(raw, 'ar');

      expect(resolvedAr.name).toBe('محاسن محمد علي');
      expect(resolvedAr.designation).toBe('مصمم ثلاثي الأبعاد');

      expect(resolvedAr.coreCompetencies).toContain('التجسيد والتصميم المكاني');
      expect(resolvedAr.coreCompetencies).toContain('العمل الجماعي والتعاون الفعال');
      expect(resolvedAr.coreCompetencies).toContain('تنسيق وإدارة المواقع');
    });

    it('Raja Abbas Khan fixture: Production coordination, Contractor negotiation, Event planning are localized in Arabic', () => {
      const raw = FULL_22_PERSON_ROSTER.find((m) => m.slug === 'raja-abbas-khan')!;
      const resolvedAr = resolvePublicTeamMember(raw, 'ar');

      expect(resolvedAr.name).toContain('عباس خان');
      expect(resolvedAr.coreCompetencies).toContain('تنسيق عمليات الإنتاج والتنفيذ');
      expect(resolvedAr.coreCompetencies).toContain('التفاوض مع المقاولين وإبرام العقود');
      expect(resolvedAr.coreCompetencies).toContain('تخطيط وتنظيم الفعاليات');
    });
  });

  // =========================================================================
  // 3. FULL 22-MEMBER ROSTER ARABIC NESTED AUDIT (ZERO PROHIBITED RESIDUE)
  // =========================================================================
  describe('3. Full 22-Member Roster Arabic Nested Audit', () => {
    it('audits all 22 active profiles: 0 prohibited English nested prose across all fields', () => {
      const prohibitedEnglishProseRegex = /\b(Enterprise Scaling|Market Disruption|IP Licensing|Venue Conceptualization|User Flow Optimization|Lighting & Sound Integration|Spatial visualization|Team collaboration|Site coordination|Production coordination|Contractor negotiation|Event planning|Team coordination|Professional Organization|Loading System)\b/i;

      for (const raw of FULL_22_PERSON_ROSTER) {
        const resolvedAr = resolvePublicTeamMember(raw, 'ar');

        const serialized = JSON.stringify(resolvedAr);
        expect(prohibitedEnglishProseRegex.test(serialized)).toBe(false);

        // Verify that every competency is valid Arabic or allowlisted Latin
        for (const comp of resolvedAr.coreCompetencies) {
          const hasArabic = /[\u0600-\u06FF]/.test(comp);
          const isAllowed = isAllowlistedLatinOrNumeric(comp);
          expect(hasArabic || isAllowed).toBe(true);
        }

        // Verify that every expertise tag is valid Arabic or allowlisted Latin
        for (const tag of resolvedAr.expertiseTags) {
          const hasArabic = /[\u0600-\u06FF]/.test(tag);
          const isAllowed = isAllowlistedLatinOrNumeric(tag);
          expect(hasArabic || isAllowed).toBe(true);
        }
      }
    });

    it('preserves English routes completely unaltered', () => {
      for (const raw of FULL_22_PERSON_ROSTER) {
        const resolvedEn = resolvePublicTeamMember(raw, 'en');

        expect(resolvedEn.name).toBe(`${raw.firstName} ${raw.lastName}`);
        expect(resolvedEn.designation).toBe(raw.designation);
        expect(resolvedEn.expertiseTags).toEqual(raw.expertiseTags || []);
        expect(resolvedEn.coreCompetencies).toEqual(raw.coreCompetencies || []);
      }
    });
  });
});
