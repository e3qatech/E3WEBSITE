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
  locale: z.enum(['en', 'ar']).optional(),
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

function resolveAuthoritativeOrigin(): string {
  const configuredOrigin = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL;
  if (configuredOrigin) {
    let normalized = configuredOrigin.trim().replace(/\/+$/, '');
    if (process.env.NODE_ENV === 'production' && !normalized.startsWith('https://')) {
      normalized = normalized.replace(/^http:\/\//, 'https://');
    }
    return normalized;
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://eeeqa.com';
  }

  return 'http://localhost:3000';
}

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

      const { email, portal, locale } = parseResult.data;
      const cleanEmail = email.trim().toLowerCase();
      const resolvedLocale = locale === 'ar' ? 'ar' : 'en';

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
        await db.verificationToken.deleteMany({
          where: {
            identifier: { startsWith: `pwd_reset:${cleanEmail}:` },
          },
        });
      } catch (_e) {
        // Non-blocking cleanup
      }

      // Generate single-use 1-hour reset token and store only SHA-256 hash
      const rawResetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      const identifier = `pwd_reset:${cleanEmail}:${portal || 'staff'}`;

      await db.verificationToken.create({
        data: {
          token: tokenHash,
          identifier,
          expires: expiresAt,
        },
      });

      // Construct authoritative Password Reset URL using server-controlled origin (Host header ignored)
      const baseOrigin = resolveAuthoritativeOrigin();
      const resetUrl = `${baseOrigin}/${resolvedLocale}/auth/reset-password?token=${encodeURIComponent(rawResetToken)}`;

      // Dispatch password reset email via Resend
      const emailResult = await sendEmail({
        to: cleanEmail,
        subject: resolvedLocale === 'ar' ? '[E3 قطر] إعادة تعيين كلمة مرور الحساب' : '[E3 Qatar] Reset Your Account Password',
        html: renderPasswordResetEmail({
          name: user.name || cleanEmail,
          resetUrl,
        }),
        category: 'AUTH',
      });

      if (!emailResult.success && process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
        console.error('[PASSWORD_RESET_DISPATCH_FAILED] Email delivery failed in production');
      }

      // Return raw token strictly only when executed under Vitest test runner
      const isExplicitTestMode = process.env.NODE_ENV === 'test' && process.env.VITEST === 'true';

      return NextResponse.json({
        ...genericSuccessResponse,
        resetToken: isExplicitTestMode ? rawResetToken : undefined,
      });
    }

    // Action 2: Reset Password Completion with Atomic Invalidation
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

      try {
        const result = await (db as any).$transaction(async (tx: any) => {
          // 1. Atomic token lookup and single-use validation
          const resetRecord = await tx.verificationToken.findUnique({
            where: { token: submittedHash },
          });

          if (
            !resetRecord ||
            !resetRecord.identifier?.startsWith('pwd_reset:') ||
            resetRecord.expires <= new Date()
          ) {
            throw new Error('INVALID_OR_EXPIRED_TOKEN');
          }

          // Single-use enforcement: Delete token atomically within transaction
          await tx.verificationToken.delete({
            where: { token: submittedHash },
          });

          const parts = resetRecord.identifier.split(':');
          const email = parts[1];
          const portalKey = parts[2] || 'staff';

          const user = await tx.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error('USER_NOT_FOUND');
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const currentVersion = user.sessionVersion || 1;

          // 2. Update password and increment sessionVersion to revoke all existing sessions
          await tx.user.update({
            where: { id: user.id },
            data: {
              password: hashedPassword,
              sessionVersion: currentVersion + 1,
            },
          });

          return { portal: portalKey };
        });

        const portalKey = result.portal;
        let redirectUrl = `/en/login/admin`;
        if (portalKey === 'staff') redirectUrl = `/en/login/staff`;
        if (portalKey === 'business') redirectUrl = `/en/login/business`;
        if (portalKey === 'careers') redirectUrl = `/en/login/careers`;

        return NextResponse.json({
          success: true,
          message: 'Password has been reset successfully. Please log in with your new credentials.',
          redirectUrl,
        });

      } catch (txError: any) {
        if (txError.message === 'INVALID_OR_EXPIRED_TOKEN') {
          return NextResponse.json(
            { error: 'Invalid, expired, or already used password reset token' },
            { status: 400 }
          );
        }
        if (txError.message === 'USER_NOT_FOUND') {
          return NextResponse.json({ error: 'Associated user account not found' }, { status: 404 });
        }
        console.error('[Password Reset Transaction Error]', txError);
        return NextResponse.json({ error: 'Failed to complete password reset' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Password Reset Unhandled Exception]', error);
    return NextResponse.json({ error: 'Internal server error processing password reset' }, { status: 500 });
  }
}
