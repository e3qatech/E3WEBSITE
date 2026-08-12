import db from '@/lib/db';
import { decryptSecret } from './encryption';
import { socialAdapterRegistry } from './adapters/registry';
import { SocialProviderKey } from './types';
import { acquireSyncLock, releaseSyncLock, cleanupExpiredLocks } from './sync-lock';

export interface SyncAccountResult {
  accountId: string;
  provider: SocialProviderKey;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'SKIPPED';
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  durationMs: number;
  error?: string;
}

export async function runSocialAccountSync(
  accountId: string,
  triggerType: 'CRON' | 'MANUAL' | 'WEBHOOK' = 'MANUAL'
): Promise<SyncAccountResult> {
  const startTime = Date.now();

  // Acquire database-backed distributed lease lock.
  // Compatible with Neon serverless + PgBouncer pooling.
  const lockResult = await acquireSyncLock(accountId);

  if (!lockResult.acquired || !lockResult.ownerToken) {
    return {
      accountId,
      provider: 'MANUAL',
      status: 'SKIPPED',
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      durationMs: Date.now() - startTime,
      error: lockResult.reason ?? 'Another sync is currently in progress for this account.',
    };
  }

  const ownerToken = lockResult.ownerToken;
  let syncJobId: string | null = null;
  let providerKey: SocialProviderKey = 'MANUAL';

  try {
    const account = await db.socialAccount.findUnique({
      where: { id: accountId },
      include: { providerConfig: true },
    });

    if (!account || !account.isActive) {
      return {
        accountId,
        provider: 'MANUAL',
        status: 'SKIPPED',
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        durationMs: Date.now() - startTime,
        error: `Account ${accountId} is inactive or not found.`,
      };
    }

    providerKey = account.provider;

    const syncJob = await db.socialSyncJob.create({
      data: {
        accountId: account.id,
        provider: account.provider,
        status: 'IN_PROGRESS',
        triggerType,
      },
    });
    syncJobId = syncJob.id;

    await db.socialAccount.update({
      where: { id: account.id },
      data: { status: 'SYNCING', lastSyncAttempt: new Date() },
    });

    const adapter = socialAdapterRegistry.getAdapter(account.provider);

    const decryptedAppSecret = account.providerConfig.encryptedSecret
      ? decryptSecret(account.providerConfig.encryptedSecret)
      : undefined;

    const decryptedAccessToken = account.encryptedAccessToken
      ? decryptSecret(account.encryptedAccessToken)
      : '';

    const config = {
      appId:       account.providerConfig.appId       ?? undefined,
      appSecret:   decryptedAppSecret,
      apiVersion:  account.providerConfig.apiVersion  ?? undefined,
      callbackUrl: account.providerConfig.callbackUrl ?? undefined,
      apiKey:      account.providerConfig.apiKey      ?? undefined,
    };

    const result = await adapter.fetchPosts(config, {
      providerAccountId: account.providerAccountId,
      accessToken: decryptedAccessToken,
    });

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount  = 0;

    for (const postInput of result.posts) {
      try {
        const existing = await db.socialPost.findUnique({
          where: {
            provider_providerPostId: {
              provider: postInput.provider,
              providerPostId: postInput.providerPostId,
            },
          },
        });

        const baseData = {
          provider:       postInput.provider,
          providerPostId: postInput.providerPostId,
          accountId:      account.id,
          brandId:        account.brandId    ?? postInput.brandId    ?? null,
          attractionId:   account.attractionId ?? postInput.attractionId ?? null,
          portal:         account.portal     ?? postInput.portal     ?? 'SHARED',
          originalUrl:    postInput.originalUrl,
          authorName:     postInput.authorName     || account.displayName || 'E3 Qatar',
          authorUsername: postInput.authorUsername || account.username,
          authorAvatarUrl: postInput.authorAvatarUrl || account.profileImageUrl,
          captionEn:      postInput.captionEn ?? '',
          captionAr:      postInput.captionAr ?? '',
          rawCaption:     postInput.rawCaption ?? postInput.captionEn ?? '',
          mediaType:      postInput.mediaType ?? 'IMAGE',
          mediaUrl:       postInput.mediaUrl,
          thumbnailUrl:   postInput.thumbnailUrl ?? postInput.mediaUrl,
          aspectRatio:    postInput.aspectRatio  ?? 1.0,
          width:          postInput.width  ?? 1080,
          height:         postInput.height ?? 1080,
          publishedAt:    postInput.publishedAt ? new Date(postInput.publishedAt) : new Date(),
          likeCount:      postInput.likeCount    ?? 0,
          commentCount:   postInput.commentCount ?? 0,
          shareCount:     postInput.shareCount   ?? 0,
          viewCount:      postInput.viewCount    ?? 0,
          platformMetadata: postInput.platformMetadata ?? {},
          moderationStatus: account.defaultModeration ?? 'APPROVED',
          status:         account.defaultVisibility  ?? 'PUBLISHED',
          lastSyncedAt:   new Date(),
        };

        if (existing) {
          // Only update engagement counters and sync timestamp on existing posts
          await db.socialPost.update({
            where: { id: existing.id },
            data: {
              likeCount:    baseData.likeCount,
              commentCount: baseData.commentCount,
              shareCount:   baseData.shareCount,
              viewCount:    baseData.viewCount,
              lastSyncedAt: new Date(),
            },
          });
          updatedCount++;
        } else {
          await db.socialPost.create({ data: baseData });
          createdCount++;
        }
      } catch (postErr) {
        console.warn(`[SYNC_POST_UPSERT_WARN] Post ${postInput.providerPostId} failed:`, postErr);
        failedCount++;
      }
    }

    const durationMs = Date.now() - startTime;

    if (syncJobId) {
      await db.socialSyncJob.update({
        where: { id: syncJobId },
        data: {
          status:         failedCount === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
          endTime:        new Date(),
          durationMs,
          recordsCreated: createdCount,
          recordsUpdated: updatedCount,
          recordsFailed:  failedCount,
        },
      });
    }

    await db.socialAccount.update({
      where: { id: account.id },
      data: { status: 'HEALTHY', lastSuccessfulSync: new Date() },
    });

    return {
      accountId,
      provider: account.provider,
      status:   failedCount === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
      recordsCreated: createdCount,
      recordsUpdated: updatedCount,
      recordsFailed:  failedCount,
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const errorMsg = err?.message ?? 'Synchronization failed.';

    if (syncJobId) {
      await db.socialSyncJob.update({
        where: { id: syncJobId },
        data: { status: 'FAILED', endTime: new Date(), durationMs, errorMessage: errorMsg },
      }).catch(() => {});
    }

    await db.socialAccount.update({
      where: { id: accountId },
      data: { status: 'ERROR' },
    }).catch(() => {});

    await db.socialSyncError.create({
      data: { accountId, provider: providerKey, errorMessage: errorMsg },
    }).catch(() => {});

    return {
      accountId,
      provider: providerKey,
      status: 'FAILED',
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed:  1,
      durationMs,
      error: errorMsg,
    };
  } finally {
    // Always release lock, even on crashes — crash recovery handled by lockedUntil expiry
    await releaseSyncLock(accountId, ownerToken);
  }
}

/**
 * Execute background sync across all active auto-sync accounts.
 * Each account is processed independently; one failure does not stop others.
 * Expired locks are cleaned up before the run.
 */
export async function runGlobalSocialSync(
  triggerType: 'CRON' | 'MANUAL' = 'CRON'
): Promise<SyncAccountResult[]> {
  // Clean up stale/expired locks before starting
  const cleaned = await cleanupExpiredLocks();
  if (cleaned > 0) {
    console.info(`[SOCIAL_SYNC] Cleaned ${cleaned} expired sync locks before global run.`);
  }

  const accounts = await db.socialAccount.findMany({
    where: { isActive: true, autoSyncEnabled: true },
  });

  const results: SyncAccountResult[] = [];

  // Process accounts sequentially to avoid connection exhaustion on Neon serverless
  for (const account of accounts) {
    try {
      const res = await runSocialAccountSync(account.id, triggerType);
      results.push(res);
    } catch (err: any) {
      console.error(`[SOCIAL_SYNC] Unhandled error for account ${account.id}:`, err?.message);
      results.push({
        accountId:      account.id,
        provider:       account.provider,
        status:         'FAILED',
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed:  1,
        durationMs:     0,
        error:          err?.message,
      });
    }
  }

  return results;
}
