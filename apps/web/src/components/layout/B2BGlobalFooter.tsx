"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { useTheme } from "./ThemeProvider";
import {
  ArrowRight,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";
import { localizeHref, normalizeExternalUrl, isExternalUrl } from "@/lib/url-helper";

interface FooterLinkItem {
  labelEn: string;
  labelAr?: string;
  href: string;
}

interface B2BGlobalFooterProps {
  settings?: Record<string, any>;
}

// Default Fallback Solutions Links
const DEFAULT_SOLUTIONS_LINKS: FooterLinkItem[] = [
  { labelEn: "Turnkey Attraction Engineering", labelAr: "هندسة الوجهات الترفيهية المتكاملة", href: "/b2b/services" },
  { labelEn: "Live Event Production & Rigging", labelAr: "إنتاج الفعاليات الكبرى والمسارح", href: "/b2b/services" },
  { labelEn: "Spatial & Kinetic Staging", labelAr: "العروض الحركية والمؤثرات البصرية", href: "/b2b/services" },
  { labelEn: "Immersive AV & Projection Mapping", labelAr: "أنظمة الصوت والضوء والخرائط الضوئية", href: "/b2b/services" },
  { labelEn: "Landmark Case Studies", labelAr: "سجل الإنجازات والمشاريع الكبرى", href: "/b2b/case-studies" },
  { labelEn: "Strategic Clients & Partners", labelAr: "شركاء النجاح والعملاء الاستراتيجيين", href: "/b2b/clients" },
];

// Default Fallback Company Links
const DEFAULT_COMPANY_LINKS: FooterLinkItem[] = [
  { labelEn: "About E3 Enterprise", labelAr: "عن شركة إي ثري", href: "/b2b/about" },
  { labelEn: "Executive Leadership & Founders", labelAr: "القيادة التنفيذية والمؤسسون", href: "/b2b/leadership" },
  { labelEn: "Careers & Engineering Roles", labelAr: "الوظائف والفرص الهندسية", href: "/b2b/careers" },
  { labelEn: "Vendor & Supplier Intake", labelAr: "تسجيل الموردين والمقاولين", href: "/b2b/contact" },
  { labelEn: "Feedback & Quality Assurance", labelAr: "تقييم الجودة والملاحظات", href: "/b2b/feedback" },
  { labelEn: "Frequently Asked Questions", labelAr: "الأسئلة الشائعة للشركات", href: "/b2b/faqs" },
];

// Helper to safely parse JSON links
function parseJsonLinks(raw: any, fallback: FooterLinkItem[]): FooterLinkItem[] {
  if (!raw) return fallback;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Return fallback
    }
  }
  return fallback;
}

