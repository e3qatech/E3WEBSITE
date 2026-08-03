import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const BulkBookingSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(100),
  phone: z.string().min(5).max(20),
  company: z.string().max(100).optional(),
  eventDetails: z.object({
    attractionName: z.string().max(200),
    date: z.string().max(50),
    time: z.string().max(50),
    quantity: z.number().min(10).max(10000),
    notes: z.string().max(2000).optional(),
  }),
  website_hp: z.string().max(0, "Spam detected").optional()
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limitResult = await checkRateLimit(`rate_limit:bulk_booking:${ip}`, 5, 60);
    if (!limitResult.allowed) {
      if (limitResult.reason === 'redis_unavailable') {
        return NextResponse.json({ error: "Service Temporarily Unavailable" }, { status: 503, headers: { 'Retry-After': '60' } });
      }
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: limitResult.retryAfter ? { 'Retry-After': limitResult.retryAfter.toString() } : undefined });
    }

    const body = await req.json();
    
    // Validate payload
    const result = BulkBookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload', details: result.error.format() }, { status: 400 });
    }

    const { name, email, phone, company, eventDetails } = result.data;

    const messageBody = `GROUP BOOKING REQUEST
---------------------
Attraction/Event: ${eventDetails.attractionName}
Preferred Date: ${eventDetails.date}
Preferred Time: ${eventDetails.time}
Guest Quantity: ${eventDetails.quantity}

Additional Notes:
${eventDetails.notes || 'None provided.'}`;

    // Create a Lead and associated Inquiry
    const lead = await db.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        status: 'NEW',
        inquiries: {
          create: {
            type: 'GROUP_BOOKING',
            name,
            email,
            phone,
            message: messageBody,
            status: 'NEW'
          }
        }
      }
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });

  } catch (error: any) {
    console.error('[BULK_BOOKING_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
