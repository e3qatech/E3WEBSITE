import db from '@/lib/db';
import { assertTransition, PAYMENT_STATUS_TRANSITIONS } from './transitions';
import { logInfluencerAuditEvent } from './audit-service';
import type { PaymentStatus } from './types';

/**
 * Creates a formal InfluencerAgreement record and links it to a CampaignCreator
 */
export async function createInfluencerAgreement({
  campaignCreatorId,
  agreedRate,
  currency = 'QAR',
  agreementType = 'STANDARD_COMMERCIAL',
  agreementAssetId,
  usageRightsTerms,
  usageRightsStartAt,
  usageRightsEndAt,
  exclusivityTerms,
  cancellationTerms,
  notes,
  actorId,
}: {
  campaignCreatorId: string;
  agreedRate?: number | null;
  currency?: string;
  agreementType?: string;
  agreementAssetId?: string | null;
  usageRightsTerms?: string | null;
  usageRightsStartAt?: Date | string | null;
  usageRightsEndAt?: Date | string | null;
  exclusivityTerms?: string | null;
  cancellationTerms?: string | null;
  notes?: string | null;
  actorId?: string;
}) {
  const assignment = await (db as any).campaignCreator.findUnique({
    where: { id: campaignCreatorId },
    include: { influencer: true, campaign: true },
  });
  if (!assignment) throw new Error('Campaign creator assignment not found');

  // Count existing agreements for version numbering
  const count = await (db as any).influencerAgreement.count({
    where: { campaignCreatorId },
  });

  const agreement = await (db as any).influencerAgreement.create({
    data: {
      campaignCreatorId,
      agreedRate: agreedRate !== undefined && agreedRate !== null ? agreedRate : assignment.agreedFee,
      currency: currency || assignment.currency || 'QAR',
      agreementType,
      agreementAssetId: agreementAssetId || null,
      usageRightsTerms: usageRightsTerms || null,
      usageRightsStartAt: usageRightsStartAt ? new Date(usageRightsStartAt) : null,
      usageRightsEndAt: usageRightsEndAt ? new Date(usageRightsEndAt) : null,
      exclusivityTerms: exclusivityTerms || null,
      cancellationTerms: cancellationTerms || null,
      notes: notes || null,
      version: count + 1,
      status: 'PENDING',
      createdById: actorId || null,
    },
  });

  // Synchronize summary fields on assignment
  await (db as any).campaignCreator.update({
    where: { id: campaignCreatorId },
    data: {
      agreementStatus: 'PENDING',
      agreedFee: agreedRate !== undefined && agreedRate !== null ? agreedRate : assignment.agreedFee,
      currency: currency || assignment.currency,
      usageRightsTerms: usageRightsTerms || assignment.usageRightsTerms,
    },
  });

  await logInfluencerAuditEvent({
    action: 'CREATE_AGREEMENT',
    entity: 'InfluencerAgreement',
    entityId: agreement.id,
    userId: actorId,
    metadata: {
      campaignCreatorId,
      version: agreement.version,
      agreedRate,
      agreementType,
    },
  });

  return agreement;
}

/**
 * Updates agreement lifecycle status, signs, countersigns, or terminates
 */
