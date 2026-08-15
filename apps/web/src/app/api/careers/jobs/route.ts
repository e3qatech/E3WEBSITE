import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  isHRAuthorized,
  filterPubliclyEligibleJobs,
  formatJobPresentation,
  analyzeJobDataQuality,
} from '@/lib/careers/job-eligibility';

const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  type: z.string().default('FULL_TIME'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const isHR = session?.user && isHRAuthorized(userRole);

    const { searchParams } = new URL(req.url);
    const locale = (searchParams.get('locale') || 'en') as 'en' | 'ar';
    const includeAll = searchParams.get('all') === 'true';

    // Staff HR view with all drafts/closed/metrics
    if (isHR && includeAll) {
      const jobs = await db.job.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      });

      const enriched = jobs.map((j: any) => ({
        ...j,
        dataQuality: analyzeJobDataQuality(j),
      }));

      return NextResponse.json({ success: true, jobs: enriched });
    }

    // Public view: only publicly eligible jobs with safe presentation fields
    const rawJobs = await db.job.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });

    const eligible = filterPubliclyEligibleJobs(rawJobs);
    const safeJobs = eligible.map((j: any) => formatJobPresentation(j, locale));

    return NextResponse.json({ success: true, jobs: safeJobs });
  } catch (error) {
    console.error('[GET /api/careers/jobs] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!isHRAuthorized(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden: HR permissions required to create job postings' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createJobSchema.parse(body);

    const job = await db.job.create({
      data: {
        title: validated.title.trim(),
        department: validated.department?.trim() || null,
        location: validated.location?.trim() || null,
        type: validated.type || 'FULL_TIME',
        description: validated.description.trim(),
        requirements: validated.requirements?.trim() || null,
        isPublished: validated.isPublished,
      },
    });

    return NextResponse.json(
      {
        success: true,
        job,
        dataQuality: analyzeJobDataQuality(job),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/careers/jobs] error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
