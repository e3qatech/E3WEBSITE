import db from '@/lib/db';

let isSchemaInitialized = false;

/**
 * Ensures all Social Media Manager PostgreSQL enums, tables, and default seed records exist.
 * Safe, idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING), and resilient across Neon / Vercel environments.
 */
export async function ensureSocialMediaTablesExist(force = false): Promise<boolean> {
  if (isSchemaInitialized && !force) {
    return true;
  }

  try {
    const ddlStatements = [
      // 1. Enums
      `DO $$ BEGIN
        CREATE TYPE "PortalType" AS ENUM ('B2C', 'B2B', 'SHARED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      `DO $$ BEGIN
        CREATE TYPE "SocialProviderKey" AS ENUM (
          'META_INSTAGRAM', 'META_FACEBOOK', 'TIKTOK', 'YOUTUBE', 'LINKEDIN', 'MANUAL'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      `DO $$ BEGIN
        CREATE TYPE "SocialAccountStatus" AS ENUM (
          'CONNECTED', 'HEALTHY', 'EXPIRING_SOON', 'ACTION_REQUIRED',
          'DISCONNECTED', 'SYNCING', 'PAUSED', 'ERROR'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      `DO $$ BEGIN
        CREATE TYPE "SocialPostMediaType" AS ENUM (
          'IMAGE', 'VIDEO', 'REEL', 'CAROUSEL', 'TEXT', 'LINK'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      `DO $$ BEGIN
        CREATE TYPE "SocialPostStatus" AS ENUM (
          'PUBLISHED', 'DRAFT', 'HIDDEN', 'ARCHIVED', 'UNAVAILABLE'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      `DO $$ BEGIN
        CREATE TYPE "SocialModerationStatus" AS ENUM (
          'PENDING', 'APPROVED', 'REJECTED'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      `DO $$ BEGIN
        CREATE TYPE "SocialFeedMode" AS ENUM (
          'AUTOMATIC', 'CURATED', 'HYBRID'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      `DO $$ BEGIN
        CREATE TYPE "SocialPlacementLocation" AS ENUM (
          'B2C_HOME_LIVE_SOCIAL', 'B2B_HOME_CORPORATE', 'ATTRACTION_PAGE',
          'BRAND_PAGE', 'CASE_STUDY_PAGE', 'CUSTOM_PAGE'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      `DO $$ BEGIN
        CREATE TYPE "SocialSyncStatus" AS ENUM (
          'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED', 'IN_PROGRESS'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      `DO $$ BEGIN
        CREATE TYPE "SocialAuditAction" AS ENUM (
          'CREDENTIAL_UPDATE', 'ACCOUNT_CONNECT', 'ACCOUNT_DISCONNECT', 'TOKEN_REFRESH',
          'SYNC_EXECUTE', 'POST_MODERATE', 'POST_MUTATE', 'FEED_UPDATE',
          'PLACEMENT_UPDATE', 'SETTINGS_UPDATE'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

      // 2. Table: SocialProviderConfig
      `CREATE TABLE IF NOT EXISTS "SocialProviderConfig" (
        "id"              TEXT NOT NULL,
        "provider"        "SocialProviderKey" NOT NULL,
        "name"            TEXT NOT NULL,
        "enabled"         BOOLEAN NOT NULL DEFAULT true,
        "appId"           TEXT,
        "encryptedSecret" TEXT,
        "apiVersion"      TEXT DEFAULT 'v21.0',
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
      );`,

      `CREATE UNIQUE INDEX IF NOT EXISTS "SocialProviderConfig_provider_key"
        ON "SocialProviderConfig"("provider");`,

      // 3. Table: SocialAccount
      `CREATE TABLE IF NOT EXISTS "SocialAccount" (
        "id"                    TEXT NOT NULL,
        "providerConfigId"      TEXT NOT NULL,
        "provider"              "SocialProviderKey" NOT NULL,
        "providerAccountId"     TEXT NOT NULL,
        "internalName"          TEXT NOT NULL,
        "username"              TEXT NOT NULL,
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
        "autoSyncEnabled"       BOOLEAN NOT NULL DEFAULT true,
        "defaultModeration"     "SocialModerationStatus" NOT NULL DEFAULT 'APPROVED',
        "defaultVisibility"     "SocialPostStatus" NOT NULL DEFAULT 'PUBLISHED',
        "fetchStories"          BOOLEAN NOT NULL DEFAULT false,
        "fetchReels"            BOOLEAN NOT NULL DEFAULT true,
        "fetchTagged"           BOOLEAN NOT NULL DEFAULT false,
        "webhookSubscribed"     BOOLEAN NOT NULL DEFAULT false,
        "sortOrder"             INTEGER NOT NULL DEFAULT 0,
        "isActive"              BOOLEAN NOT NULL DEFAULT true,
        "internalNotes"         TEXT,
        "lastError"             TEXT,
        "errorCount"            INTEGER NOT NULL DEFAULT 0,
        "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SocialAccount_providerConfigId_fkey"
          FOREIGN KEY ("providerConfigId") REFERENCES "SocialProviderConfig"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );`,

      `CREATE UNIQUE INDEX IF NOT EXISTS "SocialAccount_provider_providerAccountId_key"
        ON "SocialAccount"("provider", "providerAccountId");`,
      `CREATE INDEX IF NOT EXISTS "SocialAccount_provider_idx" ON "SocialAccount"("provider");`,
      `CREATE INDEX IF NOT EXISTS "SocialAccount_portal_idx" ON "SocialAccount"("portal");`,
      `CREATE INDEX IF NOT EXISTS "SocialAccount_status_idx" ON "SocialAccount"("status");`,

      // 4. Table: SocialPost
      `CREATE TABLE IF NOT EXISTS "SocialPost" (
        "id"                TEXT NOT NULL,
        "accountId"         TEXT NOT NULL,
        "provider"          "SocialProviderKey" NOT NULL,
        "providerPostId"    TEXT NOT NULL,
        "brandId"           TEXT,
        "attractionId"      TEXT,
        "portal"            "PortalType" NOT NULL DEFAULT 'SHARED',
        "originalUrl"       TEXT NOT NULL,
        "authorName"        TEXT NOT NULL,
        "authorUsername"    TEXT NOT NULL,
        "authorAvatarUrl"   TEXT,
        "captionEn"         TEXT,
        "captionAr"         TEXT,
        "rawCaption"        TEXT,
        "mediaType"         "SocialPostMediaType" NOT NULL DEFAULT 'IMAGE',
        "mediaUrl"          TEXT NOT NULL,
        "thumbnailUrl"      TEXT,
        "aspectRatio"       DOUBLE PRECISION,
        "width"             INTEGER,
        "height"            INTEGER,
        "publishedAt"       TIMESTAMP(3) NOT NULL,
        "likeCount"         INTEGER DEFAULT 0,
        "commentCount"      INTEGER DEFAULT 0,
        "shareCount"        INTEGER DEFAULT 0,
        "viewCount"         INTEGER DEFAULT 0,
        "moderationStatus"  "SocialModerationStatus" NOT NULL DEFAULT 'APPROVED',
        "postStatus"        "SocialPostStatus" NOT NULL DEFAULT 'PUBLISHED',
        "isPinned"          BOOLEAN NOT NULL DEFAULT false,
        "isFeatured"        BOOLEAN NOT NULL DEFAULT false,
        "sortOrder"         INTEGER NOT NULL DEFAULT 0,
        "curatorNotes"      TEXT,
        "moderatedBy"       TEXT,
        "moderatedAt"       TIMESTAMP(3),
        "platformMetadata"  JSONB,
        "lastSyncedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SocialPost_accountId_fkey"
          FOREIGN KEY ("accountId") REFERENCES "SocialAccount"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );`,

      `CREATE UNIQUE INDEX IF NOT EXISTS "SocialPost_provider_providerPostId_key"
        ON "SocialPost"("provider", "providerPostId");`,
      `CREATE INDEX IF NOT EXISTS "SocialPost_provider_idx" ON "SocialPost"("provider");`,
      `CREATE INDEX IF NOT EXISTS "SocialPost_portal_idx" ON "SocialPost"("portal");`,
      `CREATE INDEX IF NOT EXISTS "SocialPost_moderationStatus_idx" ON "SocialPost"("moderationStatus");`,
      `CREATE INDEX IF NOT EXISTS "SocialPost_postStatus_idx" ON "SocialPost"("postStatus");`,
      `CREATE INDEX IF NOT EXISTS "SocialPost_publishedAt_idx" ON "SocialPost"("publishedAt");`,

      // 5. Table: SocialPostMedia
      `CREATE TABLE IF NOT EXISTS "SocialPostMedia" (
        "id"           TEXT NOT NULL,
        "postId"       TEXT NOT NULL,
        "mediaType"    "SocialPostMediaType" NOT NULL DEFAULT 'IMAGE',
        "url"          TEXT NOT NULL,
        "thumbnailUrl" TEXT,
        "aspectRatio"  DOUBLE PRECISION,
        "width"        INTEGER,
        "height"       INTEGER,
        "sortOrder"    INTEGER NOT NULL DEFAULT 0,
        "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialPostMedia_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SocialPostMedia_postId_fkey"
          FOREIGN KEY ("postId") REFERENCES "SocialPost"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );`,

      // 6. Table: SocialFeed
      `CREATE TABLE IF NOT EXISTS "SocialFeed" (
        "id"              TEXT NOT NULL,
        "slug"            TEXT NOT NULL,
        "name"            TEXT NOT NULL,
        "description"     TEXT,
        "portal"          "PortalType" NOT NULL DEFAULT 'SHARED',
        "mode"            "SocialFeedMode" NOT NULL DEFAULT 'HYBRID',
        "maxPosts"        INTEGER NOT NULL DEFAULT 12,
        "filterProviders" JSONB,
        "filterBrandId"   TEXT,
        "filterAttractionId" TEXT,
        "requireMedia"    BOOLEAN NOT NULL DEFAULT true,
        "showEngagement"  BOOLEAN NOT NULL DEFAULT true,
        "autoRefreshMins" INTEGER NOT NULL DEFAULT 30,
        "cacheTtlSeconds" INTEGER NOT NULL DEFAULT 300,
        "isActive"        BOOLEAN NOT NULL DEFAULT true,
        "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialFeed_pkey" PRIMARY KEY ("id")
      );`,

      `CREATE UNIQUE INDEX IF NOT EXISTS "SocialFeed_slug_key" ON "SocialFeed"("slug");`,

      // 7. Table: SocialFeedSource
      `CREATE TABLE IF NOT EXISTS "SocialFeedSource" (
        "id"        TEXT NOT NULL,
        "feedId"    TEXT NOT NULL,
        "accountId" TEXT NOT NULL,
        "weight"    INTEGER NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialFeedSource_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SocialFeedSource_feedId_fkey"
          FOREIGN KEY ("feedId") REFERENCES "SocialFeed"("id")
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "SocialFeedSource_accountId_fkey"
          FOREIGN KEY ("accountId") REFERENCES "SocialAccount"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );`,

      `CREATE UNIQUE INDEX IF NOT EXISTS "SocialFeedSource_feedId_accountId_key"
        ON "SocialFeedSource"("feedId", "accountId");`,

      // 8. Table: SocialFeedPost
      `CREATE TABLE IF NOT EXISTS "SocialFeedPost" (
        "id"        TEXT NOT NULL,
        "feedId"    TEXT NOT NULL,
        "postId"    TEXT NOT NULL,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "isPinned"  BOOLEAN NOT NULL DEFAULT false,
        "addedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialFeedPost_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SocialFeedPost_feedId_fkey"
          FOREIGN KEY ("feedId") REFERENCES "SocialFeed"("id")
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "SocialFeedPost_postId_fkey"
          FOREIGN KEY ("postId") REFERENCES "SocialPost"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );`,

      `CREATE UNIQUE INDEX IF NOT EXISTS "SocialFeedPost_feedId_postId_key"
        ON "SocialFeedPost"("feedId", "postId");`,

      // 9. Table: SocialPlacement
      `CREATE TABLE IF NOT EXISTS "SocialPlacement" (
        "id"            TEXT NOT NULL,
        "location"      "SocialPlacementLocation" NOT NULL,
        "locationKey"   TEXT,
        "feedId"        TEXT NOT NULL,
        "titleEn"       TEXT,
        "titleAr"       TEXT,
        "subtitleEn"    TEXT,
        "subtitleAr"    TEXT,
        "displayLayout" TEXT NOT NULL DEFAULT 'GRID_3',
        "maxDisplay"    INTEGER NOT NULL DEFAULT 6,
        "showFollowBtn" BOOLEAN NOT NULL DEFAULT true,
        "followUrl"     TEXT,
        "customCssClass" TEXT,
        "isActive"      BOOLEAN NOT NULL DEFAULT true,
        "sortOrder"     INTEGER NOT NULL DEFAULT 0,
        "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialPlacement_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SocialPlacement_feedId_fkey"
          FOREIGN KEY ("feedId") REFERENCES "SocialFeed"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );`,

      `CREATE UNIQUE INDEX IF NOT EXISTS "SocialPlacement_location_locationKey_key"
        ON "SocialPlacement"("location", "locationKey");`,

      // 10. Table: SocialSyncJob
      `CREATE TABLE IF NOT EXISTS "SocialSyncJob" (
        "id"              TEXT NOT NULL,
        "accountId"       TEXT,
        "provider"        "SocialProviderKey",
        "trigger"         TEXT NOT NULL DEFAULT 'CRON',
        "status"          "SocialSyncStatus" NOT NULL DEFAULT 'IN_PROGRESS',
        "postsFound"      INTEGER NOT NULL DEFAULT 0,
        "postsImported"   INTEGER NOT NULL DEFAULT 0,
        "postsUpdated"    INTEGER NOT NULL DEFAULT 0,
        "postsSkipped"    INTEGER NOT NULL DEFAULT 0,
        "errorMessage"    TEXT,
        "executionTimeMs" INTEGER,
        "startedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "finishedAt"      TIMESTAMP(3),
        "triggeredBy"     TEXT,
        CONSTRAINT "SocialSyncJob_pkey" PRIMARY KEY ("id")
      );`,

      // 11. Table: SocialSyncError
      `CREATE TABLE IF NOT EXISTS "SocialSyncError" (
        "id"           TEXT NOT NULL,
        "accountId"    TEXT,
        "provider"     "SocialProviderKey" NOT NULL,
        "errorCode"    TEXT NOT NULL,
        "errorMessage" TEXT NOT NULL,
        "rawError"     JSONB,
        "resolved"     BOOLEAN NOT NULL DEFAULT false,
        "resolvedAt"   TIMESTAMP(3),
        "resolvedBy"   TEXT,
        "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialSyncError_pkey" PRIMARY KEY ("id")
      );`,

      // 12. Table: SocialAuditLog
      `CREATE TABLE IF NOT EXISTS "SocialAuditLog" (
        "id"         TEXT NOT NULL,
        "userId"     TEXT,
        "userName"   TEXT,
        "userEmail"  TEXT,
        "action"     "SocialAuditAction" NOT NULL,
        "targetType" TEXT NOT NULL,
        "targetId"   TEXT,
        "summary"    TEXT NOT NULL,
        "details"    JSONB,
        "ipAddress"  TEXT,
        "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialAuditLog_pkey" PRIMARY KEY ("id")
      );`,

      // 13. Table: SocialGlobalSettings
      `CREATE TABLE IF NOT EXISTS "SocialGlobalSettings" (
        "id"                         TEXT NOT NULL DEFAULT 'default',
        "syncIntervalMinutes"        INTEGER NOT NULL DEFAULT 30,
        "defaultModeration"          "SocialModerationStatus" NOT NULL DEFAULT 'APPROVED',
        "defaultFeedMode"            "SocialFeedMode" NOT NULL DEFAULT 'HYBRID',
        "defaultMaxPosts"            INTEGER NOT NULL DEFAULT 12,
        "dataRetentionDays"          INTEGER NOT NULL DEFAULT 365,
        "showEngagementMetrics"      BOOLEAN NOT NULL DEFAULT true,
        "notifyOnSyncFailure"        BOOLEAN NOT NULL DEFAULT true,
        "notifyOnTokenExpiry"        BOOLEAN NOT NULL DEFAULT true,
        "notificationEmails"         JSONB,
        "cacheDurationSeconds"       INTEGER NOT NULL DEFAULT 300,
        "maxImportedPostsPerAccount" INTEGER NOT NULL DEFAULT 100,
        "allowedMediaTypes"          JSONB,
        "fallbackImageUrl"           TEXT,
        "enableManualEmbeds"         BOOLEAN NOT NULL DEFAULT true,
        "publicFeedsEnabled"         BOOLEAN NOT NULL DEFAULT true,
        "updatedBy"                  TEXT,
        "updatedAt"                  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialGlobalSettings_pkey" PRIMARY KEY ("id")
      );`,

      // 14. Table: SocialSyncLock
      `CREATE TABLE IF NOT EXISTS "SocialSyncLock" (
        "id"          TEXT NOT NULL,
        "lockKey"     TEXT NOT NULL,
        "accountId"   TEXT,
        "ownerToken"  TEXT NOT NULL,
        "acquiredAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lockedUntil" TIMESTAMP(3) NOT NULL,
        "heartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SocialSyncLock_pkey" PRIMARY KEY ("id")
      );`,

      `CREATE UNIQUE INDEX IF NOT EXISTS "SocialSyncLock_lockKey_key"
        ON "SocialSyncLock"("lockKey");`,

      // 15. Default Provider Configurations Seed
      `INSERT INTO "SocialProviderConfig" ("id", "provider", "name", "enabled", "apiVersion", "createdAt", "updatedAt")
      VALUES
        ('prov_meta_instagram', 'META_INSTAGRAM', 'Meta Instagram Graph API', true, 'v21.0', NOW(), NOW()),
        ('prov_meta_facebook', 'META_FACEBOOK', 'Meta Facebook Pages API', true, 'v21.0', NOW(), NOW()),
        ('prov_tiktok', 'TIKTOK', 'TikTok Display API', true, 'v2', NOW(), NOW()),
        ('prov_youtube', 'YOUTUBE', 'YouTube Data API v3', true, 'v3', NOW(), NOW()),
        ('prov_linkedin', 'LINKEDIN', 'LinkedIn Community API', true, 'v2', NOW(), NOW()),
        ('prov_manual', 'MANUAL', 'Custom & Manual Content', true, 'v1', NOW(), NOW())
      ON CONFLICT ("provider") DO NOTHING;`,

      // 16. Default Global Settings Seed
      `INSERT INTO "SocialGlobalSettings" ("id", "syncIntervalMinutes", "defaultModeration", "defaultFeedMode", "defaultMaxPosts", "dataRetentionDays", "showEngagementMetrics", "notifyOnSyncFailure", "notifyOnTokenExpiry", "cacheDurationSeconds", "maxImportedPostsPerAccount", "enableManualEmbeds", "publicFeedsEnabled", "updatedAt")
      VALUES
        ('default', 30, 'APPROVED', 'HYBRID', 12, 365, true, true, true, 300, 100, true, true, NOW())
      ON CONFLICT ("id") DO NOTHING;`
    ];

    for (const statement of ddlStatements) {
      await db.$executeRawUnsafe(statement);
    }

    isSchemaInitialized = true;
    return true;
  } catch (err: any) {
    console.warn('[Social Schema Guard] Note during DDL execution:', err.message || err);
    return false;
  }
}
