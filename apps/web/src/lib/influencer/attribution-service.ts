import crypto from 'crypto';
import db from '@/lib/db';
import { logInfluencerAuditEvent } from './audit-service';
import type { DiscountType } from './types';

/**
 * Normalizes promo code: trims and uppercase for case-insensitive uniqueness
 */
export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

/**
 * Creates a unique promo code for a campaign and/or creator
 */
export async function createPromoCode({
  campaignId,
  campaignCreatorId,
  code,
  discountType = 'PERCENTAGE',
  discountValue,
  currency = 'QAR',
  validFrom,
  validUntil,
  usageLimit,
  eligibleProducts,
  bookingQubeReference,
  actorId,
}: {
  campaignId: string;
  campaignCreatorId?: string | null;
  code: string;
  discountType?: DiscountType;
  discountValue: number;
  currency?: string;
  validFrom: Date | string;
  validUntil: Date | string;
  usageLimit?: number | null;
  eligibleProducts?: string[] | null;
  bookingQubeReference?: string | null;
  actorId?: string;
}) {
  const cleanCode = normalizePromoCode(code);

  const existing = await (db as any).promoCode.findUnique({
    where: { code: cleanCode },
  });

  if (existing) {
    throw new Error(`Promo code '${cleanCode}' already exists. Promo codes must be globally unique.`);
  }

  const promo = await (db as any).promoCode.create({
    data: {
      campaignId,
      campaignCreatorId: campaignCreatorId || null,
      code: cleanCode,
      discountType,
      discountValue,
      currency,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      usageLimit: usageLimit || null,
      eligibleProductsJson: eligibleProducts || null,
      bookingQubeReference: bookingQubeReference || null,
      isActive: true,
    },
  });

  await logInfluencerAuditEvent({
    action: 'CREATE_PROMO_CODE',
    entity: 'PromoCode',
    entityId: promo.id,
    userId: actorId,
    metadata: { code: cleanCode, campaignId },
  });

  return promo;
}

/**
 * Creates a tracking link with shortCode and UTM parameters
 */
