import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  filterAndResolvePublicPartners,
  analyzePartnerDataQuality,
  isB2BAuthorized,
  sanitizeUrl,
} from "@/lib/partners/partner-resolver";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const isStaff = isB2BAuthorized(userRole);

    // Staff HR/B2B view with data quality analysis
    if (includeAll && isStaff) {
      const allPartners = await db.partner.findMany({
        orderBy: [
          { orderIndex: 'asc' },
          { name: 'asc' },
          { id: 'asc' }
        ]
      });

      const enriched = allPartners.map((p: any) => ({
        ...p,
        dataQuality: analyzePartnerDataQuality(p, allPartners),
      }));

      return NextResponse.json({ success: true, partners: enriched });
    }

    // Public view: only explicitly visible partners resolved via canonical resolver
    const rawPartners = await db.partner.findMany({
      where: { isVisible: true },
      orderBy: [
        { orderIndex: 'asc' },
        { name: 'asc' },
        { id: 'asc' }
      ]
    });

    const safePartners = filterAndResolvePublicPartners(rawPartners);

    return NextResponse.json({ success: true, partners: safePartners });
  } catch (error: any) {
    console.error("[PARTNERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    // QF-23 Requirement 3: Default isVisible to false (hidden) unless explicitly set
    const partnerVisibility = typeof isVisible === 'boolean' ? isVisible : false;

    // Sanitize URLs
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

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    console.error("[PARTNERS_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
