import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().optional(),
  cvUrl: z.string().url("Valid CV URL is required"),
  portal: z.enum(["B2B", "B2C", "SHARED"]).default("SHARED")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = applicationSchema.parse(body);

    // 1. Check if user exists or create them
    let user = await db.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      user = await db.user.create({
        data: {
          email: validatedData.email,
          name: `${validatedData.firstName} ${validatedData.lastName}`,
          password: hashedPassword,
          role: 'CLIENT' // Applicants are created as standard clients
        }
      });
    }

    // 2. Create the application and link it to the user
    const application = await db.jobApplication.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        jobTitle: validatedData.jobTitle,
        department: validatedData.department,
        cvUrl: validatedData.cvUrl,
        portal: validatedData.portal,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("[POST /api/careers/apply] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
