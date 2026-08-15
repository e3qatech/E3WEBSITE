import 'server-only';
/**
 * Server-Only Settings Management & Protected Secret Resolver.
 * Strictly protected with 'server-only'. Never importable by client components.
 */
import db from '@/lib/db';
import { redis } from '@/lib/redis';
import { revalidatePath, revalidateTag } from 'next/cache';

export * from './public-settings-dto';
import {
  PublicSiteSettings,
  PUBLIC_SETTINGS_KEYS,
  BOOKINGQUBE_CANONICAL_KEY,
  BOOKINGQUBE_LEGACY_KEY_ALIASES,
  MASKED_SECRET_PLACEHOLDER,
  isSensitiveKey,
  resolvePublicSiteSettings,
} from './public-settings-dto';

/**
 * Server loader for public site settings.
 * Returns only the allowlisted PublicSiteSettings DTO for server layout & client component usage.
 */
export async function getPublicSettingsServer(): Promise<PublicSiteSettings> {
  try {
    const settingModel = (db as any).siteSettings || (db as any).setting;
    if (!settingModel) {
      return resolvePublicSiteSettings({});
    }

    const records = await settingModel.findMany({
      where: {
        key: {
          in: Array.from(PUBLIC_SETTINGS_KEYS),
        },
      },
    });

    return resolvePublicSiteSettings(records || []);
  } catch (error) {
    console.error('[SETTINGS_SERVER_LOADER_ERROR]', error);
    return resolvePublicSiteSettings({});
  }
}

/**
 * Transforms settings records for authorized manager views.
 * - Replaces any sensitive secret value with masked placeholder (••••••••••••••••) and presence metadata.
 * - Collapses legacy and canonical BookingQube aliases into one canonical masked entry.
 * - Real credentials are NEVER transmitted to the browser.
 */
export function getMaskedAdminSettings(
  settingsRecords: Array<{ key: string; value: any; updatedAt?: any }>
): Record<string, any> {
  const result: Record<string, any> = {};

  const bqAliasesSet = new Set<string>([
    BOOKINGQUBE_CANONICAL_KEY,
    ...BOOKINGQUBE_LEGACY_KEY_ALIASES,
  ]);

  let bqConfigured = false;

  for (const record of settingsRecords) {
    if (!record || !record.key) continue;

    // Check for BookingQube representation
    if (bqAliasesSet.has(record.key)) {
      if (record.value && typeof record.value === 'string' && record.value.trim().length > 0) {
        bqConfigured = true;
      }
      continue; // Skip individual alias registration to collapse into canonical entry
    }

    const isSecret = isSensitiveKey(record.key);

    if (isSecret) {
      const hasVal = Boolean(record.value && typeof record.value === 'string' && record.value.trim().length > 0);
      result[record.key] = hasVal ? MASKED_SECRET_PLACEHOLDER : '';
      result[`has_${record.key}`] = hasVal;
      result[`${record.key}_isConfigured`] = hasVal;
    } else {
      result[record.key] = record.value ?? '';
    }
  }

  // Canonical collapsed BookingQube manager presence
  result[BOOKINGQUBE_CANONICAL_KEY] = bqConfigured ? MASKED_SECRET_PLACEHOLDER : '';
  result[`has_${BOOKINGQUBE_CANONICAL_KEY}`] = bqConfigured;
  result[`${BOOKINGQUBE_CANONICAL_KEY}_isConfigured`] = bqConfigured;

  return result;
}

/**
 * Server-only secret reader for protected background workers, webhooks, and integrations.
 * Strictly reads from server database or environment variables. Never callable from client components.
 */
export async function getServerSecretSetting(key: string): Promise<string | null> {
  const settingModel = (db as any).siteSettings || (db as any).setting;

  // 1. BookingQube Credential Resolution with Canonical Fallback to Legacy Aliases
  if (key === BOOKINGQUBE_CANONICAL_KEY || (BOOKINGQUBE_LEGACY_KEY_ALIASES as readonly string[]).includes(key as any)) {
    try {
      if (settingModel) {
        // A. Primary check: canonical key
        const canonicalRecord = await settingModel.findUnique({
          where: { key: BOOKINGQUBE_CANONICAL_KEY },
        });
        if (canonicalRecord?.value && typeof canonicalRecord.value === 'string' && canonicalRecord.value.trim().length > 0) {
          return canonicalRecord.value.trim();
        }

        // B. Deterministic fallback to legacy aliases in stored order
        for (const alias of BOOKINGQUBE_LEGACY_KEY_ALIASES) {
          const aliasRecord = await settingModel.findUnique({
            where: { key: alias },
          });
          if (aliasRecord?.value && typeof aliasRecord.value === 'string' && aliasRecord.value.trim().length > 0) {
            return aliasRecord.value.trim();
          }
        }
      }
    } catch (err) {
      console.error(`[SERVER_SECRET_READ_ERROR] Failed to query BookingQube credential from database:`, err);
    }

    // C. Environment variable fallback
    return process.env.BOOKINGQUBE_API_KEY || process.env.BOOKING_QUBE_API_KEY || null;
  }

  // 2. Generic Secret Resolution
  try {
    if (settingModel) {
      const record = await settingModel.findUnique({
        where: { key },
      });
      if (record?.value && typeof record.value === 'string' && record.value.trim().length > 0) {
        return record.value.trim();
      }
    }
  } catch (err) {
    console.error(`[SERVER_SECRET_READ_ERROR] Failed to read secret for key "${key}":`, err);
  }

  // Fallback to environment variables if applicable
  if (key === 'mapsApiKey' || key === 'googleMapsApiKey') {
    return process.env.MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || null;
  }
  if (key === 'emailGatewayKey' || key === 'sendgridApiKey' || key === 'resendApiKey') {
    return process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || null;
  }
  if (key === 'bookingqubeWebhookSecret' || key === 'webhookSecret') {
    return process.env.BOOKINGQUBE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || null;
  }
  if (key === 'stripeSecretKey') {
    return process.env.STRIPE_SECRET_KEY || null;
  }

  return null;
}

/**
 * Revalidates and clears settings caches across Redis and Next.js ISR.
 */
export async function revalidateSettingsCache(): Promise<void> {
  try {
    await redis.del('public_settings');
    await redis.del('settings:GENERAL');
    await redis.del('settings:type:GENERAL');
    await redis.del('settings:type:INTEGRATION');
    await redis.del('settings:type:UI');
    await redis.del('settings:type:SEO');
  } catch (_e) {
    // Redis mock or offline fallback
  }

  try {
    (revalidateTag as any)('site-settings');
    revalidatePath('/', 'layout');
    revalidatePath('/[locale]', 'layout');
    revalidatePath('/[locale]/b2b', 'layout');
    revalidatePath('/[locale]/b2c', 'layout');
  } catch (_e) {
    // Safe fallback if called outside Next.js request context
  }
}
