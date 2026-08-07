import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const memberships = await db.clientMembership.findMany({
      where: { clientId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(memberships);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: clientId } = await params;
    const body = await request.json();
    const { userId, email, role = "MEMBER" } = body;

    let targetUserId = userId;

    if (!targetUserId && email) {
      const user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
      }

      targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID or Email is required" }, { status: 400 });
    }

    const membership = await db.clientMembership.upsert({
      where: {
        userId_clientId: {
          userId: targetUserId,
          clientId,
        },
      },
      update: {
        role: role as any,
        isActive: true,
      },
      create: {
        userId: targetUserId,
        clientId,
        role: role as any,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(membership);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status });
  }
}
