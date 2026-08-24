import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { cleanupExpiredUnattachedRfps } from '@/app/api/upload/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Authenticated Cron endpoint: /api/cron/cleanup
 *
 * Security:
 *   - CRON_SECRET is mandatory. Fails closed (401) if missing or mismatched.
 *   - Authorization header must be: "Bearer <CRON_SECRET>"
 *
 * Purpose:
 *   - Deletes expired unattached RFP documents (older than expiresAt) and cleans up private Blob storage.
 *   - Never deletes ATTACHED records or records with active lead associations.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[CRON_CLEANUP] CRON_SECRET is not configured.');
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization');
  const expectedHeader = `Bearer ${cronSecret}`;
  if (!authHeader || !timingSafeEqual(authHeader, expectedHeader)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const rfpCleanup = await cleanupExpiredUnattachedRfps();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cleaned: {
        rfpUploadsDeleted: rfpCleanup.deletedCount,
      },
    });
  } catch (err: any) {
    console.error('[CRON_CLEANUP] Maintenance cleanup failed:', err?.message);
    return NextResponse.json({ success: false, error: 'Cleanup execution failed.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
