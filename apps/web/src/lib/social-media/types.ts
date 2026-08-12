export type SocialProviderKey = 'META_INSTAGRAM' | 'META_FACEBOOK' | 'TIKTOK' | 'YOUTUBE' | 'LINKEDIN' | 'MANUAL';

export type SocialAccountStatus = 'CONNECTED' | 'HEALTHY' | 'EXPIRING_SOON' | 'ACTION_REQUIRED' | 'DISCONNECTED' | 'SYNCING' | 'PAUSED' | 'ERROR';

export type SocialPostMediaType = 'IMAGE' | 'VIDEO' | 'REEL' | 'CAROUSEL' | 'TEXT' | 'LINK';

export type SocialPostStatus = 'PUBLISHED' | 'DRAFT' | 'HIDDEN' | 'ARCHIVED' | 'UNAVAILABLE';

export type SocialModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type SocialFeedMode = 'AUTOMATIC' | 'CURATED' | 'HYBRID';

export type SocialPlacementLocation = 'B2C_HOME_LIVE_SOCIAL' | 'B2B_HOME_CORPORATE' | 'ATTRACTION_PAGE' | 'BRAND_PAGE' | 'CASE_STUDY_PAGE' | 'CUSTOM_PAGE';

export type SocialSyncStatus = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'IN_PROGRESS';

export type SocialAuditAction = 'CREDENTIAL_UPDATE' | 'ACCOUNT_CONNECT' | 'ACCOUNT_DISCONNECT' | 'TOKEN_REFRESH' | 'SYNC_EXECUTE' | 'POST_MODERATE' | 'POST_MUTATE' | 'FEED_UPDATE' | 'PLACEMENT_UPDATE' | 'SETTINGS_UPDATE';

export interface NormalizedSocialPostInput {
  provider: SocialProviderKey;
  providerPostId: string;
  accountId?: string;
  brandId?: string;
  attractionId?: string;
  portal?: 'B2C' | 'B2B' | 'SHARED';
  originalUrl: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  captionEn?: string;
  captionAr?: string;
  rawCaption?: string;
  mediaType: SocialPostMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  aspectRatio?: number;
  width?: number;
  height?: number;
  publishedAt: Date | string;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  platformMetadata?: Record<string, any>;
  carouselMedia?: Array<{
    url: string;
    mediaType: SocialPostMediaType;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
  }>;
}

export interface ProviderAdapterConfig {
  appId?: string;
  appSecret?: string;
  apiKey?: string;
  webhookToken?: string;
  apiVersion?: string;
  authUrl?: string;
  callbackUrl?: string;
  scopes?: string[];
}

export interface FetchPostsResult {
  posts: NormalizedSocialPostInput[];
  nextCursor?: string;
  hasMore?: boolean;
}
