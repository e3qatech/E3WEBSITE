import db from '@/lib/db';
import { redis } from '@/lib/redis';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Public Site Settings DTO Interface.
 * Only presentation-safe, customer-visible fields are permitted.
 * Integration credentials, API keys, passwords, and webhook secrets are strictly prohibited.
 */
export interface PublicSiteSettings {
  siteNameEn: string;
  siteNameAr: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  addressEn: string;
  addressAr: string;
  workingHours: string;
  socialInstagram: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialYoutube: string;
  socialSnapchat: string;
  socialFacebook: string;
  bookingqubeWebsite: string;
  lightLogoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  bookTicketsUrl: string;
  bookTicketsLabelEn: string;
  bookTicketsLabelAr: string;
  bookTicketsEnabled: string;
  bookTicketsExternal: string;
  gatewayB2BDesc?: string;
  gatewayB2BDescAr?: string;
  footerMediaUrl?: string;
  footerMediaType?: string;
  footerPosterUrl?: string;
  footerBackgroundMediaUrl?: string;
  footerBackgroundMediaType?: string;
  footerBackgroundPosterUrl?: string;
  googleAnalyticsId?: string;
  tagManagerId?: string;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescriptionEn?: string;
  metaDescriptionAr?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  colorAccent?: string;
  fontFamily?: string;
  defaultTheme?: string;
  enable3DMap?: boolean;
  enableLiveOccupancy?: boolean;
  enableSocialPreviews?: boolean;
  calendarHeroMediaType?: string;
  calendarHeroMediaUrl?: string;
  [key: string]: any;
}

/**
 * Explicit allowlist of permissible public setting keys.
 * Spreading of unfiltered raw database settings is strictly forbidden.
 */
export const PUBLIC_SETTINGS_KEYS = new Set<string>([
  'siteNameEn',
  'siteNameAr',
  'contactEmail',
  'contactPhone',
  'contactWhatsapp',
  'addressEn',
  'addressAr',
  'workingHours',
  'socialInstagram',
  'socialTwitter',
  'socialLinkedin',
  'socialYoutube',
  'socialSnapchat',
  'socialFacebook',
  'bookingqubeWebsite',
  'lightLogoUrl',
  'darkLogoUrl',
  'faviconUrl',
  'bookTicketsUrl',
  'bookTicketsLabelEn',
  'bookTicketsLabelAr',
  'bookTicketsEnabled',
  'bookTicketsExternal',
  'gatewayB2BDesc',
  'gatewayB2BDescAr',
  'footerMediaUrl',
  'footerMediaType',
  'footerPosterUrl',
  'footerBackgroundMediaUrl',
  'footerBackgroundMediaType',
  'footerBackgroundPosterUrl',
  'googleAnalyticsId',
  'tagManagerId',
  'metaTitleEn',
  'metaTitleAr',
  'metaDescriptionEn',
  'metaDescriptionAr',
  'colorPrimary',
  'colorSecondary',
  'colorAccent',
  'fontFamily',
  'defaultTheme',
  'enable3DMap',
  'enableLiveOccupancy',
  'enableSocialPreviews',
  'calendarHeroMediaType',
  'calendarHeroMediaUrl',
]);

/**
 * Canonical BookingQube Credential Key and Legacy Read-Only Fallback Aliases.
 * Deterministic fallback without copying, rewriting, or duplicating stored database records.
 */
export const BOOKINGQUBE_CANONICAL_KEY = 'bookingQubeApiKey';
export const BOOKINGQUBE_LEGACY_KEY_ALIASES = [
  'BOOKINGQUBE_API_KEY',
  'bookingqube_api_key',
  'bookingqubeApiKey',
  'bookingQubeSecret',
  'bookingqube_secret',
  'bookingqubeSecret',
  'bookingQubeKey',
  'bookingqube_key',
] as const;

/**
 * Known integration and secret keys that must never be exposed publicly.
 */
export const SENSITIVE_SECRET_KEYS = new Set<string>([
  BOOKINGQUBE_CANONICAL_KEY,
  ...BOOKINGQUBE_LEGACY_KEY_ALIASES,
  'mapsApiKey',
  'googleMapsApiKey',
  'emailGatewayKey',
  'sendgridApiKey',
  'resendApiKey',
  'smtpPassword',
  'smtp_password',
  'smtpPass',
  'mailKey',
  'webhookSecret',
  'bookingqubeWebhookSecret',
  'stripeSecretKey',
  'stripeWebhookSecret',
  'privateKey',
  'private_key',
  'secretKey',
  'secret_key',
  'clientSecret',
  'client_secret',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'password',
  'databaseUrl',
  'database_url',
  'connectionString',
  'connection_string',
  'dsn',
  'signingSecret',
  'signing_secret',
  'encryptionKey',
  'encryption_key',
  'certificate',
  'certKey',
  'cert_key',
]);

