import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';
import {
  resolvePublicTeamMember,
  isTeamMemberPubliclyEligible,
  isTeamAuthorized,
  analyzeTeamMemberDataQuality,
} from '@/lib/team/team-resolver';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const locale = (url.searchParams.get('locale') || 'en') as 'en' | 'ar';

    const session = await auth();
    const isStaff = Boolean(session?.user && isTeamAuthorized((session.user as any)?.role));

    const cacheKey = `team:detail:${id}:${locale}:${isStaff ? 'staff' : 'public'}`;
    const cached = await redis.get(cacheKey).catch(() => null);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const employeeProfile = await db.employeeProfile.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!employeeProfile) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    if (!isStaff) {
      if (!isTeamMemberPubliclyEligible(employeeProfile).eligible) {
        return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      }
      const safePublic = resolvePublicTeamMember(employeeProfile, locale);
      await redis.set(cacheKey, JSON.stringify(safePublic), 'EX', 3600).catch(() => {});
      return NextResponse.json(safePublic);
    }

    const enrichedStaff = {
      ...employeeProfile,
      dataQuality: analyzeTeamMemberDataQuality(employeeProfile),
    };

    await redis.set(cacheKey, JSON.stringify(enrichedStaff), 'EX', 3600).catch(() => {});
    return NextResponse.json(enrichedStaff);
  } catch (error: any) {
    console.error('[TEAM_DETAIL_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    if (!isTeamAuthorized((session.user as any)?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const { validateBilingualTeamMemberInput, sanitizeEmployeeProfileUpdateData } = await import("@/lib/team/team-resolver");
    const validation = validateBilingualTeamMemberInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
    }

    const updateData = sanitizeEmployeeProfileUpdateData(body);

    const updated = await db.employeeProfile.update({
      where: { id },
      data: updateData,
    });

    await redis.del(`team:detail:${id}`).catch(() => {});
    await redis.del(`team:list`).catch(() => {});

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[TEAM_DETAIL_PUT]', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    if (!isTeamAuthorized((session.user as any)?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    await db.employeeProfile.delete({
      where: { id },
    });

    await redis.del(`team:detail:${id}`).catch(() => {});
    await redis.del(`team:list`).catch(() => {});

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('[TEAM_DETAIL_DELETE]', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
