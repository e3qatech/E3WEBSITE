/**
 * Pure Public Site Settings DTO & Presentation Allowlist.
 * Dependency-free module containing pure types, allowlists, and transformers.
 * Zero database, Redis, or server dependencies. Client and server safe.
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
  // B2B Corporate Profile Download CTA
  b2bProfileUrl?: string;
  b2bProfileLabelEn?: string;
  b2bProfileLabelAr?: string;
  b2bProfileEnabled?: string;
  b2bProfileExternal?: string;
  gatewayB2BDesc?: string;
  gatewayB2BDescAr?: string;
  // B2B Footer background media
  b2bFooterMediaUrl?: string;
  b2bFooterMediaType?: string;
  b2bFooterPosterUrl?: string;
  // B2B Footer CTA banner
  b2bFooterCtaTitleEn?: string;
  b2bFooterCtaTitleAr?: string;
  b2bFooterCtaSubtitleEn?: string;
  b2bFooterCtaSubtitleAr?: string;
  b2bFooterCtaBtnLabelEn?: string;
  b2bFooterCtaBtnLabelAr?: string;
  b2bFooterCtaBtnUrl?: string;
  b2bFooterSecondaryBtnLabelEn?: string;
  b2bFooterSecondaryBtnLabelAr?: string;
  b2bFooterSecondaryBtnUrl?: string;
  b2bFooterSolutionsLinks?: string;
  b2bFooterCompanyLinks?: string;
  b2bCrNumber?: string;
  // B2C Footer background media
  b2cFooterMediaUrl?: string;
  b2cFooterMediaType?: string;
  b2cFooterPosterUrl?: string;
  // B2C Footer CTA banner
  b2cFooterCtaTitleEn?: string;
  b2cFooterCtaTitleAr?: string;
  b2cFooterCtaSubtitleEn?: string;
  b2cFooterCtaSubtitleAr?: string;
  b2cFooterSecondaryBtnLabelEn?: string;
  b2cFooterSecondaryBtnLabelAr?: string;
  b2cFooterSecondaryBtnUrl?: string;
  b2cFooterExploreLinks?: string;
  b2cFooterGuestLinks?: string;
  // Legacy / shared footer fields
  footerMediaUrl?: string;
  footerMediaType?: string;
  footerPosterUrl?: string;
  footerBackgroundMediaUrl?: string;
  footerBackgroundMediaType?: string;
  footerBackgroundPosterUrl?: string;
  footerDescriptionEn?: string;
  footerDescriptionAr?: string;
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
  // B2B Corporate Profile Download CTA
  'b2bProfileUrl',
  'b2bProfileLabelEn',
  'b2bProfileLabelAr',
  'b2bProfileEnabled',
  'b2bProfileExternal',
  'gatewayB2BDesc',
  'gatewayB2BDescAr',
  // B2B Footer media background
  'b2bFooterMediaUrl',
  'b2bFooterMediaType',
  'b2bFooterPosterUrl',
  // B2B Footer CTA banner & links
  'b2bFooterCtaTitleEn',
  'b2bFooterCtaTitleAr',
  'b2bFooterCtaSubtitleEn',
  'b2bFooterCtaSubtitleAr',
  'b2bFooterCtaBtnLabelEn',
  'b2bFooterCtaBtnLabelAr',
  'b2bFooterCtaBtnUrl',
  'b2bFooterSecondaryBtnLabelEn',
  'b2bFooterSecondaryBtnLabelAr',
  'b2bFooterSecondaryBtnUrl',
  'b2bFooterSolutionsLinks',
  'b2bFooterCompanyLinks',
  'b2bCrNumber',
  // B2C Footer media background
  'b2cFooterMediaUrl',
  'b2cFooterMediaType',
  'b2cFooterPosterUrl',
  // B2C Footer CTA banner & links
  'b2cFooterCtaTitleEn',
  'b2cFooterCtaTitleAr',
  'b2cFooterCtaSubtitleEn',
  'b2cFooterCtaSubtitleAr',
  'b2cFooterSecondaryBtnLabelEn',
  'b2cFooterSecondaryBtnLabelAr',
  'b2cFooterSecondaryBtnUrl',
  'b2cFooterExploreLinks',
  'b2cFooterGuestLinks',
  // Legacy / shared footer fields
  'footerMediaUrl',
  'footerMediaType',
  'footerPosterUrl',
  'footerBackgroundMediaUrl',
  'footerBackgroundMediaType',
  'footerBackgroundPosterUrl',
  'footerDescriptionEn',
  'footerDescriptionAr',
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
 * Normalizes camelCase, kebab-case, snake_case, and separator variants
 * (e.g. api-key, private-key, connection-string, db-url, cert-key)
 * while preserving ordinary public keys (authorName, passengerCount, compassHeading, descriptionEn, serviceKeyFacts).
 */
