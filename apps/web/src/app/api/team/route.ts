import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const cacheKey = `team:list`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const teamMembers = await db.teamMember.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        roleTitleEn: true,
        roleTitleAr: true,
        imageUrl: true,
        bioEn: true, // we can excerpt it on the frontend
        bioAr: true,
      }
    });

    await redis.set(cacheKey, JSON.stringify(teamMembers), 'EX', 3600); // 1 hour cache

    return NextResponse.json(teamMembers);
  } catch (error: any) {
    console.error('[TEAM_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
