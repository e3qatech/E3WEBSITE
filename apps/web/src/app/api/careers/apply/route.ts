import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { rateLimit } from '@/lib/rate-limit';
import { enforceBodyLimit } from '@/lib/body-limit';
import { isJobPubliclyEligible } from '@/lib/careers/job-eligibility';
import {
  safelySendEmail,
  getNotificationTargetEmail,
  renderHRApplicationNotificationEmail,
  renderApplicantConfirmationEmail,
} from '@/lib/email';

const applicationSchema = z.object({
  website_hp: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  jobId: z.string().optional(),
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

    // 1. Verify target job existence and eligibility if jobId is provided
    let verifiedJobTitle = validatedData.jobTitle.trim();
    let verifiedDepartment = validatedData.department?.trim() || null;

    if (validatedData.jobId) {
      const targetJob = await db.job.findUnique({
        where: { id: validatedData.jobId },
      });

      if (!targetJob) {
        return NextResponse.json(
          {
            error: 'The requested job posting was not found or has been removed.',
            code: 'JOB_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const eligibility = isJobPubliclyEligible(targetJob);
      if (!eligibility.eligible) {
        return NextResponse.json(
          {
            error: eligibility.reason || 'Applications for this position are closed or no longer accepting submissions.',
            errorAr: eligibility.reasonAr || 'باب التقديم لهذه الوظيفة مغلق حالياً.',
            code: 'JOB_CLOSED',
            eligibility,
          },
          { status: 422 }
        );
      }

      if (targetJob.title) verifiedJobTitle = targetJob.title;
      if (targetJob.department) verifiedDepartment = targetJob.department;
    }

    const session = await auth();

    // 2. Check if user exists or create them
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

    // 3. Create the application and link it to the user
    const application = await db.jobApplication.create({
      data: {
        firstName: validatedData.firstName.trim(),
        lastName: validatedData.lastName.trim(),
        email: cleanEmail,
        phone: validatedData.phone?.trim() || null,
        jobTitle: verifiedJobTitle,
        department: verifiedDepartment,
        cvUrl: validatedData.cvUrl,
        portal: validatedData.portal,
        userId: user.id
      }
    });

    // 4. Simulated AI Parse and optional CRM Talent Record
    let parsedData = { experienceLevel: "Unknown", skills: [] as string[], languages: [] as string[] };
    if (validatedData.cvText) {
      parsedData = simulateAIParse(validatedData.cvText);
    } else {
      parsedData = simulateAIParse(verifiedJobTitle + " " + (verifiedDepartment || ""));
    }

    let talentId: string | null = null;
    try {
      if ((db as any).talent) {
        const talent = await (db as any).talent.create({
          data: {
            name: `${validatedData.firstName.trim()} ${validatedData.lastName.trim()}`,
            email: cleanEmail,
            phone: validatedData.phone?.trim() || null,
            position: verifiedJobTitle,
            department: verifiedDepartment,
            jobId: validatedData.jobId || null,
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

    // 5. Dispatch HR notification & Candidate auto-acknowledgment before lambda exit
    const candidateFullName = `${validatedData.firstName.trim()} ${validatedData.lastName.trim()}`;
    const hrEmail = await getNotificationTargetEmail('CAREERS');
    await Promise.allSettled([
      safelySendEmail({
        to: hrEmail,
        subject: `[E3 Careers] New Application: ${candidateFullName} - ${verifiedJobTitle}`,
        html: renderHRApplicationNotificationEmail({
          name: candidateFullName,
          email: cleanEmail,
          phone: validatedData.phone,
          jobTitle: verifiedJobTitle,
          department: verifiedDepartment || undefined,
          applicationId: application.id,
          cvUrl: validatedData.cvUrl,
        }),
        category: 'CAREERS',
        replyTo: cleanEmail,
      }),
      safelySendEmail({
        to: cleanEmail,
        subject: `[E3 Qatar] Application Received: ${verifiedJobTitle}`,
        html: renderApplicantConfirmationEmail({
          name: candidateFullName,
          jobTitle: verifiedJobTitle,
          applicationId: application.id,
        }),
        category: 'CAREERS',
      })
    ]);

    return NextResponse.json({ success: true, application, talentId });
  } catch (error) {
    console.error("[POST /api/careers/apply] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
