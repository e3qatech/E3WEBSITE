"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Sparkles, Briefcase, AlertCircle } from "lucide-react";
import { isChunkLoadError, triggerSafeChunkReload } from "@/lib/chunk-recovery";

export default function ApplicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isAutoReloading, setIsAutoReloading] = useState(false);
  const isChunkError = isChunkLoadError(error);

  useEffect(() => {
    console.error("[APPLICATIONS_ERROR_BOUNDARY]", error);

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

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-2xl bg-purple-500/10 p-5 border border-purple-500/20 shadow-xl shadow-purple-500/5">
        {isChunkError ? (
          <Sparkles className="h-10 w-10 text-purple-400 animate-pulse" />
        ) : (
          <Briefcase className="h-10 w-10 text-purple-400" />
        )}
      </div>

      <h2 className="mb-2 font-display text-2xl font-bold text-white">
        {isChunkError
          ? (isAutoReloading ? "Updating Careers Portal..." : "Platform Update Available")
          : "Careers Applications Unavailable"}
      </h2>

      <p className="mb-6 max-w-md text-zinc-400 text-sm leading-relaxed">
        {isChunkError
          ? "A new version of the E3 recruitment dashboard has been deployed. Refreshing automatically to ensure uninterrupted access to candidate records..."
          : "We encountered an issue retrieving the latest job candidate records. Please retry or refresh the dashboard."}
      </p>

      {error?.message && !isChunkError && (
        <div className="mb-6 max-w-lg w-full rounded-xl bg-zinc-950/80 p-4 text-left font-mono text-xs text-red-400 border border-red-500/20 overflow-auto max-h-36">
          <p className="font-bold text-red-300 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            Diagnostic Notice
          </p>
          <p className="break-words text-zinc-300">{error.message}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => (isChunkError ? handleManualReload() : reset())}
          className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-6 py-3 font-mono text-sm font-bold text-white transition-all shadow-lg hover:shadow-purple-500/25 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isAutoReloading ? "animate-spin" : ""}`} />
          {isChunkError ? "REFRESH NOW" : "RETRY LOADING"}
        </button>

        <button
          onClick={handleManualReload}
          className="flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-6 py-3 font-mono text-sm font-bold text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          HARD RELOAD
        </button>
      </div>
    </div>
  );
}
