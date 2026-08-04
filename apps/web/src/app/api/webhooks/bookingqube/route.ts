/**
 * Gate 05F: BookingQube Webhook Handler
 *
 * Security controls:
 * 1. Raw-body HMAC-SHA256 signature verification (timing-safe)
 * 2. Distributed idempotency state machine (Redis: processing → completed → failed)
 * 3. No production memory fallback — returns 503 if Redis is unavailable
 * 4. Strict Zod payload validation
 * 5. Side-effect transactional safety
 *
 * HMAC order:
 *   read raw bytes → validate signature format → compute HMAC → compare lengths
 *   → timingSafeEqual → parse JSON → validate schema → process event
 */
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { z } from 'zod'

// ─── Configuration ──────────────────────────────────────────────────────────
// Ensure dynamic lookup for testing and Next.js env resolution

// ─── Schemas ────────────────────────────────────────────────────────────────
const webhookPayloadSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['ticket.purchased', 'ticket.cancelled', 'event.capacity_changed']),
  scheduleId: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  newCapacity: z.number().int().nonnegative().optional()
}).strict()

// ─── Development-only memory idempotency ────────────────────────────────────
const devProcessedEvents = new Map<string, 'processing' | 'completed' | 'failed'>()

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Validate that a string is valid lowercase hex */
function isValidHex(s: string): boolean {
  return /^[0-9a-f]+$/.test(s)
}

/** Timing-safe signature comparison with length pre-check */
function compareSignaturesSafe(provided: string, expected: string): boolean {
  if (typeof provided !== 'string' || typeof expected !== 'string') return false
  if (provided.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}

// ─── Idempotency State Machine ──────────────────────────────────────────────

type IdempotencyResult =
  | { action: 'process' }
  | { action: 'skip'; reason: string; status: number }
  | { action: 'error'; reason: string; status: number }

async function claimEvent(eventId: string): Promise<IdempotencyResult> {
  const key = `webhook:bq:${eventId}`
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    // Development: use in-memory state machine
    const state = devProcessedEvents.get(eventId)
    if (!state) {
      devProcessedEvents.set(eventId, 'processing')
      return { action: 'process' }
    }
    if (state === 'completed') {
      return { action: 'skip', reason: 'Already processed', status: 200 }
    }
    if (state === 'processing') {
      return { action: 'skip', reason: 'Currently processing', status: 202 }
    }
    if (state === 'failed') {
      // Allow retry after failure
      devProcessedEvents.set(eventId, 'processing')
      return { action: 'process' }
    }
    return { action: 'process' }
  }

  // Production / Preview: Redis required
  try {
    // Atomic claim with NX and short processing TTL (120s)
    const claimed = await redis.set(key, 'processing', 'EX', 120, 'NX')

    if (claimed === 'OK') {
      return { action: 'process' }
    }

    // Key exists — check current state
    const currentState = await redis.get(key)

    if (currentState === 'completed') {
      return { action: 'skip', reason: 'Already processed', status: 200 }
    }
    if (currentState === 'processing') {
      // Another instance is processing — tell provider to retry later
      return { action: 'skip', reason: 'Currently processing, retry later', status: 202 }
    }
    if (currentState === 'failed') {
      // Previous attempt failed — delete and re-claim
      await redis.del(key)
      const reClaimed = await redis.set(key, 'processing', 'EX', 120, 'NX')
      if (reClaimed === 'OK') {
        return { action: 'process' }
      }
      // Another instance beat us to the re-claim
      return { action: 'skip', reason: 'Retry claimed by another instance', status: 202 }
    }

    // Unknown state — treat as processing
    return { action: 'skip', reason: 'Unknown idempotency state', status: 202 }
  } catch (redisError) {
    // Redis unavailable in Production/Preview — return 503 for provider retry
    console.error('[WEBHOOK] Redis unavailable for idempotency check:', (redisError as Error).message)
    return { action: 'error', reason: 'Service temporarily unavailable', status: 503 }
  }
}

