"use client"

import { useState, useEffect } from "react"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { Image as ImageIcon, Video, FileText, Trash2, Upload, ExternalLink } from "lucide-react"

interface Media {
  id: string
  url: string
  type: string
  alt: string
  mimeType: string
  size: number
  createdAt: string
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
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
    fetchMedia()
  }, [])

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader 
        title="Media Library" 
        description="Manage all images, videos, and documents across the platform."
        action={
          <div className="relative">
            <input 
              type="file" 
              id="media-upload-page" 
              className="hidden" 
              onChange={handleUpload}
              disabled={uploading}
            />
            <AdminButton 
              variant="primary" 
              onClick={() => document.getElementById("media-upload-page")?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 me-2" />
              {uploading ? "Uploading..." : "Upload Media"}
            </AdminButton>
          </div>
        }
      />

      <div className="p-8 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border-default)] rounded-xl">
            <ImageIcon className="w-12 h-12 mb-4 text-[var(--text-tertiary)]" />
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No media found</h3>
            <p className="text-[var(--text-secondary)] mb-6 text-center max-w-sm">
              Upload images, videos, or documents to use them across your website and portals.
            </p>
            <AdminButton 
              variant="outline" 
              onClick={() => document.getElementById("media-upload-page")?.click()}
            >
              Upload First Asset
            </AdminButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mediaList.map((media) => (
              <div key={media.id} className="group relative bg-[var(--surface-default)] rounded-xl border border-[var(--border-default)] overflow-hidden hover:border-[var(--border-strong)] transition-colors">
                <div className="aspect-square bg-[var(--surface-hover)] flex items-center justify-center p-4">
                  {media.type === 'VIDEO' ? (
                    <Video className="w-12 h-12 text-[var(--text-tertiary)]" />
                  ) : media.type === 'DOCUMENT' ? (
                    <FileText className="w-12 h-12 text-[var(--text-tertiary)]" />
                  ) : (
                    <img src={media.url} alt={media.alt || 'Media'} className="w-full h-full object-contain" />
                  )}
                </div>
                
                {/* Overlay actions */}
                <div className="absolute top-0 start-0 w-full p-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/50 to-transparent">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => window.open(media.url, '_blank')}
                      className="p-1.5 rounded-md bg-zinc-900/80 text-white hover:bg-[var(--color-primary)] transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => alert('Delete API not implemented for mock')}
                      className="p-1.5 rounded-md bg-zinc-900/80 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 border-t border-[var(--border-default)]">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate" title={media.url.split('/').pop()}>
                    {media.url.split('/').pop()}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
                      {media.type}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {formatBytes(media.size)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
