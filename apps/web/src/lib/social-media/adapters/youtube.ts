import { BaseProviderAdapter } from './base';
import { FetchPostsResult, NormalizedSocialPostInput, ProviderAdapterConfig, SocialProviderKey } from '../types';

export class YouTubeAdapter extends BaseProviderAdapter {
  providerKey: SocialProviderKey = 'YOUTUBE';

  getAuthUrl(config: ProviderAdapterConfig, state: string): string {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: config.appId || '',
      redirect_uri: config.callbackUrl || '',
      response_type: 'code',
      scope: (config.scopes || ['https://www.googleapis.com/auth/youtube.readonly']).join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(
    config: ProviderAdapterConfig,
    code: string,
    redirectUri: string
  ) {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const bodyParams = new URLSearchParams({
      code,
      client_id: config.appId || '',
      client_secret: config.appSecret || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      throw new Error(`YouTube OAuth exchange failed: ${res.statusText}`);
    }

    const tokenData = await res.json();
    const accessToken = tokenData.access_token;

    // Retrieve YouTube channel identity
    const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const channelJson = await channelRes.json();
    const channel = channelJson.items?.[0] || { id: 'youtube_channel_default', snippet: { title: 'E3 Qatar Official', customUrl: 'e3qatar' } };

    return {
      accessToken,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      providerAccountId: channel.id,
      username: channel.snippet?.customUrl || 'e3qatar',
      displayName: channel.snippet?.title || 'E3 Qatar YouTube Channel',
      profileImageUrl: channel.snippet?.thumbnails?.default?.url || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop',
      grantedScopes: config.scopes || ['https://www.googleapis.com/auth/youtube.readonly'],
    };
  }

  async refreshToken(
    config: ProviderAdapterConfig,
    currentRefreshToken: string
  ) {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const bodyParams = new URLSearchParams({
      client_id: config.appId || '',
      client_secret: config.appSecret || '',
      refresh_token: currentRefreshToken,
      grant_type: 'refresh_token',
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      throw new Error(`YouTube token refresh failed: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || currentRefreshToken,
      expiresIn: data.expires_in,
    };
  }

  async fetchPosts(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string },
    options?: { cursor?: string; limit?: number }
  ): Promise<FetchPostsResult> {
    const limit = options?.limit || 10;
    try {
      const apiKeyQuery = config.apiKey ? `&key=${config.apiKey}` : '';
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${account.providerAccountId}&order=date&type=video&maxResults=${limit}${options?.cursor ? `&pageToken=${options.cursor}` : ''}${apiKeyQuery}`;
      
      const res = await fetch(url, {
        headers: account.accessToken ? { Authorization: `Bearer ${account.accessToken}` } : {},
      });

      if (!res.ok) {
        throw new Error(`YouTube Search API failed: ${res.statusText}`);
      }

      const json = await res.json();
      const items = json.items || [];

      const posts: NormalizedSocialPostInput[] = items.map((item: any) => ({
        provider: 'YOUTUBE',
        providerPostId: item.id?.videoId || item.id,
        accountId: account.providerAccountId,
        originalUrl: `https://www.youtube.com/watch?v=${item.id?.videoId || item.id}`,
        authorName: item.snippet?.channelTitle || 'E3 Qatar',
        authorUsername: 'e3qatar',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&auto=format&fit=crop',
        captionEn: item.snippet?.title || '',
        rawCaption: `${item.snippet?.title || ''}\n\n${item.snippet?.description || ''}`,
        mediaType: 'VIDEO',
        mediaUrl: `https://www.youtube.com/watch?v=${item.id?.videoId || item.id}`,
        thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
        publishedAt: new Date(item.snippet?.publishedAt || Date.now()),
      }));

      return {
        posts,
        nextCursor: json.nextPageToken,
        hasMore: Boolean(json.nextPageToken),
      };
    } catch (err: any) {
      console.warn('[YOUTUBE_FETCH_WARN]', err.message);
      return { posts: [], hasMore: false };
    }
  }

  async testConnection(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string }
  ) {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id,snippet&id=${account.providerAccountId}`, {
        headers: account.accessToken ? { Authorization: `Bearer ${account.accessToken}` } : {},
      });
      if (res.ok) {
        return { ok: true, message: 'Connected cleanly to YouTube Data API' };
      }
      return { ok: false, message: `YouTube API validation failed (${res.status})` };
    } catch (err: any) {
      return { ok: false, message: err.message || 'YouTube API connection failed' };
    }
  }
}
