import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { rateLimit } from '@/lib/rate-limit';
import { enforceBodyLimit } from '@/lib/body-limit';

const applicationSchema = z.object({
  website_hp: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  jobTitle: z.string().min(1, "Job title is required"),
  department: z.string().optional(),
  cvUrl: z.string().url("Valid CV URL is required"),
  cvText: z.string().optional(),
  portal: z.enum(["B2B", "B2C", "SHARED"]).default("SHARED")
}).strict();

// Simulated AI Parser Function
function simulateAIParse(text: string) {
  const lowercaseText = text.toLowerCase();
  
  // Extract Experience Level
  let experienceLevel = "Entry Level";
  if (lowercaseText.includes("senior") || lowercaseText.includes("lead") || lowercaseText.includes("10+ years") || lowercaseText.includes("5+ years")) {
    experienceLevel = "Senior";
  } else if (lowercaseText.includes("mid") || lowercaseText.includes("3+ years")) {
    experienceLevel = "Mid Level";
  }

  // Extract Skills
  const commonSkills = ["react", "node.js", "typescript", "python", "aws", "docker", "figma", "design", "marketing", "sales", "leadership", "next.js", "tailwind"];
  const extractedSkills = commonSkills.filter(skill => lowercaseText.includes(skill));

  // Extract Languages
  const commonLanguages = ["english", "arabic", "french", "spanish"];
  const extractedLanguages = commonLanguages.filter(lang => lowercaseText.includes(lang));

  return {
    experienceLevel,
    skills: extractedSkills.length > 0 ? extractedSkills : ["General"],
    languages: extractedLanguages.length > 0 ? extractedLanguages : ["English"],
  };
}

import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';

    // Body limit: 32KB for application submissions
    const limitResp = enforceBodyLimit(req, 32 * 1024);
    if (limitResp) return limitResp;

    const rl = await rateLimit(`rate_limit:careers:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    const body = await req.json();
    if (body.website_hp) {
      return NextResponse.json({ success: true, status: 'ignored' }, { status: 201 });
    }
    const validatedData = applicationSchema.parse(body);
    const cleanEmail = validatedData.email.trim().toLowerCase();

    const session = await auth();

    // 1. Check if user exists or create them
    let user = await db.user.findUnique({
      where: { email: cleanEmail }
    });

    if (user) {
      // If the current authenticated session is the same user, allow submitting additional applications
      if (session?.user?.id === user.id || (session?.user?.email && session.user.email.toLowerCase() === cleanEmail)) {
        // Authenticated user submitting another application - proceed
      } else {
        return NextResponse.json({
          error: 'An account with this email already exists. Please sign in to submit or track your application.',
          code: 'ACCOUNT_EXISTS',
          email: cleanEmail
        }, { status: 409 });
      }
    } else {
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      user = await db.user.create({
        data: {
          email: cleanEmail,
          name: `${validatedData.firstName.trim()} ${validatedData.lastName.trim()}`,
          password: hashedPassword,
          role: 'CANDIDATE' as any
        }
      });
    }

    // 2. Create the application and link it to the user
    const application = await db.jobApplication.create({
      data: {
        firstName: validatedData.firstName.trim(),
        lastName: validatedData.lastName.trim(),
        email: cleanEmail,
        phone: validatedData.phone?.trim() || null,
        jobTitle: validatedData.jobTitle.trim(),
        department: validatedData.department?.trim() || null,
        cvUrl: validatedData.cvUrl,
        portal: validatedData.portal,
        userId: user.id
      }
    });

    // 3. Simulated AI Parse and optional CRM Talent Record
    let parsedData = { experienceLevel: "Unknown", skills: [] as string[], languages: [] as string[] };
    if (validatedData.cvText) {
      parsedData = simulateAIParse(validatedData.cvText);
    } else {
      parsedData = simulateAIParse(validatedData.jobTitle + " " + (validatedData.department || ""));
    }

    let talentId: string | null = null;
    try {
      if ((db as any).talent) {
        const talent = await (db as any).talent.create({
          data: {
            name: `${validatedData.firstName.trim()} ${validatedData.lastName.trim()}`,
            email: cleanEmail,
            phone: validatedData.phone?.trim() || null,
            position: validatedData.jobTitle.trim(),
            department: validatedData.department?.trim() || null,
            resumeUrl: validatedData.cvUrl,
            experienceLevel: parsedData.experienceLevel,
            skills: parsedData.skills,
            languages: parsedData.languages,
            status: "NEW",
            notes: validatedData.cvText ? `[AI Summary] Candidate parsed from CV submission.` : undefined,
          }
        });
        talentId = talent.id;
      }
    } catch (_tErr) {
      // Talent creation is supplementary
    }

    return NextResponse.json({ success: true, application, talentId });
  } catch (error) {
    console.error("[POST /api/careers/apply] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
