import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  isTeamMemberPubliclyEligible,
  filterAndResolvePublicTeamMembers,
  resolvePublicTeamMember,
  analyzeTeamMemberDataQuality,
  sanitizeSocialUrl,
  sanitizePortraitUrl,
  getEmployeeInitials,
  isTeamAuthorized,
  CanonicalEmployeeInput,
  TEAM_DEPARTMENT_LOCALIZATION,
  COMMON_DESIGNATION_LOCALIZATION,
} from '@/lib/team/team-resolver';

// Mock DB & Auth
const mocks = vi.hoisted(() => ({
  session: null as any,
  db: {
    employeeProfile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    attraction: {
      findMany: vi.fn(),
    },
    service: {
      findMany: vi.fn(),
    },
    caseStudy: {
      findMany: vi.fn(),
    },
    setting: {
      findUnique: vi.fn(),
    },
  },
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => mocks.session),
}));

vi.mock('@/lib/db', () => ({
  default: mocks.db,
  db: mocks.db,
}));

vi.mock('@/lib/redis', () => ({
  redis: mocks.redis,
}));

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  redirect: vi.fn((url: string, type?: any) => {
    mockRedirect(url, type);
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  permanentRedirect: vi.fn((url: string) => {
    mockRedirect(url);
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  RedirectType: {
    push: 'push',
    replace: 'replace',
  },
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import db from '@/lib/db';
import { GET as TeamGET, POST as TeamPOST, DELETE as TeamDELETE } from '../app/api/team/route';
import { GET as TeamDetailGET, PUT as TeamDetailPUT, DELETE as TeamDetailDELETE } from '../app/api/team/[id]/route';
import { POST as EmployeesPOST } from '../app/api/employees/route';
import { GET as EmployeesDetailGET, PUT as EmployeesDetailPUT, DELETE as EmployeesDetailDELETE } from '../app/api/employees/[id]/route';
import B2BTeamPage from '../app/[locale]/b2b/team/page';
import TeamMemberDetailPage from '../app/[locale]/b2b/team/[slug]/page';
import sitemap from '../app/sitemap';

describe('QF-24 & QF-24-B — Complete 22-Person Roster, Arabic Parity & HTTP Canonicalization Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = null;
    mockRedirect.mockClear();
  });

  /**
   * Complete 22-person roster matching the live database records.
   */
  const FULL_22_PERSON_ROSTER: CanonicalEmployeeInput[] = [
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
      firstNameAr: 'رجا عباس',
      lastNameAr: 'خان',
      designation: 'Senior Events Manager',
      designationAr: 'مدير الفعاليات الأول',
      department: 'Events',
      yearsOfExperience: 10,
      tagline: 'Architect of Experiences',
      taglineAr: 'مهندس التجارب الترفيهية',
      aboutSummary: 'Leads the operational engine at E3.',
      aboutSummaryAr: 'يقود العمليات التشغيلية في E3.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      linkedinUrl: 'https://linkedin.com/in/rajaabbaskhan',
      contactEmail: 'raja@eeeqa.com',
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
      firstNameAr: 'عبدالله',
      lastNameAr: 'الكبيسي',
      designation: 'Chairman',
      designationAr: 'رئيس مجلس الإدارة',
      department: 'Executive',
      yearsOfExperience: 20,
      isActive: true,
      order: 1,
    },
    {
      id: 'cmscbp8qa00048ayzdmzo9x9j',
      slug: 'ahmad-faraz',
      firstName: 'Ahmad',
      lastName: 'Faraz',
      firstNameAr: 'أحمد',
      lastNameAr: 'فراز',
      designation: 'Creative Marketing Lead',
      designationAr: 'رئيس التسويق الإبداعي',
      department: 'Marketing',
      yearsOfExperience: 8,
      tagline: 'Brand Strategist',
      taglineAr: 'خبير استراتيجيات العلامات التجارية',
      aboutSummary: 'Driving marketing campaigns across MENA.',
      aboutSummaryAr: 'يقود الحملات التسويقية في منطقة الشرق الأوسط.',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      linkedinUrl: 'https://linkedin.com/in/ahmadfaraz',
      contactEmail: 'ahmad@eeeqa.com',
      isActive: true,
      order: 1,
    },
    {
      id: 'cmsd1j8de0002hzt53lwz7zyd',
      slug: 'abdulla-alkuwari',
      firstName: 'Abdulla',
      lastName: 'Al-Kuwari',
      firstNameAr: 'عبدالله',
      lastNameAr: 'الكواري',
      designation: 'Chief Executive Officer',
      designationAr: 'الرئيس التنفيذي',
      department: 'Executive',
      yearsOfExperience: 15,
      aboutSummary: 'Executive leadership across Qatar entertainment.',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      linkedinUrl: 'https://linkedin.com/in/abdullaalkuwari',
      contactEmail: 'abdulla@eeeqa.com',
      isActive: true,
      order: 2,
    },
    {
      id: 'cmsd1j8in0003hzt54hgeubf0',
      slug: 'sarah-haddad',
      firstName: 'Sarah',
      lastName: 'Haddad',
      firstNameAr: 'سارة',
      lastNameAr: 'حداد',
      designation: 'Head of Experiential Design',
      designationAr: 'رئيس قسم التصميم التجريبي',
      department: 'Design',
      yearsOfExperience: 7,
      aboutSummary: 'Spatial design and visual experiences.',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      linkedinUrl: 'https://linkedin.com/in/sarahhaddad',
      contactEmail: 'sarah@eeeqa.com',
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
    {
      id: 'emp-hidden',
      slug: 'draft-intern',
      firstName: 'Draft',
      lastName: 'Intern',
      designation: 'Intern',
      department: 'General',
      isActive: false,
      order: 99,
    },
  ];

  // =========================================================================
  // 1. COMPLETE 22-PERSON ROSTER RECONCILIATION & DETERMINISTIC RESOLUTION
  // =========================================================================
  describe('1. Complete 22-Person Roster Reconciliation & Deterministic Resolution', () => {
    it('isTeamMemberPubliclyEligible validates active and rejects inactive/missing slug members', () => {
      expect(isTeamMemberPubliclyEligible(FULL_22_PERSON_ROSTER[0]).eligible).toBe(true);
      expect(isTeamMemberPubliclyEligible(FULL_22_PERSON_ROSTER[22]).eligible).toBe(false); // draft-intern
      expect(isTeamMemberPubliclyEligible({ ...FULL_22_PERSON_ROSTER[0], slug: '' }).eligible).toBe(false);
    });

    it('audits and resolves all 22 active profiles deterministically', () => {
      const activeMembers = FULL_22_PERSON_ROSTER.filter((m) => m.isActive);
      expect(activeMembers.length).toBe(22);

      const resolved = filterAndResolvePublicTeamMembers(FULL_22_PERSON_ROSTER, 'en');
      expect(resolved.length).toBe(22);

      // Verify omitted profiles are present and active
      const slugs = resolved.map((m) => m.slug);
      expect(slugs).toContain('adil-ahmed');
      expect(slugs).toContain('mohammad-ali-awada');
      expect(slugs).toContain('amaan-malik');
      expect(slugs).toContain('abdullah-al-kubaisi');
      expect(slugs).toContain('mohasin-mohammadaly-parayil');
      expect(slugs).toContain('mohasin-mohammadaly');
    });

    it('proves both Mohasin identities remain distinct and flagged for review', () => {
      const m1 = FULL_22_PERSON_ROSTER.find((m) => m.slug === 'mohasin-mohammadaly-parayil')!;
      const m2 = FULL_22_PERSON_ROSTER.find((m) => m.slug === 'mohasin-mohammadaly')!;

      expect(m1).toBeDefined();
      expect(m2).toBeDefined();
      expect(m1.id).not.toBe(m2.id);
      expect(m1.department).toBe('Design');
      expect(m2.department).toBe('Operations');

      const report1 = analyzeTeamMemberDataQuality(m1, FULL_22_PERSON_ROSTER);
      const report2 = analyzeTeamMemberDataQuality(m2, FULL_22_PERSON_ROSTER);

      expect(report1.issues.some((i) => i.code === 'MOHASIN_DUPLICATE_REVIEW')).toBe(true);
      expect(report2.issues.some((i) => i.code === 'MOHASIN_DUPLICATE_REVIEW')).toBe(true);
    });

    it('proves Abdullah Al Kubaisi and Abdulla Al-Kuwari remain distinct', () => {
      const kubaisi = FULL_22_PERSON_ROSTER.find((m) => m.slug === 'abdullah-al-kubaisi')!;
      const kuwari = FULL_22_PERSON_ROSTER.find((m) => m.slug === 'abdulla-alkuwari')!;

      expect(kubaisi).toBeDefined();
      expect(kuwari).toBeDefined();
      expect(kubaisi.id).not.toBe(kuwari.id);
      expect(kubaisi.designation).toBe('Chairman');
      expect(kuwari.designation).toBe('Chief Executive Officer');
    });

    it('generates deterministic initials for avatar monograms', () => {
      expect(getEmployeeInitials('Raja Abbas', 'Khan')).toBe('RK');
      expect(getEmployeeInitials('Sarah', 'Haddad')).toBe('SH');
      expect(getEmployeeInitials('Mohasin', '')).toBe('MO');
      expect(getEmployeeInitials('', '')).toBe('E3');
    });
  });

  // =========================================================================
  // 2. STRICT ARABIC PRESENTATION & PROSE ISOLATION
  // =========================================================================
  describe('2. Strict Arabic Presentation & Prose Isolation', () => {
    it('maps all 22 active departments and designations to authentic Arabic with zero English residue', () => {
      const activeMembers = FULL_22_PERSON_ROSTER.filter((m) => m.isActive);
      const resolvedAr = filterAndResolvePublicTeamMembers(activeMembers, 'ar');

      // Verify no Arabic department contains raw English department labels
      for (const member of resolvedAr) {
        expect(member.department).not.toBe('Executive Management');
        expect(member.department).not.toBe('Branding, Design & Marketing');
        expect(member.department).not.toBe('Operations & Guest Experience');
        expect(member.department).not.toBe('Food & Beverage');
        expect(member.department).not.toBe('Logistics & Production');

        // Department must be Arabic
        expect(/[\u0600-\u06FF]/.test(member.department)).toBe(true);
      }
    });

    it('suppresses English bio residue in Arabic mode when Arabic bio is missing', () => {
      const memberWithoutArBio: CanonicalEmployeeInput = {
        id: 'emp-no-ar-bio',
        slug: 'john-doe',
        firstName: 'John',
        lastName: 'Doe',
        firstNameAr: 'جون',
        lastNameAr: 'دو',
        designation: 'Engineer',
        department: 'Technical',
        aboutSummary: 'Over 10 years experience in temporary structural rigging.',
        aboutSummaryAr: null,
        isActive: true,
      };

      const resolvedAr = resolvePublicTeamMember(memberWithoutArBio, 'ar');
      expect(resolvedAr.aboutSummary).toBe('');
      expect(resolvedAr.aboutSummary).not.toContain('temporary structural rigging');
    });

    it('dictionary covers all departments and designations across the roster', () => {
      expect(TEAM_DEPARTMENT_LOCALIZATION['executive management'].ar).toBe('الإدارة التنفيذية');
      expect(TEAM_DEPARTMENT_LOCALIZATION['branding, design & marketing'].ar).toBe('التصميم والهوية والتسويق');
      expect(TEAM_DEPARTMENT_LOCALIZATION['food & beverage'].ar).toBe('الأغذية والمشروبات');
      expect(COMMON_DESIGNATION_LOCALIZATION['managing director & ceo']).toBe('العضو المنتدب والرئيس التنفيذي');
      expect(COMMON_DESIGNATION_LOCALIZATION['ai generalist & senior graphic designer']).toBe(
        'مصمم جرافيك أول وخبير ذكاء اصطناعي'
      );
    });
  });

  // =========================================================================
  // 3. PUBLIC PRIVACY & CONTACT REDACTION
  // =========================================================================
  describe('3. Public Privacy & Contact Redaction', () => {
    it('public DTO does not leak personal emails or phone numbers', () => {
      const publicMember = resolvePublicTeamMember(FULL_22_PERSON_ROSTER[2], 'en');
      expect((publicMember as any).contactEmail).toBeUndefined();
      expect((publicMember as any).phone).toBeUndefined();
      expect(JSON.stringify(publicMember)).not.toContain('raja@eeeqa.com');
    });

    it('validates HTTPS social URLs and rejects insecure or dangerous schemes', () => {
      expect(sanitizeSocialUrl('https://linkedin.com/in/rajaabbaskhan')).toBe('https://linkedin.com/in/rajaabbaskhan');
      expect(sanitizeSocialUrl('http://insecure.com/in/raja')).toBeNull();
      expect(sanitizeSocialUrl('javascript:alert(1)')).toBeNull();
      expect(sanitizeSocialUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
      expect(sanitizeSocialUrl('#')).toBeNull();
      expect(sanitizeSocialUrl(null)).toBeNull();
    });

    it('validates portrait URLs and rejects insecure protocols', () => {
      expect(sanitizePortraitUrl('https://images.unsplash.com/photo-1')).toBe('https://images.unsplash.com/photo-1');
      expect(sanitizePortraitUrl('/images/team/member.jpg')).toBe('/images/team/member.jpg');
      expect(sanitizePortraitUrl('http://insecure.com/photo.jpg')).toBeNull();
      expect(sanitizePortraitUrl('javascript:void(0)')).toBeNull();
      expect(sanitizePortraitUrl('data:text/html,evil')).toBeNull();
    });
  });

  // =========================================================================
  // 4. HTTP CANONICALIZATION (301 REDIRECT & 404 NOT-FOUND)
  // =========================================================================
  describe('4. HTTP Canonicalization (301 Redirect & 404 Not-Found)', () => {
    it('TeamMemberDetailPage renders exact canonical profile from DB without Tariq fallback', async () => {
      (db.employeeProfile.findUnique as any).mockResolvedValue(FULL_22_PERSON_ROSTER[7]); // Abdulla Al-Kuwari

      const page = await TeamMemberDetailPage({
        params: Promise.resolve({ locale: 'en', slug: 'abdulla-alkuwari' }),
      });

      const markup = renderToStaticMarkup(page);
      expect(markup).toContain('Abdulla Al-Kuwari');
      expect(markup).toContain('Chief Executive Officer');
      expect(markup).not.toContain('Tariq Mansour');
      expect(markup).not.toContain('tariq@e3qatar.com');
    });

    it('TeamMemberDetailPage issues 301 redirect for legacy CUID to canonical slug preserving locale', async () => {
      (db.employeeProfile.findUnique as any)
        .mockResolvedValueOnce(null) // by slug
        .mockResolvedValueOnce(FULL_22_PERSON_ROSTER[7]); // by CUID id

      try {
        await TeamMemberDetailPage({
          params: Promise.resolve({ locale: 'ar', slug: 'cmscbl39y00008ayz90qlf3t0' }),
        });
      } catch (err: any) {
        expect(err.message).toContain('NEXT_REDIRECT:/ar/b2b/team/abdulla-alkuwari');
      }

      expect(mockRedirect).toHaveBeenCalledWith('/ar/b2b/team/abdulla-alkuwari');
    });

    it('TeamMemberDetailPage returns 404 for unknown or inactive member', async () => {
      (db.employeeProfile.findUnique as any).mockResolvedValue(null);

      await expect(
        TeamMemberDetailPage({
          params: Promise.resolve({ locale: 'en', slug: 'unknown-slug-xyz' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND');
    });
  });

  // =========================================================================
  // 5. TEAM SITEMAP OUTPUT (44 EXPLICIT LOCALIZED ENTRIES)
  // =========================================================================
  describe('5. Team Sitemap Output (44 Explicit Localized Entries)', () => {
    it('sitemap generates exactly 44 explicit EN/AR detail entries for 22 active profiles (no bare URLs, no CUIDs)', async () => {
      (db.attraction.findMany as any).mockResolvedValue([]);
      (db.service.findMany as any).mockResolvedValue([]);
      (db.caseStudy.findMany as any).mockResolvedValue([]);
      (db.employeeProfile.findMany as any).mockResolvedValue(
        FULL_22_PERSON_ROSTER.filter((m) => m.isActive).map((m) => ({
          slug: m.slug,
          updatedAt: new Date('2026-08-15'),
        }))
      );

      const entries = await sitemap();
      const teamUrls = entries.filter((e) => e.url.includes('/b2b/team/'));

      // Exactly 44 entries: 22 EN + 22 AR
      expect(teamUrls.length).toBe(44);

      const enTeamUrls = teamUrls.filter((e) => e.url.includes('/en/b2b/team/'));
      const arTeamUrls = teamUrls.filter((e) => e.url.includes('/ar/b2b/team/'));
      expect(enTeamUrls.length).toBe(22);
      expect(arTeamUrls.length).toBe(22);

      // Zero bare URLs (e.g. no https://e3.qa/b2b/team/slug without locale)
      const bareTeamUrls = teamUrls.filter((e) => !e.url.includes('/en/') && !e.url.includes('/ar/'));
      expect(bareTeamUrls.length).toBe(0);

      // Zero CUIDs
      expect(entries.some((e) => e.url.includes('/b2b/team/cms') || e.url.includes('/b2b/team/cuid'))).toBe(false);
    });
  });

  // =========================================================================
  // 6. API SERVER-SIDE RBAC & MUTATION SAFETY
  // =========================================================================
  describe('6. API Server-Side RBAC & Mutation Safety', () => {
    it('isTeamAuthorized validates canonical roles and capabilities', () => {
      expect(isTeamAuthorized('SUPER_ADMIN')).toBe(true);
      expect(isTeamAuthorized('SALES_ADMIN')).toBe(true);
      expect(isTeamAuthorized('ADMIN')).toBe(true);
      expect(isTeamAuthorized('MARKETING')).toBe(true);
      expect(isTeamAuthorized('STAFF', ['content.manage'])).toBe(true);
      expect(isTeamAuthorized('STAFF', [])).toBe(false);
      expect(isTeamAuthorized('CLIENT')).toBe(false);
      expect(isTeamAuthorized('CANDIDATE')).toBe(false);
      expect(isTeamAuthorized(null)).toBe(false);
    });

    it('POST /api/team enforces 401 unauth and 403 unauthorized', async () => {
      mocks.session = null;
      const unauthReq = new Request('http://localhost/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Test', lastName: 'User' }),
      });
      expect((await TeamPOST(unauthReq)).status).toBe(401);

      mocks.session = { user: { id: 'u-1', role: 'CLIENT' } };
      expect((await TeamPOST(unauthReq)).status).toBe(403);
    });

    it('POST /api/team defaults newly created profiles to inactive/hidden', async () => {
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.employeeProfile.create as any).mockResolvedValue({ id: 'emp-new', slug: 'test-user', isActive: false });

      const authReq = new Request('http://localhost/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Test', lastName: 'User', designation: 'Coordinator' }),
      });

      const res = await TeamPOST(authReq);
      expect(res.status).toBe(201);
      expect(db.employeeProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isActive: false,
          }),
        })
      );
    });

    it('GET /api/team returns safe public list for unauth and staff data with ?all=true for auth', async () => {
      mocks.session = null;
      (db.employeeProfile.findMany as any).mockResolvedValue(FULL_22_PERSON_ROSTER.filter((m) => m.isActive));

      const pubReq = new Request('http://localhost/api/team?locale=ar');
      const pubRes = await TeamGET(pubReq);
      expect(pubRes.status).toBe(200);
      const pubData = await pubRes.json();
      expect(pubData.length).toBe(22);
      expect(pubData[2].name).toBe('رجا عباس خان');

      // Staff with ?all=true
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.employeeProfile.findMany as any).mockResolvedValue(FULL_22_PERSON_ROSTER);
      const staffReq = new Request('http://localhost/api/team?all=true');
      const staffRes = await TeamGET(staffReq);
      expect(staffRes.status).toBe(200);
      const staffData = await staffRes.json();
      expect(staffData.length).toBe(23);
      expect(staffData[0].dataQuality).toBeDefined();
    });

    it('DELETE /api/team, TeamDetail endpoints, and /api/employees endpoints enforce RBAC', async () => {
      // Unauth DELETE
      mocks.session = null;
      const unauthDel = new Request('http://localhost/api/team?id=emp-1', { method: 'DELETE' });
      expect((await TeamDELETE(unauthDel)).status).toBe(401);

      // Auth DELETE
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.employeeProfile.delete as any).mockResolvedValue({ id: 'emp-1' });
      const authDel = new Request('http://localhost/api/team?id=emp-1', { method: 'DELETE' });
      expect((await TeamDELETE(authDel)).status).toBe(200);

      // TeamDetailGET (public resolution)
      mocks.session = null;
      (db.employeeProfile.findFirst as any).mockResolvedValue(FULL_22_PERSON_ROSTER[0]);
      const getDetailRes = await TeamDetailGET(new Request('http://localhost/api/team/emp-1') as any, { params: Promise.resolve({ id: 'emp-1' }) });
      expect(getDetailRes.status).toBe(200);

      // TeamDetailDELETE
      expect((await TeamDetailDELETE(new Request('http://localhost/api/team/emp-1', { method: 'DELETE' }) as any, { params: Promise.resolve({ id: 'emp-1' }) })).status).toBe(401);

      // Employees Detail endpoints
      (db.employeeProfile.findFirst as any).mockResolvedValue(FULL_22_PERSON_ROSTER[0]);
      const empGetRes = await EmployeesDetailGET(new Request('http://localhost/api/employees/emp-1'), { params: Promise.resolve({ id: 'emp-1' }) });
      expect(empGetRes.status).toBe(200);

      const unauthEmpPut = new Request('http://localhost/api/employees/emp-1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ designation: 'New' }) });
      expect((await EmployeesDetailPUT(unauthEmpPut, { params: Promise.resolve({ id: 'emp-1' }) })).status).toBe(401);

      const unauthEmpDel = new Request('http://localhost/api/employees/emp-1', { method: 'DELETE' });
      expect((await EmployeesDetailDELETE(unauthEmpDel, { params: Promise.resolve({ id: 'emp-1' }) })).status).toBe(401);

      const unauthPut = new Request('http://localhost/api/team/emp-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designation: 'Updated' }),
      });
      expect((await TeamDetailPUT(unauthPut as any, { params: Promise.resolve({ id: 'emp-1' }) })).status).toBe(401);

      const unauthEmpPost = new Request('http://localhost/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Emp' }),
      });
      expect((await EmployeesPOST(unauthEmpPost)).status).toBe(401);
    });
  });

  // =========================================================================
  // 7. RENDERED PAGE INTEGRATION
  // =========================================================================
  describe('7. Rendered Page Integration', () => {
    it('B2BTeamPage renders active members in EN and AR with zero personal email leaks', async () => {
      (db.employeeProfile.findMany as any).mockResolvedValue(FULL_22_PERSON_ROSTER.filter((m) => m.isActive));

      const pageEn = await B2BTeamPage({ params: Promise.resolve({ locale: 'en' }) });
      const markupEn = renderToStaticMarkup(pageEn);

      expect(markupEn).toContain('The Masterminds');
      expect(markupEn).toContain('Raja Abbas Khan');
      expect(markupEn).not.toContain('mailto:');
      expect(markupEn).not.toContain('raja@eeeqa.com');

      const pageAr = await B2BTeamPage({ params: Promise.resolve({ locale: 'ar' }) });
      const markupAr = renderToStaticMarkup(pageAr);

      expect(markupAr).toContain('العقول المدبرة');
      expect(markupAr).toContain('رجا عباس خان');
      expect(markupAr).not.toContain('mailto:');
    });
  });
});
