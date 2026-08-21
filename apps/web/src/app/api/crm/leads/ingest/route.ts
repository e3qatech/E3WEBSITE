import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { enforceBodyLimit } from "@/lib/body-limit";
import { z } from "zod";
import crypto from "crypto";
import {
  safelySendEmail,
  getNotificationTargetEmail,
  renderAdminProjectRequestEmail,
  renderUserB2BConfirmationEmail,
} from "@/lib/email";

const ingestSchema = z.object({
  website_hp: z.string().optional(),
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  interestServices: z.array(z.string()).max(20).optional(),
  notes: z.string().max(2000).optional(),
  rfpUploadId: z.string().optional(),
  rfpClaimToken: z.string().optional(),
  rfpUrl: z.string().optional(),
  rfpFileName: z.string().optional(),
}).strict();

export async function POST(req: Request) {
  try {
    // 1. Body Limit (16KB)
    const limitResp = enforceBodyLimit(req, 16 * 1024);
    if (limitResp) return limitResp;

    // 2. Rate Limiting (5 per minute per IP)
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
    const rl = await rateLimit(`rate_limit:leads_ingest:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    const body = await req.json();
    const validatedData = ingestSchema.parse(body);

    // Honeypot bot protection
    if (validatedData.website_hp) {
      return NextResponse.json({ success: true, status: 'ignored' }, { status: 201 });
    }

    let attachedUpload: any = null;
    let rfpOriginalName: string | undefined;

    // 3. Atomic Database Transaction
    const lead = await (db as any).$transaction(async (tx: any) => {
      // If RFP upload credentials provided, verify statefully
      if (validatedData.rfpUploadId && validatedData.rfpClaimToken) {
        const upload = await tx.rfpUpload.findUnique({
          where: { id: validatedData.rfpUploadId },
        });

        if (!upload) {
          throw new Error('RFP_NOT_FOUND: Upload document record not found');
        }
        if (upload.purpose !== 'B2B_RFP') {
          throw new Error('RFP_INVALID_PURPOSE: Upload purpose mismatch');
        }
        if (upload.status !== 'VALIDATED') {
          throw new Error('RFP_INVALID_STATUS: Document is not in validated state');
        }
        if (upload.leadId !== null) {
          throw new Error('RFP_ALREADY_ATTACHED: Document has already been attached to a lead');
        }
        if (new Date(upload.expiresAt) < new Date()) {
          throw new Error('RFP_EXPIRED: Upload has expired');
        }

        const submittedHash = crypto.createHash('sha256').update(validatedData.rfpClaimToken.trim()).digest('hex');
        if (upload.claimTokenHash !== submittedHash) {
          throw new Error('RFP_INVALID_CLAIM: Invalid claim credential');
        }

        attachedUpload = upload;
        rfpOriginalName = upload.originalFileName;
      }

      let enrichedNotes = validatedData.notes || "";
      if (rfpOriginalName || validatedData.rfpFileName) {
        enrichedNotes += `\n\n[RFP Attachment: ${rfpOriginalName || validatedData.rfpFileName || 'RFP Document'} (Upload ID: ${validatedData.rfpUploadId || 'direct'})]`;
      }

      const createdLead = await tx.lead.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          company: validatedData.company,
          phone: validatedData.phone,
          interestServices: validatedData.interestServices || [],
          notes: enrichedNotes.trim(),
          status: "NEW",
        },
      });

      if (attachedUpload) {
        // Atomic conditional transition to ATTACHED
        const updateResult = await tx.rfpUpload.updateMany({
          where: {
            id: attachedUpload.id,
            status: 'VALIDATED',
            leadId: null,
          },
          data: {
            status: 'ATTACHED',
            leadId: createdLead.id,
          },
        });

        if (updateResult.count === 0) {
          throw new Error('RFP_RACE_CONFLICT: RFP upload was claimed by another submission');
        }

        await tx.leadActivity.create({
          data: {
            leadId: createdLead.id,
            type: 'RFP_ATTACHED',
            author: 'system',
            description: `Attached verified RFP document "${attachedUpload.originalFileName}" (${Math.round(attachedUpload.fileSize / 1024)} KB) [Upload ID: ${attachedUpload.id}]`,
          },
        });
      }

      return createdLead;
    });

    // 4. Audit Log
    try {
      await db.systemLog.create({
        data: {
          action: "LEAD_INGESTED",
          entity: "Lead",
          entityId: lead.id,
          metadata: {
            ip: ip,
            source: "B2B Public Portal",
            hasRfp: Boolean(validatedData.rfpUrl),
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (_logErr) {
      // Non-blocking log error
    }

    // 5. Internal Project Request Email Notification
    getNotificationTargetEmail('PROJECT').then(adminEmail => {
      safelySendEmail({
        to: adminEmail,
        subject: `[E3 B2B Lead & RFP] ${validatedData.name} (${validatedData.company || 'Direct Client'})`,
        html: renderAdminProjectRequestEmail({
          name: validatedData.name,
          company: validatedData.company,
          email: validatedData.email,
          phone: validatedData.phone,
          message: validatedData.notes || 'Submitted via B2B Contact / Lead Ingest',
          leadId: lead.id,
          interestServices: validatedData.interestServices,
          rfpUrl: validatedData.rfpUrl,
          rfpFileName: validatedData.rfpFileName,
        }),
        category: 'PROJECT',
        replyTo: validatedData.email,
      });
    });

    // 6. Client Acknowledgment Email
    safelySendEmail({
      to: validatedData.email,
      subject: `[E3 Qatar] Project Inquiry Received (Ref: ${lead.id})`,
      html: renderUserB2BConfirmationEmail({
        name: validatedData.name,
        company: validatedData.company,
        leadId: lead.id,
      }),
      category: 'PROJECT',
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("[CRM Lead Ingest Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