export function B2BGlobalFooter({ settings = {} }: B2BGlobalFooterProps) {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const isAr = locale === "ar";

  const siteName = isAr
    ? settings.siteNameAr || "إي ثري - حلول الفعاليات والترفيه"
    : settings.siteNameEn || "E3 - Enterprise Event & Entertainment Engineering";

  const address = isAr
    ? settings.addressAr || "الدوحة، دولة قطر"
    : settings.addressEn || "Doha, State of Qatar";

  const phone = settings.contactPhone || "+974 3048 9955";
  const emailAddr = settings.contactEmail || "info@eeeqa.com";
  const workingHours = isAr
    ? settings.workingHours || "الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً"
    : settings.workingHours || "Sun - Thu: 9:00 AM - 6:00 PM";

  const lightLogoUrl = settings.lightLogoUrl || "/logo-dark.png";
  const darkLogoUrl = settings.darkLogoUrl || "/logo-white.png";

  const crNumber = settings.b2bCrNumber || "184920 / 2026";

  // Dynamic CTA Banner Config
  const footerCtaTitle = isAr
    ? settings.b2bFooterCtaTitleAr || "جاهز لتنفيذ مشروعك الترفيهي القادم في قطر؟"
    : settings.b2bFooterCtaTitleEn || "Ready to Engineer Your Next Landmark Experience?";

  const footerCtaSubtitle = isAr
    ? settings.b2bFooterCtaSubtitleAr || "تواصل مع خبراء إي ثري لبناء الوجهات الترفيهية الكبرى، الفعاليات الحية، والإنتاج الفني المتكامل."
    : settings.b2bFooterCtaSubtitleEn || "Partner with Qatar's premier turnkey attraction engineering, spatial production, and kinetic staging specialists.";

  const footerCtaBtnLabel = isAr
    ? settings.b2bFooterCtaBtnLabelAr || "طلب العروض والمشاريع (RFP)"
    : settings.b2bFooterCtaBtnLabelEn || "Submit Project RFP";

  const footerCtaBtnUrl = settings.b2bFooterCtaBtnUrl || "/b2b/contact";

  const footerSecondaryBtnLabel = isAr
    ? settings.b2bFooterSecondaryBtnLabelAr || "استكشف دراسات الحالة"
    : settings.b2bFooterSecondaryBtnLabelEn || "Explore Case Studies";

  const footerSecondaryBtnUrl = settings.b2bFooterSecondaryBtnUrl || "/b2b/case-studies";

  // Dynamic Editable Links
  const solutions = parseJsonLinks(settings.b2bFooterSolutionsLinks, DEFAULT_SOLUTIONS_LINKS);
  const companyLinks = parseJsonLinks(settings.b2bFooterCompanyLinks, DEFAULT_COMPANY_LINKS);

  // Background Media Resolution (Image, Video, Iframe, 3D, Spline)
  const bgMediaUrl = settings.b2bFooterMediaUrl || settings.footerMediaUrl || "";
  const bgMediaType = (settings.b2bFooterMediaType || settings.footerMediaType || "IMAGE").toString().toUpperCase();
  const bgPosterUrl = settings.b2bFooterPosterUrl || settings.footerPosterUrl || "";

  return (
    <footer className="relative bg-neutral-950 text-neutral-200 border-t border-neutral-800/80 pt-16 pb-10 overflow-hidden font-sans">
      {/* Background Media Container (3D Spline, Video, Iframe, or Image) */}
      {bgMediaUrl && (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden opacity-25 pointer-events-none">
          <UniversalMediaRenderer
            src={bgMediaUrl}
            type={bgMediaType as any}
            alt="B2B Footer Background Media"
            className="w-full h-full object-cover"
            poster={bgPosterUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/95 via-neutral-950/90 to-neutral-950 z-[1] pointer-events-none" />
        </div>
      )}

      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* 1. Top Enterprise CTA Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/70 via-neutral-900 to-indigo-950/70 border border-purple-500/30 p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -end-16 -top-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "شراكات الأعمال والمشاريع الكبرى" : "ENTERPRISE B2B PARTNERSHIPS"}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {footerCtaTitle}
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {footerCtaSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Link
                href={localizeHref(footerCtaBtnUrl, locale)}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-950/50 hover:shadow-purple-700/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{footerCtaBtnLabel}</span>
                <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
              </Link>
              <Link
                href={localizeHref(footerSecondaryBtnUrl, locale)}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-sm transition-colors cursor-pointer"
              >
                <span>{footerSecondaryBtnLabel}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. 4-Column Structured Corporate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Identity & Corporate HQ */}
          <div className="space-y-6">
            <Link href={localizeHref("/b2b", locale)} className="inline-block">
              <img
                src={theme === "dark" ? (darkLogoUrl || lightLogoUrl) : (lightLogoUrl || darkLogoUrl)}
                alt={`${siteName} Logo`}
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </Link>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {isAr
                ? settings.footerDescriptionAr || "الشريك المعتمد لتنفيذ الوجهات الترفيهية، وهندسة المسارح الحية، والإنتاج التقني الشامل في دولة قطر ومنطقة الشرق الأوسط."
                : settings.footerDescriptionEn || "Qatar's turnkey event engineering, spatial entertainment production, and kinetic staging partner for governmental and commercial destinations."}
            </p>

            {/* Social Network Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {settings.socialLinkedin && (
                <a
                  href={normalizeExternalUrl(settings.socialLinkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              )}
              {settings.socialTwitter && (
                <a
                  href={normalizeExternalUrl(settings.socialTwitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {settings.socialInstagram && (
                <a
                  href={normalizeExternalUrl(settings.socialInstagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
              {settings.socialYoutube && (
                <a
                  href={normalizeExternalUrl(settings.socialYoutube)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: B2B Engineering Solutions (Dynamic Backend Controlled) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isAr ? "الخدمات والحلول الهندسية" : "Engineering Solutions"}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              {solutions.map((item, idx) => {
                const label = isAr ? item.labelAr || item.labelEn : item.labelEn;
                const isExternal = isExternalUrl(item.href);

                return (
                  <li key={`${item.href}-${idx}`}>
                    {isExternal ? (
                      <a
                        href={normalizeExternalUrl(item.href)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className={cn("w-3 h-3 text-purple-500 shrink-0", isAr && "rotate-180")} />
                        <span>{label}</span>
                      </a>
                    ) : (
                      <Link
                        href={localizeHref(item.href, locale)}
                        className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className={cn("w-3 h-3 text-purple-500 shrink-0", isAr && "rotate-180")} />
                        <span>{label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Corporate Directory (Dynamic Backend Controlled) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isAr ? "الشركة والشفافية" : "Enterprise Directory"}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              {companyLinks.map((item, idx) => {
                const label = isAr ? item.labelAr || item.labelEn : item.labelEn;
                const isExternal = isExternalUrl(item.href);

                return (
                  <li key={`${item.href}-${idx}`}>
                    {isExternal ? (
                      <a
                        href={normalizeExternalUrl(item.href)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className={cn("w-3 h-3 text-purple-500 shrink-0", isAr && "rotate-180")} />
                        <span>{label}</span>
                      </a>
                    ) : (
                      <Link
                        href={localizeHref(item.href, locale)}
                        className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className={cn("w-3 h-3 text-purple-500 shrink-0", isAr && "rotate-180")} />
                        <span>{label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4: Official Contacts & Qatar HQ */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{isAr ? "المقر الرئيسي والتواصل" : "Qatar HQ & Direct Intake"}</span>
            </h4>
            <div className="space-y-3 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <a href={`mailto:${emailAddr}`} className="hover:text-purple-300 font-mono transition-colors">
                  {emailAddr}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-purple-300 font-mono transition-colors">
                  {phone}
                </a>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-neutral-400">{workingHours}</span>
              </div>

              {/* Qatar Commercial Registration Badge */}
              <div className="pt-3 border-t border-neutral-800/80">
                <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                  <span>{isAr ? "السجل التجاري (قطر):" : "CR Number (Qatar):"}</span>
                  <span className="font-bold text-neutral-200">{crNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal & PDPL Compliance Bar */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isAr
                ? `© ${new Date().getFullYear()} مؤسسات الفعاليات والترفيه ذ.م.م (إي ثري). جميع الحقوق محفوظة.`
                : `© ${new Date().getFullYear()} Events & Entertainment Enterprises W.L.L. (E3 Qatar). All rights reserved.`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <span className="text-emerald-400 font-semibold">
              {isAr ? "متوافق مع قانون حماية البيانات الشخصية القطري (PDPL No. 13)" : "Qatar PDPL Compliant (Law No. 13 of 2016)"}
            </span>
            <Link href={localizeHref("/b2b/privacy", locale)} className="hover:text-neutral-300 transition-colors">
              {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
            <Link href={localizeHref("/b2b/terms", locale)} className="hover:text-neutral-300 transition-colors">
              {isAr ? "شروط الخدمة" : "Enterprise Terms"}
            </Link>
            <Link href={localizeHref("/b2b/contact", locale)} className="hover:text-neutral-300 transition-colors">
              {isAr ? "تقديم طلب شراكة" : "Submit RFP"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
