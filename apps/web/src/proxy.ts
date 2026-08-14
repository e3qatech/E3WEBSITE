import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const rawPathname = nextUrl.pathname;

  // 1. Static Assets & API Bypass
  if (
    rawPathname.startsWith('/_next') ||
    rawPathname.includes('/api/') ||
    PUBLIC_FILE.test(rawPathname)
  ) {
    return NextResponse.next();
  }

  // 2. Locale & Theme Detection
  const allCookies = req.cookies.getAll();
  const themeCookie = req.cookies.get('data-theme')?.value || 'dark';
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value || 'en';

  // Detect locale from URL path first, then fallback to cookie
  let targetLocale = cookieLocale === 'ar' ? 'ar' : 'en';
  if (rawPathname.startsWith('/ar/') || rawPathname === '/ar') {
    targetLocale = 'ar';
  } else if (rawPathname.startsWith('/en/') || rawPathname === '/en') {
    targetLocale = 'en';
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-theme', themeCookie);
  requestHeaders.set('x-locale', targetLocale);

  // 3. Auth Session Cookie Detection
  const isLoggedIn = allCookies.some((c) =>
    c.name.includes('session-token') ||
    c.name.includes('authjs') ||
    c.name.includes('next-auth')
  );

  let normalizedPath = rawPathname;
  try {
    normalizedPath = decodeURIComponent(rawPathname);
  } catch (_e) {
    // Keep raw on malformed decode
  }

  // 4. Legacy Root Login Routes (Redirect to localized canonical login)
  if (normalizedPath === '/client/login') {
    return NextResponse.redirect(new URL(`/${targetLocale}/login/business`, nextUrl));
  }
  if (normalizedPath === '/careers/login') {
    return NextResponse.redirect(new URL(`/${targetLocale}/login/careers`, nextUrl));
  }
  if (normalizedPath === '/staff-login') {
    return NextResponse.redirect(new URL(`/${targetLocale}/login/staff`, nextUrl));
  }
  if (
    normalizedPath === '/login/admin' ||
    normalizedPath === '/login/business' ||
    normalizedPath === '/login/staff' ||
    normalizedPath === '/login/careers'
  ) {
    return NextResponse.redirect(new URL(`/${targetLocale}${normalizedPath}`, nextUrl));
  }

  // 5. Check if the current request is already on a Login/Auth page
  // NEVER apply protected portal redirects to login/auth routes to prevent loops
  const isLoginRoute =
    /^\/(?:en|ar)?\/?login(?:\/.*)?$/i.test(normalizedPath) ||
    /^\/(?:en|ar)?\/?auth(?:\/.*)?$/i.test(normalizedPath) ||
    normalizedPath === '/staff-login' ||
    normalizedPath === '/client/login' ||
    normalizedPath === '/careers/login';

  if (isLoginRoute) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 6. Protected Portal Route Edge Guards (Strict segment matching)
  if (!isLoggedIn) {
    const search = nextUrl.search || '';

    // Dashboard (/dashboard, /en/dashboard, /ar/dashboard)
    if (/^\/(?:en|ar)?\/?dashboard(?:\/.*)?$/i.test(normalizedPath)) {
      return NextResponse.redirect(new URL(`/${targetLocale}/login/admin${search}`, nextUrl));
    }

    // Staff Portal (/staff, /en/staff, /ar/staff)
    if (/^\/(?:en|ar)?\/?staff(?:\/.*)?$/i.test(normalizedPath)) {
      return NextResponse.redirect(new URL(`/${targetLocale}/login/staff${search}`, nextUrl));
    }

    // Business Portal (/business, /en/business, /ar/business)
    if (/^\/(?:en|ar)?\/?business(?:\/.*)?$/i.test(normalizedPath)) {
      return NextResponse.redirect(new URL(`/${targetLocale}/login/business${search}`, nextUrl));
    }

    // Candidate Portal (/candidate, /en/candidate, /ar/candidate)
    if (/^\/(?:en|ar)?\/?candidate(?:\/.*)?$/i.test(normalizedPath)) {
      return NextResponse.redirect(new URL(`/${targetLocale}/login/careers${search}`, nextUrl));
    }
  }

  // 7. Missing Locale Prefix Routing for Unprefixed Paths
  if (
    normalizedPath.startsWith('/dashboard') ||
    normalizedPath.startsWith('/b2b') ||
    normalizedPath.startsWith('/b2c') ||
    normalizedPath.startsWith('/business') ||
    normalizedPath.startsWith('/staff') ||
    normalizedPath.startsWith('/candidate')
  ) {
    return NextResponse.redirect(new URL(`/${targetLocale}${nextUrl.pathname}${nextUrl.search}`, nextUrl));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
