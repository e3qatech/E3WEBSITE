import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';
import db from '@/lib/db';
import { resolveServerLandingDestination } from '@/lib/landing-route';
import { normalizeRole } from '@/lib/auth-roles';

export const dynamic = 'force-dynamic';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "e3-qatar-super-secret-key-development-2026!";

export async function GET(req: NextRequest) {
  const { nextUrl } = req;
  const portal = nextUrl.searchParams.get('portal') || 'admin';
  const workspace = nextUrl.searchParams.get('workspace') || 'super';
  const callbackUrl = nextUrl.searchParams.get('callbackUrl');
  const rawLocale = nextUrl.searchParams.get('locale') || 'en';
  const locale = rawLocale === 'ar' ? 'ar' : 'en';

  // 1. Read fresh authenticated session server-side
  const session = await auth();
  let token: any = null;

  try {
    token = await getToken({ req: req as any, secret: AUTH_SECRET });
  } catch (tErr) {
    console.error('[AUTH LANDING TOKEN ERROR]', tErr);
  }

  if (!session?.user && !token) {
    console.log('[AUTH_LANDING_DEBUG] No session or token found', { cookies: req.cookies.getAll().map(c => c.name) });
    return NextResponse.redirect(new URL(`/${locale}/login/${portal}`, nextUrl.origin));
  }

  // 2. Resolve database user by ID or Email
  const sessionUserId = session?.user?.id || (session?.user as any)?.sub || token?.id || token?.sub;
  const sessionUserEmail = session?.user?.email?.toLowerCase().trim() || (token?.email as string)?.toLowerCase().trim();

  let dbUser: any = null;
  try {
    if (sessionUserId) {
      dbUser = await db.user.findUnique({
        where: { id: sessionUserId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          sessionVersion: true,
        },
      });
    }
    if (!dbUser && sessionUserEmail) {
      dbUser = await db.user.findUnique({
        where: { email: sessionUserEmail },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          sessionVersion: true,
        },
      });
    }
  } catch (err) {
    console.error('[AUTH LANDING API DB ERROR]', err);
  }

  // Fallback to token claims if DB cold-start
  const rawRole = dbUser?.role || (session?.user as any)?.role || token?.role || 'CLIENT';
  const normalizedRole = normalizeRole(rawRole);
  const isActive = dbUser ? dbUser.isActive : ((session?.user as any)?.isActive ?? token?.isActive ?? true);
  const dbSessionVersion = dbUser?.sessionVersion ?? (session?.user as any)?.sessionVersion ?? token?.sessionVersion ?? 1;
  const tokenSessionVersion = (session?.user as any)?.sessionVersion ?? token?.sessionVersion ?? 1;

  if (!isActive) {
    return NextResponse.redirect(new URL(`/${locale}/login/${portal}?error=inactive`, nextUrl.origin));
  }

  // Session revocation validation
  if (dbUser && dbSessionVersion !== tokenSessionVersion) {
    return NextResponse.redirect(new URL(`/${locale}/login/${portal}?error=session_revoked`, nextUrl.origin));
  }

  // 3. Resolve destination using canonical server-authoritative resolver
  const res = resolveServerLandingDestination({
    user: {
      id: sessionUserId || dbUser?.id,
      role: normalizedRole,
      isActive,
      sessionVersion: dbSessionVersion,
    },
    portal,
    workspace,
    callbackUrl,
    locale,
  });

  console.log('[AUTH_LANDING_DEBUG]', {
    hasSession: !!session,
    sessionUser: session?.user ? { id: session.user.id, email: session.user.email, role: (session.user as any).role } : null,
    dbUser: dbUser ? { id: dbUser.id, email: dbUser.email, role: dbUser.role, isActive: dbUser.isActive } : null,
    rawRole,
    normalizedRole,
    portal,
    workspace,
    authorized: res.authorized,
    destination: res.destination
  });

  return NextResponse.redirect(new URL(res.destination, nextUrl.origin));
}
