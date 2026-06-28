import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search');
    const isPublished = searchParams.get('isPublished');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const cacheKey = `attractions:list:${page}:${limit}:${search}:${isPublished}:${sortBy}:${sortOrder}`;
    let cached = null;
    try {
      cached = await redis.get(cacheKey);
    } catch (e) {
      console.warn('[REDIS_ERROR] Failed to get cache:', e);
    }
    
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const where: Prisma.AttractionWhereInput = {};
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
        { descriptionAr: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isPublished !== null) {
      where.isPublished = isPublished === 'true';
    }
    where.isHidden = false;

    const skip = (page - 1) * limit;

    const [attractions, total] = await Promise.all([
      db.attraction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          slug: true,
          nameEn: true,
          nameAr: true,
          descriptionEn: true,
          descriptionAr: true,
          isPublished: true,
          isFeatured: true,
          createdAt: true,
          gallery: { take: 1, select: { url: true } },
          pricing: { take: 1, select: { price: true, currency: true } },
          schedules: { 
            where: {
              startTime: { lte: new Date() },
              endTime: { gte: new Date() }
            }
          }
        },
      }),
      db.attraction.count({ where }),
    ]);

    const result = {
      data: attractions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    } catch (e) {
      console.warn('[REDIS_ERROR] Failed to set cache:', e);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[ATTRACTIONS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      ((session.user as any).role !== 'SUPER_ADMIN' &&
        (session.user as any).role !== 'SALES_ADMIN')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { slug, nameEn, nameAr, descriptionEn, descriptionAr, coordinates, isPublished } = body;

    if (!slug || !nameEn || !nameAr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAttraction = await db.attraction.create({
      data: {
        slug,
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        coordinates,
        isPublished: isPublished ?? false,
      },
    });

    try {
      const keys = await redis.keys('attractions:list:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (e) {
      console.warn('[REDIS_ERROR] Failed to clear cache:', e);
    }

    return NextResponse.json(newAttraction, { status: 201 });
  } catch (error: any) {
    console.error('[ATTRACTIONS_POST]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Attraction with this slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
