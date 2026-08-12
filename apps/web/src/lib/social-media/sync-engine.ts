import db from '@/lib/db';
import { decryptSecret } from './encryption';
import { socialAdapterRegistry } from './adapters/registry';
import { SocialProviderKey } from './types';

export interface SyncAccountResult {
  accountId: string;
  provider: SocialProviderKey;
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED';
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  durationMs: number;
  error?: string;
}

/**
 * Attempt to acquire a distributed PostgreSQL advisory lock for an account
 */
async function acquireDistributedLock(accountId: string): Promise<boolean> {
  try {
    const lockKey = `social_sync_${accountId}`;
    const result: any = await db.$queryRaw`SELECT pg_try_advisory_lock(hashtext(${lockKey})) as acquired`;
    return Boolean(result?.[0]?.acquired);
  } catch (err) {
    console.warn('[DISTRIBUTED_LOCK_WARN] PostgreSQL advisory lock fallback:', err);
    return true; // Fallthrough if DB lock query unavailable
  }
}

/**
 * Release a distributed PostgreSQL advisory lock for an account
 */
async function releaseDistributedLock(accountId: string): Promise<void> {
  try {
    const lockKey = `social_sync_${accountId}`;
    await db.$queryRaw`SELECT pg_advisory_unlock(hashtext(${lockKey}))`;
  } catch (err) {
    console.warn('[DISTRIBUTED_LOCK_UNLOCK_WARN] PostgreSQL advisory unlock warning:', err);
  }
}

export async function runSocialAccountSync(
  accountId: string,
  triggerType: 'CRON' | 'MANUAL' | 'WEBHOOK' = 'MANUAL'
): Promise<SyncAccountResult> {
  const startTime = Date.now();

  // Acquire distributed lock across Vercel serverless instances
  const lockAcquired = await acquireDistributedLock(accountId);

  if (!lockAcquired) {
    return {
      accountId,
      provider: 'MANUAL',
      status: 'FAILED',
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      durationMs: Date.now() - startTime,
      error: 'Account synchronization is currently locked and in progress by another worker.',
    };
  }

  let syncJobId: string | null = null;
  let providerKey: SocialProviderKey = 'MANUAL';

  try {
    const account = await db.socialAccount.findUnique({
      where: { id: accountId },
      include: { providerConfig: true },
    });

    if (!account || !account.isActive) {
      throw new Error(`Account ${accountId} is inactive or not found.`);
    }

    providerKey = account.provider;

    // Create initial SyncJob record
    const syncJob = await db.socialSyncJob.create({
      data: {
        accountId: account.id,
        provider: account.provider,
        status: 'IN_PROGRESS',
        triggerType,
      },
    });
    syncJobId = syncJob.id;

    // Update account status to SYNCING
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
      appId: account.providerConfig.appId || undefined,
      appSecret: decryptedAppSecret,
      apiVersion: account.providerConfig.apiVersion || undefined,
      callbackUrl: account.providerConfig.callbackUrl || undefined,
      apiKey: account.providerConfig.apiKey || undefined,
    };

    // Fetch posts from platform API
    const result = await adapter.fetchPosts(config, {
      providerAccountId: account.providerAccountId,
      accessToken: decryptedAccessToken,
    });

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

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

        const postData = {
          provider: postInput.provider,
          providerPostId: postInput.providerPostId,
          accountId: account.id,
          brandId: account.brandId || postInput.brandId || null,
          attractionId: account.attractionId || postInput.attractionId || null,
          portal: account.portal || postInput.portal || 'SHARED',
          originalUrl: postInput.originalUrl,
          authorName: postInput.authorName || account.displayName || 'E3 Qatar',
          authorUsername: postInput.authorUsername || account.username,
          authorAvatarUrl: postInput.authorAvatarUrl || account.profileImageUrl,
          captionEn: postInput.captionEn || '',
          captionAr: postInput.captionAr || '',
          rawCaption: postInput.rawCaption || postInput.captionEn || '',
          mediaType: postInput.mediaType || 'IMAGE',
          mediaUrl: postInput.mediaUrl,
          thumbnailUrl: postInput.thumbnailUrl || postInput.mediaUrl,
          aspectRatio: postInput.aspectRatio || 1.0,
          width: postInput.width || 1080,
          height: postInput.height || 1080,
          publishedAt: postInput.publishedAt ? new Date(postInput.publishedAt) : new Date(),
          likeCount: postInput.likeCount || 0,
          commentCount: postInput.commentCount || 0,
          shareCount: postInput.shareCount || 0,
          viewCount: postInput.viewCount || 0,
          platformMetadata: postInput.platformMetadata || {},
          moderationStatus: account.defaultModeration || 'APPROVED',
          status: account.defaultVisibility || 'PUBLISHED',
          lastSyncedAt: new Date(),
        };

        if (existing) {
          await db.socialPost.update({
            where: { id: existing.id },
            data: {
              likeCount: postData.likeCount,
              commentCount: postData.commentCount,
              shareCount: postData.shareCount,
              viewCount: postData.viewCount,
              lastSyncedAt: new Date(),
            },
          });
          updatedCount++;
        } else {
          await db.socialPost.create({ data: postData });
          createdCount++;
        }
      } catch (postErr) {
        console.warn(`[SYNC_POST_UPSERT_WARN] Post ${postInput.providerPostId} failed:`, postErr);
        failedCount++;
      }
    }

    const durationMs = Date.now() - startTime;

    // Update SyncJob
    if (syncJobId) {
      await db.socialSyncJob.update({
        where: { id: syncJobId },
        data: {
          status: failedCount === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
          endTime: new Date(),
          durationMs,
          recordsCreated: createdCount,
          recordsUpdated: updatedCount,
          recordsFailed: failedCount,
        },
      });
    }

    // Update Account Status
    await db.socialAccount.update({
      where: { id: account.id },
      data: {
        status: 'HEALTHY',
        lastSuccessfulSync: new Date(),
      },
    });

    return {
      accountId,
      provider: account.provider,
      status: failedCount === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
      recordsCreated: createdCount,
      recordsUpdated: updatedCount,
      recordsFailed: failedCount,
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const errorMsg = err?.message || 'Synchronization failed.';

    if (syncJobId) {
      await db.socialSyncJob.update({
        where: { id: syncJobId },
        data: {
          status: 'FAILED',
          endTime: new Date(),
          durationMs,
          errorMessage: errorMsg,
        },
      }).catch(() => {});
    }

    await db.socialAccount.update({
      where: { id: accountId },
      data: { status: 'ERROR' },
    }).catch(() => {});

    await db.socialSyncError.create({
      data: {
        accountId,
        provider: providerKey,
        errorMessage: errorMsg,
      },
    }).catch(() => {});

    return {
      accountId,
      provider: providerKey,
      status: 'FAILED',
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 1,
      durationMs,
      error: errorMsg,
    };
  } finally {
    await releaseDistributedLock(accountId);
  }
}

/**
 * Execute background sync across all active accounts requiring synchronization
 */
export async function runGlobalSocialSync(triggerType: 'CRON' | 'MANUAL' = 'CRON') {
  const accounts = await db.socialAccount.findMany({
    where: { isActive: true, autoSyncEnabled: true },
  });

  const results: SyncAccountResult[] = [];
  for (const account of accounts) {
    const res = await runSocialAccountSync(account.id, triggerType);
    results.push(res);
  }

  return results;
}
