import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

const PUBLIC_FILE = /\.(.*)$/;

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  // 1. Locale & Theme Detection
  // We can pass them as headers so the Layout can read them
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

    // Role-based protection rules
    const path = nextUrl.pathname;

    if (path.startsWith('/dashboard/b2b')) {
      if (role !== 'SUPER_ADMIN' && role !== 'SALES_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', nextUrl));
      }
    }

    if (path.startsWith('/dashboard/b2c')) {
      if (role !== 'SUPER_ADMIN' && role !== 'SUPPORT_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', nextUrl));
      }
    }

    if (path.startsWith('/dashboard/operations')) {
      if (role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', nextUrl));
      }
    }

    if (path.startsWith('/dashboard/crm')) {
      if (role !== 'SUPER_ADMIN' && role !== 'SALES_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', nextUrl));
      }
    }

    if (path.startsWith('/dashboard/settings')) {
      if (role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/unauthorized', nextUrl));
      }
    }

    // /dashboard/schedule is accessible by STAFF, CLIENT, and potentially ADMINS. 
    // Data filtering for "own meetings only" will happen at the API layer.
  }

  // Prevent logged-in users from seeing the login page
  if (isLoggedIn && nextUrl.pathname.startsWith('/auth/login')) {
     let redirectPath = '/dashboard';
     if (role === 'SALES_ADMIN') redirectPath = '/dashboard/b2b/leads';
     if (role === 'SUPPORT_ADMIN') redirectPath = '/dashboard/b2c/feedback';
     if (role === 'STAFF' || role === 'CLIENT') redirectPath = '/dashboard/schedule';

     return NextResponse.redirect(new URL(redirectPath, nextUrl));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
