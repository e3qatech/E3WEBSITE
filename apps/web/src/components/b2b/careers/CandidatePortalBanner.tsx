"use client";

import React from "react";
import Link from "next/link";
import { UserCheck, LogIn, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidatePortalBannerProps {
  locale?: string;
  eyebrowEn?: string;
  eyebrowAr?: string;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  signInTextEn?: string;
  signInTextAr?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export function CandidatePortalBanner({
  locale = "en",
  eyebrowEn,
  eyebrowAr,
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  signInTextEn,
  signInTextAr,
  user,
}: CandidatePortalBannerProps) {
  const isAr = locale === "ar";
  const isAuthenticated = Boolean(user && user.role === "CANDIDATE");
  const loginUrl = `/${locale}/login/careers?callbackUrl=/${locale}/candidate`;
  const portalUrl = `/${locale}/candidate`;

  const resolvedEyebrow = isAr ? (eyebrowAr || eyebrowEn || "بوابة المترشحين والمتابعة الفورية") : (eyebrowEn || eyebrowAr || "CANDIDATE TRACKING PORTAL");
  const resolvedTitle = isAr ? (titleAr || titleEn || "هل تقدمت بطلب وظيفي مسبقاً؟") : (titleEn || titleAr || "Already Applied to E3?");
  const resolvedDesc = isAr
    ? (descriptionAr || descriptionEn || "سجّل الدخول إلى بوابة المترشحين للاطلاع الفوري على حالة طلبك، مرحلة التقييم، وتحديث ملفك الشخصي.")
    : (descriptionEn || descriptionAr || "Sign in to track your submission progress, evaluation stage, and update your uploaded credentials in real-time.");
  const resolvedSignInText = isAr
    ? (signInTextAr || signInTextEn || "تسجيل الدخول لمتابعة الطلب")
    : (signInTextEn || signInTextAr || "Already Applied? Sign In");

  return (
    <section
      data-testid="candidate-portal-banner"
      aria-label={isAr ? "بوابة متابعة طلبات التوظيف" : "Candidate Application Portal"}
      dir={isAr ? "rtl" : "ltr"}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1424] via-[#101b33] to-[#0d1424] border border-cyan-500/20 p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Glow Accent */}
        <div
          className="absolute -start-20 -top-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)" }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-start sm:items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            {isAuthenticated ? <UserCheck className="w-6 h-6 sm:w-7 sm:h-7" /> : <LogIn className="w-6 h-6 sm:w-7 sm:h-7" />}
          </div>

          <div className="text-start">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{resolvedEyebrow}</span>
            </div>

            <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">
              {isAuthenticated
                ? isAr
                  ? `مرحباً بك مجدداً، ${user?.name || "المترشح"}!`
                  : `Welcome back, ${user?.name || "Candidate"}!`
                : resolvedTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
              {isAuthenticated
                ? isAr
                  ? "يمكنك متابعة حالة طلباتك، تحديث سيرتك الذاتية، ومراجعة مواعيد المقابلات مباشرة من لوحة تحكم ملفك."
                  : "Track the review stage of your applications, update credentials, and review schedule invitations in real-time."
                : resolvedDesc}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-end">
          {isAuthenticated ? (
            <Link
              href={portalUrl}
              data-testid="candidate-portal-dashboard-cta"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              <span>{isAr ? "عرض طلباتي وسيرتي الذاتية" : "View My Applications"}</span>
              <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
            </Link>
          ) : (
            <Link
              href={loginUrl}
              data-testid="candidate-portal-signin-cta"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>{isAr ? "تسجيل الدخول لمتابعة الطلب" : "Already Applied? Sign In"}</span>
              <ArrowRight className={cn("w-4 h-4", isAr && "rotate-180")} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