export const MASKED_SECRET_PLACEHOLDER = '••••••••••••••••';

/**
 * Classifier to detect whether a setting key represents a sensitive credential or secret.
 * Covers credential, authentication, signing, encryption, connection-string, DSN, certificate,
 * token, password, and private-key variants.
 */
export function isSensitiveKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (SENSITIVE_SECRET_KEYS.has(trimmed)) return true;
  const lower = trimmed.toLowerCase();
  return (
    lower.includes('apikey') ||
    lower.includes('api_key') ||
    lower.includes('secret') ||
    lower.includes('token') ||
    lower.includes('password') ||
    lower.includes('passwd') ||
    lower.includes('pwd') ||
    lower.includes('privatekey') ||
    lower.includes('private_key') ||
    lower.includes('credential') ||
    lower.includes('auth') ||
    lower.includes('signing') ||
    lower.includes('signature') ||
    lower.includes('encrypt') ||
    lower.includes('encryption') ||
    lower.includes('connectionstring') ||
    lower.includes('connection_string') ||
    lower.includes('conn_str') ||
    lower.includes('connstring') ||
    lower.includes('dsn') ||
    lower.includes('database_url') ||
    lower.includes('db_url') ||
    lower.includes('certificate') ||
    lower.includes('cert_key')
  );
}

/**
 * Resolves a safe public settings DTO using an explicit allowlist constructor.
 * - Never spreads the raw settings object.
 * - Never deletes keys after spreading.
 * - Guarantees zero sensitive credentials or secret field names reach client components or HTML.
 */
