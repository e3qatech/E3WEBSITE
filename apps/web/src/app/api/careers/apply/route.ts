import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().optional(),
  cvUrl: z.string().url("Valid CV URL is required"),
  portal: z.enum(["B2B", "B2C", "SHARED"]).default("SHARED")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = applicationSchema.parse(body);

    const application = await db.jobApplication.create({
      data: validatedData
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("[POST /api/careers/apply] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
