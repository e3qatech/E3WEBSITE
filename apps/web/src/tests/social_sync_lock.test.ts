import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildLockKey } from '../lib/social-media/sync-lock';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK: Prisma Client
// These tests validate lock logic without a live database connection.
// Each test controls the mock state to simulate acquisition, expiry,
// concurrent attempts, and crash recovery.
// ─────────────────────────────────────────────────────────────────────────────

// Simulated in-memory lock store for unit tests
interface MockLockRecord {
  lockKey: string;
  accountId: string | null;
  ownerToken: string;
  lockedUntil: Date;
  heartbeatAt: Date;
}

let mockLockStore: Record<string, MockLockRecord> = {};

// Mock Prisma SocialSyncLock operations
vi.mock('../lib/db', () => ({
  default: {
    socialSyncLock: {
      deleteMany: vi.fn(async ({ where }: any) => {
        let count = 0;
        for (const key of Object.keys(mockLockStore)) {
          const record = mockLockStore[key];
          let matches = true;
          if (where.lockKey && record.lockKey !== where.lockKey) matches = false;
          if (where.ownerToken && record.ownerToken !== where.ownerToken) matches = false;
          if (where.lockedUntil?.lt && record.lockedUntil >= where.lockedUntil.lt) matches = false;
          if (matches) {
            delete mockLockStore[key];
            count++;
          }
        }
        return { count };
      }),
      create: vi.fn(async ({ data }: any) => {
        const key = data.lockKey;
        if (mockLockStore[key]) {
          // Simulate unique constraint violation
          const err: any = new Error('Unique constraint failed on the fields: (`lockKey`)');
          err.code = 'P2002';
          throw err;
        }
        mockLockStore[key] = {
          lockKey:     data.lockKey,
          accountId:   data.accountId ?? null,
          ownerToken:  data.ownerToken,
          lockedUntil: data.lockedUntil,
          heartbeatAt: data.heartbeatAt ?? new Date(),
        };
        return mockLockStore[key];
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        let count = 0;
        for (const record of Object.values(mockLockStore)) {
          if (record.lockKey === where.lockKey && record.ownerToken === where.ownerToken) {
            record.lockedUntil = data.lockedUntil;
            record.heartbeatAt = data.heartbeatAt;
            count++;
          }
        }
        return { count };
      }),
    },
  },
}));

