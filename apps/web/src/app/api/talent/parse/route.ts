import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { isHRAuthorized } from '@/lib/careers/job-eligibility';
import { getServerSecretSetting } from '@/lib/settings/public-settings';
import { extractTextFromDocx } from '@/lib/careers/ai-cv-parser';

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
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      (await getServerSecretSetting('geminiApiKey').catch(() => null)) ||
      (await getServerSecretSetting('gemini_api_key').catch(() => null)) ||
      (await getServerSecretSetting('googleAiApiKey').catch(() => null));

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
        const isDocx =
          mimeType.includes('wordprocessingml') ||
          mimeType.includes('docx') ||
          file.name.toLowerCase().endsWith('.docx');

        let extractedDocxText = '';
        if (isDocx) {
          extractedDocxText = extractTextFromDocx(buffer);
        }

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

        let fullPrompt = prompt;
        if (extractedDocxText) {
          fullPrompt += `\n\n--- EXTRACTED RESUME TEXT ---\n${extractedDocxText.slice(0, 15000)}\n--- END RESUME TEXT ---`;
        }

        const base64Data = buffer.toString('base64');
        const parts: any[] = [{ text: fullPrompt }];
        if (!isDocx && base64Data) {
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
                  notes: parsed.notes ? `[Gemini AI] ${parsed.notes}` : extractedData.notes,
                };
                modelSuccess = true;
                break;
              }
            } else {
              console.warn(`[Talent AI Parse] Model ${model} returned status:`, geminiRes.status);
            }
          } catch (_mErr) {}
        }
      } catch (llmErr) {
        console.error('[Talent AI Parse] Gemini parsing error:', llmErr);
      }
    } else {
      extractedData.notes += " (Set GEMINI_API_KEY in .env.local or Admin Settings to enable full multimodal AI parsing)";
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
