import { BaseProviderAdapter } from './base';
import { FetchPostsResult, NormalizedSocialPostInput, ProviderAdapterConfig, SocialProviderKey } from '../types';

export class LinkedInAdapter extends BaseProviderAdapter {
  providerKey: SocialProviderKey = 'LINKEDIN';

  getAuthUrl(config: ProviderAdapterConfig, state: string): string {
    const baseUrl = 'https://www.linkedin.com/oauth/v2/authorization';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.appId || '',
      redirect_uri: config.callbackUrl || '',
      state,
      scope: (config.scopes || ['r_organization_social', 'rw_organization_admin', 'openid', 'profile']).join(' '),
    });
    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(
    config: ProviderAdapterConfig,
    code: string,
    redirectUri: string
  ) {
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.appId || '',
      client_secret: config.appSecret || '',
      redirect_uri: redirectUri,
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      throw new Error(`LinkedIn OAuth exchange failed: ${res.statusText}`);
    }

    const data = await res.json();
    const accessToken = data.access_token;

    // Fetch user profile identity
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileData = profileRes.ok ? await profileRes.json() : {};

    return {
      accessToken,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      providerAccountId: profileData.sub || 'linkedin_organization_id',
      username: profileData.name ? profileData.name.toLowerCase().replace(/\s+/g, '') : 'e3qatar',
      displayName: profileData.name || 'E3 Qatar LinkedIn Page',
      profileImageUrl: profileData.picture || 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?q=80&w=400&auto=format&fit=crop',
      grantedScopes: config.scopes || ['r_organization_social'],
    };
  }

  async fetchPosts(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string },
    options?: { cursor?: string; limit?: number }
  ): Promise<FetchPostsResult> {
    const limit = options?.limit || 10;
    try {
      const res = await fetch(`https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:${account.providerAccountId}&count=${limit}`, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      if (!res.ok) {
        throw new Error(`LinkedIn Posts API failed: ${res.statusText}`);
      }

      const json = await res.json();
      const elements = json.elements || [];

      const posts: NormalizedSocialPostInput[] = elements.map((item: any) => ({
        provider: 'LINKEDIN',
        providerPostId: item.id,
        accountId: account.providerAccountId,
        originalUrl: `https://www.linkedin.com/feed/update/${item.id}`,
        authorName: 'E3 Qatar',
        authorUsername: 'e3qatar',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?q=80&w=400&auto=format&fit=crop',
        captionEn: item.text?.text || '',
        rawCaption: item.text?.text || '',
        mediaType: 'TEXT',
        mediaUrl: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?q=80&w=1200&auto=format&fit=crop',
        publishedAt: new Date(item.created?.time || Date.now()),
      }));

      return {
        posts,
        hasMore: false,
      };
    } catch (err: any) {
      console.warn('[LINKEDIN_FETCH_WARN]', err.message);
      return { posts: [], hasMore: false };
    }
  }

  async testConnection(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string }
  ) {
    try {
      const res = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${account.accessToken}` },
      });
      if (res.ok) {
        return { ok: true, message: 'Connected cleanly to LinkedIn API' };
      }
      return { ok: false, message: `LinkedIn API validation failed (${res.status})` };
    } catch (err: any) {
      return { ok: false, message: err.message || 'LinkedIn API connection failed' };
    }
  }
}
