import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  isB2BAuthorized,
  sanitizeUrl,
} from "@/lib/partners/partner-resolver";

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
    const { name, website, category, description, logoUrl, isVisible, orderIndex } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: "Partner name is required" }, { status: 400 });
    }

    // Default isVisible to false (hidden by default)
    const partnerVisibility = typeof isVisible === 'boolean' ? isVisible : false;

    const safeLogo = logoUrl ? sanitizeUrl(logoUrl) || logoUrl : null;
    const safeWebsite = website ? sanitizeUrl(website) || website : null;

    const partner = await db.partner.create({
      data: {
        name: name.trim(),
        website: safeWebsite,
        category: (category || "TECHNOLOGY").toUpperCase(),
        description: description?.trim() || "",
        logoUrl: safeLogo,
        isVisible: partnerVisibility,
        orderIndex: typeof orderIndex === 'number' ? orderIndex : 0,
      }
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error: any) {
    console.error("[PARTNER_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
