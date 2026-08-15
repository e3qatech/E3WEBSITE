import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  isJobPubliclyEligible,
  filterPubliclyEligibleJobs,
  formatJobPresentation,
  analyzeJobDataQuality,
  isDeadlineExpired,
  parseQatarDeadline,
  isHRAuthorized,
  toTitleCase,
  QATAR_TIMEZONE,
  QATAR_UTC_OFFSET_HOURS,
  CanonicalJobInput,
} from '@/lib/careers/job-eligibility';
import { CareerListings } from '@/components/careers/CareerListings';

// Mock Next.js and Database
vi.mock('@/lib/db', () => ({
  default: {
    job: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    jobApplication: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    talent: {
      create: vi.fn(),
    },
    systemLog: {
      create: vi.fn(),
    },
  },
  db: {
    job: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    jobApplication: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    talent: {
      create: vi.fn(),
    },
    systemLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(async () => ({ success: true })),
}));

let mockSession: any = null;
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(async () => mockSession),
}));

import db from '@/lib/db';
import { POST as ApplyPOST } from '../app/api/careers/apply/route';
import { GET as JobsGET, POST as JobsPOST } from '../app/api/careers/jobs/route';
import { GET as JobDetailGET, PUT as JobDetailPUT, DELETE as JobDetailDELETE } from '../app/api/careers/jobs/[id]/route';
import { GET as StatusGET, PUT as StatusPUT, PATCH as StatusPATCH } from '../app/api/careers/[id]/status/route';
import { POST as ParseCVPOST } from '../app/api/careers/[id]/parse/route';
import { POST as ParseTalentPOST } from '../app/api/talent/parse/route';

