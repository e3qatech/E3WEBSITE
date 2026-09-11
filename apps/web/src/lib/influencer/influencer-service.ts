import db from '@/lib/db';
import { assertTransition, INFLUENCER_STATUS_TRANSITIONS } from './transitions';
import { logInfluencerAuditEvent } from './audit-service';
import type { InfluencerStatus, CreatorTier, SocialPlatform, PublicCreatorProfile } from './types';
import type { InfluencerUpsertInput } from './validations';

/**
 * Creates an influencer record internally
 */
export async function createInfluencer(
  data: InfluencerUpsertInput,
  actorId?: string
) {
  // Enforce slug generation / uniqueness
  const baseSlug = data.slug || data.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let slug = baseSlug;
  let count = 1;
  while (await (db as any).influencer.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`;
  }

  const created = await (db as any).influencer.create({
    data: {
      displayName: data.displayName,
      legalName: data.legalName,
      slug,
      email: data.email || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      profileImage: data.profileImage || null,
      bioEn: data.bioEn || null,
      bioAr: data.bioAr || null,
      location: data.location || null,
      nationality: data.nationality || null,
      isQatarBased: data.isQatarBased,
      preferredLocale: data.preferredLocale,
      creatorTier: data.creatorTier,
      status: data.status,
      categories: data.categories,
      languages: data.languages,
      website: data.website || null,
      contentSuitability: data.contentSuitability || null,
      brandSafetyStatus: data.brandSafetyStatus,
      brandSafetyNotes: data.brandSafetyNotes || null,
      agencyName: data.agencyName || null,
      agencyContactName: data.agencyContactName || null,
      agencyEmail: data.agencyEmail || null,
      agencyPhone: data.agencyPhone || null,
      relationshipOwnerId: data.relationshipOwnerId || actorId || null,
      internalRating: data.internalRating || null,
      publicFeatureEnabled: data.publicFeatureEnabled,
      publicDisplayOrder: data.publicDisplayOrder,
      createdById: actorId || null,
      updatedById: actorId || null,
    },
  });

  await logInfluencerAuditEvent({
    action: 'CREATE_INFLUENCER',
    entity: 'Influencer',
    entityId: created.id,
    userId: actorId,
    metadata: { displayName: created.displayName, slug: created.slug },
  });

  return created;
}

/**
 * Updates an influencer with transition checking
 */
export async function updateInfluencer(
  id: string,
  data: Partial<InfluencerUpsertInput>,
  actorId?: string
) {
  const current = await (db as any).influencer.findUnique({ where: { id } });
  if (!current) throw new Error('Influencer not found');

  if (data.status && data.status !== current.status) {
    assertTransition('Influencer', INFLUENCER_STATUS_TRANSITIONS, current.status, data.status as InfluencerStatus);
  }

  const updated = await (db as any).influencer.update({
    where: { id },
    data: {
      ...data,
      updatedById: actorId || null,
    },
  });

  await logInfluencerAuditEvent({
    action: 'UPDATE_INFLUENCER',
    entity: 'Influencer',
    entityId: id,
    userId: actorId,
    metadata: { changedFields: Object.keys(data) },
  });

  return updated;
}

/**
 * Retrieves an influencer by ID.
 * When `includeSensitive` is false (e.g. general viewers), contact, commercial, and internal notes are omitted.
 */
export async function getInfluencerById(
  id: string,
  optionsOrIncludeSensitive: boolean | { includeSensitive?: boolean; includeCommercial?: boolean } = true
) {
  const includeSensitive =
    typeof optionsOrIncludeSensitive === 'boolean'
      ? optionsOrIncludeSensitive
      : optionsOrIncludeSensitive?.includeSensitive ?? true;
  const influencer = await (db as any).influencer.findUnique({
    where: { id },
    include: {
      platforms: {
        include: {
          metricSnapshots: {
            orderBy: { capturedAt: 'desc' },
            take: 10,
          },
        },
      },
      documents: true,
      campaignAssignments: {
        include: {
          campaign: true,
          deliverables: true,
          attendanceRecords: true,
          promoCodes: true,
        },
      },
    },
  });

  if (!influencer) return null;

  if (!includeSensitive) {
    const {
      email: _email,
      phone: _phone,
      whatsapp: _whatsapp,
      legalName: _legalName,
      agencyEmail: _agencyEmail,
      agencyPhone: _agencyPhone,
      brandSafetyNotes: _brandSafetyNotes,
      internalRating: _internalRating,
      overallScore: _overallScore,
      reliabilityScore: _reliabilityScore,
      ...safeProjection
    } = influencer;
    return safeProjection;
  }

  return influencer;
}

/**
 * Lists influencers with multi-faceted filtering and pagination
 */
export async function listInfluencers(params: {
  search?: string;
  status?: InfluencerStatus;
  creatorTier?: CreatorTier;
  platform?: SocialPlatform;
  isQatarBased?: boolean;
  category?: string;
  language?: string;
  page?: number;
  pageSize?: number;
}) {
  const {
    search,
    status,
    creatorTier,
    platform,
    isQatarBased,
    category,
    language,
    page = 1,
    pageSize = 25,
  } = params;

  const where: any = {};

  if (status) where.status = status;
  if (creatorTier) where.creatorTier = creatorTier;
  if (isQatarBased !== undefined) where.isQatarBased = isQatarBased;
  if (category) where.categories = { has: category };
  if (language) where.languages = { has: language };

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { displayName: { contains: q, mode: 'insensitive' } },
      { legalName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
      { nationality: { contains: q, mode: 'insensitive' } },
      { platforms: { some: { handle: { contains: q, mode: 'insensitive' } } } },
    ];
  }

  if (platform) {
    where.platforms = { some: { platform } };
  }

  const skip = (page - 1) * pageSize;

  const [total, items] = await Promise.all([
    (db as any).influencer.count({ where }),
    (db as any).influencer.findMany({
      where,
      include: {
        platforms: true,
        campaignAssignments: {
          select: { id: true, campaignId: true, status: true },
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

/**
 * Public Featured Creators Projection (Section 17 & 22).
 * Exposes ONLY non-sensitive details for ACTIVE creators who explicitly consented to public featuring.
 */
export async function getPublicFeaturedCreators(): Promise<PublicCreatorProfile[]> {
  const creators = await (db as any).influencer.findMany({
    where: {
      status: 'ACTIVE',
      publicFeatureEnabled: true,
      publicConsentAt: { not: null },
      brandSafetyStatus: { in: ['PASSED', 'VERIFIED_SAFE'] },
      archivedAt: null,
    },
    orderBy: [
      { publicDisplayOrder: 'asc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      displayName: true,
      slug: true,
      profileImage: true,
      bioEn: true,
      bioAr: true,
      categories: true,
      languages: true,
      isQatarBased: true,
      creatorTier: true,
      platforms: {
        select: {
          platform: true,
          handle: true,
          profileUrl: true,
          followerCount: true,
        },
      },
    },
  });

  return creators;
}
