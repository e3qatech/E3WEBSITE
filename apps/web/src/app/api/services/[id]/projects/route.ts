import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params;

    const projects = await db.serviceProject.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('[SERVICES_PROJECTS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      ((session.user as any).role !== 'SUPER_ADMIN' &&
        (session.user as any).role !== 'SALES_ADMIN')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: serviceId } = await params;
    const body = await req.json();
    const { titleEn, titleAr, descriptionEn, descriptionAr, imageUrl } = body;

    if (!titleEn || !titleAr) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newProject = await db.serviceProject.create({
      data: {
        serviceId,
        titleEn,
        titleAr,
        descriptionEn,
        descriptionAr,
        imageUrl,
      },
    });

    // Invalidate service detail cache
    await redis.del(`services:detail:${serviceId}`);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error: any) {
    console.error('[SERVICES_PROJECTS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
