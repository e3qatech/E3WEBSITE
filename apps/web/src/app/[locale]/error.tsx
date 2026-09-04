"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { isChunkLoadError, triggerSafeChunkReload } from "@/lib/chunk-recovery";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar") || false;
  const [isAutoReloading, setIsAutoReloading] = useState(false);
  const isChunkError = isChunkLoadError(error);

  useEffect(() => {
    console.error("[LOCALE_ERROR_BOUNDARY]", error);

    if (isChunkError) {
      setIsAutoReloading(true);
      const reloaded = triggerSafeChunkReload();
      if (!reloaded) {
        setIsAutoReloading(false);
      }
    }
  }, [error, isChunkError]);

  const handleManualReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  if (isChunkError) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-[var(--surface-default)] p-6 text-center" dir={isAr ? "rtl" : "ltr"}>
        <div className="mb-6 rounded-full bg-purple-500/10 p-5 border border-purple-500/20 animate-pulse">
          <Sparkles className="h-10 w-10 text-purple-400" />
        </div>
        <h2 className="mb-2 font-display text-2xl font-bold text-white">
          {isAr
            ? (isAutoReloading ? "جاري تحديث المنصة..." : "يتوفر تحديث جديد للمنصة")
            : (isAutoReloading ? "Updating Application..." : "Application Update Available")}
        </h2>
        <p className="mb-6 max-w-md text-zinc-400 text-sm leading-relaxed">
          {isAr
            ? (isAutoReloading
                ? "تم نشر إصدار جديد مع تحسينات أداء إضافية. جاري إعادة التحميل تلقائياً..."
                : "تم نشر إصدار أحدث للمنصة. يرجى إعادة تحميل الصفحة لتفعيل أحدث البيانات والميزات.")
            : (isAutoReloading
                ? "A newer version of E3 Qatar is being loaded with the latest improvements. Reloading automatically..."
                : "A new version of the platform has been deployed. Please reload your browser to load the latest release.")}
        </p>

        <button
          onClick={handleManualReload}
          className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 font-mono text-sm font-bold text-white transition-all shadow-lg hover:shadow-purple-500/25 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isAutoReloading ? "animate-spin" : ""}`} />
          <span>{isAr ? "تحديث الصفحة الآن" : "REFRESH APPLICATION"}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center bg-[var(--surface-default)] p-4 text-center" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-6 rounded-full bg-[var(--color-error)]/10 p-4">
        <AlertCircle className="h-10 w-10 text-[var(--color-error, #EF4444)]" />
      </div>
      <h2 className="mb-2 font-display text-2xl font-bold text-[var(--text-primary)]">
        {isAr ? "حدث خطأ غير متوقع في النظام" : "System Error Detected"}
      </h2>
      <p className="mb-4 max-w-md text-[var(--text-secondary)]">
        {isAr
          ? "واجهنا خطأ أثناء معالجة طلبك. يمكنك إعادة تشغيل الوحدة أو تحديث الصفحة."
          : "We encountered an unexpected error while processing your request."}
      </p>
      {error?.message && (
        <div className="mb-6 max-w-xl w-full rounded-lg bg-black/50 p-4 text-left font-mono text-xs text-red-400 border border-red-500/20 overflow-auto max-h-48" dir="ltr">
          <p className="font-bold text-red-300 mb-1">Error Details:</p>
          <p className="break-words">{error.message}</p>
          {error.digest && <p className="mt-2 text-gray-400 text-[10px]">Digest: {error.digest}</p>}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 font-mono text-sm font-bold text-[var(--surface-default)] transition-all hover:brightness-110 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{isAr ? "إعادة تشغيل الوحدة" : "REBOOT MODULE"}</span>
        </button>
        <button
          onClick={handleManualReload}
          className="flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-6 py-3 font-mono text-sm font-bold text-white transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{isAr ? "إعادة تحميل الصفحة" : "RELOAD PAGE"}</span>
        </button>
      </div>
    </div>
  );
}
