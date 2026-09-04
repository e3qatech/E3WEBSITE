import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { memoryCache } from '@/lib/cache/memory-cache';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brand = await db.brandIP.findUnique({
      where: { id },
      include: {
        category: true,
        relationships: true,
        placements: {
          include: {
            attraction: true,
            locations: true,
          }
        },
      }
    });

    if (!brand) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(brand);
  } catch (error: any) {
    console.error('Failed to fetch brand:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['SUPER_ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN', 'B2C_ADMIN', 'B2B_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const { 
        category: _category, relationships: _relationships, placements: _placements, linkedHighlights: _linkedHighlights, 
        relationshipIds, categoryId, ...updateData 
    } = data;

    let resolvedCategoryId: string | null = null;
    if (categoryId && typeof categoryId === 'string' && !categoryId.startsWith('cat-fallback-')) {
      const existingCat = await db.brandCategory.findFirst({
        where: { OR: [{ id: categoryId }, { slug: categoryId }] }
      });
      if (existingCat) {
        resolvedCategoryId = existingCat.id;
      }
    }

    const brand = await db.brandIP.update({
      where: { id },
      data: {
        ...updateData,
        categoryId: resolvedCategoryId,
        relationships: relationshipIds ? {
            set: relationshipIds.map((rid: string) => ({ id: rid }))
        } : undefined
      },
      include: {
        category: true,
        relationships: true,
      }
    });

    memoryCache.invalidate('api_brands_');
    memoryCache.invalidate('b2c_brands');
    memoryCache.invalidate('b2b_brands');

    return NextResponse.json(brand);
  } catch (error: any) {
    console.error('Failed to update brand:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || !['SUPER_ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN', 'B2C_ADMIN', 'B2B_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // Check for existing links
    const brand = await db.brandIP.findUnique({
      where: { id },
      include: { placements: true, linkedHighlights: true }
    });

    if (brand && (brand.placements.length > 0 || brand.linkedHighlights.length > 0)) {
       // Cannot delete, must archive
       const archived = await db.brandIP.update({
           where: { id },
           data: { isActive: false, lifecycleStatus: 'INACTIVE' }
       });
       memoryCache.invalidate('api_brands_');
       memoryCache.invalidate('b2c_brands');
       memoryCache.invalidate('b2b_brands');
       return NextResponse.json({ archived: true, brand: archived });
    }

    await db.brandIP.delete({
      where: { id }
    });

    memoryCache.invalidate('api_brands_');
    memoryCache.invalidate('b2c_brands');
    memoryCache.invalidate('b2b_brands');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete brand:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
