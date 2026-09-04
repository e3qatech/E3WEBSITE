"use client";

import { useEffect } from "react";
import { isChunkLoadError, triggerSafeChunkReload, clearChunkReloadAttempts } from "@/lib/chunk-recovery";

/**
 * Proactive Global Chunk Error Interceptor.
 * Captures unhandled chunk load errors before or during route transitions and safely reloads
 * the page so that outdated browser clients receive the latest deployed assets.
 */
export function ChunkErrorRecovery() {
  useEffect(() => {
    // When the component mounts successfully after a clean navigation, clear old retry attempts after 10s
    const timer = setTimeout(() => {
      clearChunkReloadAttempts();
    }, 10_000);

    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
        console.warn("[ChunkRecovery] Intercepted missing chunk error. Refreshing to latest deployment...");
        const reloaded = triggerSafeChunkReload();
        if (reloaded && typeof event.preventDefault === "function") {
          event.preventDefault();
        }
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        console.warn("[ChunkRecovery] Intercepted unhandled chunk rejection. Refreshing to latest deployment...");
        const reloaded = triggerSafeChunkReload();
        if (reloaded && typeof event.preventDefault === "function") {
          event.preventDefault();
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
