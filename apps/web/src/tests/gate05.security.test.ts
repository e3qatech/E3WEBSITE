/**
 * Gate 05F: Comprehensive Route-Level Security Tests
 *
 * Tests cover:
 * - Upload magic-byte validation
 * - Honeypot side-effect isolation
 * - CMS role matrix
 * - Webhook raw-body HMAC with whitespace sensitivity
 * - Idempotency state machine (processing/completed/failed)
 * - Meeting slot concurrency (atomic claim)
 * - Body limit enforcement
 * - Download proxy authorization
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Track all mock calls for side-effect verification
const mockDbCalls: string[] = [];

// Hoisted mock objects — available to vi.mock factories
const { mockRedis, mockAuth, mockState } = vi.hoisted(() => ({
  mockRedis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    setnx: vi.fn().mockResolvedValue(1),
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn().mockResolvedValue(1),
  },
  mockAuth: vi.fn().mockResolvedValue(null),
  mockState: {
    findUniqueUser: null as any,
    updateManySlotCount: 1,
  }
}));

vi.mock('@/lib/db', () => {
  const handler = {
    get(_target: any, prop: string) {
      if (prop === '$transaction') {
        return vi.fn(async (cb: any) => {
          const txProxy = new Proxy({}, {
            get(_t: any, model: string) {
              return new Proxy({}, {
                get(_m: any, method: string) {
                  return vi.fn(async (...args: any[]) => {
                    mockDbCalls.push(`${model}.${method}`);
                    if (model === 'availabilitySlot' && method === 'updateMany') {
                      return { count: mockState.updateManySlotCount };
                    }
                    return { id: `mock-${model}-id` };
                  });
                }
              });
            }
          });
          return cb(txProxy);
        });
      }
      // Return a proxy for any model access
      return new Proxy({}, {
        get(_m: any, method: string) {
          return vi.fn(async (...args: any[]) => {
            mockDbCalls.push(`${prop}.${method}`);
            if (prop === 'user' && method === 'findUnique') {
              return mockState.findUniqueUser;
            }
            return { id: `mock-${prop}-id` };
          });
        }
      });
    }
  };
  return {
    db: new Proxy({}, handler),
    default: new Proxy({}, handler),
  };
});

vi.mock('@/lib/redis', () => ({
  redis: mockRedis,
  getRedisClient: () => mockRedis,
  isBuildMode: () => false,
  RedisUnavailableError: class RedisUnavailableError extends Error {},
}));

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────

import { isValidMagicBytes, compareSignatures } from '../lib/security';
import { enforceBodyLimit } from '../lib/body-limit';
import { POST as B2BPOST } from '../app/api/contact/b2b/route';
import { POST as B2CPOST } from '../app/api/contact/b2c/route';
import { POST as BulkBookingPOST } from '../app/api/inquiries/bulk-booking/route';
import { POST as CareersPOST } from '../app/api/careers/apply/route';
import { POST as CmsMediaPOST } from '../app/api/cms/media/route';
import { POST as WebhookPOST } from '../app/api/webhooks/bookingqube/route';

// ─── Test Utilities ─────────────────────────────────────────────────────────

const WEBHOOK_SECRET = process.env.BOOKINGQUBE_WEBHOOK_SECRET || '';

function signPayload(body: string, secret: string = WEBHOOK_SECRET): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function makeWebhookRequest(body: string, signature?: string): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (signature !== undefined) {
    headers['x-bookingqube-signature'] = signature;
  }
  return new Request('http://localhost/api/webhooks/bookingqube', {
    method: 'POST',
    body,
    headers,
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockDbCalls.length = 0;
  mockAuth.mockResolvedValue(null);
  mockRedis.incr.mockResolvedValue(1);
  mockRedis.set.mockResolvedValue('OK');
  mockRedis.get.mockResolvedValue(null);
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. UPLOAD MAGIC-BYTE VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

describe('Upload Magic-Byte Validation', () => {
  it('should validate PDF magic bytes (%PDF)', () => {
    const buf = Buffer.from('%PDF-1.4 some content', 'utf-8');
    expect(isValidMagicBytes(buf, 'pdf')).toBe(true);
  });

  it('should reject EXE renamed as PDF (MZ header)', () => {
    const buf = Buffer.alloc(8);
    buf.write('MZ', 0, 'ascii');
    buf[2] = 0x90;
    expect(isValidMagicBytes(buf, 'pdf')).toBe(false);
  });

  it('should validate DOCX magic bytes (PK ZIP header)', () => {
    const buf = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
    expect(isValidMagicBytes(buf, 'docx')).toBe(true);
  });

  it('should validate JPEG magic bytes (FFD8FF)', () => {
    const buf = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
    expect(isValidMagicBytes(buf, 'jpg')).toBe(true);
  });

  it('should validate PNG magic bytes', () => {
    const buf = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    expect(isValidMagicBytes(buf, 'png')).toBe(true);
  });

  it('should reject PNG with wrong magic bytes', () => {
    const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    expect(isValidMagicBytes(buf, 'png')).toBe(false);
  });

  it('should reject empty/tiny buffer', () => {
    expect(isValidMagicBytes(Buffer.alloc(0), 'pdf')).toBe(false);
    expect(isValidMagicBytes(Buffer.alloc(2), 'pdf')).toBe(false);
  });

  it('should allow unknown extensions (no magic-byte check)', () => {
    const buf = Buffer.from('anything', 'utf-8');
    expect(isValidMagicBytes(buf, 'glb')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. HONEYPOT SIDE-EFFECT ISOLATION
// ═══════════════════════════════════════════════════════════════════════════

describe('Honeypot Side-Effect Isolation', () => {
  it('B2B: honeypot returns 201 with zero DB writes', async () => {
    const req = new Request('http://localhost/api/contact/b2b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        actionType: 'PROJECT_REQUEST',
        website_hp: 'bot-trap',
        name: 'Bot', email: 'bot@spam.com', message: 'spam'
      }),
    });
    const res = await B2BPOST(req as any);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.status).toBe('ignored');
    expect(mockDbCalls).toHaveLength(0);
  });

  it('B2C: honeypot returns 201 with zero DB writes', async () => {
    const req = new Request('http://localhost/api/contact/b2c', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        actionType: 'FEEDBACK',
        website_hp: 'bot-trap',
        message: 'spam'
      }),
    });
    const res = await B2CPOST(req as any);
    expect(res.status).toBe(201);
    expect(mockDbCalls).toHaveLength(0);
  });

  it('Bulk Booking: honeypot returns 201 with zero DB writes', async () => {
    const req = new Request('http://localhost/api/inquiries/bulk-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        website_hp: 'bot',
        name: 'Bot', email: 'bot@spam.com', phone: '12345',
        eventDetails: { attractionName: 'X', date: '2026-01-01', time: '10:00', quantity: 20 }
      }),
    });
    const res = await BulkBookingPOST(req as any);
    expect(res.status).toBe(201);
    expect(mockDbCalls).toHaveLength(0);
  });

  it('Careers Apply: honeypot returns 201 with zero DB writes', async () => {
    const req = new Request('http://localhost/api/careers/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        website_hp: 'bot',
        firstName: 'Bot', lastName: 'Spam',
        email: 'bot@spam.com', password: '12345678',
        jobTitle: 'Spammer', cvUrl: 'https://example.com/fake.pdf'
      }),
    });
    const res = await CareersPOST(req as any);
    expect(res.status).toBe(201);
    expect(mockDbCalls).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. CMS ROLE MATRIX
// ═══════════════════════════════════════════════════════════════════════════

describe('CMS Role Matrix', () => {
  it('should reject unauthenticated upload (401)', async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request('http://localhost/api/cms/media', { method: 'POST' });
    const res = await CmsMediaPOST(req as any);
    expect(res.status).toBe(401);
  });

  it('should reject inactive user (401)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    mockState.findUniqueUser = { id: 'u1', isActive: false, role: 'SUPER_ADMIN' };
    const req = new Request('http://localhost/api/cms/media', { method: 'POST' });
    const res = await CmsMediaPOST(req as any);
    expect(res.status).toBe(401);
  });

  it('should reject CLIENT role (403)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    mockState.findUniqueUser = { id: 'u1', isActive: true, role: 'CLIENT' };
    const req = new Request('http://localhost/api/cms/media', { method: 'POST' });
    const res = await CmsMediaPOST(req as any);
    expect(res.status).toBe(403);
  });

  it('should reject SALES_ADMIN role for CMS upload (403)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    mockState.findUniqueUser = { id: 'u1', isActive: true, role: 'SALES_ADMIN' };
    const req = new Request('http://localhost/api/cms/media', { method: 'POST' });
    const res = await CmsMediaPOST(req as any);
    expect(res.status).toBe(403);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. WEBHOOK RAW-BODY HMAC
// ═══════════════════════════════════════════════════════════════════════════

describe('Webhook Raw-Body HMAC Verification', () => {
  it('should accept valid signature', async () => {
    const body = '{"id":"evt-1","type":"ticket.purchased","scheduleId":"s1"}';
    const sig = signPayload(body);
    // Mock Redis for idempotency
    mockRedis.set.mockResolvedValue('OK');
    const req = makeWebhookRequest(body, sig);
    const res = await WebhookPOST(req as any);
    expect([200, 201].includes(res.status) || res.status === 200).toBe(true);
  });

  it('should reject missing signature (401)', async () => {
    const body = '{"id":"evt-2","type":"ticket.purchased"}';
    const req = makeWebhookRequest(body);
    const res = await WebhookPOST(req as any);
    expect(res.status).toBe(401);
  });

  it('should reject invalid signature (401)', async () => {
    const body = '{"id":"evt-3","type":"ticket.purchased"}';
    const req = makeWebhookRequest(body, 'deadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678');
    const res = await WebhookPOST(req as any);
    expect(res.status).toBe(401);
  });

  it('should reject malformed hex signature (401)', async () => {
    const body = '{"id":"evt-4","type":"ticket.purchased"}';
    const req = makeWebhookRequest(body, 'not-valid-hex!!');
    const res = await WebhookPOST(req as any);
    expect(res.status).toBe(401);
  });

  it('whitespace mutation should change HMAC result', () => {
    const body1 = '{"id":"evt-5","type":"ticket.purchased"}';
    const body2 = '{ "id" : "evt-5" , "type" : "ticket.purchased" }';
    const sig1 = signPayload(body1);
    const sig2 = signPayload(body2);
    expect(sig1).not.toBe(sig2);
  });

  it('should reject unequal-length signature', () => {
    expect(compareSignatures('abc', 'abcdef')).toBe(false);
  });

  it('timing-safe comparison should pass for identical strings', () => {
    const sig = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
    expect(compareSignatures(sig, sig)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. IDEMPOTENCY STATE MACHINE
// ═══════════════════════════════════════════════════════════════════════════

describe('Webhook Idempotency State Machine', () => {
  it('first event should process successfully', async () => {
    const body = '{"id":"idem-1","type":"ticket.purchased","scheduleId":"s1"}';
    const sig = signPayload(body);
    mockRedis.set.mockResolvedValue('OK'); // NX claim succeeds
    const req = makeWebhookRequest(body, sig);
    const res = await WebhookPOST(req as any);
    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it('duplicate after completion should return already processed', async () => {
    const body = '{"id":"idem-2","type":"ticket.purchased","scheduleId":"s1"}';
    const sig = signPayload(body);
    mockRedis.set.mockResolvedValue(null); // NX claim fails (key exists)
    mockRedis.get.mockResolvedValue('completed'); // Existing state
    const req = makeWebhookRequest(body, sig);
    const res = await WebhookPOST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toContain('Already processed');
  });

  it('concurrent duplicate during processing should return 202', async () => {
    const body = '{"id":"idem-3","type":"ticket.purchased","scheduleId":"s1"}';
    const sig = signPayload(body);
    mockRedis.set.mockResolvedValue(null); // NX claim fails
    mockRedis.get.mockResolvedValue('processing'); // Another instance is processing
    const req = makeWebhookRequest(body, sig);
    const res = await WebhookPOST(req as any);
    expect(res.status).toBe(202);
  });

  it('retry after failure should re-process', async () => {
    const body = '{"id":"idem-4","type":"ticket.purchased","scheduleId":"s1"}';
    const sig = signPayload(body);
    mockRedis.set
      .mockResolvedValueOnce(null)  // First NX claim fails (key exists)
      .mockResolvedValueOnce('OK'); // Re-claim after delete succeeds
    mockRedis.get.mockResolvedValue('failed'); // Previous attempt failed
    const req = makeWebhookRequest(body, sig);
    const res = await WebhookPOST(req as any);
    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it('Redis outage in production should return 503', async () => {
    const body = '{"id":"idem-5","type":"ticket.purchased","scheduleId":"s1"}';
    const sig = signPayload(body, 'test-secret-123');
    // Save and temporarily change NODE_ENV and secret
    const origSecret = process.env.BOOKINGQUBE_WEBHOOK_SECRET;
    vi.stubEnv('NODE_ENV', 'production');
    process.env.BOOKINGQUBE_WEBHOOK_SECRET = 'test-secret-123';
    mockRedis.set.mockRejectedValue(new Error('Redis connection refused'));
    const req = makeWebhookRequest(body, sig);
    const res = await WebhookPOST(req as any);
    vi.unstubAllEnvs();
    process.env.BOOKINGQUBE_WEBHOOK_SECRET = origSecret;
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('30');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. MEETING SLOT CONCURRENCY
// ═══════════════════════════════════════════════════════════════════════════

describe('Meeting Slot Concurrency', () => {
  it('BOOK_MEETING should use atomic updateMany (not findFirst+update)', async () => {
    const req = new Request('http://localhost/api/contact/b2b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        actionType: 'BOOK_MEETING',
        title: 'Test Meeting',
        startTime: '2026-12-01T10:00:00Z',
        endTime: '2026-12-01T11:00:00Z',
        slotId: 'slot-1',
      }),
    });
    const res = await B2BPOST(req as any);
    expect(res.status).toBe(201);
    // Verify updateMany was called (atomic claim) instead of findFirst
    expect(mockDbCalls).toContain('availabilitySlot.updateMany');
    expect(mockDbCalls).not.toContain('availabilitySlot.findFirst');
  });

  it('should return 409 when slot already booked', async () => {
    mockState.updateManySlotCount = 0; // Simulate slot already booked

    const req = new Request('http://localhost/api/contact/b2b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: JSON.stringify({
        actionType: 'BOOK_MEETING',
        title: 'Test Meeting 2',
        startTime: '2026-12-01T10:00:00Z',
        endTime: '2026-12-01T11:00:00Z',
        slotId: 'slot-2',
      }),
    });
    const res = await B2BPOST(req as any);
    expect(res.status).toBe(409);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. BODY LIMIT ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════

describe('Body Limit Enforcement', () => {
  it('should accept request within limit', () => {
    const req = new Request('http://localhost/test', {
      headers: { 'content-length': '100' },
    });
    const result = enforceBodyLimit(req, 1024);
    expect(result).toBeNull();
  });

  it('should reject request exceeding limit with 413', () => {
    const req = new Request('http://localhost/test', {
      headers: { 'content-length': '999999' },
    });
    const result = enforceBodyLimit(req, 1024);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(413);
  });

  it('should handle boundary exactly at limit', () => {
    const req = new Request('http://localhost/test', {
      headers: { 'content-length': '1024' },
    });
    const result = enforceBodyLimit(req, 1024);
    expect(result).toBeNull(); // Exactly at limit is OK
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. DOWNLOAD PROXY AUTHORIZATION
// ═══════════════════════════════════════════════════════════════════════════
import { GET as DownloadProxyGET } from '../app/api/upload/download/route';

describe('Download Proxy Authorization', () => {
  it('should reject unauthenticated access to private resumes (401)', async () => {
    mockAuth.mockResolvedValue(null);
    const req = new Request('http://localhost/api/upload/download?pathname=private_resumes/test.pdf');
    const res = await DownloadProxyGET(req as any);
    expect(res.status).toBe(401);
  });

  it('should reject unauthorized role for private resumes (403)', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1' } });
    mockState.findUniqueUser = { id: 'u1', isActive: true, role: 'CLIENT' };
    const req = new Request('http://localhost/api/upload/download?pathname=private_resumes/test.pdf');
    const res = await DownloadProxyGET(req as any);
    expect(res.status).toBe(403);
  });
});
