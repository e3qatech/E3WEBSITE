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
}).strict().refine((data) => {
  const hasId = Boolean(data.rfpUploadId);
  const hasToken = Boolean(data.rfpClaimToken);
  return (hasId && hasToken) || (!hasId && !hasToken);
}, {
  message: "Both rfpUploadId and rfpClaimToken must be provided together",
});

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

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const parseResult = ingestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid lead submission payload" },
        { status: 400 }
      );
    }

    const validatedData = parseResult.data;

    // Honeypot bot protection
    if (validatedData.website_hp) {
      return NextResponse.json({ success: true, status: 'ignored' }, { status: 201 });
    }

    let attachedUpload: any = null;

    try {
      // 3. Atomic Database Transaction
      const lead = await (db as any).$transaction(async (tx: any) => {
        // If RFP upload credentials provided, verify statefully
        if (validatedData.rfpUploadId && validatedData.rfpClaimToken) {
          const upload = await tx.rfpUpload.findUnique({
            where: { id: validatedData.rfpUploadId },
          });

          if (!upload) {
            throw new Error('RFP_NOT_FOUND');
          }
          if (upload.purpose !== 'B2B_RFP') {
            throw new Error('RFP_INVALID_PURPOSE');
          }
          if (upload.status === 'ATTACHED' || upload.leadId !== null) {
            throw new Error('RFP_ALREADY_ATTACHED');
          }
          if (upload.status !== 'VALIDATED') {
            throw new Error('RFP_INVALID_STATUS');
          }
          if (new Date(upload.expiresAt) < new Date()) {
            throw new Error('RFP_EXPIRED');
          }

          const submittedHash = crypto.createHash('sha256').update(validatedData.rfpClaimToken.trim()).digest('hex');
          if (upload.claimTokenHash !== submittedHash) {
            throw new Error('RFP_INVALID_CLAIM');
          }

          attachedUpload = upload;
        }

        let enrichedNotes = validatedData.notes || "";
        if (attachedUpload) {
          enrichedNotes += `\n\n[RFP Attachment: ${attachedUpload.originalFileName} (Upload Record: ${attachedUpload.id})]`;
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
            throw new Error('RFP_RACE_CONFLICT');
          }

          await tx.leadActivity.create({
            data: {
              leadId: createdLead.id,
              type: 'RFP_ATTACHED',
              author: 'system',
              description: `Attached verified RFP document "${attachedUpload.originalFileName}" (${Math.round(attachedUpload.fileSize / 1024)} KB) [Upload Record: ${attachedUpload.id}]`,
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
              hasRfp: Boolean(attachedUpload),
              rfpUploadId: attachedUpload?.id,
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch (_logErr) {
        // Non-blocking log error
      }

      // 5. Internal Project Request Email Notification & Client Acknowledgment
      const adminEmail = await getNotificationTargetEmail('PROJECT');
      await Promise.allSettled([
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
            rfpUploadId: attachedUpload?.id,
            rfpFileName: attachedUpload?.originalFileName,
          }),
          category: 'PROJECT',
          replyTo: validatedData.email,
        }),
        safelySendEmail({
          to: validatedData.email,
          subject: `[E3 Qatar] Project Inquiry Received (Ref: ${lead.id})`,
          html: renderUserB2BConfirmationEmail({
            name: validatedData.name,
            company: validatedData.company,
            leadId: lead.id,
          }),
          category: 'PROJECT',
        })
      ]);

      return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });

    } catch (txError: any) {
      if (
        txError.message === 'RFP_NOT_FOUND' ||
        txError.message === 'RFP_INVALID_PURPOSE' ||
        txError.message === 'RFP_INVALID_STATUS' ||
        txError.message === 'RFP_EXPIRED' ||
        txError.message === 'RFP_INVALID_CLAIM'
      ) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired RFP document attachment.',
        }, { status: 400 });
      }

      if (
        txError.message === 'RFP_ALREADY_ATTACHED' ||
        txError.message === 'RFP_RACE_CONFLICT'
      ) {
        return NextResponse.json({
          success: false,
          error: 'RFP document has already been attached to an existing inquiry.',
        }, { status: 409 });
      }

      console.error('[CRM Lead Ingest Transaction Error]:', txError);
      return NextResponse.json({ success: false, error: 'Internal server error processing lead submission' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[CRM Lead Ingest Route Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
