import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { enforceBodyLimit } from "@/lib/body-limit";
import { z } from "zod";
import crypto from "crypto";
import { sendEmail, renderNewsletterVerificationEmail } from "@/lib/email";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
}).strict();

export async function POST(req: Request) {
  try {
    // 1. Body Limit (4KB)
    const limitResp = enforceBodyLimit(req, 4 * 1024);
    if (limitResp) return limitResp;

    // 2. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
    const rl = await rateLimit(`rate_limit:subscribe:${ip}`, 5, 60, false);
    if (!rl.success) {
      return NextResponse.json({ error: rl.error }, { status: 429 });
    }

    // 3. Input Validation
    const body = await req.json();
    const validatedData = subscribeSchema.parse(body);
    const cleanEmail = validatedData.email.trim().toLowerCase();

    // 4. Generate a unique verification token
    const token = crypto.randomBytes(32).toString('hex');

    const subscriber = await db.subscriber.upsert({
      where: { email: cleanEmail },
      update: {
        token: token,
        updatedAt: new Date(),
      },
      create: {
        email: cleanEmail,
        token: token,
        isVerified: false, // Explicit: Requires email verification link
        preferences: { all: true },
      },
    });

    // 5. Audit Log
    try {
      await db.systemLog.create({
        data: {
          action: "SUBSCRIBER_ADDED",
          entity: "Subscriber",
          entityId: subscriber.id,
          metadata: {
            ip: ip,
            timestamp: new Date().toISOString(),
          }
        }
      });
    } catch (_logErr) {}

    // 6. Dispatch Verification Email
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'e3.qa';
    const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const origin = `${protocol}://${host}`;
    const verificationUrl = `${origin}/api/subscribe?token=${encodeURIComponent(token)}`;

    await sendEmail({
      to: cleanEmail,
      subject: '[E3 Qatar] Confirm Your Newsletter Subscription',
      html: renderNewsletterVerificationEmail({
        email: cleanEmail,
        verificationUrl,
      }),
      category: 'NEWSLETTER',
    });

    return NextResponse.json({
      success: true,
      message: "Please check your email to confirm your subscription.",
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("[CRM Subscribe Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
