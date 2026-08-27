"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { useTheme } from "./ThemeProvider";
import {
  Send,
  Ticket,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Compass,
  HelpCircle,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { UniversalMediaRenderer } from "@/components/shared/UniversalMediaRenderer";
import { cn } from "@/lib/utils";
import { localizeHref, normalizeExternalUrl, isExternalUrl } from "@/lib/url-helper";

interface FooterLinkItem {
  labelEn: string;
  labelAr?: string;
  href: string;
}

interface B2CGlobalFooterProps {
  settings?: Record<string, any>;
}

// Default Fallback Experience Links
const DEFAULT_EXPERIENCE_LINKS: FooterLinkItem[] = [
  { labelEn: "All Attractions & Kinetic Rides", labelAr: "كافة الوجهات والألعاب الحركية", href: "/b2c/attractions" },
  { labelEn: "Pulse Orbit Galaxy Station", labelAr: "محطة بولس أوربت الفضائية", href: "/b2c/pulse-orbit" },
  { labelEn: "Upcoming Shows & Calendar", labelAr: "جدول العروض والفعاليات", href: "/b2c/calendar" },
  { labelEn: "VIP Packages & Family Passes", labelAr: "باقات VIP والتذاكر العائلية", href: "/b2c/packages" },
  { labelEn: "Discover Experiences", labelAr: "استكشف العوالم الترفيهية", href: "/b2c/discover" },
];

// Default Fallback Guest Links
const DEFAULT_GUEST_LINKS: FooterLinkItem[] = [
  { labelEn: "Guest Support & Inquiries", labelAr: "خدمة العملاء والاستفسارات", href: "/b2c/contact" },
  { labelEn: "Visitor Safety & Height Guidelines", labelAr: "إرشادات السلامة وضوابط الطول", href: "/b2c/contact" },
  { labelEn: "Location, Parking & Directions", labelAr: "الموقع ومواقف السيارات", href: "/b2c/contact" },
  { labelEn: "Visitor FAQs & Help Center", labelAr: "الأسئلة الشائعة للزوار", href: "/b2c/contact" },
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

export function B2CGlobalFooter({ settings = {} }: B2CGlobalFooterProps) {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const isAr = locale === "ar";

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "success" | "error">("idle");

  const siteName = isAr
    ? settings.siteNameAr || "إي ثري قطر - عوالم الترفيه الفضائي"
    : settings.siteNameEn || "E3 Qatar - Kinetic Entertainment Worlds";

  const lightLogoUrl = settings.lightLogoUrl || "/logo-dark.png";
  const darkLogoUrl = settings.darkLogoUrl || "/logo-white.png";

  // Dynamic B2C CTA Banner
  const ctaTitle = isAr
    ? settings.b2cFooterCtaTitleAr || "تجارب ترفيهية غامرة لا تُنسى في قطر"
    : settings.b2cFooterCtaTitleEn || "Unforgettable Immersive Entertainment in Qatar";

  const ctaSubtitle = isAr
    ? settings.b2cFooterCtaSubtitleAr || "استكشف أحدث مدن الألعاب الفضائية، والعروض الترفيهية الحية، وباقات التذاكر الحصرية لك ولعائلتك."
    : settings.b2cFooterCtaSubtitleEn || "Explore gravity-defying rides, spatial projection realms, interactive family attractions, and exclusive VIP passes.";

  const bookTicketsUrl = settings.bookTicketsUrl || "/b2c/tickets";
  const bookTicketsLabel = isAr
    ? settings.bookTicketsLabelAr || "احجز التذاكر الآن"
    : settings.bookTicketsLabelEn || "BOOK TICKETS NOW";

  const secondaryBtnUrl = settings.b2cFooterSecondaryBtnUrl || "/b2c/calendar";
  const secondaryBtnLabel = isAr
    ? settings.b2cFooterSecondaryBtnLabelAr || "جدول العروض والفعاليات"
    : settings.b2cFooterSecondaryBtnLabelEn || "View Show Schedule";

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    setSubscribeStatus("idle");
    try {
      const res = await fetch("/api/crm/subscribers/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribeStatus("success");
        setEmail("");
      } else {
        setSubscribeStatus("error");
      }
    } catch {
      setSubscribeStatus("error");
    } finally {
      setSubscribing(false);
    }
  };

  // Background Media Resolution (Image, Video, Iframe, 3D, Spline)
  const footerMediaObj: any = typeof settings.footerMedia === "object" ? settings.footerMedia : null;
  const bgMediaUrl =
    settings.b2cFooterMediaUrl ||
    settings.footerMediaUrl ||
    settings.footerBackgroundMediaUrl ||
    (typeof settings.footerMedia === "string" ? settings.footerMedia : footerMediaObj?.mediaUrl || footerMediaObj?.url) ||
    "";
  const bgPosterUrl =
    settings.b2cFooterPosterUrl ||
    settings.footerPosterUrl ||
    settings.backgroundPosterUrl ||
    footerMediaObj?.posterUrl ||
    "";

  const isSpline = typeof bgMediaUrl === "string" && (bgMediaUrl.includes("spline.design") || bgMediaUrl.includes(".splinecode"));
  let rawType = (settings.b2cFooterMediaType || settings.footerMediaType || footerMediaObj?.mediaType || "").toString().toUpperCase();

  if (!rawType && bgMediaUrl) {
    if (bgMediaUrl.includes("youtube.com") || bgMediaUrl.includes("youtu.be")) rawType = "YOUTUBE";
    else if (bgMediaUrl.includes("vimeo.com")) rawType = "VIMEO";
    else if (bgMediaUrl.endsWith(".mp4") || bgMediaUrl.endsWith(".webm")) rawType = "VIDEO";
    else if (isSpline) rawType = "SPLINE";
    else rawType = "IMAGE";
  }

  const isIframe = rawType === "IFRAME" || rawType === "YOUTUBE" || rawType === "VIMEO" || rawType === "SPLINE" || rawType === "THREE_D";
  const bgMediaType = isIframe ? rawType : rawType === "VIDEO" ? "VIDEO" : "IMAGE";
  let effectiveSrc = bgMediaUrl;
  if (bgMediaType === "IMAGE") {
    effectiveSrc = bgPosterUrl || (!isSpline ? bgMediaUrl : "");
  }

  // Dynamic Editable Links
  const experienceLinks = parseJsonLinks(settings.b2cFooterExploreLinks, DEFAULT_EXPERIENCE_LINKS);
  const guestLinks = parseJsonLinks(settings.b2cFooterGuestLinks, DEFAULT_GUEST_LINKS);

  return (
    <footer className="relative bg-neutral-950 text-neutral-200 border-t border-neutral-800/80 pt-16 pb-10 overflow-hidden font-sans">
      {/* Atmospheric Background Media Scrim (Image, Video, Iframe, 3D, Spline) */}
      {(effectiveSrc || bgPosterUrl) && (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden opacity-30 pointer-events-none">
          <UniversalMediaRenderer
            src={effectiveSrc || bgPosterUrl}
            type={bgMediaType as any}
            alt="B2C Footer Atmospheric Media"
            className="w-full h-full object-cover"
            poster={bgPosterUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/90 to-neutral-950 z-[1] pointer-events-none" />
        </div>
      )}

      {/* Futuristic Orbit Arc Accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
      <div className="absolute top-0 end-1/4 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* 1. Top Atmospheric Entertainment CTA Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-pink-950/60 via-purple-950/70 to-indigo-950/60 border border-pink-500/30 p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -start-16 -bottom-16 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "خطوة نحو عوالم المرح الحركي" : "STEP INTO KINETIC WONDER"}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {ctaTitle}
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {ctaSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Link
                href={localizeHref(bookTicketsUrl, locale)}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-pink-950/50 hover:shadow-pink-700/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>{bookTicketsLabel}</span>
              </Link>
              <Link
                href={localizeHref(secondaryBtnUrl, locale)}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-sm transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-pink-400" />
                <span>{secondaryBtnLabel}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. 4-Column Structured B2C Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Identity & Socials */}
          <div className="space-y-6">
            <Link href={localizeHref("/b2c", locale)} className="inline-block">
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
                ? settings.footerDescriptionAr || "ريادة مستقبل الفعاليات والترفيه في قطر. نصنع تجارب استثنائية ولحظات لا تُنسى لجميع أفراد العائلة."
                : settings.footerDescriptionEn || "Pioneering the future of events and entertainment in Qatar. Creating unforgettable moments through innovation."}
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {settings.socialInstagram && (
                <a
                  href={normalizeExternalUrl(settings.socialInstagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-pink-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
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
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-pink-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              )}
              {settings.socialTwitter && (
                <a
                  href={normalizeExternalUrl(settings.socialTwitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-pink-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {settings.socialFacebook && (
                <a
                  href={normalizeExternalUrl(settings.socialFacebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-pink-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Discover Attractions (Dynamic Backend Controlled) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? "استكشف الوجهات والفعاليات" : "Discover Attractions"}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              {experienceLinks.map((item, idx) => {
                const label = isAr ? item.labelAr || item.labelEn : item.labelEn;
                const isExternal = isExternalUrl(item.href);

                return (
                  <li key={`${item.href}-${idx}`}>
                    {isExternal ? (
                      <a
                        href={normalizeExternalUrl(item.href)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pink-300 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className={cn("w-3 h-3 text-pink-500 shrink-0", isAr && "rotate-180")} />
                        <span>{label}</span>
                      </a>
                    ) : (
                      <Link
                        href={localizeHref(item.href, locale)}
                        className="hover:text-pink-300 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className={cn("w-3 h-3 text-pink-500 shrink-0", isAr && "rotate-180")} />
                        <span>{label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Guest & Visitor Services (Dynamic Backend Controlled) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isAr ? "خدمة وإرشاد الزوار" : "Guest & Visitor Services"}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              {guestLinks.map((item, idx) => {
                const label = isAr ? item.labelAr || item.labelEn : item.labelEn;
                const isExternal = isExternalUrl(item.href);

                return (
                  <li key={`${item.href}-${idx}`}>
                    {isExternal ? (
                      <a
                        href={normalizeExternalUrl(item.href)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pink-300 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className={cn("w-3 h-3 text-pink-500 shrink-0", isAr && "rotate-180")} />
                        <span>{label}</span>
                      </a>
                    ) : (
                      <Link
                        href={localizeHref(item.href, locale)}
                        className="hover:text-pink-300 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowRight className={cn("w-3 h-3 text-pink-500 shrink-0", isAr && "rotate-180")} />
                        <span>{label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4: Newsletter & Ticket Alerts */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{isAr ? "نشرة التذاكر والعروض الحصرية" : "VIP Ticket Alerts"}</span>
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isAr
                ? "اشترك ليصلك إشعار الحجز المبكر للفعاليات، وعروض التذاكر الموسمية، ومزايا باقات VIP."
                : "Subscribe for early-bird tickets, seasonal festival schedules, and VIP perks."}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAr ? "أدخل بريدك الإلكتروني..." : "Enter your email..."}
                  required
                  className="w-full h-11 ps-3.5 pe-12 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  aria-label="Subscribe"
                  className="absolute end-1.5 top-1.5 h-8 w-8 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>

              {subscribeStatus === "success" && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isAr ? "تم الاشتراك بنجاح في نشرة الفعاليات!" : "Subscribed successfully!"}</span>
                </p>
              )}
              {subscribeStatus === "error" && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{isAr ? "حدث خطأ أثناء الاشتراك. حاول ثانية." : "Error subscribing. Try again."}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* 3. Bottom Legal & PDPL Compliance Bar */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isAr
                ? `© ${new Date().getFullYear()} مؤسسات الفعاليات والترفيه (إي ثري قطر). جميع الحقوق محفوظة.`
                : `© ${new Date().getFullYear()} Events & Entertainment Enterprises (E3 Qatar). All rights reserved.`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <span className="text-emerald-400 font-semibold">
              {isAr ? "متوافق مع قانون حماية البيانات الشخصية القطري (PDPL)" : "Qatar PDPL Compliant"}
            </span>
            <Link href={localizeHref("/b2c/privacy", locale)} className="hover:text-neutral-300 transition-colors">
              {isAr ? "الخصوصية" : "Privacy"}
            </Link>
            <Link href={localizeHref("/b2c/terms", locale)} className="hover:text-neutral-300 transition-colors">
              {isAr ? "شروط التذاكر" : "Ticketing Terms"}
            </Link>
            <Link href={localizeHref("/b2c/contact", locale)} className="hover:text-neutral-300 transition-colors">
              {isAr ? "الدعم والمساعدة" : "Support"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
