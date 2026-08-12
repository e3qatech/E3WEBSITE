import { BaseProviderAdapter } from './base';
import { FetchPostsResult, NormalizedSocialPostInput, ProviderAdapterConfig, SocialProviderKey } from '../types';

export class ManualPostAdapter extends BaseProviderAdapter {
  providerKey: SocialProviderKey = 'MANUAL';

  getAuthUrl(): string {
    return '';
  }

  async handleCallback() {
    return {
      accessToken: 'manual_token',
      providerAccountId: 'manual_account',
      username: 'e3_manual',
      displayName: 'E3 Manual Social Posts',
    };
  }

  async fetchPosts(): Promise<FetchPostsResult> {
    return { posts: [], hasMore: false };
  }

  async testConnection() {
    return { ok: true, message: 'Manual Posts Engine is active and operational' };
  }

  /**
   * Extract social post details from a public URL using oEmbed or pattern matching
   */
  async fetchPostByUrl(url: string): Promise<NormalizedSocialPostInput> {
    const cleanUrl = url.trim();
    let provider: SocialProviderKey = 'MANUAL';
    let providerPostId = `manual-${Date.now()}`;
    let authorName = 'E3 Qatar';
    let authorUsername = 'e3qatar';
    let captionEn = '';
    let mediaUrl = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop';
    let thumbnailUrl = '';
    let mediaType: NormalizedSocialPostInput['mediaType'] = 'IMAGE';

    // Pattern matching
    if (cleanUrl.includes('instagram.com/')) {
      provider = 'META_INSTAGRAM';
      const match = cleanUrl.match(/\/p\/([^/?#]+)/) || cleanUrl.match(/\/reel\/([^/?#]+)/);
      if (match) providerPostId = match[1];
      authorUsername = 'instagram_post';
      captionEn = 'E3 Qatar Instagram Highlight';
      mediaUrl = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop';
      mediaType = cleanUrl.includes('/reel/') ? 'REEL' : 'IMAGE';
    } else if (cleanUrl.includes('facebook.com/')) {
      provider = 'META_FACEBOOK';
      authorUsername = 'facebook_post';
      captionEn = 'E3 Qatar Facebook Event Update';
      mediaUrl = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop';
    } else if (cleanUrl.includes('tiktok.com/')) {
      provider = 'TIKTOK';
      authorUsername = 'tiktok_creator';
      captionEn = 'E3 Qatar Viral Moment on TikTok';
      mediaType = 'REEL';
      mediaUrl = 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1200&auto=format&fit=crop';
    } else if (cleanUrl.includes('youtube.com/') || cleanUrl.includes('youtu.be/')) {
      provider = 'YOUTUBE';
      const match = cleanUrl.match(/v=([^&]+)/) || cleanUrl.match(/youtu\.be\/([^/?#]+)/);
      if (match) providerPostId = match[1];
      authorUsername = 'youtube_video';
      captionEn = 'E3 Qatar Destination Video Showcase';
      mediaType = 'VIDEO';
      mediaUrl = cleanUrl;
      thumbnailUrl = `https://img.youtube.com/vi/${providerPostId}/hqdefault.jpg`;
    } else if (cleanUrl.includes('linkedin.com/')) {
      provider = 'LINKEDIN';
      authorUsername = 'linkedin_update';
      captionEn = 'E3 Qatar Corporate & Industry Update';
      mediaType = 'TEXT';
      mediaUrl = 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?q=80&w=1200&auto=format&fit=crop';
    }

    // Attempt oEmbed fetching where possible
    try {
      if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          captionEn = oembedData.title || captionEn;
          authorName = oembedData.author_name || authorName;
          thumbnailUrl = oembedData.thumbnail_url || thumbnailUrl;
        }
      }
    } catch (_e) {}

    return {
      provider,
      providerPostId,
      originalUrl: cleanUrl,
      authorName,
      authorUsername,
      authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      captionEn,
      rawCaption: captionEn,
      mediaType,
      mediaUrl,
      thumbnailUrl: thumbnailUrl || mediaUrl,
      publishedAt: new Date(),
    };
  }
}
