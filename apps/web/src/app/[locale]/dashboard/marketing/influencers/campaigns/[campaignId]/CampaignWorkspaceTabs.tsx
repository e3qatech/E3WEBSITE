"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  Layers,
  Users,
  Briefcase,
  CheckCircle2,
  Calendar,
  Ticket,
  BarChart3,
  DollarSign,
  Activity,
  Plus,
  Send,
  ExternalLink,
  Shield,
  Clock,
  QrCode,
  Tag,
  Share2,
  Trash2,
  FileCheck,
  Check,
  CreditCard,
  FileText,
} from "lucide-react";

interface CampaignWorkspaceTabsProps {
  campaign: any;
  locale: string;
  isAr: boolean;
  canApprove: boolean;
  canManageAttendance: boolean;
  canViewFinance: boolean;
}

export default function CampaignWorkspaceTabs({
  campaign,
  locale,
  isAr,
  canApprove,
  canManageAttendance,
  canViewFinance,
}: CampaignWorkspaceTabsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Deliverable modal state
  const [isAddingDeliverable, setIsAddingDeliverable] = useState(false);
  const [deliverableForm, setDeliverableForm] = useState({
    campaignCreatorId: campaign.creators?.[0]?.id || "",
    platform: "INSTAGRAM",
    contentType: "REEL",
    title: "",
    draftDueAt: "",
    publishDueAt: "",
  });

  // Promo code modal state
  const [isAddingPromo, setIsAddingPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({
    campaignCreatorId: campaign.creators?.[0]?.id || "",
    code: `E3-${campaign.internalCode.replace(/[^A-Z0-9]/g, "")}-${Math.floor(10 + Math.random() * 90)}`,
    discountType: "PERCENTAGE",
    discountValue: 15,
  });

  // Agreements & Payments state
  const [agreements, setAgreements] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingFinance, setLoadingFinance] = useState(false);

  const [isAddingAgreement, setIsAddingAgreement] = useState(false);
  const [agreementForm, setAgreementForm] = useState({
    campaignCreatorId: campaign.creators?.[0]?.id || "",
    agreedRate: 5000,
    currency: "QAR",
    agreementType: "STANDARD_COMMERCIAL",
    usageRightsTerms: "Full digital marketing & social usage for 12 months",
    exclusivityTerms: "Category exclusive for theme park entertainment during campaign",
  });

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    campaignCreatorId: campaign.creators?.[0]?.id || "",
    invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
    amount: 5000,
    currency: "QAR",
  });


  const tabs = [
    { id: "overview", labelEn: "Overview", labelAr: "نظرة عامة", icon: Layers },
    { id: "shortlist", labelEn: "Shortlist & Invite", labelAr: "المرشحين والدعوات", icon: Users },
    { id: "assignments", labelEn: "Assignments", labelAr: "المشاركون", icon: Briefcase },
    { id: "deliverables", labelEn: "Deliverables", labelAr: "المخرجات", icon: CheckCircle2 },
    { id: "content-approval", labelEn: "Content Review", labelAr: "اعتماد المحتوى", icon: FileCheck },
    ...(canManageAttendance
      ? [{ id: "logistics", labelEn: "Event Logistics", labelAr: "اللوجستيات والحضور", icon: Calendar }]
      : []),
    { id: "promo-codes", labelEn: "Promo & Links", labelAr: "الرموز والتتبع", icon: Ticket },
    { id: "performance", labelEn: "Performance", labelAr: "الأداء والمبيعات", icon: BarChart3 },
    ...(canViewFinance
      ? [{ id: "finance", labelEn: "Agreements & Finance", labelAr: "العقود والمدفوعات", icon: DollarSign }]
      : []),
    { id: "activity", labelEn: "Activity", labelAr: "سجل التدقيق", icon: Activity },
  ];

  const handleSendInvitations = async (creatorIds: string[]) => {
    try {
      const res = await fetch(`/api/influencer/campaigns/${campaign.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          influencerIds: creatorIds,
          durationHours: 48,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invitations");

      toast(
        isAr ? `تم إرسال ${data.data?.length || 0} دعوة بنجاح` : `Sent ${data.data?.length || 0} invitation(s)`,
        "success"
      );
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/influencer/campaigns/${campaign.id}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...deliverableForm,
          draftDueAt: deliverableForm.draftDueAt ? new Date(deliverableForm.draftDueAt).toISOString() : undefined,
          publishDueAt: deliverableForm.publishDueAt
            ? new Date(deliverableForm.publishDueAt).toISOString()
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create deliverable");

      toast(isAr ? "تمت إضافة المخرج بنجاح" : "Deliverable added successfully", "success");
      setIsAddingDeliverable(false);
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/influencer/campaigns/${campaign.id}/promo-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...promoForm,
          discountValue: Number(promoForm.discountValue),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create promo code");

      toast(isAr ? "تم إنشاء رمز الخصم بنجاح" : "Promo code created successfully", "success");
      setIsAddingPromo(false);
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const fetchFinanceData = async () => {
    setLoadingFinance(true);
    try {
      const [agrRes, payRes] = await Promise.all([
        fetch(`/api/influencer/campaigns/${campaign.id}/agreements`),
        fetch(`/api/influencer/campaigns/${campaign.id}/payments`),
      ]);
      if (agrRes.ok) {
        const d = await agrRes.json();
        setAgreements(Array.isArray(d) ? d : []);
      }
      if (payRes.ok) {
        const p = await payRes.json();
        setPayments(Array.isArray(p) ? p : []);
      }
    } catch (_e) {}
    setLoadingFinance(false);
  };

  useEffect(() => {
    if (activeTab === "finance" && canViewFinance) {
      fetchFinanceData();
    }
  }, [activeTab, canViewFinance]);

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/influencer/campaigns/${campaign.id}/agreements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agreementForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create agreement");

      toast(isAr ? "تم إنشاء مسودة العقد بنجاح" : "Agreement draft created successfully", "success");
      setIsAddingAgreement(false);
      fetchFinanceData();
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleSignAgreement = async (agreementId: string) => {
    try {
      const res = await fetch(`/api/influencer/agreements/${agreementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SIGNED", countersigned: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to countersign agreement");

      toast(isAr ? "تم اعتماد وتوقيع العقد رسمياً" : "Agreement signed and executed", "success");
      fetchFinanceData();
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/influencer/campaigns/${campaign.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit invoice");

      toast(isAr ? "تم تسجيل الفاتورة بنجاح" : "Invoice registered successfully", "success");
      setIsAddingPayment(false);
      fetchFinanceData();
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleReviewPayment = async (paymentId: string, action: string, paymentReference?: string) => {
    try {
      const res = await fetch(`/api/influencer/payments/${paymentId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, paymentReference: paymentReference || `WIRE-${Date.now().toString().slice(-6)}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} payment`);

      toast(isAr ? `تم تحديث حالة الدفعة (${action})` : `Payment status updated (${action})`, "success");
      fetchFinanceData();
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  return (

    <div className="space-y-6">
      {/* Tab Header Strip */}
      <div className="flex items-center gap-1 border-b border-[var(--border-level-1)] overflow-x-auto custom-scrollbar pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-level-2)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "موجز وأهداف الحملة" : "Campaign Brief & Objectives"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isAr ? campaign.descriptionAr || campaign.descriptionEn : campaign.descriptionEn || "No description provided."}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {campaign.objectives?.map((obj: string) => (
                  <span
                    key={obj}
                    className="px-3 py-1 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-medium text-[var(--text-primary)]"
                  >
                    🎯 {obj.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Platforms */}
            <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "المنصات المستهدفة وحقوق الاستخدام" : "Target Platforms & Rights"}
              </h3>
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                <span>Platforms: {campaign.platforms?.join(", ") || "ALL"}</span>
                <span>•</span>
                <span>Usage Rights: {campaign.defaultUsageRights}</span>
              </div>
            </div>
          </div>

          {/* Quick Right Side Actions */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "إجراءات سريعة" : "Quick Actions"}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("shortlist")}
                  className="w-full py-2 px-3 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] hover:border-[var(--color-accent)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between transition"
                >
                  <span>{isAr ? "إضافة مؤثرين للمرشحين" : "Shortlist Creators"}</span>
                  <Users className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab("deliverables");
                    setIsAddingDeliverable(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] hover:border-[var(--color-accent)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between transition"
                >
                  <span>{isAr ? "إضافة مخرج جديد" : "Add Deliverable"}</span>
                  <Plus className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab("promo-codes");
                    setIsAddingPromo(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] hover:border-[var(--color-accent)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between transition"
                >
                  <span>{isAr ? "توليد كود خصم" : "Create Promo Code"}</span>
                  <Ticket className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shortlist & Invitations */}
      {activeTab === "shortlist" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "صناع المحتوى المرشحون للحملة" : "Shortlisted Creators"}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const creatorIds = campaign.creators?.map((c: any) => c.influencerId) || [];
                  if (creatorIds.length === 0) {
                    toast(isAr ? "لا يوجد صناع محتوى مرشحين" : "No creators shortlisted yet", "info");
                    return;
                  }
                  handleSendInvitations(creatorIds);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAr ? "إرسال الدعوات للجميع" : "Send All Invitations"}</span>
              </button>
            </div>
          </div>

          {campaign.creators?.length > 0 ? (
            <div className="divide-y divide-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] overflow-hidden">
              {campaign.creators.map((c: any) => (
                <div key={c.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] flex items-center justify-center font-bold text-xs text-[var(--color-accent)]">
                      {c.influencer?.displayName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{c.influencer?.displayName}</h4>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {c.influencer?.email} • Tier: {c.influencer?.creatorTier}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-level-1)] text-[var(--color-accent)] border border-[var(--border-level-2)]">
                      {c.status}
                    </span>
                    <button
                      onClick={() => handleSendInvitations([c.influencerId])}
                      className="p-1.5 rounded bg-[var(--bg-level-1)] hover:bg-[var(--bg-level-3)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                      title="Send invitation link"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
              {isAr ? "لم يتم ترشيح أي مؤثر حتى الآن." : "No creators shortlisted yet."}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Assignments */}
      {activeTab === "assignments" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "صناع المحتوى المتعاقدون والنشطون" : "Contracted & Active Creators"}
          </h3>
          <div className="p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
            {campaign.creators?.filter((c: any) => c.status === "CONTRACTED" || c.status === "IN_PROGRESS").length > 0
              ? "Active assignments displayed."
              : isAr
              ? "بانتظار قبول الدعوات وتوقيع الاتفاقيات."
              : "Awaiting creator acceptance and contract completion."}
          </div>
        </div>
      )}

      {/* Tab 4: Deliverables */}
      {activeTab === "deliverables" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "مخرجات الحملة المقررة" : "Campaign Deliverables"}
            </h3>
            <button
              onClick={() => setIsAddingDeliverable(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "إضافة مخرج" : "Add Deliverable"}</span>
            </button>
          </div>

          {/* Add Deliverable Form Modal */}
          {isAddingDeliverable && (
            <form
              onSubmit={handleCreateDeliverable}
              className="p-5 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4"
            >
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                {isAr ? "إنشاء مخرج جديد للمؤثر" : "New Deliverable Specification"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Creator
                  </label>
                  <select
                    value={deliverableForm.campaignCreatorId}
                    onChange={(e) => setDeliverableForm({ ...deliverableForm, campaignCreatorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                  >
                    {campaign.creators?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.influencer?.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Platform
                  </label>
                  <select
                    value={deliverableForm.platform}
                    onChange={(e) => setDeliverableForm({ ...deliverableForm, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                  >
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="SNAPCHAT">Snapchat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Content Type
                  </label>
                  <select
                    value={deliverableForm.contentType}
                    onChange={(e) => setDeliverableForm({ ...deliverableForm, contentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                  >
                    <option value="REEL">Reel</option>
                    <option value="STORY">Story (3x Frames)</option>
                    <option value="STATIC_POST">Static Post</option>
                    <option value="CAROUSEL">Carousel</option>
                    <option value="TIKTOK_VIDEO">TikTok Video</option>
                    <option value="YOUTUBE_VIDEO">YouTube Dedicated Video</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Deliverable Title
                  </label>
                  <input
                    type="text"
                    required
                    value={deliverableForm.title}
                    onChange={(e) => setDeliverableForm({ ...deliverableForm, title: e.target.value })}
                    placeholder="e.g. VIP Opening Night Experience Reel"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Draft Due Date
                  </label>
                  <input
                    type="date"
                    value={deliverableForm.draftDueAt}
                    onChange={(e) => setDeliverableForm({ ...deliverableForm, draftDueAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDeliverable(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] text-xs text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold"
                >
                  Save Deliverable
                </button>
              </div>
            </form>
          )}

          <div className="p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
            {isAr ? "لا توجد مخرجات معلقة." : "Deliverables will appear here once planned or submitted."}
          </div>
        </div>
      )}

      {/* Tab 5: Content Approval */}
      {activeTab === "content-approval" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "مراجعة واعتماد مسودات المحتوى" : "Content Review & Approval Queue"}
          </h3>
          <div className="p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
            {isAr
              ? "لا توجد مسودات بحاجة للاعتماد حالياً."
              : "No drafts currently awaiting review for this campaign."}
          </div>
        </div>
      )}

      {/* Tab 6: Logistics (Attendance) */}
      {activeTab === "logistics" && canManageAttendance && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "لوجستيات حضور المؤثرين والتذاكر" : "Event Attendance & Accreditation"}
          </h3>
          <div className="p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
            {isAr
              ? "إدارة مواعيد الحضور، تذاكر الضيوف المجانية، ومسح رموز QR عند الدخول."
              : "Manage creator visit schedules, arrival windows, guest allocations, and QR accreditation."}
          </div>
        </div>
      )}

      {/* Tab 7: Promo Codes & Tracking */}
      {activeTab === "promo-codes" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "أكواد الخصم وروابط التتبع" : "Attributed Promo Codes & Tracking Links"}
            </h3>
            <button
              onClick={() => setIsAddingPromo(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "إنشاء كود خصم" : "New Promo Code"}</span>
            </button>
          </div>

          {isAddingPromo && (
            <form
              onSubmit={handleCreatePromoCode}
              className="p-5 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4"
            >
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                {isAr ? "توليد كود خصم وربطه بمبيعات BookingQube" : "Generate Creator Promo Code"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Creator
                  </label>
                  <select
                    value={promoForm.campaignCreatorId}
                    onChange={(e) => setPromoForm({ ...promoForm, campaignCreatorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                  >
                    {campaign.creators?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.influencer?.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Code String
                  </label>
                  <input
                    type="text"
                    required
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] font-mono outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Discount Value (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPromo(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] text-xs text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold"
                >
                  Generate Code
                </button>
              </div>
            </form>
          )}

          <div className="p-8 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs text-[var(--text-muted)]">
            {isAr
              ? "يتم تتبع المبيعات المنسوبة تلقائياً من خلال الويب هوك الخاص بـ BookingQube."
              : "Attributed orders will automatically synchronize via BookingQube webhook."}
          </div>
        </div>
      )}

      {/* Tab 8: Performance */}
      {activeTab === "performance" && (
        <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "مؤشرات الأداء والعائد على الاستثمار" : "Campaign Performance & Attribution"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
              <span className="block text-2xl font-bold text-[var(--text-primary)]">0</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase">Attributed Tickets</span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
              <span className="block text-2xl font-bold text-emerald-400">0 QAR</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase">Attributed Revenue</span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
              <span className="block text-2xl font-bold text-[var(--text-primary)]">0%</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase">Completion Rate</span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
              <span className="block text-2xl font-bold text-[var(--color-accent)]">0%</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase">Estimated ROI</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Finance (Guarded by canViewFinance) */}
      {activeTab === "finance" && canViewFinance && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isAr ? "العقود والمدفوعات والمستحقات" : "Agreements & Financial Management"}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                {isAr
                  ? "إدارة مسودات العقود، التواقيع الإلكترونية، اعتماد الفواتير وتوثيق أوامر التحويل."
                  : "Manage contract drafts, e-signatures, invoice approvals, and wire disbursement logs."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingAgreement(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-xs font-semibold hover:border-[var(--color-accent)] transition"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>{isAr ? "إنشاء عقد" : "New Agreement"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingPayment(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isAr ? "تسجيل فاتورة" : "Record Invoice"}</span>
              </button>
            </div>
          </div>

          {/* Modal: Add Agreement */}
          {isAddingAgreement && (
            <form
              onSubmit={handleCreateAgreement}
              className="p-5 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4"
            >
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                {isAr ? "إنشاء مسودة عقد جديدة" : "Create Commercial Agreement Draft"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Creator
                  </label>
                  <select
                    value={agreementForm.campaignCreatorId}
                    onChange={(e) => setAgreementForm({ ...agreementForm, campaignCreatorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                  >
                    {campaign.creators?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.influencer?.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Agreed Fee ({agreementForm.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={agreementForm.agreedRate}
                    onChange={(e) => setAgreementForm({ ...agreementForm, agreedRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Agreement Type
                  </label>
                  <select
                    value={agreementForm.agreementType}
                    onChange={(e) => setAgreementForm({ ...agreementForm, agreementType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                  >
                    <option value="STANDARD_COMMERCIAL">STANDARD_COMMERCIAL</option>
                    <option value="BARTER_AGREEMENT">BARTER_AGREEMENT</option>
                    <option value="MEDIA_RIGHTS_ONLY">MEDIA_RIGHTS_ONLY</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Usage Rights Terms
                  </label>
                  <input
                    type="text"
                    value={agreementForm.usageRightsTerms}
                    onChange={(e) => setAgreementForm({ ...agreementForm, usageRightsTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAgreement(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] text-xs text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold"
                >
                  Create Agreement
                </button>
              </div>
            </form>
          )}

          {/* Modal: Record Invoice */}
          {isAddingPayment && (
            <form
              onSubmit={handleCreatePayment}
              className="p-5 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4"
            >
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                {isAr ? "تسجيل فاتورة ضريبية رسمية" : "Record Tax Invoice / Payout Request"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Creator
                  </label>
                  <select
                    value={paymentForm.campaignCreatorId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, campaignCreatorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)]"
                  >
                    {campaign.creators?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.influencer?.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.invoiceNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Amount ({paymentForm.currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPayment(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] text-xs text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold"
                >
                  Record Invoice
                </button>
              </div>
            </form>
          )}

          {/* Section 1: Contracts & Agreements */}
          <div className="p-5 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "العقود والاتفاقيات القانونية" : "Legal Contracts & Usage Rights"}
            </h4>

            {loadingFinance ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">Loading agreements...</div>
            ) : agreements.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                {isAr ? "لا توجد عقود مسجلة بعد لهذه الحملة." : "No legal agreements recorded yet for this campaign."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-level-2)] text-[10px] text-[var(--text-muted)] uppercase">
                      <th className="py-2.5 px-3">Creator</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Version</th>
                      <th className="py-2.5 px-3">Rate</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Usage Rights</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-level-2)]">
                    {agreements.map((agr) => (
                      <tr key={agr.id} className="hover:bg-[var(--bg-level-1)] transition">
                        <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                          {agr.campaignCreator?.influencer?.displayName || "Creator"}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-muted)] font-mono text-[10px]">
                          {agr.agreementType}
                        </td>
                        <td className="py-3 px-3 text-[var(--text-muted)]">v{agr.version}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-400">
                          {agr.agreedRate ? `${agr.agreedRate} ${agr.currency}` : "Barter"}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              agr.status === "SIGNED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : agr.status === "SENT"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {agr.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[var(--text-muted)] max-w-xs truncate">
                          {agr.usageRightsTerms || "Standard terms"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {agr.status !== "SIGNED" ? (
                            <button
                              type="button"
                              onClick={() => handleSignAgreement(agr.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold hover:bg-emerald-500/20 transition"
                            >
                              <Check className="w-3 h-3" />
                              <span>Sign / Countersign</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-semibold">Executed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: Invoices & Payments */}
          <div className="p-5 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "الفواتير وسجل التحويلات البنكية" : "Invoices & Disbursement Tracking"}
            </h4>

            {loadingFinance ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                {isAr ? "لا توجد فواتير أو دفعات مسجلة بعد." : "No invoices or payouts recorded yet for this campaign."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-level-2)] text-[10px] text-[var(--text-muted)] uppercase">
                      <th className="py-2.5 px-3">Creator</th>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-level-2)]">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--bg-level-1)] transition">
                        <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                          {p.campaignCreator?.influencer?.displayName || "Creator"}
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-[var(--text-muted)]">
                          {p.invoiceNumber || "—"}
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-400">
                          {p.amount} {p.currency}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              p.paymentStatus === "PAID"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : p.paymentStatus === "PAYMENT_SUBMITTED"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : p.paymentStatus === "INVOICE_RECEIVED"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                            }`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-[var(--text-muted)]">
                          {p.paymentReference || "—"}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          {p.paymentStatus === "INVOICE_RECEIVED" && (
                            <button
                              type="button"
                              onClick={() => handleReviewPayment(p.id, "APPROVE")}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold hover:bg-blue-500/20 transition"
                            >
                              <span>Approve</span>
                            </button>
                          )}
                          {p.paymentStatus === "PAYMENT_SUBMITTED" && (
                            <button
                              type="button"
                              onClick={() => handleReviewPayment(p.id, "MARK_PAID")}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold hover:bg-emerald-500/20 transition"
                            >
                              <Check className="w-3 h-3" />
                              <span>Mark Paid</span>
                            </button>
                          )}
                          {p.paymentStatus === "PAID" && (
                            <span className="text-[10px] text-emerald-400 font-semibold">Disbursed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Tab 10: Activity */}
      {activeTab === "activity" && (
        <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "سجل التغييرات والتدقيق" : "Campaign Audit History"}
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[var(--color-accent)] mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Campaign Initialized</span>
                <span className="block text-[10px] text-[var(--text-muted)]">
                  {new Date(campaign.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
