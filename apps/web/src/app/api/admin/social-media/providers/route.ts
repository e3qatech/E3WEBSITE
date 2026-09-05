import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { encryptSecret, maskSecret, isMaskedString } from '@/lib/social-media/encryption';
import { SocialProviderKey } from '@/lib/social-media/types';
import { checkSocialAdminAuth } from '@/lib/social-media/auth-check';
import { ensureSocialMediaTablesExist } from '@/lib/social-media/ensure-tables';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authCheck = await checkSocialAdminAuth(req, 'VIEW_SOCIAL_MANAGER');
  if (!authCheck.isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
  }
  try {
    let configs: any[] = [];
    try {
      configs = await db.socialProviderConfig.findMany({
        orderBy: { provider: 'asc' },
      });
    } catch (dbErr: any) {
      if (String(dbErr?.message || '').includes('does not exist') || dbErr?.code === 'P2021') {
        await ensureSocialMediaTablesExist(true);
        configs = await db.socialProviderConfig.findMany({
          orderBy: { provider: 'asc' },
        });
      } else {
        throw dbErr;
      }
    }

    if (configs.length === 0) {
      await ensureSocialMediaTablesExist(true);
      configs = await db.socialProviderConfig.findMany({
        orderBy: { provider: 'asc' },
      });
    }

    // Mask secret values in response and omit raw secret properties
    const sanitized = configs.map((c: any) => {
      const { appSecret, secret, encryptedSecret, apiKey, ...rest } = c;
      return {
        ...rest,
        encryptedSecret: encryptedSecret ? maskSecret(encryptedSecret) : (appSecret ? maskSecret(appSecret) : (secret ? maskSecret(secret) : '')),
        apiKey: apiKey ? maskSecret(apiKey) : '',
      };
    });

    return NextResponse.json({ success: true, data: sanitized });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MANAGE_CREDENTIALS');
    if (!authCheck.isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: authCheck.user ? 403 : 401 });
    }

    const body = await req.json();
    const { provider, name, enabled, appId, secret, apiVersion, callbackUrl, requiredScopes, apiKey } = body;

    if (!provider) {
      return NextResponse.json({ success: false, error: 'Provider key is required.' }, { status: 400 });
    }

    let existing: any = null;
    try {
      existing = await db.socialProviderConfig.findUnique({
        where: { provider: provider as SocialProviderKey },
      });
    } catch (findErr: any) {
      if (String(findErr?.message || '').includes('does not exist') || findErr?.code === 'P2021') {
        await ensureSocialMediaTablesExist(true);
        existing = await db.socialProviderConfig.findUnique({
          where: { provider: provider as SocialProviderKey },
        });
      } else {
        throw findErr;
      }
    }

    let finalSecret = existing?.encryptedSecret || null;
    if (secret && !isMaskedString(secret)) {
      finalSecret = encryptSecret(secret);
    }

    let finalApiKey = existing?.apiKey || null;
    if (apiKey && !isMaskedString(apiKey)) {
      finalApiKey = encryptSecret(apiKey);
    }

    const updated = await db.socialProviderConfig.upsert({
      where: { provider: provider as SocialProviderKey },
      update: {
        name: name || provider,
        enabled: enabled !== undefined ? enabled : true,
        appId: appId !== undefined ? appId : existing?.appId,
        encryptedSecret: finalSecret,
        apiVersion: apiVersion || 'v19.0',
        callbackUrl: callbackUrl || undefined,
        requiredScopes: requiredScopes || undefined,
        apiKey: finalApiKey,
      },
      create: {
        provider: provider as SocialProviderKey,
        name: name || provider,
        enabled: enabled !== undefined ? enabled : true,
        appId,
        encryptedSecret: finalSecret,
        apiVersion: apiVersion || 'v19.0',
        callbackUrl,
        requiredScopes,
        apiKey: finalApiKey,
      },
    });

    await db.socialAuditLog.create({
      data: {
        action: 'CREDENTIAL_UPDATE',
        targetType: 'PROVIDER_CONFIG',
        targetId: updated.id,
        summary: `Updated integration credentials for platform ${provider}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        encryptedSecret: updated.encryptedSecret ? maskSecret(updated.encryptedSecret) : '',
        apiKey: updated.apiKey ? maskSecret(updated.apiKey) : '',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
