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
import { localizeHref, normalizeExternalUrl } from "@/lib/url-helper";

interface B2CGlobalFooterProps {
  settings?: Record<string, string>;
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

  const address = isAr
    ? settings.addressAr || "الدوحة، دولة قطر"
    : settings.addressEn || "Doha, State of Qatar";

  const phone = settings.contactPhone || "+974 3048 9955";
  const emailAddr = settings.contactEmail || "info@eeeqa.com";

  const lightLogoUrl = settings.lightLogoUrl || "/logo-dark.png";
  const darkLogoUrl = settings.darkLogoUrl || "/logo-white.png";

  const bookTicketsUrl = settings.bookTicketsUrl || "/b2c/tickets";
  const bookTicketsLabel = isAr
    ? settings.bookTicketsLabelAr || "احجز التذاكر الآن"
    : settings.bookTicketsLabelEn || "BOOK TICKETS NOW";

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

  // Background Media Resolution
  const footerMediaObj: any = typeof settings.footerMedia === "object" ? settings.footerMedia : null;
  const bgMediaUrl =
    settings.footerMediaUrl ||
    settings.footerBackgroundMediaUrl ||
    (typeof settings.footerMedia === "string" ? settings.footerMedia : footerMediaObj?.mediaUrl || footerMediaObj?.url) ||
    "";
  const bgPosterUrl =
    settings.footerPosterUrl || settings.backgroundPosterUrl || footerMediaObj?.posterUrl || "";

  const isSpline = typeof bgMediaUrl === "string" && (bgMediaUrl.includes("spline.design") || bgMediaUrl.includes(".splinecode"));
  let rawType = (settings.footerMediaType || footerMediaObj?.mediaType || "").toString().toUpperCase();

  if (!rawType && bgMediaUrl) {
    if (bgMediaUrl.includes("youtube.com") || bgMediaUrl.includes("youtu.be")) rawType = "YOUTUBE";
    else if (bgMediaUrl.includes("vimeo.com")) rawType = "VIMEO";
    else if (bgMediaUrl.endsWith(".mp4") || bgMediaUrl.endsWith(".webm")) rawType = "VIDEO";
    else if (isSpline) rawType = "IFRAME";
    else rawType = "IMAGE";
  }

  const isIframe = rawType === "IFRAME" || rawType === "YOUTUBE" || rawType === "VIMEO";
  const bgMediaType = isIframe ? rawType : rawType === "VIDEO" ? "VIDEO" : "IMAGE";
  let effectiveSrc = bgMediaUrl;
  if (bgMediaType === "IMAGE") {
    effectiveSrc = bgPosterUrl || (!isSpline ? bgMediaUrl : "");
  }

  // B2C Experience Links
  const experienceLinks = [
    { labelEn: "All Attractions & Kinetic Rides", labelAr: "كافة الوجهات والألعاب الحركية", href: "/b2c/attractions" },
    { labelEn: "Pulse Orbit Galaxy Station", labelAr: "محطة بولس أوربت الفضائية", href: "/b2c/pulse-orbit" },
    { labelEn: "Upcoming Shows & Calendar", labelAr: "جدول العروض والفعاليات", href: "/b2c/calendar" },
    { labelEn: "VIP Packages & Family Passes", labelAr: "باقات VIP والتذاكر العائلية", href: "/b2c/packages" },
    { labelEn: "Discover Experiences", labelAr: "استكشف العوالم الترفيهية", href: "/b2c/discover" },
  ];

  // B2C Guest Services Links
  const guestLinks = [
    { labelEn: "Guest Support & Inquiries", labelAr: "خدمة العملاء والاستفسارات", href: "/b2c/contact" },
    { labelEn: "Visitor Safety & Height Guidelines", labelAr: "إرشادات السلامة وضوابط الطول", href: "/b2c/contact" },
    { labelEn: "Location, Parking & Directions", labelAr: "الموقع ومواقف السيارات", href: "/b2c/contact" },
    { labelEn: "Visitor FAQs & Help Center", labelAr: "الأسئلة الشائعة للزوار", href: "/b2c/contact" },
  ];

