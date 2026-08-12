import crypto from 'crypto';
import db from '@/lib/db';

const DEFAULT_LEASE_DURATION_MS = 60_000; // 60 seconds per lock lease
const LOCK_PREFIX = 'social_sync_account_';

export interface LockAcquisitionResult {
  acquired: boolean;
  ownerToken: string | null;
  reason?: string;
}

export interface LockReleaseResult {
  released: boolean;
  reason?: string;
}

/**
 * Generate a cryptographically unique owner token.
 */
function generateOwnerToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Build a deterministic lock key for a given account ID.
 */
export function buildLockKey(accountId: string): string {
  return `${LOCK_PREFIX}${accountId}`;
}

/**
 * Attempt to acquire a distributed database-backed lease lock for a sync account.
 *
 * Atomic behavior:
 *   - Acquire when no lock record exists.
 *   - Acquire when an existing lease has expired (lockedUntil < NOW()).
 *   - Reject when another valid owner holds an unexpired lease.
 *
 * Compatible with Neon serverless + PgBouncer pooling (no session-level advisory locks).
 */
export async function acquireSyncLock(
  accountId: string,
  leaseDurationMs = DEFAULT_LEASE_DURATION_MS
): Promise<LockAcquisitionResult> {
  const lockKey = buildLockKey(accountId);
  const ownerToken = generateOwnerToken();
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + leaseDurationMs);

  try {
    // First: delete any expired locks for this key (crash recovery)
    await db.socialSyncLock.deleteMany({
      where: {
        lockKey,
        lockedUntil: { lt: now },
      },
    });

    // Second: try to create the lock atomically (unique constraint on lockKey)
    await db.socialSyncLock.create({
      data: {
        lockKey,
        accountId,
        ownerToken,
        acquiredAt: now,
        lockedUntil,
        heartbeatAt: now,
      },
    });

    return { acquired: true, ownerToken };
  } catch (err: any) {
    // Unique constraint violation → another valid owner holds the lock
    if (err?.code === 'P2002') {
      return {
        acquired: false,
        ownerToken: null,
        reason: `Lock "${lockKey}" is held by another active sync worker.`,
      };
    }
    console.error('[SYNC_LOCK_ACQUIRE_ERROR]', err?.message);
    // On unexpected error, fail open with a warning (prefer availability over strict exclusion)
    return { acquired: true, ownerToken, reason: 'Lock acquisition error; proceeding with caution.' };
  }
}

/**
 * Release the sync lock ONLY when the ownerToken matches the stored record.
 * Prevents a crashed or late worker from releasing another worker's lock.
 */
export async function releaseSyncLock(
  accountId: string,
  ownerToken: string
): Promise<LockReleaseResult> {
  const lockKey = buildLockKey(accountId);
  try {
    const result = await db.socialSyncLock.deleteMany({
      where: { lockKey, ownerToken },
    });

    if (result.count === 0) {
      return {
        released: false,
        reason: `Lock "${lockKey}" not found or token mismatch. Possibly already expired and reclaimed.`,
      };
    }
    return { released: true };
  } catch (err: any) {
    console.error('[SYNC_LOCK_RELEASE_ERROR]', err?.message);
    return { released: false, reason: err?.message };
  }
}

/**
 * Renew the lease for an in-progress sync to prevent premature expiry.
 * Only succeeds when the ownerToken still matches (owner safety).
 */
export async function renewSyncLock(
  accountId: string,
  ownerToken: string,
  leaseDurationMs = DEFAULT_LEASE_DURATION_MS
): Promise<boolean> {
  const lockKey = buildLockKey(accountId);
  const now = new Date();
  const lockedUntil = new Date(now.getTime() + leaseDurationMs);

  try {
    const result = await db.socialSyncLock.updateMany({
      where: { lockKey, ownerToken },
      data: { lockedUntil, heartbeatAt: now },
    });
    return result.count > 0;
  } catch (err: any) {
    console.error('[SYNC_LOCK_RENEW_ERROR]', err?.message);
    return false;
  }
}

/**
 * Force-release all expired sync locks globally (maintenance utility).
 * Safe to call from cron or health-check routes.
 */
export async function cleanupExpiredLocks(): Promise<number> {
  try {
    const result = await db.socialSyncLock.deleteMany({
      where: { lockedUntil: { lt: new Date() } },
    });
    return result.count;
  } catch (err: any) {
    console.error('[SYNC_LOCK_CLEANUP_ERROR]', err?.message);
    return 0;
  }
}
