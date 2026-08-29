/**
 * url-helper.ts
 *
 * Centralized, battle-tested URL routing, localization, and external safety utility for E3 Qatar.
 *
 * Core capabilities:
 * 1. Canonical Route Mapping (canonicalizes legacy aliases to official routes)
 * 2. Locale-Preserving Internal Link Generation (strictly prevents double-prefixes, handles query & hash)
 * 3. Safe External URL Normalization (render-time scheme injection, protocol whitelisting, XSS/javascript: neutralization)
 * 4. External Anchor Property Generator (adds rel="noopener noreferrer" and target="_blank" safely)
 */

export type SupportedLocale = 'en' | 'ar';

/** List of approved URL protocols */
const SAFE_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:', 'sms:'] as const;

/** Known social and external domain patterns that may arrive without a scheme */
const SCHEMELESS_EXTERNAL_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'facebook.com',
  'www.facebook.com',
  'instagram.com',
  'www.instagram.com',
  'snapchat.com',
  'www.snapchat.com',
  'twitter.com',
  'www.twitter.com',
  'x.com',
  'www.x.com',
  'linkedin.com',
  'www.linkedin.com',
  'tiktok.com',
  'www.tiktok.com',
  'vimeo.com',
  'player.vimeo.com',
  'wa.me',
  'whatsapp.com',
  'api.whatsapp.com',
  'google.com',
  'maps.google.com',
  'goo.gl',
  'spline.design',
  'my.spline.design',
  'prod.spline.design',
  'e3.qa',
  'booking.e3.qa',
  'cdn.e3.qa',
];

/**
 * Maps legacy public route aliases to canonical App Router paths (without locale).
 */
export function canonicalizeRoute(path: string): string {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();

  // Separate pathname from query and hash
  const queryIndex = trimmed.indexOf('?');
  const hashIndex = trimmed.indexOf('#');
  
  let basePath = trimmed;
  let suffix = '';

  if (queryIndex !== -1 && (hashIndex === -1 || queryIndex < hashIndex)) {
    basePath = trimmed.slice(0, queryIndex);
    suffix = trimmed.slice(queryIndex);
  } else if (hashIndex !== -1) {
    basePath = trimmed.slice(0, hashIndex);
    suffix = trimmed.slice(hashIndex);
  }

  // Strip leading locale if present (e.g. /en/b2b/case-studies -> /b2b/case-studies)
  let normalized = basePath;
  let detectedLocale: string | null = null;
  const localeMatch = normalized.match(/^\/(en|ar)(\/.*)?$/);
  if (localeMatch) {
    detectedLocale = localeMatch[1];
    normalized = localeMatch[2] || '/';
  }

  // Normalize trailing slash (unless root /)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  // Exact & prefix alias mappings
  let canonical = normalized;

  // 1. B2B Case Studies Aliases (Canonical: /b2b/case-studies)
  if (normalized === '/b2b/cases' || normalized === '/case-studies' || normalized === '/cases' || normalized === '/b2b/case-studies') {
    canonical = '/b2b/case-studies';
  } else if (normalized.startsWith('/b2b/cases/')) {
    const slug = normalized.replace('/b2b/cases/', '');
    canonical = `/b2b/case-studies/${slug}`;
  } else if (normalized.startsWith('/case-studies/')) {
    const slug = normalized.replace('/case-studies/', '');
    canonical = `/b2b/case-studies/${slug}`;
  } else if (normalized.startsWith('/cases/')) {
    const slug = normalized.replace('/cases/', '');
    canonical = `/b2b/case-studies/${slug}`;
  } else if (normalized.startsWith('/b2b/case-studies/')) {
    canonical = normalized;
  }

  // 2. B2B Services & Aliases
  else if (
    normalized === '/services/fec' ||
    normalized === '/b2b/services/fec' ||
    normalized === '/b2b/services/fec-center' ||
    normalized === '/b2b/services/fec-development'
  ) {
    canonical = '/b2b/services/family-entertainment-centers';
  } else if (
    normalized === '/b2b/services/audio-visual-stage' ||
    normalized === '/services/audio-visual-stage' ||
    normalized === '/services/av-rentals'
  ) {
    canonical = '/b2b/services/av-stage-rentals';
  } else if (normalized === '/services') {
    canonical = '/b2b/services';
  } else if (normalized.startsWith('/services/')) {
    const slug = normalized.replace('/services/', '');
    canonical = `/b2b/services/${slug}`;
  }

  // 3. B2B Contact / RFP & Partner Contact Aliases
  else if (
    normalized === '/partners-contact' ||
    normalized === '/b2b/rfp' ||
    normalized === '/contact/b2b' ||
    normalized === '/b2b/request-proposal'
  ) {
    canonical = '/b2b/contact';
  }

  // 4. B2C Attractions Aliases
  else if (normalized === '/attractions') {
    canonical = '/b2c/attractions';
  } else if (normalized.startsWith('/attractions/')) {
    const slug = normalized.replace('/attractions/', '');
    canonical = `/b2c/attractions/${slug}`;
  }

  // 5. B2C Calendar & Events Aliases
  else if (normalized === '/calendar' || normalized === '/events' || normalized === '/b2c/events') {
    canonical = '/b2c/calendar';
  }

  // 6. B2C Contact & Support Aliases
  else if (normalized === '/contact' || normalized === '/contact/b2c' || normalized === '/support') {
    canonical = '/b2c/contact';
  }

  // Re-attach detected locale if caller had one
  if (detectedLocale) {
    return `/${detectedLocale}${canonical === '/' ? '' : canonical}${suffix}`;
  }

  return `${canonical}${suffix}`;
}

