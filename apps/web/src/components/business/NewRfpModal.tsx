"use client";

import React, { useState } from "react";
import { X, Sparkles, Plus, Loader2, CheckCircle2 } from "lucide-react";

interface NewRfpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLead: any) => void;
  locale: string;
  defaultCompany?: string;
}

const CAPABILITIES = [
  { id: "Turnkey Spatial Design", labelEn: "Turnkey Spatial & Pavilion Design", labelAr: "التصميم الفضائي وتصميم الأجنحة" },
  { id: "Stage & Kinetic Engineering", labelEn: "Stage & Kinetic Engineering", labelAr: "الهندسة الحركية وهندسة المسارح" },
  { id: "AV & Projection Mapping", labelEn: "AV & Massive Projection Mapping", labelAr: "الأنظمة الصوتية والمرئية وعروض الإسقاط" },
  { id: "Crowd Ticketing & RFID", labelEn: "Turnkey Ticketing & Crowd RFID", labelAr: "بوابات التذاكر والتحكم بالحشود (RFID)" },
  { id: "Atmospheric Fabrication", labelEn: "Atmospheric Fabrication & Theming", labelAr: "التصنيع المعماري والثيمات التفاعلية" },
];

export function NewRfpModal({ isOpen, onClose, onSuccess, locale, defaultCompany }: NewRfpModalProps) {
  const isAr = locale === "ar";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedDate, setEstimatedDate] = useState("");
  const [budgetRange, setBudgetRange] = useState("100k - 500k QAR");
  const [selectedServices, setSelectedServices] = useState<string[]>([CAPABILITIES[0].id]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/business/rfps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          estimatedDate,
          budgetRange,
          services: selectedServices,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit RFP");
      }

      onSuccess(data.lead);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? "فشل تقديم الطلب" : "Failed to submit RFP"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                {isAr ? "تقديم طلب مشروع جديد (RFP)" : "Initiate New Project Brief (RFP)"}
              </h2>
              <p className="text-xs text-zinc-400">
                {defaultCompany ? `${defaultCompany} • ` : ""}
                {isAr ? "سيتم مراجعة الطلب مباشرة من فريق الهندسة التنفيذي" : "Executive engineering team will review directly"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              {isAr ? "عنوان المشروع / الفعالية" : "Project / Event Title"} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? "مثال: تجهيز جناح المعرض الدولي 2026" : "e.g. Doha Mega Pavilion 2026 Turnkey Staging"}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              {isAr ? "القدرات والخدمات الهندسية المطلوبة" : "Required Capabilities & Scope"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAPABILITIES.map((cap) => {
                const isSelected = selectedServices.includes(cap.id);
                return (
                  <button
                    type="button"
                    key={cap.id}
                    onClick={() => toggleService(cap.id)}
                    className={`p-3 rounded-xl border text-xs text-left rtl:text-right font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm"
                        : "bg-zinc-950/60 border-white/5 text-zinc-400 hover:border-white/15"
                    }`}
                  >
                    <span>{isAr ? cap.labelAr : cap.labelEn}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 ms-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                {isAr ? "الموعد المستهدف للتنفيذ" : "Target Execution Timeline"}
              </label>
              <input
                type="text"
                value={estimatedDate}
                onChange={(e) => setEstimatedDate(e.target.value)}
                placeholder={isAr ? "مثال: الربع الرابع 2026" : "e.g. Q4 2026 / November 2026"}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                {isAr ? "الميزانية الاستثمارية التقريبية" : "Target Investment Bracket"}
              </label>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-all font-medium"
              >
                <option value="50k - 100k QAR">50,000 - 100,000 QAR</option>
                <option value="100k - 500k QAR">100,000 - 500,000 QAR</option>
                <option value="500k - 2M QAR">500,000 - 2,000,000 QAR</option>
                <option value="2M+ QAR">2,000,000+ QAR</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              {isAr ? "وصف متطلبات المشروع والتفاصيل الهندسية" : "Scope Details & Technical Requirements"} *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isAr
                  ? "يرجى ذكر نبذة عن الفعالية، المساحة المتوقعة، وجميع المتطلبات الخاصة..."
                  : "Detail site specifications, expected guest capacity, required audio/visual hardware, and special engineering constraints..."
              }
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-all font-medium leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? "جاري الإرسال..." : "Submitting Brief..."}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? "إرسال طلب المشروع" : "Submit Project Brief"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
