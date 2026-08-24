import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { enforceBodyLimit } from '@/lib/body-limit';
import { sendEmail, renderNewsletterVerificationEmail } from '@/lib/email';

const subscribeSchema = z.object({
  actionType: z.enum(['SUBSCRIBE', 'VERIFY']),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().max(20).optional(),
  token: z.string().optional(),
  preferences: z.any().optional(),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';

    // 1. Body Limit (4KB)
    const limitResp = enforceBodyLimit(req, 4 * 1024);
    if (limitResp) return limitResp;

    // 2. Rate Limiting (5 requests per minute per IP)
    const rl = await rateLimit(`rate_limit:subscribe:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const parsed = subscribeSchema.parse(body);
    const { actionType, email, phone, token, preferences } = parsed;

    if (actionType === 'SUBSCRIBE') {
      if (!email && !phone) {
        return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
      }

      const cleanEmail = email ? email.trim().toLowerCase() : null;
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Check if subscriber exists
      let subscriber = null;
      if (cleanEmail) subscriber = await db.subscriber.findUnique({ where: { email: cleanEmail } });
      if (!subscriber && phone) subscriber = await db.subscriber.findUnique({ where: { phone } });

      if (subscriber) {
        // If already verified, do not send duplicate verification
        if (subscriber.isVerified) {
          return NextResponse.json({
            success: true,
            message: 'You are already subscribed and verified.',
          }, { status: 200 });
        }

        // Update verification token for unverified subscriber
        await db.subscriber.update({
          where: { id: subscriber.id },
          data: {
            token: verificationToken,
            preferences: preferences || subscriber.preferences,
          }
        });
      } else {
        await db.subscriber.create({
          data: {
            email: cleanEmail,
            phone: phone || null,
            token: verificationToken,
            isVerified: false, // Never auto-verify on submit!
            preferences: preferences || { all: true },
          }
        });
      }

      // Build authoritative verification URL
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'e3.qa';
      const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      const origin = `${protocol}://${host}`;
      const verificationUrl = `${origin}/api/subscribe?token=${encodeURIComponent(verificationToken)}`;

      // Dispatch verification email
      if (cleanEmail) {
        await sendEmail({
          to: cleanEmail,
          subject: '[E3 Qatar] Confirm Your Newsletter Subscription',
          html: renderNewsletterVerificationEmail({
            email: cleanEmail,
            verificationUrl,
          }),
          category: 'NEWSLETTER',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription created. Please check your email to confirm your subscription.',
      }, { status: 201 });
    }

    if (actionType === 'VERIFY') {
      if (!token) {
        return NextResponse.json({ error: 'Missing verification token' }, { status: 400 });
      }

      const subscriber = await db.subscriber.findUnique({
        where: { token: token.trim() }
      });

      if (!subscriber) {
        return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
      }

      if (subscriber.isVerified) {
        return NextResponse.json({ success: true, message: 'Already verified' });
      }

      await db.subscriber.update({
        where: { id: subscriber.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          token: null, // Invalidate token after use
        }
      });

      return NextResponse.json({ success: true, message: 'Successfully verified subscription!' });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error('[SUBSCRIBE_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing verification token' }, { status: 400 });
    }

    const subscriber = await db.subscriber.findUnique({
      where: { token: token.trim() }
    });

    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    if (!subscriber.isVerified) {
      await db.subscriber.update({
        where: { id: subscriber.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          token: null,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully confirmed! Welcome to E3 Qatar updates.',
    });
  } catch (error: any) {
    console.error('[SUBSCRIBE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
