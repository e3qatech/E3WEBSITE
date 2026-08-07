import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(req: NextRequest) {
  const { nextUrl } = req;

  // Check for NextAuth session token cookie
  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value ||
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value;

  const isLoggedIn = !!sessionToken;

  // 1. Locale & Theme Detection
  const requestHeaders = new Headers(req.headers);
  const themeCookie = req.cookies.get('data-theme')?.value || 'dark';
  const localeCookie = req.cookies.get('NEXT_LOCALE')?.value || 'en';
  requestHeaders.set('x-theme', themeCookie);
  requestHeaders.set('x-locale', localeCookie);

  if (
    nextUrl.pathname.startsWith('/_next') ||
    nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(nextUrl.pathname)
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Handle missing locale prefix for B2B and B2C public routes
  if (nextUrl.pathname.startsWith('/b2b') || nextUrl.pathname.startsWith('/b2c')) {
    return NextResponse.redirect(new URL(`/${localeCookie}${nextUrl.pathname}`, nextUrl));
  }

  // Redirect localized dashboard routes (/en/dashboard or /ar/dashboard) to unlocalized /dashboard
  if (nextUrl.pathname.match(/^\/(en|ar)\/dashboard(\/.*)?$/)) {
    const cleanPath = nextUrl.pathname.replace(/^\/(en|ar)/, '');
    return NextResponse.redirect(new URL(cleanPath, req.url));
  }

  // Extract locale if present in pathname
  const pathSegments = nextUrl.pathname.split('/').filter(Boolean);
  const pathLocale = pathSegments[0] === 'ar' || pathSegments[0] === 'en' ? pathSegments[0] : localeCookie;

  // 2. Protected Portal Route Edge Guards
  let normalizedPath = nextUrl.pathname;
  try {
    normalizedPath = decodeURIComponent(nextUrl.pathname);
  } catch (_e) {
    // Keep raw path on decode error
  }

  // Check dashboard protection
  if (normalizedPath.includes('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/${pathLocale}/login/admin`, nextUrl));
    }
  }

  // Check staff portal protection
  if (normalizedPath.includes('/staff') && !normalizedPath.includes('/staff-login')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/${pathLocale}/login/staff`, nextUrl));
    }
  }

  // Check business portal protection
  if (normalizedPath.includes('/business')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/${pathLocale}/login/business`, nextUrl));
    }
  }

  // Check candidate portal protection
  if (normalizedPath.includes('/candidate')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/${pathLocale}/login/careers`, nextUrl));
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