export function isSensitiveKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (SENSITIVE_SECRET_KEYS.has(trimmed)) return true;

  // Split camelCase, kebab-case, snake_case into individual lower-case tokens
  const tokenized = trimmed
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[-_.:/]/g, ' ')
    .trim();
  const tokens = tokenized.split(/\s+/).filter(Boolean);
  const compact = tokens.join('');

  // 1. Direct compound matches
  if (
    compact.includes('apikey') ||
    compact.includes('privatekey') ||
    compact.includes('secretkey') ||
    compact.includes('clientsecret') ||
    compact.includes('signingsecret') ||
    compact.includes('signingkey') ||
    compact.includes('encryptionkey') ||
    compact.includes('connectionstring') ||
    compact.includes('connstring') ||
    compact.includes('databaseurl') ||
    compact.includes('dburl') ||
    compact.includes('certkey') ||
    compact.includes('certificatekey') ||
    compact.includes('webhooksecret')
  ) {
    return true;
  }

  // 2. Token-level keyword matches
  const hasToken = (t: string) => tokens.includes(t);

  // Exact sensitive words
  if (
    hasToken('secret') ||
    hasToken('token') ||
    hasToken('password') ||
    hasToken('passwd') ||
    hasToken('pwd') ||
    hasToken('dsn') ||
    hasToken('credential') ||
    hasToken('credentials')
  ) {
    return true;
  }

  // Token pair combinations
  if (hasToken('api') && hasToken('key')) return true;
  if (hasToken('private') && hasToken('key')) return true;
  if (hasToken('cert') && hasToken('key')) return true;
  if (hasToken('certificate') && hasToken('key')) return true;
  if (hasToken('connection') && hasToken('string')) return true;
  if ((hasToken('db') || hasToken('database')) && hasToken('url')) return true;
  if (hasToken('signing') && (hasToken('key') || hasToken('secret'))) return true;
  if (hasToken('encryption') && (hasToken('key') || hasToken('secret'))) return true;
  if (
    hasToken('auth') &&
    (hasToken('key') || hasToken('secret') || hasToken('token') || hasToken('header') || hasToken('credential'))
  ) {
    return true;
  }

  return false;
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
    // B2B Corporate Profile Download CTA
    ...(map.b2bProfileUrl ? { b2bProfileUrl: String(map.b2bProfileUrl) } : {}),
    ...(map.b2bProfileLabelEn ? { b2bProfileLabelEn: String(map.b2bProfileLabelEn) } : {}),
    ...(map.b2bProfileLabelAr ? { b2bProfileLabelAr: String(map.b2bProfileLabelAr) } : {}),
    ...(map.b2bProfileEnabled !== undefined ? { b2bProfileEnabled: String(map.b2bProfileEnabled) } : {}),
    ...(map.b2bProfileExternal !== undefined ? { b2bProfileExternal: String(map.b2bProfileExternal) } : {}),
    ...(map.gatewayB2BDesc ? { gatewayB2BDesc: String(map.gatewayB2BDesc) } : {}),
    ...(map.gatewayB2BDescAr ? { gatewayB2BDescAr: String(map.gatewayB2BDescAr) } : {}),
    // B2B Footer media background
    ...(map.b2bFooterMediaUrl ? { b2bFooterMediaUrl: String(map.b2bFooterMediaUrl) } : {}),
    ...(map.b2bFooterMediaType ? { b2bFooterMediaType: String(map.b2bFooterMediaType) } : {}),
    ...(map.b2bFooterPosterUrl ? { b2bFooterPosterUrl: String(map.b2bFooterPosterUrl) } : {}),
    // B2B Footer CTA banner & navigation links
    ...(map.b2bFooterCtaTitleEn ? { b2bFooterCtaTitleEn: String(map.b2bFooterCtaTitleEn) } : {}),
    ...(map.b2bFooterCtaTitleAr ? { b2bFooterCtaTitleAr: String(map.b2bFooterCtaTitleAr) } : {}),
    ...(map.b2bFooterCtaSubtitleEn ? { b2bFooterCtaSubtitleEn: String(map.b2bFooterCtaSubtitleEn) } : {}),
    ...(map.b2bFooterCtaSubtitleAr ? { b2bFooterCtaSubtitleAr: String(map.b2bFooterCtaSubtitleAr) } : {}),
    ...(map.b2bFooterCtaBtnLabelEn ? { b2bFooterCtaBtnLabelEn: String(map.b2bFooterCtaBtnLabelEn) } : {}),
    ...(map.b2bFooterCtaBtnLabelAr ? { b2bFooterCtaBtnLabelAr: String(map.b2bFooterCtaBtnLabelAr) } : {}),
    ...(map.b2bFooterCtaBtnUrl ? { b2bFooterCtaBtnUrl: String(map.b2bFooterCtaBtnUrl) } : {}),
    ...(map.b2bFooterSecondaryBtnLabelEn ? { b2bFooterSecondaryBtnLabelEn: String(map.b2bFooterSecondaryBtnLabelEn) } : {}),
    ...(map.b2bFooterSecondaryBtnLabelAr ? { b2bFooterSecondaryBtnLabelAr: String(map.b2bFooterSecondaryBtnLabelAr) } : {}),
    ...(map.b2bFooterSecondaryBtnUrl ? { b2bFooterSecondaryBtnUrl: String(map.b2bFooterSecondaryBtnUrl) } : {}),
    ...(map.b2bFooterSolutionsLinks ? { b2bFooterSolutionsLinks: String(map.b2bFooterSolutionsLinks) } : {}),
    ...(map.b2bFooterCompanyLinks ? { b2bFooterCompanyLinks: String(map.b2bFooterCompanyLinks) } : {}),
    ...(map.b2bCrNumber ? { b2bCrNumber: String(map.b2bCrNumber) } : {}),
    // B2C Footer media background
    ...(map.b2cFooterMediaUrl ? { b2cFooterMediaUrl: String(map.b2cFooterMediaUrl) } : {}),
    ...(map.b2cFooterMediaType ? { b2cFooterMediaType: String(map.b2cFooterMediaType) } : {}),
    ...(map.b2cFooterPosterUrl ? { b2cFooterPosterUrl: String(map.b2cFooterPosterUrl) } : {}),
    // B2C Footer CTA banner & navigation links
    ...(map.b2cFooterCtaTitleEn ? { b2cFooterCtaTitleEn: String(map.b2cFooterCtaTitleEn) } : {}),
    ...(map.b2cFooterCtaTitleAr ? { b2cFooterCtaTitleAr: String(map.b2cFooterCtaTitleAr) } : {}),
    ...(map.b2cFooterCtaSubtitleEn ? { b2cFooterCtaSubtitleEn: String(map.b2cFooterCtaSubtitleEn) } : {}),
    ...(map.b2cFooterCtaSubtitleAr ? { b2cFooterCtaSubtitleAr: String(map.b2cFooterCtaSubtitleAr) } : {}),
    ...(map.b2cFooterSecondaryBtnLabelEn ? { b2cFooterSecondaryBtnLabelEn: String(map.b2cFooterSecondaryBtnLabelEn) } : {}),
    ...(map.b2cFooterSecondaryBtnLabelAr ? { b2cFooterSecondaryBtnLabelAr: String(map.b2cFooterSecondaryBtnLabelAr) } : {}),
    ...(map.b2cFooterSecondaryBtnUrl ? { b2cFooterSecondaryBtnUrl: String(map.b2cFooterSecondaryBtnUrl) } : {}),
    ...(map.b2cFooterExploreLinks ? { b2cFooterExploreLinks: String(map.b2cFooterExploreLinks) } : {}),
    ...(map.b2cFooterGuestLinks ? { b2cFooterGuestLinks: String(map.b2cFooterGuestLinks) } : {}),
    // Legacy / shared footer fields
    ...(map.footerMediaUrl ? { footerMediaUrl: String(map.footerMediaUrl) } : {}),
    ...(map.footerMediaType ? { footerMediaType: String(map.footerMediaType) } : {}),
    ...(map.footerPosterUrl ? { footerPosterUrl: String(map.footerPosterUrl) } : {}),
    ...(map.footerBackgroundMediaUrl ? { footerBackgroundMediaUrl: String(map.footerBackgroundMediaUrl) } : {}),
    ...(map.footerBackgroundMediaType ? { footerBackgroundMediaType: String(map.footerBackgroundMediaType) } : {}),
    ...(map.footerBackgroundPosterUrl ? { footerBackgroundPosterUrl: String(map.footerBackgroundPosterUrl) } : {}),
    ...(map.footerDescriptionEn ? { footerDescriptionEn: String(map.footerDescriptionEn) } : {}),
    ...(map.footerDescriptionAr ? { footerDescriptionAr: String(map.footerDescriptionAr) } : {}),
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
