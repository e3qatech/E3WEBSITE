import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getMasterKey(): Buffer {
  const secretKey =
    process.env.SOCIAL_CREDENTIALS_ENCRYPTION_KEY ||
    process.env.NEXTAUTH_SECRET ||
    'e3-qatar-social-media-master-encryption-key-32-chars';
  
  return crypto.createHash('sha256').update(secretKey).digest();
}

/**
 * Encrypt sensitive plain text using AES-256-GCM
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  try {
    const key = getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('[SOCIAL_ENCRYPTION_ERROR]', err);
    throw new Error('Failed to encrypt secret key.');
  }
}

/**
 * Decrypt AES-256-GCM encrypted string
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText) return '';
  if (!cipherText.includes(':')) return cipherText; // Return plain string if not formatted as iv:tag:encrypted

  try {
    const key = getMasterKey();
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText;

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('[SOCIAL_DECRYPTION_ERROR]', err);
    return '';
  }
}

/**
 * Mask secret string for admin display (e.g. ••••••••••••a1b2)
 */
export function maskSecret(secret: string): string {
  if (!secret) return '';
  const plain = secret.includes(':') ? decryptSecret(secret) : secret;
  if (!plain) return '';
  if (plain.length <= 4) return '••••';
  const suffix = plain.slice(-4);
  return `••••••••••••${suffix}`;
}

/**
 * Helper to check if string is a masked placeholder
 */
export function isMaskedString(value: string): boolean {
  if (!value) return false;
  return value.includes('••••');
}
