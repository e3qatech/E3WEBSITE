import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { resolveServerLandingDestination } from '@/lib/landing-route';
import { normalizeRole } from '@/lib/auth-roles';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { nextUrl } = req;
  const portal = nextUrl.searchParams.get('portal') || 'admin';
  const workspace = nextUrl.searchParams.get('workspace') || 'super';
  const callbackUrl = nextUrl.searchParams.get('callbackUrl');
  const rawLocale = nextUrl.searchParams.get('locale') || 'en';
  const locale = rawLocale === 'ar' ? 'ar' : 'en';

  // 1. Read fresh authenticated session server-side
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.redirect(new URL(`/${locale}/login/${portal}`, nextUrl.origin));
  }

  // 2. Resolve database user by ID or Email
  const sessionUserId = session.user.id || (session.user as any).sub;
  const sessionUserEmail = session.user.email?.toLowerCase().trim();

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
  const rawRole = dbUser?.role || (session.user as any)?.role || 'CLIENT';
  const normalizedRole = normalizeRole(rawRole);
  const isActive = dbUser ? dbUser.isActive : ((session.user as any)?.isActive ?? true);
  const dbSessionVersion = dbUser?.sessionVersion ?? (session.user as any)?.sessionVersion ?? 1;
  const tokenSessionVersion = (session.user as any)?.sessionVersion ?? 1;

  if (!isActive) {
    return NextResponse.redirect(new URL(`/${locale}/login/${portal}?error=inactive`, nextUrl.origin));
  }

  // Session revocation validation
  if (dbUser && dbSessionVersion !== tokenSessionVersion) {
    return NextResponse.redirect(new URL(`/${locale}/login/${portal}?error=session_revoked`, nextUrl.origin));
  }

  // 3. Resolve destination using canonical server-authoritative resolver
  const { destination } = resolveServerLandingDestination({
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

  return NextResponse.redirect(new URL(destination, nextUrl.origin));
}
