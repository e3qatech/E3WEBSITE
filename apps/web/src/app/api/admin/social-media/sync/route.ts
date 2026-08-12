import { NextRequest, NextResponse } from 'next/server';
import { runSocialAccountSync, runGlobalSocialSync } from '@/lib/social-media/sync-engine';

import { checkSocialAdminAuth } from '@/lib/social-media/auth-check';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'RUN_SYNC');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { accountId } = body;

    if (accountId) {
      const result = await runSocialAccountSync(accountId, 'MANUAL');
      return NextResponse.json({ success: true, data: result });
    }

    const results = await runGlobalSocialSync('MANUAL');
    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Sync failed.' }, { status: 500 });
  }
}
