"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Loader2,
  User,
  Image as ImageIcon,
  Briefcase,
  Globe,
  Sliders,
  X,
  Plus,
  Trash2,
  Award,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { MediaUploader } from "@/components/shared/MediaUploader";

type Tab = "basic" | "arabic" | "media" | "skills" | "publication";

function ensureArray<T = any>(val: any): T[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Interactive Chip / Tag Input Component (replaces raw JSON array textareas)
 */
function TagChipInput({
  label,
  tags,
  onChange,
  placeholder,
  dir = "ltr",
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
}) {
  const [inputVal, setInputVal] = useState("");

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className={`block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ${dir === "rtl" ? "text-end font-arabic" : ""}`}>
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 p-2 min-h-[44px] rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)]">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-xs font-medium text-[var(--text-primary)]"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="text-[var(--text-tertiary)] hover:text-rose-400 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex-1 min-w-[150px] flex items-center gap-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || (dir === "rtl" ? "اكتب واضغط Enter..." : "Type and press Enter...")}
            dir={dir}
            className="w-full px-2 py-1 text-xs bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
          />
          {inputVal.trim() && (
            <button
              type="button"
              onClick={handleAdd}
              className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[var(--color-primary)] text-white shrink-0 cursor-pointer"
            >
              {dir === "rtl" ? "إضافة" : "Add"}
            </button>
          )}
        </div>
      </div>
      <p className={`text-[10px] text-[var(--text-tertiary)] ${dir === "rtl" ? "text-end font-arabic" : ""}`}>
        {dir === "rtl" ? "اضغط Enter أو فاصلة لإضافة الوسم الجديد" : "Press Enter or comma to add each item"}
      </p>
    </div>
  );
}

/**
 * Structured Experience Timeline Repeater
 */
