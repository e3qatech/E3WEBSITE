"use client"

import { useState } from "react"
import { 
  Play, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface GalleryMediaItem {
  id?: string
  url: string
  type: "IMAGE" | "VIDEO"
  captionEn?: string
  captionAr?: string
}

interface PackageGalleryShowcaseProps {
  gallery: any[]
  coverMediaUrl?: string
  heroMediaUrl?: string
  heroMediaType?: "IMAGE" | "VIDEO"
  packageName: string
  locale: string
  venueName?: string
  attractionGallery?: any[]
}

export function PackageGalleryShowcase({
  gallery = [],
  coverMediaUrl,
  heroMediaUrl,
  heroMediaType = "IMAGE",
  packageName,
  locale,
  venueName,
  attractionGallery = []
}: PackageGalleryShowcaseProps) {
  const isAr = locale === "ar"
  const [activeFilter, setActiveFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL")
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  // Aggregate all media items
  const mediaItems: GalleryMediaItem[] = []

  if (coverMediaUrl) {
    mediaItems.push({
      id: "cover-media",
      url: coverMediaUrl,
      type: "IMAGE",
      captionEn: "Experience Highlights & Celebration Setting",
      captionAr: "أجواء وتجهيزات الاحتفال والفعالية"
    })
  }

  if (heroMediaUrl && heroMediaUrl !== coverMediaUrl) {
    mediaItems.push({
      id: "hero-media",
      url: heroMediaUrl,
      type: heroMediaType || "IMAGE",
      captionEn: "Venue Arena & Live Action",
      captionAr: "ساحة الفعالية والأجواء التفاعلية"
    })
  }

  if (Array.isArray(gallery)) {
    gallery.forEach((item, idx) => {
      if (item && item.url) {
        const isVideo = item.type === "VIDEO" || item.url.match(/\.(mp4|webm|mov)$/i) || item.url.includes("youtube.com") || item.url.includes("vimeo.com")
        mediaItems.push({
          id: item.id || `gal-${idx}`,
          url: item.url,
          type: isVideo ? "VIDEO" : "IMAGE",
          captionEn: item.captionEn || `Experience Visual #${idx + 1}`,
          captionAr: item.captionAr || `لقطة من الفعالية #${idx + 1}`
        })
      }
    })
  }

  if (Array.isArray(attractionGallery) && (!Array.isArray(gallery) || gallery.length === 0)) {
    attractionGallery.forEach((item, idx) => {
      const url = typeof item === "string" ? item : item?.url
      if (url) {
        const isVideo = url.match(/\.(mp4|webm|mov)$/i) || url.includes("youtube.com") || url.includes("vimeo.com")
        mediaItems.push({
          id: `att-gal-${idx}`,
          url,
          type: isVideo ? "VIDEO" : "IMAGE",
          captionEn: (typeof item === "object" && item.captionEn) || `${venueName || "Venue"} Gallery Visual #${idx + 1}`,
          captionAr: (typeof item === "object" && item.captionAr) || `${venueName || "الوجهة"} لقطة #${idx + 1}`
        })
      }
    })
  }

  // Filter items
  const filtered = mediaItems.filter(item => {
    if (activeFilter === "ALL") return true
    return item.type === activeFilter
  })

  if (mediaItems.length === 0) return null

  const activeMedia = selectedIdx !== null ? filtered[selectedIdx] : null

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % filtered.length)
    }
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + filtered.length) % filtered.length)
    }
  }

  return (
    <section className="py-12 border-t border-[var(--border-level-2)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--e3-royal-blue)]/10 text-[var(--e3-royal-blue)] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? "معرض الوسائط واللقطات الحية" : "Experience Media & Video Showcase"}
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-[var(--text-primary)]">
            {isAr ? `جولة مرئية في ${packageName}` : `Visual Tour of ${packageName}`}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {isAr
              ? `شاهد صور وفيديوهات حية من الفعاليات وقاعات الألعاب في ${venueName || "وجهة إي ثري"}.`
              : `Explore real photos and video reels from past celebrations at ${venueName || "E3 Venue"}.`}
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeFilter === "ALL"
                ? "bg-[var(--e3-royal-blue)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {isAr ? "الكل" : "All"} ({mediaItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("IMAGE")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeFilter === "IMAGE"
                ? "bg-[var(--e3-royal-blue)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {isAr ? "الصور" : "Photos"}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("VIDEO")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              activeFilter === "VIDEO"
                ? "bg-[var(--e3-royal-blue)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            {isAr ? "فيديو" : "Videos"}
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => setSelectedIdx(idx)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--surface-hover)] border border-[var(--border-level-2)] hover:border-[var(--e3-royal-blue)] transition-all cursor-pointer shadow-xs hover:shadow-md"
          >
            {item.type === "VIDEO" ? (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                <video
                  src={item.url}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="w-11 h-11 rounded-full bg-[var(--e3-royal-blue)]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ps-0.5" />
                </div>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white font-bold flex items-center gap-1">
                  <VideoIcon className="w-3 h-3 text-rose-400" />
                  Video
                </span>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={item.url}
                  alt={isAr ? (item.captionAr || item.captionEn || packageName) : (item.captionEn || packageName)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-[11px] text-white font-medium line-clamp-1">
                    {isAr ? (item.captionAr || item.captionEn) : item.captionEn}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Lightbox Modal */}
      {selectedIdx !== null && activeMedia && (
        <div
          onClick={() => setSelectedIdx(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setSelectedIdx(null)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Arrows */}
          {filtered.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Media Content Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-3"
          >
            <div className="relative w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden bg-black/40">
              {activeMedia.type === "VIDEO" ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl"
                />
              ) : (
                <img
                  src={activeMedia.url}
                  alt={isAr ? (activeMedia.captionAr || activeMedia.captionEn || packageName) : (activeMedia.captionEn || packageName)}
                  className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>

            {/* Caption & Counter */}
            <div className="flex items-center justify-between w-full px-2 text-xs text-slate-300">
              <span className="font-medium">
                {isAr ? (activeMedia.captionAr || activeMedia.captionEn) : activeMedia.captionEn}
              </span>
              <span className="font-mono text-slate-400">
                {selectedIdx + 1} / {filtered.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