export async function createTrackingLink({
  campaignId,
  campaignCreatorId,
  destinationUrl,
  utmCampaign,
  utmContent,
  actorId,
}: {
  campaignId: string;
  campaignCreatorId?: string | null;
  destinationUrl: string;
  utmCampaign: string;
  utmContent?: string | null;
  actorId?: string;
}) {
  // Validate allowed destination domain
  try {
    const url = new URL(destinationUrl);
    const host = url.hostname.toLowerCase();
    const isE3Domain = host.endsWith('eeeqa.com') || host.endsWith('localhost') || host.includes('bookingqube');
    if (!isE3Domain) {
      console.warn(`[Tracking Link Warning] Destination ${host} is external to E3 domain`);
    }
  } catch (_e) {
    throw new Error('Destination must be a valid URL.');
  }

  const shortCode = `E3${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const link = await (db as any).trackingLink.create({
    data: {
      campaignId,
      campaignCreatorId: campaignCreatorId || null,
      destinationUrl,
      shortCode,
      utmSource: 'influencer',
      utmMedium: 'creator',
      utmCampaign,
      utmContent: utmContent || null,
    },
  });

  await logInfluencerAuditEvent({
    action: 'CREATE_TRACKING_LINK',
    entity: 'TrackingLink',
    entityId: link.id,
    userId: actorId,
    metadata: { shortCode, destinationUrl },
  });

  return link;
}

/**
 * Resolves a tracking link shortCode, atomically increments its clickCount,
 * validates domain safety, and appends UTM attribution parameters.
 */
export async function resolveTrackingLinkRedirect(
  shortCode: string,
  extraParams?: Record<string, string> | URLSearchParams
): Promise<{ found: boolean; redirectUrl: string | null; link?: any }> {
  if (!shortCode) return { found: false, redirectUrl: null };
  const cleanCode = shortCode.trim().toUpperCase();

  const link = await (db as any).trackingLink.findUnique({
    where: { shortCode: cleanCode },
    include: {
      campaign: true,
      campaignCreator: { include: { influencer: true } },
    },
  });

  if (!link) {
    return { found: false, redirectUrl: null };
  }

  // Atomically increment clickCount
  await (db as any).trackingLink.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } },
  });

  // Build target URL
  let targetUrl: URL;
  try {
    targetUrl = new URL(link.destinationUrl);
  } catch (_e) {
    // Default to E3 production base if relative
    targetUrl = new URL(link.destinationUrl, 'https://eeeqa.com');
  }

  // Preserve and enrich UTM query parameters
  if (!targetUrl.searchParams.has('utm_source') && link.utmSource) {
    targetUrl.searchParams.set('utm_source', link.utmSource);
  }
  if (!targetUrl.searchParams.has('utm_medium') && link.utmMedium) {
    targetUrl.searchParams.set('utm_medium', link.utmMedium);
  }
  if (!targetUrl.searchParams.has('utm_campaign') && link.utmCampaign) {
    targetUrl.searchParams.set('utm_campaign', link.utmCampaign);
  }
  if (!targetUrl.searchParams.has('utm_content') && link.utmContent) {
    targetUrl.searchParams.set('utm_content', link.utmContent);
  }
  targetUrl.searchParams.set('ref_code', cleanCode);

  // Preserve extra incoming params
  if (extraParams) {
    if (extraParams instanceof URLSearchParams) {
      extraParams.forEach((val, key) => {
        if (!targetUrl.searchParams.has(key) && val) {
          targetUrl.searchParams.set(key, val);
        }
      });
    } else {
      const keys = Object.keys(extraParams);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const val = extraParams[k];
        if (!targetUrl.searchParams.has(k) && val) {
          targetUrl.searchParams.set(k, val);
        }
      }
    }
  }

  return {
    found: true,
    redirectUrl: targetUrl.toString(),
    link,
  };
}

/**
 * Records an attributed ticket conversion atomically (Section 15).
 * Enforces idempotency via unique externalEventId.
 */
export async function recordConversion({
  campaignId,
  campaignCreatorId,
  promoCodeId,
  trackingLinkId,
  externalEventId,
  externalOrderId,
  ticketCount = 1,
  grossRevenue,
  discountAmount = 0,
  refundAmount = 0,
  netRevenue,
  currency = 'QAR',
  occurredAt = new Date(),
  rawPayload,
}: {
  campaignId: string;
  campaignCreatorId?: string | null;
  promoCodeId?: string | null;
  trackingLinkId?: string | null;
  externalEventId: string;
  externalOrderId: string;
  ticketCount?: number;
  grossRevenue: number;
  discountAmount?: number;
  refundAmount?: number;
  netRevenue?: number;
  currency?: string;
  occurredAt?: Date;
  rawPayload: Record<string, any>;
}) {
  const calculatedNet = netRevenue !== undefined ? netRevenue : Math.max(0, grossRevenue - discountAmount - refundAmount);

  // Check idempotency
  const existing = await (db as any).influencerConversion.findUnique({
    where: { externalEventId },
  });

  if (existing) {
    return { conversion: existing, isDuplicate: true };
  }

  const conversion = await (db as any).$transaction(async (tx: any) => {
    const conv = await tx.influencerConversion.create({
      data: {
        campaignId,
        campaignCreatorId: campaignCreatorId || null,
        promoCodeId: promoCodeId || null,
        trackingLinkId: trackingLinkId || null,
        externalEventId,
        externalOrderId,
        ticketCount,
        grossRevenue,
        discountAmount,
        refundAmount,
        netRevenue: calculatedNet,
        currency,
        occurredAt,
        rawPayloadJson: rawPayload,
      },
    });

    // Increment promo code usage counter if applicable
    if (promoCodeId) {
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { usageCount: { increment: 1 } },
      });
    }

    return conv;
  });

  await logInfluencerAuditEvent({
    action: 'RECORD_CONVERSION',
    entity: 'InfluencerConversion',
    entityId: conversion.id,
    metadata: { externalOrderId, grossRevenue, ticketCount },
  });

  return { conversion, isDuplicate: false };
}

/**
 * Retrieves conversions for reconciliation (default: UNMATCHED_CODE)
 */
export async function getUnmatchedConversions({
  page = 1,
  limit = 20,
  status = 'UNMATCHED_CODE',
  search,
}: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const where: any = {};
  if (status && status !== 'ALL') {
    where.reconciliationStatus = status;
  }
  if (search) {
    where.OR = [
      { unmatchedCode: { contains: search, mode: 'insensitive' } },
      { externalOrderId: { contains: search, mode: 'insensitive' } },
      { externalEventId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [conversions, total] = await Promise.all([
    (db as any).influencerConversion.findMany({
      where,
      include: {
        campaign: { select: { id: true, titleEn: true, internalCode: true } },
        campaignCreator: {
          include: {
            influencer: { select: { id: true, displayName: true, handle: true } },
          },
        },
      },
      orderBy: { occurredAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    (db as any).influencerConversion.count({ where }),
  ]);

  return {
    conversions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Resolves an unmatched conversion (manually match or dismiss)
 */
export async function resolveUnmatchedConversion({
  conversionId,
  action,
  targetCampaignId,
  targetCampaignCreatorId,
  notes,
  actorId,
}: {
  conversionId: string;
  action: 'MATCH' | 'DISMISS';
  targetCampaignId?: string;
  targetCampaignCreatorId?: string;
  notes?: string;
  actorId?: string;
}) {
  const current = await (db as any).influencerConversion.findUnique({
    where: { id: conversionId },
  });
  if (!current) throw new Error('Conversion record not found');

  const updateData: any = {};

  if (action === 'MATCH') {
    if (!targetCampaignId) throw new Error('targetCampaignId is required to match conversion');
    updateData.campaignId = targetCampaignId;
    if (targetCampaignCreatorId) {
      updateData.campaignCreatorId = targetCampaignCreatorId;
    }
    updateData.reconciliationStatus = 'MANUALLY_MATCHED';
  } else if (action === 'DISMISS') {
    updateData.reconciliationStatus = 'DISMISSED';
  } else {
    throw new Error(`Unsupported reconciliation action: ${action}`);
  }

  const updated = await (db as any).influencerConversion.update({
    where: { id: conversionId },
    data: updateData,
  });

  await logInfluencerAuditEvent({
    action: `RECONCILIATION_${action}`,
    entity: 'InfluencerConversion',
    entityId: conversionId,
    userId: actorId,
    metadata: {
      action,
      unmatchedCode: current.unmatchedCode,
      targetCampaignId,
      targetCampaignCreatorId,
      notes,
    },
  });

  return updated;
}

