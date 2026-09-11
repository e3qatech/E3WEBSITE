"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Briefcase,
  User,
  Share2,
  Calendar,
  Send,
  UploadCloud,
  FileCheck,
  ExternalLink,
  QrCode,
  Shield,
  Copy,
  Check,
  Tag,
  DollarSign,
  Clock,
  Sparkles,
  ChevronRight,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Award,
} from "lucide-react";

export default function SecureCreatorPortalPage() {
  const { token } = useParams() as { token: string };
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<any | null>(null);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "deliverables" | "vip_pass" | "attribution" | "commercials">("overview");

  // Invitation Response State
  const [isRespondingInvite, setIsRespondingInvite] = useState(false);
  const [counterRate, setCounterRate] = useState<number | "">("");

  // Content Submission State
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>("");
  const [captionCopy, setCaptionCopy] = useState("");
  const [captionCopyAr, setCaptionCopyAr] = useState("");
  const [captionLangTab, setCaptionLangTab] = useState<"en" | "ar">("en");
  const [previewUrl, setPreviewUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);

  // Published URL state
  const [publishedPostUrl, setPublishedPostUrl] = useState("");
  const [isSubmittingLiveUrl, setIsSubmittingLiveUrl] = useState(false);

  // Invoicing State
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState<number | "">("");
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast(isAr ? "تم النسخ إلى الحافظة" : "Copied to clipboard", "success");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  useEffect(() => {
    async function loadPortal() {
      if (!token) return;
      try {
        const res = await fetch(`/api/influencer/portal/${token}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Invalid, expired or revoked portal link.");
          return;
        }
        const resolved = json.data || json;
        setPortalData(resolved);

        const dels = resolved.deliverables || resolved.campaign?.deliverables || [];
        if (dels.length > 0) {
          setSelectedDeliverableId(dels[0].id);
        }

        const compCreator = resolved.campaignCreator || resolved.campaign;
        if (compCreator?.agreedRate || compCreator?.proposedRate) {
          setInvoiceAmount(Number(compCreator.agreedRate || compCreator.proposedRate));
        }
      } catch (err: any) {
        setError(err.message || "Failed to load portal session.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPortal();
  }, [token]);

  const handleRespondInvitation = async (decision: "ACCEPT" | "DECLINE" | "COUNTER") => {
    setIsRespondingInvite(true);
    try {
      const res = await fetch(`/api/influencer/portal/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESPOND_INVITATION",
          payload: {
            decision,
            counterRate: decision === "COUNTER" ? Number(counterRate) : undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit response");

      toast(
        decision === "ACCEPT"
          ? isAr
            ? "تم قبول الدعوة بنجاح! مرحباً بك في الحملة."
            : "Invitation accepted! Welcome to the campaign."
          : decision === "COUNTER"
          ? isAr
            ? "تم إرسال العرض المقابل لفريق التسويق في E3"
            : "Counter-offer submitted to marketing team"
          : isAr
          ? "تم الاعتذار عن الحملة"
          : "Declined campaign invitation",
        "success"
      );

      window.location.reload();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsRespondingInvite(false);
    }
  };

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliverableId || (!previewUrl && !captionCopy && !captionCopyAr)) {
      toast(isAr ? "يرجى تقديم رابط المعاينة أو نص المنشور" : "Please provide preview link or caption", "error");
      return;
    }

    setIsSubmittingDraft(true);
    try {
      const res = await fetch(`/api/influencer/portal/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_CONTENT",
          payload: {
            deliverableId: selectedDeliverableId,
            externalPreviewUrl: previewUrl,
            captionEn: captionCopy,
            captionAr: captionCopyAr || captionCopy,
            submissionNotes,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit draft");

      toast(isAr ? "تم تسليم المسودة للمراجعة والاعتماد بنجاح" : "Draft submitted for E3 review", "success");
      setPreviewUrl("");
      setCaptionCopy("");
      setCaptionCopyAr("");
      setSubmissionNotes("");
      window.location.reload();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmittingDraft(false);
    }
  };

  const handleSubmitPublishedUrl = async (deliverableId: string) => {
    if (!publishedPostUrl) {
      toast(isAr ? "يرجى إدخال رابط المنشور المباشر" : "Please enter published live post URL", "error");
      return;
    }

    setIsSubmittingLiveUrl(true);
    try {
      const res = await fetch(`/api/influencer/portal/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_PUBLISHED_URL",
          payload: {
            deliverableId,
            publishedUrl: publishedPostUrl,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit published URL");

      toast(isAr ? "تم إرسال رابط المنشور للتحقق الإداري" : "Published URL submitted for verification", "success");
      setPublishedPostUrl("");
      window.location.reload();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmittingLiveUrl(false);
    }
  };

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber) {
      toast(isAr ? "يرجى إدخال رقم الفاتورة" : "Please enter an invoice number", "error");
      return;
    }

    setIsSubmittingInvoice(true);
    try {
      const res = await fetch(`/api/influencer/portal/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_INVOICE",
          payload: {
            invoiceNumber,
            amount: Number(invoiceAmount) || 0,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit invoice");

      toast(isAr ? "تم رفع الفاتورة بنجاح للمراجعة المالية" : "Invoice submitted for finance approval", "success");
      window.location.reload();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmittingInvoice(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-level-1)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 border-3 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">
            {isAr ? "جاري فتح بوابة صانع المحتوى الآمنة..." : "Authenticating secure creator session..."}
          </span>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-[var(--bg-level-1)] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--bg-level-2)] border border-rose-500/20 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {isAr ? "رابط البوابة غير صالح أو منتهي الصلاحية" : "Portal Link Expired or Revoked"}
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {isAr
              ? "انتهت صلاحية هذا الرابط لمرة واحدة أو تم استخدامه مسبقاً. يرجى التواصل مع فريق تسويق E3 لإصدار رابط تعاون جديد."
              : error || "This secure one-time portal link is no longer valid. Contact your E3 marketing coordinator to request a new link."}
          </p>
        </div>
      </div>
    );
  }

  // Resilient resolution of portalData structure
  const creator = portalData.creator || {};
  const campaign = portalData.campaign?.campaign || portalData.campaign || {};
  const campaignCreator = portalData.campaignCreator || portalData.campaign || {};
  const deliverables = portalData.deliverables || portalData.campaign?.deliverables || [];
  const attendanceList = Array.isArray(portalData.attendance)
    ? portalData.attendance
    : portalData.attendance
    ? [portalData.attendance]
    : portalData.campaign?.attendance || [];
  const attendance = attendanceList[0] || null;
  const promoCodes = portalData.promoCodes || portalData.campaign?.promoCodes || [];

  const assignmentStatus = campaignCreator.status || "INVITED";
  const isInvitedState = assignmentStatus === "INVITED" || assignmentStatus === "NEGOTIATING";

  return (
    <div className="min-h-screen bg-[var(--bg-level-1)] py-10 px-4 sm:px-6 lg:px-8 text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Ambient Top Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-level-2)]/90 backdrop-blur-xl border border-[var(--border-level-1)] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/25 via-[var(--color-accent)]/10 to-[var(--bg-level-3)] border border-[var(--color-accent)]/30 flex items-center justify-center font-black text-base text-[var(--color-accent)] overflow-hidden shrink-0 shadow-inner">
              {creator.profileImage ? (
                <img src={creator.profileImage} alt={creator.displayName} className="w-full h-full object-cover" />
              ) : (
                (creator.displayName || "E3").substring(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
                  {creator.displayName || "Creator Workspace"}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                  {creator.creatorTier || "OFFICIAL CREATOR"}
                </span>
                {creator.isQatarBased && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md bg-[var(--bg-level-1)] border border-[var(--border-level-2)]" title="Based in Qatar">
                    🇶🇦
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                <span>{isAr ? "بوابة صانع المحتوى الحصرية - إي ثري قطر" : "E3 Qatar Exclusive Creator Portal"}</span>
                <span>•</span>
                <span className="font-mono text-[11px]">{creator.location || "Doha, Qatar"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>{isAr ? "جلسة مشفرة (Token 256)" : "Secure Session (SHA-256)"}</span>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-level-1)] no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === "overview"
                ? "bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/20"
                : "bg-[var(--bg-level-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-level-1)]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isAr ? "نظرة عامة والعرض" : "Campaign & Offer"}</span>
          </button>

          <button
            onClick={() => setActiveTab("deliverables")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === "deliverables"
                ? "bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/20"
                : "bg-[var(--bg-level-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-level-1)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? "المخرجات والمسودات" : "Deliverables & Drafts"}</span>
            {deliverables.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === "deliverables" ? "bg-white/20 text-white" : "bg-[var(--bg-level-1)] text-[var(--text-muted)]"
              }`}>
                {deliverables.length}
              </span>
            )}
          </button>

          {attendance && (
            <button
              onClick={() => setActiveTab("vip_pass")}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
                activeTab === "vip_pass"
                  ? "bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/20"
                  : "bg-[var(--bg-level-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-level-1)]"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isAr ? "بطاقة VIP والزيارة" : "VIP Pass & Accreditation"}</span>
            </button>
          )}

          {promoCodes.length > 0 && (
            <button
              onClick={() => setActiveTab("attribution")}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
                activeTab === "attribution"
                  ? "bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/20"
                  : "bg-[var(--bg-level-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-level-1)]"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{isAr ? "روابط التتبع والخصم" : "Tracking & Promo Codes"}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("commercials")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === "commercials"
                ? "bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/20"
                : "bg-[var(--bg-level-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-level-1)]"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{isAr ? "الفواتير والتعاقد" : "Invoicing & Agreement"}</span>
          </button>
        </nav>

        {/* TAB 1: CAMPAIGN OVERVIEW & OFFER */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-level-1)] pb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                    {campaign.campaignType || "EVENT CAMPAIGN"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
                    {isAr ? campaign.titleAr || campaign.titleEn : campaign.titleEn || "E3 Creative Collaboration"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                    assignmentStatus === "CONTRACTED" || assignmentStatus === "ACCEPTED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : assignmentStatus === "NEGOTIATING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {assignmentStatus}
                  </span>
                </div>
              </div>

              {/* Financial Rate & Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    <DollarSign className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>{isAr ? "المكافأة أو البدل المالي" : "Commercial Terms"}</span>
                  </div>
                  <p className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                    {campaignCreator.agreedRate
                      ? `${campaignCreator.agreedRate} ${campaignCreator.currency || "QAR"}`
                      : campaignCreator.proposedRate
                      ? `${campaignCreator.proposedRate} ${campaignCreator.currency || "QAR"}`
                      : isAr ? "دعوة VIP وتبادل ترويجي" : "VIP Experience / Barter"}
                  </p>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    {campaignCreator.collaborationType || "PAID"}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>{isAr ? "الفترة الزمنية" : "Execution Window"}</span>
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-1">
                    {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "Active Now"}
                    {campaign.endDate && ` — ${new Date(campaign.endDate).toLocaleDateString()}`}
                  </p>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    {isAr ? "توقيت الدوحة (GMT+3)" : "Doha Local Time"}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    <Layers className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>{isAr ? "إجمالي المخرجات" : "Deliverables"}</span>
                  </div>
                  <p className="text-xl font-black text-[var(--text-primary)]">
                    {deliverables.length} {isAr ? "منشورات / محتوى" : "Deliverables"}
                  </p>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    {isAr ? "مطلوب تسليم المسودات قبل النشر" : "Draft approval required"}
                  </span>
                </div>
              </div>

              {/* Campaign Brief */}
              <div className="p-5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-2 text-xs leading-relaxed">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>{isAr ? "موجز وتوجيهات الحملة" : "Creative Campaign Brief"}</span>
                </h3>
                <p className="text-[var(--text-secondary)]">
                  {isAr
                    ? campaign.descriptionAr || campaign.descriptionEn || "يرجى الاطلاع على المخرجات المطلوبة في التبويب المخصص وتسليم المسودات في المواعيد المحددة."
                    : campaign.descriptionEn || "Please review the deliverables tab for post requirements, required tags, and draft submission deadlines."}
                </p>
                {campaign.defaultUsageRights && (
                  <div className="pt-2 border-t border-[var(--border-level-2)] mt-2 text-[11px] text-[var(--text-muted)]">
                    <strong>{isAr ? "حقوق الاستخدام والتوزيع:" : "Usage Rights:"}</strong> {campaign.defaultUsageRights}
                  </div>
                )}
              </div>

              {/* Action Banner for Invited / Negotiating State */}
              {isInvitedState && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--color-accent)]/15 via-[var(--bg-level-1)] to-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)]">
                        {assignmentStatus === "NEGOTIATING"
                          ? isAr ? "العرض قيد التفاوض" : "Counter-Offer Under Review"
                          : isAr ? "هل أنت مستعد للمشاركة؟" : "Ready to Collaborate?"}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {isAr
                          ? "يمكنك قبول الدعوة للبدء، أو تقديم عرض مالي مقابل، أو الاعتذار."
                          : "Accept the campaign invitation to receive briefing materials, or submit a counter-offer."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        value={counterRate}
                        onChange={(e) => setCounterRate(Number(e.target.value))}
                        placeholder={isAr ? "العرض المقابل (QAR)..." : "Counter rate (QAR)..."}
                        className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] w-40 outline-none focus:border-[var(--color-accent)]"
                      />
                      <button
                        type="button"
                        disabled={isRespondingInvite || !counterRate}
                        onClick={() => handleRespondInvitation("COUNTER")}
                        className="px-4 py-2.5 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-2)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition disabled:opacity-50"
                      >
                        {isAr ? "إرسال العرض المقابل" : "Counter-Offer"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        disabled={isRespondingInvite}
                        onClick={() => handleRespondInvitation("DECLINE")}
                        className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition disabled:opacity-50"
                      >
                        {isAr ? "اعتذار" : "Decline"}
                      </button>
                      <button
                        type="button"
                        disabled={isRespondingInvite}
                        onClick={() => handleRespondInvitation("ACCEPT")}
                        className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 transition shadow-lg shadow-[var(--color-accent)]/20 disabled:opacity-50"
                      >
                        {isAr ? "قبول الدعوة الرسمية" : "Accept Invitation"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DELIVERABLES & SUBMISSION STUDIO */}
        {activeTab === "deliverables" && (
          <div className="space-y-6">
            {deliverables.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {deliverables.map((del: any) => {
                    const isApproved = del.status === "APPROVED";
                    const isPublished = del.status === "PUBLISHED" || del.status === "VERIFIED" || del.status === "COMPLETED";

                    return (
                      <div
                        key={del.id}
                        className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4 hover:border-[var(--color-accent)]/30 transition shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-level-1)] pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-level-1)] text-[var(--color-accent)] border border-[var(--border-level-2)]">
                                {del.platform}
                              </span>
                              <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                                {del.contentType}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-[var(--text-primary)] mt-1">{del.title}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                              isPublished
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : isApproved
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : del.status === "REVISION_REQUESTED"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-[var(--bg-level-1)] text-[var(--text-muted)] border-[var(--border-level-2)]"
                            }`}>
                              {del.status}
                            </span>
                          </div>
                        </div>

                        {/* Due Dates & Requirements */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Draft Due Date</span>
                            <p className="font-semibold text-[var(--text-primary)] mt-0.5">
                              {del.draftDueAt ? new Date(del.draftDueAt).toLocaleDateString() : "TBD"}
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Publish Deadline</span>
                            <p className="font-semibold text-[var(--text-primary)] mt-0.5">
                              {del.publishDueAt ? new Date(del.publishDueAt).toLocaleDateString() : "TBD"}
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Required Mentions</span>
                            <p className="font-semibold text-[var(--text-primary)] mt-0.5 truncate">
                              {del.mentions?.length ? del.mentions.join(" ") : "@e3qatar"}
                            </p>
                          </div>
                        </div>

                        {/* Description & Mandatory Content */}
                        {(del.descriptionEn || del.descriptionAr) && (
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            {isAr ? del.descriptionAr || del.descriptionEn : del.descriptionEn}
                          </p>
                        )}

                        {/* Live Post Submission Box if Approved */}
                        {isApproved && (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{isAr ? "تم اعتماد المسودة! يرجى نشر المحتوى وإرسال الرابط المباشر" : "Draft Approved! Post and submit your live publication URL"}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                              <input
                                type="url"
                                placeholder="https://instagram.com/reel/..."
                                value={publishedPostUrl}
                                onChange={(e) => setPublishedPostUrl(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-level-2)] border border-emerald-500/30 text-xs text-[var(--text-primary)] outline-none"
                              />
                              <button
                                type="button"
                                disabled={isSubmittingLiveUrl || !publishedPostUrl}
                                onClick={() => handleSubmitPublishedUrl(del.id)}
                                className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition shrink-0 disabled:opacity-50"
                              >
                                {isSubmittingLiveUrl ? (isAr ? "جاري الإرسال..." : "Submitting...") : isAr ? "إرسال الرابط المباشر" : "Submit Live URL"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* If Published */}
                        {isPublished && del.publishedUrl && (
                          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                            <span className="text-[var(--text-muted)]">{isAr ? "رابط المنشور المباشر:" : "Published Post URL:"}</span>
                            <a
                              href={del.publishedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--color-accent)] hover:underline flex items-center gap-1 font-mono"
                            >
                              <span>{del.publishedUrl}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Draft Submission Studio Form */}
                <form
                  onSubmit={handleSubmitDraft}
                  className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-5 shadow-sm"
                >
                  <div className="border-b border-[var(--border-level-1)] pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                      {isAr ? "استوديو المراجعة" : "Submission Studio"}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                      {isAr ? "رفع مسودة المحتوى أو رابط المعاينة" : "Submit Content Draft for Review"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "اختر المخرج المطلوب *" : "Target Deliverable *"}
                      </label>
                      <select
                        value={selectedDeliverableId}
                        onChange={(e) => setSelectedDeliverableId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                      >
                        {deliverables.map((d: any) => (
                          <option key={d.id} value={d.id}>
                            {d.title} ({d.platform} • {d.contentType})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "رابط المعاينة الخارجي (Drive, Frame.io, Dropbox)" : "External Draft Preview Link"}
                      </label>
                      <input
                        type="url"
                        value={previewUrl}
                        onChange={(e) => setPreviewUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[var(--text-muted)]">
                          {isAr ? "نص المنشور والوسوم (Caption & Hashtags)" : "Caption Copy & Hashtags"}
                        </label>
                        <div className="flex items-center gap-1 bg-[var(--bg-level-1)] p-0.5 rounded-lg border border-[var(--border-level-2)]">
                          <button
                            type="button"
                            onClick={() => setCaptionLangTab("en")}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              captionLangTab === "en" ? "bg-[var(--color-accent)] text-white" : "text-[var(--text-muted)]"
                            }`}
                          >
                            EN
                          </button>
                          <button
                            type="button"
                            onClick={() => setCaptionLangTab("ar")}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              captionLangTab === "ar" ? "bg-[var(--color-accent)] text-white" : "text-[var(--text-muted)]"
                            }`}
                          >
                            عربي
                          </button>
                        </div>
                      </div>

                      {captionLangTab === "en" ? (
                        <textarea
                          rows={4}
                          value={captionCopy}
                          onChange={(e) => setCaptionCopy(e.target.value)}
                          placeholder="Write the exact English caption text, hashtags, and mentions you plan to publish..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)] leading-relaxed"
                        />
                      ) : (
                        <textarea
                          rows={4}
                          dir="rtl"
                          value={captionCopyAr}
                          onChange={(e) => setCaptionCopyAr(e.target.value)}
                          placeholder="اكتب نص المنشور باللغة العربية مع الهاشتاقات والإشارات المقترحة..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)] leading-relaxed"
                        />
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-[var(--text-muted)] mb-1">
                        {isAr ? "ملاحظات إضافية لفريق التسويق" : "Notes for E3 Reviewer"}
                      </label>
                      <input
                        type="text"
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        placeholder={isAr ? "أي استفسار أو تنويه حول المسودة..." : "Any creative notes or questions..."}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingDraft}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-[var(--color-accent)]/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingDraft ? (isAr ? "جاري الإرسال..." : "Submitting Draft...") : isAr ? "إرسال المسودة للاعتماد" : "Submit Draft for Approval"}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
                <Layers className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <h4 className="font-bold text-sm text-[var(--text-primary)]">
                  {isAr ? "لم يتم تعيين مخرجات بعد" : "No Deliverables Assigned Yet"}
                </h4>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  {isAr
                    ? "يقوم مدير الحملة بإعداد بنود المحتوى والتواريخ. ستظهر هنا فور اكتمالها."
                    : "The campaign manager is preparing the deliverable lineup. They will appear here once assigned."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VIP PASS & EVENT ACCREDITATION */}
        {activeTab === "vip_pass" && attendance && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-6">
            <div className="border-b border-[var(--border-level-1)] pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                  {isAr ? "بطاقة الدخول الرسمية" : "Official Event Credential"}
                </span>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
                  {isAr ? "بطاقة الحضور والاعتماد الإعلامي (VIP)" : "VIP Visit Accreditation Pass"}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                {attendance.status || "CONFIRMED"}
              </span>
            </div>

            {/* Boarding Pass Style Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--bg-level-1)] via-[var(--bg-level-2)] to-[var(--bg-level-1)] border border-[var(--color-accent)]/30 space-y-6 relative overflow-hidden shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--color-accent)] text-white text-[10px] font-black tracking-wider">
                      E3 VIP CREATOR PASS
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">🇶🇦 State of Qatar</span>
                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-[var(--text-primary)]">{creator.displayName}</h4>
                    <span className="text-xs text-[var(--text-muted)]">{creator.legalName || "Accredited Guest"}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Visit Date</span>
                      <p className="font-bold text-[var(--text-primary)] mt-0.5">
                        {attendance.eventDate ? new Date(attendance.eventDate).toLocaleDateString() : "Event Day"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Passes / Guests</span>
                      <p className="font-bold text-[var(--text-primary)] mt-0.5">
                        {attendance.guestCount || 2} VIP Passes
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Arrival Window</span>
                      <p className="font-bold text-[var(--text-primary)] mt-0.5">
                        {attendance.arrivalWindowStart || "16:00"} - {attendance.arrivalWindowEnd || "22:00"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code Graphic */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center shrink-0 shadow-inner">
                  <QrCode className="w-28 h-28 text-gray-900" />
                  <span className="font-mono text-[10px] font-bold text-gray-700 mt-2">
                    {attendance.qrReference || attendance.accreditationReference || "E3-VIP-2026"}
                  </span>
                </div>
              </div>

              {attendance.parkingInstructions && (
                <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-secondary)] space-y-1">
                  <strong className="text-[var(--text-primary)]">{isAr ? "تعليمات الدخول ومواقف السيارات:" : "VIP Parking & Entry Gate:"}</strong>
                  <p>{attendance.parkingInstructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ATTRIBUTION LINKS & PROMO CODES */}
        {activeTab === "attribution" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-6">
            <div className="border-b border-[var(--border-level-1)] pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                {isAr ? "التتبع والرموز الترويجية" : "Attribution & Promo Tools"}
              </span>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
                {isAr ? "رموز الخصم وروابط التتبع الخاصة بمتابعيك" : "Audience Tracking Links & Promo Codes"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Promo Codes */}
              {promoCodes.map((pc: any) => (
                <div
                  key={pc.code}
                  className="p-6 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[var(--color-accent)]">
                      {isAr ? "كوبون الخصم للمتابعين" : "Audience Promo Code"}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {pc.discountType === "PERCENTAGE" ? `${pc.discountValue}% OFF` : `${pc.discountValue} ${pc.currency} OFF`}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-dashed border-[var(--color-accent)]/40 flex items-center justify-between gap-2">
                    <span className="font-mono text-xl font-black text-[var(--text-primary)] tracking-wider">
                      {pc.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(pc.code, `promo-${pc.code}`)}
                      className="p-2 rounded-lg bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition"
                      title="Copy code"
                    >
                      {copiedKey === `promo-${pc.code}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    {isAr
                      ? "شارك هذا الرمز مع متابعيك ليحصلوا على خصم فوري عند حجز التذاكر عبر BookingQube وE3."
                      : "Share this coupon code with your audience. They get an instant discount, and ticket sales are attributed to your performance."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: INVOICING & AGREEMENT */}
        {activeTab === "commercials" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-6">
              <div className="border-b border-[var(--border-level-1)] pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                    {isAr ? "الإدارة المالية والتعاقد" : "Financial Procurement & Billing"}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
                    {isAr ? "إصدار الفاتورة وتفاصيل الدفع" : "Submit Invoice & Payout Details"}
                  </h3>
                </div>

                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                  {campaignCreator.agreedRate ? `${campaignCreator.agreedRate} QAR` : "Commercial Agreement"}
                </span>
              </div>

              {/* Invoice Submission Form */}
              <form onSubmit={handleSubmitInvoice} className="p-6 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-4">
                <h4 className="font-bold text-sm text-[var(--text-primary)]">
                  {isAr ? "بيانات الفاتورة الرسمية" : "Invoice Submission Form"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[var(--text-muted)] mb-1">
                      {isAr ? "رقم الفاتورة *" : "Invoice Reference / Number *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="e.g. INV-2026-001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text-muted)] mb-1">
                      {isAr ? "المبلغ الإجمالي (QAR)" : "Amount in QAR"}
                    </label>
                    <input
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                      placeholder="Amount in QAR"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingInvoice || !invoiceNumber}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition shadow-md"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isSubmittingInvoice ? (isAr ? "جاري الرفع..." : "Submitting...") : isAr ? "رفع الفاتورة للمالية" : "Submit Invoice to Finance"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
