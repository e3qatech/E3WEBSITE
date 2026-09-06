"use client";

import React, { useState } from "react";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Lock,
  Sparkles,
} from "lucide-react";

interface SettingsClientProps {
  initialWeights: any;
  locale: string;
  isAr: boolean;
}

export default function SettingsClient({
  initialWeights,
  locale,
  isAr,
}: SettingsClientProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [weights, setWeights] = useState({
    audienceFit: initialWeights.audienceFit ?? 25,
    engagementQuality: initialWeights.engagementQuality ?? 20,
    contentQuality: initialWeights.contentQuality ?? 20,
    brandSuitability: initialWeights.brandSuitability ?? 15,
    eventRelevance: initialWeights.eventRelevance ?? 10,
    reliability: initialWeights.reliability ?? 10,
  });

  const totalWeight = Object.values(weights).reduce((a, b) => Number(a) + Number(b), 0);
  const isValid = totalWeight === 100;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast(
        isAr ? "يجب أن يكون مجموع الأوزان 100% تماماً" : "Total scoring weights must equal 100% exactly",
        "error"
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/influencer/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weights),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update scoring configuration");

      toast(isAr ? "تم حفظ أوزان التقييم بنجاح" : "Scoring weights updated successfully", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
      {/* Scoring Weights Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-level-1)] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--color-accent)]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {isAr ? "أوزان خوارزمية التقييم الآلي للمؤثرين" : "Algorithmic Creator Scoring Weights"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">Total:</span>
            <span
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                isValid
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {totalWeight}%
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {isAr
            ? "يقدم نظام التقييم توصيات إرشادية لفريق التسويق دون استبدال القرار البشري المعتمد. يجب أن يكون مجموع الأوزان 100%."
            : "The automated evaluation system produces advisory ratings to assist marketing decisions. Active weights must total exactly 100%."}
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)] mb-1">
              <span>{isAr ? "ملائمة الجمهور والحملة" : "Audience & Campaign Fit"}</span>
              <span className="font-mono text-[var(--color-accent)]">{weights.audienceFit}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.audienceFit}
              onChange={(e) => setWeights({ ...weights, audienceFit: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)] mb-1">
              <span>{isAr ? "جودة التفاعل والمشاركة" : "Engagement Quality"}</span>
              <span className="font-mono text-[var(--color-accent)]">{weights.engagementQuality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.engagementQuality}
              onChange={(e) => setWeights({ ...weights, engagementQuality: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)] mb-1">
              <span>{isAr ? "جودة الإنتاج والمحتوى" : "Content & Production Quality"}</span>
              <span className="font-mono text-[var(--color-accent)]">{weights.contentQuality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.contentQuality}
              onChange={(e) => setWeights({ ...weights, contentQuality: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)] mb-1">
              <span>{isAr ? "سلامة العلامة والملائمة العائلية" : "Brand & Family Suitability"}</span>
              <span className="font-mono text-[var(--color-accent)]">{weights.brandSuitability}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.brandSuitability}
              onChange={(e) => setWeights({ ...weights, brandSuitability: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)] mb-1">
              <span>{isAr ? "الصلة بفعاليات وأنشطة E3" : "Event & Category Relevance"}</span>
              <span className="font-mono text-[var(--color-accent)]">{weights.eventRelevance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.eventRelevance}
              onChange={(e) => setWeights({ ...weights, eventRelevance: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)] mb-1">
              <span>{isAr ? "الموثوقية والالتزام بالمواعيد" : "Reliability & Past Delivery"}</span>
              <span className="font-mono text-[var(--color-accent)]">{weights.reliability}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.reliability}
              onChange={(e) => setWeights({ ...weights, reliability: Number(e.target.value) })}
              className="w-full accent-[var(--color-accent)] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--border-level-1)]">
          <button
            type="submit"
            disabled={!isValid || isSaving}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ التغييرات" : "Save Weights"}</span>
          </button>
        </div>
      </form>

      {/* Qatar PDPL Privacy & Security Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <Shield className="w-4 h-4" />
          <span>{isAr ? "خصوصية البيانات وحماية المستندات (قانون حماية البيانات القطري)" : "Qatar PDPL Compliance & Data Privacy"}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          {isAr
            ? "يتم تشفير جميع أرقام الهواتف والتفاصيل المالية والمستندات الحساسة وعدم إدراجها في الاستجابات العامة أو تسجيلها في السجلات. الروابط الموجهة للبوابة مشفرة بترميز SHA-256 وصالحة لفترات زمنية محدودة فقط."
            : "All personal contact numbers, financial terms, and identification documents are excluded from public projections and logs. Portal access tokens are 32-byte cryptographically secure and expire within 24-72 hours."}
        </p>
      </div>
    </div>
  );
}
