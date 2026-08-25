"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Loader2,
  X,
  Check,
  Eye,
  Film,
  Sparkles,
} from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface PackageMediaUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  mediaType?: "IMAGE" | "VIDEO";
  onMediaTypeChange?: (type: "IMAGE" | "VIDEO") => void;
  accept?: string;
  placeholder?: string;
  context?: string;
  recommendedSize?: string;
  isAr?: boolean;
}

export function PackageMediaUploader({
  label,
  value,
  onChange,
  mediaType = "IMAGE",
  onMediaTypeChange,
  accept,
  placeholder = "https://...",
  context = "packages",
  recommendedSize,
  isAr = false,
}: PackageMediaUploaderProps) {
  const [mode, setMode] = useState<"LOCAL" | "URL">(value?.startsWith("http") && !value.includes("blob") ? "URL" : "LOCAL");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo =
    mediaType === "VIDEO" ||
    value?.endsWith(".mp4") ||
    value?.endsWith(".webm") ||
    value?.endsWith(".mov") ||
    value?.includes("video");

  const defaultAccept = mediaType === "VIDEO"
    ? "video/mp4,video/webm,video/quicktime,video/*"
    : "image/jpeg,image/png,image/webp,image/svg+xml,image/avif,image/*,video/*";

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      if (file.type.startsWith("video/") && onMediaTypeChange) {
        onMediaTypeChange("VIDEO");
      } else if (file.type.startsWith("image/") && onMediaTypeChange) {
        onMediaTypeChange("IMAGE");
      }

      const result = await uploadFile(file, context);
      if (result && result.url) {
        onChange(result.url);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload file. Please try again or use a direct URL.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-2.5 w-full">
      {/* Header with Label & Source Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <label className="text-xs font-bold text-[var(--text-secondary)] block">
            {label}
          </label>
        )}

        <div className="flex items-center gap-2">
          {/* Media Type Toggle (if supported) */}
          {onMediaTypeChange && (
            <div className="flex items-center p-0.5 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => onMediaTypeChange("IMAGE")}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1",
                  mediaType === "IMAGE"
                    ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                <ImageIcon className="w-3 h-3" />
                <span>{isAr ? "صورة" : "Image"}</span>
              </button>
              <button
                type="button"
                onClick={() => onMediaTypeChange("VIDEO")}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1",
                  mediaType === "VIDEO"
                    ? "bg-[var(--surface-default)] text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                <VideoIcon className="w-3 h-3" />
                <span>{isAr ? "فيديو" : "Video"}</span>
              </button>
            </div>
          )}

          {/* Mode Switcher (Local Upload vs External URL) */}
          <div className="flex items-center p-0.5 bg-[var(--surface-subtle)] rounded-lg border border-[var(--border-default)]">
            <button
              type="button"
              onClick={() => setMode("LOCAL")}
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1",
                mode === "LOCAL"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Upload className="w-3 h-3" />
              <span>{isAr ? "رفع من الجهاز" : "Local File"}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("URL")}
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1",
                mode === "URL"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              )}
            >
              <LinkIcon className="w-3 h-3" />
              <span>{isAr ? "رابط مباشر" : "URL"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      {mode === "LOCAL" ? (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept || defaultAccept}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2",
              isDragging
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                : "border-[var(--border-default)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] hover:border-[var(--color-primary)]/60"
            )}
          >
            {isUploading ? (
              <div className="py-4 flex flex-col items-center gap-2 text-[var(--color-primary)]">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">{isAr ? "جارٍ الرفع والمعالجة..." : "Uploading & Optimizing Media..."}</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-default)] border border-[var(--border-default)] flex items-center justify-center text-[var(--color-primary)] shadow-xs">
                  {isVideo ? <Film className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {isAr ? "اضغط لاختيار ملف من جهازك أو اسحبه هنا" : "Click to browse file from computer or drag & drop"}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {recommendedSize || (isVideo ? "MP4, WebM, QuickTime (Max 4.5MB for direct upload)" : "PNG, JPG, WebP, SVG, AVIF")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <LinkIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl ps-9 pe-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
          />
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <p className="text-xs text-rose-500 font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
          {uploadError}
        </p>
      )}

      {/* Live Media Preview Box */}
      {value && (
        <div className="relative rounded-2xl overflow-hidden border border-[var(--border-default)] bg-black/90 p-1 group">
          <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-xl bg-black flex items-center justify-center">
            {isVideo ? (
              <video
                src={value}
                controls
                className="w-full h-full object-contain"
                playsInline
              />
            ) : (
              <img
                src={value}
                alt="Media Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            )}

            {/* Media Overlay Badges */}
            <div className="absolute top-2 start-2 flex items-center gap-1.5 z-10 pointer-events-none">
              <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white font-bold flex items-center gap-1">
                {isVideo ? <VideoIcon className="w-3 h-3 text-cyan-400" /> : <ImageIcon className="w-3 h-3 text-purple-400" />}
                {isVideo ? "VIDEO" : "IMAGE"}
              </span>
            </div>

            {/* Remove / Clear Button */}
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 end-2 p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-md"
              title={isAr ? "إزالة الوسائط" : "Remove Media"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-2 flex items-center justify-between text-[10px] font-mono text-zinc-400 truncate">
            <span className="truncate pe-2">{value}</span>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline shrink-0 flex items-center gap-0.5 font-bold"
            >
              <span>{isAr ? "فتح الرابط" : "Open"}</span>
              <Eye className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
