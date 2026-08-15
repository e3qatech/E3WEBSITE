import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isB2BAuthorized } from "@/lib/partners/partner-resolver";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!isB2BAuthorized(userRole)) {
      return NextResponse.json({ error: "Forbidden: B2B partner permissions required" }, { status: 403 });
    }

    const body = await request.json();
    const { orders } = body; // Array of { id, orderIndex }

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    // Execute bulk update in a transaction
    await db.$transaction(
      orders.map((o: any) => 
        db.partner.update({
          where: { id: o.id },
          data: { orderIndex: typeof o.orderIndex === 'number' ? o.orderIndex : 0 }
        })
      )
    );

    return NextResponse.json({ success: true, message: "Partners reordered successfully" });
  } catch (error: any) {
    console.error("[PARTNERS_REORDER_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
