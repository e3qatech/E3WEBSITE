"use client"

import { useState } from "react"
import { Upload, X, File, Image as ImageIcon } from "lucide-react"

interface MediaUploaderProps {
  onUploadComplete: (urls: string[]) => void
  multiple?: boolean
  accept?: string
}

export function MediaUploader({ onUploadComplete, multiple = false, accept = "image/*" }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true)
    else if (e.type === "dragleave") setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateUpload(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload(Array.from(e.target.files))
    }
  }

  const simulateUpload = (files: File[]) => {
    setUploading(true)
    setProgress(0)
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setUploading(false)
          // Mock returned URLs
          const urls = files.map(f => URL.createObjectURL(f))
          onUploadComplete(urls)
          return 100
        }
        return p + 10
      })
    }, 200)
  }

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative
        ${isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--border-default)] hover:border-[var(--color-primary)]/50 bg-[var(--surface-hover)]'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      
      {!uploading ? (
        <div className="flex flex-col items-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-default)] flex items-center justify-center mb-4 text-[var(--text-tertiary)]">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
            Drag & drop files here
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            or click to select {multiple ? "multiple files" : "a file"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-sm font-bold text-[var(--text-primary)] mb-4">Uploading... {progress}%</p>
          <div className="w-full max-w-xs h-2 bg-[var(--surface-default)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-primary)] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
