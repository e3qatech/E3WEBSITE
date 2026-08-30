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
  resolveServiceSlug,
} from './canonical-services';

/**
 * Decodes HTML entities and strips unwanted markup.
 */
export function decodeHtmlEntities(text?: string | null): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Strip literal HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&rarr;/g, '→')
    .replace(/&larr;/g, '←')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&bull;/g, '•')
    .trim();
}

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
  const titleEn = decodeHtmlEntities(dbService.titleEn || canonicalBase?.titleEn || '');
  const titleAr = decodeHtmlEntities(dbService.titleAr || canonicalBase?.titleAr || '');
  const taglineEn = decodeHtmlEntities(dbService.taglineEn || canonicalBase?.taglineEn || '');
  const taglineAr = decodeHtmlEntities(dbService.taglineAr || canonicalBase?.taglineAr || '');
  const categoryEn = decodeHtmlEntities((dbService as any).categoryEn || (dbService as any).category || canonicalBase?.categoryEn || 'Enterprise Service');
  const categoryAr = decodeHtmlEntities((dbService as any).categoryAr || (dbService as any).category || canonicalBase?.categoryAr || 'خدمات قطاع الأعمال');

  // Hero narrative & media
  const heroOutcomeEn = decodeHtmlEntities(dbService.heroOutcomeEn || proc.heroOutcomeEn || canonicalBase?.heroOutcomeEn || taglineEn || titleEn);
  const heroOutcomeAr = decodeHtmlEntities(dbService.heroOutcomeAr || proc.heroOutcomeAr || canonicalBase?.heroOutcomeAr || taglineAr || titleAr);
  const supportingStatementEn = decodeHtmlEntities(
    dbService.supportingStatementEn || proc.supportingStatementEn || (dbService as any).contentEn || canonicalBase?.supportingStatementEn || ''
  );
  const supportingStatementAr = decodeHtmlEntities(
    dbService.supportingStatementAr || proc.supportingStatementAr || (dbService as any).contentAr || canonicalBase?.supportingStatementAr || ''
  );
  const heroMediaUrl = dbService.heroMediaUrl || dbService.thumbnail || canonicalBase?.heroMediaUrl || '';
  const heroMediaType = ((dbService.heroMediaType || proc.heroMediaType) as 'IMAGE' | 'VIDEO') || canonicalBase?.heroMediaType || 'IMAGE';
  const mobileHeroMediaUrl = dbService.mobileHeroMediaUrl || proc.mobileHeroMediaUrl || canonicalBase?.mobileHeroMediaUrl;
  const videoPosterUrl = dbService.videoPosterUrl || proc.videoPosterUrl || canonicalBase?.videoPosterUrl;

  // CTAs
  const ctaPrimary = dbService.ctaPrimary || proc.ctaPrimary || canonicalBase?.ctaPrimary || 'BRIEF_BUILDER';
  const ctaPrimaryTextEn = decodeHtmlEntities(dbService.ctaPrimaryTextEn || proc.ctaPrimaryTextEn || canonicalBase?.ctaPrimaryTextEn);
  const ctaPrimaryTextAr = decodeHtmlEntities(dbService.ctaPrimaryTextAr || proc.ctaPrimaryTextAr || canonicalBase?.ctaPrimaryTextAr);
  const ctaPrimaryUrl = dbService.ctaPrimaryUrl || proc.ctaPrimaryUrl || canonicalBase?.ctaPrimaryUrl;
  const ctaSecondary = dbService.ctaSecondary || proc.ctaSecondary || canonicalBase?.ctaSecondary;
  const ctaSecondaryTextEn = decodeHtmlEntities(dbService.ctaSecondaryTextEn || proc.ctaSecondaryTextEn || canonicalBase?.ctaSecondaryTextEn);
  const ctaSecondaryTextAr = decodeHtmlEntities(dbService.ctaSecondaryTextAr || proc.ctaSecondaryTextAr || canonicalBase?.ctaSecondaryTextAr);
  const ctaSecondaryUrl = dbService.ctaSecondaryUrl || proc.ctaSecondaryUrl || canonicalBase?.ctaSecondaryUrl;

  // Proof points with strict factual verification filter (database only)
  const rawProofPoints = safeJsonParse<any[]>(
    dbService.verifiedProofPoints ?? proc.verifiedProofPoints ?? proc.proofPoints,
    []
  );
  // Suppress unverified claims (strictly require isVerified === true)
  const verifiedProofPoints: VerifiedProofPoint[] = (rawProofPoints || []).filter((p: any) => p && p.isVerified === true);

  // Safe JSON extraction for optional enhancement structures (database-only, suppress if absent)
  const objectives = safeJsonParse<ServiceObjective[]>(
    dbService.objectives ?? proc.objectives,
    canonicalBase?.objectives || []
  );

  const capabilities = safeJsonParse<CapabilityBentoItem[]>(
    dbService.capabilities ?? proc.capabilities,
    []
  );

  const deliverables = safeJsonParse<DeliverableCategory[]>(
    dbService.deliverables ?? proc.deliverables,
    []
  );

  const lifecycleStages = safeJsonParse<LifecycleStage[]>(
    dbService.lifecycleStages ?? proc.lifecycleStages,
    []
  );

  const engagementModels = safeJsonParse<EngagementModel[]>(
    dbService.engagementModels ?? proc.engagementModels,
    []
  );

  const wowHow = safeJsonParse<any[]>(
    dbService.wowHow ?? proc.wowHow,
    []
  );

  const serviceSpecificModule: ServiceSpecificModuleConfig = safeJsonParse<ServiceSpecificModuleConfig>(
    dbService.serviceSpecificModule ?? proc.serviceSpecificModule,
    {
      type: 'none',
      titleEn: '',
      titleAr: '',
      subtitleEn: '',
      subtitleAr: '',
      data: {}
    }
  );

  const enterpriseReadiness = safeJsonParse<EnterpriseReadinessItem[]>(
    dbService.enterpriseReadiness ?? proc.enterpriseReadiness,
    []
  );

  const rawRelatedSlugs = safeJsonParse<string[]>(
    dbService.relatedServiceSlugs ?? proc.relatedServiceSlugs,
    canonicalBase?.relatedServiceSlugs || []
  );
  const relatedServiceSlugs = (rawRelatedSlugs || []).map((s: string) => resolveServiceSlug(s));

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
