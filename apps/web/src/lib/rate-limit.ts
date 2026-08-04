import { getRedisClient, isBuildMode } from '@/lib/redis';

// In-memory fallback — Development only
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export async function checkRateLimit(
  key: string,
  limit: number = 5,
  windowSec: number = 60,
  failOpen: boolean = false
): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isProd = process.env.NODE_ENV === 'production' && !isPreview;

  if (isBuildMode()) {
    return { allowed: true };
  }

  const client = getRedisClient({ mode: 'optional' });

  if (client) {
    try {
      const currentCount = await client.incr(key);
      if (currentCount === 1) {
        await client.expire(key, windowSec);
      }
      if (currentCount > limit) {
        return { allowed: false, reason: 'rate_limit_exceeded', retryAfter: windowSec };
      }
      return { allowed: true };
    } catch (err: any) {
      console.warn(`[CSO] Redis rate limit error for key: ${key}`, err?.message);
    }
  }

  // Redis unavailable or failed
  if (isProd || isPreview) {
    if (failOpen) {
      console.warn(`[CSO] Rate limit fail-open explicitly allowed for key: ${key}`);
      return { allowed: true };
    }
    // Fail closed in Prod and Preview for security
    return { allowed: false, reason: 'redis_unavailable', retryAfter: windowSec };
  }

  // Development / test single-process memory fallback
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const record = memoryStore.get(key);

  if (record) {
    if (now > record.resetAt) {
      memoryStore.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true };
    } else {
      if (record.count >= limit) {
        return { allowed: false, reason: 'rate_limit_exceeded', retryAfter: windowSec };
      }
      record.count++;
      return { allowed: true };
    }
  } else {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
}

export async function rateLimit(
  key: string,
  limit: number = 5,
  windowSec: number = 60,
  failOpen: boolean = false
): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
  const result = await checkRateLimit(key, limit, windowSec, failOpen);
  if (!result.allowed) {
    return {
      success: false,
      error: result.reason === 'redis_unavailable' ? 'Service Unavailable' : 'Too many requests. Please try again later.',
      retryAfter: result.retryAfter
    };
  }
  return { success: true };
}
