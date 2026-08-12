import { BaseProviderAdapter } from './base';
import { FetchPostsResult, NormalizedSocialPostInput, ProviderAdapterConfig, SocialProviderKey } from '../types';

export class TikTokAdapter extends BaseProviderAdapter {
  providerKey: SocialProviderKey = 'TIKTOK';

  getAuthUrl(config: ProviderAdapterConfig, state: string): string {
    const baseUrl = 'https://www.tiktok.com/v2/auth/authorize/';
    const params = new URLSearchParams({
      client_key: config.appId || '',
      redirect_uri: config.callbackUrl || '',
      state,
      scope: (config.scopes || ['user.info.basic', 'video.list']).join(','),
      response_type: 'code',
    });
    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(
    config: ProviderAdapterConfig,
    code: string,
    redirectUri: string
  ) {
    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    const bodyParams = new URLSearchParams({
      client_key: config.appId || '',
      client_secret: config.appSecret || '',
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      throw new Error(`TikTok OAuth exchange failed: ${res.statusText}`);
    }

    const data = await res.json();
    const tokenData = data.data || {};

    return {
      accessToken: tokenData.access_token || '',
      refreshToken: tokenData.refresh_token || '',
      expiresIn: tokenData.expires_in || 86400,
      providerAccountId: tokenData.open_id || 'tiktok_account_id',
      username: 'e3qatar_tiktok',
      displayName: 'E3 Qatar TikTok',
      profileImageUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=400&auto=format&fit=crop',
      grantedScopes: config.scopes || ['user.info.basic', 'video.list'],
    };
  }

  async refreshToken(
    config: ProviderAdapterConfig,
    currentRefreshToken: string
  ) {
    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    const bodyParams = new URLSearchParams({
      client_key: config.appId || '',
      client_secret: config.appSecret || '',
      grant_type: 'refresh_token',
      refresh_token: currentRefreshToken,
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      throw new Error(`TikTok token refresh failed: ${res.statusText}`);
    }

    const data = await res.json();
    const tokenData = data.data || {};

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    };
  }

  async fetchPosts(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string },
    options?: { cursor?: string; limit?: number }
  ): Promise<FetchPostsResult> {
    const limit = options?.limit || 10;
    try {
      const res = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,embed_link,create_time,like_count,comment_count,share_count,view_count', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ max_count: limit, cursor: options?.cursor ? Number(options.cursor) : 0 }),
      });

      if (!res.ok) {
        throw new Error(`TikTok Video List API failed: ${res.statusText}`);
      }

      const json = await res.json();
      const list = json.data?.videos || [];

      const posts: NormalizedSocialPostInput[] = list.map((item: any) => ({
        provider: 'TIKTOK',
        providerPostId: item.id,
        accountId: account.providerAccountId,
        originalUrl: item.embed_link || `https://tiktok.com/@e3qatar/video/${item.id}`,
        authorName: 'E3 Qatar',
        authorUsername: 'e3qatar',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=400&auto=format&fit=crop',
        captionEn: item.title || '',
        rawCaption: item.title || '',
        mediaType: 'REEL',
        mediaUrl: item.cover_image_url || 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: item.cover_image_url || '',
        publishedAt: new Date((item.create_time || Date.now() / 1000) * 1000),
        likeCount: item.like_count || 0,
        commentCount: item.comment_count || 0,
        shareCount: item.share_count || 0,
        viewCount: item.view_count || 0,
      }));

      return {
        posts,
        nextCursor: json.data?.cursor ? String(json.data.cursor) : undefined,
        hasMore: Boolean(json.data?.has_more),
      };
    } catch (err: any) {
      console.warn('[TIKTOK_FETCH_WARN]', err.message);
      return { posts: [], hasMore: false };
    }
  }

  async testConnection(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string }
  ) {
    try {
      const res = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', {
        headers: { Authorization: `Bearer ${account.accessToken}` },
      });
      if (res.ok) {
        return { ok: true, message: 'Connected cleanly to TikTok API' };
      }
      return { ok: false, message: `TikTok API validation failed (${res.status})` };
    } catch (err: any) {
      return { ok: false, message: err.message || 'TikTok API connection failed' };
    }
  }
}
