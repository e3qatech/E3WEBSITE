import { NextResponse } from 'next/server';
import { requireCandidateApplication, AppAuthError } from '@/lib/server-auth';
import db from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, application } = await requireCandidateApplication(id);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await request.json();
    const { message, subject } = body;

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json(
        { error: 'Note message must be at least 3 characters long' },
        { status: 400 }
      );
    }

    const currentData = (application.cvParsedData as any) || {};
    const existingNotes = Array.isArray(currentData.candidateNotes) ? currentData.candidateNotes : [];

    const newNote = {
      id: `note-${Date.now()}`,
      subject: subject && typeof subject === 'string' ? subject.trim() : null,
      message: message.trim(),
      senderName: user.name || user.email,
      senderEmail: user.email,
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...existingNotes];

    await db.jobApplication.update({
      where: { id: application.id },
      data: {
        cvParsedData: {
          ...currentData,
          candidateNotes: updatedNotes,
        },
      },
    });

    return NextResponse.json({
      success: true,
      note: newNote,
      message: 'Note attached to your application record successfully',
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error submitting candidate application note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
