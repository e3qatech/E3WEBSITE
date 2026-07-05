"use client"

import { useState, useEffect, useMemo } from "react"
import { AdminPageHeader } from "@/components/dashboard/ui/AdminPageHeader"
import { AdminButton } from "@/components/dashboard/ui/AdminButton"
import { SlideOver } from "@/components/dashboard/ui/SlideOver"
import { Image as ImageIcon, Video, FileText, Trash2, Upload, ExternalLink, Box, Grid, List, Copy, Search, Calendar, HardDrive, Link as LinkIcon, CheckCircle2 } from "lucide-react"

interface Media {
  id: string
  url: string
  type: string
  alt: string
  mimeType: string
  size: number
  createdAt: string
}

const TYPE_ICONS: Record<string, any> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  DOCUMENT: FileText,
  MODEL_3D: Box,
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterType, setFilterType] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [copied, setCopied] = useState(false)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cms/media?limit=200")
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this media?")) return
    try {
      await fetch(`/api/cms/media/${id}`, { method: "DELETE" })
      setMediaList(prev => prev.filter(m => m.id !== id))
      setSelectedMedia(null)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredMedia = useMemo(() => {
    return mediaList.filter(m => {
      const matchesType = filterType === "ALL" || m.type === filterType
      const matchesSearch = m.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.mimeType.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [mediaList, filterType, searchQuery])

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <AdminPageHeader 
        title="Media Library" 
        description="Centralized asset manager for all images, videos, and documents."
        action={
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-default border border-border-default rounded-lg p-1">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-surface-active text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-surface-active text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
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
                {uploading ? "Uploading..." : "Upload Asset"}
              </AdminButton>
            </div>
          </div>
        }
      />

      <div className="px-8 py-4 border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-level-1">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {["ALL", "IMAGE", "VIDEO", "DOCUMENT", "MODEL_3D"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-colors whitespace-nowrap ${
                filterType === type 
                  ? "bg-text-primary text-bg-base" 
                  : "bg-surface-default text-text-secondary border border-border-default hover:bg-surface-hover"
              }`}
            >
              {type === "MODEL_3D" ? "3D Models" : type}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-default border border-border-default rounded-full py-2 ps-9 pe-4 text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-text-tertiary">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-text-tertiary border border-dashed border-border-default rounded-xl bg-surface-default/30">
            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
            <p>No media found.</p>
          </div>
        ) : (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map(media => {
                const Icon = TYPE_ICONS[media.type] || FileText
                return (
                  <div 
                    key={media.id} 
                    onClick={() => setSelectedMedia(media)}
                    className="group relative aspect-square bg-surface-default border border-border-default rounded-xl overflow-hidden hover:border-accent/50 cursor-pointer transition-all hover:shadow-lg"
                  >
                    {media.type === 'IMAGE' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media.url} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : media.type === 'VIDEO' ? (
                      <video src={media.url} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                        <Icon className="w-10 h-10 text-text-tertiary group-hover:text-text-secondary transition-colors" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-base/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-white truncate">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{media.mimeType.split('/')[1] || media.type}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{formatBytes(media.size)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-surface-default border border-border-default rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-hover text-xs uppercase text-text-secondary">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Preview</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Type / File</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Size</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {filteredMedia.map((media) => {
                    const Icon = TYPE_ICONS[media.type] || FileText
                    return (
                      <tr key={media.id} className="hover:bg-surface-hover/50 transition-colors cursor-pointer" onClick={() => setSelectedMedia(media)}>
                        <td className="px-6 py-3 w-20">
                          <div className="w-12 h-12 rounded-lg bg-surface-active overflow-hidden border border-border-default flex items-center justify-center">
                            {media.type === 'IMAGE' ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={media.url} alt="media" className="w-full h-full object-cover" />
                            ) : (
                              <Icon className="w-5 h-5 text-text-tertiary" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text-primary flex items-center gap-2">
                            <Icon className="w-4 h-4 text-text-tertiary" />
                            {media.mimeType}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">{formatBytes(media.size)}</td>
                        <td className="px-6 py-4 text-text-tertiary">{new Date(media.createdAt).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <SlideOver 
        isOpen={!!selectedMedia} 
        onClose={() => { setSelectedMedia(null); setCopied(false) }}
        title="Media Details"
      >
        {selectedMedia && (
          <div className="space-y-8 pb-12">
            <div className="w-full bg-bg-base border border-border-default rounded-xl overflow-hidden flex items-center justify-center p-4">
              {selectedMedia.type === 'IMAGE' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedMedia.url} alt="preview" className="max-w-full max-h-[40vh] object-contain rounded-lg" />
              ) : selectedMedia.type === 'VIDEO' ? (
                <video src={selectedMedia.url} controls className="max-w-full max-h-[40vh] rounded-lg" />
              ) : (
                <div className="h-[20vh] flex items-center justify-center">
                  <FileText className="w-16 h-16 text-text-tertiary" />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border-default pb-2">Information</h3>
                <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <dt className="text-text-tertiary flex items-center gap-1.5 mb-1"><Box className="w-3.5 h-3.5" /> Type</dt>
                    <dd className="font-medium text-text-primary">{selectedMedia.type}</dd>
                  </div>
                  <div>
                    <dt className="text-text-tertiary flex items-center gap-1.5 mb-1"><HardDrive className="w-3.5 h-3.5" /> Size</dt>
                    <dd className="font-medium text-text-primary">{formatBytes(selectedMedia.size)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-text-tertiary flex items-center gap-1.5 mb-1"><LinkIcon className="w-3.5 h-3.5" /> MIME</dt>
                    <dd className="font-medium text-text-primary break-all">{selectedMedia.mimeType}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-text-tertiary flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5" /> Uploaded</dt>
                    <dd className="font-medium text-text-primary">{new Date(selectedMedia.createdAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3 pt-4 border-t border-border-default">
                <AdminButton 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => handleCopyUrl(selectedMedia.url)}
                >
                  <span className="flex items-center gap-2">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy URL"}
                  </span>
                </AdminButton>
                
                <a href={selectedMedia.url} target="_blank" rel="noreferrer" className="w-full">
                  <AdminButton variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Open in New Tab</span>
                  </AdminButton>
                </a>
              </div>

              <div className="pt-8 mt-8 border-t border-red-900/30">
                <AdminButton 
                  variant="outline" 
                  className="w-full text-red-500 hover:bg-red-500/10 hover:border-red-500/50 justify-center"
                  onClick={() => handleDelete(selectedMedia.id)}
                >
                  <Trash2 className="w-4 h-4 me-2" /> Delete Permanently
                </AdminButton>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  )
}
