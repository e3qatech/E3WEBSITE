import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// POST /api/auth/password-reset
// Handles forgot-password request (generic success) and reset-password completion (sessionVersion revocation)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, portal, token, password } = body;

    // Action 1: Forgot password request
    if (action === 'request') {
      if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check if user exists without revealing account existence
      const user = await db.user.findUnique({
        where: { email: cleanEmail }
      });

      if (!user || !user.isActive) {
        return NextResponse.json({
          success: true,
          message: 'If an account exists, password reset instructions have been dispatched.'
        });
      }

      // Generate single-use 1-hour reset token
      const resetTokenStr = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await (db as any).passwordResetToken.create({
        data: {
          token: resetTokenStr,
          email: cleanEmail,
          portal: portal || 'admin',
          expiresAt
        }
      });

      return NextResponse.json({
        success: true,
        message: 'If an account exists, password reset instructions have been dispatched.',
        resetToken: process.env.NODE_ENV !== 'production' ? resetTokenStr : undefined
      });
    }

    // Action 2: Reset password completion
    if (action === 'reset') {
      if (!token || !password) {
        return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
      }

      const resetRecord = await (db as any).passwordResetToken.findUnique({
        where: { token: String(token).trim() }
      });

      if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Invalid, expired, or already used password reset token' }, { status: 400 });
      }

      const user = await db.user.findUnique({
        where: { email: resetRecord.email }
      });

      if (!user) {
        return NextResponse.json({ error: 'Associated user account not found' }, { status: 404 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const currentVersion = (user as any).sessionVersion || 1;

      // Update password and INCREMENT sessionVersion to revoke all active sessions
      await db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          sessionVersion: currentVersion + 1
        }
      });

      // Mark token as used
      await (db as any).passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() }
      });

      const portalKey = resetRecord.portal || 'admin';
      let redirectUrl = `/en/login/admin`;
      if (portalKey === 'staff') redirectUrl = `/en/login/staff`;
      if (portalKey === 'business') redirectUrl = `/en/login/business`;
      if (portalKey === 'careers') redirectUrl = `/en/login/careers`;

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully. Active sessions revoked. Please log in with your new password.',
        redirectUrl
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('[PASSWORD_RESET_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
