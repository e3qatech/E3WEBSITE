import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { enforceBodyLimit } from '@/lib/body-limit';
import {
  safelySendEmail,
  getNotificationTargetEmail,
  renderAdminSupportTicketEmail,
  renderUserSupportTicketConfirmationEmail,
  renderAdminFeedbackEmail,
  renderAdminGeneralInquiryEmail,
} from '@/lib/email';

const feedbackSchema = z.object({
  actionType: z.literal('FEEDBACK'),
  website_hp: z.string().optional(),
  name: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().min(1).max(2000),
  rating: z.union([z.string(), z.number()]).optional(),
  attractionId: z.string().optional(),
}).strict();

const supportTicketSchema = z.object({
  actionType: z.literal('SUPPORT_TICKET'),
  website_hp: z.string().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().min(1).max(2000),
}).strict();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const attractionId = searchParams.get('attractionId');

    const cacheKey = `b2c:faqs:${attractionId || 'all'}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const faqs = await db.attractionFaq.findMany({
      where: attractionId ? { attractionId } : undefined,
      orderBy: { orderIndex: 'asc' },
      include: attractionId ? undefined : {
        attraction: {
          select: { nameEn: true, nameAr: true }
        }
      }
    });

    await redis.set(cacheKey, JSON.stringify(faqs), 'EX', 3600);
    return NextResponse.json(faqs);
  } catch (error: any) {
    console.error('[CONTACT_B2C_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';

    // Body limit: 16KB for JSON form submissions
    const limitResp = enforceBodyLimit(req, 16 * 1024);
    if (limitResp) return limitResp;

    const rl = await rateLimit(`rate_limit:b2c:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    const body = await req.json();
    const { actionType, website_hp } = body;

    // Honeypot check
    if (website_hp) {
      return NextResponse.json({ success: true, status: 'ignored' }, { status: 201 });
    }

    if (!actionType) {
      return NextResponse.json({ error: 'Missing actionType' }, { status: 400 });
    }

    if (actionType === 'FEEDBACK') {
      const parsed = feedbackSchema.parse(body);
      const feedback = await db.feedback.create({
        data: {
          name: parsed.name,
          email: parsed.email || undefined,
          message: parsed.message,
          rating: parsed.rating ? parseInt(String(parsed.rating), 10) : null,
          attractionId: parsed.attractionId,
        }
      });

      // Dispatch admin feedback email notification (non-blocking)
      getNotificationTargetEmail('FEEDBACK').then(adminEmail => {
        safelySendEmail({
          to: adminEmail,
          subject: `[E3 Qatar Feedback] Rating: ${parsed.rating || 'N/A'} - ${parsed.name || 'Anonymous'}`,
          html: renderAdminFeedbackEmail({
            name: parsed.name,
            email: parsed.email,
            rating: parsed.rating,
            attractionId: parsed.attractionId,
            message: parsed.message,
          }),
          category: 'FEEDBACK',
          replyTo: parsed.email || undefined,
        });
      });

      return NextResponse.json(feedback, { status: 201 });
    }

    if (actionType === 'SUPPORT_TICKET') {
      const parsed = supportTicketSchema.parse(body);
      const inquiry = await db.inquiry.create({
        data: {
          type: 'SUPPORT',
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          message: parsed.message,
        }
      });

      // Dispatch admin notification email (non-blocking)
      getNotificationTargetEmail('SUPPORT').then(adminEmail => {
        safelySendEmail({
          to: adminEmail,
          subject: `[E3 Support Ticket] ${parsed.name} - Inquiry #${inquiry.id}`,
          html: renderAdminSupportTicketEmail({
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            message: parsed.message,
            ticketId: inquiry.id,
          }),
          category: 'SUPPORT',
          replyTo: parsed.email,
        });
      });

      // Dispatch user confirmation auto-acknowledgment email
      safelySendEmail({
        to: parsed.email,
        subject: `[E3 Qatar] Support Request Received (#${inquiry.id})`,
        html: renderUserSupportTicketConfirmationEmail({
          name: parsed.name,
          ticketId: inquiry.id,
        }),
        category: 'SUPPORT',
      });

      return NextResponse.json(inquiry, { status: 201 });
    }

    if (actionType === 'PACKAGE_INQUIRY' || actionType === 'INQUIRY' || body.subject?.includes('Package')) {
      const inquiry = await db.inquiry.create({
        data: {
          type: 'PACKAGE_BOOKING',
          name: body.name || body.fullName || 'Guest',
          email: body.email || 'guest@e3.qa',
          phone: body.phone || null,
          message: body.message || `Subject: ${body.subject || 'Package Booking Inquiry'}`,
        }
      });

      // Dispatch admin notification email
      getNotificationTargetEmail('CONTACT').then(adminEmail => {
        safelySendEmail({
          to: adminEmail,
          subject: `[E3 Package Inquiry] ${body.name || 'Guest'} - ${body.subject || 'Package Booking'}`,
          html: renderAdminGeneralInquiryEmail({
            name: body.name || 'Guest',
            email: body.email || 'guest@e3.qa',
            phone: body.phone,
            subject: body.subject || 'Package Booking Inquiry',
            message: body.message || 'No description provided.',
          }),
          category: 'CONTACT',
          replyTo: body.email && body.email !== 'guest@e3.qa' ? body.email : undefined,
        });
      });

      return NextResponse.json(inquiry, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    console.error('[CONTACT_B2C_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
