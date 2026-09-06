"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  X,
  Share2,
  Sparkles,
  AlertTriangle,
  UploadCloud,
  FileCheck,
} from "lucide-react";

interface ContentReviewClientProps {
  initialDeliverables: any[];
  locale: string;
  isAr: boolean;
}

export default function ContentReviewClient({
  initialDeliverables,
  locale,
  isAr,
}: ContentReviewClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewDecision = async (decision: string) => {
    if (!selectedItem) return;
    const latestSub = selectedItem.submissions?.[0];
    if (!latestSub) {
      toast(isAr ? "لا توجد مسودة مرفوعة" : "No submission draft found", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/influencer/submissions/${latestSub.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          feedbackEn: feedback,
          feedbackAr: feedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review decision failed");

      toast(isAr ? "تم تسجيل قرار الاعتماد بنجاح" : "Review decision recorded", "success");
      setSelectedItem(null);
      setFeedback("");
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPublication = async (deliverableId: string) => {
    try {
      const res = await fetch(`/api/influencer/deliverables/${deliverableId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      toast(isAr ? "تم توثيق نشر المحتوى بنجاح" : "Publication verified successfully", "success");
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  const handleTransferToMediaLibrary = async (deliverableId: string) => {
    try {
      const res = await fetch(`/api/influencer/deliverables/${deliverableId}/media-library`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");

      toast(isAr ? "تم نقل المحتوى إلى مكتبة الوسائط بنجاح" : "Transferred to Media Library", "success");
      router.refresh();
    } catch (err: any) {
      toast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-4 rounded-xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {isAr ? "طابور مراجعة المحتوى والتحقق من النشر" : "Content Review & Verification Queue"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold">
            {initialDeliverables.length}
          </span>
        </div>
      </div>

      {/* Deliverables List */}
      {initialDeliverables.length > 0 ? (
        <div className="divide-y divide-[var(--border-level-1)] rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] overflow-hidden">
          {initialDeliverables.map((item) => {
            const latestSub = item.submissions?.[0];
            const creator = item.campaignCreator?.influencer;
            const campaign = item.campaignCreator?.campaign;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-level-1)]/50 transition"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-level-1)] text-[var(--color-accent)] border border-[var(--border-level-2)]">
                      {item.platform} • {item.contentType}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : item.status === "PUBLISHED"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : item.status === "REVISION_REQUESTED"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 flex-wrap">
                    <span>Creator: <strong className="text-[var(--text-secondary)]">{creator?.displayName}</strong></span>
                    <span>•</span>
                    <span>Campaign: <strong className="text-[var(--text-secondary)]">{campaign?.titleEn}</strong></span>
                    {latestSub && (
                      <>
                        <span>•</span>
                        <span>Version: <strong className="text-[var(--color-accent)]">v{latestSub.version}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.status === "PUBLISHED" ? (
                    <div className="flex items-center gap-2">
                      {item.publishedUrl && (
                        <a
                          href={item.publishedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] hover:border-[var(--color-accent)] flex items-center gap-1 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isAr ? "المنشور" : "Live Post"}</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleVerifyPublication(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition"
                      >
                        {isAr ? "توثيق النشر" : "Verify Publication"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setFeedback("");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isAr ? "فحص المسودة والاعتماد" : "Review Draft"}</span>
                    </button>
                  )}

                  {item.status === "VERIFIED" && (
                    <button
                      onClick={() => handleTransferToMediaLibrary(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-semibold text-[var(--color-accent)] hover:border-[var(--color-accent)] transition flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isAr ? "نقل للمكتبة" : "Transfer UGC"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {isAr ? "جميع المخرجات معتمدة وموثقة" : "All Clear!"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {isAr
              ? "لا توجد مسودات محتوى تنتظر المراجعة أو الاعتماد في الوقت الحالي."
              : "No drafts currently pending review or verification."}
          </p>
        </div>
      )}

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-level-2)] border border-[var(--border-level-1)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--color-accent)]">
                  {selectedItem.platform} • {selectedItem.contentType} (v{selectedItem.submissions?.[0]?.version || 1})
                </span>
                <h2 className="text-base font-bold text-[var(--text-primary)]">{selectedItem.title}</h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission Content */}
            <div className="space-y-4 text-xs">
              {selectedItem.submissions?.[0]?.externalPreviewUrl && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Draft Preview Link</span>
                  <a
                    href={selectedItem.submissions[0].externalPreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-3 rounded-lg bg-[var(--bg-level-1)] text-[var(--color-accent)] hover:underline flex items-center gap-1.5 mt-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{selectedItem.submissions[0].externalPreviewUrl}</span>
                  </a>
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Caption Copy (EN / AR)</span>
                <p className="p-3 rounded-lg bg-[var(--bg-level-1)] text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">
                  {selectedItem.submissions?.[0]?.captionEn || selectedItem.submissions?.[0]?.captionAr || "No caption text provided"}
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">
                  {isAr ? "ملاحظات وتوجيهات المراجع *" : "Reviewer Feedback / Revision Notes"}
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={isAr ? "أدخل ملاحظات التعديل أو الموافقة..." : "Enter requested modifications, feedback, or approval notes..."}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-level-1)] flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg bg-[var(--bg-level-1)] text-xs text-[var(--text-muted)]"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleReviewDecision("REVISION_REQUESTED")}
                  className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition disabled:opacity-50"
                >
                  {isAr ? "طلب تعديلات" : "Request Revision"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleReviewDecision("APPROVED")}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  {isAr ? "اعتماد المسودة" : "Approve Draft"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
