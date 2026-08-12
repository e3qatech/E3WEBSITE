import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { enforceBodyLimit } from '@/lib/body-limit';
import {
  safelySendEmail,
  getNotificationTargetEmail,
  renderAdminProjectRequestEmail,
  renderAdminGeneralInquiryEmail,
} from '@/lib/email';

const projectRequestSchema = z.object({
  actionType: z.literal('PROJECT_REQUEST'),
  website_hp: z.string().optional(),
  name: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().min(1).max(2000),
}).strict();

const meetingRequestSchema = z.object({
  actionType: z.literal('MEETING_REQUEST'),
  website_hp: z.string().optional(),
  name: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
  employeeProfileId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
}).strict();

const generalInquirySchema = z.object({
  actionType: z.literal('GENERAL_INQUIRY'),
  website_hp: z.string().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().min(1).max(2000),
}).strict();

const bookMeetingSchema = z.object({
  actionType: z.literal('BOOK_MEETING'),
  website_hp: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  isVirtual: z.boolean().optional(),
  slotId: z.string(),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';

    // Body limit: 16KB for JSON form submissions
    const limitResp = enforceBodyLimit(req, 16 * 1024);
    if (limitResp) return limitResp;

    const rl = await rateLimit(`rate_limit:b2b:${ip}`, 5, 60, false);
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

    if (actionType === 'PROJECT_REQUEST') {
      const parsed = projectRequestSchema.parse(body);
      
      const result = await db.$transaction(async (tx: any) => {
        const lead = await tx.lead.create({
          data: {
            name: parsed.name,
            company: parsed.company,
            email: parsed.email,
            phone: parsed.phone,
            status: 'NEW',
          }
        });

        const inquiry = await tx.inquiry.create({
          data: {
            type: 'PROJECT',
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            message: parsed.message,
            leadId: lead.id,
          }
        });

        return { lead, inquiry };
      });

      // Dispatch admin project request notification (non-blocking)
      getNotificationTargetEmail('PROJECT').then(adminEmail => {
        safelySendEmail({
          to: adminEmail,
          subject: `[E3 B2B Project Lead] ${parsed.name} (${parsed.company || 'Direct'})`,
          html: renderAdminProjectRequestEmail({
            name: parsed.name,
            company: parsed.company,
            email: parsed.email,
            phone: parsed.phone,
            message: parsed.message,
            leadId: result.lead.id,
          }),
          category: 'PROJECT',
          replyTo: parsed.email,
        });
      });

      return NextResponse.json(result, { status: 201 });
    }

    if (actionType === 'MEETING_REQUEST') {
      const parsed = meetingRequestSchema.parse(body);
      
      const result = await db.$transaction(async (tx: any) => {
        const lead = await tx.lead.create({
          data: {
            name: parsed.name,
            company: parsed.company,
            email: parsed.email,
            phone: parsed.phone,
            status: 'NEW',
          }
        });

        const inquiry = await tx.inquiry.create({
          data: {
            type: 'PROJECT',
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            message: `Meeting Request: ${parsed.message || ''}`,
            leadId: lead.id,
          }
        });

        // Atomic slot claim — updateMany with availability predicate
        const slotClaim = await tx.availabilitySlot.updateMany({
          where: {
            employeeProfileId: parsed.employeeProfileId,
            startTime: new Date(parsed.startTime),
            isBooked: false,
          },
          data: { isBooked: true },
        });
        // slotClaim.count === 0 means no available slot (already booked or non-existent)
        if (slotClaim.count === 0) {
          console.warn(`[CONTACT_B2B] No available slot for employee ${parsed.employeeProfileId} at ${parsed.startTime}`);
        }

        const meeting = await tx.meeting.create({
          data: {
            title: `Initial Consultation with ${parsed.name}`,
            description: parsed.message || '',
            startTime: new Date(parsed.startTime),
            endTime: new Date(parsed.endTime),
            isVirtual: true,
          }
        });

        return { lead, inquiry, meeting };
      });

      // Dispatch admin lead email notification
      getNotificationTargetEmail('CONTACT').then(adminEmail => {
        safelySendEmail({
          to: adminEmail,
          subject: `[E3 B2B Meeting Request] ${parsed.name} (${parsed.company || 'Corporate'})`,
          html: renderAdminProjectRequestEmail({
            name: parsed.name,
            company: parsed.company,
            email: parsed.email,
            phone: parsed.phone,
            message: `Consultation Requested for ${new Date(parsed.startTime).toLocaleString()}\n\nNote: ${parsed.message || 'None'}`,
            leadId: result.lead.id,
          }),
          category: 'CONTACT',
          replyTo: parsed.email,
        });
      });

      return NextResponse.json(result, { status: 201 });
    }

    if (actionType === 'GENERAL_INQUIRY') {
      const parsed = generalInquirySchema.parse(body);
      const inquiry = await db.inquiry.create({
        data: {
          type: 'GENERAL',
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          message: parsed.message,
        }
      });

      // Dispatch admin general inquiry email notification
      getNotificationTargetEmail('CONTACT').then(adminEmail => {
        safelySendEmail({
          to: adminEmail,
          subject: `[E3 B2B General Inquiry] ${parsed.name}`,
          html: renderAdminGeneralInquiryEmail({
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            message: parsed.message,
          }),
          category: 'CONTACT',
          replyTo: parsed.email,
        });
      });

      return NextResponse.json(inquiry, { status: 201 });
    }

    if (actionType === 'BOOK_MEETING') {
      const parsed = bookMeetingSchema.parse(body);
      const result = await db.$transaction(async (tx: any) => {
        // Atomic slot claim — updateMany with isBooked predicate prevents TOCTOU race
        const slotClaim = await tx.availabilitySlot.updateMany({
          where: { id: parsed.slotId, isBooked: false },
          data: { isBooked: true },
        });
        if (slotClaim.count === 0) {
          throw new Error('Slot unavailable');
        }

        const meeting = await tx.meeting.create({
          data: {
            title: parsed.title,
            description: parsed.description || '',
            startTime: new Date(parsed.startTime),
            endTime: new Date(parsed.endTime),
            isVirtual: parsed.isVirtual ?? true,
          }
        });
        return meeting;
      });
      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid actionType' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    console.error('[CONTACT_B2B_POST]', error);
    // Redact internal error message
    const isSlotError = error.message === 'Slot unavailable';
    return NextResponse.json({ error: isSlotError ? error.message : 'Internal Server Error' }, { status: isSlotError ? 409 : 500 });
  }
}
