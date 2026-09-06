"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/layout/LocaleProvider";
import { useToast } from "@/components/dashboard/ui/ToastProvider";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Briefcase,
  Calendar,
  DollarSign,
  Link as LinkIcon,
  Sparkles,
  FileText,
  Target,
} from "lucide-react";

export default function NewCampaignPage() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    internalCode: `CAMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    campaignType: "EVENT_LAUNCH",
    descriptionEn: "",
    descriptionAr: "",
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    clientName: "E3 Entertainment",
    clientContact: "",
    budget: 50000,
    currency: "QAR",
    objectives: ["AWARENESS", "TICKET_SALES"],
    platforms: ["INSTAGRAM", "TIKTOK"],
    bookingQubeReference: "",
    defaultUsageRights: "12_MONTHS_DIGITAL",
  });

  const availableObjectives = [
    { value: "AWARENESS", labelEn: "Brand Awareness", labelAr: "الوعي بالعلامة" },
    { value: "REACH", labelEn: "Maximum Reach", labelAr: "الوصول الأقصى" },
    { value: "ENGAGEMENT", labelEn: "Audience Engagement", labelAr: "التفاعل والمشاركة" },
    { value: "TICKET_SALES", labelEn: "Ticket Sales & Conversions", labelAr: "مبيعات التذاكر والتحويلات" },
    { value: "ATTENDANCE", labelEn: "Physical Event Attendance", labelAr: "حضور الفعاليات" },
    { value: "UGC_CREATION", labelEn: "UGC Asset Creation", labelAr: "إنتاج محتوى أصلي" },
  ];

  const handleObjectiveToggle = (obj: string) => {
    setFormData((prev) => {
      const exists = prev.objectives.includes(obj);
      if (exists) {
        if (prev.objectives.length === 1) return prev;
        return { ...prev, objectives: prev.objectives.filter((o) => o !== obj) };
      }
      return { ...prev, objectives: [...prev.objectives, obj] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleEn || !formData.internalCode) {
      toast(isAr ? "يرجى تعبئة عنوان الحملة والرمز الداخلي" : "Campaign title and internal code are required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/influencer/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
          applicationDeadline: formData.applicationDeadline
            ? new Date(formData.applicationDeadline).toISOString()
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create campaign");

      toast(isAr ? "تم إنشاء الحملة بنجاح" : "Campaign created successfully", "success");
      router.push(`/${locale}/dashboard/marketing/influencers/campaigns/${data.data.id}`);
    } catch (err: any) {
      toast(err.message || "An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${locale}/dashboard/marketing/influencers/campaigns`}
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
        >
          {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{isAr ? "العودة إلى الحملات" : "Back to Campaigns"}</span>
        </Link>
        <span className="text-xs text-[var(--text-muted)]">
          {isAr ? "إعداد حملة تسويقية جديدة" : "New Campaign Setup Wizard"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Campaign Details */}
        <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
            <Briefcase className="w-4 h-4 text-[var(--color-accent)]" />
            <span>{isAr ? "بيانات الحملة الأساسية" : "Campaign Fundamentals"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "عنوان الحملة بالإنجليزية *" : "Campaign Title (EN) *"}
              </label>
              <input
                type="text"
                required
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="e.g. Winter Wonderland Creator Launch"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "عنوان الحملة بالعربية" : "Campaign Title (AR)"}
              </label>
              <input
                type="text"
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder="e.g. إطلاق فعالية أرض العجائب الشتوية"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "الرمز الداخلي الموحد *" : "Internal Campaign Code *"}
              </label>
              <input
                type="text"
                required
                value={formData.internalCode}
                onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-mono text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "نوع وتنسيق الحملة" : "Campaign Format / Type"}
              </label>
              <select
                value={formData.campaignType}
                onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
              >
                <option value="EVENT_LAUNCH">Event Launch</option>
                <option value="ATTRACTION_PROMOTION">Attraction Promotion</option>
                <option value="HOSTED_VISIT">Hosted Creator Visit</option>
                <option value="MEDIA_DAY">Media Day</option>
                <option value="INFLUENCER_PREVIEW">Influencer VIP Preview</option>
                <option value="CREATOR_RACE">Creator Race / Challenge</option>
                <option value="TICKET_SALES">Ticket Sales Campaign</option>
                <option value="UGC_CAMPAIGN">User-Generated Content Package</option>
                <option value="AMBASSADOR">Long-term Ambassador</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "العميل / الجهة المستفيدة" : "Client / Stakeholder"}
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "مرجع BookingQube للتذاكر" : "BookingQube Product/Campaign Ref"}
              </label>
              <input
                type="text"
                value={formData.bookingQubeReference}
                onChange={(e) => setFormData({ ...formData, bookingQubeReference: e.target.value })}
                placeholder="BQ-CAT-2026-09"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs font-mono text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dates & Commercial Budget */}
        <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
            <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
            <span>{isAr ? "المواعيد والميزانية المعتمدة" : "Schedule & Commercial Budget"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "تاريخ البدء" : "Start Date"}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "تاريخ الانتهاء" : "End Date"}
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "الموعد النهائي للتقديم" : "Application Deadline"}
              </label>
              <input
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "الميزانية الإجمالية" : "Total Budget"}
              </label>
              <input
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "العملة" : "Currency"}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
              >
                <option value="QAR">QAR (ريال قطري)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                {isAr ? "حقوق الاستخدام الافتراضية" : "Default Usage Rights"}
              </label>
              <select
                value={formData.defaultUsageRights}
                onChange={(e) => setFormData({ ...formData, defaultUsageRights: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-xs text-[var(--text-primary)]"
              >
                <option value="ORGANIC_ONLY">Organic Social Only</option>
                <option value="6_MONTHS_DIGITAL">6 Months Digital Paid & Organic</option>
                <option value="12_MONTHS_DIGITAL">12 Months Digital Paid & Organic</option>
                <option value="PERPETUAL_DIGITAL">Perpetual Digital Archive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Campaign Objectives */}
        <div className="p-6 rounded-2xl bg-[var(--bg-level-2)] border border-[var(--border-level-1)] space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] border-b border-[var(--border-level-1)] pb-3">
            <Target className="w-4 h-4 text-[var(--color-accent)]" />
            <span>{isAr ? "أهداف الحملة ومؤشرات الأداء" : "Campaign Strategic Objectives"}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableObjectives.map((obj) => {
              const isSelected = formData.objectives.includes(obj.value);
              return (
                <button
                  key={obj.value}
                  type="button"
                  onClick={() => handleObjectiveToggle(obj.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)] font-semibold"
                      : "bg-[var(--bg-level-1)] border-[var(--border-level-2)] text-[var(--text-muted)] hover:border-[var(--border-level-1)]"
                  }`}
                >
                  {isAr ? obj.labelAr : obj.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-level-1)]">
          <Link
            href={`/${locale}/dashboard/marketing/influencers/campaigns`}
            className="px-4 py-2 rounded-lg bg-[var(--bg-level-2)] border border-[var(--border-level-1)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? (isAr ? "جاري الحفظ..." : "Creating...") : isAr ? "إنشاء الحملة" : "Create Campaign"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
