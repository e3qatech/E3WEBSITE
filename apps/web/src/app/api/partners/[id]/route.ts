import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isB2BAuthorized } from "@/lib/partners/partner-resolver";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!isB2BAuthorized(userRole)) {
      return NextResponse.json({ error: "Forbidden: B2B partner permissions required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isVisible } = body;

    const updatedPartner = await db.partner.update({
      where: { id },
      data: { isVisible: typeof isVisible === 'boolean' ? isVisible : undefined }
    });

    return NextResponse.json(updatedPartner);
  } catch (error: any) {
    console.error("[PARTNER_PATCH_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!isB2BAuthorized(userRole)) {
      return NextResponse.json({ error: "Forbidden: B2B partner permissions required" }, { status: 403 });
    }

    const { id } = await params;
    await db.partner.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Partner deleted" });
  } catch (error: any) {
    console.error("[PARTNER_DELETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