  return (
    <footer className="relative bg-neutral-950 text-neutral-200 border-t border-neutral-800/80 pt-16 pb-10 overflow-hidden font-sans">
      {/* Atmospheric Background Media Scrim */}
      {(effectiveSrc || bgPosterUrl) && (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden opacity-30">
          <UniversalMediaRenderer
            src={effectiveSrc || bgPosterUrl}
            type={bgMediaType as any}
            alt="Footer Atmospheric Media"
            className="w-full h-full object-cover"
            poster={bgPosterUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/90 to-neutral-950 z-[1] pointer-events-none" />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* 1. Top Entertainment Ticket CTA Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-pink-950/70 border border-purple-500/30 p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -end-16 -top-16 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? "احجز تذكرتك وعِش الإثارة" : "STEP INTO KINETIC WONDER"}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isAr ? "تجارب ترفيهية غامرة لا تُنسى في قطر" : "Unforgettable Immersive Entertainment in Qatar"}
              </h3>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {isAr
                  ? "استكشف أحدث مدن الألعاب الفضائية، والعروض الترفيهية الحية، وباقات التذاكر الحصرية لك ولعائلتك."
                  : "Explore gravity-defying rides, spatial projection realms, interactive family attractions, and exclusive VIP passes."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Link
                href={localizeHref(bookTicketsUrl, locale)}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-pink-950/50 hover:shadow-pink-700/50 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer tracking-wider"
              >
                <Ticket className="w-4 h-4" />
                <span>{bookTicketsLabel}</span>
              </Link>
              <Link
                href={localizeHref("/b2c/calendar", locale)}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-sm transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{isAr ? "جدول الفعاليات" : "View Show Schedule"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. 4-Column Structured B2C Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand & Social */}
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
                ? (settings.footerDescriptionAr || "ريادة الترفيه الحركي والوجهات الغامرة في قطر. نصنع تجارب مدهشة تلامس الخيال وتجمع العائلة.")
                : (settings.footerDescriptionEn || "Pioneering kinetic entertainment, spatial attractions, and live family experiences in Qatar.")}
            </p>

            {/* Social Icons */}
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
                  aria-label="Twitter / X"
                  className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-pink-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
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

          {/* Column 2: Discover Attractions */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? "استكشف الوجهات والألعاب" : "Discover Attractions"}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              {experienceLinks.map((item) => (
                <li key={item.labelEn}>
                  <Link
                    href={localizeHref(item.href, locale)}
                    className="hover:text-pink-300 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className={cn("w-3 h-3 text-pink-500 shrink-0", isAr && "rotate-180")} />
                    <span>{isAr ? item.labelAr : item.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Guest & Visitor Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isAr ? "خدمات الضيوف والزوار" : "Guest & Visitor Services"}</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              {guestLinks.map((item) => (
                <li key={item.labelEn}>
                  <Link
                    href={localizeHref(item.href, locale)}
                    className="hover:text-pink-300 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className={cn("w-3 h-3 text-pink-500 shrink-0", isAr && "rotate-180")} />
                    <span>{isAr ? item.labelAr : item.labelEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Ticket Perks */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{isAr ? "نشرة العروض والخصومات" : "VIP Ticket Alerts"}</span>
            </h4>
            <p className="text-xs text-neutral-400">
              {isAr
                ? "اشترك ليصلك جدول الفعاليات الجديدة وخصومات التذاكر الحصرية."
                : "Subscribe for early-bird tickets, seasonal festival schedules, and VIP perks."}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAr ? "بريدك الإلكتروني..." : "Enter your email..."}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {subscribeStatus === "success" && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAr ? "تم الاشتراك بنجاح!" : "Subscribed successfully!"}</span>
                </p>
              )}
              {subscribeStatus === "error" && (
                <p className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{isAr ? "حدث خطأ، يرجى المحاولة لاحقاً." : "Subscription failed. Try again."}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* 3. Bottom Legal & Visitor Safety Bar */}
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
              {isAr ? "متوافق مع حماية البيانات (Qatar PDPL)" : "Qatar PDPL Compliant"}
            </span>
            <Link href={localizeHref("/b2c/privacy", locale)} className="hover:text-neutral-300 transition-colors">
              {isAr ? "الخصوصية" : "Privacy"}
            </Link>
            <Link href={localizeHref("/b2c/terms", locale)} className="hover:text-neutral-300 transition-colors">
              {isAr ? "شروط التذاكر" : "Ticketing Terms"}
            </Link>
            <Link href={localizeHref("/b2c/contact", locale)} className="hover:text-neutral-300 transition-colors">
              {isAr ? "المساعدة" : "Support"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
