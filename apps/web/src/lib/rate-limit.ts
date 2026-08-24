import { redis } from '@/lib/redis';

// In-memory fallback — Used in Vercel Preview, local development, and test environments
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number = 5,
  windowSec: number = 60,
  failOpen: boolean = false
): Promise<{
  success: boolean;
  error?: string;
  code?: string;
  retryAfter?: number;
  isBackendUnavailable?: boolean;
}> {
  // Ensure Redis keys are strictly namespaced by environment to isolate Preview & Production
  const envPrefix = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
  const namespacedKey = key.startsWith(`${envPrefix}:`) ? key : `${envPrefix}:${key}`;

  try {
    const currentCount = await redis.incr(namespacedKey);
    if (typeof currentCount !== 'number' || Number.isNaN(currentCount)) {
      throw new Error('Redis client unavailable or returned non-numeric count');
    }
    if (currentCount === 1) {
      await redis.expire(namespacedKey, windowSec);
    }
    if (currentCount > limit) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: windowSec,
      };
    }
    return { success: true };
  } catch (_error) {
    // Determine if Redis is configured
    const hasRedisConfig = Boolean(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL);
    const isActualProduction = process.env.VERCEL_ENV === 'production';

    if (isActualProduction && hasRedisConfig && !failOpen) {
      // In actual Production with Redis configured, remain fail-closed when Redis encounters an error
      return {
        success: false,
        error: 'Rate limit service unavailable',
        code: 'RATE_LIMIT_SERVICE_UNAVAILABLE',
        isBackendUnavailable: true,
        retryAfter: 30,
      };
    }

    if (isActualProduction && failOpen) {
      return { success: true };
    }

    // In Vercel Preview (VERCEL_ENV === 'preview' | 'development'), local development, and test environments:
    // Use bounded in-memory per-IP / per-key limiter. Rate limiting is preserved, not disabled.
    const now = Date.now();
    const windowMs = windowSec * 1000;

    // Prune stale entries if store grows large to keep memory bounded
    if (memoryStore.size > 5000) {
      memoryStore.forEach((v, k) => {
        if (now > v.resetAt) {
          memoryStore.delete(k);
        }
      });
    }

    const record = memoryStore.get(namespacedKey);
    if (record) {
      if (now > record.resetAt) {
        memoryStore.set(namespacedKey, { count: 1, resetAt: now + windowMs });
        return { success: true };
      } else {
        if (record.count >= limit) {
          return {
            success: false,
            error: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
          };
        }
        record.count++;
        return { success: true };
      }
    } else {
      memoryStore.set(namespacedKey, { count: 1, resetAt: now + windowMs });
      return { success: true };
    }
  }
}


