import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      ((session.user as any).role !== 'SUPER_ADMIN' &&
        (session.user as any).role !== 'SALES_ADMIN' &&
        (session.user as any).role !== 'STAFF')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const microsite = await db.projectMicrosite.findUnique({
      where: { id },
      include: {
        attraction: true
      }
    });

    if (!microsite) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(microsite);
  } catch (error: any) {
    console.error('Microsite fetch error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      ((session.user as any).role !== 'SUPER_ADMIN' &&
        (session.user as any).role !== 'SALES_ADMIN' &&
        (session.user as any).role !== 'STAFF')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { slug, titleEn, titleAr, status, attractionId, narrativeEn, narrativeAr, challengesEn, challengesAr, gallery, postEventReport, testimonials } = body;

    const microsite = await db.projectMicrosite.update({
      where: { id },
      data: {
        slug,
        titleEn,
        titleAr,
        status,
        attractionId,
        narrativeEn,
        narrativeAr,
        challengesEn,
        challengesAr,
        gallery,
        postEventReport,
        testimonials
      }
    });

    return NextResponse.json(microsite);
  } catch (error: any) {
    console.error('Microsite update error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      ((session.user as any).role !== 'SUPER_ADMIN' &&
        (session.user as any).role !== 'SALES_ADMIN') // usually only admins delete
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await db.projectMicrosite.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Microsite delete error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
