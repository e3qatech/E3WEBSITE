import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { enforceBodyLimit } from '@/lib/body-limit';
import { sendEmail, renderPasswordResetEmail } from '@/lib/email';

const requestSchema = z.object({
  action: z.literal('request'),
  email: z.string().email('Valid email is required'),
  portal: z.string().optional(),
  locale: z.string().optional(),
}).strict();

const resetSchema = z.object({
  action: z.literal('reset'),
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';

    // 1. Enforce Request Body Size Limit (16 KB)
    const limitResp = enforceBodyLimit(req, 16 * 1024);
    if (limitResp) return limitResp;

    // 2. Per-IP Rate Limiting (5 attempts per minute)
    const rl = await rateLimit(`rate_limit:pwd_reset:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    // Action 1: Request Password Reset Token & Email Dispatch
    if (body.action === 'request') {
      const parseResult = requestSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: 'Valid email is required' },
          { status: 400 }
        );
      }

      const { email, portal } = parseResult.data;
      const cleanEmail = email.trim().toLowerCase();

      // Generic response to prevent account enumeration
      const genericSuccessResponse = {
        success: true,
        message: 'If an account exists, password reset instructions have been dispatched.',
      };

      // Check if user exists without revealing account existence
      const user = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user || !user.isActive) {
        return NextResponse.json(genericSuccessResponse);
      }

      // Invalidate any existing unused reset tokens for this email
      try {
        await (db as any).passwordResetToken.deleteMany({
          where: {
            email: cleanEmail,
            usedAt: null,
          },
        });
      } catch (_e) {
        // Non-blocking cleanup
      }

      // Generate single-use 1-hour reset token and store only SHA-256 hash
      const rawResetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await (db as any).passwordResetToken.create({
        data: {
          token: tokenHash,
          email: cleanEmail,
          portal: portal || 'admin',
          expiresAt,
        },
      });

      // Construct authoritative Password Reset URL
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'e3.qa';
      const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      const origin = `${protocol}://${host}`;
      const resetUrl = `${origin}/auth/reset-password?token=${encodeURIComponent(rawResetToken)}`;

      // Dispatch password reset email via Resend
      const emailResult = await sendEmail({
        to: cleanEmail,
        subject: '[E3 Qatar] Reset Your Account Password',
        html: renderPasswordResetEmail({
          name: user.name || cleanEmail,
          resetUrl,
        }),
        category: 'AUTH',
      });

      if (!emailResult.success && process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
        console.error('[PASSWORD_RESET_DISPATCH_FAILED] Email delivery failed in production');
      }

      return NextResponse.json({
        ...genericSuccessResponse,
        resetToken: process.env.NODE_ENV !== 'production' ? rawResetToken : undefined,
      });
    }

    // Action 2: Reset Password Completion with Token Invalidation
    if (body.action === 'reset') {
      const parseResult = resetSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: parseResult.error.issues[0]?.message || 'Invalid reset payload' },
          { status: 400 }
        );
      }

      const { token, password } = parseResult.data;
      const submittedHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

      let resetRecord = await (db as any).passwordResetToken.findUnique({
        where: { token: submittedHash },
      });

      if (!resetRecord) {
        // Fallback for legacy unhashed token records
        resetRecord = await (db as any).passwordResetToken.findUnique({
          where: { token: token.trim() },
        });
      }

      if (!resetRecord || resetRecord.usedAt || new Date(resetRecord.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Invalid, expired, or already used password reset token' },
          { status: 400 }
        );
      }

      const user = await db.user.findUnique({
        where: { email: resetRecord.email },
      });

      if (!user) {
        return NextResponse.json({ error: 'Associated user account not found' }, { status: 404 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const currentVersion = (user as any).sessionVersion || 1;

      // Update password and INCREMENT sessionVersion to revoke all existing active sessions
      await db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          sessionVersion: currentVersion + 1,
        },
      });

      // Mark token as used immediately
      await (db as any).passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });

      const portalKey = resetRecord.portal || 'admin';
      let redirectUrl = `/en/login/admin`;
      if (portalKey === 'staff') redirectUrl = `/en/login/staff`;
      if (portalKey === 'business') redirectUrl = `/en/login/business`;
      if (portalKey === 'careers') redirectUrl = `/en/login/careers`;

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully. Active sessions revoked. Please log in with your new password.',
        redirectUrl,
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('[PASSWORD_RESET_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
