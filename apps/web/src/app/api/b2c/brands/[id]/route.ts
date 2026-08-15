import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

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
    if (!session?.user || !['SUPER_ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    // Safely exclude relation arrays if they are being updated via separate operations
    // or handle nested writes.
    const { 
        category: _category, relationships: _relationships, placements: _placements, linkedHighlights: _linkedHighlights, 
        relationshipIds, categoryId, ...updateData 
    } = data;

    const brand = await db.brandIP.update({
      where: { id },
      data: {
        ...updateData,
        categoryId: categoryId || null,
        relationships: relationshipIds ? {
            set: relationshipIds.map((rid: string) => ({ id: rid }))
        } : undefined
      },
      include: {
        category: true,
        relationships: true,
      }
    });

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
    if (!session?.user || !['SUPER_ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN'].includes(userRole)) {
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
       return NextResponse.json({ archived: true, brand: archived });
    }

    await db.brandIP.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete brand:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
