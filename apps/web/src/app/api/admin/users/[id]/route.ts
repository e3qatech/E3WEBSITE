import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { role, isActive, revokeSessions } = body;

    const data: any = {};

    if (role !== undefined) {
      data.role = role;
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    if (revokeSessions) {
      const existingUser = await db.user.findUnique({ where: { id } });
      if (existingUser) {
        data.sessionVersion = (existingUser.sessionVersion || 1) + 1;
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        sessionVersion: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status });
  }
}
