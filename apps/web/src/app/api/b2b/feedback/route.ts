import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
