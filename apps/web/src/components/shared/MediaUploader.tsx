"use client"

import React, { useState, useRef } from "react"
import { UploadCloud, X, File as FileIcon, Loader2, Box } from "lucide-react"

interface MediaUploaderProps {
  value?: string | null
  onChange: (url: string) => void
  onRemove?: () => void
  accept?: string
  className?: string
  context?: string
}

export function MediaUploader({ value, onChange, onRemove, accept = "image/*", className = "", context }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setError(null)
    setIsUploading(true)
    setProgress(0)

    try {
      // Simulate progress for UI feel since fetch doesn't support upload progress natively easily without XMLHttpRequest
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90))
      }, 100)

      const formData = new FormData()
      formData.append("file", file)
      if (context) {
        formData.append("context", context)
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const data = await res.json()
      
      if (data.success && data.url) {
        onChange(data.url)
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0])
    }
  }

  if (value) {
    return (
      <div className={`relative rounded-xl border border-[var(--border-default)] overflow-hidden group ${className}`}>
        {value.match(/\.(mp4|webm)$/i) ? (
          <video src={value} className="w-full h-48 object-cover" controls />
        ) : value.match(/\.(glb|gltf)$/i) ? (
          <div className="w-full h-48 bg-[var(--surface-hover)] flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <Box className="w-12 h-12 mb-2 text-[var(--color-primary)] opacity-50" />
            <span className="text-sm font-bold">3D Model Uploaded</span>
            <span className="text-xs max-w-[80%] truncate mt-1">{value.split('/').pop()}</span>
          </div>
        ) : value.match(/\.(pdf)$/i) ? (
          <div className="w-full h-48 bg-[var(--surface-hover)] flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <FileIcon className="w-12 h-12 mb-2 text-red-500" />
            <span className="text-sm font-bold text-white">PDF Document</span>
            <span className="text-xs max-w-[80%] truncate mt-1 text-zinc-400">{value.split('/').pop()}</span>
          </div>
        ) : value.match(/\.(doc|docx)$/i) ? (
          <div className="w-full h-48 bg-[var(--surface-hover)] flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <FileIcon className="w-12 h-12 mb-2 text-blue-500" />
            <span className="text-sm font-bold text-white">Word Document</span>
            <span className="text-xs max-w-[80%] truncate mt-1 text-zinc-400">{value.split('/').pop()}</span>
          </div>
        ) : (
          <img src={value} alt="Uploaded Media" className="w-full h-48 object-cover" />
        )}
        
        <div className="absolute inset-0 bg-zinc-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-colors"
          >
            <UploadCloud size={20} />
          </button>
          
          <button 
            type="button"
            onClick={() => {
              if (onRemove) onRemove()
              else onChange("")
            }}
            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleChange} 
          accept={accept} 
          className="hidden" 
        />
      </div>
    )
  }

  return (
    <div 
      className={`relative rounded-xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[12rem]
        ${isDragging ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--border-default)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--surface-hover)]"}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept={accept} 
        className="hidden" 
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center w-full max-w-xs">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-4" />
          <div className="w-full h-2 bg-[var(--surface-active)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[var(--text-secondary)] mt-2">Uploading {progress}%</span>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-[var(--surface-active)] flex items-center justify-center mb-4 text-[var(--text-secondary)]">
            <UploadCloud size={24} />
          </div>
          <h4 className="font-bold text-[var(--text-primary)] mb-1">Click to upload or drag and drop</h4>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            {accept === "image/*" ? "SVG, PNG, JPG, GIF or MP4" : accept.replace(/,/g, ", ").toUpperCase()} (max. 50MB)
          </p>
          
          {error && (
            <div className="text-xs font-bold text-[var(--color-error)] bg-[var(--color-error)]/10 px-3 py-1.5 rounded-full">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  )
}
