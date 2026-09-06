import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/webhooks/bookingqube/route';

// In-memory test store
const { conversionsStore, promoCodesStore, trackingLinksStore, mockDb } = vi.hoisted(() => {
  const conversionsStore = new Map<string, any>();
  const promoCodesStore = new Map<string, any>();
  const trackingLinksStore = new Map<string, any>();

  const mockDb = {
    influencerConversion: {
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const key = where.externalEventId;
        const existing = conversionsStore.get(key);
        if (existing) {
          const merged = { ...existing, ...update };
          conversionsStore.set(key, merged);
          return merged;
        }
        conversionsStore.set(key, create);
        return create;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        const results: any[] = [];
        Array.from(conversionsStore.values()).forEach((item: any) => {
          if (where.OR) {
            const matches = where.OR.some((cond: any) => {
              if (cond.externalOrderId && item.externalOrderId === cond.externalOrderId) return true;
              if (cond.externalEventId && item.externalEventId === cond.externalEventId) return true;
              return false;
            });
            if (matches) results.push(item);
          }
        });
        return results;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const entries = Array.from(conversionsStore.entries());
        for (let i = 0; i < entries.length; i++) {
          const [k, v] = entries[i];
          if (v.id === where.id || v.externalEventId === where.id) {
            const updated = { ...v, ...data };
            conversionsStore.set(k, updated);
            return updated;
          }
        }
        return null;
      }),
    },
    promoCode: {
      findUnique: vi.fn(async ({ where }: any) => promoCodesStore.get(where.code) || null),
      update: vi.fn(async ({ where, data }: any) => {
        const item = Array.from(promoCodesStore.values()).find(p => p.id === where.id);
        if (item && data.usageCount?.increment) {
          item.usageCount += data.usageCount.increment;
        }
        return item;
      }),
    },
    trackingLink: {
      findUnique: vi.fn(async ({ where }: any) => trackingLinksStore.get(where.shortCode) || null),
    },
    eventSchedule: {
      update: vi.fn(async () => ({})),
    },
  };

  return { conversionsStore, promoCodesStore, trackingLinksStore, mockDb };
});

vi.mock('@/lib/db', () => ({
  default: mockDb,
  db: mockDb,
}));

// Mock redis
vi.mock('@/lib/redis', () => ({
  redis: {
    set: vi.fn(async () => 'OK'),
    get: vi.fn(async () => null),
    del: vi.fn(async () => 1),
  },
}));

function createSignedRequest(body: object, secret: string, modifySig?: (sig: string) => string) {
  const rawBody = JSON.stringify(body);
  let signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (modifySig) {
    signature = modifySig(signature);
  }

  return new NextRequest('https://e3.qa/api/webhooks/bookingqube', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-bookingqube-signature': signature,
    },
    body: rawBody,
  });
}

