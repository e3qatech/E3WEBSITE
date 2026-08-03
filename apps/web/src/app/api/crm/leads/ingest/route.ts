import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from "zod";

const ingestSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  interestServices: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (CSO Check)
    const ip = getClientIp(req);
    const rateLimitKey = `rate_limit:leads_ingest:${ip}`;
    
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

    // 2. Input Validation (CSO Check: Zod prevents NoSQL/SQL injection and formats properly)
    const body = await req.json();
    const validatedData = ingestSchema.parse(body);

    // 3. Database Insertion
    const lead = await db.lead.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        phone: validatedData.phone,
        interestServices: validatedData.interestServices || [],
        notes: validatedData.notes,
        status: "NEW", // Always starts as NEW
      },
    });

    // 4. Audit Log (CSO Check)
    await db.systemLog.create({
      data: {
        action: "LEAD_INGESTED",
        entity: "Lead",
        entityId: lead.id,
        metadata: {
          ip: ip,
          source: "B2B Public Portal",
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("[CSO] Lead Ingest Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
