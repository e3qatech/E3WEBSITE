"use client";

import React, { useState } from "react";
import { Building2, Globe, ShieldCheck, Check, AlertCircle, Loader2 } from "lucide-react";

interface CompanyProfileEditorProps {
  organization: {
    id: string;
    company: string;
    type?: string;
    industry?: string | null;
    website?: string | null;
  };
  canEdit: boolean;
  locale: string;
}

export function CompanyProfileEditor({ organization, canEdit, locale }: CompanyProfileEditorProps) {
  const isAr = locale === "ar";
  const [company, setCompany] = useState(organization.company || "");
  const [industry, setIndustry] = useState(organization.industry || "");
  const [website, setWebsite] = useState(organization.website || "");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/business/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          industry,
          website,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setStatusMessage({
        type: "success",
        text: isAr ? "تم حفظ بيانات المؤسسة بنجاح" : "Organization profile updated successfully",
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || (isAr ? "حدث خطأ أثناء الحفظ" : "An error occurred while saving"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {statusMessage.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="bg-zinc-900/60 border border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>{isAr ? "بيانات المؤسسة المعتمدة" : "Corporate Details"}</span>
          </div>
          {canEdit ? (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {isAr ? "صلاحية التعديل متاحة" : "Editor Access"}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-zinc-500 bg-zinc-800 px-2.5 py-0.5 rounded-full">
              {isAr ? "للقراءة فقط" : "Read-only"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              {isAr ? "اسم المؤسسة / الشركة" : "Legal Company Name"}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-amber-500/60 disabled:opacity-60 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              {isAr ? "القطاع / المجال" : "Industry Sector"}
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder={isAr ? "مثال: فعاليات حكومية، ضيافة، ترفيه" : "e.g. Government, Hospitality, Sports & Entertainment"}
              className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-amber-500/60 disabled:opacity-60 transition-all"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>{isAr ? "الموقع الإلكتروني الرسمي" : "Official Website URL"}</span>
            </label>
            <input
              type="url"
              disabled={!canEdit}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.qa"
              className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-amber-500/60 disabled:opacity-60 transition-all font-mono"
            />
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? "حفظ التغييرات" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
