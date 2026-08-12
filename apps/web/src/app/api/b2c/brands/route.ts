import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';

    const brands = await db.brandIP.findMany({
      where: publishedOnly ? { isActive: true } : undefined,
      include: {
        category: true,
        relationships: true,
        placements: {
          include: {
            attraction: true,
            locations: true,
          }
        },
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(brands);
  } catch (error: any) {
    console.error('Failed to fetch brands:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Default values mapping
    const slug = data.slug || data.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const brand = await db.brandIP.create({
      data: {
        nameEn: data.nameEn,
        nameAr: data.nameAr || data.nameEn,
        slug,
        categoryId: data.categoryId,
      }
    });

    return NextResponse.json(brand);
  } catch (error: any) {
    console.error('Failed to create brand:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
