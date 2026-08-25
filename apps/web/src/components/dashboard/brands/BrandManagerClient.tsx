"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Sparkles,
  Layers,
  Globe,
  Briefcase,
  Eye,
  EyeOff,
  Filter,
  ArrowUpDown,
  Tag,
  Calendar,
  Building2,
  HelpCircle,
  AlertTriangle,
  Star,
} from "lucide-react";
import {
  DashboardPageShell,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import { MediaUploader } from "@/components/shared/MediaUploader";
import { useLocale } from "@/components/layout/LocaleProvider";
import { localizeHref } from "@/lib/url-helper";

interface BrandManagerProps {
  initialBrands: any[];
  categories: any[];
}

export function BrandManagerClient({ initialBrands, categories }: BrandManagerProps) {
  const router = useRouter();
  let locale: "en" | "ar" = "en";
  try {
    const localeCtx = useLocale();
    if (localeCtx) {
      locale = (localeCtx.locale as "en" | "ar") || "en";
    }
  } catch {}

  const isAr = locale === "ar";
  const [brands, setBrands] = useState<any[]>(initialBrands || []);
  const [search, setSearch] = useState("");
  const [portalFilter, setPortalFilter] = useState<"ALL" | "B2C" | "B2B">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"identity" | "logos" | "b2c" | "b2b" | "story">("identity");
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesSearch =
        (brand.nameEn || "").toLowerCase().includes(search.toLowerCase()) ||
        (brand.nameAr || "").toLowerCase().includes(search.toLowerCase()) ||
        (brand.slug || "").toLowerCase().includes(search.toLowerCase()) ||
        (brand.taglineEn || "").toLowerCase().includes(search.toLowerCase()) ||
        (brand.taglineAr || "").toLowerCase().includes(search.toLowerCase());

      const matchesPortal =
        portalFilter === "ALL" ||
        (portalFilter === "B2C" && brand.showOnB2C) ||
        (portalFilter === "B2B" && brand.showOnB2B);

      const matchesStatus =
        statusFilter === "ALL" || brand.lifecycleStatus === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" || brand.categoryId === categoryFilter;

      return matchesSearch && matchesPortal && matchesStatus && matchesCategory;
    });
  }, [brands, search, portalFilter, statusFilter, categoryFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: brands.length,
      b2cActive: brands.filter((b) => b.showOnB2C && b.isActive).length,
      b2bActive: brands.filter((b) => b.showOnB2B && b.isActive).length,
      featured: brands.filter((b) => b.featureOnB2C || b.featureOnB2B).length,
    };
  }, [brands]);

  const handleAddNew = () => {
    setEditForm({
      nameEn: "",
      nameAr: "",
      slug: "",
      taglineEn: "",
      taglineAr: "",
      shortDescriptionEn: "",
      shortDescriptionAr: "",
      fullStoryEn: "",
      fullStoryAr: "",
      launchYear: new Date().getFullYear(),
      parentEntity: "E3 Entertainment",
      isActive: true,
      lifecycleStatus: "ACTIVE",
      primaryLogoUrl: "",
      lightLogoUrl: "",
      darkLogoUrl: "",
      compactLogoUrl: "",
      mediaType: "IMAGE",
      primaryMediaUrl: "",
      coverMediaUrl: "",
      detailMediaUrl: "",
      fallbackImageUrl: "",
      thumbnailUrl: "",
      categoryId: categories[0]?.id || "",
      showOnB2C: true,
      showInWorldsCreated: true,
      featureOnB2C: false,
      b2cDisplayOrder: brands.length + 1,
      b2cCtaLabelEn: "Explore Experience",
      b2cCtaLabelAr: "استكشف التجربة",
      b2cCtaUrl: "",
      showOnB2B: true,
      showInB2BPortfolio: true,
      featureOnB2B: false,
      b2bDisplayOrder: brands.length + 1,
      b2bBusinessOverviewEn: "",
      b2bBusinessOverviewAr: "",
      b2bBusinessValueEn: "",
      b2bBusinessValueAr: "",
      b2bCapabilitiesEn: "",
      b2bCapabilitiesAr: "",
      b2bCtaLabelEn: "Request Partnership Proposal",
      b2bCtaLabelAr: "طلب مقترح شراكة",
      b2bInquiryUrl: "/b2b/contact",
    });
    setActiveTab("identity");
    setErrorMessage(null);
    setIsEditing("new");
  };

  const handleEdit = (brand: any) => {
    setEditForm({ ...brand });
    setActiveTab("identity");
    setErrorMessage(null);
    setIsEditing(brand.id);
  };

  const handleSave = async () => {
    if (!editForm.nameEn || !editForm.nameAr) {
      setErrorMessage(isAr ? "يرجى ملء الاسم بالإنجليزية والعربية" : "Both English and Arabic names are required");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const isNew = isEditing === "new";
    const url = isNew ? "/api/b2c/brands" : `/api/b2c/brands/${isEditing}`;
    const method = isNew ? "POST" : "PATCH";

    const cleanSlug = (editForm.slug || editForm.nameEn)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const payload = {
      ...editForm,
      slug: cleanSlug,
      launchYear: editForm.launchYear ? parseInt(editForm.launchYear) : undefined,
      b2cDisplayOrder: editForm.b2cDisplayOrder ? parseInt(editForm.b2cDisplayOrder) : 0,
      b2bDisplayOrder: editForm.b2bDisplayOrder ? parseInt(editForm.b2bDisplayOrder) : 0,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save brand");
      }

      const savedBrand = await res.json();

      if (isNew) {
        setBrands([savedBrand, ...brands]);
      } else {
        setBrands(brands.map((b) => (b.id === savedBrand.id ? savedBrand : b)));
      }

      setIsEditing(null);
      router.refresh();
    } catch (err: any) {
      console.error("[SAVE_BRAND_ERROR]", err);
      setErrorMessage(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickToggleActive = async (brand: any) => {
    const newStatus = !brand.isActive;
    try {
      const res = await fetch(`/api/b2c/brands/${brand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setBrands(brands.map((b) => (b.id === brand.id ? { ...b, isActive: newStatus } : b)));
      }
    } catch (e) {
      console.error("Toggle active error:", e);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/b2c/brands/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to delete brand");
      }

      const result = await res.json();
      if (result.archived) {
        setBrands(brands.map((b) => (b.id === id ? { ...b, isActive: false, lifecycleStatus: "INACTIVE" } : b)));
      } else {
        setBrands(brands.filter((b) => b.id !== id));
      }

      setDeleteConfirmId(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete brand");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardPageShell variant="wide">
      <DashboardPageHeader
        title={isAr ? "إدارة العلامات وحقوق الملكية" : "Brand & IP Management"}
        description={
          isAr
            ? "التحكم في العلامات التجارية، منصات التشغيل، والأصول الترفيهية لـ E3 المعروضة للشركات والجمهور."
            : "Centralized control for E3 owned, operated, and partnered intellectual property brands across B2C and B2B portals."
        }
        breadcrumbs={[
          { label: isAr ? "لوحة التحكم" : "Dashboard", href: "/dashboard" },
          { label: isAr ? "العلامات التجارية" : "Brand IP" },
        ]}
        primaryAction={{
          label: isAr ? "إضافة علامة تجارية جديدة" : "Add New Brand IP",
          onClick: handleAddNew,
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{isAr ? "إجمالي العلامات" : "Total Brands"}</p>
            <p className="text-2xl font-black text-[var(--text-primary)] mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{isAr ? "نشط في B2C" : "Active in B2C"}</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">{stats.b2cActive}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{isAr ? "نشط في B2B" : "Active in B2B"}</p>
            <p className="text-2xl font-black text-purple-500 mt-1">{stats.b2bActive}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{isAr ? "العلامات المميزة" : "Featured Brands"}</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{stats.featured}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="p-4 rounded-2xl bg-[var(--surface-default)] border border-[var(--border-level-1)] mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "البحث بالاسم، الشعار، أو الرابط..." : "Search brands, taglines, slugs..."}
            className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl py-2.5 ps-10 pe-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Portal Filter */}
          <div className="flex items-center bg-[var(--bg-level-1)] rounded-xl p-1 border border-[var(--border-level-2)] text-xs font-bold">
            <button
              onClick={() => setPortalFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                portalFilter === "ALL" ? "bg-[var(--surface-default)] text-blue-500 shadow-sm" : "text-[var(--text-secondary)]"
              }`}
            >
              {isAr ? "الكل" : "All Portals"}
            </button>
            <button
              onClick={() => setPortalFilter("B2C")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                portalFilter === "B2C" ? "bg-[var(--surface-default)] text-emerald-500 shadow-sm" : "text-[var(--text-secondary)]"
              }`}
            >
              B2C
            </button>
            <button
              onClick={() => setPortalFilter("B2B")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                portalFilter === "B2B" ? "bg-[var(--surface-default)] text-purple-500 shadow-sm" : "text-[var(--text-secondary)]"
              }`}
            >
              B2B
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="ALL">{isAr ? "كافة الحالات" : "All Statuses"}</option>
            <option value="ACTIVE">{isAr ? "نشط" : "Active"}</option>
            <option value="COMING_SOON">{isAr ? "قريباً" : "Coming Soon"}</option>
            <option value="SEASONAL">{isAr ? "موسمي" : "Seasonal"}</option>
            <option value="INACTIVE">{isAr ? "غير نشط" : "Inactive"}</option>
          </select>

          {/* Category Filter */}
          {categories && categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[var(--bg-level-1)] border border-[var(--border-level-2)] text-[var(--text-primary)] text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">{isAr ? "كافة الفئات" : "All Categories"}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {isAr ? cat.nameAr : cat.nameEn}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* BRAND CARDS GRID */}
      {filteredBrands.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-1)] text-center">
          <Sparkles className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            {isAr ? "لم يتم العثور على أي علامة تجارية" : "No Brand IPs Found"}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            {isAr
              ? "جرّب تغيير خيارات البحث أو قم بإنشاء علامة تجارية جديدة."
              : "Try adjusting your search criteria or register a new intellectual property brand."}
          </p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {isAr ? "إضافة علامة تجارية" : "Add Brand IP"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-[var(--surface-default)] shadow-sm hover:shadow-md ${
                brand.isActive ? "border-[var(--border-level-1)]" : "border-red-500/20 opacity-75"
              }`}
            >
              {/* Card Header & Logo */}
              <div className="p-6 border-b border-[var(--border-level-1)]">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)] p-2 flex items-center justify-center shrink-0 relative overflow-hidden">
                    {brand.primaryLogoUrl ? (
                      <img
                        src={brand.primaryLogoUrl}
                        alt={brand.nameEn}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="font-black text-xl text-blue-500">
                        {(brand.nameEn || "B").charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        brand.isActive
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {brand.lifecycleStatus || (brand.isActive ? "ACTIVE" : "INACTIVE")}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text-tertiary)]">
                      {brand.showOnB2C && <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">B2C</span>}
                      {brand.showOnB2B && <span className="text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded">B2B</span>}
                    </div>
                  </div>
                </div>

                <h3 className="text-base font-black text-[var(--text-primary)] leading-snug">
                  {isAr ? brand.nameAr : brand.nameEn}
                </h3>
                <p className="text-xs font-medium text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                  {isAr ? (brand.taglineAr || brand.taglineEn) : (brand.taglineEn || brand.taglineAr || "E3 IP")}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-2 mt-2 leading-relaxed">
                  {isAr ? (brand.shortDescriptionAr || brand.shortDescriptionEn) : (brand.shortDescriptionEn || brand.shortDescriptionAr)}
                </p>
              </div>

              {/* Card Meta details */}
              <div className="px-6 py-3 bg-[var(--bg-level-1)]/50 text-[11px] text-[var(--text-secondary)] flex items-center justify-between border-b border-[var(--border-level-1)]">
                <span className="font-mono text-[var(--text-tertiary)]">/{brand.slug}</span>
                <span className="font-bold">{brand.category?.nameEn || "General IP"}</span>
              </div>

              {/* Card Actions Footer */}
              <div className="p-4 bg-[var(--surface-default)] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleQuickToggleActive(brand)}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    brand.isActive
                      ? "text-emerald-500 hover:bg-emerald-500/10"
                      : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)]"
                  }`}
                  title={brand.isActive ? "Deactivate Brand" : "Activate Brand"}
                >
                  {brand.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="p-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-level-1)] hover:border-blue-500 transition-colors cursor-pointer"
                    title="Edit Brand IP"
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(brand.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-2xl p-6 md:p-8 text-start my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-level-1)] shrink-0">
              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display uppercase tracking-wide">
                  {isEditing === "new"
                    ? (isAr ? "إضافة علامة تجارية جديدة" : "Create New Brand IP")
                    : (isAr ? `تعديل العلامة: ${editForm.nameAr || editForm.nameEn}` : `Edit Brand: ${editForm.nameEn || "Untitled"}`)}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {isAr ? "تخصيص الهوية والوسائط وحضور العلامة في البوابات" : "Configure branding, media assets, and portal presentations"}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg-level-1)] hover:bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-[var(--border-level-1)] py-3 overflow-x-auto shrink-0 text-xs font-bold">
              <button
                onClick={() => setActiveTab("identity")}
                className={`px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "identity" ? "bg-blue-600 text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <Tag className="w-3.5 h-3.5" /> {isAr ? "1. الهوية الأساسية" : "1. Core Identity"}
              </button>
              <button
                onClick={() => setActiveTab("logos")}
                className={`px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "logos" ? "bg-blue-600 text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> {isAr ? "2. الشعارات والوسائط" : "2. Logos & Media"}
              </button>
              <button
                onClick={() => setActiveTab("b2c")}
                className={`px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "b2c" ? "bg-blue-600 text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> {isAr ? "3. ظهور B2C" : "3. B2C Presence"}
              </button>
              <button
                onClick={() => setActiveTab("b2b")}
                className={`px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "b2b" ? "bg-blue-600 text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> {isAr ? "4. محفظة B2B" : "4. B2B Portfolio"}
              </button>
              <button
                onClick={() => setActiveTab("story")}
                className={`px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "story" ? "bg-blue-600 text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> {isAr ? "5. القصة والرؤية" : "5. Story & Narrative"}
              </button>
            </div>

            {/* Modal Body Forms */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 pe-2">
              {/* TAB 1: IDENTITY */}
              {activeTab === "identity" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Brand Name (EN) *
                      </label>
                      <input
                        type="text"
                        value={editForm.nameEn || ""}
                        onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                        placeholder="e.g. BookingQube"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        اسم العلامة (AR) *
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={editForm.nameAr || ""}
                        onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-arabic"
                        placeholder="مثال: بوكينج كيوب"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Slug URL Key *
                      </label>
                      <input
                        type="text"
                        value={editForm.slug || ""}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-blue-500"
                        placeholder="bookingqube"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Category
                      </label>
                      <select
                        value={editForm.categoryId || ""}
                        onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameEn} ({c.nameAr})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Tagline (EN)
                      </label>
                      <input
                        type="text"
                        value={editForm.taglineEn || ""}
                        onChange={(e) => setEditForm({ ...editForm, taglineEn: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                        placeholder="e.g. Wholly Owned Ticketing Engine"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        الشعار الترويجي (AR)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={editForm.taglineAr || ""}
                        onChange={(e) => setEditForm({ ...editForm, taglineAr: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 font-arabic"
                        placeholder="المنظومة المتكاملة لحجز التذاكر"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Launch Year
                      </label>
                      <input
                        type="number"
                        value={editForm.launchYear || 2024}
                        onChange={(e) => setEditForm({ ...editForm, launchYear: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Parent Entity
                      </label>
                      <input
                        type="text"
                        value={editForm.parentEntity || "E3 Entertainment"}
                        onChange={(e) => setEditForm({ ...editForm, parentEntity: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Lifecycle Status
                      </label>
                      <select
                        value={editForm.lifecycleStatus || "ACTIVE"}
                        onChange={(e) => setEditForm({ ...editForm, lifecycleStatus: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMING_SOON">COMING SOON</option>
                        <option value="SEASONAL">SEASONAL</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="LEGACY">LEGACY</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LOGOS & MEDIA */}
              {activeTab === "logos" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
                      Primary Brand Logo URL *
                    </label>
                    <MediaUploader
                      value={editForm.primaryLogoUrl || ""}
                      onChange={(url: string) => setEditForm({ ...editForm, primaryLogoUrl: url })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
                        Light Mode Logo (Optional)
                      </label>
                      <MediaUploader
                        value={editForm.lightLogoUrl || ""}
                        onChange={(url: string) => setEditForm({ ...editForm, lightLogoUrl: url })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
                        Dark Mode Logo (Optional)
                      </label>
                      <MediaUploader
                        value={editForm.darkLogoUrl || ""}
                        onChange={(url: string) => setEditForm({ ...editForm, darkLogoUrl: url })}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[var(--border-level-1)] pt-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
                      Cover Showcase Media / Image URL
                    </label>
                    <MediaUploader
                      value={editForm.coverMediaUrl || editForm.primaryMediaUrl || ""}
                      onChange={(url: string) => setEditForm({ ...editForm, coverMediaUrl: url, primaryMediaUrl: url })}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: B2C PRESENCE */}
              {activeTab === "b2c" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.showOnB2C !== false}
                        onChange={(e) => setEditForm({ ...editForm, showOnB2C: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-500"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Show on B2C Website</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.showInWorldsCreated !== false}
                        onChange={(e) => setEditForm({ ...editForm, showInWorldsCreated: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-500"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Worlds Created Showcase</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.featureOnB2C === true}
                        onChange={(e) => setEditForm({ ...editForm, featureOnB2C: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Feature on B2C</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        B2C Display Order
                      </label>
                      <input
                        type="number"
                        value={editForm.b2cDisplayOrder || 0}
                        onChange={(e) => setEditForm({ ...editForm, b2cDisplayOrder: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        B2C CTA Label (EN)
                      </label>
                      <input
                        type="text"
                        value={editForm.b2cCtaLabelEn || "Explore Experience"}
                        onChange={(e) => setEditForm({ ...editForm, b2cCtaLabelEn: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        B2C CTA Target URL
                      </label>
                      <input
                        type="text"
                        value={editForm.b2cCtaUrl || ""}
                        onChange={(e) => setEditForm({ ...editForm, b2cCtaUrl: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                        placeholder="https://... or /b2c/attractions/..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: B2B PRESENCE */}
              {activeTab === "b2b" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-level-1)] border border-[var(--border-level-2)]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.showOnB2B !== false}
                        onChange={(e) => setEditForm({ ...editForm, showOnB2B: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-500"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Show in B2B Portal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.showInB2BPortfolio !== false}
                        onChange={(e) => setEditForm({ ...editForm, showInB2BPortfolio: e.target.checked })}
                        className="w-4 h-4 rounded text-purple-500"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">B2B IP Directory</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.featureOnB2B === true}
                        onChange={(e) => setEditForm({ ...editForm, featureOnB2B: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500"
                      />
                      <span className="text-xs font-bold text-[var(--text-primary)]">Feature on B2B</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Business Overview (EN)
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.b2bBusinessOverviewEn || ""}
                        onChange={(e) => setEditForm({ ...editForm, b2bBusinessOverviewEn: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                        placeholder="Corporate summary and licensing value..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        نظرة عامة للأعمال (AR)
                      </label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={editForm.b2bBusinessOverviewAr || ""}
                        onChange={(e) => setEditForm({ ...editForm, b2bBusinessOverviewAr: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:outline-none resize-none font-arabic"
                        placeholder="ملخص شراكات الأعمال وحقوق التشغيل..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        B2B Inquiry URL
                      </label>
                      <input
                        type="text"
                        value={editForm.b2bInquiryUrl || "/b2b/contact"}
                        onChange={(e) => setEditForm({ ...editForm, b2bInquiryUrl: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        B2B CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={editForm.b2bCtaLabelEn || "Request Partnership Proposal"}
                        onChange={(e) => setEditForm({ ...editForm, b2bCtaLabelEn: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: STORY & NARRATIVE */}
              {activeTab === "story" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Short Description (EN)
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.shortDescriptionEn || ""}
                        onChange={(e) => setEditForm({ ...editForm, shortDescriptionEn: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                        placeholder="Brief summary for listings and cards..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        الوصف المختصر (AR)
                      </label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={editForm.shortDescriptionAr || ""}
                        onChange={(e) => setEditForm({ ...editForm, shortDescriptionAr: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:outline-none resize-none font-arabic"
                        placeholder="وصف ملخص للبطاقات وقوائم الاستعراض..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        Full Story & Lore (EN)
                      </label>
                      <textarea
                        rows={5}
                        value={editForm.fullStoryEn || ""}
                        onChange={(e) => setEditForm({ ...editForm, fullStoryEn: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                        placeholder="Detailed background, design journey, and visitor experience..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1 block">
                        القصة الكاملة والتفاصيل (AR)
                      </label>
                      <textarea
                        rows={5}
                        dir="rtl"
                        value={editForm.fullStoryAr || ""}
                        onChange={(e) => setEditForm({ ...editForm, fullStoryAr: e.target.value })}
                        className="w-full bg-[var(--bg-level-1)] border border-[var(--border-level-2)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:outline-none resize-none font-arabic"
                        placeholder="القصة الكاملة للعلامة وتجربة الزوار..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-[var(--border-level-1)] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(null)}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-level-2)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-secondary)] cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                {isSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التغييرات" : "Save Brand IP")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface-default)] border border-[var(--border-level-2)] shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              {isAr ? "تأكيد حذف أو أرشفة العلامة" : "Confirm Delete or Archive"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
              {isAr
                ? "إذا كانت هذه العلامة مرتبطة بفعاليات أو تجارب سابقة، سيتم أرشفتها بأمان لحماية سلامة السجلات التاريخية."
                : "If this brand is linked to active or historical attractions, it will be safely archived to protect database integrity."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-xl border border-[var(--border-level-2)] hover:bg-[var(--surface-hover)] text-xs font-bold text-[var(--text-secondary)] cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                disabled={isDeleting}
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (isAr ? "جاري المعالجة..." : "Processing...") : (isAr ? "تأكيد الإجراء" : "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
}
