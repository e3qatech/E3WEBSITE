'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Play, Grid, Film, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { formatLocalizedText } from '@/lib/utils';

interface GalleryItem {
  id: string;
  url: string;
  captionEn?: any;
  captionAr?: any;
}

export function GalleryLightbox({ items, locale = 'en' }: { items: GalleryItem[]; locale?: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PHOTOS' | 'VIDEOS'>('ALL');
  const [showAll, setShowAll] = useState(false);

  if (!items || items.length === 0) return null;

  const isAr = locale === 'ar';

  const isVideo = (url: string) => !!url.match(/\.(mp4|webm|mov)$/i);

  const filteredItems = items.filter(item => {
    if (filter === 'PHOTOS') return !isVideo(item.url);
    if (filter === 'VIDEOS') return isVideo(item.url);
    return true;
  });

  const initialCount = 6;
  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, initialCount);
  const hasMore = filteredItems.length > initialCount;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % filteredItems.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const currentItem = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  return (
    <section className="py-24 bg-zinc-950 relative border-t border-white/5" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
              {isAr ? "المعرض المرئي للتجربة" : "MEDIA GALLERY"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
              {isAr ? "معرض الصور والفيديوهات" : "Captured Moments"}
            </h2>
          </div>

          {/* Filter Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => { setFilter('ALL'); setShowAll(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'ALL' ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{isAr ? "الكل" : "All"} ({items.length})</span>
            </button>

            <button
              onClick={() => { setFilter('PHOTOS'); setShowAll(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'PHOTOS' ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isAr ? "الصور" : "Photos"} ({items.filter(i => !isVideo(i.url)).length})</span>
            </button>

            <button
              onClick={() => { setFilter('VIDEOS'); setShowAll(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'VIDEOS' ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{isAr ? "الفيديوهات" : "Videos"} ({items.filter(i => isVideo(i.url)).length})</span>
            </button>
          </div>
        </div>

        {/* Interactive Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item, idx) => {
            const itemIsVideo = isVideo(item.url);
            const caption = isAr ? (item.captionAr || item.captionEn) : (item.captionEn || item.captionAr);

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 3) * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative group cursor-pointer overflow-hidden rounded-3xl border border-white/10 aspect-[4/3] bg-zinc-900 shadow-2xl"
                onClick={() => openLightbox(idx)}
              >
                {itemIsVideo ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={formatLocalizedText(caption, locale) || `Gallery Media ${idx + 1}`}
                    className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105 opacity-85 group-hover:opacity-100"
                    loading="lazy"
                  />
                )}

                {/* Video / Zoom Hover Overlay */}
                <div className="absolute inset-0 bg-zinc-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-between p-6 backdrop-blur-[2px]">
                  <div className="flex justify-end">
                    <span className="p-2.5 rounded-full bg-zinc-950/80 border border-white/20 text-white shadow-lg">
                      {itemIsVideo ? <Play className="w-4 h-4 fill-white" /> : <Maximize2 className="w-4 h-4" />}
                    </span>
                  </div>

                  {caption && (
                    <p className="text-xs font-bold text-white leading-tight drop-shadow line-clamp-2">
                      {formatLocalizedText(caption, locale)}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* See More / Show Less Button */}
        {hasMore && (
          <div className="text-center pt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-emerald-500 text-white hover:text-zinc-950 font-black text-xs uppercase tracking-widest border border-white/15 transition-all shadow-xl hover:scale-105 cursor-pointer"
            >
              <span>
                {showAll 
                  ? (isAr ? "عرض أقل ▲" : "Show Less ▲") 
                  : (isAr ? `عرض باقي الصور والفيديوهات (+${filteredItems.length - initialCount}) ▼` : `See All Photos & Videos (${filteredItems.length}) ▼`)}
              </span>
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 end-6 z-50 p-3 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-emerald-500 hover:text-zinc-950 transition-colors shadow-2xl cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Prev Button */}
            <button
              onClick={prevImage}
              className="absolute start-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-emerald-500 hover:text-zinc-950 transition-colors shadow-2xl cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={nextImage}
              className="absolute end-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-emerald-500 hover:text-zinc-950 transition-colors shadow-2xl cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <div 
              className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo(currentItem.url) ? (
                <video
                  src={currentItem.url}
                  controls
                  autoPlay
                  className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl border border-white/10"
                />
              ) : (
                <img
                  src={currentItem.url}
                  alt="Full screen media"
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              )}

              {/* Caption Bar */}
              <div className="text-center">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {selectedIndex + 1} / {filteredItems.length}
                </span>
                {currentItem.captionEn && (
                  <p className="text-sm text-zinc-300 font-medium mt-1">
                    {formatLocalizedText(currentItem.captionEn, locale)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
