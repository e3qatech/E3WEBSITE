import { normalizeRole } from './auth-roles';

export function getAuthorizedLandingRoute(user?: { role?: string | null } | null, locale: string = 'en'): string {
  const validLocale = locale === 'ar' ? 'ar' : 'en';
  if (!user || !user.role) return `/${validLocale}/login/admin`;
  const role = normalizeRole(user.role);

  switch (role) {
    case 'SUPER_ADMIN':
      return `/${validLocale}/dashboard`;
    case 'SALES_ADMIN':
      return `/${validLocale}/dashboard/b2b`;
    case 'SUPPORT_ADMIN':
      return `/${validLocale}/dashboard/b2c`;
    case 'STAFF':
      return `/${validLocale}/staff`;
    case 'CLIENT':
      return `/${validLocale}/business`;
    case 'CANDIDATE':
      return `/${validLocale}/candidate`;
    default:
      return `/${validLocale}/dashboard`;
  }
}

export function sanitizeCallbackUrl(
  callbackUrl: string | null | undefined,
  user?: { role?: string | null } | null,
  locale: string = 'en'
): string {
  const fallback = getAuthorizedLandingRoute(user, locale);
  if (!callbackUrl || typeof callbackUrl !== 'string') {
    return fallback;
  }

  const raw = callbackUrl.trim();

  // Reject basic unsafe prefixes
  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('//') ||
    raw.startsWith('\\') ||
    raw.includes('\\') ||
    raw.toLowerCase().includes('javascript:') ||
    raw.toLowerCase().includes('data:') ||
    raw.toLowerCase().includes('vbscript:') ||
    !raw.startsWith('/')
  ) {
    return fallback;
  }

  // Attempt URL decoding safely to catch encoded/double-encoded tricks
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
    if (decoded.includes('%')) {
      decoded = decodeURIComponent(decoded);
    }
  } catch (_e) {
    // Malformed URI input
    return fallback;
  }

  // Re-check decoded path against redirect injection attempts
  if (
    decoded.startsWith('http://') ||
    decoded.startsWith('https://') ||
    decoded.startsWith('//') ||
    decoded.includes('\\') ||
    decoded.toLowerCase().includes('javascript:') ||
    decoded.toLowerCase().includes('data:') ||
    !decoded.startsWith('/')
  ) {
    return fallback;
  }

  // Prevent redirect loop back to login/auth routes
  if (
    decoded.includes('/login') ||
    decoded.includes('/auth') ||
    decoded.includes('/staff-login') ||
    decoded.includes('/client/login') ||
    decoded.includes('/careers/login')
  ) {
    return fallback;
  }

  // Role authorization scope validation
  if (user && user.role) {
    const role = normalizeRole(user.role);

    if (role === 'CLIENT' && decoded.includes('/dashboard')) {
      return `/${locale}/business`;
    }
    if (role === 'CANDIDATE' && (decoded.includes('/dashboard') || decoded.includes('/staff'))) {
      return `/${locale}/candidate`;
    }
    if (role === 'STAFF' && (decoded.includes('/dashboard') || decoded.includes('/business'))) {
      return `/${locale}/staff`;
    }
    if (role === 'SALES_ADMIN' && decoded.includes('/dashboard/b2c')) {
      return `/${locale}/dashboard/b2b`;
    }
    if (role === 'SUPPORT_ADMIN' && decoded.includes('/dashboard/b2b')) {
      return `/${locale}/dashboard/b2c`;
    }
  }

  return raw;
}