export async function updateAgreementStatus({
  agreementId,
  status,
  signedByCreator = false,
  countersigned = false,
  notes,
  actorId,
}: {
  agreementId: string;
  status?: string;
  signedByCreator?: boolean;
  countersigned?: boolean;
  notes?: string | null;
  actorId?: string;
}) {
  const current = await (db as any).influencerAgreement.findUnique({
    where: { id: agreementId },
    include: { campaignCreator: true },
  });
  if (!current) throw new Error('Agreement not found');

  const updateData: any = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const now = new Date();
  if (signedByCreator) {
    updateData.signedByCreatorAt = now;
    updateData.signedDate = now;
    if (!status) updateData.status = 'SIGNED';
  }
  if (countersigned) {
    updateData.countersignedAt = now;
    if (!status) updateData.status = 'SIGNED';
  }

  const updated = await (db as any).influencerAgreement.update({
    where: { id: agreementId },
    data: updateData,
  });

  // Sync to assignment
  const assignmentUpdates: any = {
    agreementStatus: updated.status,
  };
  if (updated.status === 'SIGNED') {
    assignmentUpdates.status = 'CONTRACTED';
    assignmentUpdates.contractedAt = now;
    assignmentUpdates.signedDate = now;
  }

  await (db as any).campaignCreator.update({
    where: { id: current.campaignCreatorId },
    data: assignmentUpdates,
  });

  await logInfluencerAuditEvent({
    action: `AGREEMENT_${updated.status}`,
    entity: 'InfluencerAgreement',
    entityId: agreementId,
    userId: actorId,
    metadata: { status: updated.status, signedByCreator, countersigned },
  });

  return updated;
}

/**
 * Retrieves all agreements for a given campaign
 */
