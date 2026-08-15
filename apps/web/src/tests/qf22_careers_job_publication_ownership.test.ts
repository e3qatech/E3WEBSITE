import { describe, it, expect, vi, beforeEach } from 'vitest';
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
import { GET as StatusGET, PUT as StatusPUT } from '../app/api/careers/[id]/status/route';

describe('QF-22 — Careers Job Publication & Application Ownership Suite', () => {
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
      const resClosed = isJobPubliclyEligible(closedJob);
      expect(resClosed.eligible).toBe(false);
      expect(resClosed.isClosed).toBe(true);

      const archivedJob: CanonicalJobInput = {
        id: 'job-5',
        title: 'Archived Position',
        isPublished: true,
        status: 'ARCHIVED',
      };
      const resArchived = isJobPubliclyEligible(archivedJob);
      expect(resArchived.eligible).toBe(false);
      expect(resArchived.isClosed).toBe(true);
    });

    it('filterPubliclyEligibleJobs filters out draft, closed, and expired jobs', () => {
      const jobs: CanonicalJobInput[] = [
        { id: '1', title: 'Open 1', isPublished: true },
        { id: '2', title: 'Draft', isPublished: false },
        { id: '3', title: 'Closed', isPublished: true, status: 'CLOSED' },
        { id: '4', title: 'Open 2', isPublished: true, status: 'PUBLISHED' },
      ];
      const filtered = filterPubliclyEligibleJobs(jobs);
      expect(filtered.map((j) => j.id)).toEqual(['1', '4']);
    });
  });

  // =========================================================================
  // 2. QATAR TIMEZONE & DEADLINE BOUNDARIES (Asia/Qatar UTC+3)
  // =========================================================================
  describe('2. Qatar Timezone & Deadline Boundaries', () => {
    it('verifies Qatar timezone configuration is Asia/Qatar (UTC+3)', () => {
      expect(QATAR_TIMEZONE).toBe('Asia/Qatar');
      expect(QATAR_UTC_OFFSET_HOURS).toBe(3);
    });

    it('considers future deadline in Qatar time as open and eligible', () => {
      const fixedNow = new Date('2026-08-15T10:00:00.000Z');
      const futureDeadline = '2026-08-31';

      expect(isDeadlineExpired(futureDeadline, fixedNow)).toBe(false);

      const job: CanonicalJobInput = {
        id: 'job-future',
        title: 'Future Role',
        isPublished: true,
        deadline: futureDeadline,
      };
      const res = isJobPubliclyEligible(job, fixedNow);
      expect(res.eligible).toBe(true);
      expect(res.isExpired).toBe(false);
    });

    it('considers elapsed deadline in Qatar time as expired and closed', () => {
      const fixedNow = new Date('2026-08-15T10:00:00.000Z');
      const pastDeadline = '2026-08-01'; // Expired on August 1st

      expect(isDeadlineExpired(pastDeadline, fixedNow)).toBe(true);

      const job: CanonicalJobInput = {
        id: 'job-past',
        title: 'Expired Role',
        isPublished: true,
        deadline: pastDeadline,
      };
      const res = isJobPubliclyEligible(job, fixedNow);
      expect(res.eligible).toBe(false);
      expect(res.isExpired).toBe(true);
      expect(res.isClosed).toBe(true);
      expect(res.reason).toContain('deadline');
    });

    it('evaluates exact end-of-day deadline cutoff in Qatar time (23:59:59.999 UTC+3 -> 20:59:59.999 UTC)', () => {
      const deadlineDate = '2026-08-15';
      const parsedUtc = parseQatarDeadline(deadlineDate);

      expect(parsedUtc).not.toBeNull();
      // In UTC, 23:59:59.999 in UTC+3 is 20:59:59.999 UTC
      expect(parsedUtc?.getUTCHours()).toBe(20);
      expect(parsedUtc?.getUTCMinutes()).toBe(59);

      // Just before deadline (20:59:00 UTC) -> Open
      const justBefore = new Date(Date.UTC(2026, 7, 15, 20, 59, 0));
      expect(isDeadlineExpired(deadlineDate, justBefore)).toBe(false);

      // Just after deadline (21:00:00 UTC) -> Expired
      const justAfter = new Date(Date.UTC(2026, 7, 15, 21, 0, 1));
      expect(isDeadlineExpired(deadlineDate, justAfter)).toBe(true);
    });
  });

  // =========================================================================
  // 3. READ-ONLY DATA QUALITY ANALYZER & SAFE PRESENTATION CASING
  // =========================================================================
  describe('3. Data Quality Analyzer & Safe Presentation Formatter', () => {
    it('analyzes production fixture (lowercase "designer", "branding", "qatar") without mutating stored record', () => {
      const prodFixture: CanonicalJobInput = {
        id: 'prod-1',
        titleEn: 'designer',
        titleAr: '',
        department: 'branding',
        location: 'qatar',
        type: 'Full-time',
        description: 'Short desc',
        isPublished: false,
      };

      const dq = analyzeJobDataQuality(prodFixture);
      expect(dq.isClean).toBe(false);
      expect(dq.issues.some((i) => i.code === 'LOWERCASE_TEXT')).toBe(true);
      expect(dq.issues.some((i) => i.code === 'MISSING_ARABIC')).toBe(true);
      expect(dq.issues.some((i) => i.code === 'MISSING_DEADLINE')).toBe(true);
      expect(dq.issues.some((i) => i.code === 'SHORT_DESCRIPTION')).toBe(true);

      // Proves original fixture properties were NOT mutated
      expect(prodFixture.titleEn).toBe('designer');
      expect(prodFixture.department).toBe('branding');
      expect(prodFixture.location).toBe('qatar');
    });

    it('formats presentation cleanly with title casing and safe public fields', () => {
      const prodFixture: CanonicalJobInput = {
        id: 'prod-1',
        title: 'designer',
        department: 'branding',
        location: 'qatar',
        type: 'FULL_TIME',
        description: 'Creating high quality brand assets and visual identity.',
        requirements: 'Figma proficiency',
        isPublished: true,
      };

      const formattedEn = formatJobPresentation(prodFixture, 'en');
      expect(formattedEn.title).toBe('Designer');
      expect(formattedEn.location).toBe('Qatar');
      expect(formattedEn.type).toBe('Full Time');

      const formattedAr = formatJobPresentation(prodFixture, 'ar');
      expect(formattedAr.department).toBe('العلامة التجارية والتصميم');
    });

    it('properly capitalizes common acronyms like AV, QA, IT, HR, B2B, B2C', () => {
      expect(toTitleCase('senior av engineer')).toBe('Senior AV Engineer');
      expect(toTitleCase('lead qa specialist')).toBe('Lead QA Specialist');
      expect(toTitleCase('b2b sales manager')).toBe('B2B Sales Manager');
      expect(toTitleCase('e3 creative lead')).toBe('E3 Creative Lead');
    });
  });

  // =========================================================================
  // 4. PUBLIC APPLY ROUTE & CLOSED-JOB BLOCKING
  // =========================================================================
  describe('4. Public Apply Route & Closed-Job Blocking', () => {
    it('blocks applications to closed/expired jobs with 422 Unprocessable Entity', async () => {
      // Mock job lookup returning closed job
      (db.job.findUnique as any).mockResolvedValue({
        id: 'closed-1',
        title: 'Closed Architect Role',
        isPublished: false,
        status: 'CLOSED',
      });

      const req = new Request('http://localhost/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          jobId: 'closed-1',
          jobTitle: 'Closed Architect Role',
          cvUrl: 'https://example.com/cv.pdf',
        }),
      });

      const res = await ApplyPOST(req as any);
      expect(res.status).toBe(422);

      const json = await res.json();
      expect(json.code).toBe('JOB_CLOSED');
      expect(json.eligibility.isClosed).toBe(true);
    });

    it('accepts applications to active, published jobs and links jobId to Talent record', async () => {
      (db.job.findUnique as any).mockResolvedValue({
        id: 'active-1',
        title: 'Senior Creative Technologist',
        department: 'Creative',
        isPublished: true,
        status: 'ACTIVE',
      });

      (db.user.findUnique as any).mockResolvedValue(null);
      (db.user.create as any).mockResolvedValue({
        id: 'user-cand-1',
        email: 'cand@example.com',
        role: 'CANDIDATE',
      });
      (db.jobApplication.create as any).mockResolvedValue({
        id: 'app-cand-1',
        jobTitle: 'Senior Creative Technologist',
        department: 'Creative',
        userId: 'user-cand-1',
        status: 'NEW',
      });
      (db.talent.create as any).mockResolvedValue({
        id: 'talent-1',
        jobId: 'active-1',
      });

      const req = new Request('http://localhost/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Sara',
          lastName: 'Ali',
          email: 'cand@example.com',
          password: 'SecurePassword123!',
          jobId: 'active-1',
          jobTitle: 'Senior Creative Technologist',
          cvUrl: 'https://example.com/sara_cv.pdf',
        }),
      });

      const res = await ApplyPOST(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.application).toBeDefined();

      // Proves Talent was created with linked jobId
      expect(db.talent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            jobId: 'active-1',
            position: 'Senior Creative Technologist',
          }),
        })
      );
    });

    it('allows generic open applications when jobId is omitted', async () => {
      (db.user.findUnique as any).mockResolvedValue(null);
      (db.user.create as any).mockResolvedValue({
        id: 'user-cand-2',
        email: 'open@example.com',
        role: 'CANDIDATE',
      });
      (db.jobApplication.create as any).mockResolvedValue({
        id: 'app-cand-2',
        jobTitle: 'General Open Application',
        userId: 'user-cand-2',
        status: 'NEW',
      });
      (db.talent.create as any).mockResolvedValue({
        id: 'talent-2',
        jobId: null,
      });

      const req = new Request('http://localhost/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Fatima',
          lastName: 'Al-Kuwari',
          email: 'open@example.com',
          password: 'SecurePassword123!',
          jobTitle: 'General Open Application',
          cvUrl: 'https://example.com/fatima_cv.pdf',
        }),
      });

      const res = await ApplyPOST(req as any);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  // =========================================================================
  // 5. SERVER-SIDE HR RBAC & PERMISSIONS
  // =========================================================================
  describe('5. Server-Side HR RBAC & Permissions', () => {
    it('isHRAuthorized permits SUPER_ADMIN, HR_ADMIN, HR, and STAFF', () => {
      expect(isHRAuthorized('SUPER_ADMIN')).toBe(true);
      expect(isHRAuthorized('HR_ADMIN')).toBe(true);
      expect(isHRAuthorized('HR')).toBe(true);
      expect(isHRAuthorized('STAFF')).toBe(true);
      expect(isHRAuthorized('ADMIN')).toBe(true);

      expect(isHRAuthorized('CLIENT')).toBe(false);
      expect(isHRAuthorized('CANDIDATE')).toBe(false);
      expect(isHRAuthorized(null)).toBe(false);
      expect(isHRAuthorized(undefined)).toBe(false);
    });

    it('POST /api/careers/jobs returns 401 when unauthenticated', async () => {
      mockSession = null;

      const req = new Request('http://localhost/api/careers/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Position',
          description: 'A comprehensive description.',
        }),
      });

      const res = await JobsPOST(req as any);
      expect(res.status).toBe(401);
    });

    it('POST /api/careers/jobs returns 403 when authenticated as unauthorized role (e.g. CLIENT)', async () => {
      mockSession = { user: { id: 'u1', role: 'CLIENT' } };

      const req = new Request('http://localhost/api/careers/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized Position',
          description: 'A comprehensive description.',
        }),
      });

      const res = await JobsPOST(req as any);
      expect(res.status).toBe(403);
    });

    it('POST /api/careers/jobs succeeds when authenticated as SUPER_ADMIN or HR_ADMIN', async () => {
      mockSession = { user: { id: 'hr-1', role: 'SUPER_ADMIN' } };

      (db.job.create as any).mockResolvedValue({
        id: 'new-job-1',
        title: 'Principal Sound Designer',
        department: 'Creative',
        isPublished: true,
        createdAt: new Date(),
      });

      const req = new Request('http://localhost/api/careers/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Principal Sound Designer',
          department: 'Creative',
          description: 'Leading acoustic audio engineering for immersive installations.',
          isPublished: true,
        }),
      });

      const res = await JobsPOST(req as any);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.job.title).toBe('Principal Sound Designer');
    });

    it('PUT /api/careers/jobs/:id returns 403 for unauthorized users and updates for HR', async () => {
      mockSession = { user: { id: 'cand-1', role: 'CANDIDATE' } };

      const reqUnauthorized = new Request('http://localhost/api/careers/jobs/job-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Hacked Title' }),
      });

      const resUnauth = await JobDetailPUT(reqUnauthorized as any, { params: Promise.resolve({ id: 'job-1' }) });
      expect(resUnauth.status).toBe(403);

      // Now HR Admin
      mockSession = { user: { id: 'hr-1', role: 'HR_ADMIN' } };
      (db.job.findUnique as any).mockResolvedValue({ id: 'job-1', title: 'Old Title' });
      (db.job.update as any).mockResolvedValue({ id: 'job-1', title: 'Updated Title' });

      const reqAuth = new Request('http://localhost/api/careers/jobs/job-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' }),
      });

      const resAuth = await JobDetailPUT(reqAuth as any, { params: Promise.resolve({ id: 'job-1' }) });
      expect(resAuth.status).toBe(200);
      const jsonAuth = await resAuth.json();
      expect(jsonAuth.success).toBe(true);
    });

    it('GET /api/careers/jobs returns enriched staff data for HR and public filtered for visitors', async () => {
      // HR view with ?all=true
      mockSession = { user: { id: 'hr-1', role: 'SUPER_ADMIN' } };
      (db.job.findMany as any).mockResolvedValue([
        { id: 'j1', title: 'designer', isPublished: false, _count: { applications: 3 } },
      ]);

      const reqStaff = new Request('http://localhost/api/careers/jobs?all=true');
      const resStaff = await JobsGET(reqStaff as any);
      expect(resStaff.status).toBe(200);
      const jsonStaff = await resStaff.json();
      expect(jsonStaff.jobs[0].dataQuality).toBeDefined();

      // Public view
      mockSession = null;
      (db.job.findMany as any).mockResolvedValue([
        { id: 'j2', title: 'designer', isPublished: true },
      ]);
      const reqPublic = new Request('http://localhost/api/careers/jobs');
      const resPublic = await JobsGET(reqPublic as any);
      expect(resPublic.status).toBe(200);
      const jsonPublic = await resPublic.json();
      expect(jsonPublic.jobs[0].title).toBe('Designer');
    });

    it('GET /api/careers/jobs/:id returns 404 for missing jobs, safe view for public, and full report for HR', async () => {
      // 404
      (db.job.findUnique as any).mockResolvedValue(null);
      const req404 = new Request('http://localhost/api/careers/jobs/non-existent');
      const res404 = await JobDetailGET(req404 as any, { params: Promise.resolve({ id: 'non-existent' }) });
      expect(res404.status).toBe(404);

      // HR View
      mockSession = { user: { id: 'hr-1', role: 'HR_ADMIN' } };
      (db.job.findUnique as any).mockResolvedValue({ id: 'j-detail', title: 'engineer', isPublished: true });
      const reqHR = new Request('http://localhost/api/careers/jobs/j-detail?all=true');
      const resHR = await JobDetailGET(reqHR as any, { params: Promise.resolve({ id: 'j-detail' }) });
      expect(resHR.status).toBe(200);
      const jsonHR = await resHR.json();
      expect(jsonHR.job.dataQuality).toBeDefined();
    });

    it('DELETE /api/careers/jobs/:id blocks non-HR and allows HR', async () => {
      mockSession = { user: { id: 'cand-1', role: 'CLIENT' } };
      const reqUnauth = new Request('http://localhost/api/careers/jobs/j-del', { method: 'DELETE' });
      const resUnauth = await JobDetailDELETE(reqUnauth as any, { params: Promise.resolve({ id: 'j-del' }) });
      expect(resUnauth.status).toBe(403);

      mockSession = { user: { id: 'hr-1', role: 'HR' } };
      (db.job.delete as any).mockResolvedValue({ id: 'j-del' });
      const reqAuth = new Request('http://localhost/api/careers/jobs/j-del', { method: 'DELETE' });
      const resAuth = await JobDetailDELETE(reqAuth as any, { params: Promise.resolve({ id: 'j-del' }) });
      expect(resAuth.status).toBe(200);
    });

    it('PUT /api/careers/:id/status updates status for HR and rejects non-HR', async () => {
      mockSession = { user: { id: 'cand-1', role: 'CANDIDATE' } };
      const reqUnauth = new Request('http://localhost/api/careers/app-1/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'HIRED' }),
      });
      const resUnauth = await StatusPUT(reqUnauth as any, { params: Promise.resolve({ id: 'app-1' }) });
      expect(resUnauth.status).toBe(403);

      mockSession = { user: { id: 'hr-1', role: 'HR_ADMIN' } };
      (db.jobApplication.findUnique as any).mockResolvedValue({ id: 'app-1', status: 'REVIEWING' });
      (db.jobApplication.update as any).mockResolvedValue({ id: 'app-1', status: 'HIRED' });
      const reqAuth = new Request('http://localhost/api/careers/app-1/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'HIRED' }),
      });
      const resAuth = await StatusPUT(reqAuth as any, { params: Promise.resolve({ id: 'app-1' }) });
      expect(resAuth.status).toBe(200);
    });
  });

  // =========================================================================
  // 6. CANDIDATE ISOLATION & QF-06 PROTECTIONS
  // =========================================================================
  describe('6. Candidate Isolation & QF-06 Protections', () => {
    it('prevents candidate from accessing another candidate application status (403 IDOR check)', async () => {
      mockSession = { user: { id: 'cand-attacker', email: 'attacker@example.com', role: 'CANDIDATE' } };

      (db.jobApplication.findUnique as any).mockResolvedValue({
        id: 'victim-app-1',
        jobTitle: 'Lead Engineer',
        userId: 'cand-victim',
        email: 'victim@example.com',
        status: 'NEW',
      });

      const req = new Request('http://localhost/api/careers/victim-app-1/status', { method: 'GET' });
      const res = await StatusGET(req as any, { params: Promise.resolve({ id: 'victim-app-1' }) });
      expect(res.status).toBe(403);
    });

    it('allows candidate to view their own application status', async () => {
      mockSession = { user: { id: 'cand-owner', email: 'owner@example.com', role: 'CANDIDATE' } };

      (db.jobApplication.findUnique as any).mockResolvedValue({
        id: 'owner-app-1',
        jobTitle: 'Lead Engineer',
        department: 'Engineering',
        userId: 'cand-owner',
        email: 'owner@example.com',
        status: 'INTERVIEW',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const req = new Request('http://localhost/api/careers/owner-app-1/status', { method: 'GET' });
      const res = await StatusGET(req as any, { params: Promise.resolve({ id: 'owner-app-1' }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.application.status).toBe('INTERVIEW');
    });

    it('allows HR staff to view any candidate application status', async () => {
      mockSession = { user: { id: 'hr-reviewer', role: 'HR_ADMIN' } };

      (db.jobApplication.findUnique as any).mockResolvedValue({
        id: 'any-app-1',
        jobTitle: 'Operations Manager',
        department: 'Operations',
        userId: 'some-cand',
        email: 'some.cand@example.com',
        status: 'NEW',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const req = new Request('http://localhost/api/careers/any-app-1/status', { method: 'GET' });
      const res = await StatusGET(req as any, { params: Promise.resolve({ id: 'any-app-1' }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