export function resolvePublicSiteSettings(
  rawInput: Record<string, any> | Array<{ key: string; value: any }>
): PublicSiteSettings {
  const map: Record<string, any> = {};

  if (Array.isArray(rawInput)) {
    for (const item of rawInput) {
      if (item && item.key && PUBLIC_SETTINGS_KEYS.has(item.key) && !isSensitiveKey(item.key)) {
        map[item.key] = item.value;
      }
    }
  } else if (rawInput && typeof rawInput === 'object') {
    for (const key of Object.keys(rawInput)) {
      if (PUBLIC_SETTINGS_KEYS.has(key) && !isSensitiveKey(key)) {
        map[key] = rawInput[key];
      }
    }
  }

  // Explicit, typed construction with safe fallbacks
  return {
    siteNameEn: typeof map.siteNameEn === 'string' && map.siteNameEn.trim() ? map.siteNameEn.trim() : 'E3',
    siteNameAr: typeof map.siteNameAr === 'string' && map.siteNameAr.trim() ? map.siteNameAr.trim() : 'إي ثري',
    contactEmail: typeof map.contactEmail === 'string' ? map.contactEmail.trim() : '',
    contactPhone: typeof map.contactPhone === 'string' ? map.contactPhone.trim() : '',
    contactWhatsapp: typeof map.contactWhatsapp === 'string' ? map.contactWhatsapp.trim() : '',
    addressEn: typeof map.addressEn === 'string' ? map.addressEn.trim() : '',
    addressAr: typeof map.addressAr === 'string' ? map.addressAr.trim() : '',
    workingHours: typeof map.workingHours === 'string' && map.workingHours.trim() ? map.workingHours.trim() : 'Mon-Fri: 9am - 6pm',
    socialInstagram: typeof map.socialInstagram === 'string' ? map.socialInstagram.trim() : '',
    socialTwitter: typeof map.socialTwitter === 'string' ? map.socialTwitter.trim() : '',
    socialLinkedin: typeof map.socialLinkedin === 'string' ? map.socialLinkedin.trim() : '',
    socialYoutube: typeof map.socialYoutube === 'string' ? map.socialYoutube.trim() : '',
    socialSnapchat: typeof map.socialSnapchat === 'string' ? map.socialSnapchat.trim() : '',
    socialFacebook: typeof map.socialFacebook === 'string' ? map.socialFacebook.trim() : '',
    bookingqubeWebsite: typeof map.bookingqubeWebsite === 'string' ? map.bookingqubeWebsite.trim() : '',
    lightLogoUrl: typeof map.lightLogoUrl === 'string' ? map.lightLogoUrl.trim() : '',
    darkLogoUrl: typeof map.darkLogoUrl === 'string' ? map.darkLogoUrl.trim() : '',
    faviconUrl: typeof map.faviconUrl === 'string' ? map.faviconUrl.trim() : '',
    bookTicketsUrl: typeof map.bookTicketsUrl === 'string' ? map.bookTicketsUrl.trim() : '/b2c/tickets',
    bookTicketsLabelEn: typeof map.bookTicketsLabelEn === 'string' && map.bookTicketsLabelEn.trim() ? map.bookTicketsLabelEn.trim() : 'BOOK TICKETS',
    bookTicketsLabelAr: typeof map.bookTicketsLabelAr === 'string' && map.bookTicketsLabelAr.trim() ? map.bookTicketsLabelAr.trim() : 'احجز التذاكر',
    bookTicketsEnabled: map.bookTicketsEnabled !== undefined ? String(map.bookTicketsEnabled) : 'true',
    bookTicketsExternal: map.bookTicketsExternal !== undefined ? String(map.bookTicketsExternal) : 'false',
    ...(map.gatewayB2BDesc ? { gatewayB2BDesc: String(map.gatewayB2BDesc) } : {}),
    ...(map.gatewayB2BDescAr ? { gatewayB2BDescAr: String(map.gatewayB2BDescAr) } : {}),
    ...(map.footerMediaUrl ? { footerMediaUrl: String(map.footerMediaUrl) } : {}),
    ...(map.footerMediaType ? { footerMediaType: String(map.footerMediaType) } : {}),
    ...(map.footerPosterUrl ? { footerPosterUrl: String(map.footerPosterUrl) } : {}),
    ...(map.footerBackgroundMediaUrl ? { footerBackgroundMediaUrl: String(map.footerBackgroundMediaUrl) } : {}),
    ...(map.footerBackgroundMediaType ? { footerBackgroundMediaType: String(map.footerBackgroundMediaType) } : {}),
    ...(map.footerBackgroundPosterUrl ? { footerBackgroundPosterUrl: String(map.footerBackgroundPosterUrl) } : {}),
    ...(map.googleAnalyticsId ? { googleAnalyticsId: String(map.googleAnalyticsId) } : {}),
    ...(map.tagManagerId ? { tagManagerId: String(map.tagManagerId) } : {}),
    ...(map.metaTitleEn ? { metaTitleEn: String(map.metaTitleEn) } : {}),
    ...(map.metaTitleAr ? { metaTitleAr: String(map.metaTitleAr) } : {}),
    ...(map.metaDescriptionEn ? { metaDescriptionEn: String(map.metaDescriptionEn) } : {}),
    ...(map.metaDescriptionAr ? { metaDescriptionAr: String(map.metaDescriptionAr) } : {}),
    ...(map.colorPrimary ? { colorPrimary: String(map.colorPrimary) } : {}),
    ...(map.colorSecondary ? { colorSecondary: String(map.colorSecondary) } : {}),
    ...(map.colorAccent ? { colorAccent: String(map.colorAccent) } : {}),
    ...(map.fontFamily ? { fontFamily: String(map.fontFamily) } : {}),
    ...(map.defaultTheme ? { defaultTheme: String(map.defaultTheme) } : {}),
    ...(map.enable3DMap !== undefined ? { enable3DMap: Boolean(map.enable3DMap) } : {}),
    ...(map.enableLiveOccupancy !== undefined ? { enableLiveOccupancy: Boolean(map.enableLiveOccupancy) } : {}),
    ...(map.enableSocialPreviews !== undefined ? { enableSocialPreviews: Boolean(map.enableSocialPreviews) } : {}),
    ...(map.calendarHeroMediaType ? { calendarHeroMediaType: String(map.calendarHeroMediaType) } : {}),
    ...(map.calendarHeroMediaUrl ? { calendarHeroMediaUrl: String(map.calendarHeroMediaUrl) } : {}),
  };
}

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
 * Replaces any sensitive secret value with masked placeholder (••••••••••••••••) and presence metadata.
 * Real credentials are NEVER transmitted to the browser.
 */
export function getMaskedAdminSettings(
  settingsRecords: Array<{ key: string; value: any; updatedAt?: any }>
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const record of settingsRecords) {
    if (!record || !record.key) continue;
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

  return result;
}

/**
 * Checks if a submitted secret value indicates "preserve existing credential".
 * Blank, whitespace, or masked placeholder submissions preserve existing stored credentials.
 */
export function isMaskedOrBlankSecretSubmission(value: any): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed === '') return true;
  if (trimmed === MASKED_SECRET_PLACEHOLDER) return true;
  if (/^[•*]+$/.test(trimmed)) return true;
  return false;
}

/**
 * Server-only secret reader for protected background workers, webhooks, and integrations.
 * Strictly reads from server database or environment variables. Never callable from client components.
 */
export async function getServerSecretSetting(key: string): Promise<string | null> {
  const settingModel = (db as any).siteSettings || (db as any).setting;

  // 1. BookingQube Credential Resolution with Canonical Fallback to Legacy Aliases
  if (key === BOOKINGQUBE_CANONICAL_KEY || (BOOKINGQUBE_LEGACY_KEY_ALIASES as readonly string[]).includes(key)) {
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
