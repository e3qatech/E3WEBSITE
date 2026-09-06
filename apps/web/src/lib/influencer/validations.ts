import { z } from 'zod';

export const SOCIAL_PLATFORMS = [
  'INSTAGRAM',
  'TIKTOK',
  'YOUTUBE',
  'SNAPCHAT',
  'X_TWITTER',
  'LINKEDIN',
  'FACEBOOK',
  'OTHER',
] as const;

export const CREATOR_TIERS = [
  'NANO',
  'MICRO',
  'MID_TIER',
  'MACRO',
  'MEGA',
  'CELEBRITY',
] as const;

export const INFLUENCER_STATUSES = [
  'PROSPECT',
  'INVITED',
  'APPLICATION_SUBMITTED',
  'UNDER_REVIEW',
  'MORE_INFORMATION_REQUIRED',
  'APPROVED',
  'ACTIVE',
  'PAUSED',
  'RESTRICTED',
  'ARCHIVED',
] as const;

export const CAMPAIGN_TYPES = [
  'EVENT_LAUNCH',
  'ATTRACTION_PROMO',
  'HOSTED_VISIT',
  'MEDIA_DAY',
  'INFLUENCER_PREVIEW',
  'CREATOR_RACE',
  'TICKET_SALES',
  'UGC_CAMPAIGN',
  'VENUE_OPENING',
  'PRODUCT_LAUNCH',
  'AMBASSADOR_PROGRAMME',
  'OTHER',
] as const;

export const COLLABORATION_TYPES = [
  'PAID',
  'BARTER',
  'COMPLIMENTARY',
  'HYBRID',
] as const;

export const CONTENT_TYPES = [
  'STORY',
  'REEL',
  'STATIC_POST',
  'CAROUSEL',
  'TIKTOK_VIDEO',
  'YOUTUBE_VIDEO',
  'YOUTUBE_SHORT',
  'SNAPCHAT_STORY',
  'LIVE_STREAM',
  'EVENT_APPEARANCE',
  'CREATOR_RACE',
  'INTERVIEW',
  'UGC_PACKAGE',
] as const;

/**
 * Normalizes email address by trimming and lowercasing
 */
export function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  return email.trim().toLowerCase();
}

/**
 * Normalizes phone number removing whitespace and symbols
 */
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Public bilingual Creator Application Schema
 */
export const publicApplicationSchema = z.object({
  // Basic Details
  displayName: z.string().min(2, { message: 'Display name is required (min 2 characters)' }),
  legalName: z.string().min(2, { message: 'Legal name is required for contracting' }),
  email: z.string().email({ message: 'A valid email address is required' }),
  phone: z.string().min(7, { message: 'A valid phone number is required' }),
  whatsapp: z.string().optional().nullable(),
  location: z.string().min(2, { message: 'Location is required' }),
  nationality: z.string().min(2, { message: 'Nationality is required' }),
  preferredLocale: z.enum(['en', 'ar']).default('en'),
  isQatarBased: z.boolean().default(true),
  isAgencyRepresented: z.boolean().default(false),
  agencyName: z.string().optional().nullable(),
  agencyContactName: z.string().optional().nullable(),
  agencyEmail: z.string().email().optional().nullable().or(z.literal('')),
  agencyPhone: z.string().optional().nullable(),

  // Creator Details
  bioEn: z.string().min(10, { message: 'Short biography is required (min 10 characters)' }),
  bioAr: z.string().optional().nullable(),
  categories: z.array(z.string()).min(1, { message: 'Select at least one content category' }),
  languages: z.array(z.string()).min(1, { message: 'Select at least one language' }),
  website: z.string().url().optional().nullable().or(z.literal('')),
  mediaKitUrl: z.string().url().optional().nullable().or(z.literal('')),
  pastCollaborationSamples: z.string().optional().nullable(),
  preferredCampaignFormats: z.array(z.string()).optional().default([]),

  // Social Profile URLs (at least one valid social platform handle or URL)
  socialProfiles: z.array(
    z.object({
      platform: z.enum(SOCIAL_PLATFORMS),
      handle: z.string().min(1, { message: 'Handle is required' }),
      profileUrl: z.string().url({ message: 'Valid profile URL required' }),
      followerCount: z.number().int().nonnegative().optional().default(0),
    })
  ).min(1, { message: 'Provide at least one active social media profile' }),

  // Availability & Commercial
  generalAvailability: z.string().optional().nullable(),
  eventAppearanceInterest: z.boolean().default(true),
  collaborationPreference: z.enum(COLLABORATION_TYPES).default('PAID'),
  indicativeRateRange: z.string().optional().nullable(),
  travelAvailability: z.boolean().default(true),

  // Consent
  dataConsent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to personal data processing under Qatar PDPL',
  }),
  communicationConsent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to receiving campaign communications',
  }),
  publicFeatureConsent: z.boolean().default(false),
  accuracyConfirmation: z.boolean().refine((val) => val === true, {
    message: 'You must confirm that all provided details are accurate',
  }),
});

export type PublicApplicationInput = z.infer<typeof publicApplicationSchema>;

/**
 * Internal Influencer Create / Edit Schema
 */
