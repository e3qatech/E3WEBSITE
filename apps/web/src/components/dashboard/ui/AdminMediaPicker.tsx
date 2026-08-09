"use client"

import { useState, useEffect, useRef } from 'react'
import { SlideOver } from "./SlideOver"
import { AdminButton } from "./AdminButton"
import { Image as ImageIcon, Video, FileText, UploadCloud, Check, Trash2 } from "lucide-react"
import { uploadFile } from "@/lib/upload"
import { useToast } from "@/components/dashboard/ui/ToastProvider"
import { safeFetchJson } from "@/lib/utils"

interface Media {
  id: string
  url: string
  type: string
  alt: string
}

interface AdminMediaPickerProps {
  value: string | null
  onChange: (url: string) => void
  label?: string
  accept?: string
  onUploadStatusChange?: (uploading: boolean) => void
}

export function AdminMediaPicker({ value, onChange, label = "Media", accept = "image/*", onUploadStatusChange }: AdminMediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [directUrl, setDirectUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const isVideoUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (url.match(/\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i) || url.startsWith('data:image/')) return false;
    return !!url.match(/\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i) || url.startsWith('data:video/');
  };

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cms/media")
      const parsed = await safeFetchJson(res)
      if (parsed.ok && parsed.data?.data) {
        setMediaList(parsed.data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Expected pattern for data synchronization
      fetchMedia()
      setDirectUrl(value || "")
    }
  }, [isOpen, value])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    onUploadStatusChange?.(true)
    try {
      // 1. Upload via smart upload utility (uses Vercel Blob client upload for large files like videos)
      const { url, fileName } = await uploadFile(file, "cms_media")
      
      let mediaType = "IMAGE"
      if (file.type.startsWith("video/") || file.name.match(/\.(mp4|webm|mov|m4v|mkv)$/i)) mediaType = "VIDEO"
      else if (file.type.includes("pdf") || file.name.match(/\.(pdf|doc|docx)$/i)) mediaType = "DOCUMENT"
      else if (file.name.match(/\.(glb|gltf)$/i)) mediaType = "MODEL_3D"

      // 2. Register media item in CMS database
      const res = await fetch("/api/cms/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          type: mediaType,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          name: fileName
        })
      })

      const data = await res.json().catch(() => null);
      const finalUrl = data?.url || url;

      if (finalUrl) {
        if (res.ok && data) {
          setMediaList(prev => [data, ...prev]);
        }
        onChange(finalUrl);
        toast("Media uploaded & published successfully", "success");
        setIsOpen(false);
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      const msg = err?.message || "Failed to upload file."
      toast(msg, "error")
    } finally {
      setUploading(false)
      onUploadStatusChange?.(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSelect = (url: string) => {
    onChange(url)
    setIsOpen(false)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this media? This cannot be undone.")) return
    
    try {
      const mediaToDelete = mediaList.find(m => m.id === id)
      setMediaList(prev => prev.filter(m => m.id !== id))
      if (mediaToDelete && mediaToDelete.url === value) {
        onChange("")
      }
      await fetch(`/api/cms/media/${id}`, { method: "DELETE" })
      toast("Media deleted", "info")
    } catch (err) {
      console.error(err)
      toast("Failed to delete media", "error")
      fetchMedia()
    }
  }

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-md">
      <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleUpload}
        accept={accept}
        disabled={uploading}
      />

      {/* Prominent Always-Visible System File Upload Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4" />
          {uploading ? "Uploading System File..." : "📁 Upload Local File from Computer"}
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs font-semibold text-slate-400 hover:text-emerald-400 underline px-2 py-1 transition-colors"
        >
          Paste Link / Library →
        </button>
      </div>

      {value ? (
        <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-default)] group bg-[var(--surface-default)] aspect-video flex items-center justify-center shadow-sm">
          {isVideoUrl(value) ? (
            <video src={value} className="w-full h-full object-cover" controls autoPlay loop muted playsInline />
          ) : value.match(/\.(pdf|doc)$/i) ? (
            <FileText className="w-10 h-10 text-[var(--text-tertiary)]" />
          ) : (
            <img src={value} alt="Selected Media" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-zinc-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
            <AdminButton variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Upload Different File
            </AdminButton>
            <AdminButton variant="danger" size="sm" onClick={() => onChange("")}>
              Remove
            </AdminButton>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center p-6 gap-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group bg-[var(--surface-hover)]/30"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <span className="text-sm font-bold text-[var(--text-primary)] block">
              {uploading 
                ? "Uploading file..." 
                : accept.includes("image") && !accept.includes("video") 
                  ? "Click to Upload Local Image File" 
                  : accept.includes("video") && !accept.includes("image") 
                    ? "Click to Upload Local Video File" 
                    : "Click to Upload Local File from System"}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] block">
              Select any image or video directly from your computer folders
            </span>
          </div>
        </div>
      )}

      <SlideOver isOpen={isOpen} onClose={() => setIsOpen(false)} title="Media Library">
        <div className="flex flex-col gap-6">
          {/* Direct URL Input Bar */}
          <div className="p-4 bg-[var(--surface-default)] border border-[var(--border-default)] rounded-xl flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Direct Media URL Input</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste video/image URL (e.g. https://.../video.mp4)"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                className="flex-1 bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!directUrl.trim()) return
                  onChange(directUrl.trim())
                  toast("Applied direct media URL", "success")
                  setIsOpen(false)
                }}
              >
                Apply URL
              </AdminButton>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">Select a file from your library or upload a new one.</p>
            <div className="relative">
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleUpload}
                accept={accept}
                disabled={uploading}
              />
              <AdminButton 
                variant="primary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload New File"}
              </AdminButton>
            </div>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center text-[var(--text-tertiary)] text-sm font-bold">
              Loading library...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mediaList.map((media) => (
                <div 
                  key={media.id}
                  onClick={() => handleSelect(media.url)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${value === media.url ? 'border-[var(--color-primary)]' : 'border-transparent hover:border-[var(--border-strong)]'}`}
                >
                  <div className="w-full h-full bg-[var(--surface-default)] flex items-center justify-center p-2">
                    {media.type === 'VIDEO' || isVideoUrl(media.url) ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-900 rounded-lg overflow-hidden">
                        <Video className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
                        <span className="text-xs font-mono text-[var(--text-tertiary)] truncate w-full text-center px-1">
                          {media.url.split('/').pop()}
                        </span>
                      </div>
                    ) : media.type === 'DOCUMENT' ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <FileText className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
                        <span className="text-xs font-mono text-[var(--text-tertiary)] truncate w-full text-center">{media.url.split('/').pop()}</span>
                      </div>
                    ) : (
                      <img src={media.url} alt={media.alt || 'Media'} className="w-full h-full object-contain" />
                    )}
                  </div>
                  {value === media.url && (
                    <div className="absolute top-2 end-2 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-md z-10">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, media.id)}
                    className="absolute top-2 start-2 w-7 h-7 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                    title="Delete Media"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {mediaList.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)] rounded-xl">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-bold">No media found</span>
                </div>
              )}
            </div>
          )}
        </div>
      </SlideOver>
    </div>
  )
}

