import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (
      !session?.user ||
      !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "B2C_ADMIN", "B2B_ADMIN"].includes(userRole)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { nameEn, nameAr, slug } = await req.json();

    const category = await db.brandCategory.update({
      where: { id },
      data: {
        ...(nameEn ? { nameEn: nameEn.trim() } : {}),
        ...(nameAr ? { nameAr: nameAr.trim() } : {}),
        ...(slug ? { slug: slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") } : {}),
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("[UPDATE_BRAND_CATEGORY_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (
      !session?.user ||
      !["SUPER_ADMIN", "SUPPORT_ADMIN", "SALES_ADMIN", "B2C_ADMIN", "B2B_ADMIN"].includes(userRole)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if category has linked brands
    const linkedBrandsCount = await db.brandIP.count({
      where: { categoryId: id },
    });

    if (linkedBrandsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category: ${linkedBrandsCount} brand(s) are linked to it. Please reassign those brands first.` },
        { status: 400 }
      );
    }

    await db.brandCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE_BRAND_CATEGORY_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
