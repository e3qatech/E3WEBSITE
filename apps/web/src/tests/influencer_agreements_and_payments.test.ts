import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createInfluencerAgreement,
  updateAgreementStatus,
  getCampaignAgreements,
  submitInfluencerInvoice,
  reviewInfluencerPayment,
  getCampaignPayments,
} from '@/lib/influencer/commercial-service';

const mockDb = vi.hoisted(() => {
  const store: {
    campaignCreator: any[];
    influencerAgreement: any[];
    influencerPayment: any[];
  } = {
    campaignCreator: [],
    influencerAgreement: [],
    influencerPayment: [],
  };

  return {
    store,
    campaignCreator: {
      findUnique: vi.fn(async ({ where }: any) => {
        return store.campaignCreator.find((c) => c.id === where.id) || null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const item = store.campaignCreator.find((c) => c.id === where.id);
        if (item) {
          Object.assign(item, data);
          return { ...item };
        }
        return null;
      }),
    },
    influencerAgreement: {
      count: vi.fn(async ({ where }: any) => {
        return store.influencerAgreement.filter((a) => a.campaignCreatorId === where.campaignCreatorId).length;
      }),
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `agr-${Date.now()}-${Math.random()}`, ...data };
        store.influencerAgreement.push(item);
        return item;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return store.influencerAgreement.find((a) => a.id === where.id) || null;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return store.influencerAgreement.filter((a) => {
          if (where.campaignCreator?.campaignId) {
            const cc = store.campaignCreator.find((c) => c.id === a.campaignCreatorId);
            return cc?.campaignId === where.campaignCreator.campaignId;
          }
          return true;
        });
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const item = store.influencerAgreement.find((a) => a.id === where.id);
        if (item) {
          Object.assign(item, data);
          return { ...item };
        }
        return null;
      }),
    },
    influencerPayment: {
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `pay-${Date.now()}-${Math.random()}`, ...data };
        store.influencerPayment.push(item);
        return item;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return store.influencerPayment.find((p) => p.id === where.id) || null;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return store.influencerPayment.filter((p) => {
          if (where.campaignCreator?.campaignId) {
            const cc = store.campaignCreator.find((c) => c.id === p.campaignCreatorId);
            return cc?.campaignId === where.campaignCreator.campaignId;
          }
          return true;
        });
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const item = store.influencerPayment.find((p) => p.id === where.id);
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

describe('Influencer Agreements and Payments Lifecycle', () => {
  beforeEach(() => {
    mockDb.store.campaignCreator = [
      {
        id: 'assignment-1',
        campaignId: 'campaign-1',
        influencerId: 'creator-1',
        status: 'ACCEPTED',
        agreedFee: 6000,
        currency: 'QAR',
        agreementStatus: 'PENDING',
        paymentStatus: 'INVOICE_REQUIRED',
      },
    ];
    mockDb.store.influencerAgreement = [];
    mockDb.store.influencerPayment = [];
    vi.clearAllMocks();
  });

  it('1. Creates versioned agreement and synchronizes campaign creator assignment', async () => {
    const agreement = await createInfluencerAgreement({
      campaignCreatorId: 'assignment-1',
      agreedRate: 7500,
      currency: 'QAR',
      agreementType: 'STANDARD_COMMERCIAL',
      usageRightsTerms: '12-month digital rights across MENA',
      usageRightsStartAt: '2026-10-01',
      usageRightsEndAt: '2027-10-01',
      actorId: 'admin-1',
    });

    expect(agreement.version).toBe(1);
    expect(agreement.status).toBe('PENDING');
    expect(agreement.agreedRate).toBe(7500);

    const updatedAssignment = mockDb.store.campaignCreator.find((c) => c.id === 'assignment-1');
    expect(updatedAssignment.agreementStatus).toBe('PENDING');
    expect(updatedAssignment.agreedFee).toBe(7500);
    expect(updatedAssignment.usageRightsTerms).toBe('12-month digital rights across MENA');
  });

  it('2. Signs and countersigns agreement, transitioning creator status to CONTRACTED', async () => {
    const agreement = await createInfluencerAgreement({
      campaignCreatorId: 'assignment-1',
      agreedRate: 7500,
    });

    const signed = await updateAgreementStatus({
      agreementId: agreement.id,
      signedByCreator: true,
      countersigned: true,
      actorId: 'admin-1',
    });

    expect(signed.status).toBe('SIGNED');
    expect(signed.signedByCreatorAt).toBeDefined();
    expect(signed.countersignedAt).toBeDefined();

    const updatedAssignment = mockDb.store.campaignCreator.find((c) => c.id === 'assignment-1');
    expect(updatedAssignment.agreementStatus).toBe('SIGNED');
    expect(updatedAssignment.status).toBe('CONTRACTED');
    expect(updatedAssignment.contractedAt).toBeDefined();
  });

  it('3. Submits invoice, approves payment, and marks paid with reference code', async () => {
    // 1. Submit invoice
    const payment = await submitInfluencerInvoice({
      campaignCreatorId: 'assignment-1',
      invoiceNumber: 'INV-2026-001',
      amount: 7500,
      currency: 'QAR',
      actorId: 'creator-1',
    });

    expect(payment.paymentStatus).toBe('INVOICE_RECEIVED');
    expect(payment.invoiceNumber).toBe('INV-2026-001');

    const assignmentAfterInvoice = mockDb.store.campaignCreator.find((c) => c.id === 'assignment-1');
    expect(assignmentAfterInvoice.paymentStatus).toBe('INVOICE_RECEIVED');
    expect(assignmentAfterInvoice.invoiceNumber).toBe('INV-2026-001');

    // 2. Finance Approval
    const approved = await reviewInfluencerPayment({
      paymentId: payment.id,
      action: 'APPROVE',
      actorId: 'finance-manager',
    });

    expect(approved.paymentStatus).toBe('PAYMENT_SUBMITTED');
    expect(approved.approvedById).toBe('finance-manager');
    expect(approved.approvedAt).toBeDefined();

    // 3. Mark Paid requires payment reference code
    await expect(
      reviewInfluencerPayment({
        paymentId: payment.id,
        action: 'MARK_PAID',
        paymentReference: '',
        actorId: 'finance-manager',
      })
    ).rejects.toThrow(/Payment reference code is required/);

    // 4. Mark Paid with valid reference
    const paid = await reviewInfluencerPayment({
      paymentId: payment.id,
      action: 'MARK_PAID',
      paymentReference: 'QNB-WIRE-99281',
      actorId: 'finance-manager',
    });

    expect(paid.paymentStatus).toBe('PAID');
    expect(paid.paymentReference).toBe('QNB-WIRE-99281');
    expect(paid.paidDate).toBeDefined();

    const finalAssignment = mockDb.store.campaignCreator.find((c) => c.id === 'assignment-1');
    expect(finalAssignment.paymentStatus).toBe('PAID');
    expect(finalAssignment.paymentReference).toBe('QNB-WIRE-99281');
  });

  it('4. Lists agreements and payments by campaign ID', async () => {
    await createInfluencerAgreement({ campaignCreatorId: 'assignment-1', agreedRate: 5000 });
    await submitInfluencerInvoice({ campaignCreatorId: 'assignment-1', invoiceNumber: 'INV-10', amount: 5000 });

    const agreements = await getCampaignAgreements('campaign-1');
    const payments = await getCampaignPayments('campaign-1');

    expect(agreements).toHaveLength(1);
    expect(payments).toHaveLength(1);
  });
});
