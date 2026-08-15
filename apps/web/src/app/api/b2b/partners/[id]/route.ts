import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  resolvePublicPartner,
  analyzePartnerDataQuality,
  isB2BAuthorized,
  sanitizeUrl,
} from "@/lib/partners/partner-resolver";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partner = await db.partner.findUnique({ where: { id } });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const isStaff = isB2BAuthorized(userRole);

    if (isStaff) {
      const allPartners = await db.partner.findMany();
      return NextResponse.json({
        success: true,
        partner: {
          ...partner,
          dataQuality: analyzePartnerDataQuality(partner, allPartners),
        },
      });
    }

    if (!partner.isVisible) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      partner: resolvePublicPartner(partner),
    });
  } catch (error: any) {
    console.error("[PARTNER_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
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
    const existing = await db.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, website, category, description, logoUrl, isVisible, orderIndex } = body;

    // Sanitize URLs
    const safeLogo = logoUrl !== undefined ? (logoUrl ? sanitizeUrl(logoUrl) || logoUrl : null) : existing.logoUrl;
    const safeWebsite = website !== undefined ? (website ? sanitizeUrl(website) || website : null) : existing.website;

    const partner = await db.partner.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        website: safeWebsite,
        category: category !== undefined ? category.toUpperCase() : existing.category,
        description: description !== undefined ? description?.trim() : existing.description,
        logoUrl: safeLogo,
        isVisible: typeof isVisible === 'boolean' ? isVisible : existing.isVisible,
        orderIndex: typeof orderIndex === 'number' ? orderIndex : existing.orderIndex,
      }
    });

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    console.error("[PARTNER_PUT_ERROR]", error);
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
    const existing = await db.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    await db.partner.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Partner deleted" });
  } catch (error: any) {
    console.error("[PARTNER_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
