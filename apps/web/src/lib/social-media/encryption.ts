import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;   // 128-bit random IV per encryption operation
const KEY_BYTES = 32;   // AES-256 requires exactly 32 bytes
const SALT_HEADER = '1'; // Version byte for forward migration

/**
 * Derive a 32-byte AES-256 key from the configured master key.
 *
 * Supported formats (strict):
 *   a) Exactly 64 hexadecimal characters → decoded to 32 bytes
 *   b) Valid Base64 string → decoded to exactly 32 bytes
 *
 * Character-count-only validation is intentionally REJECTED.
 * Production fails closed if key is absent, wrong format, or wrong decoded length.
 * Development uses NEXTAUTH_SECRET as a fallback, never silently generated keys.
 */
function getMasterKey(): Buffer {
  const isProd = process.env.NODE_ENV === 'production';
  const rawKey = process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY?.trim();

  const key = rawKey ?? (isProd ? undefined : process.env.NEXTAUTH_SECRET?.trim());

  if (!key) {
    throw new Error(
      'SOCIAL_CREDENTIALS_ENCRYPTION_KEY is not set.' +
      (isProd
        ? ' Production requires a 64-hex or 32-byte Base64 key.'
        : ' Set SOCIAL_CREDENTIALS_ENCRYPTION_KEY or NEXTAUTH_SECRET for development.')
    );
  }

  return decodeKeyToBytes(key, isProd);
}

/**
 * Decode key string to exactly 32 bytes.
 * Accepts 64-hex or valid Base64 → 32 bytes.
 * Throws a clear error for any other format.
 */
function decodeKeyToBytes(raw: string, isProd: boolean): Buffer {
  // Try hex: exactly 64 hex characters → 32 bytes
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    const buf = Buffer.from(raw, 'hex');
    if (buf.byteLength !== KEY_BYTES) {
      throw new Error(`Encryption key hex decodes to ${buf.byteLength} bytes; expected exactly ${KEY_BYTES}.`);
    }
    return buf;
  }

  // Try Base64: must decode to exactly 32 bytes
  const base64Re = /^[A-Za-z0-9+/]+=*$/;
  if (base64Re.test(raw)) {
    const buf = Buffer.from(raw, 'base64');
    if (buf.byteLength === KEY_BYTES) {
      return buf;
    }
    throw new Error(
      `Encryption key Base64 decodes to ${buf.byteLength} bytes; expected exactly ${KEY_BYTES}. ` +
      `Use a 64-hex or 32-byte Base64 key.`
    );
  }

  // In development we allow NEXTAUTH_SECRET (arbitrary string) via SHA-256 derivation
  if (!isProd) {
    return crypto.createHash('sha256').update(raw).digest();
  }

  throw new Error(
    'SOCIAL_CREDENTIALS_ENCRYPTION_KEY must be exactly 64 hexadecimal characters ' +
    'or a valid Base64 string decoding to 32 bytes.'
  );
}

/**
 * Encrypt plainText using AES-256-GCM.
 *
 * Generates a unique cryptographically-random 16-byte IV for every call.
 * Returns: "<version>:<iv_hex>:<authTag_hex>:<cipherText_hex>"
 *
 * Fails closed (throws) on any error.
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  try {
    const key = getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      SALT_HEADER,
      iv.toString('hex'),
      authTag.toString('hex'),
      encrypted.toString('hex'),
    ].join(':');
  } catch (err: any) {
    console.error('[SOCIAL_ENCRYPTION_ERROR]', err.message);
    throw new Error('Failed to encrypt sensitive secret.');
  }
}

/**
 * Decrypt an AES-256-GCM payload produced by encryptSecret.
 *
 * Validates the authentication tag explicitly before returning plaintext.
 * Returns '' on any decryption or tag-verification failure (fails closed).
 * Returns '' for masked placeholder strings.
 * Returns the value unchanged if it is already plain text (legacy unencrypted values).
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText) return '';
  if (isMaskedString(cipherText)) return '';

  const parts = cipherText.split(':');
  // Legacy unencrypted plain-text value
  if (parts.length < 4) return cipherText;

  try {
    const key = getMasterKey();
    const [/* version */, ivHex, authTagHex, encryptedHex] = parts;

    if (!ivHex || !authTagHex || !encryptedHex) return '';

    const iv      = Buffer.from(ivHex,      'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag); // explicit AuthTag verification

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(), // throws if AuthTag is invalid
    ]);
    return decrypted.toString('utf8');
  } catch (err: any) {
    console.error('[SOCIAL_DECRYPTION_ERROR] AuthTag verification or decryption failed:', err.message);
    return '';
  }
}

/**
 * Mask a plain secret (or an encrypted blob) for safe admin display.
 * Format: ••••••••••••<last4 of plaintext>
 * Never call getMasterKey or store the result anywhere sensitive.
 */
export function maskSecret(secret: string): string {
  if (!secret) return '';

  const plain = isEncryptedBlob(secret) ? decryptSecret(secret) : secret;
  if (!plain) return '••••••••••••????'; // decryption failed
  if (plain.length <= 4) return '••••';
  return `••••••••••••${plain.slice(-4)}`;
}

/**
 * Return true when the string is a masked display placeholder.
 * Masked values MUST NEVER overwrite stored encrypted secrets.
 */
export function isMaskedString(value: string): boolean {
  return typeof value === 'string' && value.includes('••••');
}

/**
 * Return true when the value looks like a blob produced by encryptSecret.
 */
export function isEncryptedBlob(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 4 && parts[0] === SALT_HEADER;
}
