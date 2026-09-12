import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isHRAuthorized } from '@/lib/careers/job-eligibility';
import db from '@/lib/db';
import { enforceBodyLimit } from '@/lib/body-limit';
import { rateLimit } from '@/lib/rate-limit';
import { safelySendEmail, renderCustomCandidateReplyEmail } from '@/lib/email';
import { getEmailTemplateConfig } from '@/lib/email-templates';
import { z } from 'zod';

const replySchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  recipientEmail: z.string().email("Invalid recipient email").optional(),
  subject: z.string().min(2, "Subject is required").max(200),
  message: z.string().min(5, "Message is required").max(10000),
  nextSteps: z.string().max(1000).optional(),
  updateStatus: z.enum(["NEW", "REVIEWING", "INTERVIEW", "HIRED", "REJECTED"]).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userPermissions = (session.user as any)?.permissions;

    if (!isHRAuthorized(userRole, userPermissions)) {
      return NextResponse.json({ error: 'Forbidden: HR recruitment permissions required' }, { status: 403 });
    }

    const limitErr = enforceBodyLimit(req, 32 * 1024);
    if (limitErr) return limitErr;

    const rawBody = await req.json().catch(() => ({}));
    const validated = replySchema.parse(rawBody);

    const application = await db.jobApplication.findUnique({
      where: { id: validated.applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Candidate application not found' }, { status: 404 });
    }

    const recipientEmail = validated.recipientEmail || application.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: 'Candidate does not have a registered email address' }, { status: 400 });
    }

    const candidateName = `${application.firstName || ''} ${application.lastName || ''}`.trim() || 'Candidate';
    const emailConfig = await getEmailTemplateConfig();

    const htmlContent = renderCustomCandidateReplyEmail({
      name: candidateName,
      jobTitle: application.jobTitle,
      subject: validated.subject,
      message: validated.message,
      nextSteps: validated.nextSteps,
      config: emailConfig,
    });

    const dispatchResult = await safelySendEmail({
      to: recipientEmail,
      subject: validated.subject,
      html: htmlContent,
      category: 'CAREERS',
      replyTo: session.user.email || 'careers@e3.qa',
    });

    const isProduction =
      process.env.VERCEL_ENV === 'production' ||
      (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'production');

    if (!dispatchResult.success && isProduction) {
      return NextResponse.json({
        error: 'Failed to dispatch email reply to candidate',
        provider: dispatchResult.provider,
      }, { status: 502 });
    }

    // Optionally update status if specified
    if (validated.updateStatus && validated.updateStatus !== application.status) {
      await db.jobApplication.update({
        where: { id: application.id },
        data: { status: validated.updateStatus as any },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email reply sent successfully to candidate.',
      recipient: recipientEmail,
      messageId: dispatchResult.messageId || 'mock_reply_id',
    });
  } catch (error) {
    console.error('[POST /api/admin/careers/reply] error:', error);
    if (error instanceof z.ZodError) {
      const issue = error.issues?.[0] || (error as any).errors?.[0];
      return NextResponse.json({ error: issue?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error while sending email reply' }, { status: 500 });
  }
}
