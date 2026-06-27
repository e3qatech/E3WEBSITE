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
    const isFeatured = searchParams.get('isFeatured');
    const isVisible = searchParams.get('isVisible');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Redis caching layer (cache-aside)
    const cacheKey = `services:list:${page}:${limit}:${search}:${isFeatured}:${isVisible}:${sortBy}:${sortOrder}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const where: Prisma.ServiceWhereInput = {};
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleAr: { contains: search, mode: 'insensitive' } },
        { taglineEn: { contains: search, mode: 'insensitive' } },
        { taglineAr: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }
    if (isVisible !== null) {
      where.isVisible = isVisible === 'true';
    }

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          slug: true,
          titleEn: true,
          titleAr: true,
          taglineEn: true,
          taglineAr: true,
          thumbnail: true,
          isFeatured: true,
          isVisible: true,
        },
      }),
      db.service.count({ where }),
    ]);

    const result = {
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // 5-minute TTL
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[SERVICES_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // Assuming session.user.role exists, checking RBAC
    if (
      !session?.user ||
      (session.user as any).role !== 'SUPER_ADMIN' &&
      (session.user as any).role !== 'SALES_ADMIN'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { slug, titleEn, titleAr, taglineEn, taglineAr, thumbnail, contentEn, contentAr, isFeatured, isVisible, gallery } = body;

    if (!slug || !titleEn || !titleAr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Rate limiting comment: Add rate limiting here via Redis

    const newService = await db.$transaction(async (tx) => {
      const existing = await tx.service.findUnique({ where: { slug } });
      if (existing) {
        throw new Error('Service with this slug already exists');
      }

      return tx.service.create({
        data: {
          slug,
          titleEn,
          titleAr,
          taglineEn,
          taglineAr,
          thumbnail,
          contentEn,
          contentAr,
          isFeatured: isFeatured ?? false,
          isVisible: isVisible ?? false,
          gallery: gallery && gallery.length > 0 ? {
            create: gallery.map((item: any, idx: number) => ({
              url: item.url,
              captionEn: item.captionEn,
              captionAr: item.captionAr,
              orderIndex: item.orderIndex ?? idx,
            }))
          } : undefined,
        },
      });
    });

    // Clear list cache keys pattern (simple flush or specific delete)
    // For simplicity, we assume we might need a more advanced cache tagging mechanism,
    // but here we can just clear known keys or use a pattern if supported (ioredis keys)
    const keys = await redis.keys('services:list:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    return NextResponse.json(newService, { status: 201 });
  } catch (error: any) {
    console.error('[SERVICES_POST]', error);
    if (error.message === 'Service with this slug already exists') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
