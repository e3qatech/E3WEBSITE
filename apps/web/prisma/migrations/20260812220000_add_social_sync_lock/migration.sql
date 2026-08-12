-- Migration: 20260812220000_add_social_sync_lock
-- Adds SocialSyncLock table for database-backed distributed lease locking.
-- Replaces session-level PostgreSQL advisory locks which are incompatible
-- with PgBouncer pooling used by Neon serverless.
-- Idempotent: safe to re-run.

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
CREATE INDEX IF NOT EXISTS "SocialSyncLock_lockKey_idx"
    ON "SocialSyncLock"("lockKey");
CREATE INDEX IF NOT EXISTS "SocialSyncLock_lockedUntil_idx"
    ON "SocialSyncLock"("lockedUntil");
CREATE INDEX IF NOT EXISTS "SocialSyncLock_accountId_idx"
    ON "SocialSyncLock"("accountId");
