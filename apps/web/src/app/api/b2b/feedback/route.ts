import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { enforceBodyLimit } from '@/lib/body-limit';
import { safelySendEmail, getNotificationTargetEmail, renderAdminFeedbackEmail } from '@/lib/email';

const feedbackSchema = z.object({
  website_hp: z.string().optional(),
  name: z.string().max(100).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  title: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required').max(3000),
  rating: z.union([z.number(), z.string()]).optional(),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';

    // 1. Enforce 16KB Body Limit
    const limitResp = enforceBodyLimit(req, 16 * 1024);
    if (limitResp) return limitResp;

    // 2. Rate Limiting (5 req/min per IP)
    const rl = await rateLimit(`rate_limit:b2b_feedback:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const parseResult = feedbackSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Invalid feedback data',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const data = parseResult.data;

    // Honeypot bot filter
    if (data.website_hp) {
      return NextResponse.json({ success: true, status: 'ignored' }, { status: 201 });
    }

    const parsedRating = data.rating ? parseInt(String(data.rating), 10) : null;

    const feedback = await db.feedback.create({
      data: {
        name: data.name || null,
        email: data.email || null,
        title: data.title || null,
        message: data.message,
        rating: isNaN(parsedRating as any) ? null : parsedRating,
      },
    });

    // Dispatch admin feedback email notification
    const adminEmail = await getNotificationTargetEmail('FEEDBACK');
    await safelySendEmail({
      to: adminEmail,
      subject: `[E3 B2B Feedback] ${data.title || 'New Feedback'} - ${data.name || 'Corporate Guest'}`,
      html: renderAdminFeedbackEmail({
        name: data.name || undefined,
        email: data.email || undefined,
        rating: parsedRating || null,
        message: `${data.title ? `[${data.title}]\n\n` : ''}${data.message}`,
      }),
      category: 'FEEDBACK',
      replyTo: data.email || undefined,
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
