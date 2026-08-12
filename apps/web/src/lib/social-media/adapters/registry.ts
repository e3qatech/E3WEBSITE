import { BaseProviderAdapter } from './base';
import { MetaInstagramAdapter } from './meta-instagram';
import { MetaFacebookAdapter } from './meta-facebook';
import { TikTokAdapter } from './tiktok';
import { YouTubeAdapter } from './youtube';
import { LinkedInAdapter } from './linkedin';
import { ManualPostAdapter } from './manual';
import { SocialProviderKey } from '../types';

class SocialAdapterRegistry {
  private adapters: Map<SocialProviderKey, BaseProviderAdapter> = new Map();

  constructor() {
    this.registerAdapter(new MetaInstagramAdapter());
    this.registerAdapter(new MetaFacebookAdapter());
    this.registerAdapter(new TikTokAdapter());
    this.registerAdapter(new YouTubeAdapter());
    this.registerAdapter(new LinkedInAdapter());
    this.registerAdapter(new ManualPostAdapter());
  }

  registerAdapter(adapter: BaseProviderAdapter) {
    this.adapters.set(adapter.providerKey, adapter);
  }

  getAdapter(providerKey: SocialProviderKey): BaseProviderAdapter {
    const adapter = this.adapters.get(providerKey);
    if (!adapter) {
      throw new Error(`No adapter registered for social provider: ${providerKey}`);
    }
    return adapter;
  }

  getAllAdapters(): BaseProviderAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const socialAdapterRegistry = new SocialAdapterRegistry();
