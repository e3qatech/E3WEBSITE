import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { resolveServerLandingDestination } from '@/lib/landing-route';

export const dynamic = 'force-dynamic';

export default async function AuthLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    portal?: string;
    workspace?: string;
    callbackUrl?: string;
  }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'ar' ? 'ar' : 'en';
  const query = await searchParams;

  // 1. Read fresh authenticated session server-side
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    const portal = query.portal || 'admin';
    redirect(`/${validLocale}/login/${portal}`);
  }

  // 2. Resolve authoritative database user
  let dbUser: any = null;
  try {
    dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        isActive: true,
        sessionVersion: true,
      },
    });
  } catch (err) {
    console.error('[AUTH LANDING DB ERROR]', err);
  }

  if (!dbUser || !dbUser.isActive) {
    const portal = query.portal || 'admin';
    redirect(`/${validLocale}/login/${portal}?error=inactive`);
  }

  // 3. Verify sessionVersion (stale/revoked session invalidation)
  const dbSessionVersion = dbUser.sessionVersion ?? 1;
  const tokenSessionVersion = (session.user as any).sessionVersion ?? 1;
  if (dbSessionVersion !== tokenSessionVersion) {
    const portal = query.portal || 'admin';
    redirect(`/${validLocale}/login/${portal}?error=session_revoked`);
  }

  // 4. Resolve destination using canonical server-authoritative resolver
  const { destination } = resolveServerLandingDestination({
    user: dbUser,
    portal: query.portal,
    workspace: query.workspace,
    callbackUrl: query.callbackUrl,
    locale: validLocale,
  });

  redirect(destination);
}
