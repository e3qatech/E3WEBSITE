import { Service, ServiceGalleryItem } from '@prisma/client';
import {
  CanonicalService,
  ServiceObjective,
  DeliverableCategory,
  LifecycleStage,
  EngagementModel,
  CapabilityBentoItem,
  EnterpriseReadinessItem,
  ServiceSpecificModuleConfig,
  ServiceGalleryItemPayload,
  getCanonicalService,
} from './canonical-services';

/**
 * Safely parse JSON array or object with fallback.
 */
function safeJsonParse<T>(input: unknown, fallback: T): T {
  if (!input) return fallback;
  if (typeof input === 'object') return input as T;
  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Compatibility Adapter:
 * Merges Prisma Service database records with presentation contracts safely.
 * Existing production DB records remain authoritative.
 * Missing optional enhancement data suppresses only that section.
 */
export function adaptDbServiceToPresentation(
  dbService: Partial<Service> & {
    gallery?: Partial<ServiceGalleryItem>[];
    projects?: any[];
    [key: string]: any;
  }
): CanonicalService {
  const canonicalBase = dbService.slug ? getCanonicalService(dbService.slug) : undefined;

  // Authoritative database fields
  const id = dbService.id || canonicalBase?.id || 'service';
  const slug = dbService.slug || canonicalBase?.slug || 'service';
  const aliases = canonicalBase?.aliases || [];
  const titleEn = dbService.titleEn || canonicalBase?.titleEn || '';
  const titleAr = dbService.titleAr || canonicalBase?.titleAr || '';
  const taglineEn = dbService.taglineEn || canonicalBase?.taglineEn || '';
  const taglineAr = dbService.taglineAr || canonicalBase?.taglineAr || '';
  const categoryEn = (dbService as any).categoryEn || (dbService as any).category || canonicalBase?.categoryEn || 'Enterprise Service';
  const categoryAr = (dbService as any).categoryAr || (dbService as any).category || canonicalBase?.categoryAr || 'خدمات قطاع الأعمال';
  const heroOutcomeEn = canonicalBase?.heroOutcomeEn || taglineEn || titleEn;
  const heroOutcomeAr = canonicalBase?.heroOutcomeAr || taglineAr || titleAr;
  const supportingStatementEn = (dbService as any).contentEn || canonicalBase?.supportingStatementEn || '';
  const supportingStatementAr = (dbService as any).contentAr || canonicalBase?.supportingStatementAr || '';
  const heroMediaUrl = dbService.heroMediaUrl || dbService.thumbnail || canonicalBase?.heroMediaUrl || '';
  const heroMediaType = (dbService.heroMediaType as 'IMAGE' | 'VIDEO') || canonicalBase?.heroMediaType || 'IMAGE';
  const verifiedProofPoints = canonicalBase?.verifiedProofPoints || [];

  // Safe JSON extraction for optional enhancement structures
  const objectives = safeJsonParse<ServiceObjective[]>(
    dbService.objectives,
    canonicalBase?.objectives || []
  );

  const capabilities = safeJsonParse<CapabilityBentoItem[]>(
    dbService.capabilities,
    canonicalBase?.capabilities || []
  );

  const deliverables = safeJsonParse<DeliverableCategory[]>(
    dbService.deliverables,
    canonicalBase?.deliverables || []
  );

  const lifecycleStages = safeJsonParse<LifecycleStage[]>(
    dbService.lifecycleStages,
    canonicalBase?.lifecycleStages || []
  );

  const engagementModels = safeJsonParse<EngagementModel[]>(
    dbService.engagementModels,
    canonicalBase?.engagementModels || []
  );

  const wowHow = safeJsonParse<any[]>(
    dbService.wowHow,
    canonicalBase?.wowHow || []
  );

  const serviceSpecificModule: ServiceSpecificModuleConfig = safeJsonParse<ServiceSpecificModuleConfig>(
    dbService.serviceSpecificModule,
    canonicalBase?.serviceSpecificModule || {
      type: 'scale-explorer',
      titleEn: 'Scope & Specifications',
      titleAr: 'المواصفات ونطاق العمل',
      subtitleEn: 'Production overview',
      subtitleAr: 'نظرة عامة على التنفيذ',
      data: {}
    }
  );

  const enterpriseReadiness = safeJsonParse<EnterpriseReadinessItem[]>(
    dbService.enterpriseReadiness,
    canonicalBase?.enterpriseReadiness || []
  );

  const relatedServiceSlugs = safeJsonParse<string[]>(
    dbService.relatedServiceSlugs,
    canonicalBase?.relatedServiceSlugs || []
  );

  // Gallery items from relation or JSON
  const galleryItems: ServiceGalleryItemPayload[] = (dbService.gallery || []).map((item: any, idx: number) => ({
    id: item.id || `gallery-${idx}`,
    url: item.url || item.mediaUrl || '',
    mediaUrl: item.mediaUrl || item.url || '',
    mediaType: (item.mediaType as 'IMAGE' | 'VIDEO') || 'IMAGE',
    captionEn: item.captionEn || item.titleEn || '',
    captionAr: item.captionAr || item.titleAr || '',
    titleEn: item.titleEn || item.captionEn || '',
    titleAr: item.titleAr || item.captionAr || '',
    orderIndex: item.orderIndex ?? idx,
    isVisible: item.isVisible ?? true,
    aspectRatio: (item.aspectRatio as any) || '16:9',
  }));

  return {
    id,
    slug,
    aliases,
    titleEn,
    titleAr,
    categoryEn,
    categoryAr,
    taglineEn,
    taglineAr,
    heroOutcomeEn,
    heroOutcomeAr,
    supportingStatementEn,
    supportingStatementAr,
    heroMediaUrl,
    heroMediaType,
    verifiedProofPoints,
    wowHow,
    objectives,
    capabilities,
    deliverables,
    lifecycleStages,
    engagementModels,
    serviceSpecificModule,
    enterpriseReadiness,
    relatedServiceSlugs,
    galleryItems,
  };
}
