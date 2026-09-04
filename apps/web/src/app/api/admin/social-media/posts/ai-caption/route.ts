import { NextRequest, NextResponse } from 'next/server';
import { checkSocialAdminAuth } from '@/lib/social-media/auth-check';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkSocialAdminAuth(req, 'MODERATE_POSTS');
    if (!authCheck.isAuthed) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: authCheck.user ? 403 : 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { topic, platform = 'INSTAGRAM', tone = 'Exciting & Luxury' } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Topic or context must be at least 3 characters long' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let result = {
      captionEn: `Exciting moments with E3 Qatar! Experiencing the next generation of entertainment engineering and turnkey spatial design in Doha. ✨ #E3Qatar #DohaEvents #EventEngineering #Qatar`,
      captionAr: `لحظات استثنائية مع إي ثري قطر! نبتكر الجيل القادم من هندسة الفعاليات والتصاميم الفضائية المتكاملة في الدوحة. ✨ #إي_ثري_قطر #فعاليات_قطر #هندسة_الترفيه #الدوحة`,
      hashtags: ['#E3Qatar', '#DohaEvents', '#EventEngineering', '#Qatar2026', '#LiveEntertainment'],
    };

    if (apiKey) {
      try {
        const prompt = `You are an elite social media strategist and bilingual copywriter for E3 Qatar (Entertainment Engineering Experts & turnkey spatial experiences in Doha, Qatar).
Write a captivating, high-engagement social media post for platform: ${platform} with tone: ${tone}.
Topic / Context: "${topic.trim()}"

Provide the response in strict JSON format:
{
  "captionEn": "Captivating English caption with emojis and relevant hashtags",
  "captionAr": "High-quality, natural professional Arabic caption with relevant Arabic hashtags",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"]
}
Return ONLY valid JSON matching this schema.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.7,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json();
          const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            result = {
              captionEn: parsed.captionEn || result.captionEn,
              captionAr: parsed.captionAr || result.captionAr,
              hashtags: Array.isArray(parsed.hashtags) && parsed.hashtags.length > 0 ? parsed.hashtags : result.hashtags,
            };
          }
        }
      } catch (aiErr) {
        console.warn('Gemini social caption fallback activated:', aiErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Error generating AI social caption:', err);
    return NextResponse.json({ success: false, error: err.message || 'Generation failed' }, { status: 500 });
  }
}
