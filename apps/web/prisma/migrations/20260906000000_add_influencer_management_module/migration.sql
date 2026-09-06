-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "InfluencerStatus" AS ENUM ('PROSPECT', 'INVITED', 'APPLICATION_SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'APPROVED', 'ACTIVE', 'PAUSED', 'RESTRICTED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'APPROVED', 'DECLINED', 'WITHDRAWN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'INVITING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "CampaignCreatorStatus" AS ENUM ('SHORTLISTED', 'APPROVAL_REQUIRED', 'APPROVED', 'INVITED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'NEGOTIATING', 'CONTRACTED', 'BRIEFED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "DeliverableStatus" AS ENUM ('PLANNED', 'BRIEFED', 'DRAFT_DUE', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'VERIFIED', 'METRICS_COLLECTED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ContentReviewDecision" AS ENUM ('APPROVED', 'APPROVED_WITH_NOTES', 'REVISION_REQUESTED', 'REJECTED', 'ESCALATED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('NOT_APPLICABLE', 'RATE_PROPOSED', 'RATE_APPROVED', 'INVOICE_REQUIRED', 'INVOICE_RECEIVED', 'PAYMENT_SUBMITTED', 'PAID', 'ON_HOLD', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'SNAPCHAT', 'X_TWITTER', 'LINKEDIN', 'FACEBOOK', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "CreatorTier" AS ENUM ('NANO', 'MICRO', 'MID_TIER', 'MACRO', 'MEGA', 'CELEBRITY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "CampaignType" AS ENUM ('EVENT_LAUNCH', 'ATTRACTION_PROMO', 'HOSTED_VISIT', 'MEDIA_DAY', 'INFLUENCER_PREVIEW', 'CREATOR_RACE', 'TICKET_SALES', 'UGC_CAMPAIGN', 'VENUE_OPENING', 'PRODUCT_LAUNCH', 'AMBASSADOR_PROGRAMME', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "CollaborationType" AS ENUM ('PAID', 'BARTER', 'COMPLIMENTARY', 'HYBRID');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ContentType" AS ENUM ('STORY', 'REEL', 'STATIC_POST', 'CAROUSEL', 'TIKTOK_VIDEO', 'YOUTUBE_VIDEO', 'YOUTUBE_SHORT', 'SNAPCHAT_STORY', 'LIVE_STREAM', 'EVENT_APPEARANCE', 'CREATOR_RACE', 'INTERVIEW', 'UGC_PACKAGE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "InfluencerDocumentType" AS ENUM ('MEDIA_KIT', 'RATE_CARD', 'IDENTIFICATION', 'COMMERCIAL_AGREEMENT', 'INVOICE', 'NDA', 'TAX_COMPLIANCE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "PortalTokenScope" AS ENUM ('COMPLETE_PROFILE', 'UPDATE_PROFILE', 'CAMPAIGN_INVITATION', 'SUBMIT_CONTENT', 'UPLOAD_DOCUMENT', 'VIEW_CAMPAIGN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'COMPLIMENTARY_PASS');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "UsageRightsStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "BrandSafetyStatus" AS ENUM ('PASSED', 'VERIFIED_SAFE', 'UNDER_OBSERVATION', 'RESTRICTED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ApprovalType" AS ENUM ('MARKETING', 'BUDGET', 'CLIENT', 'CONTENT', 'PUBLIC_COMMUNICATION', 'PAYMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable Influencer
CREATE TABLE IF NOT EXISTS "Influencer" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "legalName" TEXT,
    "slug" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "profileImage" TEXT,
    "bioEn" TEXT,
    "bioAr" TEXT,
    "location" TEXT,
    "nationality" TEXT,
    "isQatarBased" BOOLEAN NOT NULL DEFAULT true,
    "preferredLocale" TEXT NOT NULL DEFAULT 'en',
    "creatorTier" "CreatorTier" NOT NULL DEFAULT 'MICRO',
    "status" "InfluencerStatus" NOT NULL DEFAULT 'PROSPECT',
    "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "contentSuitability" TEXT,
    "brandSafetyStatus" "BrandSafetyStatus" NOT NULL DEFAULT 'VERIFIED_SAFE',
    "brandSafetyNotes" TEXT,
    "agencyName" TEXT,
    "agencyContactName" TEXT,
    "agencyEmail" TEXT,
    "agencyPhone" TEXT,
    "relationshipOwnerId" TEXT,
    "overallScore" DECIMAL(5,2),
    "internalRating" INTEGER,
    "reliabilityScore" DECIMAL(5,2),
    "publicFeatureEnabled" BOOLEAN NOT NULL DEFAULT false,
    "publicDisplayOrder" INTEGER NOT NULL DEFAULT 0,
    "publicConsentAt" TIMESTAMP(3),
    "dataConsentAt" TIMESTAMP(3),
    "communicationConsentAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Influencer_slug_key" ON "Influencer"("slug");
CREATE INDEX IF NOT EXISTS "Influencer_status_idx" ON "Influencer"("status");
CREATE INDEX IF NOT EXISTS "Influencer_creatorTier_idx" ON "Influencer"("creatorTier");
CREATE INDEX IF NOT EXISTS "Influencer_isQatarBased_idx" ON "Influencer"("isQatarBased");
CREATE INDEX IF NOT EXISTS "Influencer_publicFeatureEnabled_idx" ON "Influencer"("publicFeatureEnabled");
CREATE INDEX IF NOT EXISTS "Influencer_createdAt_idx" ON "Influencer"("createdAt");

-- CreateTable InfluencerPlatform
CREATE TABLE IF NOT EXISTS "InfluencerPlatform" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "handle" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "subscriberCount" INTEGER NOT NULL DEFAULT 0,
    "averageViews" INTEGER NOT NULL DEFAULT 0,
    "averageLikes" INTEGER NOT NULL DEFAULT 0,
    "averageComments" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "audienceCountriesJson" JSONB,
    "audienceAgeJson" JSONB,
    "audienceGenderJson" JSONB,
    "analyticsEvidenceAssetId" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerPlatform_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "InfluencerPlatform_platform_handle_key" ON "InfluencerPlatform"("platform", "handle");
CREATE INDEX IF NOT EXISTS "InfluencerPlatform_influencerId_idx" ON "InfluencerPlatform"("influencerId");
CREATE INDEX IF NOT EXISTS "InfluencerPlatform_platform_idx" ON "InfluencerPlatform"("platform");

-- CreateTable InfluencerMetricSnapshot
CREATE TABLE IF NOT EXISTS "InfluencerMetricSnapshot" (
    "id" TEXT NOT NULL,
    "influencerPlatformId" TEXT NOT NULL,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "averageViews" INTEGER NOT NULL DEFAULT 0,
    "averageLikes" INTEGER NOT NULL DEFAULT 0,
    "averageComments" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "audienceDataJson" JSONB,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "evidenceAssetId" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedById" TEXT,

    CONSTRAINT "InfluencerMetricSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InfluencerMetricSnapshot_influencerPlatformId_idx" ON "InfluencerMetricSnapshot"("influencerPlatformId");
CREATE INDEX IF NOT EXISTS "InfluencerMetricSnapshot_capturedAt_idx" ON "InfluencerMetricSnapshot"("capturedAt");

-- CreateTable InfluencerApplication
CREATE TABLE IF NOT EXISTS "InfluencerApplication" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "source" TEXT NOT NULL DEFAULT 'PUBLIC_FORM',
    "campaignId" TEXT,
    "submittedDataJson" JSONB NOT NULL,
    "reviewerId" TEXT,
    "reviewNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InfluencerApplication_status_idx" ON "InfluencerApplication"("status");
CREATE INDEX IF NOT EXISTS "InfluencerApplication_influencerId_idx" ON "InfluencerApplication"("influencerId");
CREATE INDEX IF NOT EXISTS "InfluencerApplication_campaignId_idx" ON "InfluencerApplication"("campaignId");
CREATE INDEX IF NOT EXISTS "InfluencerApplication_submittedAt_idx" ON "InfluencerApplication"("submittedAt");

-- CreateTable InfluencerDocument
CREATE TABLE IF NOT EXISTS "InfluencerDocument" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "campaignId" TEXT,
    "documentType" "InfluencerDocumentType" NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "isSensitive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "uploadedByType" TEXT NOT NULL DEFAULT 'ADMIN',
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InfluencerDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InfluencerDocument_influencerId_idx" ON "InfluencerDocument"("influencerId");
CREATE INDEX IF NOT EXISTS "InfluencerDocument_campaignId_idx" ON "InfluencerDocument"("campaignId");
CREATE INDEX IF NOT EXISTS "InfluencerDocument_documentType_idx" ON "InfluencerDocument"("documentType");

-- CreateTable InfluencerCampaign
CREATE TABLE IF NOT EXISTS "InfluencerCampaign" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "campaignType" "CampaignType" NOT NULL DEFAULT 'EVENT_LAUNCH',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "objectives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "applicationDeadline" TIMESTAMP(3),
    "campaignManagerId" TEXT,
    "internalPointOfContactId" TEXT,
    "clientName" TEXT,
    "clientContact" TEXT,
    "eventId" TEXT,
    "attractionId" TEXT,
    "caseStudyId" TEXT,
    "projectId" TEXT,
    "bookingQubeReference" TEXT,
    "targetAudienceJson" JSONB,
    "platforms" "SocialPlatform"[] NOT NULL DEFAULT ARRAY[]::"SocialPlatform"[],
    "budget" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'QAR',
    "approvalRequirementsJson" JSONB,
    "brandGuidelinesAssetId" TEXT,
    "defaultUsageRights" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "InfluencerCampaign_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "InfluencerCampaign_internalCode_key" ON "InfluencerCampaign"("internalCode");
CREATE INDEX IF NOT EXISTS "InfluencerCampaign_status_idx" ON "InfluencerCampaign"("status");
CREATE INDEX IF NOT EXISTS "InfluencerCampaign_campaignType_idx" ON "InfluencerCampaign"("campaignType");
CREATE INDEX IF NOT EXISTS "InfluencerCampaign_startDate_endDate_idx" ON "InfluencerCampaign"("startDate", "endDate");
CREATE INDEX IF NOT EXISTS "InfluencerCampaign_eventId_idx" ON "InfluencerCampaign"("eventId");
CREATE INDEX IF NOT EXISTS "InfluencerCampaign_attractionId_idx" ON "InfluencerCampaign"("attractionId");

-- CreateTable CampaignCreator
CREATE TABLE IF NOT EXISTS "CampaignCreator" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "status" "CampaignCreatorStatus" NOT NULL DEFAULT 'SHORTLISTED',
    "collaborationType" "CollaborationType" NOT NULL DEFAULT 'PAID',
    "proposedRate" DECIMAL(10,2),
    "counterRate" DECIMAL(10,2),
    "agreedRate" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'QAR',
    "invitedAt" TIMESTAMP(3),
    "invitationExpiresAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "contractedAt" TIMESTAMP(3),
    "briefAcknowledgedAt" TIMESTAMP(3),
    "internalApprovalById" TEXT,
    "internalApprovalAt" TIMESTAMP(3),
    "clientApprovalById" TEXT,
    "clientApprovalAt" TIMESTAMP(3),
    "performanceRating" INTEGER,
    "completionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    "agreementStatus" TEXT DEFAULT 'PENDING',
    "agreementAssetId" TEXT,
    "signedDate" TIMESTAMP(3),
    "usageRightsTerms" TEXT,
    "exclusivityTerms" TEXT,
    "cancellationTerms" TEXT,
    "invoiceAssetId" TEXT,
    "invoiceNumber" TEXT,
    "invoiceReceivedDate" TIMESTAMP(3),
    "approvedAmount" DECIMAL(10,2),
    "paymentReference" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "paymentSubmittedDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "financeNotes" TEXT,

    CONSTRAINT "CampaignCreator_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CampaignCreator_campaignId_influencerId_key" ON "CampaignCreator"("campaignId", "influencerId");
CREATE INDEX IF NOT EXISTS "CampaignCreator_campaignId_idx" ON "CampaignCreator"("campaignId");
CREATE INDEX IF NOT EXISTS "CampaignCreator_influencerId_idx" ON "CampaignCreator"("influencerId");
CREATE INDEX IF NOT EXISTS "CampaignCreator_status_idx" ON "CampaignCreator"("status");
CREATE INDEX IF NOT EXISTS "CampaignCreator_paymentStatus_idx" ON "CampaignCreator"("paymentStatus");

-- CreateTable CampaignDeliverable
CREATE TABLE IF NOT EXISTS "CampaignDeliverable" (
    "id" TEXT NOT NULL,
    "campaignCreatorId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "draftDueAt" TIMESTAMP(3),
    "publishDueAt" TIMESTAMP(3),
    "approvalRequired" BOOLEAN NOT NULL DEFAULT true,
    "clientApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
    "mandatoryMessageEn" TEXT,
    "mandatoryMessageAr" TEXT,
    "hashtags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "mentions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "promoCodeId" TEXT,
    "trackingLinkId" TEXT,
    "usageRights" TEXT,
    "usageRightsStatus" "UsageRightsStatus" NOT NULL DEFAULT 'PENDING',
    "usageRightsStartAt" TIMESTAMP(3),
    "usageRightsEndAt" TIMESTAMP(3),
    "status" "DeliverableStatus" NOT NULL DEFAULT 'PLANNED',
    "assignedReviewerId" TEXT,
    "publishedUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "metricsViews" INTEGER NOT NULL DEFAULT 0,
    "metricsLikes" INTEGER NOT NULL DEFAULT 0,
    "metricsComments" INTEGER NOT NULL DEFAULT 0,
    "metricsShares" INTEGER NOT NULL DEFAULT 0,
    "metricsSaves" INTEGER NOT NULL DEFAULT 0,
    "metricsReach" INTEGER NOT NULL DEFAULT 0,
    "evidenceAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignDeliverable_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CampaignDeliverable_campaignCreatorId_idx" ON "CampaignDeliverable"("campaignCreatorId");
CREATE INDEX IF NOT EXISTS "CampaignDeliverable_status_idx" ON "CampaignDeliverable"("status");
CREATE INDEX IF NOT EXISTS "CampaignDeliverable_platform_idx" ON "CampaignDeliverable"("platform");
CREATE INDEX IF NOT EXISTS "CampaignDeliverable_contentType_idx" ON "CampaignDeliverable"("contentType");
CREATE INDEX IF NOT EXISTS "CampaignDeliverable_publishDueAt_idx" ON "CampaignDeliverable"("publishDueAt");

-- CreateTable ContentSubmission
CREATE TABLE IF NOT EXISTS "ContentSubmission" (
    "id" TEXT NOT NULL,
    "deliverableId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "captionEn" TEXT,
    "captionAr" TEXT,
    "submissionNotes" TEXT,
    "assetIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "externalPreviewUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedByType" TEXT NOT NULL DEFAULT 'CREATOR',
    "submittedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContentSubmission_deliverableId_version_key" ON "ContentSubmission"("deliverableId", "version");
CREATE INDEX IF NOT EXISTS "ContentSubmission_deliverableId_idx" ON "ContentSubmission"("deliverableId");
CREATE INDEX IF NOT EXISTS "ContentSubmission_submittedAt_idx" ON "ContentSubmission"("submittedAt");

-- CreateTable ContentReview
CREATE TABLE IF NOT EXISTS "ContentReview" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "decision" "ContentReviewDecision" NOT NULL,
    "reviewerId" TEXT,
    "reviewerType" TEXT NOT NULL DEFAULT 'STAFF',
    "feedbackEn" TEXT,
    "feedbackAr" TEXT,
    "isClientReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContentReview_submissionId_idx" ON "ContentReview"("submissionId");
CREATE INDEX IF NOT EXISTS "ContentReview_decision_idx" ON "ContentReview"("decision");

-- CreateTable InfluencerAttendance
CREATE TABLE IF NOT EXISTS "InfluencerAttendance" (
    "id" TEXT NOT NULL,
    "campaignCreatorId" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "arrivalWindowStart" TEXT,
    "arrivalWindowEnd" TEXT,
    "guestCount" INTEGER NOT NULL DEFAULT 0,
    "guestNamesJson" JSONB,
    "accreditationReference" TEXT,
    "complimentaryTicketCount" INTEGER NOT NULL DEFAULT 0,
    "qrReference" TEXT,
    "parkingInstructions" TEXT,
    "specialRequirements" TEXT,
    "assignedContactId" TEXT,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "operationalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerAttendance_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InfluencerAttendance_campaignCreatorId_idx" ON "InfluencerAttendance"("campaignCreatorId");
CREATE INDEX IF NOT EXISTS "InfluencerAttendance_eventDate_idx" ON "InfluencerAttendance"("eventDate");
CREATE INDEX IF NOT EXISTS "InfluencerAttendance_status_idx" ON "InfluencerAttendance"("status");

-- CreateTable PromoCode
CREATE TABLE IF NOT EXISTS "PromoCode" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "campaignCreatorId" TEXT,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'QAR',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "eligibleProductsJson" JSONB,
    "bookingQubeReference" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key" ON "PromoCode"("code");
CREATE INDEX IF NOT EXISTS "PromoCode_campaignId_idx" ON "PromoCode"("campaignId");
CREATE INDEX IF NOT EXISTS "PromoCode_campaignCreatorId_idx" ON "PromoCode"("campaignCreatorId");
CREATE INDEX IF NOT EXISTS "PromoCode_isActive_idx" ON "PromoCode"("isActive");

-- CreateTable TrackingLink
CREATE TABLE IF NOT EXISTS "TrackingLink" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "campaignCreatorId" TEXT,
    "destinationUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "utmSource" TEXT NOT NULL DEFAULT 'influencer',
    "utmMedium" TEXT NOT NULL DEFAULT 'creator',
    "utmCampaign" TEXT NOT NULL,
    "utmContent" TEXT,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TrackingLink_shortCode_key" ON "TrackingLink"("shortCode");
CREATE INDEX IF NOT EXISTS "TrackingLink_campaignId_idx" ON "TrackingLink"("campaignId");
CREATE INDEX IF NOT EXISTS "TrackingLink_campaignCreatorId_idx" ON "TrackingLink"("campaignCreatorId");

-- CreateTable InfluencerConversion
CREATE TABLE IF NOT EXISTS "InfluencerConversion" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT,
    "campaignCreatorId" TEXT,
    "promoCodeId" TEXT,
    "trackingLinkId" TEXT,
    "unmatchedCode" TEXT,
    "reconciliationStatus" TEXT NOT NULL DEFAULT 'MATCHED',
    "externalEventId" TEXT NOT NULL,
    "externalOrderId" TEXT NOT NULL,
    "ticketCount" INTEGER NOT NULL DEFAULT 1,
    "grossRevenue" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "refundAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "netRevenue" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'QAR',
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerConversion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "InfluencerConversion_externalEventId_key" ON "InfluencerConversion"("externalEventId");
CREATE INDEX IF NOT EXISTS "InfluencerConversion_campaignId_idx" ON "InfluencerConversion"("campaignId");
CREATE INDEX IF NOT EXISTS "InfluencerConversion_campaignCreatorId_idx" ON "InfluencerConversion"("campaignCreatorId");
CREATE INDEX IF NOT EXISTS "InfluencerConversion_promoCodeId_idx" ON "InfluencerConversion"("promoCodeId");
CREATE INDEX IF NOT EXISTS "InfluencerConversion_occurredAt_idx" ON "InfluencerConversion"("occurredAt");
CREATE INDEX IF NOT EXISTS "InfluencerConversion_reconciliationStatus_idx" ON "InfluencerConversion"("reconciliationStatus");

-- CreateTable SecureCreatorToken
CREATE TABLE IF NOT EXISTS "SecureCreatorToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "scope" "PortalTokenScope" NOT NULL,
    "influencerId" TEXT NOT NULL,
    "campaignCreatorId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecureCreatorToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SecureCreatorToken_tokenHash_key" ON "SecureCreatorToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "SecureCreatorToken_influencerId_idx" ON "SecureCreatorToken"("influencerId");
CREATE INDEX IF NOT EXISTS "SecureCreatorToken_expiresAt_idx" ON "SecureCreatorToken"("expiresAt");

-- CreateTable CampaignApprovalGate
CREATE TABLE IF NOT EXISTS "CampaignApprovalGate" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "approvalType" "ApprovalType" NOT NULL,
    "decision" TEXT NOT NULL,
    "reviewerId" TEXT,
    "reviewerName" TEXT,
    "comment" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isStale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignApprovalGate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CampaignApprovalGate_campaignId_idx" ON "CampaignApprovalGate"("campaignId");
CREATE INDEX IF NOT EXISTS "CampaignApprovalGate_entityType_entityId_idx" ON "CampaignApprovalGate"("entityType", "entityId");

-- CreateTable InfluencerAgreement
CREATE TABLE IF NOT EXISTS "InfluencerAgreement" (
    "id" TEXT NOT NULL,
    "campaignCreatorId" TEXT NOT NULL,
    "agreementAssetId" TEXT,
    "agreementType" TEXT NOT NULL DEFAULT 'STANDARD_COMMERCIAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "signedDate" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "usageRightsTerms" TEXT,
    "usageRightsStartAt" TIMESTAMP(3),
    "usageRightsEndAt" TIMESTAMP(3),
    "exclusivityTerms" TEXT,
    "cancellationTerms" TEXT,
    "agreedRate" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'QAR',
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "signedByCreatorAt" TIMESTAMP(3),
    "countersignedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerAgreement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InfluencerAgreement_campaignCreatorId_idx" ON "InfluencerAgreement"("campaignCreatorId");
CREATE INDEX IF NOT EXISTS "InfluencerAgreement_status_idx" ON "InfluencerAgreement"("status");

-- CreateTable InfluencerPayment
CREATE TABLE IF NOT EXISTS "InfluencerPayment" (
    "id" TEXT NOT NULL,
    "campaignCreatorId" TEXT NOT NULL,
    "invoiceAssetId" TEXT,
    "invoiceNumber" TEXT,
    "invoiceReceivedDate" TIMESTAMP(3),
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'QAR',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'INVOICE_REQUIRED',
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "paymentSubmittedDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "financeNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InfluencerPayment_campaignCreatorId_idx" ON "InfluencerPayment"("campaignCreatorId");
CREATE INDEX IF NOT EXISTS "InfluencerPayment_paymentStatus_idx" ON "InfluencerPayment"("paymentStatus");
CREATE INDEX IF NOT EXISTS "InfluencerPayment_invoiceNumber_idx" ON "InfluencerPayment"("invoiceNumber");

-- CreateTable InfluencerScoringConfig
CREATE TABLE IF NOT EXISTS "InfluencerScoringConfig" (
    "id" TEXT NOT NULL,
    "audienceFitWeight" INTEGER NOT NULL DEFAULT 25,
    "engagementQualityWeight" INTEGER NOT NULL DEFAULT 20,
    "contentQualityWeight" INTEGER NOT NULL DEFAULT 20,
    "brandSuitabilityWeight" INTEGER NOT NULL DEFAULT 15,
    "eventRelevanceWeight" INTEGER NOT NULL DEFAULT 10,
    "reliabilityWeight" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfluencerScoringConfig_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
DO $$ BEGIN
    ALTER TABLE "InfluencerAgreement" ADD CONSTRAINT "InfluencerAgreement_campaignCreatorId_fkey" FOREIGN KEY ("campaignCreatorId") REFERENCES "CampaignCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "InfluencerPayment" ADD CONSTRAINT "InfluencerPayment_campaignCreatorId_fkey" FOREIGN KEY ("campaignCreatorId") REFERENCES "CampaignCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
    ALTER TABLE "InfluencerPlatform" ADD CONSTRAINT "InfluencerPlatform_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "InfluencerMetricSnapshot" ADD CONSTRAINT "InfluencerMetricSnapshot_influencerPlatformId_fkey" FOREIGN KEY ("influencerPlatformId") REFERENCES "InfluencerPlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "InfluencerApplication" ADD CONSTRAINT "InfluencerApplication_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "InfluencerDocument" ADD CONSTRAINT "InfluencerDocument_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "CampaignCreator" ADD CONSTRAINT "CampaignCreator_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "InfluencerCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "CampaignCreator" ADD CONSTRAINT "CampaignCreator_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "CampaignDeliverable" ADD CONSTRAINT "CampaignDeliverable_campaignCreatorId_fkey" FOREIGN KEY ("campaignCreatorId") REFERENCES "CampaignCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "ContentSubmission" ADD CONSTRAINT "ContentSubmission_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "CampaignDeliverable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ContentSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "InfluencerAttendance" ADD CONSTRAINT "InfluencerAttendance_campaignCreatorId_fkey" FOREIGN KEY ("campaignCreatorId") REFERENCES "CampaignCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "InfluencerCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_campaignCreatorId_fkey" FOREIGN KEY ("campaignCreatorId") REFERENCES "CampaignCreator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "TrackingLink" ADD CONSTRAINT "TrackingLink_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "InfluencerCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "TrackingLink" ADD CONSTRAINT "TrackingLink_campaignCreatorId_fkey" FOREIGN KEY ("campaignCreatorId") REFERENCES "CampaignCreator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "InfluencerConversion" ADD CONSTRAINT "InfluencerConversion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "InfluencerCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "InfluencerConversion" ADD CONSTRAINT "InfluencerConversion_campaignCreatorId_fkey" FOREIGN KEY ("campaignCreatorId") REFERENCES "CampaignCreator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "InfluencerConversion" ADD CONSTRAINT "InfluencerConversion_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "InfluencerConversion" ADD CONSTRAINT "InfluencerConversion_trackingLinkId_fkey" FOREIGN KEY ("trackingLinkId") REFERENCES "TrackingLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "SecureCreatorToken" ADD CONSTRAINT "SecureCreatorToken_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "SecureCreatorToken" ADD CONSTRAINT "SecureCreatorToken_campaignCreatorId_fkey" FOREIGN KEY ("campaignCreatorId") REFERENCES "CampaignCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "CampaignApprovalGate" ADD CONSTRAINT "CampaignApprovalGate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "InfluencerCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
