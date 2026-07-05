"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaUploaderProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  accept?: string
}

export function MediaUploader({ value, onChange, placeholder = "https://...", className, accept = "image/*,video/*,audio/*" }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      if (data.success && data.url) {
        onChange(data.url)
      } else {
        alert("Failed to upload file")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Error uploading file")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className={cn("flex w-full items-center gap-2", className)}>
      <div className="relative flex-1">
        <LinkIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder={placeholder}
          className="w-full bg-[var(--surface-default)] border border-[var(--border-default)] rounded-lg ps-9 pe-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--text-primary)]"
        />
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
        className="flex shrink-0 items-center justify-center gap-2 bg-[var(--surface-hover)] border border-[var(--border-default)] hover:border-[var(--color-primary)]/50 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-w-[100px]"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Uploading</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </>
        )}
      </button>
    </div>
  )
}
