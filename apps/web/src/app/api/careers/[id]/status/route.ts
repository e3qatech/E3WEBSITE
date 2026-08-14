import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { isAdminRole } from '@/lib/auth-roles';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as any;
    const isStaffOrAdmin = ['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'STAFF', 'HR_ADMIN'].includes(user.role) || isAdminRole(user.role);

    const application = await db.jobApplication.findUnique({
      where: { id },
      select: {
        id: true,
        jobTitle: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        cvUrl: true,
        portal: true,
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Candidate ownership check (Prevent cross-candidate IDOR)
    if (!isStaffOrAdmin && application.userId !== user.id && (!user.email || application.email.toLowerCase() !== user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden: Access denied to other candidate applications' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        jobTitle: application.jobTitle,
        department: application.department,
        status: application.status,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        cvUrl: application.cvUrl,
        portal: application.portal,
      }
    });
  } catch (error) {
    console.error("[GET /api/careers/[id]/status] error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !['SUPER_ADMIN', 'SALES_ADMIN', 'SUPPORT_ADMIN', 'STAFF'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['NEW', 'REVIEWING', 'INTERVIEW', 'HIRED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const application = await db.jobApplication.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("[PUT /api/careers/[id]/status] error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
