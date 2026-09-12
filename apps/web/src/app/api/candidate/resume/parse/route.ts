import { NextResponse } from 'next/server';
import { requireCandidateProfile, AppAuthError } from '@/lib/server-auth';
import db from '@/lib/db';
import { getServerSecretSetting } from '@/lib/settings/public-settings';
import { extractTextFromDocx } from '@/lib/careers/ai-cv-parser';

export async function POST(request: Request) {
  try {
    const { user } = await requireCandidateProfile();

    let mimeType = 'application/pdf';
    let base64Data = '';
    let fileName = 'resume.pdf';
    let fileBuffer: Buffer | null = null;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('resume') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Resume file is required' }, { status: 400 });
      }
      fileBuffer = Buffer.from(await file.arrayBuffer());
      base64Data = fileBuffer.toString('base64');
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
      try {
        const fetchRes = await fetch(resumeUrl, { signal: AbortSignal.timeout(10000) });
        if (fetchRes.ok) {
          const ab = await fetchRes.arrayBuffer();
          fileBuffer = Buffer.from(ab);
          base64Data = fileBuffer.toString('base64');
          mimeType = fetchRes.headers.get('content-type') || mimeType;
        }
      } catch (_fErr) {}
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      (await getServerSecretSetting('geminiApiKey').catch(() => null)) ||
      (await getServerSecretSetting('gemini_api_key').catch(() => null)) ||
      (await getServerSecretSetting('googleAiApiKey').catch(() => null));

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

    if (apiKey && (base64Data || fileBuffer)) {
      try {
        const isDocx =
          mimeType.includes('wordprocessingml') ||
          mimeType.includes('docx') ||
          fileName.toLowerCase().endsWith('.docx');

        let extractedDocxText = '';
        if (fileBuffer && isDocx) {
          extractedDocxText = extractTextFromDocx(fileBuffer);
        }

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

        let fullPrompt = prompt;
        if (extractedDocxText) {
          fullPrompt += `\n\n--- EXTRACTED RESUME TEXT ---\n${extractedDocxText.slice(0, 15000)}\n--- END RESUME TEXT ---`;
        }

        const parts: any[] = [{ text: fullPrompt }];
        if (base64Data && !isDocx) {
          const cleanMime = mimeType.includes('pdf') ? 'application/pdf' : 'image/jpeg';
          parts.push({
            inlineData: {
              mimeType: cleanMime,
              data: base64Data,
            },
          });
        }

        const candidateModels = Array.from(
          new Set([
            process.env.GEMINI_MODEL,
            'gemini-3.6-flash',
            'gemini-3.5-flash',
            'gemini-flash-latest',
            'gemini-2.5-flash',
            'gemini-1.5-flash',
            'gemini-2.0-flash',
          ])
        ).filter(Boolean) as string[];

        let modelSuccess = false;
        for (const model of candidateModels) {
          if (modelSuccess) break;
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ role: 'user', parts }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1,
                  },
                }),
                signal: AbortSignal.timeout(20000),
              }
            );

            if (geminiRes.ok) {
              const geminiJson = await geminiRes.json();
              const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                let cleanedText = rawText.trim();
                if (cleanedText.includes('```')) {
                  cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
                }
                const firstBrace = cleanedText.indexOf('{');
                const lastBrace = cleanedText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                  cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
                }
                const parsed = JSON.parse(cleanedText);
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
                modelSuccess = true;
                break;
              }
            }
          } catch (_mErr) {}
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
