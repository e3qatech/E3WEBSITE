import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import bcrypt from "bcryptjs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, isActive, password, revokeSessions } = body;

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data: any = {};

    if (name !== undefined) {
      data.name = name ? String(name).trim() : null;
    }

    if (email !== undefined && email !== existingUser.email) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
      }
      const duplicate = await db.user.findUnique({ where: { email: cleanEmail } });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json({ error: "An account with this email address already exists" }, { status: 409 });
      }
      data.email = cleanEmail;
    }

    if (role !== undefined) {
      data.role = role;
    }

    if (isActive !== undefined) {
      const newActive = Boolean(isActive);
      data.isActive = newActive;
      // Freezing account automatically revokes active sessions
      if (!newActive) {
        data.sessionVersion = (existingUser.sessionVersion || 1) + 1;
      }
    }

    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
      }
      data.password = await bcrypt.hash(password, 10);
      data.sessionVersion = (existingUser.sessionVersion || 1) + 1;
    }

    if (revokeSessions && !data.sessionVersion) {
      data.sessionVersion = (existingUser.sessionVersion || 1) + 1;
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
