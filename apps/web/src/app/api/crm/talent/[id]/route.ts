import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["SUPER_ADMIN", "HR", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params;
    let talent = await db.talent.findUnique({
      where: { id },
    }).catch(() => null);

    if (!talent) {
      const app = await db.jobApplication.findUnique({
        where: { id },
      }).catch(() => null);

      if (app) {
        talent = {
          id: app.id,
          name: `${app.firstName || ""} ${app.lastName || ""}`.trim() || "Applicant",
          email: app.email,
          phone: app.phone,
          position: app.jobTitle,
          department: app.department || "Operations",
          experienceLevel: (app.cvParsedData as any)?.experienceYears
            ? `${(app.cvParsedData as any).experienceYears} Years`
            : "Mid-Level",
          status: app.status || "NEW",
          rating: null,
          appliedDate: app.createdAt,
          resumeUrl: app.cvUrl,
          skills: (app.cvParsedData as any)?.skills || [],
          languages: ["English", "Arabic"],
          education: (app.cvParsedData as any)?.education || null,
          certifications: null,
          notes: (app.cvParsedData as any)?.summary || null,
        } as any;
      }
    }

    if (!talent) return NextResponse.json({ error: "Talent not found" }, { status: 404 });

    return NextResponse.json(talent);
  } catch (error: any) {
    console.error("[TALENT_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'HR', 'HR_ADMIN', 'SUPPORT_ADMIN', 'SALES_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    let updatedResult: any = null;
    const existingTalent = await db.talent.findUnique({ where: { id } }).catch(() => null);

    if (existingTalent) {
      updatedResult = await db.talent.update({
        where: { id },
        data: body,
      });

      // Synchronize matching JobApplication record if present
      if (body.status && existingTalent.email) {
        await db.jobApplication.updateMany({
          where: { email: { equals: existingTalent.email, mode: "insensitive" } },
          data: { status: body.status },
        }).catch(() => {});
      }
    } else {
      const existingApp = await db.jobApplication.findUnique({ where: { id } }).catch(() => null);
      if (existingApp) {
        updatedResult = await db.jobApplication.update({
          where: { id },
          data: body,
        });

        // Synchronize matching Talent record if present
        if (body.status && existingApp.email) {
          await db.talent.updateMany({
            where: { email: { equals: existingApp.email, mode: "insensitive" } },
            data: { status: body.status },
          }).catch(() => {});
        }
      } else {
        return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
      }
    }

    await db.systemLog.create({
      data: {
        action: `TALENT_UPDATED`,
        entity: `Talent ${id}`,
        entityId: id,
        userId: (session.user as any)?.id,
      },
    }).catch(() => {});

    return NextResponse.json(updatedResult);
  } catch (error) {
    console.error('Error updating talent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || !['SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const talent = await db.talent.findUnique({
      where: { id }
    });

    if (talent?.resumeUrl) {
      try {
        if (process.env.RESUME_BLOB_READ_WRITE_TOKEN) {
          const { del } = await import('@vercel/blob');
          await del(talent.resumeUrl, { token: process.env.RESUME_BLOB_READ_WRITE_TOKEN });
        }
      } catch (err) {
        console.warn('Failed to delete talent resume blob:', err);
      }
    }

    await db.talent.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting talent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
