"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Loader2,
  User,
  Image as ImageIcon,
  Code,
  Globe,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { MediaUploader } from "@/components/shared/MediaUploader";

type Tab = "basic" | "arabic" | "media" | "advanced" | "publication";

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
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});

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
    expertiseTagsAr: "[]",
    experienceAr: "[]",
    projectsAr: "[]",
    coreCompetenciesAr: "[]",

    // Media & Prose
    profileImage: "",
    tagline: "",
    aboutSummary: "",
    careerJourney: "",
    keyStrengths: "",

    // English Advanced JSON Data
    expertiseTags: "[]",
    coreCompetencies: "[]",
    experience: "[]",
    projects: "[]",
    certifications: "[]",
    education: "[]",
    awards: "[]",
    skillsMatrix: "[]",
    mediaGallery: "[]",
    testimonials: "[]",

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
        expertiseTagsAr: JSON.stringify(employee.expertiseTagsAr || [], null, 2),
        experienceAr: JSON.stringify(employee.experienceAr || [], null, 2),
        projectsAr: JSON.stringify(employee.projectsAr || [], null, 2),
        coreCompetenciesAr: JSON.stringify(employee.coreCompetenciesAr || [], null, 2),

        profileImage: employee.profileImage || "",
        tagline: employee.tagline || "",
        aboutSummary: employee.aboutSummary || "",
        careerJourney: employee.careerJourney || "",
        keyStrengths: employee.keyStrengths || "",

        expertiseTags: JSON.stringify(employee.expertiseTags || [], null, 2),
        coreCompetencies: JSON.stringify(employee.coreCompetencies || [], null, 2),
        experience: JSON.stringify(employee.experience || [], null, 2),
        projects: JSON.stringify(employee.projects || [], null, 2),
        certifications: JSON.stringify(employee.certifications || [], null, 2),
        education: JSON.stringify(employee.education || [], null, 2),
        awards: JSON.stringify(employee.awards || [], null, 2),
        skillsMatrix: JSON.stringify(employee.skillsMatrix || [], null, 2),
        mediaGallery: JSON.stringify(employee.mediaGallery || [], null, 2),
        testimonials: JSON.stringify(employee.testimonials || [], null, 2),

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
        expertiseTagsAr: "[]",
        experienceAr: "[]",
        projectsAr: "[]",
        coreCompetenciesAr: "[]",

        profileImage: "",
        tagline: "",
        aboutSummary: "",
        careerJourney: "",
        keyStrengths: "",

        expertiseTags: "[]",
        coreCompetencies: "[]",
        experience: "[]",
        projects: "[]",
        certifications: "[]",
        education: "[]",
        awards: "[]",
        skillsMatrix: "[]",
        mediaGallery: "[]",
        testimonials: "[]",

        isActive: true,
        showOnTeamPage: true,
        isFeatured: false,
        order: 0,
        displayOrder: 0,
      });
    }
    setJsonErrors({});
    setActiveTab("basic");
  }, [employee, isOpen]);

  const validateJsonField = (name: string, value: string) => {
    try {
      if (!value.trim()) return;
      JSON.parse(value);
      setJsonErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    } catch (e: any) {
      setJsonErrors((prev) => ({
        ...prev,
        [name]: e.message || "Invalid JSON format",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parseJsonSafely = (str: string, fieldName: string) => {
        try {
          return str.trim() ? JSON.parse(str) : [];
        } catch {
          throw new Error(`Invalid JSON in field: ${fieldName}`);
        }
      };

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

        // Parse English JSON
        expertiseTags: parseJsonSafely(formData.expertiseTags, "Expertise Tags (EN)"),
        coreCompetencies: parseJsonSafely(formData.coreCompetencies, "Core Competencies (EN)"),
        experience: parseJsonSafely(formData.experience, "Experience (EN)"),
        projects: parseJsonSafely(formData.projects, "Projects (EN)"),
        certifications: parseJsonSafely(formData.certifications, "Certifications (EN)"),
        education: parseJsonSafely(formData.education, "Education (EN)"),
        awards: parseJsonSafely(formData.awards, "Awards (EN)"),
        skillsMatrix: parseJsonSafely(formData.skillsMatrix, "Skills Matrix (EN)"),
        mediaGallery: parseJsonSafely(formData.mediaGallery, "Media Gallery (EN)"),
        testimonials: parseJsonSafely(formData.testimonials, "Testimonials (EN)"),

        // Parse Arabic JSON
        expertiseTagsAr: parseJsonSafely(formData.expertiseTagsAr, "Expertise Tags (AR)"),
        coreCompetenciesAr: parseJsonSafely(formData.coreCompetenciesAr, "Core Competencies (AR)"),
        experienceAr: parseJsonSafely(formData.experienceAr, "Experience (AR)"),
        projectsAr: parseJsonSafely(formData.projectsAr, "Projects (AR)"),
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
      alert(err.message || "Submission failed. Please check your JSON syntax.");
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
            onClick={() => setActiveTab("advanced")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "advanced"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Code className="w-4 h-4" /> Advanced JSON
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
            <Sliders className="w-4 h-4" /> Publication Controls
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col h-full overflow-hidden relative"
        >
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* 1. Basic Info (English) */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      First Name (EN) *
                    </label>
                    <Input
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      Last Name (EN) *
                    </label>
                    <Input
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      Slug (URL) *
                    </label>
                    <Input
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="e.g. adil-ahmed"
                      className="w-full font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      Department (EN) *
                    </label>
                    <Input
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      Designation (EN) *
                    </label>
                    <Input
                      required
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({ ...formData, designation: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      Presentation Group (Public Navigator)
                    </label>
                    <select
                      value={formData.presentationGroup || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, presentationGroup: e.target.value })
                      }
                      className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-medium"
                    >
                      <option value="">Auto-resolve (Safe Deterministic Fallback)</option>
                      <option value="direction">01. Direction — Leadership & Strategy (التوجيه)</option>
                      <option value="imagine">02. Imagine — Creative, Brand & Growth (الابتكار)</option>
                      <option value="plan">03. Plan — Projects & Events (التخطيط)</option>
                      <option value="build">04. Build — Production & Logistics (التنفيذ)</option>
                      <option value="operate">05. Operate — Operations & Guest Experience (التشغيل)</option>
                      <option value="amplify">06. Amplify — Technology & Systems (التطوير)</option>
                      <option value="corporate-enablement">07. Corporate Enablement (التمكين المؤسسي)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          yearsOfExperience: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      LinkedIn URL
                    </label>
                    <Input
                      value={formData.linkedinUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedinUrl: e.target.value })
                      }
                      className="w-full font-mono text-sm"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      Contact Email
                    </label>
                    <Input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, contactEmail: e.target.value })
                      }
                      className="w-full"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Arabic Content (RTL) */}
            {activeTab === "arabic" && (
              <div className="space-y-6" dir="rtl">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>
                    محرر المحتوى باللغة العربية. يتم تطبيق هذه البيانات في واجهات /ar/b2b/team بدقة وبدون أي نصوص إنجليزية.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 text-end">
                      الاسم الأول بالعربية (First Name AR)
                    </label>
                    <Input
                      value={formData.firstNameAr}
                      onChange={(e) =>
                        setFormData({ ...formData, firstNameAr: e.target.value })
                      }
                      className="w-full text-end font-arabic"
                      placeholder="مثال: عادل"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 text-end">
                      اسم العائلة بالعربية (Last Name AR)
                    </label>
                    <Input
                      value={formData.lastNameAr}
                      onChange={(e) =>
                        setFormData({ ...formData, lastNameAr: e.target.value })
                      }
                      className="w-full text-end font-arabic"
                      placeholder="مثال: أحمد"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 text-end">
                      المسمى الوظيفي بالعربية (Designation AR)
                    </label>
                    <Input
                      value={formData.designationAr}
                      onChange={(e) =>
                        setFormData({ ...formData, designationAr: e.target.value })
                      }
                      className="w-full text-end font-arabic"
                      placeholder="مثال: الرئيس التنفيذي والعضو المنتدب"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 text-end">
                      القسم بالعربية (Department AR)
                    </label>
                    <Input
                      value={formData.departmentAr}
                      onChange={(e) =>
                        setFormData({ ...formData, departmentAr: e.target.value })
                      }
                      className="w-full text-end font-arabic"
                      placeholder="مثال: الإدارة التنفيذية"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 text-end">
                    شعار الواجهة بالعربية (Hero Tagline AR)
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
                    className="w-full text-end font-arabic"
                    placeholder="شعار ملهم وموجز..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 text-end">
                    النبذة المهنية بالعربية (About / Bio AR)
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

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] text-end">
                    هياكل البيانات الإضافية بالعربية (JSON Arrays)
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-end">
                      وسوم الخبرة بالعربية (Expertise Tags AR JSON)
                    </label>
                    <Input
                      value={formData.expertiseTagsAr}
                      onChange={(e) => {
                        setFormData({ ...formData, expertiseTagsAr: e.target.value });
                        validateJsonField("expertiseTagsAr", e.target.value);
                      }}
                      className="w-full font-mono text-xs text-start"
                      dir="ltr"
                    />
                    {jsonErrors.expertiseTagsAr && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 justify-end">
                        <span>{jsonErrors.expertiseTagsAr}</span>
                        <AlertCircle className="w-3 h-3" />
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-end">
                      المسيرة والخبرات المهنية بالعربية (Experience Timeline AR JSON)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.experienceAr}
                      onChange={(e) => {
                        setFormData({ ...formData, experienceAr: e.target.value });
                        validateJsonField("experienceAr", e.target.value);
                      }}
                      className="w-full rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-3 font-mono text-xs text-start"
                      dir="ltr"
                    />
                    {jsonErrors.experienceAr && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 justify-end">
                        <span>{jsonErrors.experienceAr}</span>
                        <AlertCircle className="w-3 h-3" />
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 text-end">
                      سجل المشاريع بالعربية (Projects Portfolio AR JSON)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.projectsAr}
                      onChange={(e) => {
                        setFormData({ ...formData, projectsAr: e.target.value });
                        validateJsonField("projectsAr", e.target.value);
                      }}
                      className="w-full rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-3 font-mono text-xs text-start"
                      dir="ltr"
                    />
                    {jsonErrors.projectsAr && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 justify-end">
                        <span>{jsonErrors.projectsAr}</span>
                        <AlertCircle className="w-3 h-3" />
                      </p>
                    )}
                  </div>
                </div>
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

            {/* 4. Advanced JSON */}
            {activeTab === "advanced" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                  <p className="font-bold mb-1">English JSON Arrays</p>
                  <p>
                    Provide valid JSON array structures. These values represent the canonical English dataset.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    Expertise Tags (EN JSON)
                  </label>
                  <Input
                    value={formData.expertiseTags}
                    onChange={(e) => {
                      setFormData({ ...formData, expertiseTags: e.target.value });
                      validateJsonField("expertiseTags", e.target.value);
                    }}
                    className="w-full font-mono text-xs"
                  />
                  {jsonErrors.expertiseTags && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{jsonErrors.expertiseTags}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    Experience Timeline (EN JSON)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-3 font-mono text-xs text-[var(--text-primary)]"
                    value={formData.experience}
                    onChange={(e) => {
                      setFormData({ ...formData, experience: e.target.value });
                      validateJsonField("experience", e.target.value);
                    }}
                  />
                  {jsonErrors.experience && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{jsonErrors.experience}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                    Projects Portfolio (EN JSON)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-default)] p-3 font-mono text-xs text-[var(--text-primary)]"
                    value={formData.projects}
                    onChange={(e) => {
                      setFormData({ ...formData, projects: e.target.value });
                      validateJsonField("projects", e.target.value);
                    }}
                  />
                  {jsonErrors.projects && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{jsonErrors.projects}</span>
                    </p>
                  )}
                </div>
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
                        Show on Public Team Page
                      </label>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Controls visibility on /b2b/team and /b2c/team grids.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="showOnTeamPage"
                      checked={formData.showOnTeamPage}
                      onChange={(e) =>
                        setFormData({ ...formData, showOnTeamPage: e.target.checked })
                      }
                      className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-hover)]/40">
                    <div>
                      <label htmlFor="isFeatured" className="font-bold text-sm text-[var(--text-primary)] block cursor-pointer">
                        Featured Member
                      </label>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Highlights member with a special Featured badge and priority placement.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({ ...formData, isFeatured: e.target.checked })
                      }
                      className="w-5 h-5 rounded cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border-level-1)] bg-[var(--surface-hover)]/40">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                      Display Order Index
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
                      className="w-32"
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
                      Lower numbers appear first (0, 1, 2, 3...). Can also be sequenced via drag-and-drop.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-6 border-t border-[var(--border-level-1)] bg-[var(--surface-hover)]/40 flex justify-between items-center shrink-0">
            <div className="text-xs text-[var(--text-tertiary)]">
              {Object.keys(jsonErrors).length > 0 && (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Fix JSON formatting errors before saving
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || Object.keys(jsonErrors).length > 0}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold px-8 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
