import db from '@/lib/db';
import { assertTransition, CAMPAIGN_STATUS_TRANSITIONS } from './transitions';
import { logInfluencerAuditEvent } from './audit-service';
import type { CampaignStatus, CampaignType, SocialPlatform } from './types';
import type { CampaignUpsertInput } from './validations';

/**
 * Creates a new influencer campaign linked to optional E3 content
 */
export async function createCampaign(input: CampaignUpsertInput, actorId?: string) {
  // Ensure internalCode uniqueness
  const baseCode = input.internalCode.trim().toUpperCase();
  let code = baseCode;
  let count = 1;
  while (await (db as any).influencerCampaign.findUnique({ where: { internalCode: code } })) {
    code = `${baseCode}-${count++}`;
  }

  const campaign = await (db as any).influencerCampaign.create({
    data: {
      titleEn: input.titleEn,
      titleAr: input.titleAr,
      internalCode: code,
      descriptionEn: input.descriptionEn || null,
      descriptionAr: input.descriptionAr || null,
      campaignType: input.campaignType as CampaignType,
      status: input.status as CampaignStatus,
      objectives: input.objectives,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : null,
      campaignManagerId: input.campaignManagerId || actorId || null,
      internalPointOfContactId: input.internalPointOfContactId || null,
      clientName: input.clientName || null,
      clientContact: input.clientContact || null,
      eventId: input.eventId || null,
      attractionId: input.attractionId || null,
      caseStudyId: input.caseStudyId || null,
      projectId: input.projectId || null,
      bookingQubeReference: input.bookingQubeReference || null,
      targetAudienceJson: input.targetAudienceJson || null,
      platforms: input.platforms as SocialPlatform[],
      budget: input.budget,
      currency: input.currency || 'QAR',
      approvalRequirementsJson: input.approvalRequirementsJson || null,
      brandGuidelinesAssetId: input.brandGuidelinesAssetId || null,
      defaultUsageRights: input.defaultUsageRights || null,
      createdById: actorId || null,
      updatedById: actorId || null,
    },
  });

  await logInfluencerAuditEvent({
    action: 'CREATE_CAMPAIGN',
    entity: 'InfluencerCampaign',
    entityId: campaign.id,
    userId: actorId,
    metadata: { titleEn: campaign.titleEn, code: campaign.internalCode },
  });

  return campaign;
}

/**
 * Updates a campaign with status transition checks
 */
export async function updateCampaign(
  id: string,
  data: Partial<CampaignUpsertInput>,
  actorId?: string
) {
  const current = await (db as any).influencerCampaign.findUnique({ where: { id } });
  if (!current) throw new Error('Campaign not found');

  if (data.status && data.status !== current.status) {
    assertTransition('Campaign', CAMPAIGN_STATUS_TRANSITIONS, current.status, data.status as CampaignStatus);
  }

  const updatePayload: any = {
    ...data,
    updatedById: actorId || null,
  };

  if (data.startDate) updatePayload.startDate = new Date(data.startDate);
  if (data.endDate) updatePayload.endDate = new Date(data.endDate);
  if (data.applicationDeadline !== undefined) {
    updatePayload.applicationDeadline = data.applicationDeadline ? new Date(data.applicationDeadline) : null;
  }

  const updated = await (db as any).influencerCampaign.update({
    where: { id },
    data: updatePayload,
  });

  await logInfluencerAuditEvent({
    action: 'UPDATE_CAMPAIGN',
    entity: 'InfluencerCampaign',
    entityId: id,
    userId: actorId,
    metadata: { changedFields: Object.keys(data) },
  });

  return updated;
}

/**
 * Retrieves campaign by ID with complete relations
 */
export async function getCampaignById(id: string) {
  const campaign = await (db as any).influencerCampaign.findUnique({
    where: { id },
    include: {
      creatorAssignments: {
        include: {
          influencer: {
            include: { platforms: true },
          },
          deliverables: {
            include: {
              submissions: {
                include: { reviews: true },
                orderBy: { version: 'desc' },
              },
            },
          },
          attendanceRecords: true,
          promoCodes: true,
          trackingLinks: true,
        },
      },
      approvalGates: {
        orderBy: { createdAt: 'desc' },
      },
      promoCodes: true,
      trackingLinks: true,
      conversions: {
        orderBy: { occurredAt: 'desc' },
        take: 20,
      },
    },
  });

  return campaign;
}

/**
 * Lists campaigns with filtering and pagination
 */
export async function listCampaigns(params: {
  status?: CampaignStatus;
  campaignType?: CampaignType;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const { status, campaignType, search, page = 1, pageSize = 20 } = params;
  const where: any = { archivedAt: null };

  if (status) where.status = status;
  if (campaignType) where.campaignType = campaignType;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { titleEn: { contains: q, mode: 'insensitive' } },
      { titleAr: { contains: q, mode: 'insensitive' } },
      { internalCode: { contains: q, mode: 'insensitive' } },
      { clientName: { contains: q, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [total, items] = await Promise.all([
    (db as any).influencerCampaign.count({ where }),
    (db as any).influencerCampaign.findMany({
      where,
      include: {
        _count: {
          select: {
            creatorAssignments: true,
            promoCodes: true,
            conversions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    items,
  };
}
