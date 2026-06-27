import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType } = body;

    if (!actionType) {
      return NextResponse.json({ error: 'Missing actionType' }, { status: 400 });
    }

    if (actionType === 'PROJECT_REQUEST') {
      const { name, company, email, phone, message } = body;
      if (!name || !email || !message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Create a Lead and the associated Inquiry
      const result = await db.$transaction(async (tx) => {
        const lead = await tx.lead.create({
          data: {
            name,
            company,
            email,
            phone,
            status: 'NEW',
          }
        });

        const inquiry = await tx.inquiry.create({
          data: {
            type: 'PROJECT',
            name,
            email,
            phone,
            message,
            leadId: lead.id,
          }
        });

        return { lead, inquiry };
      });

      return NextResponse.json(result, { status: 201 });
    }

    if (actionType === 'MEETING_REQUEST') {
      const { name, company, email, phone, message, teamMemberId, startTime, endTime } = body;
      
      if (!name || !email || !teamMemberId || !startTime || !endTime) {
        return NextResponse.json({ error: 'Missing required fields for meeting request' }, { status: 400 });
      }

      const result = await db.$transaction(async (tx) => {
        const lead = await tx.lead.create({
          data: {
            name,
            company,
            email,
            phone,
            status: 'NEW',
          }
        });

        const inquiry = await tx.inquiry.create({
          data: {
            type: 'PROJECT',
            name,
            email,
            phone,
            message: `Meeting Request: ${message}`,
            leadId: lead.id,
          }
        });

        const slot = await tx.availabilitySlot.findFirst({
          where: {
            teamMemberId,
            startTime: new Date(startTime),
            isBooked: false,
          }
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
            description: message,
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
      const { name, email, phone, message } = body;
      if (!name || !email || !message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const inquiry = await db.inquiry.create({
        data: {
          type: 'GENERAL',
          name,
          email,
          phone,
          message,
        }
      });

      return NextResponse.json(inquiry, { status: 201 });
    }

    if (actionType === 'BOOK_MEETING') {
      const { title, description, startTime, endTime, isVirtual, slotId } = body;
      if (!title || !startTime || !endTime || !slotId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const result = await db.$transaction(async (tx) => {
        // Mark slot as booked
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
