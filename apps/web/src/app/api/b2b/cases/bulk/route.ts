import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids, isPublished } = body;

    if (action === "publishAll") {
      await db.caseStudy.updateMany({
        where: {
          slug: { not: "doha-balloon-parade" },
        },
        data: {
          isPublished: true,
        },
      });
      return NextResponse.json({ success: true, message: "All case studies published" });
    }

    if (action === "updateVisibility" && Array.isArray(ids)) {
      await db.caseStudy.updateMany({
        where: { id: { in: ids } },
        data: { isPublished: Boolean(isPublished) },
      });
      return NextResponse.json({ success: true, message: "Visibility updated" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[CASES_BULK_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