/**
 * Checks if a given string represents an external URL, protocol link, or mailto/tel.
 */
export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('sms:')
  ) {
    return true;
  }

  // Check if it starts with a known external hostname without a scheme (e.g. www.youtube.com, facebook.com)
  const lower = trimmed.toLowerCase();
  for (const domain of SCHEMELESS_EXTERNAL_DOMAINS) {
    if (lower === domain || lower.startsWith(`${domain}/`) || lower.startsWith(`${domain}?`)) {
      return true;
    }
  }

  // Check general www. prefix
  if (lower.startsWith('www.')) {
    return true;
  }

  return false;
}

/**
 * Sanitizes and normalizes an external URL.
 * Automatically prepends 'https://' to valid schemeless hostnames.
 * Neutralizes unsafe protocols (e.g., javascript:, data:).
 */
export function normalizeExternalUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Remove dangerous control characters
  trimmed = trimmed.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // 2. Reject malicious script/data protocols immediately
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '';
  }

  // 3. Keep mailto:, tel:, sms: as-is
  if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('sms:')) {
    return trimmed;
  }

  // 4. Protocol-relative URLs (//example.com) -> https://example.com
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // 5. Existing https:// or http:// URLs
  if (lower.startsWith('https://') || lower.startsWith('http://')) {
    try {
      const parsed = new URL(trimmed);
      if (SAFE_PROTOCOLS.includes(parsed.protocol as any)) {
        return trimmed;
      }
      return '';
    } catch {
      return '';
    }
  }

  // 6. Schemeless domain patterns (e.g., www.youtube.com, facebook.com/e3, instagram.com/...)
  const isDomainPattern =
    lower.startsWith('www.') ||
    SCHEMELESS_EXTERNAL_DOMAINS.some(
      (domain) => lower === domain || lower.startsWith(`${domain}/`) || lower.startsWith(`${domain}?`)
    ) ||
    /^[a-zA-Z0-9-]+\.(com|qa|org|net|ae|sa|io|co|me|tv|gl)(\/.*)?$/i.test(trimmed);

  if (isDomainPattern) {
    const candidate = `https://${trimmed}`;
    try {
      new URL(candidate);
      return candidate;
    } catch {
      return '';
    }
  }

  // If internal relative path, return as is (do not force https)
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  return '';
}

/**
 * Localizes an internal path with the current active locale ('en' | 'ar').
 *
 * Rules:
 * - External URLs, mailto, tel, sms, and fragment anchors (#) are left untouched.
 * - Legacy alias paths are automatically mapped to canonical paths.
 * - Prevents double-locale prefixes (e.g. /en/en/b2c -> /en/b2c).
 * - Preserves query parameters and URL hashes cleanly.
 */
export function localizeHref(
  href: string | null | undefined,
  locale: string | SupportedLocale = 'en'
): string {
  if (!href || typeof href !== 'string') return `/${locale === 'ar' ? 'ar' : 'en'}`;
  const trimmed = href.trim();
  if (!trimmed) return `/${locale === 'ar' ? 'ar' : 'en'}`;

  const validLocale: SupportedLocale = locale === 'ar' ? 'ar' : 'en';

  // 1. Anchors/fragments only (#section) -> return untouched
  if (trimmed.startsWith('#')) {
    return trimmed;
  }

  // 2. External links, mailto, tel -> return normalized external
  if (isExternalUrl(trimmed)) {
    return normalizeExternalUrl(trimmed);
  }

  // 3. Canonicalize any legacy internal routes first
  const canonical = canonicalizeRoute(trimmed);

  // 4. If already prefixed with valid locale (/en/... or /ar/...)
  const match = canonical.match(/^\/(en|ar)(\/.*)?$/);
  if (match) {
    const pathLocale = match[1];
    const rest = match[2] || '';
    // If matching current desired locale, keep it; if not, swap locale cleanly
    if (pathLocale === validLocale) {
      return canonical;
    }
    return `/${validLocale}${rest}`;
  }

  // 5. If starts with /, prepend locale
  if (canonical.startsWith('/')) {
    return `/${validLocale}${canonical === '/' ? '' : canonical}`;
  }

  // 6. If relative path without leading slash, format cleanly
  return `/${validLocale}/${canonical}`;
}

/**
 * Helper to produce safe <a> tag props for both internal and external destinations.
 */
export function getSafeAnchorProps(url: string | null | undefined, currentLocale: string = 'en') {
  if (!url || typeof url !== 'string') {
    return { href: `/${currentLocale === 'ar' ? 'ar' : 'en'}` };
  }

  const isExt = isExternalUrl(url);
  if (isExt) {
    const safeUrl = normalizeExternalUrl(url);
    const isSpecialProtocol =
      safeUrl.startsWith('mailto:') || safeUrl.startsWith('tel:') || safeUrl.startsWith('sms:');

    return {
      href: safeUrl,
      target: isSpecialProtocol ? undefined : '_blank',
      rel: isSpecialProtocol ? undefined : 'noopener noreferrer',
    };
  }

  return {
    href: localizeHref(url, currentLocale),
  };
}
