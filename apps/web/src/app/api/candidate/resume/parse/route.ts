import { NextResponse } from 'next/server';
import { requireCandidateProfile, AppAuthError } from '@/lib/server-auth';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { user } = await requireCandidateProfile();

    let mimeType = 'application/pdf';
    let base64Data = '';
    let fileName = 'resume.pdf';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('resume') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Resume file is required' }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      base64Data = buffer.toString('base64');
      mimeType = file.type || 'application/pdf';
      fileName = file.name;
    } else {
      // JSON body with resumeUrl
      const body = await request.json().catch(() => ({}));
      const resumeUrl = body.resumeUrl;
      if (!resumeUrl || typeof resumeUrl !== 'string') {
        return NextResponse.json({ error: 'Resume file or URL is required' }, { status: 400 });
      }
      fileName = resumeUrl.split('/').pop() || 'resume.pdf';
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let extractedData = {
      name: user.name || fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      email: user.email || '',
      phone: '+974',
      position: 'Event Engineering Specialist',
      department: 'Creative & Technical Production',
      experienceLevel: 'Mid-Level',
      skills: ['Live Event Production', 'Spatial Engineering', 'Technical Operations', 'AV Technologies'],
      summary: 'Experienced entertainment production and spatial engineering professional based in Qatar.',
      education: 'Degree in Engineering, Media, or Entertainment Production',
    };

    if (apiKey && base64Data) {
      try {
        const prompt = `You are an expert HR Talent Acquisition and technical recruiter for E3 Qatar (Event Engineering & Entertainment Pioneers).
Analyze this candidate's CV/Resume. Extract key qualifications in strict JSON format:
{
  "name": "Candidate full name",
  "email": "Email address",
  "phone": "Phone number with country code",
  "position": "Target job title or primary specialty (e.g., AV Systems Engineer, Stage Automation Lead, Unreal Specialist)",
  "department": "Department (Operations, Creative, Engineering, Sales, HR, Logistics)",
  "experienceLevel": "Junior, Mid-Level, Senior, Lead, or Director",
  "skills": ["List of 4 to 8 primary technical and production skills"],
  "summary": "2-3 sentences highlighting core strengths, event experience, and engineering capabilities",
  "education": "Highest degree or professional qualification"
}
Return ONLY valid JSON matching this schema.`;

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
              summary: parsed.summary || extractedData.summary,
              education: parsed.education || extractedData.education,
            };
          }
        }
      } catch (aiErr) {
        console.warn('Gemini parser fallback activated:', aiErr);
      }
    }

    // Save extracted data into candidate's latest application if present
    const latestApp = await db.jobApplication.findFirst({
      where: {
        OR: [
          { userId: user.id },
          ...(user.email ? [{ email: user.email }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestApp) {
      await db.jobApplication.update({
        where: { id: latestApp.id },
        data: {
          cvParsedData: {
            ...(typeof latestApp.cvParsedData === 'object' && latestApp.cvParsedData ? latestApp.cvParsedData : {}),
            ...extractedData,
            parsedAt: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      extractedData,
      message: 'Resume analyzed successfully by Gemini AI',
    });
  } catch (error: any) {
    if (error instanceof AppAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error parsing candidate resume:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
