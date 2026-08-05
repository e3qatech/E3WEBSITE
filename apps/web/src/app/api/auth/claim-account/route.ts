import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// POST /api/auth/claim-account
// Handles both initiating claim (sending token) and completing claim (setting password)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, token, password, name } = body;

    // Action 1: Initiate account claim request
    if (action === 'request') {
      if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check if candidate has existing talent profile or job applications
      const talent = await (db as any).talent.findFirst({
        where: { email: cleanEmail }
      });
      const applicationsCount = await (db as any).jobApplication.count({
        where: { email: cleanEmail }
      });

      // Prevent email enumeration: return generic success regardless
      if (!talent && applicationsCount === 0) {
        return NextResponse.json({
          success: true,
          message: 'If an application exists for this email, a claim link has been dispatched.'
        });
      }

      // Check if user account already exists
      const existingUser = await db.user.findUnique({
        where: { email: cleanEmail }
      });

      if (existingUser) {
        return NextResponse.json({
          success: true,
          message: 'If an application exists for this email, a claim link has been dispatched.'
        });
      }

      // Create single-use 24-hour claim token
      const claimTokenStr = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await (db as any).accountClaimToken.create({
        data: {
          token: claimTokenStr,
          email: cleanEmail,
          talentId: talent?.id || null,
          expiresAt
        }
      });

      return NextResponse.json({
        success: true,
        message: 'If an application exists for this email, a claim link has been dispatched.',
        // Dev helper token output if in non-production for automated testing
        claimToken: process.env.NODE_ENV !== 'production' ? claimTokenStr : undefined
      });
    }

    // Action 2: Complete account claim with token + new password
    if (action === 'complete') {
      if (!token || !password) {
        return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
      }

      const claimRecord = await (db as any).accountClaimToken.findUnique({
        where: { token: String(token).trim() }
      });

      if (!claimRecord || claimRecord.usedAt || claimRecord.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Invalid, expired, or already used claim token' }, { status: 400 });
      }

      // Check if user was created while token was active
      let user = await db.user.findUnique({
        where: { email: claimRecord.email }
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      if (!user) {
        user = await db.user.create({
          data: {
            email: claimRecord.email,
            name: name || claimRecord.email.split('@')[0],
            password: hashedPassword,
            role: 'CANDIDATE',
            isActive: true,
            sessionVersion: 1
          }
        });
      }

      // Link Talent profile if present
      if (claimRecord.talentId) {
        await (db as any).talent.update({
          where: { id: claimRecord.talentId },
          data: { userId: user.id }
        });
      } else {
        // Find by email if not linked in token
        const talentByEmail = await (db as any).talent.findFirst({
          where: { email: claimRecord.email }
        });
        if (talentByEmail) {
          await (db as any).talent.update({
            where: { id: talentByEmail.id },
            data: { userId: user.id }
          });
        }
      }

      // Link past job applications only after email verification
      await (db as any).jobApplication.updateMany({
        where: { email: claimRecord.email },
        data: { userId: user.id }
      });

      // Mark token as used
      await (db as any).accountClaimToken.update({
        where: { id: claimRecord.id },
        data: { usedAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        message: 'Candidate account claimed successfully. You may now log in.',
        redirectUrl: '/en/login/careers'
      });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('[CLAIM_ACCOUNT_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
