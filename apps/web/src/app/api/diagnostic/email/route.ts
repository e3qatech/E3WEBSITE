import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'E3 Qatar <noreply@notifications.eeeqa.com>';
  const supportEmail = process.env.SUPPORT_NOTIFICATION_EMAIL || 'not set';
  const vercelEnv = process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown';

  let dispatchTestResult: any = null;
  if (hasResendKey) {
    dispatchTestResult = await sendEmail({
      to: 'delivered+e3-preview@resend.dev',
      subject: `[E3 Diagnostic Test] ${new Date().toISOString()}`,
      html: '<p>Direct diagnostic test from Preview deployment.</p>',
      category: 'SUPPORT',
    });
  }

  return NextResponse.json({
    status: 'ok',
    environment: vercelEnv,
    hasResendKey,
    fromAddress,
    supportEmail,
    dispatchTestResult,
  });
}