async function markCompleted(eventId: string): Promise<void> {
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    devProcessedEvents.set(eventId, 'completed')
    return
  }
  try {
    await redis.set(`webhook:bq:${eventId}`, 'completed', 'EX', 86400) // 24h TTL
  } catch (e) {
    console.error('[WEBHOOK] Failed to mark event completed in Redis:', (e as Error).message)
  }
}

async function markFailed(eventId: string): Promise<void> {
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    devProcessedEvents.set(eventId, 'failed')
    return
  }
  try {
    await redis.set(`webhook:bq:${eventId}`, 'failed', 'EX', 300) // 5-min retry window
  } catch (e) {
    console.error('[WEBHOOK] Failed to mark event failed in Redis:', (e as Error).message)
  }
}

// ─── Route Handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 0. Validate secret is configured (production guard)
  const secret = process.env.BOOKINGQUBE_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      // Development/test fallback — allow with a warning
      console.warn('[WEBHOOK] BOOKINGQUBE_WEBHOOK_SECRET not set — using empty string')
    } else {
      console.error('[WEBHOOK] BOOKINGQUBE_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }
  }
  const effectiveSecret = secret || ''

  try {
    // 1. Read exact raw body bytes
    const rawBody = await req.text()

    // 2. Validate signature presence and format
    const signature = req.headers.get('x-bookingqube-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    if (!isValidHex(signature)) {
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 401 })
    }

    // 3. Compute HMAC over exact raw bytes
    const expectedSignature = crypto
      .createHmac('sha256', effectiveSecret)
      .update(rawBody)
      .digest('hex')

    // 4. Compare lengths
    if (signature.length !== expectedSignature.length) {
      console.warn('[WEBHOOK] Signature length mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 5. Timing-safe comparison
    if (!compareSignaturesSafe(signature, expectedSignature)) {
      console.warn('[WEBHOOK] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 6. Parse JSON only after signature passes
    let payload: unknown
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // 7. Validate strict event schema
    const parsed = webhookPayloadSchema.safeParse(payload)
    if (!parsed.success) {
      console.warn('[WEBHOOK] Invalid payload format:', parsed.error.message)
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 })
    }

    const { id: eventId, type: eventType, scheduleId, quantity, newCapacity } = parsed.data

    // 8. Idempotency check
    const claim = await claimEvent(eventId)

    if (claim.action === 'skip') {
      console.log(`[WEBHOOK] Skipped event ${eventId}: ${claim.reason}`)
      return NextResponse.json(
        { received: true, status: claim.reason },
        { status: claim.status }
      )
    }
    if (claim.action === 'error') {
      return NextResponse.json(
        { error: claim.reason },
        {
          status: claim.status,
          headers: { 'Retry-After': '30' },
        }
      )
    }

    // 9. Process event — side effects with failure tracking
    console.log(`[WEBHOOK] Processing ${eventType} [${eventId}]`)

    try {
      if (scheduleId) {
        switch (eventType) {
          case 'ticket.purchased':
            await db.eventSchedule.update({
              where: { id: scheduleId },
              data: { currentCount: { increment: quantity || 1 } },
            })
            break
          case 'ticket.cancelled':
            await db.eventSchedule.update({
              where: { id: scheduleId },
              data: { currentCount: { decrement: quantity || 1 } },
            })
            break
          case 'event.capacity_changed':
            if (newCapacity !== undefined) {
              await db.eventSchedule.update({
                where: { id: scheduleId },
                data: { capacityGate: newCapacity },
              })
            }
            break
        }
      } else {
        console.warn(`[WEBHOOK] Event ${eventId}: missing scheduleId, no side effects`)
      }

      // Side effects succeeded — mark completed
      await markCompleted(eventId)
      console.log(`[WEBHOOK] Completed ${eventType} [${eventId}]`)
      return NextResponse.json({ received: true })
    } catch (dbError) {
      // Side effects failed — mark as retryable
      console.error(`[WEBHOOK] DB error processing ${eventType} [${eventId}]:`, (dbError as Error).message)
      await markFailed(eventId)
      return NextResponse.json({ error: 'Processing failed, retry later' }, { status: 500 })
    }
  } catch (error) {
    console.error('[WEBHOOK] Unexpected error:', (error as Error).message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
