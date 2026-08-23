import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { enforceBodyLimit } from "@/lib/body-limit";
import { z } from "zod";
import {
  safelySendEmail,
  getNotificationTargetEmail,
  renderHRApplicationNotificationEmail,
  renderApplicantConfirmationEmail,
} from "@/lib/email";

const ingestSchema = z.object({
  website_hp: z.string().optional(),
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  position: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  resumeUrl: z.string().optional(),
  cvText: z.string().max(10000).optional(),
}).strict();

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
    // 1. Body Limit (32KB)
    const limitResp = enforceBodyLimit(req, 32 * 1024);
    if (limitResp) return limitResp;

    // 2. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
    const rl = await rateLimit(`rate_limit:talent_ingest:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    // 3. Input Validation
    const body = await req.json();
    const validatedData = ingestSchema.parse(body);

    if (validatedData.website_hp) {
      return NextResponse.json({ success: true, status: 'ignored' }, { status: 201 });
    }

    // 4. AI Parsing Simulation
    let parsedData = { experienceLevel: "Unknown", skills: [] as string[], languages: [] as string[] };
    if (validatedData.cvText) {
      parsedData = simulateAIParse(validatedData.cvText);
    } else {
      parsedData = simulateAIParse(validatedData.position || "");
    }

    // 5. Database Insertion
    const talent = await db.talent.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        position: validatedData.position || "General Candidate",
        department: validatedData.department,
        resumeUrl: validatedData.resumeUrl,
        experienceLevel: parsedData.experienceLevel,
        skills: parsedData.skills,
        languages: parsedData.languages,
        status: "NEW",
        notes: validatedData.cvText ? `[AI Summary] Candidate parsed from CV submission.\nRaw text snippet: ${validatedData.cvText.substring(0, 100)}...` : undefined,
      },
    });

    // 6. Audit Log
    try {
      await db.systemLog.create({
        data: {
          action: "TALENT_INGESTED",
          entity: "Talent",
          entityId: talent.id,
          metadata: {
            ip: ip,
            parsedSkills: parsedData.skills,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (_logErr) {}

    // 7. Dispatch HR Notification & Candidate Auto-Acknowledgment before lambda exit
    const hrEmail = await getNotificationTargetEmail('CAREERS');
    await Promise.allSettled([
      safelySendEmail({
        to: hrEmail,
        subject: `[E3 Talent Ingest] New Candidate: ${validatedData.name} - ${validatedData.position || 'General'}`,
        html: renderHRApplicationNotificationEmail({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          jobTitle: validatedData.position || 'General Applicant',
          department: validatedData.department,
          applicationId: talent.id,
          cvUrl: validatedData.resumeUrl,
        }),
        category: 'CAREERS',
        replyTo: validatedData.email,
      }),
      safelySendEmail({
        to: validatedData.email,
        subject: `[E3 Qatar] Application Received: ${validatedData.position || 'Talent Pool'}`,
        html: renderApplicantConfirmationEmail({
          name: validatedData.name,
          jobTitle: validatedData.position || 'Talent Pool Submission',
          applicationId: talent.id,
        }),
        category: 'CAREERS',
      })
    ]);

    return NextResponse.json({ success: true, talentId: talent.id, aiSummary: parsedData }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("[CRM Talent Ingest Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
