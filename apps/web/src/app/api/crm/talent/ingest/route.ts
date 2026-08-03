import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from "zod";

const ingestSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  cvText: z.string().max(10000).optional(), // Simulating raw text from CV upload
});

// Simulated AI Parser Function
function simulateAIParse(text: string) {
  const lowercaseText = text.toLowerCase();
  
  // Extract Experience Level
  let experienceLevel = "Entry Level";
  if (lowercaseText.includes("senior") || lowercaseText.includes("lead") || lowercaseText.includes("10+ years") || lowercaseText.includes("5+ years")) {
    experienceLevel = "Senior";
  } else if (lowercaseText.includes("mid") || lowercaseText.includes("3+ years")) {
    experienceLevel = "Mid Level";
  }

  // Extract Skills
  const commonSkills = ["react", "node.js", "typescript", "python", "aws", "docker", "figma", "design", "marketing", "sales", "leadership", "next.js", "tailwind"];
  const extractedSkills = commonSkills.filter(skill => lowercaseText.includes(skill));

  // Extract Languages
  const commonLanguages = ["english", "arabic", "french", "spanish"];
  const extractedLanguages = commonLanguages.filter(lang => lowercaseText.includes(lang));

  return {
    experienceLevel,
    skills: extractedSkills.length > 0 ? extractedSkills : ["General"],
    languages: extractedLanguages.length > 0 ? extractedLanguages : ["English"],
  };
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (CSO Check)
    const ip = getClientIp(req);
    const rateLimitKey = `rate_limit:talent_ingest:${ip}`;
    
    const limitResult = await checkRateLimit(rateLimitKey, 10, 60);
    if (!limitResult.allowed) {
      if (limitResult.reason === 'redis_unavailable') {
        return NextResponse.json(
          { error: "Service Temporarily Unavailable" }, 
          { status: 503, headers: { 'Retry-After': '60' } }
        );
      }
      return NextResponse.json(
        { error: "Too many requests. Please try again later." }, 
        { status: 429, headers: limitResult.retryAfter ? { 'Retry-After': limitResult.retryAfter.toString() } : undefined }
      );
    }

    // 2. Input Validation
    const body = await req.json();
    const validatedData = ingestSchema.parse(body);

    // 3. AI Parsing Simulation
    let parsedData = { experienceLevel: "Unknown", skills: [] as string[], languages: [] as string[] };
    if (validatedData.cvText) {
      parsedData = simulateAIParse(validatedData.cvText);
    }

    // 4. Database Insertion
    const talent = await db.talent.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        position: validatedData.position,
        department: validatedData.department,
        experienceLevel: parsedData.experienceLevel,
        skills: parsedData.skills,
        languages: parsedData.languages,
        status: "NEW",
        notes: validatedData.cvText ? `[AI Summary] Candidate parsed from CV submission.\nRaw text snippet: ${validatedData.cvText.substring(0, 100)}...` : undefined,
      },
    });

    // 5. Audit Log
    await db.systemLog.create({
      data: {
        action: "TALENT_INGESTED",
        entity: "Talent",
        entityId: talent.id,
        metadata: {
          ip: ip,
          parsedSkills: parsedData.skills,
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ success: true, talentId: talent.id, aiSummary: parsedData }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("[CSO] Talent Ingest Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
