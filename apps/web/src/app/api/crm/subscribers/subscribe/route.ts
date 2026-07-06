import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { z } from "zod";
import crypto from "crypto";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
    const rateLimitKey = `rate_limit:subscribe:${ip}`;
    
    try {
      const currentCount = await redis.incr(rateLimitKey);
      if (currentCount === 1) {
        await redis.expire(rateLimitKey, 60); 
      }
      if (currentCount > 5) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
    } catch (redisError) {
      console.warn("[CSO] Redis rate limit bypassed:", redisError);
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
