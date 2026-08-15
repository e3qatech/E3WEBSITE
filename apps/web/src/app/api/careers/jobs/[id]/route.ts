import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  isHRAuthorized,
  isJobPubliclyEligible,
  formatJobPresentation,
  analyzeJobDataQuality,
} from '@/lib/careers/job-eligibility';

const updateJobSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  department: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  type: z.string().optional(),
  description: z.string().min(1, 'Description is required').optional(),
  requirements: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const isHR = session?.user && isHRAuthorized(userRole);

    const { searchParams } = new URL(req.url);
    const locale = (searchParams.get('locale') || 'en') as 'en' | 'ar';

    const job = await db.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // HR Staff View
    if (isHR) {
      return NextResponse.json({
        success: true,
        job: {
          ...job,
          dataQuality: analyzeJobDataQuality(job),
          applicationsCount: job._count?.applications || 0,
        },
      });
    }

    // Public Consumer View
    const eligibility = isJobPubliclyEligible(job);
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          success: false,
          error: locale === 'ar' ? eligibility.reasonAr : eligibility.reason,
          eligibility,
          isClosed: eligibility.isClosed,
          isDraft: eligibility.isDraft,
          isExpired: eligibility.isExpired,
        },
        { status: eligibility.isDraft ? 404 : 200 }
      );
    }

    const safeJob = formatJobPresentation(job, locale);
    return NextResponse.json({
      success: true,
      job: safeJob,
      eligibility,
    });
  } catch (error) {
    console.error('[GET /api/careers/jobs/:id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!isHRAuthorized(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden: HR permissions required to edit job listings' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateJobSchema.parse(body);

    const existing = await db.job.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: {
        ...(validated.title ? { title: validated.title.trim() } : {}),
        ...(validated.department !== undefined ? { department: validated.department?.trim() || null } : {}),
        ...(validated.location !== undefined ? { location: validated.location?.trim() || null } : {}),
        ...(validated.type ? { type: validated.type } : {}),
        ...(validated.description ? { description: validated.description.trim() } : {}),
        ...(validated.requirements !== undefined ? { requirements: validated.requirements?.trim() || null } : {}),
        ...(validated.isPublished !== undefined ? { isPublished: validated.isPublished } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      dataQuality: analyzeJobDataQuality(updatedJob),
    });
  } catch (error) {
    console.error('[PUT /api/careers/jobs/:id] error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!isHRAuthorized(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden: HR permissions required to delete job listings' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await db.job.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await db.job.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/careers/jobs/:id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
