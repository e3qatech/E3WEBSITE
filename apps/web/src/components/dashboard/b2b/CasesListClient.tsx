"use client"

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, Search, Briefcase, AlertTriangle, Calendar, ExternalLink } from "lucide-react";
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
            href: "/dashboard/b2b/cases/new",
            icon: <Plus className="w-4 h-4" />,
          }}
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
              const publicHref = localizeHref(`/b2b/cases/${caseStudy.slug}`, locale);

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
                    {audit?.status === 'POTENTIAL_DUPLICATE' ? (
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
                      {(caseStudy.isPublished ?? caseStudy.isVisible) ? (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400">
                          {isAr ? "منشور Live" : "Visible"}
                        </span>
                      ) : (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-surface-hover text-text-secondary border border-border-default">
                          {isAr ? "مخفي" : "Hidden"}
                        </span>
                      )}
                      {caseStudy.isFeatured && (
                        <span className="inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400">
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

                      <AdminButton 
                        onClick={() => router.push(editHref)} 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        {isAr ? "تعديل" : "Edit"}
                      </AdminButton>

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