export const influencerUpsertSchema = z.object({
  displayName: z.string().min(2),
  legalName: z.string().optional().nullable(),
  slug: z.string().min(2),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  profileImage: z.string().optional().nullable(),
  bioEn: z.string().optional().nullable(),
  bioAr: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  isQatarBased: z.boolean().default(true),
  preferredLocale: z.string().default('en'),
  creatorTier: z.enum(CREATOR_TIERS).default('MICRO'),
  status: z.enum(INFLUENCER_STATUSES).default('PROSPECT'),
  categories: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(['English']),
  website: z.string().optional().nullable(),
  contentSuitability: z.string().optional().nullable(),
  brandSafetyStatus: z.string().default('PASSED'),
  brandSafetyNotes: z.string().optional().nullable(),
  agencyName: z.string().optional().nullable(),
  agencyContactName: z.string().optional().nullable(),
  agencyEmail: z.string().optional().nullable(),
  agencyPhone: z.string().optional().nullable(),
  relationshipOwnerId: z.string().optional().nullable(),
  internalRating: z.number().int().min(1).max(5).optional().nullable(),
  publicFeatureEnabled: z.boolean().default(false),
  publicDisplayOrder: z.number().int().default(0),
});

export type InfluencerUpsertInput = z.infer<typeof influencerUpsertSchema>;

/**
 * Influencer Campaign Schema
 */
export const campaignUpsertSchema = z.object({
  titleEn: z.string().min(3, { message: 'Title (English) is required' }),
  titleAr: z.string().min(3, { message: 'Title (Arabic) is required' }),
  internalCode: z.string().min(2, { message: 'Internal code is required' }),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  campaignType: z.enum(CAMPAIGN_TYPES).default('EVENT_LAUNCH'),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'INVITING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ARCHIVED']).default('DRAFT'),
  objectives: z.array(z.string()).min(1, { message: 'At least one objective is required' }),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  applicationDeadline: z.string().or(z.date()).optional().nullable(),
  campaignManagerId: z.string().optional().nullable(),
  internalPointOfContactId: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  clientContact: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
  attractionId: z.string().optional().nullable(),
  caseStudyId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  bookingQubeReference: z.string().optional().nullable(),
  targetAudienceJson: z.any().optional().nullable(),
  platforms: z.array(z.enum(SOCIAL_PLATFORMS)).default([]),
  budget: z.number().nonnegative().default(0),
  currency: z.string().default('QAR'),
  approvalRequirementsJson: z.any().optional().nullable(),
  brandGuidelinesAssetId: z.string().optional().nullable(),
  defaultUsageRights: z.string().optional().nullable(),
});

export type CampaignUpsertInput = z.infer<typeof campaignUpsertSchema>;

/**
 * Deliverable Upsert Schema
 */
export const deliverableUpsertSchema = z.object({
  campaignCreatorId: z.string().min(1),
  platform: z.enum(SOCIAL_PLATFORMS),
  contentType: z.enum(CONTENT_TYPES),
  title: z.string().min(2),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  quantity: z.number().int().positive().default(1),
  draftDueAt: z.string().or(z.date()).optional().nullable(),
  publishDueAt: z.string().or(z.date()).optional().nullable(),
  approvalRequired: z.boolean().default(true),
  clientApprovalRequired: z.boolean().default(false),
  mandatoryMessageEn: z.string().optional().nullable(),
  mandatoryMessageAr: z.string().optional().nullable(),
  hashtags: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),
  promoCodeId: z.string().optional().nullable(),
  trackingLinkId: z.string().optional().nullable(),
  usageRights: z.string().optional().nullable(),
  assignedReviewerId: z.string().optional().nullable(),
});

/**
 * Content Submission Schema
 */
export const contentSubmissionSchema = z.object({
  captionEn: z.string().optional().nullable(),
  captionAr: z.string().optional().nullable(),
  submissionNotes: z.string().optional().nullable(),
  assetIds: z.array(z.string()).default([]),
  externalPreviewUrl: z.string().url().optional().nullable().or(z.literal('')),
});

/**
 * Content Review Decision Schema
 */
export const contentReviewSchema = z.object({
  decision: z.enum(['APPROVED', 'APPROVED_WITH_NOTES', 'REVISION_REQUESTED', 'REJECTED', 'ESCALATED']),
  feedbackEn: z.string().optional().nullable(),
  feedbackAr: z.string().optional().nullable(),
  isClientReview: z.boolean().default(false),
});

/**
 * Scoring Weights Configuration Schema
 */
export const scoringWeightsSchema = z.object({
  audienceFitWeight: z.number().int().min(0).max(100),
  engagementQualityWeight: z.number().int().min(0).max(100),
  contentQualityWeight: z.number().int().min(0).max(100),
  brandSuitabilityWeight: z.number().int().min(0).max(100),
  eventRelevanceWeight: z.number().int().min(0).max(100),
  reliabilityWeight: z.number().int().min(0).max(100),
}).refine(
  (data) =>
    data.audienceFitWeight +
      data.engagementQualityWeight +
      data.contentQualityWeight +
      data.brandSuitabilityWeight +
      data.eventRelevanceWeight +
      data.reliabilityWeight ===
    100,
  { message: 'Active scoring weights must sum to exactly 100%' }
);
