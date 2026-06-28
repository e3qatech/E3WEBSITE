'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface GalleryItem {
  id: string;
  url: string;
  captionEn?: string | null;
}

export function GalleryLightbox({ items }: { items: GalleryItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    }
  };

  return (
    <section className="py-32 bg-black relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Captured Moments
          </h2>
          <p className="text-xl text-zinc-400 font-light">Immerse yourself in the experience</p>
        </motion.div>

        {/* CSS Columns Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (idx % 3) * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative group cursor-pointer overflow-hidden rounded-[2rem] break-inside-avoid border border-white/5 shadow-2xl"
              onClick={() => openLightbox(idx)}
            >
              {/* Media Rendering */}
              {item.url.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={item.url}
                  className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-105"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.captionEn || `Gallery Image ${idx + 1}`}
                  className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                {item.url.match(/\.(mp4|webm|mov)$/i) ? (
                  <div className="w-16 h-16 rounded-full border border-white/30 bg-black/50 backdrop-blur-md flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-500">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full border border-white/30 bg-black/50 backdrop-blur-md flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-500">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-8 right-8 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 z-50 hover:rotate-90"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Previous Button */}
            <button
              onClick={prevImage}
              className="absolute left-8 p-5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 z-50 hover:-translate-x-1"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Current Image */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-6xl aspect-video mx-24 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {items[selectedIndex].url.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={items[selectedIndex].url}
                  className="w-full h-full object-contain bg-black"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="relative w-full h-full bg-black">
                  <Image
                    src={items[selectedIndex].url}
                    alt={items[selectedIndex].captionEn || `Gallery Image ${selectedIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </div>
              )}
              {items[selectedIndex].captionEn && (
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <p className="text-white text-xl text-center font-light tracking-wide">
                    {items[selectedIndex].captionEn}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Next Button */}
            <button
              onClick={nextImage}
              className="absolute right-8 p-5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 z-50 hover:translate-x-1"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            
            {/* Counter */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white font-mono tracking-[0.3em] text-xs">
              {selectedIndex + 1} / {items.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
