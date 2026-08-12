import { NextRequest, NextResponse } from 'next/server';
import { runGlobalSocialSync } from '@/lib/social-media/sync-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Authorization check for Vercel Cron or bearer secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  try {
    const results = await runGlobalSocialSync('CRON');
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
