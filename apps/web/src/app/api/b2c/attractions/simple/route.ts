import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const attractions = await db.attraction.findMany({
      where: {
        isPublished: true
      },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameAr: true,
        isFeatured: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { nameEn: 'asc' }
      ]
    });

    return NextResponse.json(attractions);
  } catch (error) {
    console.error('[ATTRACTIONS_SIMPLE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
