"use client"

import React, { useState, useRef } from "react"
import { Upload, X, Check, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react"
import { uploadFile } from "@/lib/upload"
import { cn } from "@/lib/utils"

interface PDFImageUploaderProps {
  label: string
  value: string
  onChange: (url: string) => void
  placeholder?: string
  recommendedSize?: string
  isAr?: boolean
}

export function PDFImageUploader({
  label,
  value,
  onChange,
  placeholder = "https://... or upload image",
  recommendedSize = "PNG, SVG, or JPG (transparent background recommended)",
  isAr = false
}: PDFImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imgLoadError, setImgLoadError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    setImgLoadError(false)

    try {
      const uploadResult = await uploadFile(file, "brand_logo")
      onChange(uploadResult.url)
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err?.message || (isAr ? "فشل رفع الصورة" : "Failed to upload image"))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono text-zinc-300 font-bold block">{label}</label>
        {recommendedSize && (
          <span className="text-[10px] text-zinc-500 font-mono">{recommendedSize}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Thumbnail Preview */}
        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group">
          {value && !imgLoadError ? (
            <img
              src={value}
              alt={label}
              className="w-full h-full object-contain p-1"
              crossOrigin="anonymous"
              onError={() => setImgLoadError(true)}
            />
          ) : (
            <ImageIcon className="w-4 h-4 text-zinc-600" />
          )}
        </div>

        {/* Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setImgLoadError(false)
              onChange(e.target.value)
            }}
            placeholder={placeholder}
            className="w-full px-3 py-2 pr-8 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("")
                setImgLoadError(false)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border",
            isUploading
              ? "bg-purple-600/30 border-purple-500/50 text-purple-300"
              : "bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30 text-purple-300 hover:text-white"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{isAr ? "جاري الرفع..." : "Uploading..."}</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>{isAr ? "رفع صورة" : "Upload"}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-[10px] text-red-400 font-mono mt-1">{error}</p>
      )}
    </div>
  )
}
