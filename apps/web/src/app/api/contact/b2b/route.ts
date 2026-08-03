import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { requireApiSession } from '@/lib/auth-helpers';
import { z } from 'zod';

const projectRequestSchema = z.object({
  actionType: z.literal('PROJECT_REQUEST'),
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  message: z.string().min(2).max(2000),
  website_hp: z.string().max(0, "Spam detected").optional()
});

const meetingRequestSchema = z.object({
  actionType: z.literal('MEETING_REQUEST'),
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
  employeeProfileId: z.string().min(1).max(100),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  website_hp: z.string().max(0, "Spam detected").optional()
});

const generalInquirySchema = z.object({
  actionType: z.literal('GENERAL_INQUIRY'),
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  phone: z.string().max(20).optional(),
  message: z.string().min(2).max(2000),
  website_hp: z.string().max(0, "Spam detected").optional()
});

const bookMeetingSchema = z.object({
  actionType: z.literal('BOOK_MEETING'),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  isVirtual: z.boolean().optional(),
  slotId: z.string().min(1).max(100)
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limitResult = await checkRateLimit(`rate_limit:contact_b2b:${ip}`, 10, 60);
    if (!limitResult.allowed) {
      if (limitResult.reason === 'redis_unavailable') {
        return NextResponse.json({ error: "Service Temporarily Unavailable" }, { status: 503, headers: { 'Retry-After': '60' } });
      }
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: limitResult.retryAfter ? { 'Retry-After': limitResult.retryAfter.toString() } : undefined });
    }

    const body = await req.json();
    const { actionType } = body;

    if (!actionType) {
      return NextResponse.json({ error: 'Missing actionType' }, { status: 400 });
    }

    if (actionType === 'PROJECT_REQUEST') {
      const parseResult = projectRequestSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json({ error: 'Invalid data', details: parseResult.error.flatten().fieldErrors }, { status: 400 });
      }
      const { name, company, email, phone, message } = parseResult.data;

      const result = await db.$transaction(async (tx) => {
        const lead = await tx.lead.create({
          data: { name, company, email, phone, status: 'NEW' }
        });
        const inquiry = await tx.inquiry.create({
          data: { type: 'PROJECT', name, email, phone, message, leadId: lead.id }
        });
        return { lead, inquiry };
      });

      return NextResponse.json(result, { status: 201 });
    }

    if (actionType === 'MEETING_REQUEST') {
      const parseResult = meetingRequestSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json({ error: 'Invalid data', details: parseResult.error.flatten().fieldErrors }, { status: 400 });
      }
      const { name, company, email, phone, message, employeeProfileId, startTime, endTime } = parseResult.data;

      const result = await db.$transaction(async (tx) => {
        const lead = await tx.lead.create({
          data: { name, company, email, phone, status: 'NEW' }
        });
        const inquiry = await tx.inquiry.create({
          data: { type: 'PROJECT', name, email, phone, message: `Meeting Request: ${message || ''}`, leadId: lead.id }
        });

        const slot = await tx.availabilitySlot.findFirst({
          where: { employeeProfileId, startTime: new Date(startTime), isBooked: false }
        });

        if (slot) {
          await tx.availabilitySlot.update({
            where: { id: slot.id },
            data: { isBooked: true }
          });
        }

        const meeting = await tx.meeting.create({
          data: {
            title: `Initial Consultation with ${name}`,
            description: message || '',
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            isVirtual: true,
          }
        });

        return { lead, inquiry, meeting };
      });

      return NextResponse.json(result, { status: 201 });
    }

    if (actionType === 'GENERAL_INQUIRY') {
      const parseResult = generalInquirySchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json({ error: 'Invalid data', details: parseResult.error.flatten().fieldErrors }, { status: 400 });
      }
      const { name, email, phone, message } = parseResult.data;

      const inquiry = await db.inquiry.create({
        data: { type: 'GENERAL', name, email, phone, message }
      });

      return NextResponse.json(inquiry, { status: 201 });
    }

    if (actionType === 'BOOK_MEETING') {
      // Require authenticated session for direct slot booking
      const authResult = await requireApiSession();
      if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
      }

      const parseResult = bookMeetingSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json({ error: 'Invalid data', details: parseResult.error.flatten().fieldErrors }, { status: 400 });
      }
      const { title, description, startTime, endTime, isVirtual, slotId } = parseResult.data;

      const result = await db.$transaction(async (tx) => {
        await tx.availabilitySlot.update({
          where: { id: slotId },
          data: { isBooked: true },
        });

        const meeting = await tx.meeting.create({
          data: {
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            isVirtual: isVirtual ?? true,
          }
        });

        return meeting;
      });

      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    console.error('[CONTACT_B2B_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
