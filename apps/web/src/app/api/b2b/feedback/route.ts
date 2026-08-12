import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { safelySendEmail, getNotificationTargetEmail, renderAdminFeedbackEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, title, message, rating } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const feedback = await db.feedback.create({
      data: {
        name,
        email,
        title,
        message,
        rating: rating ? parseInt(rating) : null,
      }
    });

    // Dispatch admin feedback email notification (non-blocking)
    getNotificationTargetEmail('FEEDBACK').then(adminEmail => {
      safelySendEmail({
        to: adminEmail,
        subject: `[E3 B2B Feedback] ${title || 'New Feedback'} - ${name || 'Corporate Guest'}`,
        html: renderAdminFeedbackEmail({
          name: name || undefined,
          email: email || undefined,
          rating: rating || null,
          message: `${title ? `[${title}]\n\n` : ''}${message}`,
        }),
        category: 'FEEDBACK',
        replyTo: email || undefined,
      });
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
