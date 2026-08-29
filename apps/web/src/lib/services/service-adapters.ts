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
  VerifiedProofPoint,
  getCanonicalService,
} from './canonical-services';

/**
 * Safely parse JSON array or object with fallback.
 */
function safeJsonParse<T>(input: unknown, fallback: T): T {
  if (input === undefined || input === null) return fallback;
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
 * Unverified claims are strictly suppressed.
 */
export function adaptDbServiceToPresentation(
  dbService: Partial<Service> & {
    gallery?: Partial<ServiceGalleryItem>[];
    projects?: any[];
    [key: string]: any;
  }
): CanonicalService {
  const canonicalBase = dbService.slug ? getCanonicalService(dbService.slug) : undefined;

  // Unpack process JSON structure if stored as an enhancement object
  const proc =
    typeof dbService.process === 'object' && dbService.process !== null && !Array.isArray(dbService.process)
      ? (dbService.process as Record<string, any>)
      : {};

  // Authoritative database identity fields
  const id = dbService.id || canonicalBase?.id || 'service';
  const slug = dbService.slug || canonicalBase?.slug || 'service';
  const aliases = canonicalBase?.aliases || [];
  const titleEn = dbService.titleEn || canonicalBase?.titleEn || '';
  const titleAr = dbService.titleAr || canonicalBase?.titleAr || '';
  const taglineEn = dbService.taglineEn || canonicalBase?.taglineEn || '';
  const taglineAr = dbService.taglineAr || canonicalBase?.taglineAr || '';
  const categoryEn = (dbService as any).categoryEn || (dbService as any).category || canonicalBase?.categoryEn || 'Enterprise Service';
  const categoryAr = (dbService as any).categoryAr || (dbService as any).category || canonicalBase?.categoryAr || 'خدمات قطاع الأعمال';

  // Hero narrative & media
  const heroOutcomeEn = dbService.heroOutcomeEn || proc.heroOutcomeEn || canonicalBase?.heroOutcomeEn || taglineEn || titleEn;
  const heroOutcomeAr = dbService.heroOutcomeAr || proc.heroOutcomeAr || canonicalBase?.heroOutcomeAr || taglineAr || titleAr;
  const supportingStatementEn =
    dbService.supportingStatementEn || proc.supportingStatementEn || (dbService as any).contentEn || canonicalBase?.supportingStatementEn || '';
  const supportingStatementAr =
    dbService.supportingStatementAr || proc.supportingStatementAr || (dbService as any).contentAr || canonicalBase?.supportingStatementAr || '';
  const heroMediaUrl = dbService.heroMediaUrl || dbService.thumbnail || canonicalBase?.heroMediaUrl || '';
  const heroMediaType = ((dbService.heroMediaType || proc.heroMediaType) as 'IMAGE' | 'VIDEO') || canonicalBase?.heroMediaType || 'IMAGE';
  const mobileHeroMediaUrl = dbService.mobileHeroMediaUrl || proc.mobileHeroMediaUrl || canonicalBase?.mobileHeroMediaUrl;
  const videoPosterUrl = dbService.videoPosterUrl || proc.videoPosterUrl || canonicalBase?.videoPosterUrl;

  // CTAs
  const ctaPrimary = dbService.ctaPrimary || proc.ctaPrimary || canonicalBase?.ctaPrimary || 'BRIEF_BUILDER';
  const ctaPrimaryTextEn = dbService.ctaPrimaryTextEn || proc.ctaPrimaryTextEn || canonicalBase?.ctaPrimaryTextEn;
  const ctaPrimaryTextAr = dbService.ctaPrimaryTextAr || proc.ctaPrimaryTextAr || canonicalBase?.ctaPrimaryTextAr;
  const ctaPrimaryUrl = dbService.ctaPrimaryUrl || proc.ctaPrimaryUrl || canonicalBase?.ctaPrimaryUrl;
  const ctaSecondary = dbService.ctaSecondary || proc.ctaSecondary || canonicalBase?.ctaSecondary;
  const ctaSecondaryTextEn = dbService.ctaSecondaryTextEn || proc.ctaSecondaryTextEn || canonicalBase?.ctaSecondaryTextEn;
  const ctaSecondaryTextAr = dbService.ctaSecondaryTextAr || proc.ctaSecondaryTextAr || canonicalBase?.ctaSecondaryTextAr;
  const ctaSecondaryUrl = dbService.ctaSecondaryUrl || proc.ctaSecondaryUrl || canonicalBase?.ctaSecondaryUrl;

  // Proof points with strict factual verification filter
  const rawProofPoints = safeJsonParse<any[]>(
    dbService.verifiedProofPoints ?? proc.verifiedProofPoints ?? proc.proofPoints,
    canonicalBase?.verifiedProofPoints || []
  );
  // Suppress unverified claims (strictly require isVerified === true)
  const verifiedProofPoints: VerifiedProofPoint[] = (rawProofPoints || []).filter((p: any) => p && p.isVerified === true);

  // Safe JSON extraction for optional enhancement structures
  const objectives = safeJsonParse<ServiceObjective[]>(
    dbService.objectives ?? proc.objectives,
    canonicalBase?.objectives || []
  );

  const capabilities = safeJsonParse<CapabilityBentoItem[]>(
    dbService.capabilities ?? proc.capabilities,
    canonicalBase?.capabilities || []
  );

  const deliverables = safeJsonParse<DeliverableCategory[]>(
    dbService.deliverables ?? proc.deliverables,
    canonicalBase?.deliverables || []
  );

  const lifecycleStages = safeJsonParse<LifecycleStage[]>(
    dbService.lifecycleStages ?? proc.lifecycleStages,
    canonicalBase?.lifecycleStages || []
  );

  const engagementModels = safeJsonParse<EngagementModel[]>(
    dbService.engagementModels ?? proc.engagementModels,
    canonicalBase?.engagementModels || []
  );

  const wowHow = safeJsonParse<any[]>(
    dbService.wowHow ?? proc.wowHow,
    canonicalBase?.wowHow || []
  );

  const serviceSpecificModule: ServiceSpecificModuleConfig = safeJsonParse<ServiceSpecificModuleConfig>(
    dbService.serviceSpecificModule ?? proc.serviceSpecificModule,
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
    dbService.enterpriseReadiness ?? proc.enterpriseReadiness,
    canonicalBase?.enterpriseReadiness || []
  );

  const relatedServiceSlugs = safeJsonParse<string[]>(
    dbService.relatedServiceSlugs ?? proc.relatedServiceSlugs,
    canonicalBase?.relatedServiceSlugs || []
  );

  const relatedCaseStudySlugs = safeJsonParse<string[]>(
    dbService.relatedCaseStudySlugs ?? proc.relatedCaseStudySlugs,
    canonicalBase?.relatedCaseStudySlugs || []
  );

  const relatedServicesNarrativeEn = dbService.relatedServicesNarrativeEn || proc.relatedServicesNarrativeEn;
  const relatedServicesNarrativeAr = dbService.relatedServicesNarrativeAr || proc.relatedServicesNarrativeAr;

  const sectionVisibility = safeJsonParse<Record<string, boolean>>(
    dbService.sectionVisibility ?? proc.sectionVisibility,
    canonicalBase?.sectionVisibility || {}
  );

  const sectionOrdering = safeJsonParse<string[]>(
    dbService.sectionOrdering ?? proc.sectionOrdering,
    canonicalBase?.sectionOrdering || []
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
    mobileHeroMediaUrl,
    videoPosterUrl,
    ctaPrimary,
    ctaPrimaryTextEn,
    ctaPrimaryTextAr,
    ctaPrimaryUrl,
    ctaSecondary,
    ctaSecondaryTextEn,
    ctaSecondaryTextAr,
    ctaSecondaryUrl,
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
    relatedCaseStudySlugs,
    relatedServicesNarrativeEn,
    relatedServicesNarrativeAr,
    sectionVisibility,
    sectionOrdering,
    galleryItems,
  };
}
