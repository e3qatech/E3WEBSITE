import { BaseProviderAdapter } from './base';
import { FetchPostsResult, NormalizedSocialPostInput, ProviderAdapterConfig, SocialProviderKey } from '../types';

export class MetaInstagramAdapter extends BaseProviderAdapter {
  providerKey: SocialProviderKey = 'META_INSTAGRAM';

  getAuthUrl(config: ProviderAdapterConfig, state: string): string {
    const apiVersion = config.apiVersion || 'v21.0';
    const baseUrl = `https://www.facebook.com/${apiVersion}/dialog/oauth`;
    const params = new URLSearchParams({
      client_id: config.appId || '',
      redirect_uri: config.callbackUrl || '',
      state,
      scope: (config.scopes || ['instagram_basic', 'instagram_manage_insights', 'pages_read_engagement']).join(','),
      response_type: 'code',
    });
    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(
    config: ProviderAdapterConfig,
    code: string,
    redirectUri: string
  ) {
    const apiVersion = config.apiVersion || 'v21.0';
    // 1. Exchange authorization code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token`;
    const tokenParams = new URLSearchParams({
      client_id: config.appId || '',
      client_secret: config.appSecret || '',
      redirect_uri: redirectUri,
      code,
    });

    const tokenRes = await fetch(`${tokenUrl}?${tokenParams.toString()}`);
    if (!tokenRes.ok) {
      const errJson = await tokenRes.json().catch(() => ({}));
      throw new Error(`Meta OAuth token exchange failed: ${errJson.error?.message || tokenRes.statusText}`);
    }
    const tokenData = await tokenRes.json();
    const shortAccessToken = tokenData.access_token;

    // 2. Exchange for long-lived token (60 days)
    const longTokenUrl = `https://graph.facebook.com/${apiVersion}/oauth/access_token`;
    const longTokenParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: config.appId || '',
      client_secret: config.appSecret || '',
      fb_exchange_token: shortAccessToken,
    });
    const longRes = await fetch(`${longTokenUrl}?${longTokenParams.toString()}`);
    const longData = longRes.ok ? await longRes.json() : tokenData;

    const finalAccessToken = longData.access_token || shortAccessToken;
    const expiresIn = longData.expires_in || 5184000; // 60 days in seconds

    // 3. Fetch connected Instagram Business / Creator accounts
    const meRes = await fetch(`https://graph.facebook.com/${apiVersion}/me/accounts?access_token=${finalAccessToken}`);
    const meData = await meRes.json();
    const page = meData.data?.[0];
    
    let igAccountId = page?.id || 'ig_default_account';
    let username = page?.name || 'e3qatar_instagram';
    let profileImageUrl = `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop`;

    if (page?.id) {
      const igRes = await fetch(`https://graph.facebook.com/${apiVersion}/${page.id}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${finalAccessToken}`);
      const igData = await igRes.json();
      if (igData.instagram_business_account) {
        igAccountId = igData.instagram_business_account.id;
        username = igData.instagram_business_account.username || username;
        profileImageUrl = igData.instagram_business_account.profile_picture_url || profileImageUrl;
      }
    }

    return {
      accessToken: finalAccessToken,
      refreshToken: finalAccessToken,
      expiresIn,
      providerAccountId: igAccountId,
      username,
      displayName: `Instagram: @${username}`,
      profileImageUrl,
      grantedScopes: config.scopes || ['instagram_basic'],
    };
  }

  async fetchPosts(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string },
    options?: { cursor?: string; limit?: number }
  ): Promise<FetchPostsResult> {
    const apiVersion = config.apiVersion || 'v21.0';
    const limit = options?.limit || 12;
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,children{media_url,media_type}';
    
    try {
      const apiUrl = `https://graph.facebook.com/${apiVersion}/${account.providerAccountId}/media?fields=${fields}&limit=${limit}&access_token=${account.accessToken}`;
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error(`Instagram Graph API error: ${res.statusText}`);
      }

      const json = await res.json();
      const rawPosts = json.data || [];

      const posts: NormalizedSocialPostInput[] = rawPosts.map((item: any) => {
        let type: NormalizedSocialPostInput['mediaType'] = 'IMAGE';
        if (item.media_type === 'VIDEO') type = 'VIDEO';
        if (item.media_type === 'REEL') type = 'REEL';
        if (item.media_type === 'CAROUSEL_ALBUM') type = 'CAROUSEL';

        return {
          provider: 'META_INSTAGRAM',
          providerPostId: item.id,
          accountId: account.providerAccountId,
          originalUrl: item.permalink || `https://instagram.com/p/${item.id}`,
          authorName: 'E3 Qatar',
          authorUsername: 'e3qatar',
          authorAvatarUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop',
          captionEn: item.caption || '',
          rawCaption: item.caption || '',
          mediaType: type,
          mediaUrl: item.media_url || item.thumbnail_url || '',
          thumbnailUrl: item.thumbnail_url || item.media_url || '',
          publishedAt: new Date(item.timestamp || Date.now()),
          likeCount: item.like_count || 0,
          commentCount: item.comments_count || 0,
          platformMetadata: {
            id: item.id,
            permalink: item.permalink,
          },
        };
      });

      return {
        posts,
        nextCursor: json.paging?.cursors?.after,
        hasMore: Boolean(json.paging?.next),
      };
    } catch (err: any) {
      console.warn('[META_INSTAGRAM_FETCH_WARN]', err.message);
      return { posts: [], hasMore: false };
    }
  }

  async testConnection(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string }
  ) {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${account.providerAccountId}?fields=id,username&access_token=${account.accessToken}`);
      if (res.ok) {
        const data = await res.json();
        return { ok: true, message: `Connected cleanly to Instagram @${data.username || account.providerAccountId}` };
      }
      return { ok: false, message: `Instagram token validation failed (${res.status})` };
    } catch (err: any) {
      return { ok: false, message: err.message || 'Instagram API connection failed' };
    }
  }
}
