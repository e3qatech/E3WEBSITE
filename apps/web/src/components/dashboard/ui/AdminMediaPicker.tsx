"use client"

import { useState, useEffect } from "react"
import { SlideOver } from "./SlideOver"
import { AdminButton } from "./AdminButton"
import { Image as ImageIcon, Video, FileText, UploadCloud, X, Check, Trash2 } from "lucide-react"

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
}

export function AdminMediaPicker({ value, onChange, label = "Media", accept = "image/*" }: AdminMediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cms/media")
      const json = await res.json()
      if (json.data) {
        setMediaList(json.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
    }
  }, [isOpen])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/cms/media", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        setMediaList(prev => [data, ...prev])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
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
    } catch (err) {
      console.error(err)
      // Refresh on error
      fetchMedia()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold text-[var(--text-primary)]">{label}</span>
      
      {value ? (
        <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-[var(--border-default)] group bg-[var(--surface-default)] aspect-video flex items-center justify-center">
          {value.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={value} className="w-full h-full object-cover" controls />
          ) : value.match(/\.(pdf|doc)$/i) ? (
            <FileText className="w-10 h-10 text-[var(--text-tertiary)]" />
          ) : (
            <img src={value} alt="Selected Media" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <AdminButton variant="outline" size="sm" onClick={() => setIsOpen(true)}>
              Change Media
            </AdminButton>
            <AdminButton variant="danger" size="sm" onClick={() => onChange("")}>
              Remove
            </AdminButton>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsOpen(true)}
          className="w-full max-w-sm aspect-video border-2 border-dashed border-[var(--border-default)] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--surface-default)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10">
            <UploadCloud className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors" />
          </div>
          <span className="text-sm font-bold text-[var(--text-secondary)]">Click to browse media</span>
        </div>
      )}

      <SlideOver isOpen={isOpen} onClose={() => setIsOpen(false)} title="Media Library">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">Select a file from your library or upload a new one.</p>
            <div className="relative">
              <input 
                type="file" 
                id="media-upload" 
                className="hidden" 
                onChange={handleUpload}
                accept={accept}
                disabled={uploading}
              />
              <AdminButton 
                variant="primary" 
                onClick={() => document.getElementById("media-upload")?.click()}
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
                    {media.type === 'VIDEO' ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <Video className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
                        <span className="text-xs font-mono text-[var(--text-tertiary)] truncate w-full text-center">{media.url.split('/').pop()}</span>
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
                    <div className="absolute top-2 end-2 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, media.id)}
                    className="absolute top-2 start-2 w-7 h-7 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
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
