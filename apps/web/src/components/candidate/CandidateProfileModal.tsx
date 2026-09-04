"use client";

import React, { useState } from "react";
import { X, User, Phone, MapPin, Briefcase, Globe, Award, Sparkles, Loader2, Check } from "lucide-react";

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  initialProfile: {
    name?: string;
    phone?: string;
    headline?: string;
    department?: string;
    experienceLevel?: string;
    skills?: string[];
    summary?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  onProfileUpdated: (updated: any) => void;
}

const COMMON_SKILLS = [
  "Live Audio Engineering",
  "Lighting Design & GrandMA",
  "Stage Automation & Rigging",
  "Unreal Engine / Virtual Production",
  "Projection Mapping & disguise",
  "Crowd Logistics & Operations",
  "Fabrication & Scenic Construction",
  "AutoCAD & Technical Drafting",
];

export function CandidateProfileModal({
  isOpen,
  onClose,
  locale,
  initialProfile,
  onProfileUpdated,
}: CandidateProfileModalProps) {
  const isAr = locale === "ar";

  const [name, setName] = useState(initialProfile.name || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [headline, setHeadline] = useState(initialProfile.headline || "");
  const [department, setDepartment] = useState(initialProfile.department || "Operations");
  const [experienceLevel, setExperienceLevel] = useState(initialProfile.experienceLevel || "Mid-Level");
  const [location, setLocation] = useState(initialProfile.location || "Doha, Qatar");
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile.portfolioUrl || "");
  const [summary, setSummary] = useState(initialProfile.summary || "");
  const [skills, setSkills] = useState<string[]>(initialProfile.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || newSkill).trim();
    if (!s) return;
    if (!skills.includes(s)) {
      setSkills([...skills, s]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        name,
        phone,
        headline,
        department,
        experienceLevel,
        location,
        linkedinUrl,
        portfolioUrl,
        summary,
        skills,
      };

      const res = await fetch("/api/candidate/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      onProfileUpdated(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isAr ? "تعديل الملف المهني والشخصي" : "Edit Candidate Professional Profile"}
              </h2>
              <p className="text-xs text-zinc-400">
                {isAr ? "تحديث بيانات الاتصال، التخصص، والمهارات المعتمدة" : "Update your contact info, target role, and verified skills"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                {isAr ? "الاسم الكامل" : "Full Name"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                {isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+974 5500 0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                {isAr ? "المسمى المهني المستهدف" : "Target Role / Headline"}
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder={isAr ? "مثال: مهندس أنظمة صوتية وإضاءة" : "e.g. Lead AV Systems Engineer"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                {isAr ? "القسم / التخصص" : "Department"}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Operations">Operations & Logistics</option>
                <option value="Engineering">Technical & Stage Engineering</option>
                <option value="Creative">Creative, 3D & Spatial</option>
                <option value="Sales">Corporate Sales & Partnerships</option>
                <option value="Executive">Executive & Project Management</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                {isAr ? "مستوى الخبرة" : "Experience Level"}
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Junior">Junior (1-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                <option value="Senior">Senior (6-9 yrs)</option>
                <option value="Lead">Lead / Director (10+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                {isAr ? "موقع الإقامة الحالية" : "Current Location"}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Doha, Qatar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                {isAr ? "رابط LinkedIn" : "LinkedIn URL"}
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              {isAr ? "رابط معرض الأعمال / البورتفوليو" : "Portfolio / Showreel URL"}
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://myportfolio.qa or Vimeo / Behance"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Skills Management */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">
              {isAr ? "المهارات والتقنيات" : "Skills & Technologies"}
            </label>

            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-zinc-950 rounded-xl border border-white/10">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-zinc-500 p-1">
                  {isAr ? "لم تتم إضافة مهارات بعد" : "No skills added yet"}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder={isAr ? "أضف مهارة واضغط إضافة..." : "Add a custom skill..."}
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
              >
                {isAr ? "إضافة" : "Add"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-zinc-500">{isAr ? "مقترحات سريعة:" : "Quick add:"}</span>
              {COMMON_SKILLS.filter((s) => !skills.includes(s))
                .slice(0, 4)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 border border-white/5 transition-all"
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              {isAr ? "نبذة مهنية موجزة" : "Professional Bio / Executive Summary"}
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={
                isAr
                  ? "اكتب نبذة عن مسارك المهني وأبرز المشاريع والفعاليات التي شاركت في إنجازها..."
                  : "Highlight your key achievements, event engineering experience, and technical leadership..."
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isAr ? "حفظ التغييرات" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
