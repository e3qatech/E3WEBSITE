import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { encryptSecret, decryptSecret, maskSecret, isMaskedString } from '../lib/social-media/encryption';
import { socialAdapterRegistry } from '../lib/social-media/adapters/registry';
import { ManualPostAdapter } from '../lib/social-media/adapters/manual';

// Valid 64-hex AES-256 key required by hardened encryption module
const TEST_KEY = 'a'.repeat(64);

describe('Social Media Manager - System Tests', () => {

  describe('Encryption & Secret Masking Security', () => {
    let prevKey: string | undefined;
    beforeAll(() => {
      prevKey = process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY;
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = TEST_KEY;
    });
    afterAll(() => {
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = prevKey;
    });

    it('encrypts and decrypts secrets using AES-256-GCM', () => {
      const plainSecret = 'meta_app_secret_abc123987';
      const encrypted = encryptSecret(plainSecret);

      expect(encrypted).not.toBe(plainSecret);
      expect(encrypted).toContain(':');

      const decrypted = decryptSecret(encrypted);
      expect(decrypted).toBe(plainSecret);
    });

    it('masks secrets cleanly for admin UI presentation', () => {
      const plainSecret = 'secret_key_998877665544';
      const masked = maskSecret(plainSecret);

      expect(masked).toContain('••••••••••••');
      expect(masked.endsWith('5544')).toBe(true);
      expect(isMaskedString(masked)).toBe(true);
    });

    it('handles empty or null secrets gracefully', () => {
      expect(encryptSecret('')).toBe('');
      expect(decryptSecret('')).toBe('');
      expect(maskSecret('')).toBe('');
    });
  });

  describe('Provider Adapter Registry & Manual Fetcher', () => {
    it('registers all required social provider adapters', () => {
      const adapters = socialAdapterRegistry.getAllAdapters();
      const keys = adapters.map(a => a.providerKey);

      expect(keys).toContain('META_INSTAGRAM');
      expect(keys).toContain('META_FACEBOOK');
      expect(keys).toContain('TIKTOK');
      expect(keys).toContain('YOUTUBE');
      expect(keys).toContain('LINKEDIN');
      expect(keys).toContain('MANUAL');
    });

    it('parses public Instagram post URLs using ManualPostAdapter', async () => {
      const manualAdapter = new ManualPostAdapter();
      const testUrl = 'https://www.instagram.com/p/C123456789/';

      const result = await manualAdapter.fetchPostByUrl(testUrl);

      expect(result.provider).toBe('META_INSTAGRAM');
      expect(result.providerPostId).toBe('C123456789');
      expect(result.originalUrl).toBe(testUrl);
      expect(result.mediaType).toBe('IMAGE');
    });

    it('parses public YouTube video URLs using ManualPostAdapter', async () => {
      const manualAdapter = new ManualPostAdapter();
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const result = await manualAdapter.fetchPostByUrl(testUrl);

      expect(result.provider).toBe('YOUTUBE');
      expect(result.providerPostId).toBe('dQw4w9WgXcQ');
      expect(result.mediaType).toBe('VIDEO');
      expect(result.thumbnailUrl).toContain('dQw4w9WgXcQ');
    });

    it('parses public TikTok video URLs using ManualPostAdapter', async () => {
      const manualAdapter = new ManualPostAdapter();
      const testUrl = 'https://www.tiktok.com/@e3qatar/video/71234567890';

      const result = await manualAdapter.fetchPostByUrl(testUrl);

      expect(result.provider).toBe('TIKTOK');
      expect(result.mediaType).toBe('REEL');
    });
  });
});
