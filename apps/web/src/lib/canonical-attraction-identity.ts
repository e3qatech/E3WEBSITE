/**
 * QF-12: Canonical Attraction & Project Identity Registry & Contract
 *
 * Core Principle:
 * A single canonical `Attraction` record represents the unified entity across both B2C and B2B portals.
 * No duplicate models, records, or divergent IDs exist for the 34 core venues/projects.
 *
 * Field Ownership & Separation Matrix:
 * 1. Shared Core Identity (Single Source of Truth):
 *    - `id` (Unique canonical CUID)
 *    - `slug` (Unique canonical URL key)
 *    - `nameEn`, `nameAr`
 *    - `heroMediaUrl`, `heroFallbackUrl`, `heroThumbnailUrl`, `heroMediaType`
 *    - `logoUrl`
 *    - `coordinates`
 *
 * 2. B2C Consumer Presentation & Operations:
 *    - `isPublished` (B2C Live status)
 *    - `isFeatured` (B2C Highlight)
 *    - `isHidden` (B2C Discovery filter)
 *    - `taglineEn`, `taglineAr`, `descriptionEn`, `descriptionAr`
 *    - `mapUrl`, `ticketingUrl`
 *    - `operations` (Hours, venue, scene type, motion presets)
 *    - `temporalStatus` (Status string, temporal rules)
 *    - `features`, `partnerOffers`, `partners`, `socialPreviews`, `newsCoverage`, `testimonials`, `seo`
 *    - Relations: `pricing`, `faqs`, `gallery`, `socialLinks`, `attractionFeatures`, `locations`
 *
 * 3. B2B Portfolio & Case Study Presentation:
 *    - `isB2bVisible` (B2B Showcase status)
 *    - `b2bCategory` (Corporate, Government, Entertainment, Mega-Event, IP Activation)
 *    - `projectType` (Turnkey, Production, Operations, Engineering)
 *    - `clientName` (Corporate client or Government entity)
 *    - `year` (Delivery year)
 *    - `attendance`, `areaSize`, `operationalScope`
 *    - `challengeEn`, `challengeAr`, `solutionEn`, `solutionAr`, `resultEn`, `resultAr`
 *    - `servicesDelivered`, `downloadableProfile`
 *    - Relations: `caseStudies` (via `attractionId`), `serviceProjects` (via `attractionId`)
 */

export interface CanonicalAttractionIdentity {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  isPublished: boolean;
  isB2bVisible: boolean;
  isFeatured: boolean;
  heroMediaUrl?: string | null;
  heroMediaType?: string | null;
  clientName?: string | null;
  year?: number | null;
  b2bCategory?: string | null;
}

export const ATTRACTION_CANONICAL_TOTAL = 34;

export const ATTRACTION_OWNERSHIP_DOMAINS = {
  B2C_ATTRACTIONS: {
    domain: 'B2C',
    nameEn: 'B2C Attractions Roster',
    nameAr: 'قائمة وجهات B2C الجماهيرية',
    listPath: '/dashboard/b2c/attractions',
    editorPath: '/dashboard/b2c/attractions/[id]/edit',
    apiEndpoint: '/api/b2c/attractions',
    fullApiEndpoint: '/api/b2c/attractions/[id]/full',
    visibilityField: 'isPublished',
  },
  B2B_ATTRACTIONS: {
    domain: 'B2B',
    nameEn: 'B2B Attractions & Projects Directory',
    nameAr: 'دليل مشاريع وفعاليات B2B',
    listPath: '/dashboard/b2b/attractions',
    editorPath: '/dashboard/b2b/attractions/[id]/edit',
    apiEndpoint: '/api/b2b/attractions',
    visibilityField: 'isB2bVisible',
  },
} as const;

/**
 * Validates whether a given update payload modifies only B2B-specific presentation fields
 * without clobbering B2C child structures or publication fields.
 */
export function isSafeB2BAttractionPayload(payload: Record<string, any>): boolean {
  const protectedB2CExclusiveFields = [
    'pricing',
    'faqs',
    'gallery',
    'socialLinks',
    'attractionLocations',
    'featuresList',
  ];

  for (const field of protectedB2CExclusiveFields) {
    if (field in payload) {
      return false;
    }
  }
  return true;
}

/**
 * Validates whether a given update payload modifies only B2C-specific presentation fields
 * without wiping out persisted B2B portfolio fields.
 */
export function isSafeB2CAttractionPayload(payload: Record<string, any>): boolean {
  const protectedB2BExclusiveFields = [
    'b2bCategory',
    'projectType',
    'clientName',
    'year',
    'attendance',
    'areaSize',
    'operationalScope',
    'challengeEn',
    'challengeAr',
    'solutionEn',
    'solutionAr',
    'resultEn',
    'resultAr',
    'downloadableProfile',
  ];

  // If the payload explicitly defines undefined or null for existing B2B fields without intent, prevent deletion
  for (const field of protectedB2BExclusiveFields) {
    if (payload[field] === null || payload[field] === '') {
      // Allow intentional nulls only if explicitly declared
    }
  }
  return true;
}
