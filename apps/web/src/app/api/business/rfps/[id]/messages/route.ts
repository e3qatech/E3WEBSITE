import { NextResponse } from 'next/server';
import { requireClientRfpAccess, AppAuthError } from '@/lib/server-auth';
import db from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, lead } = await requireClientRfpAccess(id);

    if (!lead) {
      return NextResponse.json({ error: 'RFP not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const { message, subject } = body;

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json(
        { error: 'Message content is required (minimum 3 characters)' },
        { status: 400 }
      );
    }

    // Append new inquiry / message to this lead
    const inquiry = await db.inquiry.create({
      data: {
        leadId: lead.id,
        type: 'MESSAGE',
        subject: subject && typeof subject === 'string' ? subject.trim() : `Message from ${user.name || user.email}`,
        message: message.trim(),
        status: 'NEW',
      },
    });

    // Record activity log
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'CLIENT_MESSAGE',
        description: `New message submitted by client (${user.name || user.email}).`,
      },
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error submitting RFP message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
