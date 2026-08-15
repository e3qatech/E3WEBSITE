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

describe('QF-24 — Team Profile Identity, Detail Routing & Public Privacy Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = null;
    mockRedirect.mockClear();
  });

  const SAMPLE_ROSTER: CanonicalEmployeeInput[] = [
    {
      id: 'emp-1',
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
      id: 'emp-2',
      slug: 'ahmad-faraz',
      firstName: 'Ahmad',
      lastName: 'Faraz',
      firstNameAr: 'أحمد',
      lastNameAr: 'فراز',
      designation: 'Marketing Director',
      designationAr: 'مدير التسويق',
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
      id: 'emp-3',
      slug: 'abdulla-alkuwari',
      firstName: 'Abdulla',
      lastName: 'Al-Kuwari',
      firstNameAr: 'عبدالله',
      lastNameAr: 'الكواري',
      designation: 'Managing Director',
      designationAr: 'المدير التنفيذي',
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
      id: 'emp-4',
      slug: 'sarah-haddad',
      firstName: 'Sarah',
      lastName: 'Haddad',
      firstNameAr: 'سارة',
      lastNameAr: 'حداد',
      designation: 'Lead Creative Designer',
      designationAr: 'كبير المصممين المبدعين',
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
      id: 'emp-5',
      slug: 'mohasin-mohammadaly',
      firstName: 'Mohasin',
      lastName: 'Mohammadaly Parayil',
      firstNameAr: 'محاسن',
      lastNameAr: 'محمد علي',
      designation: 'Operations Coordinator',
      designationAr: 'منسق العمليات',
      department: 'Operations',
      yearsOfExperience: 5,
      aboutSummary: 'Field operations coordinator.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      linkedinUrl: 'https://linkedin.com/in/mohasin',
      contactEmail: 'mohasin@eeeqa.com',
      isActive: true,
      order: 4,
    },
    {
      id: 'emp-hidden',
      slug: 'draft-member',
      firstName: 'Draft',
      lastName: 'Member',
      designation: 'Intern',
      department: 'General',
      isActive: false,
      order: 99,
    },
  ];

  // =========================================================================
  // 1. PUBLIC IDENTITY & DETERMINISTIC RESOLUTION
  // =========================================================================
  describe('1. Public Identity & Deterministic Resolution', () => {
    it('only eligible active members pass public eligibility', () => {
      expect(isTeamMemberPubliclyEligible(SAMPLE_ROSTER[0]).eligible).toBe(true);
      expect(isTeamMemberPubliclyEligible(SAMPLE_ROSTER[5]).eligible).toBe(false);
      expect(isTeamMemberPubliclyEligible({ ...SAMPLE_ROSTER[0], slug: '' }).eligible).toBe(false);
      expect(isTeamMemberPubliclyEligible({ ...SAMPLE_ROSTER[0], firstName: '', firstNameAr: '' }).eligible).toBe(false);
    });

    it('filterAndResolvePublicTeamMembers filters inactive and sorts deterministically', () => {
      const publicTeam = filterAndResolvePublicTeamMembers(SAMPLE_ROSTER, 'en');
      expect(publicTeam.length).toBe(5);
      expect(publicTeam.map((m) => m.slug)).toEqual([
        'raja-abbas-khan',
        'ahmad-faraz',
        'abdulla-alkuwari',
        'sarah-haddad',
        'mohasin-mohammadaly',
      ]);
    });

    it('distinct slugs render distinct people (No Tariq fallback for Mohasin, Abdulla, or Sarah)', () => {
      const raja = resolvePublicTeamMember(SAMPLE_ROSTER[0], 'en');
      const ahmad = resolvePublicTeamMember(SAMPLE_ROSTER[1], 'en');
      const abdulla = resolvePublicTeamMember(SAMPLE_ROSTER[2], 'en');
      const sarah = resolvePublicTeamMember(SAMPLE_ROSTER[3], 'en');
      const mohasin = resolvePublicTeamMember(SAMPLE_ROSTER[4], 'en');

      expect(raja.name).toBe('Raja Abbas Khan');
      expect(ahmad.name).toBe('Ahmad Faraz');
      expect(abdulla.name).toBe('Abdulla Al-Kuwari');
      expect(sarah.name).toBe('Sarah Haddad');
      expect(mohasin.name).toBe('Mohasin Mohammadaly Parayil');

      // None of them are Tariq Mansour
      expect(abdulla.name).not.toContain('Tariq');
      expect(sarah.name).not.toContain('Tariq');
      expect(mohasin.name).not.toContain('Tariq');
    });

    it('generates deterministic initials for avatar monograms', () => {
      expect(getEmployeeInitials('Raja Abbas', 'Khan')).toBe('RK');
      expect(getEmployeeInitials('Sarah', 'Haddad')).toBe('SH');
      expect(getEmployeeInitials('Mohasin', '')).toBe('MO');
      expect(getEmployeeInitials('', '')).toBe('E3');
    });
  });

  // =========================================================================
  // 2. PUBLIC PRIVACY & CONTACT REDACTION
  // =========================================================================
  describe('2. Public Privacy & Contact Redaction', () => {
    it('public DTO does not leak personal emails or phone numbers', () => {
      const publicMember = resolvePublicTeamMember(SAMPLE_ROSTER[0], 'en');
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
  // 3. ARABIC LOCALIZATION PARITY & RESIDUE CLEANUP
  // =========================================================================
  describe('3. Arabic Localization Parity & Residue Cleanup', () => {
    it('resolves full Arabic names, designations, departments, and bios in Arabic mode', () => {
      const memberAr = resolvePublicTeamMember(SAMPLE_ROSTER[0], 'ar');
      expect(memberAr.name).toBe('رجا عباس خان');
      expect(memberAr.designation).toBe('مدير الفعاليات الأول');
      expect(memberAr.department).toBe('الفعاليات والترفيه');
      expect(memberAr.aboutSummary).toBe('يقود العمليات التشغيلية في E3.');
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

    it('uses Latin proper name only as last-resort label when Arabic name is missing', () => {
      const memberNoArName: CanonicalEmployeeInput = {
        id: 'emp-no-ar-name',
        slug: 'lucian-moldovan',
        firstName: 'Lucian',
        lastName: 'Moldovan',
        designation: 'Operations Lead',
        department: 'Operations',
        isActive: true,
      };

      const resolvedAr = resolvePublicTeamMember(memberNoArName, 'ar');
      expect(resolvedAr.name).toBe('Lucian Moldovan');
      expect(resolvedAr.department).toBe('العمليات التشغيلية');
    });
  });

  // =========================================================================
  // 4. NON-DESTRUCTIVE STAFF DATA QUALITY & REVIEW FLAGS
  // =========================================================================
  describe('4. Non-Destructive Staff Data Quality & Review Flags', () => {
    it('flags Mohasin profile identity for human review', () => {
      const report = analyzeTeamMemberDataQuality(SAMPLE_ROSTER[4], SAMPLE_ROSTER);
      expect(report.issues.some((i) => i.code === 'MOHASIN_DUPLICATE_REVIEW')).toBe(true);
    });

    it('flags Abdulla Al-Kuwari and Sarah Haddad with REVIEW_REQUIRED without destructive mutation', () => {
      const reportAbdulla = analyzeTeamMemberDataQuality(SAMPLE_ROSTER[2], SAMPLE_ROSTER);
      const reportSarah = analyzeTeamMemberDataQuality(SAMPLE_ROSTER[3], SAMPLE_ROSTER);

      expect(reportAbdulla.issues.some((i) => i.code === 'REVIEW_REQUIRED')).toBe(true);
      expect(reportSarah.issues.some((i) => i.code === 'REVIEW_REQUIRED')).toBe(true);
    });

    it('flags missing Arabic, placeholders, and duplicate slugs', () => {
      const badMember: CanonicalEmployeeInput = {
        id: 'bad-1',
        slug: 'raja-abbas-khan', // Duplicate slug with SAMPLE_ROSTER[0]
        firstName: 'Lorem',
        lastName: 'Ipsum',
        designation: 'TBD Sample',
        department: 'General',
        aboutSummary: 'Lorem ipsum placeholder bio',
        linkedinUrl: 'http://insecure.com/in/lorem',
        contactEmail: 'lorem@test.com',
        isActive: true,
      };

      const report = analyzeTeamMemberDataQuality(badMember, SAMPLE_ROSTER);
      const codes = report.issues.map((i) => i.code);

      expect(codes).toContain('DUPLICATE_SLUG');
      expect(codes).toContain('MISSING_ARABIC_NAME');
      expect(codes).toContain('MISSING_ARABIC_DESIGNATION');
      expect(codes).toContain('MISSING_ARABIC_BIO');
      expect(codes).toContain('PLACEHOLDER_CONTENT');
      expect(codes).toContain('UNSAFE_SOCIAL_URL');
      expect(codes).toContain('PERSONAL_CONTACT_EXPOSED');
    });
  });

  // =========================================================================
  // 5. DETAIL ROUTING, LEGACY CUID 301 REDIRECTS & SITEMAP SAFETY
  // =========================================================================
  describe('5. Detail Routing, Legacy CUID 301 Redirects & Sitemap Safety', () => {
    it('TeamMemberDetailPage renders exact canonical profile from DB without Tariq fallback', async () => {
      (db.employeeProfile.findUnique as any).mockResolvedValue(SAMPLE_ROSTER[2]); // Abdulla

      const page = await TeamMemberDetailPage({
        params: Promise.resolve({ locale: 'en', slug: 'abdulla-alkuwari' }),
      });

      const markup = renderToStaticMarkup(page);
      expect(markup).toContain('Abdulla Al-Kuwari');
      expect(markup).toContain('Managing Director');
      expect(markup).not.toContain('Tariq Mansour');
      expect(markup).not.toContain('tariq@e3qatar.com');
    });

    it('TeamMemberDetailPage issues 301 redirect for legacy CUID to canonical slug', async () => {
      (db.employeeProfile.findUnique as any)
        .mockResolvedValueOnce(null) // by slug
        .mockResolvedValueOnce(SAMPLE_ROSTER[2]); // by CUID id

      try {
        await TeamMemberDetailPage({
          params: Promise.resolve({ locale: 'ar', slug: 'cuid12345678901234567890' }),
        });
      } catch (err: any) {
        expect(err.message).toContain('NEXT_REDIRECT:/ar/b2b/team/abdulla-alkuwari');
      }

      expect(mockRedirect).toHaveBeenCalledWith('/ar/b2b/team/abdulla-alkuwari', expect.anything());
    });

    it('TeamMemberDetailPage returns 404 for unknown or inactive member', async () => {
      (db.employeeProfile.findUnique as any).mockResolvedValue(null);

      await expect(
        TeamMemberDetailPage({
          params: Promise.resolve({ locale: 'en', slug: 'unknown-slug-xyz' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND');
    });

    it('sitemap publishes only canonical localized slugs for active team members (no CUIDs)', async () => {
      (db.attraction.findMany as any).mockResolvedValue([]);
      (db.service.findMany as any).mockResolvedValue([]);
      (db.caseStudy.findMany as any).mockResolvedValue([]);
      (db.employeeProfile.findMany as any).mockResolvedValue([
        { slug: 'raja-abbas-khan', updatedAt: new Date('2026-08-15') },
        { slug: 'ahmad-faraz', updatedAt: new Date('2026-08-15') },
      ]);

      const entries = await sitemap();
      const teamUrls = entries.filter((e) => e.url.includes('/b2b/team/'));

      expect(teamUrls.length).toBe(2);
      expect(teamUrls[0].url).toContain('/b2b/team/raja-abbas-khan');
      expect(teamUrls[0].alternates?.languages?.en).toContain('/en/b2b/team/raja-abbas-khan');
      expect(teamUrls[0].alternates?.languages?.ar).toContain('/ar/b2b/team/raja-abbas-khan');

      // Zero CUIDs in sitemap
      expect(entries.some((e) => e.url.includes('/b2b/team/emp-') || e.url.includes('/b2b/team/c'))).toBe(false);
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
      (db.employeeProfile.findMany as any).mockResolvedValue(SAMPLE_ROSTER.filter((m) => m.isActive));

      const pubReq = new Request('http://localhost/api/team?locale=ar');
      const pubRes = await TeamGET(pubReq);
      expect(pubRes.status).toBe(200);
      const pubData = await pubRes.json();
      expect(pubData.length).toBe(5);
      expect(pubData[0].name).toBe('رجا عباس خان');

      // Staff with ?all=true
      mocks.session = { user: { id: 'admin-1', role: 'SUPER_ADMIN' } };
      (db.employeeProfile.findMany as any).mockResolvedValue(SAMPLE_ROSTER);
      const staffReq = new Request('http://localhost/api/team?all=true');
      const staffRes = await TeamGET(staffReq);
      expect(staffRes.status).toBe(200);
      const staffData = await staffRes.json();
      expect(staffData.length).toBe(6);
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
      (db.employeeProfile.findFirst as any).mockResolvedValue(SAMPLE_ROSTER[0]);
      const getDetailRes = await TeamDetailGET(new Request('http://localhost/api/team/emp-1') as any, { params: Promise.resolve({ id: 'emp-1' }) });
      expect(getDetailRes.status).toBe(200);

      // TeamDetailDELETE
      expect((await TeamDetailDELETE(new Request('http://localhost/api/team/emp-1', { method: 'DELETE' }) as any, { params: Promise.resolve({ id: 'emp-1' }) })).status).toBe(401);

      // Employees Detail endpoints
      (db.employeeProfile.findFirst as any).mockResolvedValue(SAMPLE_ROSTER[0]);
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
      (db.employeeProfile.findMany as any).mockResolvedValue(SAMPLE_ROSTER.filter((m) => m.isActive));

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
