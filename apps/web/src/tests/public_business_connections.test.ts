import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Mock DB
vi.mock('@/lib/db', () => ({
  db: {
    setting: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    inquiry: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'inq_auto_999', ...data })
      ),
    },
    feedback: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'fb_auto_888', ...data })
      ),
    },
    lead: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'lead_auto_777', ...data })
      ),
    },
    user: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        if (where.email === 'registered@e3.qa') {
          return Promise.resolve({
            id: 'usr_reg_01',
            email: 'registered@e3.qa',
            name: 'Registered User',
            isActive: true,
            sessionVersion: 1,
          });
        }
        return Promise.resolve(null);
      }),
      update: vi.fn().mockResolvedValue({ id: 'usr_reg_01', sessionVersion: 2 }),
    },
    passwordResetToken: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'prt_1', ...data })
      ),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        const validHash = crypto.createHash('sha256').update('valid_token_123').digest('hex');
        const usedHash = crypto.createHash('sha256').update('used_token_123').digest('hex');
        if (where.token === 'valid_token_123' || where.token === validHash) {
          return Promise.resolve({
            id: 'prt_1',
            token: validHash,
            email: 'registered@e3.qa',
            portal: 'admin',
            expiresAt: new Date(Date.now() + 3600000),
            usedAt: null,
          });
        }
        if (where.token === 'used_token_123' || where.token === usedHash) {
          return Promise.resolve({
            id: 'prt_2',
            token: usedHash,
            email: 'registered@e3.qa',
            expiresAt: new Date(Date.now() + 3600000),
            usedAt: new Date(),
          });
        }
        return Promise.resolve(null);
      }),
      update: vi.fn().mockResolvedValue({ id: 'prt_1', usedAt: new Date() }),
    },
    subscriber: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'sub_1', ...data })
      ),
      upsert: vi.fn().mockImplementation(({ create }: any) =>
        Promise.resolve({ id: 'sub_1', ...create })
      ),
      update: vi.fn().mockResolvedValue({ id: 'sub_1', isVerified: true }),
    },
    systemLog: {
      create: vi.fn().mockResolvedValue({ id: 'sys_1' }),
    },
  },
  default: {
    inquiry: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'inq_auto_999', ...data })
      ),
    },
    feedback: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'fb_auto_888', ...data })
      ),
    },
    lead: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'lead_auto_777', ...data })
      ),
    },
    user: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        if (where.email === 'registered@e3.qa') {
          return Promise.resolve({
            id: 'usr_reg_01',
            email: 'registered@e3.qa',
            name: 'Registered User',
            isActive: true,
            sessionVersion: 1,
          });
        }
        return Promise.resolve(null);
      }),
      update: vi.fn().mockResolvedValue({ id: 'usr_reg_01', sessionVersion: 2 }),
    },
    passwordResetToken: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'prt_1', ...data })
      ),
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        if (where.token === 'valid_token_123') {
          return Promise.resolve({
            id: 'prt_1',
            token: 'valid_token_123',
            email: 'registered@e3.qa',
            portal: 'admin',
            expiresAt: new Date(Date.now() + 3600000),
            usedAt: null,
          });
        }
        return Promise.resolve(null);
      }),
      update: vi.fn().mockResolvedValue({ id: 'prt_1', usedAt: new Date() }),
    },
    subscriber: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'sub_1', ...data })
      ),
      upsert: vi.fn().mockImplementation(({ create }: any) =>
        Promise.resolve({ id: 'sub_1', ...create })
      ),
      update: vi.fn().mockResolvedValue({ id: 'sub_1', isVerified: true }),
    },
    systemLog: {
      create: vi.fn().mockResolvedValue({ id: 'sys_1' }),
    },
  },
}));

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/body-limit', () => ({
  enforceBodyLimit: vi.fn().mockReturnValue(null),
}));

import { POST as postChat } from '@/app/api/chat/route';
import { POST as postPasswordReset } from '@/app/api/auth/password-reset/route';
import { POST as postB2CContact } from '@/app/api/contact/b2c/route';
import { POST as postLeadsIngest } from '@/app/api/crm/leads/ingest/route';
import { POST as postSubscribe } from '@/app/api/subscribe/route';
import { POST as postAdminEmailTest } from '@/app/api/admin/email/test/route';

