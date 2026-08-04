import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { enforceBodyLimit } from "@/lib/body-limit";
import { z } from "zod";

const ingestSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
  type: z.string().default("GENERAL"), // PROJECT, GENERAL, SUPPORT
}).strict();

export async function POST(req: Request) {
  try {
    // 1. Body Limit (16KB)
    const limitResp = enforceBodyLimit(req, 16 * 1024);
    if (limitResp) return limitResp;

    // 2. Rate Limiting (CSO Check)
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
    const rl = await rateLimit(`rate_limit:inquiries_ingest:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    // 2. Input Validation
    const body = await req.json();
    const validatedData = ingestSchema.parse(body);

    // 3. Database Insertion
    const inquiry = await db.inquiry.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message,
        type: validatedData.type,
        status: "NEW",
      },
    });

    // 4. Audit Log
    await db.systemLog.create({
      data: {
        action: "INQUIRY_RECEIVED",
        entity: "Inquiry",
        entityId: inquiry.id,
        metadata: {
          ip: ip,
          type: validatedData.type,
          source: "Public Portal",
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ success: true, inquiryId: inquiry.id }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("[CSO] Inquiry Ingest Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