function TimelineRepeater({
  label,
  items,
  onChange,
  dir = "ltr",
}: {
  label: string;
  items: Array<{ role?: string; company?: string; period?: string; description?: string }>;
  onChange: (items: any[]) => void;
  dir?: "ltr" | "rtl";
}) {
  const addItem = () => {
    onChange([...items, { role: "", company: "", period: "", description: "" }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    onChange(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ${dir === "rtl" ? "text-end font-arabic" : ""}`}>
          {label} ({items.length})
        </label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{dir === "rtl" ? "إضافة خبرة +" : "+ Add Role"}</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className={`p-4 rounded-xl border border-dashed border-[var(--border-level-2)] bg-[var(--surface-hover)]/20 text-center text-xs text-[var(--text-tertiary)] ${dir === "rtl" ? "font-arabic" : ""}`}>
          {dir === "rtl" ? "لا توجد خبرات مسجلة. اضغط 'إضافة خبرة +' لإضافة منصب." : "No experience history added yet. Click '+ Add Role' to begin."}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-hover)]/30 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-level-1)]">
                <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
                  #{idx + 1} {dir === "rtl" ? "الخبرة والمنصب" : "Experience Record"}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[var(--text-tertiary)] hover:text-rose-400 p-1 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-[var(--text-tertiary)] block mb-1">
                    {dir === "rtl" ? "المسمى الوظيفي" : "Role / Title"}
                  </label>
                  <input
                    type="text"
                    value={item.role || (item as any).title || ""}
                    onChange={(e) => updateItem(idx, "role", e.target.value)}
                    dir={dir}
                    className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[var(--text-tertiary)] block mb-1">
                    {dir === "rtl" ? "الجهة / المؤسسة" : "Company / Entity"}
                  </label>
                  <input
                    type="text"
                    value={item.company || ""}
                    onChange={(e) => updateItem(idx, "company", e.target.value)}
                    dir={dir}
                    className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[var(--text-tertiary)] block mb-1">
                    {dir === "rtl" ? "الفترة الزمنية" : "Period (e.g. 2021 - Present)"}
                  </label>
                  <input
                    type="text"
                    value={item.period || (item as any).year || ""}
                    onChange={(e) => updateItem(idx, "period", e.target.value)}
                    dir={dir}
                    className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--text-tertiary)] block mb-1">
                  {dir === "rtl" ? "ملخص المسؤوليات والإنجازات" : "Responsibilities & Scope"}
                </label>
                <textarea
                  rows={2}
                  value={item.description || ""}
                  onChange={(e) => updateItem(idx, "description", e.target.value)}
                  dir={dir}
                  className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Structured Projects Portfolio Repeater
 */
function ProjectsRepeater({
  label,
  items,
  onChange,
  dir = "ltr",
}: {
  label: string;
  items: Array<{ title?: string; client?: string; year?: string; description?: string }>;
  onChange: (items: any[]) => void;
  dir?: "ltr" | "rtl";
}) {
  const addItem = () => {
    onChange([...items, { title: "", client: "", year: "", description: "" }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    onChange(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] ${dir === "rtl" ? "text-end font-arabic" : ""}`}>
          {label} ({items.length})
        </label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{dir === "rtl" ? "إضافة مشروع +" : "+ Add Project"}</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className={`p-4 rounded-xl border border-dashed border-[var(--border-level-2)] bg-[var(--surface-hover)]/20 text-center text-xs text-[var(--text-tertiary)] ${dir === "rtl" ? "font-arabic" : ""}`}>
          {dir === "rtl" ? "لا توجد مشاريع مضافة. اضغط 'إضافة مشروع +' لإدخال إنجاز." : "No project items added yet. Click '+ Add Project' to begin."}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl border border-[var(--border-level-2)] bg-[var(--surface-hover)]/30 space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border-level-1)]">
                <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
                  #{idx + 1} {dir === "rtl" ? "مشروع / فعالية" : "Project"}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[var(--text-tertiary)] hover:text-rose-400 p-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-[var(--text-tertiary)] block mb-1">
                    {dir === "rtl" ? "اسم المشروع" : "Project Name"}
                  </label>
                  <input
                    type="text"
                    value={item.title || ""}
                    onChange={(e) => updateItem(idx, "title", e.target.value)}
                    dir={dir}
                    className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[var(--text-tertiary)] block mb-1">
                    {dir === "rtl" ? "العميل أو الوجهة" : "Client / Venue / Scope"}
                  </label>
                  <input
                    type="text"
                    value={item.client || ""}
                    onChange={(e) => updateItem(idx, "client", e.target.value)}
                    dir={dir}
                    className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[var(--text-tertiary)] block mb-1">
                    {dir === "rtl" ? "سنة الإنجاز" : "Year (e.g. 2024)"}
                  </label>
                  <input
                    type="text"
                    value={item.year || ""}
                    onChange={(e) => updateItem(idx, "year", e.target.value)}
                    dir={dir}
                    className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--text-tertiary)] block mb-1">
                  {dir === "rtl" ? "تفاصيل الدور والمخرجات" : "Key Deliverables & Responsibilities"}
                </label>
                <textarea
                  rows={2}
                  value={item.description || ""}
                  onChange={(e) => updateItem(idx, "description", e.target.value)}
                  dir={dir}
                  className="w-full px-3 py-1.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Structured Education / Certification / Awards Repeater
 */
