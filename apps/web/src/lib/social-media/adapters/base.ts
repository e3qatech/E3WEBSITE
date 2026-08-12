import { FetchPostsResult, NormalizedSocialPostInput, ProviderAdapterConfig, SocialProviderKey } from '../types';

export abstract class BaseProviderAdapter {
  abstract providerKey: SocialProviderKey;

  abstract getAuthUrl(config: ProviderAdapterConfig, state: string): string;

  abstract handleCallback(
    config: ProviderAdapterConfig,
    code: string,
    redirectUri: string
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    providerAccountId: string;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
    grantedScopes?: string[];
  }>;

  async refreshToken?(
    config: ProviderAdapterConfig,
    currentRefreshToken: string
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }> {
    throw new Error(`Token refresh not implemented for ${this.providerKey}`);
  }

  abstract fetchPosts(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string },
    options?: { cursor?: string; limit?: number }
  ): Promise<FetchPostsResult>;

  abstract testConnection(
    config: ProviderAdapterConfig,
    account: { providerAccountId: string; accessToken: string }
  ): Promise<{ ok: boolean; message: string; details?: any }>;
}
