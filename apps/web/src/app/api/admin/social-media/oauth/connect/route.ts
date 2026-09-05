import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { socialAdapterRegistry } from '@/lib/social-media/adapters/registry';
import { SocialProviderKey } from '@/lib/social-media/types';
import { ensureSocialMediaTablesExist } from '@/lib/social-media/ensure-tables';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider') as SocialProviderKey;

  if (!provider) {
    return NextResponse.json({ error: 'Provider parameter missing' }, { status: 400 });
  }

  try {
    let configRecord: any = null;
    try {
      configRecord = await db.socialProviderConfig.findUnique({
        where: { provider },
      });
    } catch (dbErr: any) {
      if (String(dbErr?.message || '').includes('does not exist') || dbErr?.code === 'P2021') {
        await ensureSocialMediaTablesExist(true);
        configRecord = await db.socialProviderConfig.findUnique({
          where: { provider },
        });
      } else {
        throw dbErr;
      }
    }

    if (!configRecord) {
      await ensureSocialMediaTablesExist(true);
      configRecord = await db.socialProviderConfig.findUnique({
        where: { provider },
      });
    }

    if (!configRecord || !configRecord.enabled) {
      return NextResponse.json({ error: `Provider ${provider} is not configured or disabled.` }, { status: 400 });
    }

    if (!configRecord.appId) {
      // Return helpful message with redirect link to Platforms tab to enter App ID
      const origin = req.headers.get('origin') || req.nextUrl.origin;
      return NextResponse.redirect(`${origin}/dashboard/social-media#platforms?notice=missing_credentials&provider=${provider}`);
    }

    const adapter = socialAdapterRegistry.getAdapter(provider);
    const state = `state_${provider}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const callbackUrl = configRecord.callbackUrl || `${origin}/api/admin/social-media/oauth/callback?provider=${provider}`;

    const config = {
      appId: configRecord.appId || '',
      callbackUrl,
      scopes: Array.isArray(configRecord.requiredScopes) ? (configRecord.requiredScopes as string[]) : undefined,
    };

    const authUrl = adapter.getAuthUrl(config, state);

    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'OAuth connect initiation failed.' }, { status: 500 });
  }
}
