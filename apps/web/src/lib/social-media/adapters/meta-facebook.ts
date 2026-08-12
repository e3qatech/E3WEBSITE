import { BaseProviderAdapter } from './base';
import { FetchPostsResult, NormalizedSocialPostInput, ProviderAdapterConfig, SocialProviderKey } from '../types';

export class MetaFacebookAdapter extends BaseProviderAdapter {
  providerKey: SocialProviderKey = 'META_FACEBOOK';

  getAuthUrl(config: ProviderAdapterConfig, state: string): string {
    const apiVersion = config.apiVersion || 'v21.0';
    const baseUrl = `https://www.facebook.com/${apiVersion}/dialog/oauth`;
    const params = new URLSearchParams({
      client_id: config.appId || '',
      redirect_uri: config.callbackUrl || '',
      state,
      scope: (config.scopes || ['pages_read_engagement', 'pages_show_list', 'public_profile']).join(','),
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
      throw new Error(`Facebook OAuth token exchange failed: ${errJson.error?.message || tokenRes.statusText}`);
    }
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const meRes = await fetch(`https://graph.facebook.com/${apiVersion}/me/accounts?access_token=${accessToken}`);
    const meData = await meRes.json();
    const page = meData.data?.[0] || { id: 'fb_page_default', name: 'E3 Qatar Official' };

    return {
      accessToken: page.access_token || accessToken,
      refreshToken: accessToken,
      expiresIn: tokenData.expires_in || 5184000,
      providerAccountId: page.id,
      username: page.name ? page.name.toLowerCase().replace(/\s+/g, '') : 'e3qatar',
      displayName: page.name || 'E3 Qatar Facebook Page',
      profileImageUrl: `https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&auto=format&fit=crop`,
      grantedScopes: config.scopes || ['pages_read_engagement'],
    };
  }

  async fetchPosts(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string },
    options?: { cursor?: string; limit?: number }
  ): Promise<FetchPostsResult> {
    const apiVersion = config.apiVersion || 'v21.0';
    const limit = options?.limit || 10;
    const fields = 'id,message,created_time,full_picture,permalink_url,shares,reactions.summary(true),comments.summary(true)';
    
    try {
      const apiUrl = `https://graph.facebook.com/${apiVersion}/${account.providerAccountId}/posts?fields=${fields}&limit=${limit}&access_token=${account.accessToken}`;
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error(`Facebook Graph API error: ${res.statusText}`);
      }

      const json = await res.json();
      const rawPosts = json.data || [];

      const posts: NormalizedSocialPostInput[] = rawPosts.map((item: any) => ({
        provider: 'META_FACEBOOK',
        providerPostId: item.id,
        accountId: account.providerAccountId,
        originalUrl: item.permalink_url || `https://facebook.com/${item.id}`,
        authorName: 'E3 Qatar',
        authorUsername: 'e3qatar',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&auto=format&fit=crop',
        captionEn: item.message || '',
        rawCaption: item.message || '',
        mediaType: 'IMAGE',
        mediaUrl: item.full_picture || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: item.full_picture || '',
        publishedAt: new Date(item.created_time || Date.now()),
        likeCount: item.reactions?.summary?.total_count || 0,
        commentCount: item.comments?.summary?.total_count || 0,
        shareCount: item.shares?.count || 0,
        platformMetadata: { id: item.id },
      }));

      return {
        posts,
        nextCursor: json.paging?.cursors?.after,
        hasMore: Boolean(json.paging?.next),
      };
    } catch (err: any) {
      console.warn('[META_FACEBOOK_FETCH_WARN]', err.message);
      return { posts: [], hasMore: false };
    }
  }

  async testConnection(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string }
  ) {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${account.providerAccountId}?fields=id,name&access_token=${account.accessToken}`);
      if (res.ok) {
        const data = await res.json();
        return { ok: true, message: `Connected cleanly to Facebook Page "${data.name || account.providerAccountId}"` };
      }
      return { ok: false, message: `Facebook Page token validation failed (${res.status})` };
    } catch (err: any) {
      return { ok: false, message: err.message || 'Facebook API connection failed' };
    }
  }
}
