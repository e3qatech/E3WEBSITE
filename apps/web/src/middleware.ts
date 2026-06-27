import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Check for NextAuth session token cookie
  // NextAuth v5 uses authjs.session-token (or __Secure-authjs.session-token on HTTPS)
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


  // 2. Dashboard Protection
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login', nextUrl));
    }
    // Note: Role-based access control is enforced at the page/API level via auth() calls,
    // not in the middleware, since we cannot decode the JWT here without importing Node.js modules.
  }

  // Prevent logged-in users from seeing the login page
  if (isLoggedIn && nextUrl.pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
