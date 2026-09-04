import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getProfile, PATCH as updateProfile } from '../app/api/candidate/profile/route';
import { POST as parseResume } from '../app/api/candidate/resume/parse/route';
import { POST as addApplicationNote } from '../app/api/candidate/applications/[id]/notes/route';
import { POST as withdrawApplication } from '../app/api/candidate/applications/[id]/withdraw/route';
import { db } from '../lib/db';
import { auth } from '../lib/auth';

// Mock auth
vi.mock('../lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock db
vi.mock('../lib/db', () => {
  const mockDb = {
    user: { findUnique: vi.fn(), update: vi.fn() },
    jobApplication: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    job: { findMany: vi.fn() },
  };
  return { db: mockDb, default: mockDb };
});

describe('Candidate Job Portal: Completed Modules & Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCandidateUser = {
    id: 'cand-user-77',
    name: 'Tariq Al-Mansoor',
    email: 'tariq@av-qatar.qa',
    role: 'CANDIDATE',
    isActive: true,
    sessionVersion: 1,
  };

  const mockApplication = {
    id: 'app-canonical-88',
    userId: mockCandidateUser.id,
    firstName: 'Tariq',
    lastName: 'Al-Mansoor',
    email: mockCandidateUser.email,
    phone: '+974 5511 2233',
    jobTitle: 'Lead AV Systems Engineer',
    department: 'Engineering',
    cvUrl: 'https://cdn.e3.qa/resumes/tariq_cv.pdf',
    status: 'REVIEWING',
    createdAt: new Date('2026-06-10T10:00:00Z'),
    updatedAt: new Date('2026-06-12T14:00:00Z'),
    cvParsedData: {
      position: 'Lead AV Systems Engineer',
      skills: ['Live Audio Engineering', 'GrandMA3', 'Dante Audio'],
      summary: 'Experienced audio-visual systems engineer in Qatar.',
    },
  };

  it('1. GET /api/candidate/profile returns candidate profile, contact info, and skills', async () => {
    (auth as any).mockResolvedValue({ user: mockCandidateUser });
    (db.user.findUnique as any).mockResolvedValue(mockCandidateUser);
    (db.jobApplication.findFirst as any).mockResolvedValue(mockApplication);
    (db.jobApplication.count as any).mockResolvedValue(1);

    const res = await getProfile();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.profile.name).toBe('Tariq Al-Mansoor');
    expect(json.profile.headline).toBe('Lead AV Systems Engineer');
    expect(json.profile.skills).toContain('Dante Audio');
    expect(json.profile.totalApplications).toBe(1);
  });

  it('2. PATCH /api/candidate/profile updates user name and candidate application credentials', async () => {
    (auth as any).mockResolvedValue({ user: mockCandidateUser });
    (db.user.findUnique as any).mockResolvedValue(mockCandidateUser);
    (db.jobApplication.findFirst as any).mockResolvedValue(mockApplication);
    (db.user.update as any).mockResolvedValue({ ...mockCandidateUser, name: 'Tariq Al-Mansoor QA' });
    (db.jobApplication.update as any).mockResolvedValue({ ...mockApplication });

    const req = new Request('http://localhost:3000/api/candidate/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tariq Al-Mansoor QA',
        phone: '+974 3300 4455',
        headline: 'Senior Technical Production Director',
        skills: ['Live Audio Engineering', 'GrandMA3', 'Dante Audio', 'Unreal Engine'],
        location: 'West Bay, Doha',
        portfolioUrl: 'https://tariq-portfolio.qa',
      }),
    });

    const res = await updateProfile(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: mockCandidateUser.id },
      data: { name: 'Tariq Al-Mansoor QA' },
    });
    expect(db.jobApplication.update).toHaveBeenCalled();
  });

  it('3. POST /api/candidate/resume/parse extracts skills and updates candidate cvParsedData', async () => {
    (auth as any).mockResolvedValue({ user: mockCandidateUser });
    (db.user.findUnique as any).mockResolvedValue(mockCandidateUser);
    (db.jobApplication.findFirst as any).mockResolvedValue(mockApplication);
    (db.jobApplication.update as any).mockResolvedValue({ ...mockApplication });

    const req = new Request('http://localhost:3000/api/candidate/resume/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeUrl: 'https://cdn.e3.qa/resumes/tariq_cv.pdf' }),
    });

    const res = await parseResume(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.extractedData).toBeDefined();
    expect(Array.isArray(json.extractedData.skills)).toBe(true);
  });

  it('4. POST /api/candidate/applications/[id]/notes appends note to candidate application', async () => {
    (auth as any).mockResolvedValue({ user: mockCandidateUser });
    (db.user.findUnique as any).mockResolvedValue(mockCandidateUser);
    (db.jobApplication.findFirst as any).mockResolvedValue(mockApplication);
    (db.jobApplication.update as any).mockResolvedValue({ ...mockApplication });

    const req = new Request('http://localhost:3000/api/candidate/applications/app-canonical-88/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Updated Showreel Link',
        message: 'Please review my latest stage automation reel at https://vimeo.com/12345678',
      }),
    });

    const res = await addApplicationNote(req, {
      params: Promise.resolve({ id: 'app-canonical-88' }),
    });

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.note.message).toContain('vimeo.com/12345678');
  });

  it('5. POST /api/candidate/applications/[id]/withdraw marks application as WITHDRAWN', async () => {
    (auth as any).mockResolvedValue({ user: mockCandidateUser });
    (db.user.findUnique as any).mockResolvedValue(mockCandidateUser);
    (db.jobApplication.findFirst as any).mockResolvedValue(mockApplication);
    (db.jobApplication.update as any).mockResolvedValue({
      ...mockApplication,
      status: 'WITHDRAWN',
    });

    const req = new Request('http://localhost:3000/api/candidate/applications/app-canonical-88/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Accepted another offer in Qatar' }),
    });

    const res = await withdrawApplication(req, {
      params: Promise.resolve({ id: 'app-canonical-88' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(db.jobApplication.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockApplication.id },
        data: expect.objectContaining({ status: 'WITHDRAWN' }),
      })
    );
  });
});
