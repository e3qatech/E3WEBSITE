import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { sendEmail } from '@/lib/email';
import { enforceBodyLimit } from '@/lib/body-limit';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  const userRole = (session.user as any)?.role;
  const isAuthorized = hasPermission(userRole, 'settings.general.manage');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for') || 'admin_user';
  const rl = await rateLimit(`admin_email_test:${ip}`, 5, 60);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many test requests. Please wait a minute.' }, { status: 429 });
  }

  const limitErr = enforceBodyLimit(req, 8 * 1024);
  if (limitErr) return limitErr;

  try {
    const body = await req.json().catch(() => ({}));
    const userEmail = session.user.email || 'admin@e3.qa';
    const testRecipient = body.recipientEmail || userEmail;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testRecipient)) {
      return NextResponse.json({ error: 'Invalid recipient email address format' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const result = await sendEmail({
      to: testRecipient,
      subject: `[E3 Admin] Email Delivery Diagnostic Test (${timestamp})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #09090b; color: #fafafa; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color: #10b981; margin-top: 0;">E3 Qatar Email Gateway Test</h2>
          <p>This is an automated diagnostic email triggered by an authorized administrator (<strong>${session.user.name || session.user.email}</strong>).</p>
          <div style="background: rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 12px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${timestamp}</p>
            <p style="margin: 4px 0;"><strong>Recipient:</strong> ${testRecipient}</p>
            <p style="margin: 4px 0;"><strong>Environment:</strong> ${process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'}</p>
          </div>
          <p style="color: #a1a1aa; font-size: 12px;">If you received this message, outbound transactional email delivery via Resend is operational.</p>
        </div>
      `,
      category: 'CONTACT',
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        provider: result.provider,
        error: result.error || 'Outbound email delivery failed',
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      provider: result.provider,
      messageId: result.messageId,
      recipient: testRecipient,
      message: 'Diagnostic test email dispatched successfully.',
    });
  } catch (error) {
    console.error('[POST /api/admin/email/test] error:', error);
    return NextResponse.json({ error: 'Internal server error while dispatching test email' }, { status: 500 });
  }
}
