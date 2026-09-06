import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUnmatchedConversions,
  resolveUnmatchedConversion,
} from '@/lib/influencer/attribution-service';

const mockDb = vi.hoisted(() => {
  const store: { influencerConversion: any[] } = {
    influencerConversion: [],
  };

  return {
    store,
    influencerConversion: {
      findMany: vi.fn(async ({ where, skip, take }: any) => {
        let items = store.influencerConversion;
        if (where?.reconciliationStatus) {
          items = items.filter((c) => c.reconciliationStatus === where.reconciliationStatus);
        }
        if (where?.OR) {
          items = items.filter((c) =>
            where.OR.some((cond: any) => {
              if (cond.unmatchedCode?.contains) {
                return c.unmatchedCode?.toLowerCase().includes(cond.unmatchedCode.contains.toLowerCase());
              }
              if (cond.externalOrderId?.contains) {
                return c.externalOrderId?.toLowerCase().includes(cond.externalOrderId.contains.toLowerCase());
              }
              return false;
            })
          );
        }
        return items.slice(skip || 0, (skip || 0) + (take || 50));
      }),
      count: vi.fn(async ({ where }: any) => {
        let items = store.influencerConversion;
        if (where?.reconciliationStatus) {
          items = items.filter((c) => c.reconciliationStatus === where.reconciliationStatus);
        }
        return items.length;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return store.influencerConversion.find((c) => c.id === where.id) || null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const item = store.influencerConversion.find((c) => c.id === where.id);
        if (item) {
          Object.assign(item, data);
          return { ...item };
        }
        return null;
      }),
    },
  };
});

vi.mock('@/lib/db', () => ({
  default: mockDb,
  db: mockDb,
}));

vi.mock('@/lib/influencer/audit-service', () => ({
  logInfluencerAuditEvent: vi.fn(async () => {}),
}));

describe('Influencer Conversion Reconciliation Queue', () => {
  beforeEach(() => {
    mockDb.store.influencerConversion = [
      {
        id: 'conv-unmatched-1',
        externalEventId: 'evt-100',
        externalOrderId: 'ORD-991',
        unmatchedCode: 'UNKNOWN_CREATOR',
        reconciliationStatus: 'UNMATCHED_CODE',
        grossRevenue: 800,
        netRevenue: 800,
        ticketCount: 2,
        occurredAt: new Date(),
      },
      {
        id: 'conv-unmatched-2',
        externalEventId: 'evt-101',
        externalOrderId: 'ORD-992',
        unmatchedCode: 'VIP_PASS_26',
        reconciliationStatus: 'UNMATCHED_CODE',
        grossRevenue: 1200,
        netRevenue: 1200,
        ticketCount: 3,
        occurredAt: new Date(),
      },
      {
        id: 'conv-matched-1',
        externalEventId: 'evt-102',
        externalOrderId: 'ORD-993',
        campaignId: 'camp-1',
        reconciliationStatus: 'MATCHED',
        grossRevenue: 400,
        netRevenue: 400,
        ticketCount: 1,
        occurredAt: new Date(),
      },
    ];
    vi.clearAllMocks();
  });

  it('1. Lists unmatched conversions with pagination and status filter', async () => {
    const res = await getUnmatchedConversions({ status: 'UNMATCHED_CODE', page: 1, limit: 10 });
    expect(res.total).toBe(2);
    expect(res.conversions).toHaveLength(2);
    expect(res.conversions[0].reconciliationStatus).toBe('UNMATCHED_CODE');
  });

  it('2. Filters conversions by search query', async () => {
    const res = await getUnmatchedConversions({ search: 'VIP_PASS' });
    expect(res.conversions).toHaveLength(1);
    expect(res.conversions[0].unmatchedCode).toBe('VIP_PASS_26');
  });

  it('3. Reconciles an unmatched conversion by matching to campaign and creator', async () => {
    const resolved = await resolveUnmatchedConversion({
      conversionId: 'conv-unmatched-1',
      action: 'MATCH',
      targetCampaignId: 'campaign-spring-26',
      targetCampaignCreatorId: 'assignment-creator-1',
      notes: 'Customer used influencer personal handle instead of promo code',
      actorId: 'finance-officer',
    });

    expect(resolved.reconciliationStatus).toBe('MANUALLY_MATCHED');
    expect(resolved.campaignId).toBe('campaign-spring-26');
    expect(resolved.campaignCreatorId).toBe('assignment-creator-1');

    const stored = mockDb.store.influencerConversion.find((c) => c.id === 'conv-unmatched-1');
    expect(stored.reconciliationStatus).toBe('MANUALLY_MATCHED');
  });

  it('4. Dismisses an unmatched conversion with operator notes', async () => {
    const dismissed = await resolveUnmatchedConversion({
      conversionId: 'conv-unmatched-2',
      action: 'DISMISS',
      notes: 'Expired partner voucher, not affiliated with active influencer campaigns',
      actorId: 'finance-officer',
    });

    expect(dismissed.reconciliationStatus).toBe('DISMISSED');

    const stored = mockDb.store.influencerConversion.find((c) => c.id === 'conv-unmatched-2');
    expect(stored.reconciliationStatus).toBe('DISMISSED');
  });

  it('5. Throws error when matching without a target campaign ID', async () => {
    await expect(
      resolveUnmatchedConversion({
        conversionId: 'conv-unmatched-1',
        action: 'MATCH',
        actorId: 'finance-officer',
      })
    ).rejects.toThrow(/targetCampaignId is required/);
  });
});
