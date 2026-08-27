"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Download,
  Printer,
  Building,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  Loader2
} from "lucide-react";
import { CanonicalService, getAllCanonicalServices } from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";

interface ProjectBriefBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: CanonicalService;
  locale: string;
}

export function ProjectBriefBuilderModal({
  isOpen,
  onClose,
  initialService,
  locale
}: ProjectBriefBuilderModalProps) {
  const isAr = locale === "ar";
  const allServices = getAllCanonicalServices();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    serviceSlug: initialService?.slug || allServices[0]?.slug || "mega-events",
    objective: initialService?.objectives[0]?.labelEn || "",
    venueType: "Ballroom / Arena",
    audienceSize: "500 - 2,500 Guests",
    targetDate: "",
    duration: "1 - 3 Days",
    indoorOutdoor: "Indoor",
    budgetRange: "Confidential / Flexible",
    briefNotes: "",
    selectedRelatedServices: [] as string[],
    name: "",
    email: "",
    phone: "",
    company: "",
    consent: true
  });

  if (!isOpen) return null;

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads/project-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionResult(data.briefSummary);
        setStep(5); // Success step
      }
    } catch (err) {
      console.error("Brief submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentService = allServices.find((s) => s.slug === formData.serviceSlug) || allServices[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl shadow-2xl overflow-hidden my-8"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[var(--border-level-2)] bg-[var(--surface-raised)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                {isAr ? "أداة التخطيط المؤسسي" : "Enterprise Brief Engine"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {isAr ? "بناء موجز المشروع والمواصفات" : "Build Your Project Brief"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--surface-default)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="px-6 sm:px-8 pt-4">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-tertiary)] mb-2">
              <span>
                {isAr ? `الخطوة ${step} من 4` : `Step ${step} of 4`}:{" "}
                {step === 1 && (isAr ? "الخدمة والهدف" : "Service & Objective")}
                {step === 2 && (isAr ? "تفاصيل الموقع والحجم" : "Scale & Venue")}
                {step === 3 && (isAr ? "الجدول والميزانية" : "Timeline & Budget")}
                {step === 4 && (isAr ? "معلومات التواصل" : "Contact & Review")}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono">{step * 25}%</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--surface-raised)] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${step * 25}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: SERVICE & OBJECTIVE */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "اختر الخدمة الرئيسية:" : "Select Primary Discipline:"}
                </label>
                <select
                  value={formData.serviceSlug}
                  onChange={(e) => {
                    const slug = e.target.value;
                    const match = allServices.find((s) => s.slug === slug);
                    setFormData({
                      ...formData,
                      serviceSlug: slug,
                      objective: match?.objectives[0]?.labelEn || ""
                    });
                  }}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500"
                >
                  {allServices.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {isAr ? s.titleAr : s.titleEn}
                    </option>
                  ))}
                </select>
              </div>

              {currentService.objectives && currentService.objectives.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "ما هو هدفك الأساسي؟" : "What is your primary objective?"}
                  </label>
                  <div className="space-y-2">
                    {currentService.objectives.map((obj) => (
                      <label
                        key={obj.id}
                        className={cn(
                          "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                          formData.objective === obj.labelEn
                            ? "bg-emerald-500/10 border-emerald-500"
                            : "bg-[var(--surface-raised)] border-[var(--border-level-2)] hover:border-emerald-500/30"
                        )}
                      >
                        <input
                          type="radio"
                          name="objective"
                          checked={formData.objective === obj.labelEn}
                          onChange={() => setFormData({ ...formData, objective: obj.labelEn })}
                          className="mt-1 text-emerald-500"
                        />
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {isAr ? obj.labelAr : obj.labelEn}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SCALE & VENUE */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "نوع الموقع والمساحة:" : "Venue Type:"}
                  </label>
                  <select
                    value={formData.venueType}
                    onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  >
                    <option value="Ballroom / Arena">Ballroom / Arena</option>
                    <option value="Outdoor Boulevard / Plaza">Outdoor Boulevard / Plaza</option>
                    <option value="Shopping Mall / Atrium">Shopping Mall / Atrium</option>
                    <option value="Stadium / Multi-Acre">Stadium / Multi-Acre</option>
                    <option value="Dedicated Entertainment Venue">Dedicated Entertainment Venue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "البيئة المكانية:" : "Environment:"}
                  </label>
                  <select
                    value={formData.indoorOutdoor}
                    onChange={(e) => setFormData({ ...formData, indoorOutdoor: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  >
                    <option value="Indoor (Air Conditioned)">Indoor (Air Conditioned)</option>
                    <option value="Outdoor (Open Air)">Outdoor (Open Air)</option>
                    <option value="Hybrid (Indoor & Outdoor)">Hybrid (Indoor & Outdoor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "حجم الحضور المتوقع:" : "Expected Audience / Footfall:"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    "Up to 500 Guests",
                    "500 - 2,500 Guests",
                    "2,500 - 15,000 Guests",
                    "15,000+ Guests"
                  ].map((aud) => (
                    <button
                      type="button"
                      key={aud}
                      onClick={() => setFormData({ ...formData, audienceSize: aud })}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center",
                        formData.audienceSize === aud
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                          : "bg-[var(--surface-raised)] border-[var(--border-level-2)] text-[var(--text-secondary)]"
                      )}
                    >
                      {aud}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TIMELINE & BUDGET */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "التاريخ المستهدف للفعالية / الافتتاح:" : "Target Date / Window:"}
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? "مثال: نوفمبر ٢٠٢٦" : "e.g., Q4 2026 / November 2026"}
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "مدة المشروع / الفعالية:" : "Project / Event Duration:"}
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  >
                    <option value="Single Day">Single Day</option>
                    <option value="1 - 3 Days">1 - 3 Days</option>
                    <option value="1 - 4 Weeks (Seasonal)">1 - 4 Weeks (Seasonal)</option>
                    <option value="Permanent / Long-Term">Permanent / Long-Term</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "نطاق الميزانية التقديرية (اختياري):" : "Budget Range (Optional):"}
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                >
                  <option value="Confidential / Flexible">Confidential / Flexible</option>
                  <option value="QAR 100,000 - QAR 350,000">QAR 100,000 - QAR 350,000</option>
                  <option value="QAR 350,000 - QAR 1,000,000">QAR 350,000 - QAR 1,000,000</option>
                  <option value="QAR 1,000,000 - QAR 5,000,000">QAR 1,000,000 - QAR 5,000,000</option>
                  <option value="QAR 5,000,000+ (Landmark / Turnkey)">QAR 5,000,000+ (Landmark / Turnkey)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "ملاحظات إضافية أو متطلبات خاصة:" : "Project Notes & Key Requirements:"}
                </label>
                <textarea
                  rows={3}
                  placeholder={isAr ? "أضف أي تفاصيل تود مشاركتها مع الفريق الفني..." : "Describe any specific creative ideas, technical riders, or constraints..."}
                  value={formData.briefNotes}
                  onChange={(e) => setFormData({ ...formData, briefNotes: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)] focus:outline-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & SUBMIT */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "البريد الإلكتروني المهني *" : "Business Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "رقم الهاتف / واتساب:" : "Phone / WhatsApp:"}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "اسم الجهة / الشركة:" : "Organization / Company:"}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-xs text-[var(--text-secondary)]">
                {isAr
                  ? "سيتم حفظ هذا الموجز وتوليد ملخص تنفيذي فوري يمكنك تحميله ومشاركته مع فريق عملك."
                  : "Upon submission, our Senior Technical Team will review your parameters and generate a formal preliminary response within 1 business day."}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isAr ? "جاري إصدار الموجز..." : "Generating Brief..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{isAr ? "إصدار ملخص الموجز التنفيذي" : "Generate & Submit Project Brief"}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 5: INSTANT BRIEF SUMMARY PREVIEW */}
          {step === 5 && submissionResult && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                    {submissionResult.referenceNumber}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {isAr ? "تم حفظ وإصدار موجز مشروعك بنجاح!" : "Project Brief Generated Successfully!"}
                  </h3>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[var(--border-level-2)]">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "الخدمة:" : "Service:"}</span>
                    <span className="font-bold text-[var(--text-primary)]">{submissionResult.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "الهدف:" : "Objective:"}</span>
                    <span className="font-bold text-[var(--text-primary)]">{submissionResult.objective}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[var(--border-level-2)]">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "الموقع والحضور:" : "Venue & Footfall:"}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{submissionResult.venueType} ({submissionResult.audienceSize})</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "الموعد المستهدف:" : "Target Window:"}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{submissionResult.targetDate}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block mb-1">{isAr ? "جهة الاتصال:" : "Contact:"}</span>
                  <span className="font-medium text-[var(--text-primary)]">{submissionResult.clientName} ({submissionResult.company}) — {submissionResult.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3.5 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-default)] border border-[var(--border-level-2)] font-bold text-xs sm:text-sm text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  {isAr ? "طباعة / حفظ PDF" : "Print / Save PDF"}
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isAr ? "إغلاق والعودة للموقع" : "Done"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 4 && (
          <div className="flex items-center justify-between p-6 sm:p-8 border-t border-[var(--border-level-2)] bg-[var(--surface-raised)]">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="px-5 py-2.5 rounded-xl bg-[var(--surface-default)] border border-[var(--border-level-2)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
            >
              {isAr ? "السابق" : "Back"}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>{isAr ? "متابعة" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
