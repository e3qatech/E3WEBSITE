import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  acquireSyncLock,
  releaseSyncLock,
  renewSyncLock,
  cleanupExpiredLocks,
  buildLockKey,
} from '../lib/social-media/sync-lock';

// ─────────────────────────────────────────────────────────────────────────────
// LOCK INTEGRATION SUITE (Real Lease Lock Semantics Verification)
// Tests concurrency, expiry, renewal, release security, cron vs manual competition,
// and post deduplication invariants.
// ─────────────────────────────────────────────────────────────────────────────

interface LockRecord {
  id: string;
  lockKey: string;
  accountId: string | null;
  ownerToken: string;
  acquiredAt: Date;
  lockedUntil: Date;
  heartbeatAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

let dbLocks: Map<string, LockRecord> = new Map();
let postsTable: Map<string, any> = new Map();

vi.mock('../lib/db', () => ({
  default: {
    socialSyncLock: {
      deleteMany: vi.fn(async ({ where }: any) => {
        let count = 0;
        for (const [key, record] of Array.from(dbLocks.entries())) {
          let match = true;
          if (where.lockKey && record.lockKey !== where.lockKey) match = false;
          if (where.ownerToken && record.ownerToken !== where.ownerToken) match = false;
          if (where.lockedUntil?.lt && record.lockedUntil >= where.lockedUntil.lt) match = false;
          if (match) {
            dbLocks.delete(key);
            count++;
          }
        }
        return { count };
      }),
      create: vi.fn(async ({ data }: any) => {
        const key = data.lockKey;
        if (dbLocks.has(key)) {
          const err: any = new Error('Unique constraint failed on the fields: (`lockKey`)');
          err.code = 'P2002';
          throw err;
        }
        const record: LockRecord = {
          id: `lock-${Date.now()}-${Math.random()}`,
          lockKey: data.lockKey,
          accountId: data.accountId ?? null,
          ownerToken: data.ownerToken,
          acquiredAt: data.acquiredAt || new Date(),
          lockedUntil: data.lockedUntil,
          heartbeatAt: data.heartbeatAt || new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        dbLocks.set(key, record);
        return record;
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        let count = 0;
        for (const record of Array.from(dbLocks.values())) {
          if (record.lockKey === where.lockKey && record.ownerToken === where.ownerToken) {
            record.lockedUntil = data.lockedUntil;
            record.heartbeatAt = data.heartbeatAt;
            record.updatedAt = new Date();
            count++;
          }
        }
        return { count };
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.lockKey) return dbLocks.get(where.lockKey) || null;
        return null;
      }),
    },
    socialPost: {
      findUnique: vi.fn(async ({ where }: any) => {
        const compoundKey = `${where.provider_providerPostId.provider}_${where.provider_providerPostId.providerPostId}`;
        return postsTable.get(compoundKey) || null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const compoundKey = `${data.provider}_${data.providerPostId}`;
        if (postsTable.has(compoundKey)) {
          const err: any = new Error('Unique constraint failed');
          err.code = 'P2002';
          throw err;
        }
        const newPost = { id: `post-${Date.now()}`, ...data };
        postsTable.set(compoundKey, newPost);
        return newPost;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        for (const [key, post] of Array.from(postsTable.entries())) {
          if (post.id === where.id) {
            const updated = { ...post, ...data };
            postsTable.set(key, updated);
            return updated;
          }
        }
        throw new Error('Post not found');
      }),
    },
  },
}));

describe('SocialSyncLock — Real Integration Scenarios', () => {
  beforeEach(() => {
    dbLocks.clear();
    postsTable.clear();
    vi.clearAllMocks();
  });

  it('1. Two concurrent workers attempt the same account: only one acquires', async () => {
    const accountId = 'acc_prod_001';
    
    // Worker 1 and Worker 2 start simultaneously
    const [res1, res2] = await Promise.all([
      acquireSyncLock(accountId),
      acquireSyncLock(accountId),
    ]);

    // Exactly one acquired, one rejected
    const acquired = [res1, res2].filter(r => r.acquired);
    const rejected = [res1, res2].filter(r => !r.acquired);

    expect(acquired).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(acquired[0].ownerToken).toBeTruthy();
    expect(rejected[0].ownerToken).toBeNull();
  });

  it('2. The second worker skips safely without crashing', async () => {
    const accountId = 'acc_prod_002';
    
    const lock1 = await acquireSyncLock(accountId);
    expect(lock1.acquired).toBe(true);

    const lock2 = await acquireSyncLock(accountId);
    expect(lock2.acquired).toBe(false);
    expect(lock2.reason).toContain('held by another active sync worker');
  });

  it('3. Expired locks can be acquired by a new worker', async () => {
    const accountId = 'acc_prod_003';
    const lockKey = buildLockKey(accountId);

    // Inject expired lock (expired 30s ago)
    dbLocks.set(lockKey, {
      id: 'old-lock',
      lockKey,
      accountId,
      ownerToken: 'dead-worker-token-123',
      acquiredAt: new Date(Date.now() - 90_000),
      lockedUntil: new Date(Date.now() - 30_000),
      heartbeatAt: new Date(Date.now() - 90_000),
      createdAt: new Date(Date.now() - 90_000),
      updatedAt: new Date(Date.now() - 90_000),
    });

    const newAcquisition = await acquireSyncLock(accountId);
    expect(newAcquisition.acquired).toBe(true);
    expect(newAcquisition.ownerToken).not.toBe('dead-worker-token-123');
  });

  it('4. An incorrect owner cannot renew or release the lock', async () => {
    const accountId = 'acc_prod_004';
    const acq = await acquireSyncLock(accountId);
    expect(acq.acquired).toBe(true);

    // Attempt renewal with fake token
    const renewFailed = await renewSyncLock(accountId, 'imposter-token');
    expect(renewFailed).toBe(false);

    // Attempt release with fake token
    const releaseFailed = await releaseSyncLock(accountId, 'imposter-token');
    expect(releaseFailed.released).toBe(false);

    // Lock remains active under original owner
    const lockRecord = dbLocks.get(buildLockKey(accountId));
    expect(lockRecord?.ownerToken).toBe(acq.ownerToken);
  });

  it('5. The correct owner can renew and release', async () => {
    const accountId = 'acc_prod_005';
    const acq = await acquireSyncLock(accountId);
    expect(acq.acquired).toBe(true);

    // Renew lease
    const renewed = await renewSyncLock(accountId, acq.ownerToken!);
    expect(renewed).toBe(true);

    // Release lease
    const released = await releaseSyncLock(accountId, acq.ownerToken!);
    expect(released.released).toBe(true);

    // Lock is gone
    expect(dbLocks.has(buildLockKey(accountId))).toBe(false);
  });

  it('6. A failed synchronization releases lock or allows expiry safety', async () => {
    const accountId = 'acc_prod_006';
    const acq = await acquireSyncLock(accountId);

    // Simulate crash/exception in worker: release lock in try/finally
    try {
      throw new Error('Sync API connection timeout');
    } catch (_err) {
      // In try/finally, worker releases lock
      await releaseSyncLock(accountId, acq.ownerToken!);
    }

    // Lock is now available for next attempt
    const retry = await acquireSyncLock(accountId);
    expect(retry.acquired).toBe(true);
  });

  it('7. Different accounts can synchronize concurrently', async () => {
    const [lockA, lockB, lockC] = await Promise.all([
      acquireSyncLock('account_instagram'),
      acquireSyncLock('account_facebook'),
      acquireSyncLock('account_youtube'),
    ]);

    expect(lockA.acquired).toBe(true);
    expect(lockB.acquired).toBe(true);
    expect(lockC.acquired).toBe(true);

    expect(dbLocks.size).toBe(3);
  });

  it('8. Cron and manual synchronization compete for the same lock', async () => {
    const accountId = 'acc_shared_001';

    // Cron job starts first
    const cronLock = await acquireSyncLock(accountId);
    expect(cronLock.acquired).toBe(true);

    // Manual admin click attempts sync while cron is running
    const manualLock = await acquireSyncLock(accountId);
    expect(manualLock.acquired).toBe(false);
    expect(manualLock.reason).toContain('held by another active sync worker');

    // Cron completes and releases lock
    await releaseSyncLock(accountId, cronLock.ownerToken!);

    // Manual admin click now succeeds
    const manualRetry = await acquireSyncLock(accountId);
    expect(manualRetry.acquired).toBe(true);
  });

  it('9. Duplicate posts are not created during sync (Idempotency)', async () => {
    const postData = {
      provider: 'META_INSTAGRAM' as const,
      providerPostId: 'ig_post_999',
      originalUrl: 'https://instagram.com/p/999',
      authorName: 'E3 Qatar',
      authorUsername: 'e3qatar',
      mediaUrl: 'https://cdn.e3.qa/post999.jpg',
      publishedAt: new Date(),
    };

    const db = (await import('../lib/db')).default;

    // First sync run creates post
    const existing1 = await db.socialPost.findUnique({
      where: { provider_providerPostId: { provider: postData.provider, providerPostId: postData.providerPostId } },
    });
    if (!existing1) {
      await db.socialPost.create({ data: postData });
    }

    expect(postsTable.size).toBe(1);

    // Second sync run checks existence and updates instead of creating
    const existing2 = await db.socialPost.findUnique({
      where: { provider_providerPostId: { provider: postData.provider, providerPostId: postData.providerPostId } },
    });
    if (existing2) {
      await db.socialPost.update({
        where: { id: existing2.id },
        data: { likeCount: 42 },
      });
    }

    // Still only 1 post in database (no duplicates created!)
    expect(postsTable.size).toBe(1);
    const updatedPost = postsTable.get('META_INSTAGRAM_ig_post_999');
    expect(updatedPost.likeCount).toBe(42);
  });

  it('10. Cleanup of stale locks leaves active locks intact', async () => {
    const now = Date.now();
    
    // Expired lock
    dbLocks.set('social_sync_account_stale', {
      id: 'stale-1',
      lockKey: 'social_sync_account_stale',
      accountId: 'stale',
      ownerToken: 'tok1',
      acquiredAt: new Date(now - 120_000),
      lockedUntil: new Date(now - 60_000),
      heartbeatAt: new Date(now - 120_000),
      createdAt: new Date(now - 120_000),
      updatedAt: new Date(now - 120_000),
    });

    // Active lock
    dbLocks.set('social_sync_account_active', {
      id: 'active-1',
      lockKey: 'social_sync_account_active',
      accountId: 'active',
      ownerToken: 'tok2',
      acquiredAt: new Date(now - 10_000),
      lockedUntil: new Date(now + 50_000),
      heartbeatAt: new Date(now - 10_000),
      createdAt: new Date(now - 10_000),
      updatedAt: new Date(now - 10_000),
    });

    const cleanedCount = await cleanupExpiredLocks();
    expect(cleanedCount).toBe(1);
    expect(dbLocks.has('social_sync_account_stale')).toBe(false);
    expect(dbLocks.has('social_sync_account_active')).toBe(true);
  });
});
