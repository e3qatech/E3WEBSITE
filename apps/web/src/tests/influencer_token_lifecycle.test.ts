import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createSecureCreatorToken,
  validateCreatorToken,
  revokeToken,
  hashToken,
} from '@/lib/influencer/tokens';

const mockDb = vi.hoisted(() => {
  const store: Record<string, any[]> = {
    secureCreatorToken: [],
  };

  return {
    store,
    secureCreatorToken: {
      create: vi.fn(async ({ data }: any) => {
        const record = {
          id: `tok-${Date.now()}-${Math.random()}`,
          revokedAt: null,
          useCount: 0,
          ...data,
        };
        store.secureCreatorToken.push(record);
        return record;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        const found = store.secureCreatorToken.find((t) => t.tokenHash === where.tokenHash || t.id === where.id);
        return found ? { ...found, influencer: { id: found.influencerId, displayName: 'Test Creator', platforms: [] } } : null;
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        let count = 0;
        store.secureCreatorToken.forEach((t) => {
          const matchInfluencer = !where.influencerId || t.influencerId === where.influencerId;
          const matchScope = !where.scope || t.scope === where.scope;
          const matchRevoked = where.revokedAt === null ? (t.revokedAt === null || t.revokedAt === undefined) : true;
          const matchOr = !where.OR || where.OR.some((cond: any) => cond.id === t.id || cond.tokenHash === t.tokenHash);

          if (matchInfluencer && matchScope && matchRevoked && matchOr) {
            Object.assign(t, data);
            count++;
          }
        });
        return { count };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const found = store.secureCreatorToken.find((t) => t.id === where.id);
        if (found) {
          if (data.useCount?.increment) {
            found.useCount = (found.useCount || 0) + data.useCount.increment;
          }
          if (data.lastUsedAt) found.lastUsedAt = data.lastUsedAt;
          if (data.revokedAt) found.revokedAt = data.revokedAt;
          return { ...found };
        }
        return null;
      }),
    },
  };
});

vi.mock('@/lib/db', () => ({
  default: mockDb,
  db: mockDb,
}));

describe('Influencer Token Security Lifecycle', () => {
  beforeEach(() => {
    mockDb.store.secureCreatorToken = [];
    vi.clearAllMocks();
  });

  it('1. Generates 32-byte secure token, stores only SHA-256 hash, and invalidates previous links for same scope', async () => {
    const creatorId = 'creator-uuid-1';

    // First link creation
    const res1 = await createSecureCreatorToken({
      influencerId: creatorId,
      scope: 'CAMPAIGN_INVITATION',
      maxUses: 10,
    });

    expect(res1.rawToken).toBeDefined();
    expect(res1.tokenHash).toBe(hashToken(res1.rawToken));
    expect(mockDb.store.secureCreatorToken).toHaveLength(1);
    expect(mockDb.store.secureCreatorToken[0].revokedAt).toBeNull();

    // Re-issue replacement link for same creator and scope
    const res2 = await createSecureCreatorToken({
      influencerId: creatorId,
      scope: 'CAMPAIGN_INVITATION',
      maxUses: 10,
    });

    expect(mockDb.store.secureCreatorToken).toHaveLength(2);
    // Previous token MUST be revoked (replacement-link invalidation)
    const oldToken = mockDb.store.secureCreatorToken.find((t) => t.tokenHash === res1.tokenHash);
    const newToken = mockDb.store.secureCreatorToken.find((t) => t.tokenHash === res2.tokenHash);

    expect(oldToken?.revokedAt).not.toBeNull();
    expect(newToken?.revokedAt).toBeNull();

    // Validating old token fails with REVOKED
    const validationOld = await validateCreatorToken(res1.rawToken);
    expect(validationOld.isValid).toBe(false);
    expect(validationOld.reason).toBe('REVOKED');

    // Validating new token succeeds
    const validationNew = await validateCreatorToken(res2.rawToken);
    expect(validationNew.isValid).toBe(true);
  });

  it('2. Enforces token scope restrictions', async () => {
    const res = await createSecureCreatorToken({
      influencerId: 'creator-2',
      scope: 'CAMPAIGN_INVITATION',
    });

    // Requesting with matching scope succeeds
    const matching = await validateCreatorToken(res.rawToken, 'CAMPAIGN_INVITATION');
    expect(matching.isValid).toBe(true);

    // Requesting with mismatched scope fails
    const mismatched = await validateCreatorToken(res.rawToken, 'SUBMIT_CONTENT');
    expect(mismatched.isValid).toBe(false);
    expect(mismatched.reason).toBe('SCOPE_MISMATCH');
  });

  it('3. Enforces token expiry bounds', async () => {
    const res = await createSecureCreatorToken({
      influencerId: 'creator-3',
      scope: 'CAMPAIGN_INVITATION',
      expiryHours: 24,
    });

    // Artificially expire the token in store
    const stored = mockDb.store.secureCreatorToken.find((t) => t.tokenHash === res.tokenHash);
    stored.expiresAt = new Date(Date.now() - 3600 * 1000); // 1 hour ago

    const val = await validateCreatorToken(res.rawToken);
    expect(val.isValid).toBe(false);
    expect(val.reason).toBe('EXPIRED');
  });

  it('4. Enforces maxUses and atomically increments useCount', async () => {
    const res = await createSecureCreatorToken({
      influencerId: 'creator-4',
      scope: 'CAMPAIGN_INVITATION',
      maxUses: 2,
    });

    const stored = mockDb.store.secureCreatorToken.find((t) => t.tokenHash === res.tokenHash);
    expect(stored.useCount).toBe(0);

    // First use: increments to 1
    const use1 = await validateCreatorToken(res.rawToken);
    expect(use1.isValid).toBe(true);
    expect(stored.useCount).toBe(1);
    expect(stored.lastUsedAt).toBeDefined();

    // Second use: increments to 2
    const use2 = await validateCreatorToken(res.rawToken);
    expect(use2.isValid).toBe(true);
    expect(stored.useCount).toBe(2);

    // Third use: exceeds maxUses
    const use3 = await validateCreatorToken(res.rawToken);
    expect(use3.isValid).toBe(false);
    expect(use3.reason).toBe('MAX_USES_EXCEEDED');
  });

  it('5. Enforces explicit manual token revocation', async () => {
    const res = await createSecureCreatorToken({
      influencerId: 'creator-5',
      scope: 'CAMPAIGN_INVITATION',
    });

    // Revoke token explicitly
    const revoked = await revokeToken(res.tokenHash);
    expect(revoked).toBe(true);

    const val = await validateCreatorToken(res.rawToken);
    expect(val.isValid).toBe(false);
    expect(val.reason).toBe('REVOKED');
  });
});