export async function getCampaignAgreements(campaignId: string) {
  return await (db as any).influencerAgreement.findMany({
    where: {
      campaignCreator: {
        campaignId,
      },
    },
    include: {
      campaignCreator: {
        include: {
          influencer: {
            select: {
              id: true,
              displayName: true,
              handle: true,
              avatarUrl: true,
              tier: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Submits an invoice and creates a formal InfluencerPayment record
 */
export async function submitInfluencerInvoice({
  campaignCreatorId,
  invoiceAssetId,
  invoiceNumber,
  invoiceReceivedDate,
  amount,
  currency = 'QAR',
  actorId,
}: {
  campaignCreatorId: string;
  invoiceAssetId?: string | null;
  invoiceNumber: string;
  invoiceReceivedDate?: Date | string | null;
  amount: number;
  currency?: string;
  actorId?: string;
}) {
  const assignment = await (db as any).campaignCreator.findUnique({
    where: { id: campaignCreatorId },
  });
  if (!assignment) throw new Error('Campaign creator assignment not found');

  const receivedDate = invoiceReceivedDate ? new Date(invoiceReceivedDate) : new Date();

  const payment = await (db as any).influencerPayment.create({
    data: {
      campaignCreatorId,
      invoiceAssetId: invoiceAssetId || null,
      invoiceNumber,
      invoiceReceivedDate: receivedDate,
      amount,
      currency: currency || 'QAR',
      paymentStatus: 'INVOICE_RECEIVED',
    },
  });

  // Synchronize assignment
  await (db as any).campaignCreator.update({
    where: { id: campaignCreatorId },
    data: {
      invoiceAssetId: invoiceAssetId || assignment.invoiceAssetId,
      invoiceNumber,
      invoiceReceivedDate: receivedDate,
      paymentStatus: 'INVOICE_RECEIVED',
    },
  });

  await logInfluencerAuditEvent({
    action: 'SUBMIT_INVOICE',
    entity: 'InfluencerPayment',
    entityId: payment.id,
    userId: actorId,
    metadata: { invoiceNumber, amount, currency },
  });

  return payment;
}

/**
 * Reviews a payment: Finance Approval, Submit Payment, or Mark Paid
 */
export async function reviewInfluencerPayment({
  paymentId,
  action,
  paymentReference,
  paymentMethod,
  financeNotes,
  actorId,
}: {
  paymentId: string;
  action: 'APPROVE' | 'SUBMIT_PAYMENT' | 'MARK_PAID' | 'HOLD' | 'CANCEL';
  paymentReference?: string | null;
  paymentMethod?: string | null;
  financeNotes?: string | null;
  actorId?: string;
}) {
  const current = await (db as any).influencerPayment.findUnique({
    where: { id: paymentId },
    include: { campaignCreator: true },
  });
  if (!current) throw new Error('Payment record not found');

  const now = new Date();
  const updateData: any = {};
  if (financeNotes !== undefined) updateData.financeNotes = financeNotes;
  if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;

  let targetStatus: PaymentStatus = current.paymentStatus;

  switch (action) {
    case 'APPROVE':
      targetStatus = 'PAYMENT_SUBMITTED';
      assertTransition('Payment', PAYMENT_STATUS_TRANSITIONS, current.paymentStatus, targetStatus);
      updateData.paymentStatus = targetStatus;
      updateData.approvedById = actorId || null;
      updateData.approvedAt = now;
      break;

    case 'SUBMIT_PAYMENT':
      targetStatus = 'PAYMENT_SUBMITTED';
      assertTransition('Payment', PAYMENT_STATUS_TRANSITIONS, current.paymentStatus, targetStatus);
      updateData.paymentStatus = targetStatus;
      updateData.paymentSubmittedDate = now;
      break;

    case 'MARK_PAID':
      targetStatus = 'PAID';
      assertTransition('Payment', PAYMENT_STATUS_TRANSITIONS, current.paymentStatus, targetStatus);
      if (!paymentReference && !current.paymentReference) {
        throw new Error('Payment reference code is required to mark as PAID.');
      }
      updateData.paymentStatus = targetStatus;
      updateData.paidDate = now;
      if (paymentReference) updateData.paymentReference = paymentReference;
      break;

    case 'HOLD':
      targetStatus = 'ON_HOLD';
      assertTransition('Payment', PAYMENT_STATUS_TRANSITIONS, current.paymentStatus, targetStatus);
      updateData.paymentStatus = targetStatus;
      break;

    case 'CANCEL':
      targetStatus = 'CANCELLED';
      assertTransition('Payment', PAYMENT_STATUS_TRANSITIONS, current.paymentStatus, targetStatus);
      updateData.paymentStatus = targetStatus;
      break;

    default:
      throw new Error(`Unsupported payment review action: ${action}`);
  }

  const updated = await (db as any).influencerPayment.update({
    where: { id: paymentId },
    data: updateData,
  });

  // Sync to assignment
  const assignmentUpdates: any = {
    paymentStatus: updated.paymentStatus,
  };
  if (updated.paidDate) assignmentUpdates.paidDate = updated.paidDate;
  if (updated.paymentReference) assignmentUpdates.paymentReference = updated.paymentReference;
  if (updated.approvedAmount || updated.amount) {
    assignmentUpdates.approvedAmount = updated.approvedAmount || updated.amount;
  }

  await (db as any).campaignCreator.update({
    where: { id: current.campaignCreatorId },
    data: assignmentUpdates,
  });

  await logInfluencerAuditEvent({
    action: `PAYMENT_${action}`,
    entity: 'InfluencerPayment',
    entityId: paymentId,
    userId: actorId,
    metadata: { action, targetStatus, paymentReference },
  });

  return updated;
}

/**
 * Retrieves all payments for a given campaign
 */
export async function getCampaignPayments(campaignId: string) {
  return await (db as any).influencerPayment.findMany({
    where: {
      campaignCreator: {
        campaignId,
      },
    },
    include: {
      campaignCreator: {
        include: {
          influencer: {
            select: {
              id: true,
              displayName: true,
              handle: true,
              avatarUrl: true,
              tier: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Legacy support / direct assignment update wrapper
 */
export async function updateCreatorCommercialAgreement(params: {
  assignmentId: string;
  proposedRate?: number | null;
  counterRate?: number | null;
  agreedRate?: number | null;
  currency?: string;
  agreementStatus?: string | null;
  agreementAssetId?: string | null;
  signedDate?: Date | string | null;
  usageRightsTerms?: string | null;
  exclusivityTerms?: string | null;
  cancellationTerms?: string | null;
  actorId?: string;
}) {
  const current = await (db as any).campaignCreator.findUnique({ where: { id: params.assignmentId } });
  if (!current) throw new Error('Campaign creator assignment not found');

  const updateData: any = {};
  if (params.proposedRate !== undefined) updateData.proposedRate = params.proposedRate;
  if (params.counterRate !== undefined) updateData.counterRate = params.counterRate;
  if (params.agreedRate !== undefined) {
    updateData.agreedRate = params.agreedRate;
    updateData.status = 'CONTRACTED';
    updateData.contractedAt = new Date();
  }
  if (params.currency) updateData.currency = params.currency;
  if (params.agreementStatus !== undefined) updateData.agreementStatus = params.agreementStatus;
  if (params.agreementAssetId !== undefined) updateData.agreementAssetId = params.agreementAssetId;
  if (params.signedDate !== undefined) updateData.signedDate = params.signedDate ? new Date(params.signedDate) : null;
  if (params.usageRightsTerms !== undefined) updateData.usageRightsTerms = params.usageRightsTerms;
  if (params.exclusivityTerms !== undefined) updateData.exclusivityTerms = params.exclusivityTerms;
  if (params.cancellationTerms !== undefined) updateData.cancellationTerms = params.cancellationTerms;

  const updated = await (db as any).campaignCreator.update({
    where: { id: params.assignmentId },
    data: updateData,
  });

  await logInfluencerAuditEvent({
    action: 'UPDATE_COMMERCIAL_AGREEMENT',
    entity: 'CampaignCreator',
    entityId: params.assignmentId,
    userId: params.actorId,
    metadata: { agreedRate: params.agreedRate, agreementStatus: params.agreementStatus },
  });

  return updated;
}

/**
 * Legacy support / direct assignment payment tracking
 */
export async function updatePaymentTracking(params: {
  assignmentId: string;
  invoiceAssetId?: string | null;
  invoiceNumber?: string | null;
  invoiceReceivedDate?: Date | string | null;
  approvedAmount?: number | null;
  paymentReference?: string | null;
  paymentStatus?: PaymentStatus;
  financeNotes?: string | null;
  actorId?: string;
}) {
  const current = await (db as any).campaignCreator.findUnique({ where: { id: params.assignmentId } });
  if (!current) throw new Error('Assignment not found');

  if (params.paymentStatus && params.paymentStatus !== current.paymentStatus) {
    assertTransition('Payment', PAYMENT_STATUS_TRANSITIONS, current.paymentStatus, params.paymentStatus);
  }

  const updateData: any = {};
  if (params.invoiceAssetId !== undefined) updateData.invoiceAssetId = params.invoiceAssetId;
  if (params.invoiceNumber !== undefined) updateData.invoiceNumber = params.invoiceNumber;
  if (params.invoiceReceivedDate !== undefined) {
    updateData.invoiceReceivedDate = params.invoiceReceivedDate ? new Date(params.invoiceReceivedDate) : null;
  }
  if (params.approvedAmount !== undefined) updateData.approvedAmount = params.approvedAmount;
  if (params.paymentReference !== undefined) updateData.paymentReference = params.paymentReference;
  if (params.financeNotes !== undefined) updateData.financeNotes = params.financeNotes;

  if (params.paymentStatus) {
    updateData.paymentStatus = params.paymentStatus;
    if (params.paymentStatus === 'PAYMENT_SUBMITTED' && !current.paymentSubmittedDate) {
      updateData.paymentSubmittedDate = new Date();
    }
    if (params.paymentStatus === 'PAID') {
      if (!params.paymentReference && !current.paymentReference) {
        throw new Error('Payment cannot be marked PAID without a valid payment reference.');
      }
      updateData.paidDate = new Date();
    }
  }

  const updated = await (db as any).campaignCreator.update({
    where: { id: params.assignmentId },
    data: updateData,
  });

  await logInfluencerAuditEvent({
    action: `PAYMENT_${params.paymentStatus || 'UPDATE'}`,
    entity: 'CampaignCreator',
    entityId: params.assignmentId,
    userId: params.actorId,
    metadata: { paymentStatus: params.paymentStatus, invoiceNumber: params.invoiceNumber, approvedAmount: params.approvedAmount },
  });

  return updated;
}

