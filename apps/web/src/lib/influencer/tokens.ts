import crypto from 'crypto';
import db from '@/lib/db';
import type { PortalTokenScope } from './types';

export interface GeneratedTokenResult {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
  portalUrl: string;
}

/**
 * Generates 32 bytes of cryptographically secure randomness encoded in URL-safe base64
 */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Checks if a date is in the past
 */
export function isTokenExpired(expiresAt: Date | string): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Computes SHA-256 hash of a raw token string
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Creates a cryptographically secure 32-byte token, hashes it with SHA-256,
 * stores it in the database with revocation of any previous active token for that scope,
 * and returns the raw token to present to the user once.
 */
export async function createSecureCreatorToken({
  influencerId,
  scope,
  campaignCreatorId,
  expiryHours = 24,
  maxUses = 50,
  createdById,
  locale = 'en',
}: {
  influencerId: string;
  scope: PortalTokenScope;
  campaignCreatorId?: string | null;
  expiryHours?: 24 | 48 | 72;
  maxUses?: number;
  createdById?: string;
  locale?: string;
}): Promise<GeneratedTokenResult> {
  // 1. Generate 32 bytes of cryptographically secure randomness
  const randomBytes = crypto.randomBytes(32);
  const rawToken = randomBytes.toString('base64url');

  // 2. Hash raw token using SHA-256
  const tokenHash = hashToken(rawToken);

  // 3. Compute expiry timestamp
  const hours = [24, 48, 72].includes(expiryHours) ? expiryHours : 24;
  const expiresAt = new Date(Date.now() + hours * 3600 * 1000);

  // 4. Revoke previous active tokens for the same influencer and scope
  await (db as any).secureCreatorToken.updateMany({
    where: {
      influencerId,
      scope,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // 5. Store record in database with hash only (never raw token)
  await (db as any).secureCreatorToken.create({
    data: {
      tokenHash,
      scope,
      influencerId,
      campaignCreatorId: campaignCreatorId || null,
      expiresAt,
      maxUses,
      useCount: 0,
      createdById: createdById || null,
    },
  });

  const portalUrl = `/${locale}/creator-portal/${rawToken}`;

  return {
    rawToken,
    tokenHash,
    expiresAt,
    portalUrl,
  };
}

/**
 * Validates a raw token from URL or request header against stored hash.
 * Timing-safe, checks expiry, revocation, and max uses.
 */
export async function validateCreatorToken(
  rawToken: string,
  requiredScope?: PortalTokenScope
): Promise<{
  isValid: boolean;
  reason?: 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' | 'MAX_USES_EXCEEDED' | 'SCOPE_MISMATCH';
  tokenRecord?: any;
}> {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.trim().length === 0) {
    return { isValid: false, reason: 'NOT_FOUND' };
  }

  const tokenHash = hashToken(rawToken.trim());

  const tokenRecord = await (db as any).secureCreatorToken.findUnique({
    where: { tokenHash },
    include: {
      influencer: {
        include: {
          platforms: true,
        },
      },
      campaignCreator: {
        include: {
          campaign: true,
          deliverables: {
            include: {
              submissions: {
                include: {
                  reviews: true,
                },
                orderBy: { version: 'desc' },
              },
            },
          },
          attendanceRecords: true,
          promoCodes: true,
        },
      },
    },
  });

  if (!tokenRecord) {
    return { isValid: false, reason: 'NOT_FOUND' };
  }

  // Check revocation
  if (tokenRecord.revokedAt) {
    return { isValid: false, reason: 'REVOKED', tokenRecord };
  }

  // Check expiry
  if (new Date() > new Date(tokenRecord.expiresAt)) {
    return { isValid: false, reason: 'EXPIRED', tokenRecord };
  }

  // Check max uses
  if (tokenRecord.useCount >= tokenRecord.maxUses) {
    return { isValid: false, reason: 'MAX_USES_EXCEEDED', tokenRecord };
  }

  // Check scope if specified
  if (requiredScope && tokenRecord.scope !== requiredScope) {
    return { isValid: false, reason: 'SCOPE_MISMATCH', tokenRecord };
  }

  // Increment usage count and record last used timestamp atomically
  await (db as any).secureCreatorToken.update({
    where: { id: tokenRecord.id },
    data: {
      useCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  return { isValid: true, tokenRecord };
}

/**
 * Revokes a token immediately
 */
export async function revokeToken(tokenIdOrHash: string): Promise<boolean> {
  try {
    await (db as any).secureCreatorToken.updateMany({
      where: {
        OR: [{ id: tokenIdOrHash }, { tokenHash: tokenIdOrHash }],
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error('[Token Revoke Error]', error);
    return false;
  }
}
