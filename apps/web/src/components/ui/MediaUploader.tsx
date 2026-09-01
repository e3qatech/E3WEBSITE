"use client"
 
import { useState, useRef } from "react"
import { Upload, Loader2, Link as LinkIcon, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

import { uploadFile } from "@/lib/upload"

interface MediaUploaderProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  accept?: string
  context?: string
}

export function MediaUploader({ 
  value, 
  onChange, 
  placeholder = "https://...", 
  className, 
  accept = "image/*,video/*,audio/*", 
  context 
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [_progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isImageUrl = Boolean(
    value && 
    !imageError && 
    (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) &&
    !value.endsWith('.mp4') && 
    !value.endsWith('.webm') && 
    !value.endsWith('.mov')
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setImageError(false)
    setIsUploading(true)
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90))
      }, 100)

      const result = await uploadFile(file, context)

      clearInterval(progressInterval)
      setProgress(100)

      onChange(result.url)
    } catch (err: any) {
      console.error("[MediaUploader Error]", err)
      setError(err.message || "Upload failed. Please check file format and size.")
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 1000)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <div className="flex w-full items-center gap-2">
        {/* Preview Thumbnail if image is set */}
        {isImageUrl && (
          <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-2)] flex items-center justify-center p-1 group">
            <Image
              src={value}
              alt="Uploaded Preview"
              fill
              className="object-contain"
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        )}

        <div className="relative flex-1">
          <LinkIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
          <input 
            type="text" 
            value={value || ""} 
            onChange={e => {
              setImageError(false);
              setError(null);
              onChange(e.target.value);
            }} 
            placeholder={placeholder}
            className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg ps-9 pe-8 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--text-primary)]"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setImageError(false);
                setError(null);
              }}
              title="Clear media URL"
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-red-400 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
          accept={accept}
        />
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex shrink-0 items-center justify-center gap-2 bg-[var(--surface-hover)] border border-[var(--border-default)] hover:border-[var(--color-primary)]/50 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-w-[100px]"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary)]" />
              <span className="hidden sm:inline">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="hidden sm:inline">Upload</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium px-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
