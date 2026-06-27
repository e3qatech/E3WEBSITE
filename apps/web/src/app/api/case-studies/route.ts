import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isPublished = searchParams.get('isPublished') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : undefined;
    const category = searchParams.get('category');
    const year = searchParams.get('year') ? parseInt(searchParams.get('year') as string) : undefined;
    
    // Check cache for common query
    const cacheKey = `case-studies:${isPublished}:${limit || 'all'}:${category || 'all'}:${year || 'all'}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const where: any = {};
    if (isPublished) where.isPublished = true;
    if (category && category !== 'All') where.category = category;
    if (year && !isNaN(year)) where.year = year;

    const caseStudies = await db.caseStudy.findMany({
      where,
      select: {
        id: true,
        slug: true,
        titleEn: true,
        clientName: true,
        year: true,
        category: true,
        thumbnailUrl: true,
        isFeatured: true,
        metrics: true, // Needed for the highlighted metric on the card
      },
      orderBy: [
        { isFeatured: 'desc' },
        { year: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
    });

    // Cache results for 5 minutes
    await redis.set(cacheKey, JSON.stringify(caseStudies), 'EX', 300);

    return NextResponse.json(caseStudies);
  } catch (error: any) {
    console.error('[CASE_STUDIES_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
