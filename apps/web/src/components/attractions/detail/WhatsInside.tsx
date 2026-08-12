'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { formatLocalizedText } from '@/lib/utils';

interface Feature {
  icon?: string;
  iconUrl?: string;
  title?: string;
  titleEn?: string;
  titleAr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  imageUrl?: string;
  highlightType?: string;
  linkedBrandId?: string;
  showBrandLogo?: boolean;
}

interface WhatsInsideProps {
  description: string;
  features?: Feature[] | null;
  imageUrl?: string | null;
  locale?: string;
}

export function WhatsInside({ description, features, imageUrl, locale = 'en' }: WhatsInsideProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  const isAr = locale === 'ar';

  return (
    <section className="py-32 md:py-48 bg-zinc-950 text-white relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Subtle Glow */}
      <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-emerald-900/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Intro Description & Image */}
        <div className={`grid grid-cols-1 ${imageUrl ? 'lg:grid-cols-2' : ''} gap-16 lg:gap-24 items-center mb-32`}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={`max-w-3xl ${imageUrl ? '' : 'mx-auto text-center'}`}
          >
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-3">
              {isAr ? "نظرة شمولية على الوجهة" : "EXPERIENCE HIGHLIGHTS"}
            </span>
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-[0.9]">
              {isAr ? 'التجربة والمعالم' : "What's Inside"}
            </h2>
            <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed">
              {formatLocalizedText(description, locale)}
            </p>
          </motion.div>

          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl"
            >
              <img src={imageUrl} alt={isAr ? "تفاصيل التجربة" : "What's inside"} className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </motion.div>
          )}
        </div>

        {/* Features Bento Grid */}
        {Array.isArray(features) && features.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, idx) => {
              if (!feature) return null;

              const iconName = feature.icon || 'Sparkles';
              const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
              const isLarge = idx === 0 && features.length % 2 !== 0;

              const titleVal = isAr 
                ? (feature.titleAr || feature.titleEn || feature.title || '')
                : (feature.titleEn || feature.title || feature.titleAr || '');

              const descVal = isAr 
                ? (feature.descriptionAr || feature.descriptionEn || feature.description || '')
                : (feature.descriptionEn || feature.description || feature.descriptionAr || '');

              const formattedTitle = formatLocalizedText(titleVal, locale);
              const formattedDesc = formatLocalizedText(descVal, locale);
              const highlightType = feature.highlightType || "ACTIVITY";

              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`relative overflow-hidden group bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2rem] flex flex-col justify-end min-h-[320px] transition-all duration-700 hover:bg-white/[0.05] hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] ${isLarge ? 'md:col-span-2' : ''}`}
                >
                  {feature.imageUrl ? (
                    <div className="absolute inset-0">
                      <img src={feature.imageUrl} alt={formattedTitle} className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-105 transition-all duration-1000 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    </div>
                  ) : null}

                  <div className="relative p-8 z-10 flex-1 flex flex-col justify-between">
                    {/* Header Icon & Highlight Badge */}
                    <div className="flex items-center justify-between gap-4 mb-12">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 backdrop-blur-md group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-500 ease-out">
                        {feature.iconUrl ? (
                          <img src={feature.iconUrl} alt={formattedTitle} className="w-6 h-6 object-contain" />
                        ) : (
                          <IconComponent className="w-6 h-6" />
                        )}
                      </div>

                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-950/80 border border-emerald-500/30 text-emerald-300 backdrop-blur-md">
                        {highlightType}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="transform group-hover:-translate-y-1 transition-transform duration-500 ease-out">
                      <h3 className="text-2xl font-bold mb-3 tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                        {formattedTitle}
                      </h3>
                      <p className="text-zinc-300 text-sm leading-relaxed font-light group-hover:text-zinc-100 transition-colors duration-500">
                        {formattedDesc}
                      </p>
                    </div>
                  </div>

                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
