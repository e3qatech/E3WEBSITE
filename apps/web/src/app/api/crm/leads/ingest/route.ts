import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { enforceBodyLimit } from "@/lib/body-limit";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { z } from "zod";

const ingestSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  interestServices: z.array(z.string()).max(20).optional(),
  notes: z.string().max(2000).optional(),
  uploadId: z.string().uuid().optional(),
}).strict();

export async function POST(req: Request) {
  try {
    // 1. Body Limit (16KB for JSON form data)
    const limitResp = enforceBodyLimit(req, 16 * 1024);
    if (limitResp) return limitResp;

    // 2. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
    const rl = await rateLimit(`rate_limit:leads_ingest:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    // 3. Input Validation
    const body = await req.json();
    const validatedData = ingestSchema.parse(body);

    // Resolve targetUploadId from explicit field or interestServices prefix (RFP_UPLOAD:<uuid>)
    let targetUploadId = validatedData.uploadId;
    if (!targetUploadId && Array.isArray(validatedData.interestServices)) {
      const rfpService = validatedData.interestServices.find(s => s.startsWith("RFP_UPLOAD:"));
      if (rfpService) {
        targetUploadId = rfpService.replace("RFP_UPLOAD:", "").trim();
      }
    }

    // Resolve upload session hash
    let sessionToken: string | undefined = undefined;
    try {
      const cookieStore = await cookies();
      sessionToken = cookieStore.get('e3_upload_session')?.value;
    } catch {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/e3_upload_session=([^;]+)/);
      if (match) sessionToken = match[1];
    }

    const expectedSessionHash = sessionToken
      ? createHash('sha256').update(sessionToken).digest('hex')
      : null;

    // 4. Execute atomic transaction in PostgreSQL
    const result = await db.$transaction(async (tx: any) => {
      let attachmentRecord: any = null;

      if (targetUploadId) {
        if (!expectedSessionHash) {
          throw new Error('MISSING_UPLOAD_SESSION');
        }

        // Atomically claim the upload using a strict conditional update
        const claimResult = await tx.uploadRecord.updateMany({
          where: {
            id: targetUploadId,
            sessionHash: expectedSessionHash,
            purpose: 'B2B_RFP',
            status: 'VALIDATED',
            quarantineStatus: { in: ['UNSCANNED', 'CLEAN'] },
            leadId: null,
            expiresAt: { gt: new Date() },
          },
          data: {
            status: 'ATTACHED',
            attachedAt: new Date(),
          }
        });

        if (claimResult.count !== 1) {
          throw new Error('UPLOAD_CLAIM_FAILED');
        }

        attachmentRecord = await tx.uploadRecord.findUnique({
          where: { id: targetUploadId },
        });
      }

      // Create Lead record
      const lead = await tx.lead.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          company: validatedData.company,
          phone: validatedData.phone,
          interestServices: validatedData.interestServices || [],
          notes: validatedData.notes,
          status: "NEW",
        },
      });

      // Bind upload to newly created lead
      if (targetUploadId && attachmentRecord) {
        await tx.uploadRecord.update({
          where: { id: targetUploadId },
          data: { leadId: lead.id },
        });

        await tx.leadActivity.create({
          data: {
            leadId: lead.id,
            type: "RFP_ATTACHMENT_ATTACHED",
            description: `Attached Verified RFP: ${attachmentRecord.originalFilename} (${Math.round(attachmentRecord.sizeBytes / 1024)} KB) [SHA256: ${attachmentRecord.sha256 || 'N/A'}]`,
            author: "System (Secure Lead Intake)",
          }
        });
      }

      // Record SystemLog audit event
      await tx.systemLog.create({
        data: {
          action: "LEAD_INGESTED",
          entity: "Lead",
          entityId: lead.id,
          metadata: {
            ip,
            source: "B2B Public Portal",
            hasAttachment: Boolean(targetUploadId),
            uploadId: targetUploadId || null,
            timestamp: new Date().toISOString()
          }
        }
      });

      return lead;
    });

    return NextResponse.json({ success: true, leadId: result.id }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error.message === 'UPLOAD_CLAIM_FAILED') {
      return NextResponse.json({ error: "Upload association failed, expired, or already attached to another inquiry" }, { status: 409 });
    }
    if (error.message === 'MISSING_UPLOAD_SESSION') {
      return NextResponse.json({ error: "Missing upload session authorization" }, { status: 403 });
    }
    console.error("[CSO] Lead Ingest Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
