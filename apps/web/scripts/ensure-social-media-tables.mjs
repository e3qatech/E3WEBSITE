import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load env files if not set
if (!process.env.DATABASE_URL && !process.env.E3_DATABASE_URL && !process.env.POSTGRES_PRISMA_URL) {
  const envFiles = ['.env.production', '.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.resolve(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

let dbUrl = process.env.E3_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  console.log("[SOCIAL SCHEMA NOTE] DATABASE_URL is not set; skipping standalone schema verification.");
  process.exit(0);
}

try {
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    const parsedUrl = new URL(dbUrl);
    if (parsedUrl.hostname.includes('ep-snowy-hall-atkbimek')) {
      parsedUrl.hostname = 'ep-frosty-poetry-atys9iw5-pooler.c-9.us-east-1.aws.neon.tech';
    }
    if (parsedUrl.hostname.endsWith('.neon.tech') && !parsedUrl.hostname.includes('-pooler')) {
      const parts = parsedUrl.hostname.split('.');
      parts[0] = parts[0] + '-pooler';
      parsedUrl.hostname = parts.join('.');
    }
    if (parsedUrl.hostname.includes('-pooler')) {
      parsedUrl.searchParams.set('pgbouncer', 'true');
    }
    if (!parsedUrl.searchParams.has('sslmode')) {
      parsedUrl.searchParams.set('sslmode', 'require');
    }
    parsedUrl.searchParams.delete('channel_binding');
    dbUrl = parsedUrl.toString();
  }
} catch (_e) {}

process.env.DATABASE_URL = dbUrl;

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  console.log("=== ENSURING SOCIAL MEDIA TABLES & DEFAULT PROVIDERS ===");

  const ddl = [
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

    `INSERT INTO "SocialProviderConfig" ("id", "provider", "name", "enabled", "apiVersion", "createdAt", "updatedAt")
    VALUES
      ('prov_meta_instagram', 'META_INSTAGRAM', 'Meta Instagram Graph API', true, 'v21.0', NOW(), NOW()),
      ('prov_meta_facebook', 'META_FACEBOOK', 'Meta Facebook Pages API', true, 'v21.0', NOW(), NOW()),
      ('prov_tiktok', 'TIKTOK', 'TikTok Display API', true, 'v2', NOW(), NOW()),
      ('prov_youtube', 'YOUTUBE', 'YouTube Data API v3', true, 'v3', NOW(), NOW()),
      ('prov_linkedin', 'LINKEDIN', 'LinkedIn Community API', true, 'v2', NOW(), NOW()),
      ('prov_manual', 'MANUAL', 'Custom & Manual Content', true, 'v1', NOW(), NOW())
    ON CONFLICT ("provider") DO NOTHING;`,

    `INSERT INTO "SocialGlobalSettings" ("id", "syncIntervalMinutes", "defaultModeration", "defaultFeedMode", "defaultMaxPosts", "dataRetentionDays", "showEngagementMetrics", "notifyOnSyncFailure", "notifyOnTokenExpiry", "cacheDurationSeconds", "maxImportedPostsPerAccount", "enableManualEmbeds", "publicFeedsEnabled", "updatedAt")
    VALUES
      ('default', 30, 'APPROVED', 'HYBRID', 12, 365, true, true, true, 300, 100, true, true, NOW())
    ON CONFLICT ("id") DO NOTHING;`
  ];

  for (const query of ddl) {
    await db.$executeRawUnsafe(query);
  }

  const configs = await db.socialProviderConfig.count();
  console.log(`✓ Verified SocialProviderConfig table. Config count: ${configs}`);
  console.log("=== COMPLETED SUCCESSFULLY ===");
}

main().catch(console.error).finally(async () => {
  await db.$disconnect();
  process.exit(0);
});
