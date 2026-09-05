"use client";

import React, { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { downloadTeamProfilesPDF } from "./TeamProfilePDFDocument";

interface TeamProfilePDFDownloadButtonProps {
  members: any | any[];
  variant?: "primary" | "secondary" | "outline" | "ghost" | "icon";
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
  fileName?: string;
  className?: string;
  title?: string;
  onSuccess?: () => void;
}

export function TeamProfilePDFDownloadButton({
  members,
  variant = "primary",
  size = "md",
  label,
  fileName,
  className = "",
  title,
  onSuccess,
}: TeamProfilePDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const count = Array.isArray(members) ? members.length : 1;

  const defaultLabel =
    count > 1 ? `Export ${count} Profiles (PDF)` : `Download Profile (PDF)`;

  const displayLabel = label ?? defaultLabel;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      await downloadTeamProfilesPDF(members, fileName);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to generate and download Team Profile PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  // Base styling variants
  let variantClasses = "";
  if (variant === "primary") {
    variantClasses =
      "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md hover:shadow-purple-500/20";
  } else if (variant === "secondary") {
    variantClasses =
      "bg-purple-600 hover:bg-purple-500 text-white shadow-md hover:shadow-purple-500/25";
  } else if (variant === "outline") {
    variantClasses =
      "bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-level-1)]";
  } else if (variant === "ghost") {
    variantClasses =
      "bg-transparent hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
  } else if (variant === "icon") {
    variantClasses =
      "bg-[var(--surface-hover)] hover:bg-purple-600/20 text-[var(--text-secondary)] hover:text-purple-300 border border-[var(--border-level-1)] p-1.5";
  }

  // Size classes
  let sizeClasses = "px-3.5 py-2 text-xs rounded-xl";
  if (size === "xs") {
    sizeClasses = "px-2 py-1 text-[11px] rounded-lg";
  } else if (size === "sm") {
    sizeClasses = "px-2.5 py-1.5 text-xs rounded-lg";
  } else if (size === "lg") {
    sizeClasses = "px-5 py-2.5 text-sm rounded-2xl";
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading || count === 0}
        title={title || displayLabel}
        className={`inline-flex items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${variantClasses} ${className}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || count === 0}
      title={title || displayLabel}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer ${variantClasses} ${sizeClasses} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{count > 1 ? "Compiling Multi-Page PDF..." : "Generating Vector A4..."}</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4 shrink-0" />
          <span>{displayLabel}</span>
        </>
      )}
    </button>
  );
}

export default TeamProfilePDFDownloadButton;
