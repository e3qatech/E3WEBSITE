import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(req: NextRequest) {
  const { nextUrl } = req;

  // Check for any NextAuth / Auth.js session token cookie variant (HTTPS, Host, Secure, Chunked)
  const allCookies = req.cookies.getAll();
  const isLoggedIn = allCookies.some(c => 
    c.name.includes('session-token') || 
    c.name.includes('authjs') || 
    c.name.includes('next-auth')
  );

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
      return NextResponse.redirect(new URL(`/${localeCookie}/login/admin`, nextUrl));
    }
  }

  // Check staff portal protection
  if (normalizedPath.includes('/staff') && !normalizedPath.includes('/staff-login')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/${localeCookie}/login/staff`, nextUrl));
    }
  }

  // Check business portal protection
  if (normalizedPath.includes('/business')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/${localeCookie}/login/business`, nextUrl));
    }
  }

  // Check candidate portal protection
  if (normalizedPath.includes('/candidate')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/${localeCookie}/login/careers`, nextUrl));
    }
  }

  // Handle missing locale prefix for dashboard, B2B, and B2C routes
  if (
    nextUrl.pathname === '/dashboard' ||
    nextUrl.pathname.startsWith('/dashboard/') ||
    nextUrl.pathname.startsWith('/b2b') ||
    nextUrl.pathname.startsWith('/b2c')
  ) {
    return NextResponse.redirect(new URL(`/${localeCookie}${nextUrl.pathname}`, nextUrl));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
