import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: Prisma.ProjectMicrositeWhereInput = {};
    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleAr: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [microsites, total] = await Promise.all([
      db.projectMicrosite.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          attraction: {
            select: { nameEn: true, nameAr: true }
          }
        }
      }),
      db.projectMicrosite.count({ where }),
    ]);

    const result = {
      data: microsites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[MICROSITES_GET]', error);
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
    const { slug, titleEn, titleAr, status, attractionId, narrativeEn, narrativeAr, challengesEn, challengesAr, gallery, postEventReport, testimonials } = body;

    if (!slug || !titleEn || !titleAr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newMicrosite = await db.projectMicrosite.create({
      data: {
        slug,
        titleEn,
        titleAr,
        status: status || 'ACTIVE',
        attractionId: attractionId || null,
        narrativeEn,
        narrativeAr,
        challengesEn,
        challengesAr,
        gallery: gallery || null,
        postEventReport,
        testimonials: testimonials || null,
      },
    });

    return NextResponse.json(newMicrosite, { status: 201 });
  } catch (error: any) {
    console.error('[MICROSITES_POST]', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Project Microsite with this slug or attraction already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
