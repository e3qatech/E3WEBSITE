import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { enforceBodyLimit } from "@/lib/body-limit";
import { z } from "zod";
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

    let enrichedNotes = validatedData.notes || "";
    if (validatedData.rfpFileName || validatedData.rfpUrl) {
      enrichedNotes += `\n\n[RFP Attachment: ${validatedData.rfpFileName || 'RFP Document'} (${validatedData.rfpUrl || ''})]`;
    }

    // Prevent RFP upload reuse between multiple leads
    if (validatedData.rfpUrl) {
      if (!validatedData.rfpUrl.startsWith('private_rfps/')) {
        return NextResponse.json({ error: 'Invalid RFP document reference' }, { status: 400 });
      }

      try {
        const existingAttachment = await db.leadActivity.findFirst({
          where: {
            type: 'RFP_ATTACHED',
            description: { contains: validatedData.rfpUrl },
          },
        });
        if (existingAttachment) {
          return NextResponse.json({ error: 'RFP document has already been attached to another inquiry' }, { status: 409 });
        }
      } catch (_e) {
        // Continue if DB check fails
      }
    }

    // 3. Database Insertion with atomic activity record
    const lead = await db.lead.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        phone: validatedData.phone,
        interestServices: validatedData.interestServices || [],
        notes: enrichedNotes.trim(),
        status: "NEW", // Always starts as NEW
        activities: validatedData.rfpUrl ? {
          create: {
            type: 'RFP_ATTACHED',
            author: 'system',
            description: JSON.stringify({
              rfpUrl: validatedData.rfpUrl,
              rfpFileName: validatedData.rfpFileName || 'RFP Document',
              status: 'ATTACHED',
              attachedAt: new Date().toISOString(),
            }),
          },
        } : undefined,
      },
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
