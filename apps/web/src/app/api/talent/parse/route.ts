import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { isHRAuthorized } from '@/lib/careers/job-eligibility';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userPermissions = (session.user as any)?.permissions;
    if (!isHRAuthorized(userRole, userPermissions)) {
      return NextResponse.json({ error: 'Forbidden: HR permissions required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'application/pdf';
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let extractedData = {
      name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      email: `${file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, "")}@applicant.eeeqa.com`,
      phone: "+974",
      position: "General Applicant",
      department: "Operations",
      experienceLevel: "Mid-Level",
      skills: ["Event Engineering", "Operations"],
      notes: "Auto-ingested via Talent Resume Parser.",
    };

    if (apiKey) {
      try {
        const prompt = `You are an expert HR Talent Acquisition parser for E3 Qatar (Event Engineering Experts).
Analyze the provided CV/Resume file. Extract the following candidate details in strict JSON format:
{
  "name": "Candidate's full name",
  "email": "Candidate's primary email address",
  "phone": "Candidate's phone number with country code",
  "position": "Most relevant job title or target role (e.g. AV Engineer, Stage Manager, Lighting Designer, Production Lead)",
  "department": "Department (Operations, Creative, Engineering, Sales, HR, Executive)",
  "experienceLevel": "Junior, Mid-Level, Senior, Lead, or Director",
  "skills": ["List of top 3-8 technical and domain skills"],
  "notes": "A 1-2 sentence executive summary of candidate strengths and background"
}
Return ONLY valid JSON matching this schema.`;

        const base64Data = buffer.toString('base64');
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: mimeType === 'application/pdf' ? 'application/pdf' : 'text/plain',
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json();
          const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            extractedData = {
              name: parsed.name || extractedData.name,
              email: parsed.email || extractedData.email,
              phone: parsed.phone || extractedData.phone,
              position: parsed.position || extractedData.position,
              department: parsed.department || extractedData.department,
              experienceLevel: parsed.experienceLevel || extractedData.experienceLevel,
              skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : extractedData.skills,
              notes: parsed.notes ? `[Gemini AI] ${parsed.notes}` : extractedData.notes,
            };
          }
        } else {
          console.warn('[Talent AI Parse] Gemini API returned status:', geminiRes.status);
        }
      } catch (llmErr) {
        console.error('[Talent AI Parse] Gemini parsing error:', llmErr);
      }
    } else {
      extractedData.notes += " (Set GEMINI_API_KEY in .env.local to enable full multimodal AI parsing)";
    }

    const talent = await db.talent.create({
      data: {
        name: extractedData.name,
        email: extractedData.email,
        phone: extractedData.phone,
        position: extractedData.position,
        department: extractedData.department,
        experienceLevel: extractedData.experienceLevel,
        skills: extractedData.skills,
        notes: extractedData.notes,
        status: 'NEW',
      }
    });

    // Log telemetry
    await db.systemLog.create({
      data: {
        action: "TALENT_CV_PARSED",
        entity: `Talent (${talent.name})`,
        entityId: talent.id,
        userId: (session.user as any)?.id,
        metadata: { fileName: file.name, skills: extractedData.skills, aiPowered: !!apiKey },
      }
    });

    return NextResponse.json(talent);
  } catch (error) {
    console.error('Error parsing talent CV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
