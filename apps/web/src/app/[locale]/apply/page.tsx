import React, { Suspense } from "react";
import Link from "next/link";
import { UserCheck, ArrowRight } from "lucide-react";
import { ApplicationFormClient } from "@/components/careers/ApplicationFormClient";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";

  return (
    <div className="min-h-screen bg-zinc-950 py-32 px-4 relative overflow-hidden font-sans" dir={dir}>
      {/* Background ambient accents */}
      <div className="absolute top-[-20%] start-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] end-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto max-w-3xl">
        {/* 1. Clear Localized Returning-User Action Banner (SSR Pre-rendered for QF-06) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/20 mb-8 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {isAr ? "هل سبق أن تقدمت بطلب سابق؟" : "Already applied to E3?"}
              </p>
              <p className="text-xs text-zinc-400">
                {isAr
                  ? "سجّل الدخول لمتابعة حالة طلباتك ومستنداتك."
                  : "Sign in to track your submitted application status and credentials."}
              </p>
            </div>
          </div>
          <Link
            href={`/${locale}/login/careers?callbackUrl=/${locale}/candidate`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-bold text-emerald-400 hover:text-zinc-950 bg-emerald-500/10 hover:bg-emerald-400 border border-emerald-500/30 rounded-lg transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400"
            id="returning-applicant-signin-btn"
          >
            <span>{isAr ? "هل سبق أن تقدمت؟ سجّل الدخول" : "Already applied? Sign in"}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {/* 2. Interactive Application Form */}
        <Suspense fallback={<div className="text-center text-zinc-500 py-16">Loading application form...</div>}>
          <ApplicationFormClient locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
