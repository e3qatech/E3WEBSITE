"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  Inbox,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  X,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";

interface ApplicationsClientProps {
  initialApplications: any[];
  total: number;
  totalPages: number;
  initialStatus?: string;
  locale: string;
  isAr: boolean;
}

export default function ApplicationsClient({
  initialApplications,
  total,
  totalPages,
  initialStatus,
  locale,
  isAr,
}: ApplicationsClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewAction = async (status: "APPROVED" | "DECLINED" | "MORE_INFORMATION_REQUIRED") => {
    if (!selectedApp) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/influencer/applications/${selectedApp.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      toast(
        status === "APPROVED"
          ? isAr
            ? "تم اعتماد الطلب وتفعيل سجل المؤثر"
            : "Application approved and creator verified"
          : status === "DECLINED"
          ? isAr
            ? "تم رفض الطلب"
            : "Application declined"
          : isAr
          ? "تم طلب معلومات إضافية من المؤثر"
          : "Additional information requested",
        "success"
      );

      setSelectedApp(null);
      setReviewNotes("");
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter Bar */}
      <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "صندوق طلبات الانضمام العامة" : "Inbound Public Applications"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold">
            {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            defaultValue={initialStatus || ""}
            onChange={(e) => {
              const val = e.target.value;
              router.push(
                val
                  ? `/${locale}/dashboard/marketing/influencers/applications?status=${val}`
                  : `/${locale}/dashboard/marketing/influencers/applications`
              );
            }}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
          >
            <option value="">{isAr ? "جميع الحالات" : "All Statuses"}</option>
            <option value="SUBMITTED">{isAr ? "مقدم جديد" : "Submitted"}</option>
            <option value="UNDER_REVIEW">{isAr ? "قيد المراجعة" : "Under Review"}</option>
            <option value="MORE_INFORMATION_REQUIRED">{isAr ? "مطلوب معلومات" : "More Info Req."}</option>
            <option value="APPROVED">{isAr ? "معتمد" : "Approved"}</option>
            <option value="DECLINED">{isAr ? "مرفوض" : "Declined"}</option>
          </select>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {initialApplications.length > 0 ? (
        <div className="divide-y divide-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] overflow-hidden">
          {initialApplications.map((app) => {
            const creator = app.influencer;
            return (
              <div
                key={app.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-level-1)]/50 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--bg-level-3)] border border-[var(--border-level-2)] flex items-center justify-center text-sm font-bold text-[var(--color-accent)] shrink-0">
                    {creator?.displayName?.substring(0, 2).toUpperCase() || "CR"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{creator?.displayName}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          app.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : app.status === "DECLINED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : app.status === "MORE_INFORMATION_REQUIRED"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 flex-wrap">
                      <span>{creator?.email}</span>
                      <span>•</span>
                      <span>{creator?.nationality || "Qatari"}</span>
                      <span>•</span>
                      <span>{creator?.location || "Doha"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {creator?.categories?.map((c: string) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded bg-[var(--bg-level-1)] text-[10px] font-medium text-[var(--text-muted)] border border-[var(--border-level-2)]"
                        >
                          {c.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setReviewNotes(app.reviewNotes || "");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--color-accent)] transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>{isAr ? "مراجعة الطلب" : "Review"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
          <Inbox className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {isAr ? "لا توجد طلبات انضمام" : "No Applications Found"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {isAr
              ? "لم يتم العثور على طلبات انضمام تطابق الفلتر المحدد حالياً."
              : "No inbound public creator applications match the current filter."}
          </p>
        </div>
      )}

      {/* Review Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--color-accent)]">
                  {isAr ? "مراجعة طلب الانضمام" : "Review Application"}
                </span>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {selectedApp.influencer?.displayName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Email</span>
                  <p className="font-semibold text-[var(--text-primary)]">{selectedApp.influencer?.email}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Phone</span>
                  <p className="font-semibold text-[var(--text-primary)]">{selectedApp.influencer?.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Location</span>
                  <p className="font-semibold text-[var(--text-primary)]">{selectedApp.influencer?.location || "Qatar"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Tier</span>
                  <p className="font-semibold text-[var(--text-primary)]">{selectedApp.influencer?.creatorTier}</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Applicant Bio</span>
                <p className="p-3 rounded-lg bg-[var(--bg-level-1)] text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {selectedApp.influencer?.bioEn || selectedApp.influencer?.bioAr || "No bio provided"}
                </p>
              </div>

              {/* Submitted Form Payload snippet */}
              {selectedApp.submittedDataJson && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Original Submission Payload</span>
                  <pre className="p-3 rounded-lg bg-[var(--bg-level-1)] text-[10px] font-mono text-[var(--text-secondary)] mt-1 max-h-36 overflow-y-auto">
                    {JSON.stringify(selectedApp.submittedDataJson, null, 2)}
                  </pre>
                </div>
              )}

              {/* Review Notes Field */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">
                  {isAr ? "ملاحظات وتوجيهات المراجع *" : "Reviewer Assessment Notes"}
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={isAr ? "أدخل سبب القبول أو الرفض أو الملاحظات الداخلية..." : "Enter evaluation notes, justification or requests..."}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-level-1)] flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewAction("DECLINED")}
                  className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition disabled:opacity-50"
                >
                  {isAr ? "رفض الطلب" : "Decline"}
                </button>
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewAction("MORE_INFORMATION_REQUIRED")}
                  className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition disabled:opacity-50"
                >
                  {isAr ? "طلب معلومات" : "Request Info"}
                </button>
                <button
                  type="button"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewAction("APPROVED")}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  {isAr ? "اعتماد وقبول المؤثر" : "Approve Creator"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
