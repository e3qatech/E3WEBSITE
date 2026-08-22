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
  message: z.string().min(1, 'Feedback message is required').max(2000),
  rating: z.union([z.string(), z.number()]).optional(),
  attractionId: z.string().optional(),
}).strict();

const supportTicketSchema = z.object({
  actionType: z.enum(['SUPPORT_TICKET', 'SUPPORT']),
  website_hp: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(20).optional(),
  category: z.string().max(100).optional(),
  attractionId: z.string().max(100).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required').max(2000),
  attachmentUrl: z.string().optional(),
  attachmentFileName: z.string().optional(),
}).strict();

const packageInquirySchema = z.object({
  actionType: z.enum(['PACKAGE_INQUIRY', 'INQUIRY']),
  website_hp: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required').max(2000),
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

    // 1. Enforce Request Body Size Limit (16 KB)
    const limitResp = enforceBodyLimit(req, 16 * 1024);
    if (limitResp) return limitResp;

    // 2. Rate Limiting (5 requests per minute per IP)
    const rl = await rateLimit(`rate_limit:b2c:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { actionType, website_hp } = body;

    // Honeypot bot protection
    if (website_hp) {
      return NextResponse.json({ success: true, status: 'ignored' }, { status: 201 });
    }

    if (!actionType) {
      return NextResponse.json({ error: 'Missing actionType' }, { status: 400 });
    }

    // Branch 1: Guest Feedback
    if (actionType === 'FEEDBACK') {
      const parsed = feedbackSchema.parse(body);
      const feedback = await db.feedback.create({
        data: {
          name: parsed.name || undefined,
          email: parsed.email || undefined,
          message: parsed.message,
          rating: parsed.rating ? parseInt(String(parsed.rating), 10) : null,
          attractionId: parsed.attractionId || undefined,
        },
      });

      // Dispatch admin feedback email notification
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

      return NextResponse.json({
        success: true,
        id: feedback.id,
        feedback,
      }, { status: 201 });
    }

    // Branch 2: Support Ticket Submission (Accepts both SUPPORT_TICKET and SUPPORT)
    if (actionType === 'SUPPORT_TICKET' || actionType === 'SUPPORT') {
      const parsed = supportTicketSchema.parse(body);
      
      let fullMessage = parsed.message;
      if (parsed.category) {
        fullMessage = `[Category: ${parsed.category}]\n\n${fullMessage}`;
      }
      if (parsed.attachmentFileName || parsed.attachmentUrl) {
        fullMessage += `\n\n[Attachment: ${parsed.attachmentFileName || 'Attached File'} (${parsed.attachmentUrl || ''})]`;
      }

      const inquiry = await db.inquiry.create({
        data: {
          type: 'SUPPORT',
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone || undefined,
          subject: parsed.subject || undefined,
          message: fullMessage,
        },
      });

      // Dispatch admin notification email
      getNotificationTargetEmail('SUPPORT').then(adminEmail => {
        safelySendEmail({
          to: adminEmail,
          subject: `[E3 Support Ticket] ${parsed.name} - Ticket #${inquiry.id}`,
          html: renderAdminSupportTicketEmail({
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            category: parsed.category,
            attractionId: parsed.attractionId,
            message: parsed.message,
            ticketId: inquiry.id,
          }),
          category: 'SUPPORT',
          replyTo: parsed.email,
        });
      });

      // Dispatch user auto-acknowledgment email
      safelySendEmail({
        to: parsed.email,
        subject: `[E3 Qatar] Support Request Received (#${inquiry.id})`,
        html: renderUserSupportTicketConfirmationEmail({
          name: parsed.name,
          ticketId: inquiry.id,
        }),
        category: 'SUPPORT',
      });

      return NextResponse.json({
        success: true,
        id: inquiry.id,
        ticketId: inquiry.id,
        inquiry,
      }, { status: 201 });
    }

    // Branch 3: Package Booking / General Inquiry
    if (actionType === 'PACKAGE_INQUIRY' || actionType === 'INQUIRY') {
      const parsed = packageInquirySchema.parse(body);
      const inquiry = await db.inquiry.create({
        data: {
          type: 'PACKAGE_BOOKING',
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone || undefined,
          subject: parsed.subject || 'Package Booking Inquiry',
          message: parsed.message,
        },
      });

      getNotificationTargetEmail('CONTACT').then(adminEmail => {
        safelySendEmail({
          to: adminEmail,
          subject: `[E3 Package Inquiry] ${parsed.name} - ${parsed.subject || 'Package Booking'}`,
          html: renderAdminGeneralInquiryEmail({
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            subject: parsed.subject,
            message: parsed.message,
          }),
          category: 'CONTACT',
          replyTo: parsed.email,
        });
      });

      return NextResponse.json({
        success: true,
        id: inquiry.id,
        inquiry,
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error('[CONTACT_B2C_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