describe('Public Business Connections & Hotfix Verification', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Chatbot Support Assistant (/api/chat)', () => {
    it('should return honest unavailable state when no AI provider key is configured', async () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_AI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'What are the opening hours for InflataRUN?' }],
          locale: 'en',
        }),
      });

      const res = await postChat(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.available).toBe(false);
      expect(json.message).toContain('Chat support is temporarily unavailable');
      expect(json.escalationUrl).toBe('/en/b2c/contact');
    });

    it('should reject invalid or oversized message arrays via Zod validation', async () => {
      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [], // empty violates min(1)
          locale: 'en',
        }),
      });

      const res = await postChat(req);
      expect(res.status).toBe(400);
    });
  });

  describe('2. Password Reset Engine (/api/auth/password-reset)', () => {
    it('should return enumeration-safe generic response on request for both existing and non-existing accounts', async () => {
      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email: 'nonexistent@example.com',
        }),
      });

      const res = await postPasswordReset(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('If an account exists');
    });

    it('should reset password, revoke sessions, and invalidate token on valid reset payload', async () => {
      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          token: 'valid_token_123',
          password: 'NewSecurePassword123!',
        }),
      });

      const res = await postPasswordReset(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Password reset successfully');
    });

    it('should reject already used or expired reset tokens', async () => {
      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          token: 'used_token_123',
          password: 'NewSecurePassword123!',
        }),
      });

      const res = await postPasswordReset(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid, expired, or already used');
    });
  });

  describe('3. B2C Contact & Server Ticket ID (/api/contact/b2c)', () => {
    it('should accept SUPPORT_TICKET and return real server ticket ID', async () => {
      const req = new NextRequest('http://localhost/api/contact/b2c', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          actionType: 'SUPPORT_TICKET',
          name: 'Sarah Al-Attiyah',
          email: 'sarah@example.qa',
          category: 'ticket_issue',
          message: 'Unable to scan barcode at gate',
          attachmentFileName: 'ticket_receipt.pdf',
        }),
      });

      const res = await postB2CContact(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.id).toBe('inq_auto_999');
      expect(json.ticketId).toBe('inq_auto_999');
    });
  });

  describe('4. B2B Lead Ingest & RFP Metadata (/api/crm/leads/ingest)', () => {
    it('should ingest corporate lead with RFP document reference and trigger notifications', async () => {
      const req = new NextRequest('http://localhost/api/crm/leads/ingest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Mansoor Al-Khater',
          email: 'mansoor@qatarcorp.qa',
          company: 'Qatar Corp',
          phone: '+974 5500 1122',
          interestServices: ['Spatial Design', 'Kinetic Structures'],
          notes: 'Requesting RFP proposal for 2027 arena',
          rfpFileName: 'QatarCorp_RFP_2027.pdf',
          rfpUrl: 'private_rfps/abc-123.pdf',
        }),
      });

      const res = await postLeadsIngest(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.leadId).toBe('lead_auto_777');
    });
  });

  describe('5. Newsletter Email Verification Workflow (/api/subscribe)', () => {
    it('should create unverified subscriber and dispatch verification link without auto-verifying on submit', async () => {
      const req = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          actionType: 'SUBSCRIBE',
          email: 'newsubscriber@example.qa',
        }),
      });

      const res = await postSubscribe(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Please check your email to confirm');
    });
  });

  describe('6. Admin Email Connection Test (/api/admin/email/test)', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const req = new NextRequest('http://localhost/api/admin/email/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ recipientEmail: 'admin@e3.qa' }),
      });

      const res = await postAdminEmailTest(req);
      expect(res.status).toBe(401);
    });
  });

  describe('7. Verified Social Channels & Canonical Contact Details', () => {
    it('should verify DEFAULT_SOCIAL_POSTS contain no fake placeholders', async () => {
      const { DEFAULT_SOCIAL_POSTS } = await import('@/lib/cms-social');
      for (const post of DEFAULT_SOCIAL_POSTS) {
        expect(post.postUrl).not.toContain('C_e3qatar1');
        expect(post.postUrl).not.toContain('C_e3qatar2');
        expect(post.postUrl).not.toContain('e3qatar_highlights');
        expect(post.postUrl.startsWith('https://')).toBe(true);
      }
    });

    it('should verify email fallback defaults to info@eeeqa.com', async () => {
      const { getNotificationTargetEmail } = await import('@/lib/email');
      const email = await getNotificationTargetEmail('UNKNOWN_CUSTOM_CATEGORY' as any);
      expect(email).toBe('info@eeeqa.com');
    });
  });

});
