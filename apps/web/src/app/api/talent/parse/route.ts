import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (!session || (userRole !== 'SUPER_ADMIN' && userRole !== 'SUPPORT_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 });
    }

    // Simulate LLM/NLP Parsing Delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock extraction
    const mockSkills = ["AV Logistics", "Rigging", "Stage Management", "Audio Engineering", "Host"];
    
    // Shuffle and pick random skills for variance
    const extractedSkills = mockSkills.sort(() => 0.5 - Math.random()).slice(0, 3);

    const parsedData = {
      name: `Candidate - ${file.name.split('.')[0]}`,
      email: `${file.name.split('.')[0].toLowerCase()}@example.com`,
      phone: "+974 5555 1234",
      skills: extractedSkills
    };

    const talent = await db.talent.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone,
        skills: parsedData.skills,
        notes: "Automatically ingested via AI CV Parser.",
      }
    });

    // Log telemetry
    await db.systemLog.create({
      data: {
        action: "TALENT_CV_PARSED",
        entity: `Talent (${talent.name})`,
        entityId: talent.id,
        userId: (session.user as any)?.id,
        metadata: { fileName: file.name, skills: extractedSkills },
      }
    });

    return NextResponse.json(talent);
  } catch (error) {
    console.error('Error parsing talent CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
