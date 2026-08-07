import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    await requireAdmin();
    const { memberId } = await params;
    const body = await request.json();
    const { role, isActive } = body;

    const data: any = {};
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await db.clientMembership.update({
      where: { id: memberId },
      data,
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

    return NextResponse.json(updated);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    await requireAdmin();
    const { memberId } = await params;

    await db.clientMembership.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true, message: "Member removed from client" });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status });
  }
}
