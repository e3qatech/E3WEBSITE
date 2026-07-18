"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center bg-[var(--surface-default)] p-4 text-center">
      <div className="mb-6 rounded-full bg-[var(--color-error)]/10 p-4">
        <AlertCircle className="h-10 w-10 text-[var(--color-error, #EF4444)]" />
      </div>
      <h2 className="mb-2 font-display text-2xl font-bold text-[var(--text-primary)]">
        System Error Detected
      </h2>
      <p className="mb-8 max-w-md text-[var(--text-secondary)]">
        We encountered an unexpected error while processing your request. The issue has been logged.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 font-mono text-sm font-bold text-[var(--surface-default)] transition-all hover:brightness-110"
      >
        <RefreshCw className="h-4 w-4" />
        REBOOT MODULE
      </button>
    </div>
  );
}
