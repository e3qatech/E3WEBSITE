import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as createRfp } from '../app/api/business/rfps/route';
import { PATCH as updateOrg } from '../app/api/business/organization/route';
import { POST as inviteTeamMember } from '../app/api/business/team/invite/route';
import { POST as sendRfpMessage } from '../app/api/business/rfps/[id]/messages/route';
import { db } from '../lib/db';
import { auth } from '../lib/auth';

// Mock auth
vi.mock('../lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock db
vi.mock('../lib/db', () => {
  const mockDb = {
    user: { findUnique: vi.fn() },
    client: { findUnique: vi.fn(), update: vi.fn() },
    clientMembership: { findFirst: vi.fn() },
    lead: { findUnique: vi.fn(), create: vi.fn() },
    inquiry: { create: vi.fn() },
    leadActivity: { create: vi.fn() },
    invitationToken: { create: vi.fn() },
    rfpUpload: { findMany: vi.fn() },
  };
  return { db: mockDb, default: mockDb };
});

describe('Client B2B Portal: Finished Modules & Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockClientUser = {
    id: 'user-client-1',
    name: 'Jassim Al-Thani',
    email: 'jassim@qatar-holdings.qa',
    role: 'CLIENT',
    isActive: true,
    sessionVersion: 1,
  };

  const mockClientOrg = {
    id: 'client-org-1',
    company: 'Qatar Holdings Group',
    industry: 'Hospitality & Events',
    website: 'https://qatarholdings.qa',
  };

  const mockMembershipOwner = {
    id: 'mem-owner-1',
    userId: mockClientUser.id,
    clientId: mockClientOrg.id,
    role: 'OWNER',
    isActive: true,
    client: mockClientOrg,
  };

  it('1. POST /api/business/rfps creates a new lead and inquiry for the authenticated client', async () => {
    (auth as any).mockResolvedValue({ user: mockClientUser });
    (db.user.findUnique as any).mockResolvedValue(mockClientUser);
    (db.clientMembership.findFirst as any).mockResolvedValue(mockMembershipOwner);

    const createdLead = {
      id: 'lead-new-1',
      name: 'Grand Winter Pavilion',
      company: 'Qatar Holdings Group',
      email: mockClientUser.email,
      status: 'NEW',
      interestServices: ['Turnkey Spatial Design'],
    };
    (db.lead.create as any).mockResolvedValue(createdLead);
    (db.inquiry.create as any).mockResolvedValue({ id: 'inq-1', leadId: createdLead.id });
    (db.leadActivity.create as any).mockResolvedValue({ id: 'act-1' });

    const req = new Request('http://localhost:3000/api/business/rfps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Grand Winter Pavilion',
        description: 'Complete spatial installation for winter season.',
        services: ['Turnkey Spatial Design'],
        budget: '500k - 1M QAR',
        targetDate: '2026-12-01',
      }),
    });

    const res = await createRfp(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.lead.id).toBe('lead-new-1');
  });

  it('2. PATCH /api/business/organization allows OWNER/ADMIN to update profile', async () => {
    (auth as any).mockResolvedValue({ user: mockClientUser });
    (db.user.findUnique as any).mockResolvedValue(mockClientUser);
    (db.clientMembership.findFirst as any).mockResolvedValue(mockMembershipOwner);

    (db.client.update as any).mockResolvedValue({
      ...mockClientOrg,
      website: 'https://updated-domain.qa',
      phone: '+974 4400 1122',
    });

    const req = new Request('http://localhost:3000/api/business/organization', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        website: 'https://updated-domain.qa',
        phone: '+974 4400 1122',
        address: 'West Bay Tower 4, Doha',
      }),
    });

    const res = await updateOrg(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.client.website).toBe('https://updated-domain.qa');
  });

  it('3. POST /api/business/team/invite generates 7-day invitation link', async () => {
    (auth as any).mockResolvedValue({ user: mockClientUser });
    (db.user.findUnique as any).mockResolvedValue(mockClientUser);
    (db.clientMembership.findFirst as any).mockResolvedValue(mockMembershipOwner);
    (db.invitationToken.create as any).mockResolvedValue({ id: 'inv-tok-1' });

    const req = new Request('http://localhost:3000/api/business/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'colleague@qatar-holdings.qa',
        role: 'MEMBER',
      }),
    });

    const res = await inviteTeamMember(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.inviteUrl).toContain('/auth/accept-invitation?token=');
  });

  it('4. POST /api/business/rfps/[id]/messages allows client to add follow-up inquiries to their RFP', async () => {
    (auth as any).mockResolvedValue({ user: mockClientUser });
    (db.user.findUnique as any).mockResolvedValue(mockClientUser);
    (db.clientMembership.findFirst as any).mockResolvedValue(mockMembershipOwner);

    const leadExisting = {
      id: 'lead-existing-1',
      name: 'Grand Winter Pavilion',
      company: 'Qatar Holdings Group',
      email: mockClientUser.email,
      status: 'PROPOSAL_SENT',
      inquiries: [],
      activities: [],
      uploads: [],
    };
    (db.lead.findUnique as any).mockResolvedValue(leadExisting);
    (db.rfpUpload.findMany as any).mockResolvedValue([]);
    (db.inquiry.create as any).mockResolvedValue({
      id: 'inq-new-99',
      leadId: leadExisting.id,
      message: 'Can you provide the updated acoustic calculation sheets?',
      type: 'MESSAGE',
    });
    (db.leadActivity.create as any).mockResolvedValue({ id: 'act-new-99' });

    const req = new Request('http://localhost:3000/api/business/rfps/lead-existing-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Acoustic Calculation Question',
        message: 'Can you provide the updated acoustic calculation sheets?',
      }),
    });

    const res = await sendRfpMessage(req, { params: Promise.resolve({ id: 'lead-existing-1' }) });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.inquiry.message).toBe('Can you provide the updated acoustic calculation sheets?');
  });
});
