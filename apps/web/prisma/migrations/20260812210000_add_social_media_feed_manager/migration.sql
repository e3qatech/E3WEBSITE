-- ============================================================
-- Migration: 20260812210000_add_social_media_feed_manager
-- Safe additive migration - no destructive operations.
-- Compatible with PostgreSQL 15+ (Neon serverless).
-- All CREATE TABLE/TYPE/INDEX use IF NOT EXISTS guards.
-- ============================================================

-- -----------------------------------------------------------
-- ENUMS
-- Use DO/EXCEPTION blocks because PostgreSQL does not support
-- CREATE TYPE IF NOT EXISTS.
-- -----------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "SocialProviderKey" AS ENUM (
    'META_INSTAGRAM', 'META_FACEBOOK', 'TIKTOK', 'YOUTUBE', 'LINKEDIN', 'MANUAL'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SocialAccountStatus" AS ENUM (
    'CONNECTED', 'HEALTHY', 'EXPIRING_SOON', 'ACTION_REQUIRED',
    'DISCONNECTED', 'SYNCING', 'PAUSED', 'ERROR'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SocialPostMediaType" AS ENUM (
    'IMAGE', 'VIDEO', 'REEL', 'CAROUSEL', 'TEXT', 'LINK'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SocialPostStatus" AS ENUM (
    'PUBLISHED', 'DRAFT', 'HIDDEN', 'ARCHIVED', 'UNAVAILABLE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SocialModerationStatus" AS ENUM (
    'PENDING', 'APPROVED', 'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SocialFeedMode" AS ENUM (
    'AUTOMATIC', 'CURATED', 'HYBRID'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SocialPlacementLocation" AS ENUM (
    'B2C_HOME_LIVE_SOCIAL', 'B2B_HOME_CORPORATE', 'ATTRACTION_PAGE',
    'BRAND_PAGE', 'CASE_STUDY_PAGE', 'CUSTOM_PAGE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SocialSyncStatus" AS ENUM (
    'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED', 'IN_PROGRESS'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SocialAuditAction" AS ENUM (
    'CREDENTIAL_UPDATE', 'ACCOUNT_CONNECT', 'ACCOUNT_DISCONNECT', 'TOKEN_REFRESH',
    'SYNC_EXECUTE', 'POST_MODERATE', 'POST_MUTATE', 'FEED_UPDATE',
    'PLACEMENT_UPDATE', 'SETTINGS_UPDATE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------
-- TABLE: SocialProviderConfig
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialProviderConfig" (
    "id"              TEXT        NOT NULL,
    "provider"        "SocialProviderKey" NOT NULL,
    "name"            TEXT        NOT NULL,
    "enabled"         BOOLEAN     NOT NULL DEFAULT true,
    "appId"           TEXT,
    "encryptedSecret" TEXT,
    "apiVersion"      TEXT        DEFAULT 'v21.0',
    "authUrl"         TEXT,
    "callbackUrl"     TEXT,
    "requiredScopes"  JSONB,
    "webhookToken"    TEXT,
    "apiKey"          TEXT,
    "instructions"    TEXT,
    "updatedBy"       TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialProviderConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SocialProviderConfig_provider_key"
    ON "SocialProviderConfig"("provider");

-- -----------------------------------------------------------
-- TABLE: SocialAccount
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialAccount" (
    "id"                    TEXT        NOT NULL,
    "providerConfigId"      TEXT        NOT NULL,
    "provider"              "SocialProviderKey" NOT NULL,
    "providerAccountId"     TEXT        NOT NULL,
    "internalName"          TEXT        NOT NULL,
    "username"              TEXT        NOT NULL,
    "displayName"           TEXT,
    "profileUrl"            TEXT,
    "profileImageUrl"       TEXT,
    "brandId"               TEXT,
    "attractionId"          TEXT,
    "portal"                "PortalType" NOT NULL DEFAULT 'SHARED',
    "status"                "SocialAccountStatus" NOT NULL DEFAULT 'CONNECTED',
    "encryptedAccessToken"  TEXT,
    "encryptedRefreshToken" TEXT,
    "tokenExpiresAt"        TIMESTAMP(3),
    "grantedScopes"         JSONB,
    "lastSuccessfulSync"    TIMESTAMP(3),
    "lastSyncAttempt"       TIMESTAMP(3),
    "autoSyncEnabled"       BOOLEAN     NOT NULL DEFAULT true,
    "defaultModeration"     "SocialModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "defaultVisibility"     "SocialPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isActive"              BOOLEAN     NOT NULL DEFAULT true,
    "sortOrder"             INTEGER     NOT NULL DEFAULT 0,
    "internalNotes"         TEXT,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SocialAccount_provider_providerAccountId_key"
    ON "SocialAccount"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "SocialAccount_provider_idx"   ON "SocialAccount"("provider");
CREATE INDEX IF NOT EXISTS "SocialAccount_status_idx"     ON "SocialAccount"("status");
CREATE INDEX IF NOT EXISTS "SocialAccount_isActive_idx"   ON "SocialAccount"("isActive");

DO $$ BEGIN
    ALTER TABLE "SocialAccount"
        ADD CONSTRAINT "SocialAccount_providerConfigId_fkey"
        FOREIGN KEY ("providerConfigId")
        REFERENCES "SocialProviderConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------
-- TABLE: SocialPost
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialPost" (
    "id"               TEXT        NOT NULL,
    "provider"         "SocialProviderKey" NOT NULL,
    "providerPostId"   TEXT        NOT NULL,
    "accountId"        TEXT,
    "brandId"          TEXT,
    "attractionId"     TEXT,
    "portal"           "PortalType" NOT NULL DEFAULT 'SHARED',
    "originalUrl"      TEXT        NOT NULL,
    "authorName"       TEXT        NOT NULL,
    "authorUsername"   TEXT        NOT NULL,
    "authorAvatarUrl"  TEXT,
    "captionEn"        TEXT,
    "captionAr"        TEXT,
    "rawCaption"       TEXT,
    "mediaType"        "SocialPostMediaType" NOT NULL DEFAULT 'IMAGE',
    "mediaUrl"         TEXT        NOT NULL,
    "thumbnailUrl"     TEXT,
    "aspectRatio"      DOUBLE PRECISION,
    "width"            INTEGER,
    "height"           INTEGER,
    "publishedAt"      TIMESTAMP(3) NOT NULL,
    "importedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "likeCount"        INTEGER     NOT NULL DEFAULT 0,
    "commentCount"     INTEGER     NOT NULL DEFAULT 0,
    "shareCount"       INTEGER     NOT NULL DEFAULT 0,
    "viewCount"        INTEGER     NOT NULL DEFAULT 0,
    "platformMetadata" JSONB,
    "isFeatured"       BOOLEAN     NOT NULL DEFAULT false,
    "isPinned"         BOOLEAN     NOT NULL DEFAULT false,
    "status"           "SocialPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "moderationStatus" "SocialModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "sortPriority"     INTEGER     NOT NULL DEFAULT 0,
    "contentWarning"   BOOLEAN     NOT NULL DEFAULT false,
    "syncStatus"       TEXT        NOT NULL DEFAULT 'OK',
    "importError"      TEXT,
    "createdBy"        TEXT,
    "updatedBy"        TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SocialPost_provider_providerPostId_key"
    ON "SocialPost"("provider", "providerPostId");
CREATE INDEX IF NOT EXISTS "SocialPost_provider_idx"         ON "SocialPost"("provider");
CREATE INDEX IF NOT EXISTS "SocialPost_accountId_idx"        ON "SocialPost"("accountId");
CREATE INDEX IF NOT EXISTS "SocialPost_status_idx"           ON "SocialPost"("status");
CREATE INDEX IF NOT EXISTS "SocialPost_moderationStatus_idx" ON "SocialPost"("moderationStatus");
CREATE INDEX IF NOT EXISTS "SocialPost_isFeatured_idx"       ON "SocialPost"("isFeatured");
CREATE INDEX IF NOT EXISTS "SocialPost_isPinned_idx"         ON "SocialPost"("isPinned");
CREATE INDEX IF NOT EXISTS "SocialPost_publishedAt_idx"      ON "SocialPost"("publishedAt");
CREATE INDEX IF NOT EXISTS "SocialPost_brandId_idx"          ON "SocialPost"("brandId");
CREATE INDEX IF NOT EXISTS "SocialPost_attractionId_idx"     ON "SocialPost"("attractionId");

DO $$ BEGIN
    ALTER TABLE "SocialPost"
        ADD CONSTRAINT "SocialPost_accountId_fkey"
        FOREIGN KEY ("accountId")
        REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------
-- TABLE: SocialPostMedia
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialPostMedia" (
    "id"           TEXT        NOT NULL,
    "postId"       TEXT        NOT NULL,
    "mediaType"    "SocialPostMediaType" NOT NULL DEFAULT 'IMAGE',
    "url"          TEXT        NOT NULL,
    "thumbnailUrl" TEXT,
    "width"        INTEGER,
    "height"       INTEGER,
    "aspectRatio"  DOUBLE PRECISION,
    "sortOrder"    INTEGER     NOT NULL DEFAULT 0,
    CONSTRAINT "SocialPostMedia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SocialPostMedia_postId_idx" ON "SocialPostMedia"("postId");

DO $$ BEGIN
    ALTER TABLE "SocialPostMedia"
        ADD CONSTRAINT "SocialPostMedia_postId_fkey"
        FOREIGN KEY ("postId")
        REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------
-- TABLE: SocialFeed
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialFeed" (
    "id"                TEXT        NOT NULL,
    "name"              TEXT        NOT NULL,
    "description"       TEXT,
    "isActive"          BOOLEAN     NOT NULL DEFAULT true,
    "mode"              "SocialFeedMode" NOT NULL DEFAULT 'HYBRID',
    "portal"            "PortalType" NOT NULL DEFAULT 'SHARED',
    "allowedPlatforms"  JSONB,
    "allowedMediaTypes" JSONB,
    "brandId"           TEXT,
    "attractionId"      TEXT,
    "maxPosts"          INTEGER     NOT NULL DEFAULT 12,
    "initialLoadCount"  INTEGER     NOT NULL DEFAULT 6,
    "loadMoreEnabled"   BOOLEAN     NOT NULL DEFAULT true,
    "dateRangeDays"     INTEGER,
    "sortMethod"        TEXT        NOT NULL DEFAULT 'LATEST_FIRST',
    "showCaptions"      BOOLEAN     NOT NULL DEFAULT true,
    "captionLimit"      INTEGER     NOT NULL DEFAULT 150,
    "showEngagement"    BOOLEAN     NOT NULL DEFAULT true,
    "showPlatformBadge" BOOLEAN     NOT NULL DEFAULT true,
    "showAccountName"   BOOLEAN     NOT NULL DEFAULT true,
    "showPostDate"      BOOLEAN     NOT NULL DEFAULT true,
    "openInNewTab"      BOOLEAN     NOT NULL DEFAULT true,
    "enableFollowCta"   BOOLEAN     NOT NULL DEFAULT true,
    "followCtaTextEn"   TEXT        DEFAULT 'Follow E3 Qatar',
    "followCtaTextAr"   TEXT        DEFAULT 'تابع إي ثري قطر',
    "emptyStateTextEn"  TEXT        DEFAULT 'No social posts available at the moment.',
    "emptyStateTextAr"  TEXT        DEFAULT 'لا تتوفر منشورات تواصل حالياً.',
    "theme"             TEXT        NOT NULL DEFAULT 'SYSTEM',
    "layout"            TEXT        NOT NULL DEFAULT 'GRID',
    "columnsDesktop"    INTEGER     NOT NULL DEFAULT 3,
    "columnsTablet"     INTEGER     NOT NULL DEFAULT 2,
    "columnsMobile"     INTEGER     NOT NULL DEFAULT 1,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialFeed_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SocialFeed_isActive_idx" ON "SocialFeed"("isActive");
CREATE INDEX IF NOT EXISTS "SocialFeed_portal_idx"   ON "SocialFeed"("portal");

-- -----------------------------------------------------------
-- TABLE: SocialFeedSource
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialFeedSource" (
    "id"           TEXT NOT NULL,
    "feedId"       TEXT NOT NULL,
    "accountId"    TEXT,
    "brandId"      TEXT,
    "attractionId" TEXT,
    CONSTRAINT "SocialFeedSource_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SocialFeedSource_feedId_idx"    ON "SocialFeedSource"("feedId");
CREATE INDEX IF NOT EXISTS "SocialFeedSource_accountId_idx" ON "SocialFeedSource"("accountId");

DO $$ BEGIN
    ALTER TABLE "SocialFeedSource"
        ADD CONSTRAINT "SocialFeedSource_feedId_fkey"
        FOREIGN KEY ("feedId") REFERENCES "SocialFeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "SocialFeedSource"
        ADD CONSTRAINT "SocialFeedSource_accountId_fkey"
        FOREIGN KEY ("accountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------
-- TABLE: SocialFeedPost  (curated membership + pinning + ordering)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialFeedPost" (
    "id"        TEXT        NOT NULL,
    "feedId"    TEXT        NOT NULL,
    "postId"    TEXT        NOT NULL,
    "isPinned"  BOOLEAN     NOT NULL DEFAULT false,
    "sortOrder" INTEGER     NOT NULL DEFAULT 0,
    "addedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialFeedPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SocialFeedPost_feedId_postId_key"
    ON "SocialFeedPost"("feedId", "postId");
CREATE INDEX IF NOT EXISTS "SocialFeedPost_feedId_idx" ON "SocialFeedPost"("feedId");
CREATE INDEX IF NOT EXISTS "SocialFeedPost_postId_idx" ON "SocialFeedPost"("postId");

DO $$ BEGIN
    ALTER TABLE "SocialFeedPost"
        ADD CONSTRAINT "SocialFeedPost_feedId_fkey"
        FOREIGN KEY ("feedId") REFERENCES "SocialFeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "SocialFeedPost"
        ADD CONSTRAINT "SocialFeedPost_postId_fkey"
        FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------
-- TABLE: SocialPlacement
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialPlacement" (
    "id"              TEXT        NOT NULL,
    "name"            TEXT        NOT NULL,
    "location"        "SocialPlacementLocation" NOT NULL,
    "feedId"          TEXT        NOT NULL,
    "portal"          "PortalType" NOT NULL DEFAULT 'SHARED',
    "pageSlug"        TEXT,
    "sectionPosition" INTEGER     NOT NULL DEFAULT 0,
    "isEnabled"       BOOLEAN     NOT NULL DEFAULT true,
    "headingEn"       TEXT,
    "headingAr"       TEXT,
    "subheadingEn"    TEXT,
    "subheadingAr"    TEXT,
    "eyebrowEn"       TEXT,
    "eyebrowAr"       TEXT,
    "ctaTextEn"       TEXT,
    "ctaTextAr"       TEXT,
    "ctaDestination"  TEXT,
    "backgroundStyle" TEXT        NOT NULL DEFAULT 'TRANSPARENT',
    "theme"           TEXT        NOT NULL DEFAULT 'SYSTEM',
    "layoutOverride"  TEXT,
    "maxPostsOverride" INTEGER,
    "visibleDesktop"  BOOLEAN     NOT NULL DEFAULT true,
    "visibleTablet"   BOOLEAN     NOT NULL DEFAULT true,
    "visibleMobile"   BOOLEAN     NOT NULL DEFAULT true,
    "startDate"       TIMESTAMP(3),
    "endDate"         TIMESTAMP(3),
    "sortOrder"       INTEGER     NOT NULL DEFAULT 0,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialPlacement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SocialPlacement_location_idx"  ON "SocialPlacement"("location");
CREATE INDEX IF NOT EXISTS "SocialPlacement_isEnabled_idx" ON "SocialPlacement"("isEnabled");
CREATE INDEX IF NOT EXISTS "SocialPlacement_portal_idx"    ON "SocialPlacement"("portal");
CREATE INDEX IF NOT EXISTS "SocialPlacement_feedId_idx"    ON "SocialPlacement"("feedId");

DO $$ BEGIN
    ALTER TABLE "SocialPlacement"
        ADD CONSTRAINT "SocialPlacement_feedId_fkey"
        FOREIGN KEY ("feedId") REFERENCES "SocialFeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------
-- TABLE: SocialSyncJob
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialSyncJob" (
    "id"             TEXT        NOT NULL,
    "accountId"      TEXT,
    "provider"       "SocialProviderKey" NOT NULL,
    "status"         "SocialSyncStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startTime"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime"        TIMESTAMP(3),
    "durationMs"     INTEGER,
    "recordsCreated" INTEGER     NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER     NOT NULL DEFAULT 0,
    "recordsFailed"  INTEGER     NOT NULL DEFAULT 0,
    "recordsSkipped" INTEGER     NOT NULL DEFAULT 0,
    "triggerType"    TEXT        NOT NULL DEFAULT 'CRON',
    "logDetails"     JSONB,
    "errorMessage"   TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialSyncJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SocialSyncJob_provider_idx"   ON "SocialSyncJob"("provider");
CREATE INDEX IF NOT EXISTS "SocialSyncJob_accountId_idx"  ON "SocialSyncJob"("accountId");
CREATE INDEX IF NOT EXISTS "SocialSyncJob_status_idx"     ON "SocialSyncJob"("status");
CREATE INDEX IF NOT EXISTS "SocialSyncJob_startTime_idx"  ON "SocialSyncJob"("startTime");

DO $$ BEGIN
    ALTER TABLE "SocialSyncJob"
        ADD CONSTRAINT "SocialSyncJob_accountId_fkey"
        FOREIGN KEY ("accountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------
-- TABLE: SocialSyncError
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialSyncError" (
    "id"           TEXT        NOT NULL,
    "accountId"    TEXT,
    "provider"     "SocialProviderKey" NOT NULL,
    "errorCode"    TEXT,
    "errorMessage" TEXT        NOT NULL,
    "isResolved"   BOOLEAN     NOT NULL DEFAULT false,
    "resolvedAt"   TIMESTAMP(3),
    "resolvedBy"   TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialSyncError_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SocialSyncError_provider_idx"   ON "SocialSyncError"("provider");
CREATE INDEX IF NOT EXISTS "SocialSyncError_accountId_idx"  ON "SocialSyncError"("accountId");
CREATE INDEX IF NOT EXISTS "SocialSyncError_isResolved_idx" ON "SocialSyncError"("isResolved");

DO $$ BEGIN
    ALTER TABLE "SocialSyncError"
        ADD CONSTRAINT "SocialSyncError_accountId_fkey"
        FOREIGN KEY ("accountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------
-- TABLE: SocialAuditLog
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialAuditLog" (
    "id"         TEXT        NOT NULL,
    "userId"     TEXT,
    "userName"   TEXT,
    "userEmail"  TEXT,
    "action"     "SocialAuditAction" NOT NULL,
    "targetType" TEXT        NOT NULL,
    "targetId"   TEXT,
    "summary"    TEXT        NOT NULL,
    "details"    JSONB,
    "ipAddress"  TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SocialAuditLog_action_idx"    ON "SocialAuditLog"("action");
CREATE INDEX IF NOT EXISTS "SocialAuditLog_userId_idx"    ON "SocialAuditLog"("userId");
CREATE INDEX IF NOT EXISTS "SocialAuditLog_createdAt_idx" ON "SocialAuditLog"("createdAt");

-- -----------------------------------------------------------
-- TABLE: SocialGlobalSettings
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialGlobalSettings" (
    "id"                        TEXT        NOT NULL DEFAULT 'default',
    "syncIntervalMinutes"       INTEGER     NOT NULL DEFAULT 30,
    "defaultModeration"         "SocialModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "defaultFeedMode"           "SocialFeedMode" NOT NULL DEFAULT 'HYBRID',
    "defaultMaxPosts"           INTEGER     NOT NULL DEFAULT 12,
    "dataRetentionDays"         INTEGER     NOT NULL DEFAULT 365,
    "showEngagementMetrics"     BOOLEAN     NOT NULL DEFAULT true,
    "notifyOnSyncFailure"       BOOLEAN     NOT NULL DEFAULT true,
    "notifyOnTokenExpiry"       BOOLEAN     NOT NULL DEFAULT true,
    "notificationEmails"        JSONB,
    "cacheDurationSeconds"      INTEGER     NOT NULL DEFAULT 300,
    "maxImportedPostsPerAccount" INTEGER    NOT NULL DEFAULT 100,
    "allowedMediaTypes"         JSONB,
    "fallbackImageUrl"          TEXT,
    "enableManualEmbeds"        BOOLEAN     NOT NULL DEFAULT true,
    "publicFeedsEnabled"        BOOLEAN     NOT NULL DEFAULT true,
    "updatedBy"                 TEXT,
    "updatedAt"                 TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialGlobalSettings_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------
-- TABLE: SocialSyncLock  (database-backed distributed lease)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SocialSyncLock" (
    "id"          TEXT        NOT NULL,
    "lockKey"     TEXT        NOT NULL,
    "accountId"   TEXT,
    "ownerToken"  TEXT        NOT NULL,
    "acquiredAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3) NOT NULL,
    "heartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialSyncLock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SocialSyncLock_lockKey_key"
    ON "SocialSyncLock"("lockKey");
CREATE INDEX IF NOT EXISTS "SocialSyncLock_lockKey_idx"    ON "SocialSyncLock"("lockKey");
CREATE INDEX IF NOT EXISTS "SocialSyncLock_lockedUntil_idx" ON "SocialSyncLock"("lockedUntil");
CREATE INDEX IF NOT EXISTS "SocialSyncLock_accountId_idx"  ON "SocialSyncLock"("accountId");
