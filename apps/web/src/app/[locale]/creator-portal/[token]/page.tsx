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

  // Invitation Response State
  const [isRespondingInvite, setIsRespondingInvite] = useState(false);
  const [counterRate, setCounterRate] = useState<number | "">("");

  // Content Submission State
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string>("");
  const [captionCopy, setCaptionCopy] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);

  // Published URL state
  const [publishedPostUrl, setPublishedPostUrl] = useState("");

  useEffect(() => {
    async function loadPortal() {
      if (!token) return;
      try {
        const res = await fetch(`/api/influencer/portal/${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invalid, expired or revoked portal link.");
          return;
        }
        setPortalData(data.data);
        if (data.data?.deliverables?.[0]?.id) {
          setSelectedDeliverableId(data.data.deliverables[0].id);
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
            ? "تم قبول الدعوة بنجاح! شكراً لك."
            : "Invitation accepted! Welcome to the campaign."
          : decision === "COUNTER"
          ? isAr
            ? "تم إرسال العرض المقابل لفريق التسويق"
            : "Counter-offer submitted to marketing team"
          : isAr
          ? "تم الاعتذار عن الحملة"
          : "Declined campaign invitation",
        "success"
      );

      // Refresh portal session
      window.location.reload();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsRespondingInvite(false);
    }
  };

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliverableId || (!previewUrl && !captionCopy)) {
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
            captionAr: captionCopy,
            submissionNotes,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit draft");

      toast(isAr ? "تم تسليم المسودة للمراجعة بنجاح" : "Draft submitted for E3 review", "success");
      setPreviewUrl("");
      setCaptionCopy("");
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

      toast(isAr ? "تم إرسال رابط المنشور للتحقق" : "Published URL submitted for verification", "success");
      setPublishedPostUrl("");
      window.location.reload();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-level-1)] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-muted)]">
            {isAr ? "جاري التحقق من رمز الدخول الآمن..." : "Validating secure session token..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-[var(--bg-level-1)] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[var(--bg-level-2)] border border-rose-500/30 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {isAr ? "رابط البوابة غير صالح أو منتهي" : "Access Link Expired or Revoked"}
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {isAr
              ? "انتهت صلاحية هذا الرابط لمرة واحدة أو تم استخدامه مسبقاً. يرجى التواصل مع مدير حملة E3 لإصدار رابط جديد."
              : error || "This secure one-time portal link is no longer valid. Contact your E3 marketing coordinator to request a new link."}
          </p>
        </div>
      </div>
    );
  }

  const { creator, campaign, campaignCreator, deliverables, attendance } = portalData;

  return (
    <div className="min-h-screen bg-[var(--bg-level-1)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--bg-level-3)] border border-[var(--border-level-2)] flex items-center justify-center font-bold text-sm text-[var(--color-accent)]">
              {creator.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[var(--text-primary)]">{creator.displayName}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {creator.status}
                </span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {isAr ? "بوابة صانع المحتوى الآمنة - E3 قطر" : "E3 Qatar Creator Workspace"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? "جلسة مشفرة ومؤمنة" : "Encrypted Access"}</span>
          </div>
        </div>

        {/* Section 1: Campaign Invitation & Offer (if campaign is active) */}
        {campaign && campaignCreator && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--color-accent)]">
                  {isAr ? "دعوة حملة جديدة" : "Campaign Invitation"}
                </span>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
                  {isAr ? campaign.titleAr || campaign.titleEn : campaign.titleEn}
                </h2>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  campaignCreator.status === "CONTRACTED" || campaignCreator.status === "ACCEPTED"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}
              >
                {campaignCreator.status}
              </span>
            </div>

            {/* Campaign Overview & Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  {isAr ? "المكافأة أو المقابل المالي المقترح" : "Offered Fee / Collaboration"}
                </span>
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {campaignCreator.agreedRate
                    ? `${campaignCreator.agreedRate} ${campaignCreator.currency || "QAR"}`
                    : campaignCreator.proposedRate
                    ? `${campaignCreator.proposedRate} ${campaignCreator.currency || "QAR"}`
                    : "Barter / Complimentary VIP Access"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  {isAr ? "فترة الحملة" : "Campaign Period"}
                </span>
                <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">
                  {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "TBD"}
                  {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            {/* Brief Message */}
            <div className="text-xs space-y-2">
              <span className="font-bold text-[var(--text-primary)]">{isAr ? "موجز الحملة:" : "Campaign Brief:"}</span>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {isAr ? campaign.descriptionAr || campaign.descriptionEn : campaign.descriptionEn || "See campaign deliverables below."}
              </p>
            </div>

            {/* Invitation Actions (if status is INVITED or NEGOTIATING) */}
            {(campaignCreator.status === "INVITED" || campaignCreator.status === "NEGOTIATING") && (
              <div className="pt-4 border-t border-[var(--border-level-1)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    value={counterRate}
                    onChange={(e) => setCounterRate(Number(e.target.value))}
                    placeholder={isAr ? "عرض مقابل (QAR)..." : "Counter rate (QAR)..."}
                    className="px-3 py-2 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] w-36 outline-none focus:border-[var(--color-accent)]"
                  />
                  <button
                    type="button"
                    disabled={isRespondingInvite || !counterRate}
                    onClick={() => handleRespondInvitation("COUNTER")}
                    className="px-3 py-2 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                  >
                    {isAr ? "تقديم عرض مقابل" : "Counter-Offer"}
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    disabled={isRespondingInvite}
                    onClick={() => handleRespondInvitation("DECLINE")}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition"
                  >
                    {isAr ? "اعتذار" : "Decline"}
                  </button>
                  <button
                    type="button"
                    disabled={isRespondingInvite}
                    onClick={() => handleRespondInvitation("ACCEPT")}
                    className="px-6 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition shadow-md"
                  >
                    {isAr ? "قبول الدعوة" : "Accept Campaign"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Assigned Deliverables & Draft Submission */}
        {deliverables && deliverables.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--color-accent)]">
                  {isAr ? "المخرجات وتسليم المسودات" : "Deliverables & Submission"}
                </span>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {isAr ? "مخرجات المحتوى المطلوبة" : "Required Content Deliverables"}
                </h2>
              </div>
            </div>

            <div className="divide-y divide-[var(--border-level-1)] rounded-2xl border border-[var(--border-level-2)] overflow-hidden text-xs">
              {deliverables.map((del: any) => (
                <div key={del.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{del.title}</h4>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      {del.platform} • {del.contentType} • Draft Due:{" "}
                      {del.draftDueAt ? new Date(del.draftDueAt).toLocaleDateString() : "TBD"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-level-1)] text-[var(--color-accent)] border border-[var(--border-level-2)]">
                      {del.status}
                    </span>

                    {del.status === "APPROVED" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          placeholder="https://instagram.com/p/..."
                          value={publishedPostUrl}
                          onChange={(e) => setPublishedPostUrl(e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] w-48 outline-none"
                        />
                        <button
                          onClick={() => handleSubmitPublishedUrl(del.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition"
                        >
                          {isAr ? "إرسال الرابط" : "Submit Live URL"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Draft Submission Form */}
            <form onSubmit={handleSubmitDraft} className="p-5 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-4">
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                {isAr ? "رفع مسودة المحتوى للمراجعة" : "Submit Content Draft for Review"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Select Deliverable
                  </label>
                  <select
                    value={selectedDeliverableId}
                    onChange={(e) => setSelectedDeliverableId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)]"
                  >
                    {deliverables.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.platform})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    External Draft Preview Link (Drive, Frame.io, etc.)
                  </label>
                  <input
                    type="url"
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-[var(--text-muted)] uppercase font-semibold mb-1">
                    Caption Copy (Post Text & Mentions)
                  </label>
                  <textarea
                    rows={3}
                    value={captionCopy}
                    onChange={(e) => setCaptionCopy(e.target.value)}
                    placeholder="Write your planned caption, hashtags, and mentions..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingDraft}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingDraft ? (isAr ? "جاري الإرسال..." : "Submitting...") : isAr ? "إرسال المسودة للاعتماد" : "Submit Draft for Approval"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Section 3: Event Attendance & VIP Accreditation (if scheduled) */}
        {attendance && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
              <QrCode className="w-4 h-4 text-[var(--color-accent)]" />
              <span>{isAr ? "تفاصيل الحضور وبطاقة الدخول (VIP Pass)" : "Visit Accreditation & Access Pass"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold">Visit Date</span>
                <p className="font-bold text-[var(--text-primary)] mt-1">
                  {new Date(attendance.eventDate).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold">Complimentary Tickets</span>
                <p className="font-bold text-[var(--text-primary)] mt-1">
                  {attendance.complimentaryTicketCount || 2} Passes (VIP Access)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold">Accreditation Ref</span>
                <p className="font-mono font-bold text-[var(--color-accent)] mt-1">
                  {attendance.accreditationReference || "E3-VIP-PASS"}
                </p>
              </div>
            </div>

            {attendance.parkingInstructions && (
              <div className="p-3 rounded-xl bg-[var(--bg-level-1)] text-xs text-[var(--text-secondary)]">
                <strong>Parking Instructions:</strong> {attendance.parkingInstructions}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
