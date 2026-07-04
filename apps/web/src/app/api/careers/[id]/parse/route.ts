import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Only allow admins to parse CVs
    const userRole = (session?.user as any)?.role;
    if (!session || !session.user || userRole === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const application = await db.jobApplication.findUnique({ where: { id } });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // SIMULATED PARSER: In a production app, you would download the PDF from application.cvUrl,
    // extract the text using pdf-parse, and send it to OpenAI for structured JSON extraction.
    // Here we simulate the AI extraction result.
    const simulatedExtraction = {
      skills: ["React", "Next.js", "TypeScript", "Node.js", "TailwindCSS"],
      experienceYears: Math.floor(Math.random() * 10) + 1,
      education: "Bachelor of Science in Computer Science",
      summary: `A highly motivated candidate with strong background in software development and proven experience in ${application.department || 'the industry'}.`,
      parsedAt: new Date().toISOString()
    };

    const updatedApplication = await db.jobApplication.update({
      where: { id },
      data: {
        cvParsedData: simulatedExtraction,
        status: "REVIEWING" // Automatically move to reviewing once parsed
      }
    });

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error("[POST /api/careers/:id/parse] error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
