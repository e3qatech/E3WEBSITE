import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const BulkBookingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  company: z.string().optional(),
  eventDetails: z.object({
    attractionName: z.string(),
    date: z.string(),
    time: z.string(),
    quantity: z.number().min(10),
    notes: z.string().optional(),
  })
});

export async function POST(req: NextRequest) {
  try {
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
