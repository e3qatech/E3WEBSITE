import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { runGlobalSocialSync } from '@/lib/social-media/sync-engine';

export const dynamic = 'force-dynamic';
// Allow up to 300 seconds for long-running sync across multiple accounts
export const maxDuration = 300;

/**
 * Vercel Cron endpoint: /api/cron/social-sync
 *
 * Security:
 *   - CRON_SECRET is MANDATORY. Missing CRON_SECRET fails closed (401) in all environments.
 *   - Authorization header must be exactly: "Bearer <CRON_SECRET>"
 *   - Duplicate invocations are safe (per-account distributed lease locks prevent overlap).
 *   - One failing account does NOT terminate other accounts (handled in runGlobalSocialSync).
 *
 * Schedule: registered in vercel.json, runs every 30 minutes in UTC.
 * Plan requirement: Vercel Pro or Enterprise for sub-hourly cron schedules.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed: CRON_SECRET must ALWAYS be configured
  if (!cronSecret) {
    console.error('[CRON_SOCIAL_SYNC] CRON_SECRET is not set. Refusing all requests.');
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization');

  // Constant-time comparison to prevent timing attacks
  const expectedHeader = `Bearer ${cronSecret}`;
  if (!authHeader || !timingSafeEqual(authHeader, expectedHeader)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const results = await runGlobalSocialSync('CRON');

    const summary = {
      total:   results.length,
      success: results.filter(r => r.status === 'SUCCESS').length,
      partial: results.filter(r => r.status === 'PARTIAL_SUCCESS').length,
      failed:  results.filter(r => r.status === 'FAILED').length,
      skipped: results.filter(r => r.status === 'SKIPPED').length,
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      // Return account IDs and status only — never tokens, secrets, or credentials
      results: results.map(r => ({
        accountId: r.accountId,
        provider:  r.provider,
        status:    r.status,
        created:   r.recordsCreated,
        updated:   r.recordsUpdated,
        failed:    r.recordsFailed,
        durationMs: r.durationMs,
        error:     r.error ?? null,
      })),
    });
  } catch (err: any) {
    console.error('[CRON_SOCIAL_SYNC] Global sync failed:', err?.message);
    return NextResponse.json({ success: false, error: 'Sync execution failed.' }, { status: 500 });
  }
}

// Vercel Cron sends GET; POST is a convenience alias for manual triggers via admin UI
export async function POST(req: NextRequest) {
  return GET(req);
}

/**
 * Constant-time string comparison to mitigate timing attacks on secret comparison.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}