describe('QF-22 & QF-22-B — Careers Job Publication, HR RBAC & Application Lineage Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = null;
  });

  // =========================================================================
  // 1. PUBLIC ELIGIBILITY CONTRACT & LIFECYCLE STATES
  // =========================================================================
  describe('1. Public Eligibility Contract', () => {
    it('marks active, published job with no deadline as publicly eligible', () => {
      const job: CanonicalJobInput = {
        id: 'job-1',
        title: 'Senior Frontend Engineer',
        isPublished: true,
        status: 'ACTIVE',
      };
      const res = isJobPubliclyEligible(job);
      expect(res.eligible).toBe(true);
      expect(res.isPublished).toBe(true);
      expect(res.isClosed).toBe(false);
      expect(res.isDraft).toBe(false);
    });

    it('rejects draft jobs from public eligibility', () => {
      const draftJob1: CanonicalJobInput = {
        id: 'job-2',
        title: 'Draft Position',
        isPublished: false,
      };
      const res1 = isJobPubliclyEligible(draftJob1);
      expect(res1.eligible).toBe(false);
      expect(res1.isDraft).toBe(true);

      const draftJob2: CanonicalJobInput = {
        id: 'job-3',
        title: 'Draft Position 2',
        isPublished: true,
        status: 'DRAFT',
      };
      const res2 = isJobPubliclyEligible(draftJob2);
      expect(res2.eligible).toBe(false);
      expect(res2.isDraft).toBe(true);
    });

    it('rejects closed and archived jobs from public eligibility', () => {
      const closedJob: CanonicalJobInput = {
        id: 'job-4',
        title: 'Closed Position',
        isPublished: true,
        status: 'CLOSED',
      };
      const res1 = isJobPubliclyEligible(closedJob);
      expect(res1.eligible).toBe(false);
      expect(res1.isClosed).toBe(true);

      const archivedJob: CanonicalJobInput = {
        id: 'job-5',
        title: 'Archived Position',
        isPublished: true,
        status: 'ARCHIVED',
      };
      const res2 = isJobPubliclyEligible(archivedJob);
      expect(res2.eligible).toBe(false);
      expect(res2.isClosed).toBe(true);
    });
  });

  // =========================================================================
  // 2. QATAR TIMEZONE DEADLINE CALCULATIONS (UTC+3)
  // =========================================================================
  describe('2. Qatar Timezone Deadline Calculations', () => {
    it('verifies Qatar timezone constant and UTC offset (UTC+3)', () => {
      expect(QATAR_TIMEZONE).toBe('Asia/Qatar');
      expect(QATAR_UTC_OFFSET_HOURS).toBe(3);
    });

    it('evaluates future deadline in Qatar time as not expired', () => {
      const futureDeadline = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString();
      expect(isDeadlineExpired(futureDeadline)).toBe(false);
    });

    it('evaluates past deadline in Qatar time as expired', () => {
      const pastDeadline = '2020-01-01T00:00:00.000Z';
      expect(isDeadlineExpired(pastDeadline)).toBe(true);

      const job: CanonicalJobInput = {
        id: 'job-expired',
        title: 'Expired Job',
        isPublished: true,
        deadline: pastDeadline,
      };
      const res = isJobPubliclyEligible(job);
      expect(res.eligible).toBe(false);
      expect(res.isExpired).toBe(true);
    });

    it('parses Qatar date-only string to end of day in Qatar time (23:59:59.999 UTC+3)', () => {
      const deadline = parseQatarDeadline('2026-08-31');
      expect(deadline).not.toBeNull();
      expect(deadline?.getUTCHours()).toBe(20);
      expect(deadline?.getUTCMinutes()).toBe(59);
    });
  });

  // =========================================================================
  // 3. READ-ONLY DATA QUALITY ANALYZER & SAFE PRESENTATION CASING
  // =========================================================================
  describe('3. Read-Only Data Quality Analyzer & Safe Presentation', () => {
    it('analyzes job data quality non-destructively and flags issues without modifying records', () => {
      const unpolishedJob: CanonicalJobInput = {
        id: 'job-raw-1',
        title: 'senior software engineer',
        department: null,
        location: null,
        description: 'short',
        deadline: '2020-01-01',
      };

      const report = analyzeJobDataQuality(unpolishedJob);
      expect(report.isClean).toBe(false);
      expect(report.issues.some((i) => i.code === 'LOWERCASE_TEXT')).toBe(true);
      expect(report.issues.some((i) => i.code === 'MISSING_LOCATION')).toBe(true);
      expect(report.issues.some((i) => i.code === 'SHORT_DESCRIPTION')).toBe(true);
      expect(report.issues.some((i) => i.code === 'EXPIRED_DEADLINE')).toBe(true);

      // Verify original record was NOT mutated
      expect(unpolishedJob.title).toBe('senior software engineer');
      expect(unpolishedJob.description).toBe('short');
    });

    it('formats presentation fields with safe Title Casing without mutating stored data', () => {
      const rawJob: CanonicalJobInput = {
        id: 'job-p1',
        title: 'event technical director',
        department: 'operations & staging',
        location: 'doha (on-site)',
        type: 'FULL_TIME',
        description: 'Leading technical execution.',
        isPublished: true,
        createdAt: new Date('2026-08-01'),
      };

      const formattedEn = formatJobPresentation(rawJob, 'en');
      expect(formattedEn.title).toBe('Event Technical Director');
      expect(formattedEn.department).toBe('Operations & Staging');
      expect(formattedEn.location).toBe('Doha (On-Site)');
      expect(formattedEn.type).toBe('Full Time');

      expect(toTitleCase('doha (on-site)')).toBe('Doha (On-Site)');
      expect(toTitleCase('senior backend lead / architect')).toBe('Senior Backend Lead / Architect');
    });
  });

  // =========================================================================
  // 4. CANONICAL SINGLE JOB SOURCE & ZERO CMS JOB LEAKAGE (QF-22-B)
  // =========================================================================
  describe('4. Canonical Single Job Source (db.job only)', () => {
    it('returns zero public jobs when only legacy CMS job fixtures exist in page content', () => {
      // Simulate db.job having no eligible rows
      const emptyDbJobs: CanonicalJobInput[] = [];
      const eligible = filterPubliclyEligibleJobs(emptyDbJobs);
      expect(eligible).toHaveLength(0);

      // Render CareerListings with 0 jobs -> localized zero state, NO legacy CMS jobs
      const htmlEn = renderToStaticMarkup(<CareerListings jobs={[]} isAr={false} portal="B2B" />);
      expect(htmlEn).toContain('No Open Positions Currently');
      expect(htmlEn).toContain('Submit General Application');
      expect(htmlEn).not.toContain('Senior Full Stack Engineer');

      const htmlAr = renderToStaticMarkup(<CareerListings jobs={[]} isAr={true} portal="B2B" />);
      expect(htmlAr).toContain('لا توجد شواغر معلنة حالياً');
      expect(htmlAr).toContain('تقديم طلب عام مفتوح');
      expect(htmlAr).not.toContain('مهندس برمجيات أول');
    });
  });

  // =========================================================================
  // 5. HR RBAC, GENERIC STAFF DENIAL & CAPABILITY CHECKS (QF-22-B)
  // =========================================================================
  describe('5. HR RBAC, Generic STAFF Denial & Capability Checks', () => {
    it('isHRAuthorized permits SUPER_ADMIN and HR_ADMIN, but denies generic STAFF', () => {
      expect(isHRAuthorized('SUPER_ADMIN')).toBe(true);
      expect(isHRAuthorized('HR_ADMIN')).toBe(true);

      // Generic STAFF without explicit HR capability must receive false
      expect(isHRAuthorized('STAFF')).toBe(false);
      expect(isHRAuthorized('STAFF', [])).toBe(false);
      expect(isHRAuthorized('STAFF', ['staff.schedule.own'])).toBe(false);

      // STAFF with explicit HR capability is granted access
      expect(isHRAuthorized('STAFF', ['hr.jobs.manage'])).toBe(true);
      expect(isHRAuthorized('STAFF', ['hr.applications.manage'])).toBe(true);

      // Other administrative and non-HR roles are denied
      expect(isHRAuthorized('CLIENT')).toBe(false);
      expect(isHRAuthorized('CANDIDATE')).toBe(false);
      expect(isHRAuthorized('B2C_ADMIN')).toBe(false);
      expect(isHRAuthorized('OPERATIONS_ADMIN')).toBe(false);
      expect(isHRAuthorized(null)).toBe(false);
    });

    it('POST /api/careers/jobs returns 401 unauthenticated and 403 for generic STAFF', async () => {
      // 401 Unauthenticated
      mockSession = null;
      const unauthReq = new Request('http://localhost/api/careers/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Position', description: 'Test description.' }),
      });
      const resUnauth = await JobsPOST(unauthReq as any);
      expect(resUnauth.status).toBe(401);

      // 403 Generic STAFF
      mockSession = { user: { id: 'staff-1', role: 'STAFF', permissions: [] } };
      const staffReq = new Request('http://localhost/api/careers/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Staff Position', description: 'Test description.' }),
      });
      const resStaff = await JobsPOST(staffReq as any);
      expect(resStaff.status).toBe(403);

      // 201 HR_ADMIN
      mockSession = { user: { id: 'hr-1', role: 'HR_ADMIN' } };
      (db.job.create as any).mockResolvedValue({ id: 'job-hr-1', title: 'HR Position' });
      const hrReq = new Request('http://localhost/api/careers/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'HR Position', description: 'Test description.' }),
      });
      const resHR = await JobsPOST(hrReq as any);
      expect(resHR.status).toBe(201);

      // GET /api/careers/jobs public vs staff
      (db.job.findMany as any).mockResolvedValue([
        { id: 'j1', title: 'Lead Engineer', isPublished: true, createdAt: new Date() },
      ]);
      const publicGetReq = new Request('http://localhost/api/careers/jobs');
      const publicGetRes = await JobsGET(publicGetReq as any);
      expect(publicGetRes.status).toBe(200);

      // GET /api/careers/jobs/:id detail
      (db.job.findUnique as any).mockResolvedValue({ id: 'j1', title: 'Lead Engineer', isPublished: true, description: 'Test', createdAt: new Date() });
      const detailGetReq = new Request('http://localhost/api/careers/jobs/j1');
      const detailGetRes = await JobDetailGET(detailGetReq as any, { params: Promise.resolve({ id: 'j1' }) });
      expect(detailGetRes.status).toBe(200);
    });

    it('PUT and DELETE /api/careers/jobs/:id enforce 401 unauth, 403 generic STAFF, and 200 for HR', async () => {
      // PUT 401 Unauth
      mockSession = null;
      const unauthPut = new Request('http://localhost/api/careers/jobs/j1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });
      expect((await JobDetailPUT(unauthPut as any, { params: Promise.resolve({ id: 'j1' }) })).status).toBe(401);

      // PUT 403 Generic STAFF
      mockSession = { user: { id: 'staff-1', role: 'STAFF', permissions: [] } };
      const staffPut = new Request('http://localhost/api/careers/jobs/j1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });
      expect((await JobDetailPUT(staffPut as any, { params: Promise.resolve({ id: 'j1' }) })).status).toBe(403);

      // PUT 200 HR_ADMIN
      mockSession = { user: { id: 'hr-1', role: 'HR_ADMIN' } };
      (db.job.findUnique as any).mockResolvedValue({ id: 'j1', title: 'Old' });
      (db.job.update as any).mockResolvedValue({ id: 'j1', title: 'Updated' });
      const hrPut = new Request('http://localhost/api/careers/jobs/j1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });
      expect((await JobDetailPUT(hrPut as any, { params: Promise.resolve({ id: 'j1' }) })).status).toBe(200);

      // DELETE 403 Generic STAFF
      mockSession = { user: { id: 'staff-1', role: 'STAFF', permissions: [] } };
      const staffDel = new Request('http://localhost/api/careers/jobs/j1', { method: 'DELETE' });
      expect((await JobDetailDELETE(staffDel as any, { params: Promise.resolve({ id: 'j1' }) })).status).toBe(403);

      // DELETE 200 SUPER_ADMIN
      mockSession = { user: { id: 'super-1', role: 'SUPER_ADMIN' } };
      (db.job.delete as any).mockResolvedValue({ id: 'j1' });
      const superDel = new Request('http://localhost/api/careers/jobs/j1', { method: 'DELETE' });
      expect((await JobDetailDELETE(superDel as any, { params: Promise.resolve({ id: 'j1' }) })).status).toBe(200);
    });

    it('Status PUT and PATCH enforce 401 unauth, 403 generic STAFF, and 200 for HR', async () => {
      mockSession = null;
      const unauthReq = new Request('http://localhost/api/careers/app-1/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVIEWING' }),
      });
      expect((await StatusPUT(unauthReq as any, { params: Promise.resolve({ id: 'app-1' }) })).status).toBe(401);

      mockSession = { user: { id: 'staff-1', role: 'STAFF', permissions: [] } };
      const staffReq = new Request('http://localhost/api/careers/app-1/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVIEWING' }),
      });
      expect((await StatusPUT(staffReq as any, { params: Promise.resolve({ id: 'app-1' }) })).status).toBe(403);

      mockSession = { user: { id: 'hr-1', role: 'HR_ADMIN' } };
      (db.jobApplication.findUnique as any).mockResolvedValue({ id: 'app-1', status: 'NEW' });
      (db.jobApplication.update as any).mockResolvedValue({ id: 'app-1', status: 'REVIEWING' });
      const hrReq = new Request('http://localhost/api/careers/app-1/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVIEWING' }),
      });
      expect((await StatusPUT(hrReq as any, { params: Promise.resolve({ id: 'app-1' }) })).status).toBe(200);
    });

    it('CV parsing APIs (/api/careers/:id/parse & /api/talent/parse) enforce 401 unauth and 403 generic STAFF', async () => {
      // 401 Unauth
      mockSession = null;
      const unauthParse = new Request('http://localhost/api/careers/app-1/parse', { method: 'POST' });
      expect((await ParseCVPOST(unauthParse as any, { params: Promise.resolve({ id: 'app-1' }) })).status).toBe(401);

      // 403 Generic STAFF
      mockSession = { user: { id: 'staff-1', role: 'STAFF', permissions: [] } };
      const staffParse = new Request('http://localhost/api/careers/app-1/parse', { method: 'POST' });
      expect((await ParseCVPOST(staffParse as any, { params: Promise.resolve({ id: 'app-1' }) })).status).toBe(403);

      // 200 HR_ADMIN
      mockSession = { user: { id: 'hr-1', role: 'HR_ADMIN' } };
      (db.jobApplication.findUnique as any).mockResolvedValue({ id: 'app-1', cvUrl: 'https://cdn.e3.qa/cv.pdf' });
      (db.jobApplication.update as any).mockResolvedValue({ id: 'app-1', status: 'REVIEWING' });
      const hrParse = new Request('http://localhost/api/careers/app-1/parse', { method: 'POST' });
      expect((await ParseCVPOST(hrParse as any, { params: Promise.resolve({ id: 'app-1' }) })).status).toBe(200);

      // Talent Parse 403 Generic STAFF
      mockSession = { user: { id: 'staff-1', role: 'STAFF', permissions: [] } };
      const staffTalentParse = new Request('http://localhost/api/talent/parse', { method: 'POST' });
      expect((await ParseTalentPOST(staffTalentParse as any)).status).toBe(403);
    });
  });

  // =========================================================================
  // 6. CANONICAL APPLICATION LINEAGE & STATUS WORKFLOW (QF-22-B)
  // =========================================================================
  describe('6. Canonical Application Lineage & Status Workflow', () => {
    it('creates canonical JobApplication linked to target Job, accessible by candidate and HR', async () => {
      (db.job.findUnique as any).mockResolvedValue({
        id: 'target-job-1',
        title: 'Lead Audio Engineer',
        department: 'Creative Staging',
        isPublished: true,
      });

      (db.user.findUnique as any).mockResolvedValue(null);
      (db.user.create as any).mockResolvedValue({ id: 'user-cand-1', email: 'cand@example.com' });
      (db.jobApplication.create as any).mockResolvedValue({
        id: 'app-canonical-101',
        jobTitle: 'Lead Audio Engineer',
        department: 'Creative Staging',
        userId: 'user-cand-1',
        email: 'cand@example.com',
        status: 'NEW',
      });
      (db.talent.create as any).mockResolvedValue({ id: 'talent-101', jobId: 'target-job-1' });

      // 1. Submit application via public API
      const applyReq = new Request('http://localhost/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Rashid',
          lastName: 'Al-Kuwari',
          email: 'cand@example.com',
          password: 'Password123!',
          jobId: 'target-job-1',
          jobTitle: 'Lead Audio Engineer',
          cvUrl: 'https://cdn.e3.qa/cv.pdf',
        }),
      });

      const applyRes = await ApplyPOST(applyReq as any);
      expect(applyRes.status).toBe(200);
      const applyJson = await applyRes.json();
      expect(applyJson.application.id).toBe('app-canonical-101');

      // 2. Candidate reads own application status (200)
      mockSession = { user: { id: 'user-cand-1', email: 'cand@example.com', role: 'CANDIDATE' } };
      (db.jobApplication.findUnique as any).mockResolvedValue({
        id: 'app-canonical-101',
        jobTitle: 'Lead Audio Engineer',
        department: 'Creative Staging',
        userId: 'user-cand-1',
        email: 'cand@example.com',
        status: 'NEW',
      });

      const candStatusReq = new Request('http://localhost/api/careers/app-canonical-101/status');
      const candStatusRes = await StatusGET(candStatusReq as any, { params: Promise.resolve({ id: 'app-canonical-101' }) });
      expect(candStatusRes.status).toBe(200);
      const candStatusJson = await candStatusRes.json();
      expect(candStatusJson.application.status).toBe('NEW');

      // 3. Candidate blocked from other application (403)
      mockSession = { user: { id: 'other-cand', email: 'other@example.com', role: 'CANDIDATE' } };
      const intruderReq = new Request('http://localhost/api/careers/app-canonical-101/status');
      expect((await StatusGET(intruderReq as any, { params: Promise.resolve({ id: 'app-canonical-101' }) })).status).toBe(403);

      // 4. Generic STAFF blocked from application status (403)
      mockSession = { user: { id: 'staff-generic', role: 'STAFF', permissions: [] } };
      const staffStatusReq = new Request('http://localhost/api/careers/app-canonical-101/status');
      expect((await StatusGET(staffStatusReq as any, { params: Promise.resolve({ id: 'app-canonical-101' }) })).status).toBe(403);

      // 5. HR updates status to INTERVIEW via PUT / PATCH (200)
      mockSession = { user: { id: 'hr-admin-1', role: 'HR_ADMIN' } };
      (db.jobApplication.findUnique as any).mockResolvedValue({ id: 'app-canonical-101', status: 'NEW' });
      (db.jobApplication.update as any).mockResolvedValue({ id: 'app-canonical-101', status: 'INTERVIEW' });

      const patchReq = new Request('http://localhost/api/careers/app-canonical-101/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'INTERVIEW' }),
      });
      const patchRes = await StatusPATCH(patchReq as any, { params: Promise.resolve({ id: 'app-canonical-101' }) });
      expect(patchRes.status).toBe(200);
    });

    it('processes generic open application through the exact same JobApplication pipeline with nullable job relation', async () => {
      (db.user.findUnique as any).mockResolvedValue(null);
      (db.user.create as any).mockResolvedValue({ id: 'user-open-1', email: 'open@example.com' });
      (db.jobApplication.create as any).mockResolvedValue({
        id: 'app-open-202',
        jobTitle: 'General Open Application',
        userId: 'user-open-1',
        email: 'open@example.com',
        status: 'NEW',
      });
      (db.talent.create as any).mockResolvedValue({ id: 'talent-202', jobId: null });

      const req = new Request('http://localhost/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Mariam',
          lastName: 'Al-Thani',
          email: 'open@example.com',
          password: 'Password123!',
          jobTitle: 'General Open Application',
          cvUrl: 'https://cdn.e3.qa/mariam_cv.pdf',
        }),
      });

      const res = await ApplyPOST(req as any);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.application.id).toBe('app-open-202');
      expect(db.talent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            jobId: null,
          }),
        })
      );
    });
  });
});
