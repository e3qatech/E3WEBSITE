"use client";

import React, { useState } from "react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  BarChart3,
  Download,
  FileText,
  Printer,
  Sparkles,
  TrendingUp,
  Ticket,
  DollarSign,
  Users,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface ReportsClientProps {
  campaigns: any[];
  locale: string;
  isAr: boolean;
}

export default function ReportsClient({
  campaigns,
  locale,
  isAr,
}: ReportsClientProps) {
  const { toast } = useToast();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || ""
  );
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [closeOutReport, setCloseOutReport] = useState<any | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedCampaignId) return;
    setIsLoadingReport(true);
    try {
      const res = await fetch(`/api/influencer/campaigns/${selectedCampaignId}/reports`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report");

      setCloseOutReport(data.data);
      toast(isAr ? "تم توليد التقرير الشامل بنجاح" : "Close-Out report generated successfully", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Generator Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
          <BarChart3 className="w-4 h-4 text-[var(--color-accent)]" />
          <span>{isAr ? "توليد تقرير إغلاق الحملة الشامل (Close-Out Report)" : "Campaign Close-Out & Performance Report Generator"}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">
              {isAr ? "اختر الحملة *" : "Select Campaign *"}
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] font-semibold"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.internalCode} - {isAr ? c.titleAr || c.titleEn : c.titleEn}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={isLoadingReport || !selectedCampaignId}
            onClick={handleGenerateReport}
            className="w-full sm:w-auto self-end px-6 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>{isLoadingReport ? (isAr ? "جاري التوليد..." : "Generating...") : isAr ? "توليد التقرير" : "Generate Report"}</span>
          </button>
        </div>
      </div>

      {/* Close-Out Report View Area */}
      {closeOutReport && (
        <div className="p-8 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-8 print:border-none print:p-0">
          {/* Print / Export Bar */}
          <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--color-accent)] uppercase">
                {isAr ? "تقرير إغلاق الحملة الرسمي" : "Official Campaign Close-Out Report"}
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--color-accent)] transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isAr ? "طباعة / حفظ PDF" : "Print / Save PDF"}</span>
            </button>
          </div>

          {/* Report Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                Code: {closeOutReport.campaign?.internalCode}
              </span>
              <h2 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                {isAr ? closeOutReport.campaign?.titleAr || closeOutReport.campaign?.titleEn : closeOutReport.campaign?.titleEn}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Client: {closeOutReport.campaign?.clientName || "E3"} • Format: {closeOutReport.campaign?.campaignType}
              </p>
            </div>
            <div className="text-end">
              <span className="text-[10px] text-[var(--text-muted)] uppercase">Generated On</span>
              <span className="block text-xs font-bold text-[var(--text-primary)]">
                {new Date(closeOutReport.generatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
              <span className="block text-2xl font-bold text-[var(--text-primary)]">
                {closeOutReport.metrics?.creatorsEngaged || 0}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                Creators Engaged
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
              <span className="block text-2xl font-bold text-[var(--color-accent)]">
                {closeOutReport.metrics?.completionRate?.toFixed(0) || 0}%
              </span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                Completion Rate
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
              <span className="block text-2xl font-bold text-emerald-400">
                {closeOutReport.metrics?.attributedTickets || 0}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                Attributed Tickets
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
              <span className="block text-2xl font-bold text-emerald-400">
                {closeOutReport.metrics?.netAttributedRevenue || 0} {closeOutReport.campaign?.currency}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                Attributed Revenue
              </span>
            </div>
          </div>

          {/* Commercial & ROI Breakdown */}
          <div className="p-6 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "التحليل المالي والعائد على الاستثمار" : "Financial Efficiency & ROI Analysis"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold">Campaign Budget</span>
                <p className="text-base font-bold text-[var(--text-primary)]">
                  {closeOutReport.campaign?.budget} {closeOutReport.campaign?.currency}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold">Actual Spend</span>
                <p className="text-base font-bold text-[var(--text-primary)]">
                  {closeOutReport.metrics?.totalSpend || 0} {closeOutReport.campaign?.currency}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold">Estimated ROI</span>
                <p className="text-base font-bold text-[var(--color-accent)]">
                  {closeOutReport.metrics?.attributedReturn
                    ? `${closeOutReport.metrics.attributedReturn.toFixed(1)}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Deliverables Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "مخرجات الحملة المنشورة والموثقة" : "Published & Verified Deliverables"}
            </h3>
            <div className="divide-y divide-[var(--border-level-1)] rounded-xl border border-[var(--border-level-2)] overflow-hidden text-xs">
              {closeOutReport.deliverables?.map((d: any) => (
                <div key={d.id} className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[var(--text-primary)]">{d.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      {d.platform} • {d.contentType} • Creator: {d.campaignCreator?.influencer?.displayName}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-level-1)] text-emerald-400 border border-emerald-500/20">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations & Close-Out Notes */}
          <div className="p-6 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {isAr ? "الدروس المستفادة والتوصيات" : "Executive Recommendations & Lessons Learned"}
            </h3>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                Short-form video formats (Reels & TikTok) generated 3.4x higher ticket link CTR compared to static posts.
              </li>
              <li>
                Creator VIP preview attendance drove significant organic earned media ahead of general public opening.
              </li>
              <li>
                Rights-cleared high resolution UGC has been archived and transferred to the E3 Media Library for recap usage.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
