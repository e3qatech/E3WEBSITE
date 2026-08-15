"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, Search, Settings, X, ExternalLink, Sparkles, Eye, EyeOff } from "lucide-react";
import {
  DashboardPageShell,
  DashboardPageHeader,
  AdminButton,
} from "@/components/dashboard/ui";
import { 
  AdminTable, 
  AdminTableHeader, 
  AdminTableBody, 
  AdminTableRow, 
  AdminTableHead, 
  AdminTableCell 
} from "@/components/dashboard/ui/AdminTable";
import { useLocale } from "@/components/layout/LocaleProvider";
import { localizeHref } from "@/lib/url-helper";
import { cn } from "@/lib/utils";

export function ServicesListClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  let locale: "en" | "ar" = "en";
  let dir: "ltr" | "rtl" = "ltr";
  try {
    const localeCtx = useLocale();
    if (localeCtx) {
      locale = (localeCtx.locale as "en" | "ar") || "en";
      dir = localeCtx.dir || (locale === "ar" ? "rtl" : "ltr");
    }
  } catch {
    // Fallback
  }

  const isAr = locale === "ar";
  const [services, setServices] = useState(initialData || []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "visible" | "hidden" | "featured">("all");

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: services.length,
      visible: services.filter((s) => s.isVisible).length,
      hidden: services.filter((s) => !s.isVisible).length,
      featured: services.filter((s) => s.isFeatured).length,
    };
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    const q = search.toLowerCase().trim();

    return services.filter((s) => {
      // 1. Status tab filter
      if (statusFilter === "visible" && !s.isVisible) return false;
      if (statusFilter === "hidden" && s.isVisible) return false;
      if (statusFilter === "featured" && !s.isFeatured) return false;

      // 2. Search query filter
      if (!q) return true;

      const titleEnMatch = (s.titleEn || "").toLowerCase().includes(q);
      const titleArMatch = (s.titleAr || "").includes(search);
      const slugMatch = (s.slug || "").toLowerCase().includes(q);
      const categoryMatch = (s.category || "").toLowerCase().includes(q);
      const descEnMatch = (s.shortDescriptionEn || "").toLowerCase().includes(q);
      const descArMatch = (s.shortDescriptionAr || "").includes(search);

      return titleEnMatch || titleArMatch || slugMatch || categoryMatch || descEnMatch || descArMatch;
    });
  }, [services, statusFilter, search]);

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذه الخدمة؟" : "Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`/api/b2b/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setServices(services.filter((s) => s.id !== id));
      router.refresh();
    } catch {
      alert(isAr ? "فشل حذف الخدمة" : "Failed to delete service");
    }
  };

  const tabs = [
    { key: "all", labelEn: "All Services", labelAr: "جميع الخدمات", count: counts.all },
    { key: "visible", labelEn: "Visible", labelAr: "المنشورة", count: counts.visible, icon: <Eye className="w-3.5 h-3.5" /> },
    { key: "hidden", labelEn: "Hidden", labelAr: "المخفية", count: counts.hidden, icon: <EyeOff className="w-3.5 h-3.5" /> },
    { key: "featured", labelEn: "Featured", labelAr: "المميزة", count: counts.featured, icon: <Sparkles className="w-3.5 h-3.5 text-warning" /> },
  ];

  return (
    <DashboardPageShell variant="wide">
      <div dir={dir} className="space-y-6">
        <DashboardPageHeader
          title={isAr ? "دليل حلول وخدمات B2B" : "B2B Services Catalog"}
          description={
            isAr
              ? "إدارة حلول هندسة الفعاليات المؤسسية، الخدمات الكبرى، وقدرات الإنتاج المتخصصة."
              : "Manage corporate event engineering solutions, enterprise services, and capability offerings."
          }
          breadcrumbs={[
            { label: isAr ? "محتوى B2B" : "B2B Content", href: "/dashboard/b2b/services" },
            { label: isAr ? "دليل الخدمات" : "Services Catalog" },
          ]}
          badge={{
            label: isAr ? `${services.length} خدمة مؤسسية` : `${services.length} Services`,
            variant: "indigo",
          }}
          primaryAction={{
            label: isAr ? "إضافة خدمة جديدة" : "Add Service",
            href: localizeHref("/dashboard/b2b/services/new", locale),
            icon: <Plus className="w-4 h-4" />,
          }}
        />

        {/* Filter Tabs & Search Bar Container */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {tabs.map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  data-testid={`service-filter-tab-${tab.key}`}
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-level-1)]"
                  )}
                >
                  {tab.icon}
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[10px] font-mono",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[var(--bg-level-1)] text-[var(--text-tertiary)]"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] group-focus-within:text-[var(--color-primary)] transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "البحث في الخدمات، المسمى، أو التصنيف..." : "Search services by name, slug, or category..."}
              data-testid="services-search-input"
              className="w-full bg-[var(--surface-default)] border border-[var(--border-level-1)] rounded-xl py-2 ps-9 pe-9 text-xs sm:text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all placeholder:text-[var(--text-tertiary)] shadow-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                data-testid="clear-services-search"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-label={isAr ? "مسح البحث" : "Clear search"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Services Table */}
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>{isAr ? "الخدمة المؤسسية" : "Service"}</AdminTableHead>
              <AdminTableHead>{isAr ? "الحالة والظهور" : "Status & Visibility"}</AdminTableHead>
              <AdminTableHead className="text-right rtl:text-left">{isAr ? "الإجراءات" : "Actions"}</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {filteredServices.map((service) => {
              const editHref = localizeHref(`/dashboard/b2b/services/${service.slug}`, locale);
              const publicHref = localizeHref(`/b2b/services/${service.slug}`, locale);

              return (
                <AdminTableRow key={service.id} data-testid={`service-row-${service.slug}`} className="group">
                  <AdminTableCell>
                    <div className="flex items-center gap-4">
                      {service.thumbnail ? (
                        <img 
                          src={service.thumbnail} 
                          alt={service.titleEn} 
                          className="w-14 h-12 rounded-xl object-cover border border-[var(--border-level-1)] shadow-sm shrink-0" 
                        />
                      ) : (
                        <div className="w-14 h-12 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-level-1)] flex items-center justify-center text-[var(--text-tertiary)] shadow-sm shrink-0">
                          <Settings className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-[var(--text-primary)] text-sm sm:text-base line-clamp-1">
                          {isAr && service.titleAr ? service.titleAr : service.titleEn}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-tertiary)] font-mono">
                          <span>/{service.slug}</span>
                          {service.category && (
                            <>
                              <span>•</span>
                              <span className="px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border-level-1)] text-[10px] font-sans font-semibold text-[var(--text-secondary)]">
                                {service.category}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {service.isVisible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Eye className="w-3 h-3" />
                          <span>{isAr ? "منشورة" : "Visible"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border-level-1)]">
                          <EyeOff className="w-3 h-3" />
                          <span>{isAr ? "مخفية" : "Hidden"}</span>
                        </span>
                      )}
                      {service.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Sparkles className="w-3 h-3" />
                          <span>{isAr ? "مميزة" : "Featured"}</span>
                        </span>
                      )}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-2">
                      <Link
                        href={publicHref}
                        target="_blank"
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-primary)] bg-[var(--surface-hover)]/60 hover:bg-[var(--surface-hover)] border border-[var(--border-level-1)] rounded-xl transition-all"
                        title={isAr ? "معاينة الصفحة العامة" : "Preview Public Page"}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <AdminButton 
                        onClick={() => router.push(editHref)} 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        {isAr ? "تعديل" : "Edit"}
                      </AdminButton>
                      <button 
                        onClick={() => handleDelete(service.id)} 
                        className="p-2 text-[var(--text-secondary)] hover:text-red-500 bg-[var(--surface-hover)]/60 hover:bg-red-500/10 border border-[var(--border-level-1)] hover:border-red-500/20 rounded-xl transition-colors cursor-pointer"
                        title={isAr ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}

            {filteredServices.length === 0 && (
              <AdminTableRow>
                <AdminTableCell colSpan={3} className="h-36 text-center text-[var(--text-tertiary)] font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-6 h-6 text-[var(--text-tertiary)] opacity-60" />
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {isAr ? "لم يتم العثور على خدمات مطابقة" : "No services found matching your criteria"}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {isAr ? "جرب تغيير نص البحث أو الفلتر أعلاه" : "Try adjusting your search query or status filter"}
                    </p>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            )}
          </AdminTableBody>
        </AdminTable>
      </div>
    </DashboardPageShell>
  );
}
