"use client"

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, Search, Briefcase, AlertTriangle, Calendar, ExternalLink, Archive, Sparkles } from "lucide-react";
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
import { auditCaseStudyDuplicates } from "@/lib/case-study-identity-audit";

export function CasesListClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  let locale: 'en' | 'ar' = 'en';
  let dir: 'ltr' | 'rtl' = 'ltr';
  try {
    const localeCtx = useLocale();
    if (localeCtx) {
      locale = (localeCtx.locale as 'en' | 'ar') || 'en';
      dir = localeCtx.dir || (locale === 'ar' ? 'rtl' : 'ltr');
    }
  } catch {
    // Fallback
  }

  const isAr = locale === 'ar';
  const [caseStudies, setCaseStudies] = useState(initialData || []);
  const [search, setSearch] = useState("");

  const auditMap = useMemo(() => {
    return auditCaseStudyDuplicates(caseStudies);
  }, [caseStudies]);

  const filteredCases = caseStudies.filter((c) =>
    (c.titleEn || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.titleAr || "").includes(search) ||
    (c.slug || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.clientName && c.clientName.toLowerCase().includes(search.toLowerCase()))
  );

  const [isPublishingAll, setIsPublishingAll] = useState(false);

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setCaseStudies((prev) =>
      prev.map((c) => (c.id === id || c.slug === id ? { ...c, isPublished: nextStatus, isVisible: nextStatus } : c))
    );

    try {
      const res = await fetch(`/api/b2b/cases/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err: any) {
      // Rollback on failure
      setCaseStudies((prev) =>
        prev.map((c) => (c.id === id || c.slug === id ? { ...c, isPublished: currentStatus, isVisible: currentStatus } : c))
      );
      alert(isAr ? `فشل تحديث حالة الظهور: ${err.message}` : `Failed to update visibility: ${err.message}`);
    }
  };

  const handlePublishAll = async () => {
    if (!confirm(isAr ? "هل ترغب في نشر جميع دراسات الحالة لتظهر في الموقع العام فوراً؟" : "Publish all case studies to be visible on the public website immediately?")) return;

    setIsPublishingAll(true);
    // Optimistic update
    setCaseStudies((prev) =>
      prev.map((c) => (c.slug === "doha-balloon-parade" ? c : { ...c, isPublished: true, isVisible: true }))
    );

    try {
      const res = await fetch("/api/b2b/cases/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publishAll" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err: any) {
      alert(isAr ? `فشل نشر جميع دراسات الحالة: ${err.message}` : `Failed to publish all case studies: ${err.message}`);
    } finally {
      setIsPublishingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف دراسة الحالة هذه؟" : "Are you sure you want to delete this case study?")) return;

    try {
      const res = await fetch(`/api/b2b/cases/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setCaseStudies(caseStudies.filter((c) => c.id !== id));
      router.refresh();
    } catch {
      alert(isAr ? "فشل حذف دراسة الحالة" : "Failed to delete case study");
    }
  };

  return (
    <DashboardPageShell variant="wide">
      <div dir={dir} className="space-y-6">
        <DashboardPageHeader
          title={isAr ? "محفظة دراسات الحالة والمشاريع" : "B2B Case Studies Portfolio"}
          description={
            isAr
              ? "إدارة المشاريع المنجزة، دراسات الجدوى والفعاليات الكبرى، وتوثيق الإنجازات المؤسسية."
              : "Manage past client activations, mega-event productions, and technical showcase projects."
          }
          breadcrumbs={[
            { label: isAr ? "محتوى B2B" : "B2B Content", href: "/dashboard/b2b/services" },
            { label: isAr ? "دراسات الحالة" : "Case Studies" },
          ]}
          badge={{ 
            label: isAr ? `${caseStudies.length} دراسة حالة` : `${caseStudies.length} Projects`, 
            variant: "indigo" 
          }}
          primaryAction={{
            label: isAr ? "إضافة دراسة حالة" : "Add Case Study",
            href: localizeHref("/dashboard/b2b/cases/new", locale),
            icon: <Plus className="w-4 h-4" />,
          }}
          secondaryAction={
            <div className="flex items-center gap-2">
              <AdminButton
                variant="outline"
                disabled={isPublishingAll}
                onClick={handlePublishAll}
                leftIcon={<Sparkles className="w-4 h-4 text-emerald-400" />}
              >
                {isPublishingAll
                  ? (isAr ? "جاري النشر..." : "Publishing...")
                  : (isAr ? "نشر جميع المشاريع في الموقع" : "Publish All Cases Live")}
              </AdminButton>
              <Link href={localizeHref("/dashboard/b2b/cases-page#featuredCases", locale)}>
                <AdminButton
                  variant="outline"
                  leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
                >
                  {isAr ? "تخصيص الصفحة" : "Featured & Page Editor"}
                </AdminButton>
              </Link>
            </div>
          }
        />

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? "البحث في دراسات الحالة..." : "Search case studies..."}
              className="w-full bg-surface-default border border-border-default rounded-md py-2 ps-9 pe-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-tertiary shadow-sm"
            />
          </div>
        </div>

        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>{isAr ? "دراسة الحالة" : "Case Study"}</AdminTableHead>
              <AdminTableHead>{isAr ? "العميل / التاريخ" : "Client / Date"}</AdminTableHead>
              <AdminTableHead>{isAr ? "حالة الهوية / التكرار" : "Identity & Edition Audit"}</AdminTableHead>
              <AdminTableHead>{isAr ? "الحالة" : "Status"}</AdminTableHead>
              <AdminTableHead className="text-right rtl:text-left">{isAr ? "الإجراءات" : "Actions"}</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {filteredCases.map(caseStudy => {
              const audit = auditMap.get(caseStudy.slug);
              const editHref = localizeHref(`/dashboard/b2b/cases/${caseStudy.slug}`, locale);
              const publicHref = localizeHref(`/b2b/case-studies/${caseStudy.slug}`, locale);
              const isArchived = caseStudy.seo?.isArchived || audit?.status === 'ARCHIVED_DUPLICATE';

              return (
                <AdminTableRow key={caseStudy.id} data-testid={`case-row-${caseStudy.slug}`} className="group">
                  <AdminTableCell>
                    <div className="flex items-center gap-4">
                      {caseStudy.thumbnail || caseStudy.thumbnailUrl || caseStudy.heroImageUrl ? (
                        <img 
                          src={caseStudy.thumbnail || caseStudy.thumbnailUrl || caseStudy.heroImageUrl} 
                          alt={caseStudy.titleEn} 
                          className="w-16 h-12 rounded-lg object-cover border border-border-default shadow-sm" 
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-surface-active border border-border-default flex items-center justify-center text-text-tertiary shadow-sm">
                          <Briefcase className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-text-primary line-clamp-1">
                          {isAr && caseStudy.titleAr ? caseStudy.titleAr : caseStudy.titleEn}
                        </div>
                        <div className="text-xs text-text-tertiary font-mono mt-0.5">
                          /{caseStudy.slug}
                        </div>
                      </div>
                    </div>
                  </AdminTableCell>

                  <AdminTableCell>
                    <div className="font-semibold text-text-primary">{caseStudy.clientName || "—"}</div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      {caseStudy.year ? `${caseStudy.year}` : (caseStudy.eventDate ? new Date(caseStudy.eventDate).toLocaleDateString(locale === 'ar' ? 'ar-QA' : 'en-US') : "—")}
                    </div>
                  </AdminTableCell>

                  {/* Non-destructive Duplicate & Edition Warning Badge */}
                  <AdminTableCell>
                    {audit?.status === 'ARCHIVED_DUPLICATE' ? (
                      <div 
                        data-testid={`archived-duplicate-badge-${caseStudy.slug}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold"
                        title={isAr ? `مؤرشف مع تحويل 301 إلى /${audit.matchedSlug}` : `Archived duplicate — 301 redirects to /${audit.matchedSlug}`}
                      >
                        <Archive className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {isAr 
                            ? `مؤرشف (301 → /${audit.matchedSlug})` 
                            : `Archived (301 → /${audit.matchedSlug})`}
                        </span>
                      </div>
                    ) : audit?.status === 'CANONICAL_MASTER' ? (
                      <div 
                        data-testid={`canonical-master-badge-${caseStudy.slug}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold"
                        title={isAr ? audit.reasonAr : audit.reasonEn}
                      >
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {isAr 
                            ? "النسخة الأساسية المعتمدة" 
                            : "Canonical Master"}
                        </span>
                      </div>
                    ) : audit?.status === 'POTENTIAL_DUPLICATE' ? (
                      <div 
                        data-testid={`duplicate-warning-${caseStudy.slug}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold"
                        title={audit.matchedSlug ? (isAr ? `يتطابق مع /${audit.matchedSlug}` : `Matches /${audit.matchedSlug}`) : undefined}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {isAr 
                            ? "تكرار محتمل — القرار مطلوب" 
                            : "Potential duplicate — decision required"}
                        </span>
                      </div>
                    ) : audit?.status === 'RECURRING_EDITION' ? (
                      <div 
                        data-testid={`edition-badge-${caseStudy.slug}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold"
                        title={isAr ? audit.reasonAr : audit.reasonEn}
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {isAr ? `نسخة سنوية (${caseStudy.year})` : `Annual Edition (${caseStudy.year})`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-tertiary font-medium">
                        {isAr ? "سجل فريد" : "Distinct"}
                      </span>
                    )}
                  </AdminTableCell>

                  <AdminTableCell>
                    <div className="flex flex-col gap-1.5">
                      {isArchived ? (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {isAr ? "مؤرشف (للموظفين)" : "Archived (Staff)"}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(caseStudy.id, Boolean(caseStudy.isPublished ?? caseStudy.isVisible))}
                          className="inline-flex w-fit cursor-pointer hover:opacity-80 transition-opacity"
                          title={isAr ? "انقر لتغيير حالة الظهور" : "Click to toggle visibility"}
                        >
                          {(caseStudy.isPublished ?? caseStudy.isVisible) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {isAr ? "منشور Live" : "Visible"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-surface-hover text-text-secondary border border-border-default hover:border-amber-500/40 hover:text-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary"></span>
                              {isAr ? "مخفي (انقر للنشر)" : "Hidden (Click to Publish)"}
                            </span>
                          )}
                        </button>
                      )}
                      {caseStudy.isFeatured && !isArchived && (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {isAr ? "مميز" : "Featured"}
                        </span>
                      )}
                    </div>
                  </AdminTableCell>

                  <AdminTableCell className="text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-2">
                      <Link 
                        href={publicHref}
                        target="_blank"
                        className="p-1.5 text-text-tertiary hover:text-text-primary rounded-md hover:bg-surface-active transition-colors"
                        title={isAr ? "عرض في الموقع العام" : "View Live Page"}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <Link href={editHref}>
                        <AdminButton 
                          variant="outline" 
                          size="sm" 
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          {isAr ? "تعديل" : "Edit"}
                        </AdminButton>
                      </Link>

                      <button 
                        onClick={() => handleDelete(caseStudy.id)} 
                        className="p-2 text-text-secondary hover:text-error bg-surface-active hover:bg-error/10 border border-transparent hover:border-error/20 rounded-md transition-colors"
                        title={isAr ? "حذف دراسة الحالة" : "Delete Case Study"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}

            {filteredCases.length === 0 && (
              <AdminTableRow>
                <AdminTableCell colSpan={5} className="h-32 text-center text-text-tertiary font-medium">
                  {isAr 
                    ? 'لم يتم العثور على دراسات حالة. انقر "إضافة دراسة حالة" للبدء.' 
                    : 'No case studies found. Click "Add Case Study" to create one.'}
                </AdminTableCell>
              </AdminTableRow>
            )}
          </AdminTableBody>
        </AdminTable>
      </div>
    </DashboardPageShell>
  );
}
