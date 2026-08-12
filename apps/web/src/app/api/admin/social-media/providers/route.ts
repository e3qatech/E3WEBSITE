import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { encryptSecret, maskSecret, isMaskedString } from '@/lib/social-media/encryption';
import { SocialProviderKey } from '@/lib/social-media/types';
import { checkSocialAdminAuth } from '@/lib/social-media/auth-check';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { isAuthed } = await checkSocialAdminAuth(req, 'MANAGE_CREDENTIALS');
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Missing MANAGE_CREDENTIALS permission.' }, { status: 401 });
  }
  try {
    const configs = await db.socialProviderConfig.findMany({
      orderBy: { provider: 'asc' },
    });

    // Mask secret values in response
    const sanitized = configs.map((c: any) => ({
      ...c,
      encryptedSecret: c.encryptedSecret ? maskSecret(c.encryptedSecret) : '',
      apiKey: c.apiKey ? maskSecret(c.apiKey) : '',
    }));

    return NextResponse.json({ success: true, data: sanitized });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { isAuthed } = await checkSocialAdminAuth(req, 'MANAGE_CREDENTIALS');
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Missing MANAGE_CREDENTIALS permission.' }, { status: 401 });
    }

    const body = await req.json();
    const { provider, name, enabled, appId, secret, apiVersion, callbackUrl, requiredScopes, apiKey } = body;

    if (!provider) {
      return NextResponse.json({ success: false, error: 'Provider key is required.' }, { status: 400 });
    }

    const existing = await db.socialProviderConfig.findUnique({
      where: { provider: provider as SocialProviderKey },
    });

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