// Import AFTER mocking db
import {
  acquireSyncLock,
  releaseSyncLock,
  renewSyncLock,
  cleanupExpiredLocks,
} from '../lib/social-media/sync-lock';

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('SocialSyncLock — Distributed Lease Locking', () => {

  beforeEach(() => {
    mockLockStore = {};
    vi.clearAllMocks();
  });

  describe('Lock Acquisition', () => {
    it('successfully acquires a lock when no lock exists', async () => {
      const result = await acquireSyncLock('account-001');
      expect(result.acquired).toBe(true);
      expect(result.ownerToken).toBeTruthy();
      expect(typeof result.ownerToken).toBe('string');
      expect(result.ownerToken!.length).toBe(64); // 32 bytes hex
    });

    it('rejects simultaneous acquisition from a second worker', async () => {
      // First worker acquires
      const first = await acquireSyncLock('account-002');
      expect(first.acquired).toBe(true);

      // Second worker tries and is rejected
      const second = await acquireSyncLock('account-002');
      expect(second.acquired).toBe(false);
      expect(second.ownerToken).toBeNull();
    });

    it('allows acquisition after an expired lease', async () => {
      // Manually inject an expired lock
      const lockKey = buildLockKey('account-003');
      mockLockStore[lockKey] = {
        lockKey,
        accountId: 'account-003',
        ownerToken: 'old_token',
        lockedUntil: new Date(Date.now() - 10_000), // expired 10s ago
        heartbeatAt: new Date(Date.now() - 10_000),
      };

      // Acquisition should succeed (expired lock is deleted and recreated)
      const result = await acquireSyncLock('account-003');
      expect(result.acquired).toBe(true);
      expect(result.ownerToken).not.toBe('old_token');
    });

    it('generates unique owner tokens for concurrent accounts', async () => {
      const r1 = await acquireSyncLock('account-101');
      const r2 = await acquireSyncLock('account-102');
      expect(r1.ownerToken).not.toBe(r2.ownerToken);
    });
  });

  describe('Lock Release', () => {
    it('releases lock when correct owner token is provided', async () => {
      const acq = await acquireSyncLock('account-010');
      expect(acq.acquired).toBe(true);

      const rel = await releaseSyncLock('account-010', acq.ownerToken!);
      expect(rel.released).toBe(true);

      // Lock should now be free — allow second acquisition
      const reacq = await acquireSyncLock('account-010');
      expect(reacq.acquired).toBe(true);
    });

    it('refuses to release lock with incorrect owner token', async () => {
      await acquireSyncLock('account-011');

      const rel = await releaseSyncLock('account-011', 'wrong_token_abcdef');
      expect(rel.released).toBe(false);
    });

    it('does not release a different account lock', async () => {
      const acq = await acquireSyncLock('account-012');

      const rel = await releaseSyncLock('account-013', acq.ownerToken!);
      expect(rel.released).toBe(false);
    });
  });

  describe('Lock Renewal', () => {
    it('renews the lease with the correct owner token', async () => {
      const acq = await acquireSyncLock('account-020');
      const renewed = await renewSyncLock('account-020', acq.ownerToken!);
      expect(renewed).toBe(true);
    });

    it('refuses to renew with an incorrect owner token', async () => {
      await acquireSyncLock('account-021');
      const renewed = await renewSyncLock('account-021', 'wrong_token');
      expect(renewed).toBe(false);
    });
  });

  describe('Crash Recovery & Expiry Cleanup', () => {
    it('cleanupExpiredLocks removes all expired lock records', async () => {
      // Inject multiple expired locks
      for (let i = 0; i < 3; i++) {
        const lockKey = buildLockKey(`crash-account-${i}`);
        mockLockStore[lockKey] = {
          lockKey,
          accountId: `crash-account-${i}`,
          ownerToken: `token_${i}`,
          lockedUntil: new Date(Date.now() - 60_000),
          heartbeatAt: new Date(Date.now() - 60_000),
        };
      }

      // Add one active (non-expired) lock
      const activeLockKey = buildLockKey('crash-account-active');
      mockLockStore[activeLockKey] = {
        lockKey: activeLockKey,
        accountId: 'crash-account-active',
        ownerToken: 'active_token',
        lockedUntil: new Date(Date.now() + 60_000),
        heartbeatAt: new Date(),
      };

      const cleaned = await cleanupExpiredLocks();
      expect(cleaned).toBe(3);
      expect(mockLockStore[activeLockKey]).toBeDefined();
    });

    it('allows acquisition after a crash (simulated by expiry)', async () => {
      const lockKey = buildLockKey('crash-account-999');
      // Simulate a crashed function that never released its lock
      mockLockStore[lockKey] = {
        lockKey,
        accountId: 'crash-account-999',
        ownerToken: 'crashed_token',
        lockedUntil: new Date(Date.now() - 5_000), // expired
        heartbeatAt: new Date(Date.now() - 65_000),
      };

      const result = await acquireSyncLock('crash-account-999');
      expect(result.acquired).toBe(true);
      expect(result.ownerToken).not.toBe('crashed_token');
    });
  });

  describe('Idempotency', () => {
    it('two workers acquiring different account locks do not interfere', async () => {
      const r1 = await acquireSyncLock('iso-account-a');
      const r2 = await acquireSyncLock('iso-account-b');
      expect(r1.acquired).toBe(true);
      expect(r2.acquired).toBe(true);
    });
  });
});
