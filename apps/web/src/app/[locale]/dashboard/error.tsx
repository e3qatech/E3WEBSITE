"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, RefreshCw, LogIn, LayoutDashboard, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar") || false;
  const locale = isAr ? "ar" : "en";

  useEffect(() => {
    console.error("[DASHBOARD_ERROR_BOUNDARY]", error);
  }, [error]);

  const isAuthIssue =
    error?.message?.toLowerCase().includes("unauthorized") ||
    error?.message?.toLowerCase().includes("session") ||
    error?.message?.toLowerCase().includes("forbidden") ||
    error?.message?.toLowerCase().includes("auth");

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-lg w-full rounded-2xl bg-[var(--bg-level-2,#18181b)] border border-[var(--border-level-1,#27272a)] p-8 shadow-xl space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/25">
          {isAuthIssue ? (
            <ShieldAlert className="w-7 h-7 text-amber-400" />
          ) : (
            <AlertCircle className="w-7 h-7 text-rose-400" />
          )}
        </div>

        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {isAuthIssue ? (isAr ? "جلسة منتهية أو غير مصرح" : "Session Expired / Restricted") : (isAr ? "تنبيه النظام الإداري" : "Dashboard Module Notice")}
          </span>
          <h2 className="text-xl font-bold text-[var(--text-primary,#ffffff)] tracking-tight">
            {isAr ? "تعذر تحميل وحدة التحكم بالكامل" : "Dashboard Module Notice"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted,#a1a1aa)] leading-relaxed">
            {isAuthIssue
              ? isAr
                ? "انتهت صلاحية جلسة تسجيل الدخول الإدارية الخاصة بك أو أن الحساب لا يمتلك الصلاحيات الكافية لهذا القسم."
                : "Your administrative session may have expired, or your account lacks permissions for this section."
              : isAr
              ? "واجه النظام استجابة غير متوقعة أثناء جلب بيانات الوحدة. يمكنك إعادة المحاولة أو العودة للرئيسية."
              : "An unexpected response occurred while loading this section. You can retry the module or return to the main dashboard."}
          </p>
        </div>

        {error?.digest && (
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-zinc-400 text-center" dir="ltr">
            Reference Digest: <span className="text-zinc-200">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isAuthIssue ? (
            <Link
              href={`/${locale}/login/admin?callbackUrl=${encodeURIComponent(pathname || `/${locale}/dashboard`)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isAr ? "تسجيل الدخول كمسؤول" : "Sign In to Admin Portal"}</span>
            </Link>
          ) : (
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-accent,#7c3aed)] hover:opacity-90 text-white text-xs font-bold transition shadow-md cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isAr ? "إعادة تشغيل الوحدة" : "Retry Module"}</span>
            </button>
          )}

          <button
            onClick={handleReload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-level-3,#27272a)] hover:bg-[var(--bg-level-4,#3f3f46)] text-[var(--text-primary,#ffffff)] text-xs font-semibold border border-[var(--border-level-2,#3f3f46)] transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>{isAr ? "تحديث الصفحة" : "Reload Page"}</span>
          </button>

          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-level-3,#27272a)] hover:bg-[var(--bg-level-4,#3f3f46)] text-[var(--text-secondary,#d4d4d8)] text-xs font-semibold border border-[var(--border-level-2,#3f3f46)] transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
            <span>{isAr ? "الرئيسية" : "Overview"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
