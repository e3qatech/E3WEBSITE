import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { socialAdapterRegistry } from '@/lib/social-media/adapters/registry';
import { encryptSecret, decryptSecret } from '@/lib/social-media/encryption';
import { SocialProviderKey } from '@/lib/social-media/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = (searchParams.get('provider') || searchParams.get('state')?.split('_')[1]) as SocialProviderKey;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const redirectBase = '/admin/social-media?tab=accounts';

  if (error || !code || !provider) {
    const errorMsg = searchParams.get('error_description') || error || 'Authorization was cancelled or failed.';
    return NextResponse.redirect(new URL(`${redirectBase}&error=${encodeURIComponent(errorMsg)}`, req.url));
  }

  try {
    const configRecord = await db.socialProviderConfig.findUnique({
      where: { provider },
    });

    if (!configRecord) {
      throw new Error(`Provider config for ${provider} not found.`);
    }

    const adapter = socialAdapterRegistry.getAdapter(provider);
    const decryptedSecret = configRecord.encryptedSecret ? decryptSecret(configRecord.encryptedSecret) : undefined;
    
    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const redirectUri = configRecord.callbackUrl || `${origin}/api/admin/social-media/oauth/callback?provider=${provider}`;

    const authResult = await adapter.handleCallback(
      {
        appId: configRecord.appId || '',
        appSecret: decryptedSecret,
      },
      code,
      redirectUri
    );

    const encryptedToken = encryptSecret(authResult.accessToken);
    const encryptedRefresh = authResult.refreshToken ? encryptSecret(authResult.refreshToken) : undefined;
    const expiresAt = authResult.expiresIn ? new Date(Date.now() + authResult.expiresIn * 1000) : undefined;

    const account = await db.socialAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: authResult.providerAccountId,
        },
      },
      update: {
        username: authResult.username,
        displayName: authResult.displayName || authResult.username,
        profileImageUrl: authResult.profileImageUrl || undefined,
        status: 'HEALTHY',
        encryptedAccessToken: encryptedToken,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiresAt: expiresAt,
        grantedScopes: authResult.grantedScopes || undefined,
        isActive: true,
      },
      create: {
        providerConfigId: configRecord.id,
        provider,
        providerAccountId: authResult.providerAccountId,
        internalName: `${configRecord.name}: @${authResult.username}`,
        username: authResult.username,
        displayName: authResult.displayName || authResult.username,
        profileImageUrl: authResult.profileImageUrl || undefined,
        status: 'HEALTHY',
        encryptedAccessToken: encryptedToken,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiresAt: expiresAt,
        grantedScopes: authResult.grantedScopes || undefined,
      },
    });

    await db.socialAuditLog.create({
      data: {
        action: 'ACCOUNT_CONNECT',
        targetType: 'SOCIAL_ACCOUNT',
        targetId: account.id,
        summary: `Successfully connected ${provider} account @${authResult.username}`,
      },
    });

    return NextResponse.redirect(new URL(`${redirectBase}&success=Account+@${authResult.username}+connected+successfully`, req.url));
  } catch (err: any) {
    console.error('[OAUTH_CALLBACK_ERROR]', err);
    return NextResponse.redirect(new URL(`${redirectBase}&error=${encodeURIComponent(err.message || 'OAuth Connection Failed')}`, req.url));
  }
}
