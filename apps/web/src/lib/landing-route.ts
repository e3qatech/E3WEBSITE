import { normalizeRole, isAuthorizedForPortal, VALID_PORTAL_KEYS, PortalKey } from './auth-roles';

export type AdminWorkspace = 'super' | 'b2b' | 'b2c';

export interface ResolveLandingParams {
  user: {
    id?: string;
    role?: string | null;
    isActive?: boolean;
    sessionVersion?: number;
  } | null | undefined;
  portal?: string | null;
  workspace?: string | null;
  callbackUrl?: string | null;
  locale?: string;
}

export function resolveServerLandingDestination({
  user,
  portal,
  workspace,
  callbackUrl,
  locale = 'en'
}: ResolveLandingParams): { destination: string; authorized: boolean } {
  const validLocale = locale === 'ar' ? 'ar' : 'en';

  if (!user || user.isActive === false) {
    const fallbackPortal = (portal && VALID_PORTAL_KEYS.includes(portal as PortalKey)) ? portal : 'admin';
    return {
      destination: `/${validLocale}/login/${fallbackPortal}?error=inactive`,
      authorized: false
    };
  }

  const role = normalizeRole(user.role);
  const requestedPortal = (portal && VALID_PORTAL_KEYS.includes(portal as PortalKey)) ? (portal as PortalKey) : 'admin';

  // 1. Verify portal authorization
  const cleanUserRole = user.role ? String(user.role).trim().toUpperCase() : "";
  const isAuthorized = isAuthorizedForPortal(cleanUserRole || role, requestedPortal);
  if (!isAuthorized) {
    return {
      destination: `/${validLocale}/login/${requestedPortal}?error=unauthorized`,
      authorized: false
    };
  }

  // 2. If callbackUrl is provided and safe, sanitize it and prioritize
  if (callbackUrl) {
    const sanitized = sanitizeCallbackUrl(callbackUrl, { role: cleanUserRole || role }, validLocale);
    return { destination: sanitized, authorized: true };
  }

  // 3. If requestedPortal is 'events' or user is Events Team, route directly to Packages Dashboard
  if (requestedPortal === 'events' || cleanUserRole === 'EVENTS_ADMIN' || cleanUserRole === 'EVENTS_TEAM' || cleanUserRole === 'EVENTS') {
    return { destination: `/${validLocale}/dashboard/b2c/packages`, authorized: true };
  }

  // 4. Resolve destination based on role and validated workspace
  if (role === 'SUPER_ADMIN') {
    if (requestedPortal === 'admin') {
      const validWorkspaces: AdminWorkspace[] = ['super', 'b2b', 'b2c'];
      const cleanWorkspace = workspace ? String(workspace).trim().toLowerCase() : 'super';

      if (!validWorkspaces.includes(cleanWorkspace as AdminWorkspace)) {
        // Fail closed for invalid workspace values: default safely to main dashboard
        return { destination: `/${validLocale}/dashboard`, authorized: true };
      }

      if (cleanWorkspace === 'b2b') {
        return { destination: `/${validLocale}/dashboard/b2b`, authorized: true };
      }
      if (cleanWorkspace === 'b2c') {
        return { destination: `/${validLocale}/dashboard/b2c/packages`, authorized: true };
      }
      return { destination: `/${validLocale}/dashboard`, authorized: true };
    }
  }

  // Fallback to canonical landing route per role
  const canonicalRoute = getAuthorizedLandingRoute({ role: cleanUserRole || role }, validLocale);
  return { destination: canonicalRoute, authorized: true };
}

export function getAuthorizedLandingRoute(user?: { role?: string | null } | null, locale: string = 'en'): string {
  const validLocale = locale === 'ar' ? 'ar' : 'en';
  if (!user || !user.role) return `/${validLocale}/login/admin`;
  const cleanRole = String(user.role).trim().toUpperCase();

  if (cleanRole === 'EVENTS_ADMIN' || cleanRole === 'EVENTS_TEAM' || cleanRole === 'EVENTS') {
    return `/${validLocale}/dashboard/b2c/packages`;
  }

  const role = normalizeRole(user.role);

  switch (role) {
    case 'SUPER_ADMIN':
      return `/${validLocale}/dashboard`;
    case 'SALES_ADMIN':
      return `/${validLocale}/dashboard/b2b`;
    case 'SUPPORT_ADMIN':
      return `/${validLocale}/dashboard/b2c/packages`;
    case 'STAFF':
      return `/${validLocale}/staff`;
    case 'CLIENT':
      return `/${validLocale}/business`;
    case ('CANDIDATE' as any):
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
    const cleanRole = String(user.role).trim().toUpperCase();
    const role = normalizeRole(user.role);

    if (role === 'CLIENT' && decoded.includes('/dashboard')) {
      return `/${locale}/business`;
    }
    if (role === ('CANDIDATE' as any) && (decoded.includes('/dashboard') || decoded.includes('/staff'))) {
      return `/${locale}/candidate`;
    }
    if (role === 'STAFF' && (decoded.includes('/dashboard') || decoded.includes('/business'))) {
      return `/${locale}/staff`;
    }
    if (role === 'SALES_ADMIN' && decoded.includes('/dashboard/b2c')) {
      return `/${locale}/dashboard/b2b`;
    }
    if (cleanRole === 'EVENTS_ADMIN' || cleanRole === 'EVENTS_TEAM' || cleanRole === 'EVENTS') {
      if (decoded.includes('/dashboard/b2b')) {
        return `/${locale}/dashboard/b2c/packages`;
      }
    }
    if (role === 'SUPPORT_ADMIN' && decoded.includes('/dashboard/b2b')) {
      return `/${locale}/dashboard/b2c/packages`;
    }
  }

  return raw;
}