describe('BookingQube Webhook Audit Suite', () => {
  const TEST_SECRET = 'test_production_secret_32byteslong!';

  beforeEach(() => {
    vi.clearAllMocks();
    conversionsStore.clear();
    promoCodesStore.clear();
    trackingLinksStore.clear();
    (process.env as any).NODE_ENV = 'development';
    process.env.BOOKINGQUBE_WEBHOOK_SECRET = TEST_SECRET;
  });

  it('fails closed when production secret is missing', async () => {
    delete process.env.BOOKINGQUBE_WEBHOOK_SECRET;
    (process.env as any).NODE_ENV = 'production';

    const req = new NextRequest('https://e3.qa/api/webhooks/bookingqube', {
      method: 'POST',
      body: JSON.stringify({ id: 'evt_fail_closed' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Webhook not configured');
  });

  it('rejects requests with missing signature (401)', async () => {
    const req = new NextRequest('https://e3.qa/api/webhooks/bookingqube', {
      method: 'POST',
      body: JSON.stringify({ id: 'evt_no_sig' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Missing signature');
  });

  it('rejects requests with invalid signature (401)', async () => {
    const payload = {
      id: 'evt_tampered',
      type: 'ticket.purchased',
      orderId: 'ord_123',
    };

    // Tamper with signature
    const req = createSignedRequest(payload, TEST_SECRET, (sig) =>
      sig.substring(0, sig.length - 4) + '0000'
    );

    const response = await POST(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Invalid signature');
  });

  it('enforces idempotency on replayed events', async () => {
    const payload = {
      id: 'evt_replay_test_1',
      type: 'ticket.purchased',
      orderId: 'ord_replay_1',
      grossRevenue: 250,
      promoCode: 'DANA20',
    };

    promoCodesStore.set('DANA20', {
      id: 'promo_1',
      code: 'DANA20',
      campaignId: 'camp_1',
      campaignCreatorId: 'cc_1',
      usageCount: 0,
    });

    // First request processes
    const req1 = createSignedRequest(payload, TEST_SECRET);
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    expect(body1.received).toBe(true);

    // Second request with exact same event ID must skip
    const req2 = createSignedRequest(payload, TEST_SECRET);
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.status).toBe('Already processed');
  });

  it('records matched conversions and increments promo code usage', async () => {
    promoCodesStore.set('E3QATAR15', {
      id: 'promo_15',
      code: 'E3QATAR15',
      campaignId: 'camp_carnival',
      campaignCreatorId: 'cc_khalid',
      usageCount: 2,
    });

    const payload = {
      id: 'evt_purchase_matched',
      type: 'ticket.purchased',
      orderId: 'ord_matched_99',
      promoCode: 'E3QATAR15',
      grossRevenue: 300,
      discountAmount: 45,
      quantity: 2,
    };

    const req = createSignedRequest(payload, TEST_SECRET);
    const res = await POST(req);
    expect(res.status).toBe(200);

    const conv = conversionsStore.get('evt_purchase_matched');
    expect(conv).toBeDefined();
    expect(conv.campaignId).toBe('camp_carnival');
    expect(conv.campaignCreatorId).toBe('cc_khalid');
    expect(conv.promoCodeId).toBe('promo_15');
    expect(conv.reconciliationStatus).toBe('MATCHED');
    expect(conv.netRevenue).toBe(255); // 300 - 45

    const promo = promoCodesStore.get('E3QATAR15');
    expect(promo.usageCount).toBe(3);
  });

  it('queues unmatched codes into reconciliation queue', async () => {
    const payload = {
      id: 'evt_unmatched_code_88',
      type: 'ticket.purchased',
      orderId: 'ord_mystery_88',
      promoCode: 'TYPO_CODE_999',
      grossRevenue: 150,
      discountAmount: 0,
    };

    const req = createSignedRequest(payload, TEST_SECRET);
    const res = await POST(req);
    expect(res.status).toBe(200);

    const conv = conversionsStore.get('evt_unmatched_code_88');
    expect(conv).toBeDefined();
    expect(conv.campaignId).toBeNull();
    expect(conv.reconciliationStatus).toBe('UNMATCHED_CODE');
    expect(conv.unmatchedCode).toBe('TYPO_CODE_999');
    expect(conv.netRevenue).toBe(150);
  });

  it('accurately adjusts net revenue on ticket cancellation / refunds', async () => {
    // Seed existing conversion
    conversionsStore.set('evt_orig_ticket', {
      id: 'conv_refund_test',
      externalEventId: 'evt_orig_ticket',
      externalOrderId: 'ord_to_refund_77',
      grossRevenue: 500,
      discountAmount: 50,
      refundAmount: 0,
      netRevenue: 450,
    });

    const refundPayload = {
      id: 'evt_cancel_77',
      type: 'ticket.cancelled',
      orderId: 'ord_to_refund_77',
      grossRevenue: 500, // Full refund
    };

    const req = createSignedRequest(refundPayload, TEST_SECRET);
    const res = await POST(req);
    expect(res.status).toBe(200);

    const updated = conversionsStore.get('evt_orig_ticket');
    expect(updated.refundAmount).toBe(500);
    expect(updated.netRevenue).toBe(0);
  });
});
