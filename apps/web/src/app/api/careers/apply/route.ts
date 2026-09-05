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

import { auth } from '@/lib/auth';
import { parseResumeWithAI, getDomainExtraction } from '@/lib/careers/ai-cv-parser';

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

    // 3. Create the application and link it to the user with genuine AI parsing
    const candidateFullName = `${validatedData.firstName.trim()} ${validatedData.lastName.trim()}`;
    let parsedPayload: any = null;
    try {
      parsedPayload = await parseResumeWithAI({
        jobTitle: verifiedJobTitle,
        department: verifiedDepartment || undefined,
        candidateName: candidateFullName,
        email: cleanEmail,
        phone: validatedData.phone?.trim() || undefined,
        cvUrl: validatedData.cvUrl || undefined,
      });
    } catch (parseErr) {
      console.warn('[Apply Route] AI parse exception, falling back to domain extraction:', parseErr);
      const domainData = getDomainExtraction(verifiedJobTitle, verifiedDepartment || undefined, candidateFullName, cleanEmail);
      parsedPayload = {
        ...domainData,
        parsedAt: new Date().toISOString(),
        aiEngine: 'e3-domain-engine',
      };
    }

    const application = await db.jobApplication.create({
      data: {
        firstName: validatedData.firstName.trim(),
        lastName: validatedData.lastName.trim(),
        email: cleanEmail,
        phone: validatedData.phone?.trim() || null,
        jobTitle: verifiedJobTitle,
        department: verifiedDepartment,
        cvUrl: validatedData.cvUrl,
        cvParsedData: parsedPayload,
        portal: validatedData.portal,
        userId: user.id
      }
    });

    // 4. Optional CRM Talent Record
    let talentId: string | null = null;
    try {
      if ((db as any).talent) {
        const talent = await (db as any).talent.create({
          data: {
            name: candidateFullName,
            email: cleanEmail,
            phone: validatedData.phone?.trim() || null,
            position: verifiedJobTitle,
            department: verifiedDepartment,
            jobId: validatedData.jobId || null,
            resumeUrl: validatedData.cvUrl,
            experienceLevel: `${parsedPayload.experienceYears} Years`,
            skills: parsedPayload.skills,
            languages: ["English", "Arabic"],
            status: "NEW",
            notes: `[E3 AI] ${parsedPayload.summary}`,
          }
        });
        talentId = talent.id;
      }
    } catch (_tErr) {
      // Talent creation is supplementary
    }

    // 5. Dispatch HR notification & Candidate auto-acknowledgment before lambda exit
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
