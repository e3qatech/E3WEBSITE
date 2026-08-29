"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  ArrowRight,
  CheckCircle2,
  Printer,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  ServiceCmsPayload,
  CANONICAL_SERVICE_SLUGS,
  getLocalizedCanonicalServiceTitle,
} from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";

interface ProjectBriefBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceRecord?: any;
  initialCmsPayload?: ServiceCmsPayload;
  initialObjective?: string;
  initialSelectedServices?: string[];
  initialParameters?: Record<string, any>;
  locale: string;
}

export function ProjectBriefBuilderModal({
  isOpen,
  onClose,
  initialServiceRecord,
  initialCmsPayload,
  initialObjective,
  initialSelectedServices,
  initialParameters,
  locale
}: ProjectBriefBuilderModalProps) {
  const isAr = locale === "ar";

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Form State with all 6 Solution Finder parameters
  const [formData, setFormData] = useState({
    serviceSlug: initialServiceRecord?.slug || initialSelectedServices?.[0] || "mega-events",
    selectedServices: initialSelectedServices && initialSelectedServices.length > 0 ? initialSelectedServices : [initialServiceRecord?.slug || "mega-events"],
    objective: initialObjective || initialParameters?.objective || initialParameters?.primaryObjective || initialCmsPayload?.objectives?.[0]?.labelEn || "Turnkey Project Delivery",
    primaryObjective: initialObjective || initialParameters?.primaryObjective || initialParameters?.objective || "Turnkey Project Delivery",
    projectFormat: initialParameters?.projectFormat || initialParameters?.projectType || "National Spectacle / Mega Event",
    projectType: initialParameters?.projectType || initialParameters?.projectFormat || "National Spectacle / Mega Event",
    lifespan: initialParameters?.lifespan || "Permanent Installation / Multi-Year",
    audience: initialParameters?.audience || "General Public & VIP Guests (5,000+)",
    requiredScope: initialParameters?.requiredScope || "Full Turnkey Delivery (Design, Build, AV, Operations)",
    venueType: initialParameters?.venueType || initialParameters?.projectFormat || "Ballroom / Arena / Outdoor Site",
    audienceSize: initialParameters?.audienceSize || initialParameters?.audience || "500 - 2,500 Guests",
    targetDate: initialParameters?.targetDate || "",
    duration: initialParameters?.duration || initialParameters?.lifespan || "1 - 3 Days",
    indoorOutdoor: initialParameters?.indoorOutdoor || "Indoor",
    budgetRange: initialParameters?.budgetRange || "Confidential / Flexible",
    briefNotes: initialParameters?.briefNotes || "",
    selectedRelatedServices: initialCmsPayload?.relatedServiceSlugs || [],
    name: "",
    email: "",
    phone: "",
    company: "",
    consent: true
  });

  // Sync props when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        serviceSlug: initialServiceRecord?.slug || initialSelectedServices?.[0] || prev.serviceSlug,
        selectedServices: initialSelectedServices && initialSelectedServices.length > 0 ? initialSelectedServices : prev.selectedServices,
        objective: initialObjective || initialParameters?.primaryObjective || initialParameters?.objective || prev.objective,
        primaryObjective: initialObjective || initialParameters?.primaryObjective || initialParameters?.objective || prev.primaryObjective,
        projectFormat: initialParameters?.projectFormat || initialParameters?.projectType || prev.projectFormat,
        projectType: initialParameters?.projectType || initialParameters?.projectFormat || prev.projectType,
        lifespan: initialParameters?.lifespan || prev.lifespan,
        audience: initialParameters?.audience || prev.audience,
        requiredScope: initialParameters?.requiredScope || prev.requiredScope,
        venueType: initialParameters?.venueType || prev.venueType,
        audienceSize: initialParameters?.audienceSize || prev.audienceSize,
        duration: initialParameters?.duration || prev.duration,
        briefNotes: initialParameters?.briefNotes || prev.briefNotes,
      }));
    }
  }, [isOpen, initialServiceRecord, initialObjective, initialSelectedServices, initialParameters]);

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

  const configuredObjectives = initialCmsPayload?.objectives || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl shadow-2xl overflow-hidden my-8"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[var(--border-level-2)] bg-[var(--surface-raised)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                {isAr ? "أداة التخطيط المؤسسي" : "Enterprise Brief Engine"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {isAr ? "بناء وتحديد موجز المشروع" : "Build Your Project Brief"}
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
                {step === 2 && (isAr ? "الموقع والحضور" : "Scale & Venue")}
                {step === 3 && (isAr ? "الجدول والميزانية" : "Timeline & Budget")}
                {step === 4 && (isAr ? "بيانات التواصل والمراجعة" : "Contact & Review")}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{step * 25}%</span>
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
              {/* Transferred Solution Finder Parameters Banner */}
              {(initialParameters?.projectFormat || initialParameters?.projectType) && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{isAr ? "معطيات أداة الحلول الذكية المحولة:" : "Transferred Solution Finder Configuration:"}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium text-[var(--text-primary)]">
                    <div><span className="text-[var(--text-tertiary)]">{isAr ? "نوع المشروع: " : "Format: "}</span>{formData.projectFormat}</div>
                    <div><span className="text-[var(--text-tertiary)]">{isAr ? "النطاق المطلوب: " : "Scope: "}</span>{formData.requiredScope}</div>
                    <div><span className="text-[var(--text-tertiary)]">{isAr ? "الإطار الزمني: " : "Lifespan: "}</span>{formData.lifespan}</div>
                    <div><span className="text-[var(--text-tertiary)]">{isAr ? "الجمهور: " : "Audience: "}</span>{formData.audience}</div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {isAr ? "الخدمات والتخصصات المشمولة في الموجز:" : "Selected Disciplines & Scope:"}
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-500">
                    {formData.selectedServices.length} {isAr ? "تخصصات محددة" : "Disciplines"}
                  </span>
                </div>

                {/* Selected Disciplines Chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.selectedServices.map((slug) => {
                    const localizedTitle = getLocalizedCanonicalServiceTitle(slug, isAr);
                    return (
                      <span
                        key={slug}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{localizedTitle}</span>
                        {formData.selectedServices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                selectedServices: prev.selectedServices.filter((s) => s !== slug),
                                serviceSlug: prev.selectedServices.filter((s) => s !== slug)[0] || prev.serviceSlug,
                              }));
                            }}
                            className="p-0.5 rounded-full hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:text-rose-500 transition-colors cursor-pointer"
                            aria-label={isAr ? `إزالة ${localizedTitle}` : `Remove ${localizedTitle}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>

                {/* Add Discipline Dropdown */}
                {formData.selectedServices.length < CANONICAL_SERVICE_SLUGS.length && (
                  <div className="pt-2">
                    <select
                      value=""
                      onChange={(e) => {
                        const newSlug = e.target.value;
                        if (newSlug && !formData.selectedServices.includes(newSlug)) {
                          setFormData((prev) => ({
                            ...prev,
                            selectedServices: [...prev.selectedServices, newSlug],
                          }));
                        }
                      }}
                      className="p-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-xs font-semibold text-[var(--text-primary)] focus:border-emerald-500"
                    >
                      <option value="" disabled>
                        {isAr ? "+ إضافة تخصص أو خدمة إضافية إلى الموجز..." : "+ Add another service to brief..."}
                      </option>
                      {CANONICAL_SERVICE_SLUGS.filter((s) => !formData.selectedServices.includes(s)).map((s) => (
                        <option key={s} value={s}>
                          {getLocalizedCanonicalServiceTitle(s, isAr)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {configuredObjectives.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "ما هو هدفك الأساسي؟" : "What is your primary objective?"}
                  </label>
                  <div className="space-y-2">
                    {configuredObjectives.map((obj) => (
                      <label
                        key={obj.id}
                        className={cn(
                          "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                          formData.objective === (isAr ? obj.labelAr : obj.labelEn) || formData.objective === obj.labelEn
                            ? "bg-emerald-500/10 border-emerald-500"
                            : "bg-[var(--surface-raised)] border-[var(--border-level-2)] hover:border-emerald-500/30"
                        )}
                      >
                        <input
                          type="radio"
                          name="objective"
                          checked={formData.objective === (isAr ? obj.labelAr : obj.labelEn) || formData.objective === obj.labelEn}
                          onChange={() => setFormData({ ...formData, objective: isAr ? obj.labelAr : obj.labelEn, primaryObjective: isAr ? obj.labelAr : obj.labelEn })}
                          className="mt-1 text-emerald-500"
                        />
                        <div>
                          <span className="text-sm font-bold text-[var(--text-primary)] block">
                            {isAr ? obj.labelAr : obj.labelEn}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] font-medium">
                            {isAr ? obj.descriptionAr : obj.descriptionEn}
                          </span>
                        </div>
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
                    {isAr ? "نوع المكان / البيئة:" : "Venue / Environment Type:"}
                  </label>
                  <select
                    value={formData.venueType}
                    onChange={(e) => setFormData({ ...formData, venueType: e.target.value, projectFormat: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  >
                    <option value="Ballroom / Arena / Outdoor Site">Ballroom / Arena / Outdoor Site</option>
                    <option value="Indoor FEC / Mall Space">Indoor FEC / Mall Space</option>
                    <option value="Outdoor Festival Grounds">Outdoor Festival Grounds</option>
                    <option value="Heritage / Cultural District">Heritage / Cultural District</option>
                    <option value="Permanent Theme Park">Permanent Theme Park</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                    {isAr ? "حجم الحضور المتوقع:" : "Expected Audience Scale:"}
                  </label>
                  <select
                    value={formData.audienceSize}
                    onChange={(e) => setFormData({ ...formData, audienceSize: e.target.value, audience: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)]"
                  >
                    <option value="Under 500 Guests">Under 500 Guests</option>
                    <option value="500 - 2,500 Guests">500 - 2,500 Guests</option>
                    <option value="2,500 - 10,000 Guests">2,500 - 10,000 Guests</option>
                    <option value="10,000+ Guests (National Scale)">10,000+ Guests (National Scale)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                  {isAr ? "طبيعة الموقع الميداني:" : "Location Type:"}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Indoor", "Outdoor", "Hybrid / Multi-Zone"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, indoorOutdoor: type })}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        formData.indoorOutdoor === type
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                          : "bg-[var(--surface-raised)] border-[var(--border-level-2)] text-[var(--text-secondary)]"
                      )}
                    >
                      {type}
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
                    {isAr ? "الموعد المستهدف (تقديري):" : "Target Execution Date:"}
                  </label>
                  <input
                    type="text"
                    placeholder={isAr ? "مثال: الربع الرابع 2026 أو اليوم الوطني" : "e.g. Q4 2026 or National Day"}
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
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value, lifespan: e.target.value })}
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

          {/* STEP 4: REVIEW & CONTACT */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Comprehensive Summary Review Box */}
              <div className="p-5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-level-2)]">
                  <span className="font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    {isAr ? "ملخص معطيات المشروع قبل الإرسال" : "Project Brief Configuration Review"}
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {formData.selectedServices.length} {isAr ? "تخصصات" : "Disciplines"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--text-secondary)]">
                  <div><span className="font-bold text-[var(--text-primary)]">{isAr ? "نوع المشروع:" : "Format:"} </span>{formData.projectFormat}</div>
                  <div><span className="font-bold text-[var(--text-primary)]">{isAr ? "الهدف الأساسي:" : "Objective:"} </span>{formData.objective}</div>
                  <div><span className="font-bold text-[var(--text-primary)]">{isAr ? "النطاق المطلوب:" : "Scope:"} </span>{formData.requiredScope}</div>
                  <div><span className="font-bold text-[var(--text-primary)]">{isAr ? "الجمهور والمكان:" : "Audience & Venue:"} </span>{formData.venueType} ({formData.audienceSize})</div>
                  <div><span className="font-bold text-[var(--text-primary)]">{isAr ? "المدة والجدول:" : "Lifespan & Window:"} </span>{formData.duration} ({formData.targetDate || "Flexible"})</div>
                  <div><span className="font-bold text-[var(--text-primary)]">{isAr ? "الميزانية:" : "Budget:"} </span>{formData.budgetRange}</div>
                </div>
              </div>

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

          {/* STEP 5: INSTANT BRIEF SUMMARY PREVIEW & PRINT */}
          {step === 5 && submissionResult && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
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
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "الخدمة والتخصصات:" : "Disciplines:"}</span>
                    <span className="font-bold text-[var(--text-primary)]">{submissionResult.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "الهدف الأساسي:" : "Objective:"}</span>
                    <span className="font-bold text-[var(--text-primary)]">{submissionResult.objective}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[var(--border-level-2)]">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "نوع المشروع والنطاق:" : "Format & Scope:"}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{submissionResult.projectFormat} ({submissionResult.requiredScope})</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "الموقع والحضور:" : "Venue & Audience:"}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{submissionResult.venueType} ({submissionResult.audienceSize})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[var(--border-level-2)]">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "الموعد والمدة:" : "Target Window & Duration:"}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{submissionResult.targetDate} ({submissionResult.duration})</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase block">{isAr ? "الميزانية:" : "Budget Range:"}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{submissionResult.budgetRange}</span>
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
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
