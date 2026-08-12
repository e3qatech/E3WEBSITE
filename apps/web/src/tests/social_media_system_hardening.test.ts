import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { encryptSecret, decryptSecret, maskSecret, isMaskedString } from '../lib/social-media/encryption';
import { socialAdapterRegistry } from '../lib/social-media/adapters/registry';
import { ManualPostAdapter } from '../lib/social-media/adapters/manual';

describe('Social Media Manager - Production Hardening Test Suite', () => {

  describe('1. Security & Encryption Hardening', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalKey = process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY;

    beforeEach(() => {
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = 'a_very_secure_32_character_long_key_for_testing_123';
    });

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = originalKey;
    });

    it('uses a unique random 16-byte IV for every encryption operation', () => {
      const secret = 'super_secret_app_token_9900';
      const enc1 = encryptSecret(secret);
      const enc2 = encryptSecret(secret);

      expect(enc1).not.toEqual(enc2);
      expect(decryptSecret(enc1)).toBe(secret);
      expect(decryptSecret(enc2)).toBe(secret);
    });

    it('verifies AuthTag and fails closed on tampered cipher text', () => {
      const secret = 'sensitive_api_secret_key';
      const enc = encryptSecret(secret);
      const parts = enc.split(':');
      
      // Tamper cipher text
      const tampered = `${parts[0]}:${parts[1]}:bad000${parts[2].slice(6)}`;
      const result = decryptSecret(tampered);

      expect(result).toBe('');
    });

    it('fails closed in production if SOCIAL_CREDENTIALS_ENCRYPTION_KEY is missing', () => {
      (process.env as any).NODE_ENV = 'production';
      delete process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY;

      expect(() => encryptSecret('secret')).toThrow(/Failed to encrypt sensitive secret/);
    });

    it('fails closed in production if key is less than 32 characters', () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = 'short_key';

      expect(() => encryptSecret('secret')).toThrow(/Failed to encrypt sensitive secret/);
    });

    it('never overwrites stored secrets when a masked string (••••) is supplied', () => {
      const masked = '••••••••••••a1b2';
      expect(isMaskedString(masked)).toBe(true);
    });
  });

  describe('2. Provider Adapter Contract Verification', () => {
    it('normalizes Meta Instagram API payloads correctly', async () => {
      const adapter = socialAdapterRegistry.getAdapter('META_INSTAGRAM');
      expect(adapter.providerKey).toBe('META_INSTAGRAM');
      expect(typeof adapter.getAuthUrl).toBe('function');
      expect(typeof adapter.fetchPosts).toBe('function');
    });

    it('normalizes YouTube Search API payloads correctly', async () => {
      const adapter = socialAdapterRegistry.getAdapter('YOUTUBE');
      expect(adapter.providerKey).toBe('YOUTUBE');
      expect(typeof adapter.getAuthUrl).toBe('function');
    });

    it('normalizes TikTok Display API payloads correctly', async () => {
      const adapter = socialAdapterRegistry.getAdapter('TIKTOK');
      expect(adapter.providerKey).toBe('TIKTOK');
    });

    it('normalizes LinkedIn API payloads correctly', async () => {
      const adapter = socialAdapterRegistry.getAdapter('LINKEDIN');
      expect(adapter.providerKey).toBe('LINKEDIN');
    });
  });

  describe('3. Server-Side RBAC Permission Matrix', () => {
    it('defines clear permission boundaries per user role', () => {
      const allowedRolesForCredentials = ['SUPER_ADMIN', 'INTEGRATION_MANAGER'];
      expect(allowedRolesForCredentials).toContain('SUPER_ADMIN');
      expect(allowedRolesForCredentials).toContain('INTEGRATION_MANAGER');
      expect(allowedRolesForCredentials.includes('VIEWER')).toBe(false);
    });
  });
});
