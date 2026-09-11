import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/influencer/portal/[token]/route';
import * as tokenModule from '@/lib/influencer/tokens';
import * as deliverableModule from '@/lib/influencer/deliverable-service';

vi.mock('@/lib/influencer/tokens');
vi.mock('@/lib/influencer/deliverable-service');
vi.mock('@/lib/influencer/audit-service', () => ({
  logInfluencerAuditEvent: vi.fn().mockResolvedValue(true),
}));
vi.mock('@/lib/influencer/notification-service', () => ({
  sendInfluencerNotification: vi.fn().mockResolvedValue(true),
}));

const mockDb = vi.hoisted(() => {
  return {
    campaignCreator: {
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data,
      })),
    },
    campaignDeliverable: {
      findFirst: vi.fn(async ({ where }: any) => ({
        id: where.id,
        campaignCreatorId: where.campaignCreatorId,
        title: 'Launch Reel',
      })),
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data,
      })),
    },
    influencer: {
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data,
      })),
    },
  };
});

vi.mock('@/lib/db', () => ({
  default: mockDb,
}));

describe('Creator Portal API Flow & Route Handlers', () => {
  const mockTokenRecord = {
    id: 'tok-123',
    scope: 'CAMPAIGN_INVITATION',
    expiresAt: new Date(Date.now() + 86400000),
    influencer: {
      id: 'inf-1',
      displayName: 'Fatima Al-Kuwari',
      profileImage: null,
      bioEn: 'Vlogger',
      bioAr: 'صانعة محتوى',
      location: 'Doha, Qatar',
      nationality: 'Qatari',
      categories: ['LIFESTYLE'],
      languages: ['ar', 'en'],
      platforms: [],
    },
    campaignCreator: {
      id: 'cc-1',
      campaignId: 'camp-1',
      status: 'INVITED',
      collaborationType: 'PAID',
      proposedRate: 5000,
      agreedRate: null,
      currency: 'QAR',
      campaign: {
        id: 'camp-1',
        titleEn: 'National Day Festival',
        titleAr: 'مهرجان اليوم الوطني',
        campaignType: 'EVENT_LAUNCH',
        startDate: new Date(),
        endDate: new Date(),
      },
      deliverables: [],
      attendanceRecords: [],
      promoCodes: [],
    },
  };

  it('1. Handles RESPOND_INVITATION with decision ACCEPT', async () => {
    vi.spyOn(tokenModule, 'validateCreatorToken').mockResolvedValueOnce({
      isValid: true,
      tokenRecord: mockTokenRecord,
    });

    const req = new NextRequest('http://localhost/api/influencer/portal/valid-tok', {
      method: 'POST',
      body: JSON.stringify({
        action: 'RESPOND_INVITATION',
        payload: { decision: 'ACCEPT' },
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ token: 'valid-tok' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ACCEPTED');
    expect(body.acceptedAt).toBeDefined();
  });

  it('2. Handles RESPOND_INVITATION with decision COUNTER', async () => {
    vi.spyOn(tokenModule, 'validateCreatorToken').mockResolvedValueOnce({
      isValid: true,
      tokenRecord: mockTokenRecord,
    });

    const req = new NextRequest('http://localhost/api/influencer/portal/valid-tok', {
      method: 'POST',
      body: JSON.stringify({
        action: 'RESPOND_INVITATION',
        payload: { decision: 'COUNTER', counterRate: 6500 },
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ token: 'valid-tok' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('NEGOTIATING');
    expect(body.counterRate).toBe(6500);
  });

  it('3. Handles RESPOND_INVITATION with decision DECLINE', async () => {
    vi.spyOn(tokenModule, 'validateCreatorToken').mockResolvedValueOnce({
      isValid: true,
      tokenRecord: mockTokenRecord,
    });

    const req = new NextRequest('http://localhost/api/influencer/portal/valid-tok', {
      method: 'POST',
      body: JSON.stringify({
        action: 'RESPOND_INVITATION',
        payload: { decision: 'DECLINE', declineReason: 'Schedule conflict' },
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ token: 'valid-tok' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('DECLINED');
    expect(body.declineReason).toBe('Schedule conflict');
  });

  it('4. Handles SUBMIT_CONTENT with wrapped payload', async () => {
    vi.spyOn(tokenModule, 'validateCreatorToken').mockResolvedValueOnce({
      isValid: true,
      tokenRecord: mockTokenRecord,
    });

    vi.spyOn(deliverableModule, 'submitDeliverableDraft').mockResolvedValueOnce({
      id: 'sub-1',
      version: 1,
      status: 'SUBMITTED',
    } as any);

    const req = new NextRequest('http://localhost/api/influencer/portal/valid-tok', {
      method: 'POST',
      body: JSON.stringify({
        action: 'SUBMIT_CONTENT',
        payload: {
          deliverableId: 'deliv-1',
          externalPreviewUrl: 'https://instagram.com/p/preview123',
          captionEn: 'Excited to visit E3!',
          captionAr: 'متحمسة لزيارة إي ثري!',
          submissionNotes: 'Ready for review',
        },
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ token: 'valid-tok' }) });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe('sub-1');
  });

  it('5. Handles SUBMIT_PUBLISHED_URL with wrapped payload', async () => {
    vi.spyOn(tokenModule, 'validateCreatorToken').mockResolvedValueOnce({
      isValid: true,
      tokenRecord: mockTokenRecord,
    });

    const req = new NextRequest('http://localhost/api/influencer/portal/valid-tok', {
      method: 'POST',
      body: JSON.stringify({
        action: 'SUBMIT_PUBLISHED_URL',
        payload: {
          deliverableId: 'deliv-1',
          publishedUrl: 'https://instagram.com/reel/live-reel-123',
        },
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ token: 'valid-tok' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.publishedUrl).toBe('https://instagram.com/reel/live-reel-123');
    expect(body.status).toBe('PUBLISHED');
  });
});
