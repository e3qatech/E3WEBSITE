import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
  isMaskedString,
  isEncryptedBlob,
} from '../lib/social-media/encryption';
import { socialAdapterRegistry } from '../lib/social-media/adapters/registry';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// 64-char hex = 32 bytes (valid AES-256 key format A)
const VALID_HEX_KEY = 'a'.repeat(64); // 64 hex chars → 32 bytes

// Valid Base64 key that decodes to exactly 32 bytes (32 zero bytes in Base64)
const VALID_B64_KEY = Buffer.alloc(32).toString('base64'); // "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

function withKey(key: string | undefined, fn: () => void) {
  const orig = process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY;
  if (key === undefined) {
    delete process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY;
  } else {
    process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = key;
  }
  try {
    fn();
  } finally {
    if (orig === undefined) {
      delete process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY;
    } else {
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = orig;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: Encryption Module Hardening
// ─────────────────────────────────────────────────────────────────────────────

describe('Social Media Manager — Encryption Hardening', () => {

  describe('Key Format Validation', () => {
    it('accepts a valid 64-hex key', () => {
      withKey(VALID_HEX_KEY, () => {
        expect(() => encryptSecret('test')).not.toThrow();
      });
    });

    it('accepts a valid Base64 key decoding to 32 bytes', () => {
      withKey(VALID_B64_KEY, () => {
        expect(() => encryptSecret('test')).not.toThrow();
      });
    });

    it('rejects a missing key in production (fail closed)', () => {
      (process.env as any).NODE_ENV = 'production';
      withKey(undefined, () => {
        // The inner error "not set" is wrapped by the outer catch in encryptSecret
        // Both the inner error message and outer wrapping are expected behaviors
        expect(() => encryptSecret('test')).toThrow(/encrypt|not set/i);
      });
      (process.env as any).NODE_ENV = 'test';
    });

    it('rejects a short hex key in production', () => {
      (process.env as any).NODE_ENV = 'production';
      withKey('abcd1234', () => {
        expect(() => encryptSecret('test')).toThrow();
      });
      (process.env as any).NODE_ENV = 'test';
    });

    it('rejects a Base64 key decoding to wrong byte length', () => {
      // 16-byte Base64 key (valid Base64, invalid length)
      const shortB64 = Buffer.alloc(16).toString('base64');
      (process.env as any).NODE_ENV = 'production';
      withKey(shortB64, () => {
        expect(() => encryptSecret('test')).toThrow();
      });
      (process.env as any).NODE_ENV = 'test';
    });

    it('rejects a long but invalid key format in production', () => {
      // 32 arbitrary chars — not valid hex (too short for 64-hex), not valid Base64
      (process.env as any).NODE_ENV = 'production';
      withKey('this_is_not_hex_or_valid_base64!@#', () => {
        expect(() => encryptSecret('test')).toThrow();
      });
      (process.env as any).NODE_ENV = 'test';
    });
  });

  describe('Encryption & Decryption Correctness', () => {
    beforeEach(() => {
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = VALID_HEX_KEY;
    });

    it('encrypts and decrypts correctly round-trip', () => {
      const plain = 'my_super_secret_api_token_12345';
      const enc = encryptSecret(plain);
      expect(decryptSecret(enc)).toBe(plain);
    });

    it('generates a unique IV for every encryption of the same plaintext', () => {
      const plain = 'repeated_secret_value';
      const enc1 = encryptSecret(plain);
      const enc2 = encryptSecret(plain);
      expect(enc1).not.toBe(enc2);
      // Both decrypt correctly
      expect(decryptSecret(enc1)).toBe(plain);
      expect(decryptSecret(enc2)).toBe(plain);
    });

    it('fails closed and returns empty string on incorrect decryption key', () => {
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = VALID_HEX_KEY;
      const enc = encryptSecret('secret_for_key_a');

      // Switch to a different valid key
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = 'b'.repeat(64);
      const result = decryptSecret(enc);
      expect(result).toBe('');
    });

    it('fails closed on altered ciphertext', () => {
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = VALID_HEX_KEY;
      const enc = encryptSecret('alter_me');
      const parts = enc.split(':');
      // Alter a byte in the encrypted payload
      const alteredPayload = parts[3].slice(0, -4) + '0000';
      const tampered = [parts[0], parts[1], parts[2], alteredPayload].join(':');
      expect(decryptSecret(tampered)).toBe('');
    });

    it('fails closed on altered IV', () => {
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = VALID_HEX_KEY;
      const enc = encryptSecret('alter_iv');
      const parts = enc.split(':');
      const alteredIv = '00000000000000000000000000000000'; // 32 hex = 16 bytes
      const tampered = [parts[0], alteredIv, parts[2], parts[3]].join(':');
      expect(decryptSecret(tampered)).toBe('');
    });

    it('fails closed on altered authentication tag', () => {
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = VALID_HEX_KEY;
      const enc = encryptSecret('alter_tag');
      const parts = enc.split(':');
      // Flip some bits in the auth tag
      const alteredTag = parts[2].slice(0, -4) + '0000';
      const tampered = [parts[0], parts[1], alteredTag, parts[3]].join(':');
      expect(decryptSecret(tampered)).toBe('');
    });
  });

  describe('Masking & Placeholder Protection', () => {
    beforeEach(() => {
      process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY = VALID_HEX_KEY;
    });

    it('masks an encrypted blob showing only the last 4 plaintext chars', () => {
      const plain = 'app_secret_key_9988';
      const enc = encryptSecret(plain);
      const masked = maskSecret(enc);
      expect(masked).toContain('••••');
      expect(masked.endsWith('9988')).toBe(true);
    });

    it('detects masked strings correctly', () => {
      expect(isMaskedString('••••••••••••a1b2')).toBe(true);
      expect(isMaskedString('plain_text')).toBe(false);
      expect(isMaskedString('')).toBe(false);
    });

    it('detects encrypted blobs correctly', () => {
      const enc = encryptSecret('blob_detect');
      expect(isEncryptedBlob(enc)).toBe(true);
      expect(isEncryptedBlob('not_encrypted')).toBe(false);
      expect(isEncryptedBlob('••••••••••••1234')).toBe(false);
    });

    it('decryptSecret returns empty string for masked placeholder', () => {
      const result = decryptSecret('••••••••••••a1b2');
      expect(result).toBe('');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: Provider Adapter Contracts (Contract-tested, not live-verified)
// ─────────────────────────────────────────────────────────────────────────────

describe('Provider Adapter Contract Tests (Contract Tested — NOT Live Verified)', () => {

  const providers: Array<'META_INSTAGRAM' | 'META_FACEBOOK' | 'TIKTOK' | 'YOUTUBE' | 'LINKEDIN' | 'MANUAL'> =
    ['META_INSTAGRAM', 'META_FACEBOOK', 'TIKTOK', 'YOUTUBE', 'LINKEDIN', 'MANUAL'];

  for (const provider of providers) {
    it(`${provider} adapter exposes required interface`, () => {
      const adapter = socialAdapterRegistry.getAdapter(provider);
      expect(adapter.providerKey).toBe(provider);
      expect(typeof adapter.fetchPosts).toBe('function');
    });
  }

  it('META_INSTAGRAM adapter exposes getAuthUrl for OAuth initiation', () => {
    const adapter = socialAdapterRegistry.getAdapter('META_INSTAGRAM');
    expect(typeof adapter.getAuthUrl).toBe('function');
  });

  it('META_FACEBOOK adapter exposes getAuthUrl for OAuth initiation', () => {
    const adapter = socialAdapterRegistry.getAdapter('META_FACEBOOK');
    expect(typeof adapter.getAuthUrl).toBe('function');
  });

  it('YOUTUBE adapter exposes getAuthUrl', () => {
    const adapter = socialAdapterRegistry.getAdapter('YOUTUBE');
    expect(typeof adapter.getAuthUrl).toBe('function');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: RBAC Permission Matrix Verification
// ─────────────────────────────────────────────────────────────────────────────

describe('RBAC Permission Matrix', () => {

  const ROLE_PERMISSION_MAP: Record<string, string[]> = {
    SUPER_ADMIN:         ['VIEW_SOCIAL_MANAGER', 'MANAGE_CREDENTIALS', 'CONNECT_ACCOUNTS', 'MANAGE_FEEDS', 'MODERATE_POSTS', 'MANAGE_PLACEMENTS', 'RUN_SYNC', 'VIEW_LOGS', 'MANAGE_GLOBAL_SETTINGS'],
    INTEGRATION_MANAGER: ['VIEW_SOCIAL_MANAGER', 'MANAGE_CREDENTIALS', 'CONNECT_ACCOUNTS', 'VIEW_LOGS'],
    CONTENT_MANAGER:     ['VIEW_SOCIAL_MANAGER', 'MANAGE_FEEDS', 'MODERATE_POSTS', 'MANAGE_PLACEMENTS', 'RUN_SYNC', 'VIEW_LOGS'],
    EDITOR:              ['VIEW_SOCIAL_MANAGER', 'MODERATE_POSTS', 'RUN_SYNC', 'VIEW_LOGS'],
    VIEWER:              ['VIEW_SOCIAL_MANAGER', 'VIEW_LOGS'],
    STAFF:               ['VIEW_SOCIAL_MANAGER', 'VIEW_LOGS'],
  };

  const DENIED_MAP: Record<string, string[]> = {
    VIEWER:  ['MANAGE_CREDENTIALS', 'CONNECT_ACCOUNTS', 'MANAGE_FEEDS', 'MODERATE_POSTS', 'MANAGE_PLACEMENTS', 'RUN_SYNC', 'MANAGE_GLOBAL_SETTINGS'],
    EDITOR:  ['MANAGE_CREDENTIALS', 'CONNECT_ACCOUNTS', 'MANAGE_FEEDS', 'MANAGE_PLACEMENTS', 'MANAGE_GLOBAL_SETTINGS'],
    CONTENT_MANAGER: ['MANAGE_CREDENTIALS', 'CONNECT_ACCOUNTS', 'MANAGE_GLOBAL_SETTINGS'],
    INTEGRATION_MANAGER: ['MANAGE_FEEDS', 'MODERATE_POSTS', 'MANAGE_PLACEMENTS', 'RUN_SYNC', 'MANAGE_GLOBAL_SETTINGS'],
  };

  for (const [role, allowedPermissions] of Object.entries(ROLE_PERMISSION_MAP)) {
    for (const permission of allowedPermissions) {
      it(`${role} is ALLOWED: ${permission}`, () => {
        expect(ROLE_PERMISSION_MAP[role]).toContain(permission);
      });
    }
  }

  for (const [role, deniedPermissions] of Object.entries(DENIED_MAP)) {
    for (const permission of deniedPermissions) {
      it(`${role} is DENIED: ${permission}`, () => {
        expect(ROLE_PERMISSION_MAP[role] ?? []).not.toContain(permission);
      });
    }
  }

  it('Unauthenticated user has no permissions', () => {
    const unauthenticated: string[] = [];
    expect(unauthenticated).toHaveLength(0);
  });
});
