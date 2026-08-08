import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const isAuth = session?.user && ["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN", "STAFF"].includes((session.user as any)?.role);
    if (!isAuth && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try fetching from db siteSettings or mock initial approvals
    let approvalRules: any = null;
    let approvalItems: any[] = [];

    try {
      const settingRecord = await (db as any).siteSettings.findUnique({
        where: { key: "workflow_approval_settings" }
      });
      if (settingRecord?.value) {
        approvalRules = settingRecord.value;
      }
    } catch (_e) {
      approvalRules = null;
    }

    try {
      const itemsRecord = await (db as any).siteSettings.findUnique({
        where: { key: "workflow_approval_items" }
      });
      if (itemsRecord?.value && Array.isArray(itemsRecord.value)) {
        approvalItems = itemsRecord.value;
      }
    } catch (_e) {
      approvalItems = [];
    }

    // Seed default approval items if empty
    if (approvalItems.length === 0) {
      approvalItems = [
        {
          id: "app-101",
          type: "CMS_PUBLISH",
          title: "Publish E3 Kinetic Dome Special Event Page",
          requesterName: "Support Manager",
          requesterRole: "SUPPORT_ADMIN",
          department: "MARKETING",
          status: "PENDING",
          priority: "HIGH",
          details: "Updated pricing tiers and hero media for Q3 Qatar Entertainment Festival.",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: "app-102",
          type: "PRICE_OVERRIDE",
          title: "Group Discount Override: Lusail Winter Buyout",
          requesterName: "Sales Director",
          requesterRole: "SALES_ADMIN",
          department: "SALES",
          status: "PENDING",
          priority: "MEDIUM",
          details: "Special 15% corporate discount requested for Qatar Airways VIP event.",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          id: "app-103",
          type: "TEMPORAL_RULE",
          title: "Special Closure Rule: Eid Al-Adha Extended Hours",
          requesterName: "Field Operations Staff",
          requesterRole: "STAFF",
          department: "OPERATIONS",
          status: "APPROVED",
          priority: "URGENT",
          details: "Extend attraction closing times to 02:00 AM during public holidays.",
          approvedBy: "System SuperAdmin",
          actionedAt: new Date(Date.now() - 86400000).toISOString(),
        }
      ];
    }

    if (!approvalRules) {
      approvalRules = {
        requireCmsApproval: true,
        requirePriceOverrideApproval: true,
        autoApproveStaffUnderQar: 500,
        approverRoles: ["SUPER_ADMIN", "SALES_ADMIN"],
        notifyOnSubmission: true,
        notificationEmail: "approvals@e3.qa"
      };
    }

    return NextResponse.json({
      success: true,
      rules: approvalRules,
      items: approvalItems,
    });
  } catch (error: any) {
    console.error("[GET /api/settings/approvals] error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!["SUPER_ADMIN", "SALES_ADMIN", "SUPPORT_ADMIN"].includes(userRole) && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, rules, item, itemId, newStatus, reviewNote } = body;

    // Action 1: Save Approval Policy Rules
    if (action === "SAVE_RULES" && rules) {
      await (db as any).siteSettings.upsert({
        where: { key: "workflow_approval_settings" },
        update: { value: rules, group: "GENERAL" },
        create: { key: "workflow_approval_settings", value: rules, group: "GENERAL" }
      });
      return NextResponse.json({ success: true, rules });
    }

    // Action 2: Submit New Approval Request
    if (action === "CREATE_REQUEST" && item) {
      const existingRecord = await (db as any).siteSettings.findUnique({
        where: { key: "workflow_approval_items" }
      }).catch(() => null);

      const currentItems: any[] = existingRecord?.value || [];
      const newItem = {
        id: `app-${Date.now()}`,
        ...item,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };

      const updated = [newItem, ...currentItems];

      await (db as any).siteSettings.upsert({
        where: { key: "workflow_approval_items" },
        update: { value: updated, group: "GENERAL" },
        create: { key: "workflow_approval_items", value: updated, group: "GENERAL" }
      });

      return NextResponse.json({ success: true, item: newItem });
    }

    // Action 3: Approve / Reject an Item
    if ((action === "APPROVE" || action === "REJECT") && itemId) {
      const existingRecord = await (db as any).siteSettings.findUnique({
        where: { key: "workflow_approval_items" }
      }).catch(() => null);

      let currentItems: any[] = existingRecord?.value || [];

      // If empty, initialize from defaults
      if (currentItems.length === 0) {
        const getRes = await GET();
        const getJson = await getRes.json();
        currentItems = getJson.items || [];
      }

      const updated = currentItems.map((i: any) => {
        if (i.id === itemId) {
          return {
            ...i,
            status: action === "APPROVE" ? "APPROVED" : "REJECTED",
            reviewNote: reviewNote || "",
            approvedBy: (session?.user as any)?.name || (session?.user as any)?.email || "Super Admin",
            actionedAt: new Date().toISOString()
          };
        }
        return i;
      });

      await (db as any).siteSettings.upsert({
        where: { key: "workflow_approval_items" },
        update: { value: updated, group: "GENERAL" },
        create: { key: "workflow_approval_items", value: updated, group: "GENERAL" }
      });

      return NextResponse.json({ success: true, items: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("[POST /api/settings/approvals] error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
