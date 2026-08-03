import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from "zod";
import crypto from "crypto";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (CSO Check)
    const ip = getClientIp(req);
    const rateLimitKey = `rate_limit:subscribers_subscribe:${ip}`;
    
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
    const validatedData = subscribeSchema.parse(body);

    // 3. Database Insertion or Update
    // Generate a unique token for verification/unsubscribe
    const token = crypto.randomBytes(32).toString('hex');

    const subscriber = await db.subscriber.upsert({
      where: { email: validatedData.email },
      update: {
        // If they resubscribe, maybe we reset verification or just update updated_at
        updatedAt: new Date()
      },
      create: {
        email: validatedData.email,
        token: token,
        isVerified: true, // Auto-verifying for this demo, in prod send email
        preferences: { all: true },
      },
    });

    // 4. Audit Log
    await db.systemLog.create({
      data: {
        action: "SUBSCRIBER_ADDED",
        entity: "Subscriber",
        entityId: subscriber.id,
        metadata: {
          ip: ip,
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ success: true, message: "Subscribed successfully" }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error("[CSO] Subscribe Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
