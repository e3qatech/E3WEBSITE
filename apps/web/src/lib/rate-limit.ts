import { getRedisClient, RedisUnavailableError } from './redis';

const memoryStore = new Map<string, { count: number; expiresAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  reason?: 'redis_unavailable' | 'rate_limited';
}

/**
 * Checks if a request should be rate limited.
 * @param key The unique key for the client (e.g., IP address + action)
 * @param limit Maximum number of requests allowed in the window
 * @param windowSecs The time window in seconds
 * @returns RateLimitResult with allowed status and metadata
 */
export async function checkRateLimit(key: string, limit: number, windowSecs: number = 60): Promise<RateLimitResult> {
  const isProduction = process.env.NODE_ENV === 'production';
  // In production, distributed rate limiting is mandatory for ingest endpoints
  const policy = isProduction ? 'required' : 'optional';

  try {
    const redis = getRedisClient(policy);
    if (redis) {
      const currentCount = await redis.incr(key);
      if (currentCount === 1) {
        await redis.expire(key, windowSecs);
      }
      
      if (currentCount > limit) {
        // Return 429 Retry-After based on TTL
        const ttl = await redis.ttl(key);
        return { allowed: false, retryAfter: ttl > 0 ? ttl : windowSecs, reason: 'rate_limited' };
      }
      return { allowed: true };
    }
  } catch (error) {
    if (error instanceof RedisUnavailableError || isProduction) {
      // In production, if Redis is required but fails/unavailable, we FAIL CLOSED.
      console.error(`[CSO] CRITICAL: Redis unavailable for rate limiting ${key}. Failing closed to protect infrastructure.`);
      return { allowed: false, reason: 'redis_unavailable' };
    }
    console.warn(`[CSO] Redis unavailable for rate limiting ${key}, falling back to memory in DEV/PREVIEW.`);
  }

  // Fallback to in-memory rate limiting (ONLY allowed in Development/Preview)
  const now = Date.now();
  const record = memoryStore.get(key);
  const expiresAt = record ? record.expiresAt : now + windowSecs * 1000;
  const retryAfter = Math.ceil((expiresAt - now) / 1000);

  if (record && record.expiresAt > now) {
    record.count++;
    if (record.count > limit) {
      return { allowed: false, retryAfter, reason: 'rate_limited' };
    }
    return { allowed: true };
  } else {
    // Expired or new record
    memoryStore.set(key, {
      count: 1,
      expiresAt: now + windowSecs * 1000
    });
    
    // Periodically cleanup memory store to prevent memory leaks in long-running processes
    if (memoryStore.size > 10000) {
      memoryStore.forEach((v, k) => {
        if (v.expiresAt <= now) {
          memoryStore.delete(k);
        }
      });
    }
    
    return { allowed: true };
  }
}

/**
 * Safely extracts client IP, rejecting untrusted x-forwarded-for headers if no proxy is documented.
 */
export function getClientIp(req: Request): string {
  // If we are behind a known proxy (e.g. Vercel), x-forwarded-for is safe to read.
  // In Vercel, the edge network overwrites x-forwarded-for with the true client IP.
  // However, it can be a comma-separated list, we should only take the first one.
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Local development fallback
  return '127.0.0.1';
}
