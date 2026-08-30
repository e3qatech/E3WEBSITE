"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  FileText,
  ArrowRight,
  CheckCircle2,
  Printer,
  Sparkles,
  Loader2
} from "lucide-react";
import { CanonicalService, getAllCanonicalServices } from "@/lib/services/canonical-services";
import { cn } from "@/lib/utils";

interface ProjectBriefBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: CanonicalService;
  initialObjective?: any;
  selectedServices?: string[];
  availableServices?: CanonicalService[];
  locale: string;
}

export function ProjectBriefBuilderModal({
  isOpen,
  onClose,
  initialService,
  initialObjective,
  selectedServices = [],
  availableServices,
  locale
}: ProjectBriefBuilderModalProps) {
  const isAr = locale === "ar";
  const modalRef = useRef<HTMLDivElement>(null);

  // Available services list - filter out uncreated services
  const baseCanonicalServices = getAllCanonicalServices().filter((s) => s.slug !== "attraction-operations");
  const servicesList = (availableServices && availableServices.length > 0)
    ? availableServices
    : baseCanonicalServices;

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const initialObjLabel = typeof initialObjective === "object"
    ? initialObjective?.labelEn || initialObjective?.labelAr || initialObjective?.id || ""
    : typeof initialObjective === "string" ? initialObjective : "";

  const defaultServiceSlug = initialService?.slug || servicesList[0]?.slug || "mega-events";
  const defaultMatchingService = servicesList.find((s) => s.slug === defaultServiceSlug) || initialService || servicesList[0];

  // Form State
  const [formData, setFormData] = useState({
    serviceSlug: defaultServiceSlug,
    objective: initialObjLabel || defaultMatchingService?.objectives?.[0]?.labelEn || "",
    primaryObjective: initialObjLabel || defaultMatchingService?.objectives?.[0]?.labelEn || "",
    venueType: "Ballroom / Arena",
    audienceSize: "500 - 2,500 Guests",
    targetDate: "",
    duration: "1 - 3 Days",
    indoorOutdoor: "Indoor",
    budgetRange: "Confidential / Flexible",
    briefNotes: "",
    selectedRelatedServices: selectedServices || ([] as string[]),
    name: "",
    email: "",
    phone: "",
    company: "",
    consent: true
  });

  // Sync state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const objText = typeof initialObjective === "object"
        ? initialObjective?.labelEn || initialObjective?.labelAr || initialObjective?.id || ""
        : typeof initialObjective === "string" ? initialObjective : "";

      setFormData((prev) => {
        const activeSlug = initialService?.slug || prev.serviceSlug || servicesList[0]?.slug || "mega-events";
        const matchedService = servicesList.find((s) => s.slug === activeSlug) || initialService || servicesList[0];

        return {
          ...prev,
          serviceSlug: activeSlug,
          objective: objText || prev.objective || matchedService?.objectives?.[0]?.labelEn || "",
          primaryObjective: objText || prev.primaryObjective || matchedService?.objectives?.[0]?.labelEn || "",
          selectedRelatedServices: selectedServices && selectedServices.length > 0 ? selectedServices : prev.selectedRelatedServices,
        };
      });
    }
  }, [isOpen, initialService, initialObjective, selectedServices, servicesList]);

  // Accessible Dialog Behavior: Focus Trap, Focus Return, and Escape Key Handler
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on close button or modal
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>('button[aria-label], select, input');
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

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

  const currentService = servicesList.find((s) => s.slug === formData.serviceSlug) || initialService || servicesList[0];

  return (
    <>
      {/* 1. INTERACTIVE MODAL (Hidden during Print) */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto print:hidden"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="brief-builder-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-3xl shadow-2xl overflow-hidden my-8 focus:outline-none"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[var(--border-level-2)] bg-[var(--surface-raised)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 block">
                  {isAr ? "أداة التخطيط المؤسسي" : "Enterprise Brief Engine"}
                </span>
                <h2 id="brief-builder-title" className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  {isAr ? "بناء موجز المشروع والمواصفات" : "Build Your Project Brief"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={isAr ? "إغلاق نافذة بناء الموجز" : "Close Project Brief modal"}
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
                <span className="text-emerald-500 font-mono">{step * 25}%</span>
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
                      const match = servicesList.find((s) => s.slug === slug);
                      const defaultObj = match?.objectives?.[0]?.labelEn || "";
                      setFormData({
                        ...formData,
                        serviceSlug: slug,
                        objective: defaultObj,
                        primaryObjective: defaultObj,
                      });
                    }}
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] dark:bg-[#121b22] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500 cursor-pointer [&>option]:bg-[#182228] [&>option]:text-white dark:[&>option]:bg-[#121b22] dark:[&>option]:text-[#f1f5f9] [&>option]:py-2"
                  >
                    {servicesList.map((s) => (
                      <option key={s.slug} value={s.slug} className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9] py-2">
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
                      {currentService.objectives.map((obj) => {
                        const isChecked =
                          formData.objective === obj.labelEn ||
                          formData.objective === obj.id ||
                          formData.objective === obj.labelAr ||
                          formData.primaryObjective === obj.labelEn ||
                          formData.primaryObjective === obj.id;

                        return (
                          <label
                            key={obj.id}
                            className={cn(
                              "flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all",
                              isChecked
                                ? "bg-emerald-500/10 border-emerald-500"
                                : "bg-[var(--surface-raised)] border-[var(--border-level-2)] hover:border-emerald-500/30"
                            )}
                          >
                            <input
                              type="radio"
                              name="objective"
                              checked={isChecked}
                              onChange={() =>
                                setFormData({
                                  ...formData,
                                  objective: obj.labelEn,
                                  primaryObjective: obj.labelEn,
                                })
                              }
                              className="mt-1 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                              {isAr ? obj.labelAr : obj.labelEn}
                            </span>
                          </label>
                        );
                      })}
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
                      className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] dark:bg-[#121b22] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500 cursor-pointer [&>option]:bg-[#182228] [&>option]:text-white dark:[&>option]:bg-[#121b22] dark:[&>option]:text-[#f1f5f9] [&>option]:py-2"
                    >
                      <option value="Ballroom / Arena" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Ballroom / Arena</option>
                      <option value="Outdoor Boulevard / Plaza" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Outdoor Boulevard / Plaza</option>
                      <option value="Shopping Mall / Atrium" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Shopping Mall / Atrium</option>
                      <option value="Stadium / Multi-Acre" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Stadium / Multi-Acre</option>
                      <option value="Dedicated Entertainment Venue" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Dedicated Entertainment Venue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                      {isAr ? "البيئة المكانية:" : "Environment:"}
                    </label>
                    <select
                      value={formData.indoorOutdoor}
                      onChange={(e) => setFormData({ ...formData, indoorOutdoor: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] dark:bg-[#121b22] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500 cursor-pointer [&>option]:bg-[#182228] [&>option]:text-white dark:[&>option]:bg-[#121b22] dark:[&>option]:text-[#f1f5f9] [&>option]:py-2"
                    >
                      <option value="Indoor (Air Conditioned)" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Indoor (Air Conditioned)</option>
                      <option value="Outdoor (Open Air)" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Outdoor (Open Air)</option>
                      <option value="Hybrid (Indoor & Outdoor)" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Hybrid (Indoor & Outdoor)</option>
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
                            ? "bg-emerald-500 text-black border-emerald-500 shadow-xs"
                            : "bg-[var(--surface-raised)] border-[var(--border-level-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                      className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
                      {isAr ? "مدة المشروع / الفعالية:" : "Project / Event Duration:"}
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] dark:bg-[#121b22] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500 cursor-pointer [&>option]:bg-[#182228] [&>option]:text-white dark:[&>option]:bg-[#121b22] dark:[&>option]:text-[#f1f5f9] [&>option]:py-2"
                    >
                      <option value="Single Day" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Single Day</option>
                      <option value="1 - 3 Days" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">1 - 3 Days</option>
                      <option value="1 - 4 Weeks (Seasonal)" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">1 - 4 Weeks (Seasonal)</option>
                      <option value="Permanent / Long-Term" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Permanent / Long-Term</option>
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
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] dark:bg-[#121b22] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500 cursor-pointer [&>option]:bg-[#182228] [&>option]:text-white dark:[&>option]:bg-[#121b22] dark:[&>option]:text-[#f1f5f9] [&>option]:py-2"
                  >
                    <option value="Confidential / Flexible" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">Confidential / Flexible</option>
                    <option value="QAR 100,000 - QAR 350,000" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">QAR 100,000 - QAR 350,000</option>
                    <option value="QAR 350,000 - QAR 1,000,000" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">QAR 350,000 - QAR 1,000,000</option>
                    <option value="QAR 1,000,000 - QAR 5,000,000" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">QAR 1,000,000 - QAR 5,000,000</option>
                    <option value="QAR 5,000,000+ (Landmark / Turnkey)" className="bg-[#182228] text-white dark:bg-[#121b22] dark:text-[#f1f5f9]">QAR 5,000,000+ (Landmark / Turnkey)</option>
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
                    className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-emerald-500 resize-none"
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
                      className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500"
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
                      className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500"
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
                      className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500"
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
                      className="w-full p-3.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-level-2)] text-sm font-semibold text-[var(--text-primary)] focus:outline-emerald-500"
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
                  className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-black flex items-center justify-center shrink-0 shadow-sm font-bold">
                    <CheckCircle2 className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-emerald-500">
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
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-3.5 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-default)] border border-[var(--border-level-2)] font-bold text-xs sm:text-sm text-[var(--text-primary)] flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    {isAr ? "طباعة / حفظ PDF" : "Print / Save PDF"}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
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
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>{isAr ? "متابعة" : "Next Step"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. DEDICATED E3 BRANDED PRINT DOCUMENT (Visible ONLY when Printing / PDF) */}
      <div
        id="e3-printable-brief-portal"
        className="hidden print:block text-slate-900 bg-white p-8 max-w-[210mm] mx-auto font-sans leading-normal"
        dir={isAr ? "rtl" : "ltr"}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              html, body {
                background: #ffffff !important;
                color: #0f172a !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body > *:not(#e3-printable-brief-portal) {
                display: none !important;
              }
              #e3-printable-brief-portal {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                min-height: 100% !important;
                padding: 10mm 15mm !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
                color: #0f172a !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
              }
              @page {
                size: A4 portrait;
                margin: 8mm 12mm;
              }
            }
          `
        }} />

        {/* Print Document Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900">E3</span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Enterprise Brief
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Events & Entertainment Enterprises • Qatar
            </div>
          </div>

          <div className="text-right rtl:text-left space-y-1">
            <div className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-3 py-1 rounded border border-slate-300 inline-block">
              {submissionResult?.referenceNumber || `E3-BRF-${formData.serviceSlug?.toUpperCase() || "PROJ"}`}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Generated: {submissionResult?.generatedAt || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Official Document Banner */}
        <div className="bg-slate-900 text-white rounded-xl p-5 mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block mb-0.5">
              Preliminary Project Scope Brief
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {submissionResult?.serviceName || currentService?.titleEn || "Enterprise Service"}
            </h1>
          </div>
          <div className="text-right rtl:text-left text-xs font-mono text-slate-300">
            <span className="inline-block bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/40 font-bold uppercase text-[10px]">
              Status: Validated Inquiry
            </span>
          </div>
        </div>

        {/* Grid: Client & Core Specs */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          {/* Client Info Block */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <span>Client & Organization</span>
            </h3>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Person:</span>
                <span className="font-bold text-slate-900">{submissionResult?.clientName || formData.name || "Client Lead"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Company / Entity:</span>
                <span className="font-semibold text-slate-800">{submissionResult?.company || formData.company || "Direct Enterprise"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Business Email:</span>
                <span className="font-mono text-slate-800">{submissionResult?.email || formData.email}</span>
              </div>
              {formData.phone && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone / WhatsApp:</span>
                  <span className="font-mono text-slate-800">{submissionResult?.phone || formData.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Project Parameters Block */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <span>Execution Parameters</span>
            </h3>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Strategic Objective:</span>
                <span className="font-bold text-slate-900">{submissionResult?.objective || formData.objective || "Standard Execution"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Venue Type:</span>
                  <span className="font-semibold text-slate-800">{submissionResult?.venueType || formData.venueType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Environment:</span>
                  <span className="font-semibold text-slate-800">{submissionResult?.indoorOutdoor || formData.indoorOutdoor}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Window:</span>
                  <span className="font-semibold text-slate-800">{submissionResult?.targetDate || formData.targetDate || "Flexible"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Audience Scale:</span>
                  <span className="font-semibold text-slate-800">{submissionResult?.audienceSize || formData.audienceSize}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Budget Framework:</span>
                <span className="font-semibold text-emerald-700">{submissionResult?.budgetRange || formData.budgetRange}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Notes & Specific Requirements (if provided) */}
        {(formData.briefNotes || submissionResult?.notes) && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 mb-6 text-xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Client Technical Notes & Constraints:
            </h3>
            <p className="text-slate-800 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
              &ldquo;{submissionResult?.notes || formData.briefNotes}&rdquo;
            </p>
          </div>
        )}

        {/* Enterprise Governance & Delivery SLA */}
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 mb-6 text-xs text-slate-700 space-y-1.5">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>E3 Turnkey Delivery Standards & SLA Commitment</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            This preliminary scope brief has been registered in the E3 Enterprise Project System. A dedicated Technical Producer and Senior Project Lead will review the spatial specifications, local authority clearances (Civil Defence, MoI), and supply chain allocation to structure the formal delivery dossier.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[10px] text-slate-400">
          <div>
            <strong>Events & Entertainment Enterprises (E3)</strong> • Doha, State of Qatar • <span className="font-mono">https://eeeqa.com</span>
          </div>
          <div className="font-mono">
            enterprise@e3.qa • Confidential & Proprietary
          </div>
        </div>
      </div>
    </>
  );
}