function GenericItemRepeater({
  label,
  items,
  onChange,
  field1Placeholder = "Title / Degree",
  field2Placeholder = "Institution / Organization",
  field3Placeholder = "Year",
}: {
  label: string;
  items: Array<{ title?: string; institution?: string; year?: string }>;
  onChange: (items: any[]) => void;
  field1Placeholder?: string;
  field2Placeholder?: string;
  field3Placeholder?: string;
}) {
  const addItem = () => {
    onChange([...items, { title: "", institution: "", year: "" }]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    onChange(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
          {label} ({items.length})
        </label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-[var(--text-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-3.5 rounded-xl border border-dashed border-[var(--border-level-2)] bg-[var(--surface-hover)]/20 text-center text-xs text-[var(--text-tertiary)]">
          No entries added yet.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl border border-[var(--border-level-2)] bg-[var(--surface-hover)]/30 flex items-center gap-2">
              <input
                type="text"
                placeholder={field1Placeholder}
                value={item.title || (item as any).degree || (item as any).certificate || ""}
                onChange={(e) => updateItem(idx, "title", e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder={field2Placeholder}
                value={item.institution || (item as any).issuer || (item as any).organization || ""}
                onChange={(e) => updateItem(idx, "institution", e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder={field3Placeholder}
                value={item.year || ""}
                onChange={(e) => updateItem(idx, "year", e.target.value)}
                className="w-24 px-2.5 py-1.5 rounded-lg border border-[var(--border-level-2)] bg-[var(--surface-default)] text-xs text-[var(--text-primary)]"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-[var(--text-tertiary)] hover:text-rose-400 p-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EmployeeFormModal({
  isOpen,
  onClose,
  employee,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("basic");

  const [formData, setFormData] = useState({
    // English Basic
    firstName: "",
    lastName: "",
    slug: "",
    designation: "",
    department: "",
    presentationGroup: "",
    yearsOfExperience: 0,
    contactEmail: "",
    linkedinUrl: "",

    // Arabic Localization Fields
    firstNameAr: "",
    lastNameAr: "",
    designationAr: "",
    departmentAr: "",
    taglineAr: "",
    heroTaglineAr: "",
    aboutSummaryAr: "",
    careerJourneyAr: "",
    keyStrengthsAr: "",
    expertiseTagsAr: [] as string[],
    experienceAr: [] as any[],
    projectsAr: [] as any[],
    coreCompetenciesAr: [] as string[],

    // Media & Prose
    profileImage: "",
    tagline: "",
    aboutSummary: "",
    careerJourney: "",
    keyStrengths: "",

    // English Structured Skills & Experience (Zero JSON textareas!)
    expertiseTags: [] as string[],
    coreCompetencies: [] as string[],
    experience: [] as any[],
    projects: [] as any[],
    certifications: [] as any[],
    education: [] as any[],
    awards: [] as any[],

    // Publication Controls
    isActive: true,
    showOnTeamPage: true,
    isFeatured: false,
    order: 0,
    displayOrder: 0,
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        slug: employee.slug || "",
        designation: employee.designation || "",
        department: employee.department || "",
        yearsOfExperience: employee.yearsOfExperience || 0,
        contactEmail: employee.contactEmail || "",
        linkedinUrl: employee.linkedinUrl || "",

        firstNameAr: employee.firstNameAr || "",
        lastNameAr: employee.lastNameAr || "",
        designationAr: employee.designationAr || "",
        departmentAr: employee.departmentAr || "",
        taglineAr: employee.taglineAr || employee.heroTaglineAr || "",
        heroTaglineAr: employee.heroTaglineAr || employee.taglineAr || "",
        aboutSummaryAr: employee.aboutSummaryAr || "",
        careerJourneyAr: employee.careerJourneyAr || "",
        keyStrengthsAr: employee.keyStrengthsAr || "",
        expertiseTagsAr: ensureArray<string>(employee.expertiseTagsAr),
        experienceAr: ensureArray(employee.experienceAr),
        projectsAr: ensureArray(employee.projectsAr),
        coreCompetenciesAr: ensureArray<string>(employee.coreCompetenciesAr),

        profileImage: employee.profileImage || "",
        tagline: employee.tagline || "",
        aboutSummary: employee.aboutSummary || "",
        careerJourney: employee.careerJourney || "",
        keyStrengths: employee.keyStrengths || "",

        expertiseTags: ensureArray<string>(employee.expertiseTags),
        coreCompetencies: ensureArray<string>(employee.coreCompetencies),
        experience: ensureArray(employee.experience),
        projects: ensureArray(employee.projects),
        certifications: ensureArray(employee.certifications),
        education: ensureArray(employee.education),
        awards: ensureArray(employee.awards),

        isActive: employee.isActive !== undefined ? Boolean(employee.isActive) : true,
        showOnTeamPage: employee.showOnTeamPage !== undefined ? Boolean(employee.showOnTeamPage) : true,
        isFeatured: Boolean(employee.isFeatured),
        order: employee.order !== undefined ? Number(employee.order) : 0,
        displayOrder: employee.displayOrder !== undefined ? Number(employee.displayOrder) : Number(employee.order || 0),
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        slug: "",
        designation: "",
        department: "",
        presentationGroup: "",
        yearsOfExperience: 0,
        contactEmail: "",
        linkedinUrl: "",

        firstNameAr: "",
        lastNameAr: "",
        designationAr: "",
        departmentAr: "",
        taglineAr: "",
        heroTaglineAr: "",
        aboutSummaryAr: "",
        careerJourneyAr: "",
        keyStrengthsAr: "",
        expertiseTagsAr: [],
        experienceAr: [],
        projectsAr: [],
        coreCompetenciesAr: [],

        profileImage: "",
        tagline: "",
        aboutSummary: "",
        careerJourney: "",
        keyStrengths: "",

        expertiseTags: [],
        coreCompetencies: [],
        experience: [],
        projects: [],
        certifications: [],
        education: [],
        awards: [],

        isActive: true,
        showOnTeamPage: true,
        isFeatured: false,
        order: 0,
        displayOrder: 0,
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        slug: formData.slug?.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        department: formData.department,
        yearsOfExperience: parseInt(formData.yearsOfExperience.toString()) || 0,
        contactEmail: formData.contactEmail || null,
        linkedinUrl: formData.linkedinUrl || null,

        firstNameAr: formData.firstNameAr || null,
        lastNameAr: formData.lastNameAr || null,
        designationAr: formData.designationAr || null,
        departmentAr: formData.departmentAr || null,
        taglineAr: formData.taglineAr || formData.heroTaglineAr || null,
        heroTaglineAr: formData.heroTaglineAr || formData.taglineAr || null,
        aboutSummaryAr: formData.aboutSummaryAr || null,
        careerJourneyAr: formData.careerJourneyAr || null,
        keyStrengthsAr: formData.keyStrengthsAr || null,

        profileImage: formData.profileImage || null,
        tagline: formData.tagline,
        aboutSummary: formData.aboutSummary,
        careerJourney: formData.careerJourney,
        keyStrengths: formData.keyStrengths,

        order: parseInt(formData.order.toString()) || 0,
        displayOrder: parseInt(formData.displayOrder.toString()) || 0,
        isActive: Boolean(formData.isActive),
        showOnTeamPage: Boolean(formData.showOnTeamPage),
        isFeatured: Boolean(formData.isFeatured),

        // Clean arrays passed directly without raw JSON stringification!
        expertiseTags: formData.expertiseTags,
        coreCompetencies: formData.coreCompetencies,
        experience: formData.experience,
        projects: formData.projects,
        certifications: formData.certifications,
        education: formData.education,
        awards: formData.awards,

        expertiseTagsAr: formData.expertiseTagsAr,
        coreCompetenciesAr: formData.coreCompetenciesAr,
        experienceAr: formData.experienceAr,
        projectsAr: formData.projectsAr,
      };

      const endpoint = employee ? `/api/team?id=${employee.id}` : `/api/team`;
      const res = await fetch(endpoint, {
        method: employee ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee ? { id: employee.id, ...payload } : payload),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(
          "Error saving profile: " +
            (data.details ? data.details.join("\n") : data.error || "Unknown error")
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save profile. Please check form fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? "Edit Team Member" : "Add Team Member"}
      size="xl"
    >
      <div className="flex flex-col md:flex-row max-h-[85vh] overflow-hidden bg-[var(--surface-default)]">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 border-e border-[var(--border-level-1)] bg-[var(--surface-hover)]/30 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">
            Editor Tabs
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "basic"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <User className="w-4 h-4" /> English Info
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("arabic")}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "arabic"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <span className="flex items-center gap-3">
              <Globe className="w-4 h-4" /> Arabic Content
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              AR
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "media"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Portrait & Bio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "skills"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Skills & Roles
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("publication")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "publication"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Sliders className="w-4 h-4" /> Visibility & Order
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[85vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Basic Info */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      First Name (EN) *
                    </label>
                    <Input
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="e.g. Adil"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      Last Name (EN) *
                    </label>
                    <Input
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="e.g. Ahmed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      URL Slug *
                    </label>
                    <Input
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="adil-ahmed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.yearsOfExperience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearsOfExperience: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      Designation / Role Title *
                    </label>
                    <Input
                      required
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({ ...formData, designation: e.target.value })
                      }
                      placeholder="Managing Director & Founder"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      Department *
                    </label>
                    <Input
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      placeholder="Leadership & Strategy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      LinkedIn URL
                    </label>
                    <Input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedinUrl: e.target.value })
                      }
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      Internal Contact Email
                    </label>
                    <Input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, contactEmail: e.target.value })
                      }
                      placeholder="adil@e3.qa"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Arabic Localization */}
            {activeTab === "arabic" && (
              <div className="space-y-6" dir="rtl">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <p className="font-bold mb-1 font-arabic">التعريب والبيانات العربية المعتمدة</p>
                  <p className="font-arabic">
                    البيانات هنا تعرض مباشرة للزوار عند تصفح الموقع باللغة العربية مع دعم الخطوط والاتجاهات الصحيحة.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1 font-arabic text-end">
                      الاسم الأول (بالعربية)
                    </label>
                    <Input
                      value={formData.firstNameAr}
                      onChange={(e) =>
                        setFormData({ ...formData, firstNameAr: e.target.value })
                      }
                      placeholder="عادل"
                      className="text-end font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1 font-arabic text-end">
                      اسم العائلة (بالعربية)
                    </label>
                    <Input
                      value={formData.lastNameAr}
                      onChange={(e) =>
                        setFormData({ ...formData, lastNameAr: e.target.value })
                      }
                      placeholder="أحمد"
                      className="text-end font-arabic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1 font-arabic text-end">
                      المسمى الوظيفي (بالعربية)
                    </label>
                    <Input
                      value={formData.designationAr}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designationAr: e.target.value,
                        })
                      }
                      placeholder="المدير التنفيذي والمؤسس"
                      className="text-end font-arabic"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1 font-arabic text-end">
                      القسم الإداري (بالعربية)
                    </label>
                    <Input
                      value={formData.departmentAr}
                      onChange={(e) =>
                        setFormData({ ...formData, departmentAr: e.target.value })
                      }
                      placeholder="القيادة والاستراتيجية"
                      className="text-end font-arabic"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 font-arabic text-end">
                    شعار التقديم / Hero Tagline (بالعربية)
                  </label>
                  <Input
                    value={formData.taglineAr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taglineAr: e.target.value,
                        heroTaglineAr: e.target.value,
                      })
                    }
                    placeholder="قائد رؤيوي بخبرة تزيد عن 20 عاماً في قطاع الترفيه والفعاليات..."
                    className="text-end font-arabic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 font-arabic text-end">
                    السيرة الذاتية المفصلة (بالعربية)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.aboutSummaryAr}
                    onChange={(e) =>
                      setFormData({ ...formData, aboutSummaryAr: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-end font-arabic"
                    placeholder="اكتب نبذة مهنية مفصلة باللغة العربية..."
                  />
                </div>

                {/* Structured Arabic Tags (NO JSON!) */}
                <TagChipInput
                  label="وسوم الخبرة والتخصص بالعربية"
                  tags={formData.expertiseTagsAr}
                  onChange={(tags) => setFormData({ ...formData, expertiseTagsAr: tags })}
                  placeholder="أدخل تخصصاً واضغط Enter (مثال: إدارة الفعاليات)..."
                  dir="rtl"
                />

                {/* Structured Arabic Experience (NO JSON!) */}
                <TimelineRepeater
                  label="المسيرة والخبرات المهنية بالعربية"
                  items={formData.experienceAr}
                  onChange={(exp) => setFormData({ ...formData, experienceAr: exp })}
                  dir="rtl"
                />

                {/* Structured Arabic Projects (NO JSON!) */}
                <ProjectsRepeater
                  label="سجل المشاريع والأعمال بالعربية"
                  items={formData.projectsAr}
                  onChange={(projs) => setFormData({ ...formData, projectsAr: projs })}
                  dir="rtl"
                />
              </div>
            )}

            {/* 3. Media & Prose */}
            {activeTab === "media" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                    Profile Portrait / Media URL
                  </label>
                  <MediaUploader
                    value={formData.profileImage}
                    onChange={(url) =>
                      setFormData({ ...formData, profileImage: url })
                    }
                    accept="image/*,video/*"
                  />
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">
                    Upload a high-res portrait image (e.g. /images/team/adil-ahmed.webp).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    Hero Tagline (EN)
                  </label>
                  <Input
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData({ ...formData, tagline: e.target.value })
                    }
                    className="w-full"
                    placeholder="Visionary leader with 20+ years of entertainment experience..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    About Summary / Bio (EN)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    value={formData.aboutSummary}
                    onChange={(e) =>
                      setFormData({ ...formData, aboutSummary: e.target.value })
                    }
                    placeholder="Write a detailed professional summary..."
                  />
                </div>
              </div>
            )}

            {/* 4. Skills, Roles & Experience (Zero JSON textareas!) */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs flex items-center gap-2">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="font-bold">Structured Skills & Career Portfolio</p>
                    <p className="text-[11px] text-purple-300">
                      Add expertise tags, experience roles, and landmark projects directly using clean form controls without raw JSON syntax.
                    </p>
                  </div>
                </div>

                {/* Expertise Tags (EN) */}
                <TagChipInput
                  label="Expertise & Skills Tags (EN)"
                  tags={formData.expertiseTags}
                  onChange={(tags) => setFormData({ ...formData, expertiseTags: tags })}
                  placeholder="Type a skill and press Enter (e.g. Stage Management)..."
                />

                {/* Core Competencies (EN) */}
                <TagChipInput
                  label="Core Competencies & Capabilities (EN)"
                  tags={formData.coreCompetencies}
                  onChange={(tags) => setFormData({ ...formData, coreCompetencies: tags })}
                  placeholder="Type competency and press Enter (e.g. Strategic Planning)..."
                />

                {/* Experience History (EN) */}
                <TimelineRepeater
                  label="Professional Experience Timeline (EN)"
                  items={formData.experience}
                  onChange={(exp) => setFormData({ ...formData, experience: exp })}
                />

                {/* Projects Portfolio (EN) */}
                <ProjectsRepeater
                  label="Projects & Production Portfolio (EN)"
                  items={formData.projects}
                  onChange={(projs) => setFormData({ ...formData, projects: projs })}
                />

                {/* Education */}
                <GenericItemRepeater
                  label="Education Degrees"
                  items={formData.education}
                  onChange={(edu) => setFormData({ ...formData, education: edu })}
                  field1Placeholder="Degree (e.g. B.Sc. Mechanical Engineering)"
                  field2Placeholder="University / Institution"
                  field3Placeholder="Year"
                />

                {/* Certifications */}
                <GenericItemRepeater
                  label="Professional Certifications"
                  items={formData.certifications}
                  onChange={(certs) => setFormData({ ...formData, certifications: certs })}
                  field1Placeholder="Certification (e.g. PMP, Rigging Safety)"
                  field2Placeholder="Issuing Body / Authority"
                  field3Placeholder="Year"
                />

                {/* Awards */}
                <GenericItemRepeater
                  label="Honors & Industry Awards"
                  items={formData.awards}
                  onChange={(awards) => setFormData({ ...formData, awards: awards })}
                  field1Placeholder="Award Title"
                  field2Placeholder="Organization"
                  field3Placeholder="Year"
                />
              </div>
            )}

            {/* 5. Publication Controls */}
            {activeTab === "publication" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
                  <p className="font-bold mb-1">Visibility & Sorting Controls</p>
                  <p>
                    Control public availability, featured badges, and ordering across the website.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-hover)]/40">
                    <div>
                      <label htmlFor="isActive" className="font-bold text-sm text-[var(--text-primary)] block cursor-pointer">
                        Profile Active
                      </label>
                      <p className="text-xs text-[var(--text-secondary)]">
                        When disabled, profile is completely hidden from public access (returns 404).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-hover)]/40">
                    <div>
                      <label htmlFor="showOnTeamPage" className="font-bold text-sm text-[var(--text-primary)] block cursor-pointer">
                        Show on Team Directory Page
                      </label>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Whether this member appears in the public Team Roster.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="showOnTeamPage"
                      checked={formData.showOnTeamPage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showOnTeamPage: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-hover)]/40">
                    <div>
                      <label htmlFor="isFeatured" className="font-bold text-sm text-[var(--text-primary)] block cursor-pointer">
                        Featured Executive / Leader
                      </label>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Gives this member featured emphasis in search and category views.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({ ...formData, isFeatured: e.target.checked })
                      }
                      className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                        Display Order
                      </label>
                      <Input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            displayOrder: parseInt(e.target.value) || 0,
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                        Lower number displays first (e.g. 1, 2, 3).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border-level-1)]">
              <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {employee ? "Save Profile" : "Create Member"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
