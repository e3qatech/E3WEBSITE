"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play } from "lucide-react"

export interface GalleryItem {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO'
  caption?: Record<string, string>
}

interface ServiceGalleryProps {
  items: GalleryItem[]
  locale: string
}

export function ServiceGallery({ items, locale }: ServiceGalleryProps) {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null)

  if (!items || items.length === 0) return null

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="gallery">
      
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)]">
          {locale === 'ar' ? 'معرض الأعمال' : 'Gallery'}
        </h2>
      </div>

      {/* CSS Columns Masonry */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="break-inside-avoid relative rounded-2xl overflow-hidden cursor-pointer group bg-[var(--surface-hover)] border border-[var(--border-default)]"
            onClick={() => setActiveItem(item)}
          >
            {item.type === 'IMAGE' ? (
              <img 
                src={item.url} 
                alt={item.caption?.[locale] || item.caption?.en || 'Gallery image'}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="relative">
                <video 
                  src={item.url} 
                  className="w-full h-auto object-cover"
                  muted 
                  playsInline
                />
                <div className="absolute inset-0 bg-zinc-950/30 flex items-center justify-center group-hover:bg-zinc-950/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Hover Caption */}
            {item.caption && (
              <div className="absolute bottom-0 start-0 end-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">
                  {item.caption[locale] || item.caption.en}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-md p-4 md:p-8"
            onClick={() => setActiveItem(null)}
          >
            <button 
              className="absolute top-6 end-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
              onClick={(e) => { e.stopPropagation(); setActiveItem(null) }}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full rounded-sg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {activeItem.type === 'IMAGE' ? (
                <img 
                  src={activeItem.url} 
                  alt={activeItem.caption?.[locale] || activeItem.caption?.en || 'Gallery image'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <video 
                  src={activeItem.url} 
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              )}
              {activeItem.caption && (
                <div className="absolute bottom-0 start-0 end-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-white text-lg text-center font-medium">
                    {activeItem.caption[locale] || activeItem.caption.en}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  )
}
