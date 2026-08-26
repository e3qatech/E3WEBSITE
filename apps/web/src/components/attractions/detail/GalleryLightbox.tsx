'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Play, Grid, Film, Image as ImageIcon, Sparkles } from 'lucide-react';
import { formatLocalizedText } from '@/lib/utils';

interface GalleryItem {
  id: string;
  url: string;
  captionEn?: any;
  captionAr?: any;
}

// 3D Tilted Page Scroll Card Component
function TiltedGalleryCard({
  item,
  index,
  locale,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  locale: string;
  onOpen: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVideo = !!item.url.match(/\.(mp4|webm|mov)$/i);
  const isAr = locale === 'ar';

  const caption = isAr
    ? item.captionAr || item.captionEn || ''
    : item.captionEn || item.captionAr || '';
  const formattedCaption = formatLocalizedText(caption, locale);

  // Scroll Progress relative to this specific card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  // Tilted Page Scroll 3D physics:
  // 1. As card enters from bottom: tilted forward at 28deg, scale 0.88, opacity 0.75
  // 2. As card reaches center: perfectly flat (0deg), scale 1.0, opacity 1.0
  // 3. As card exits top: tilted backward at -18deg, scale 0.94
  const rawRotateX = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [28, 0, 0, -18]);
  const rawScale = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [0.88, 1, 1, 0.94]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.75, 1, 1, 0.85]);

  // Smooth springs for fluid frame rate
  const rotateX = useSpring(rawRotateX, { stiffness: 120, damping: 20 });
  const scale = useSpring(rawScale, { stiffness: 120, damping: 20 });
  const opacity = useSpring(rawOpacity, { stiffness: 120, damping: 20 });

  // Interactive mouse tilt sheen
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.04);
    mouseY.set(-y * 0.04);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      className="perspective-1000 w-full"
      style={{ perspective: '1200px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          transformStyle: 'preserve-3d',
        }}
        onClick={onOpen}
        className="group relative w-full aspect-[16/11] rounded-[2rem] overflow-hidden bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/60 shadow-2xl hover:shadow-[0_25px_60px_-15px_rgba(16,185,129,0.3)] transition-colors duration-500 cursor-pointer select-none"
      >
        {/* Media (Image or Video Thumbnail) */}
        {isVideo ? (
          <div className="absolute inset-0 w-full h-full bg-black">
            <video
              src={item.url}
              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
              muted
              playsInline
              loop
            />
            {/* Play Badge Icon */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center backdrop-blur-md shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 fill-current ps-0.5" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={item.url}
            alt={formattedCaption || `Gallery Item ${index + 1}`}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
            loading="lazy"
          />
        )}

        {/* 3D Sheen Highlight on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

        {/* Bottom Caption Pill / Fullscreen Trigger */}
        <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {formattedCaption ? (
            <span className="text-xs font-semibold text-white drop-shadow-md line-clamp-1 max-w-[85%]">
              {formattedCaption}
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
              {isVideo ? (isAr ? 'فيديو تفاعلي' : 'VIDEO') : (isAr ? 'صورة عالية الدقة' : 'MOMENT')}
            </span>
          )}

          <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300 shrink-0">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function GalleryLightbox({ items, locale = 'en' }: { items: GalleryItem[]; locale?: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PHOTOS' | 'VIDEOS'>('ALL');
  const [showAll, setShowAll] = useState(false);

  if (!items || items.length === 0) return null;

  const isAr = locale === 'ar';
  const isVideo = (url: string) => !!url.match(/\.(mp4|webm|mov)$/i);

  const filteredItems = items.filter((item) => {
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
    <section className="py-28 bg-[var(--bg-level-1)] text-[var(--text-primary)] relative border-t border-[var(--border-level-2)] overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Ambient background glow */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] bg-emerald-500/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 space-y-14 relative z-10">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[var(--border-level-2)] pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'المعرض المرئي للتجربة' : 'MEDIA GALLERY'}</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
              {isAr ? 'لحظات وذكريات خالدة' : 'Captured Moments'}
            </h2>
          </div>

          {/* Filter Switcher Tabs Container */}
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] shadow-md">
            <button
              onClick={() => {
                setFilter('ALL');
                setShowAll(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{isAr ? 'الكل' : 'All'} ({items.length})</span>
            </button>

            <button
              onClick={() => {
                setFilter('PHOTOS');
                setShowAll(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
                filter === 'PHOTOS'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isAr ? 'الصور' : 'Photos'} ({items.filter((i) => !isVideo(i.url)).length})</span>
            </button>

            <button
              onClick={() => {
                setFilter('VIDEOS');
                setShowAll(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
                filter === 'VIDEOS'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{isAr ? 'الفيديوهات' : 'Videos'} ({items.filter((i) => isVideo(i.url)).length})</span>
            </button>
          </div>
        </div>

        {/* 3D Tilted Page Scroll Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {visibleItems.map((item, index) => (
            <TiltedGalleryCard
              key={item.id || index}
              item={item}
              index={index}
              locale={locale}
              onOpen={() => openLightbox(index)}
            />
          ))}
        </div>

        {/* Load More Trigger */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3.5 rounded-2xl bg-[var(--surface-hover)] hover:bg-emerald-500/20 border border-[var(--border-level-2)] hover:border-emerald-500/40 text-xs font-bold text-[var(--text-primary)] hover:text-emerald-500 uppercase tracking-widest transition-all shadow-md cursor-pointer"
            >
              {showAll
                ? (isAr ? 'عرض أقل' : 'Show Less')
                : (isAr ? `عرض باقي المعرض (+${filteredItems.length - initialCount})` : `Show All Moments (+${filteredItems.length - initialCount})`)}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={closeLightbox}
          >
            {/* Top Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 end-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 cursor-pointer"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute start-4 md:start-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 cursor-pointer"
                  title={isAr ? 'السابق' : 'Previous'}
                >
                  <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute end-4 md:end-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 cursor-pointer"
                  title={isAr ? 'التالي' : 'Next'}
                >
                  <ChevronRight className="w-6 h-6 rtl:rotate-180" />
                </button>
              </>
            )}

            {/* Media Content */}
            <motion.div
              key={currentItem.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo(currentItem.url) ? (
                <video
                  src={currentItem.url}
                  className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={currentItem.url}
                  alt={formatLocalizedText(currentItem.captionEn || currentItem.captionAr, locale) || 'Gallery detail'}
                  className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
                />
              )}

              {(currentItem.captionEn || currentItem.captionAr) && (
                <div className="mt-4 text-center max-w-2xl px-4">
                  <p className="text-sm font-medium text-white/90">
                    {formatLocalizedText(isAr ? currentItem.captionAr || currentItem.captionEn : currentItem.captionEn || currentItem.captionAr, locale)}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
