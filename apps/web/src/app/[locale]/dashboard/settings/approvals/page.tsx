import { ApprovalsView } from "@/components/dashboard/settings/ApprovalsView";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Workflow Approvals | E3 Admin",
  description: "Review pending workflow requests and manage enterprise approval policies.",
};

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const session = await auth();
  if (!session && process.env.NODE_ENV === "production") {
    redirect("/login");
  }

  let approvalRules: any = null;
  let approvalItems: any[] = [];

  try {
    const settingRecord = await (db as any).siteSettings.findUnique({
      where: { key: "workflow_approval_settings" }
    });
    if (settingRecord?.value) approvalRules = settingRecord.value;
  } catch (_e) {
    approvalRules = null;
  }

  try {
    const itemsRecord = await (db as any).siteSettings.findUnique({
      where: { key: "workflow_approval_items" }
    });
    if (itemsRecord?.value && Array.isArray(itemsRecord.value)) approvalItems = itemsRecord.value;
  } catch (_e) {
    approvalItems = [];
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
// eslint-disable-next-line react-hooks/purity
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
// eslint-disable-next-line react-hooks/purity
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
// eslint-disable-next-line react-hooks/purity
        actionedAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
  }

  return <ApprovalsView initialRules={approvalRules} initialItems={approvalItems} />;
}
