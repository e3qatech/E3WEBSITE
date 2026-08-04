import { redis } from '@/lib/redis';

// In-memory fallback — Development only
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number = 5,
  windowSec: number = 60,
  failOpen: boolean = false
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
  try {
    const currentCount = await redis.incr(key);
    if (currentCount === 1) {
      await redis.expire(key, windowSec);
    }
    if (currentCount > limit) {
      return { success: false, error: 'Too many requests. Please try again later.', retryAfter: windowSec };
    }
    return { success: true };
  } catch (error) {
    console.warn(`[CSO] Redis rate limit error for key: ${key}`);

    // Only allow memory fallback in Development
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev && !failOpen) {
      // Production & Preview: fail-closed
      console.error(`[CSO] Rate limit failing closed — Redis unavailable in ${process.env.NODE_ENV || 'unknown'} environment.`);
      return { success: false, error: 'Service Unavailable', retryAfter: 30 };
    }

    if (!isDev && failOpen) {
      // failOpen routes in production/preview — allow but log
      console.warn(`[CSO] Rate limit fail-open in ${process.env.NODE_ENV || 'unknown'} for key: ${key}`);
      return { success: true };
    }

    // Development memory fallback
    const now = Date.now();
    const windowMs = windowSec * 1000;

    const record = memoryStore.get(key);
    if (record) {
      if (now > record.resetAt) {
        memoryStore.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true };
      } else {
        if (record.count >= limit) {
          return { success: false, error: 'Too many requests. Please try again later.', retryAfter: windowSec };
        }
        record.count++;
        return { success: true };
      }
    } else {
      memoryStore.set(key, { count: 1, resetAt: now + windowMs });
      return { success: true };
    }
  }
}

