"use client";

import { useEffect } from "react";

export interface DashboardUnsavedChangesGuardProps {
  isDirty: boolean;
  message?: string;
}

export function DashboardUnsavedChangesGuard({
  isDirty,
  message = "You have unsaved changes that will be lost if you leave. Are you sure you want to discard them?",
}: DashboardUnsavedChangesGuardProps) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, message]);

  return null;
}
