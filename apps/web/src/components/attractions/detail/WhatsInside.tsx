'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { formatLocalizedText } from '@/lib/utils';

interface Feature {
  id?: string;
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
  primaryStoryTypeId?: string;
  secondaryStoryTypeIds?: string[];
  primaryStoryTrackSlug?: string;
  secondaryStoryTrackSlugs?: string[];
  storyTypeIds?: string[];
  storyTypes?: Array<{
    id?: string;
    slug: string;
    titleEn: string;
    titleAr?: string;
    color?: string;
    accentColor?: string;
  }>;
}

interface WhatsInsideProps {
  description: string;
  features?: Feature[] | null;
  imageUrl?: string | null;
  locale?: string;
}

export const getActivityTypeLabel = (type?: string, isAr: boolean = false): string => {
  const t = (type || 'ACTIVITY').toUpperCase().trim();
  if (t === 'ACTIVITY') return isAr ? 'نشاط تفاعلي' : 'Activity';
  if (t === 'ZONE') return isAr ? 'منطقة ذات طابع' : 'Themed Zone';
  if (t === 'SHOW') return isAr ? 'عرض ترفيهي' : 'Show';
  if (t === 'DINING') return isAr ? 'مأكولات ومشروبات' : 'Dining';
  if (t === 'RETAIL') return isAr ? 'متجر وهدايا' : 'Retail';
  if (t === 'SERVICE') return isAr ? 'خدمة الزوار' : 'Service';
  if (t === 'DISCOVER') return isAr ? 'استكشف' : 'Discover';
  if (t === 'EXPERIENCE') return isAr ? 'تجربة تفاعلية' : 'Experience';
  return isAr ? 'نشاط تفاعلي' : (type || 'Activity');
};

export const getStoryTrackLabel = (track?: { slug?: string; titleEn?: string; titleAr?: string }, isAr: boolean = false): string => {
  if (!track) return isAr ? 'مسار تجربة' : 'Experience Track';
  if (isAr) {
    if (track.titleAr && track.titleAr.trim() && !/^[A-Za-z0-9\s-_]+$/.test(track.titleAr.trim())) {
      return track.titleAr.trim();
    }
    const s = (track.slug || track.titleEn || '').toLowerCase().trim();
    if (s === 'compete' || s.includes('compete')) return 'تنافس';
    if (s === 'drive' || s.includes('drive')) return 'قيادة';
    if (s === 'explore' || s.includes('explore')) return 'استكشاف';
    if (s === 'learn' || s.includes('learn')) return 'تعلم';
    if (s === 'create' || s.includes('create')) return 'إبداع';
    if (s === 'chill' || s.includes('chill')) return 'استرخاء';
    return track.titleAr || track.titleEn || 'مسار تجربة';
  }
  return track.titleEn || track.slug || 'Track';
};

export function WhatsInside({ description, features, imageUrl, locale = 'en' }: WhatsInsideProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>('ALL');
  const isAr = locale === 'ar';

  const fullText = formatLocalizedText(description, locale) || '';
  const maxCharLimit = 220;
  const isLongText = fullText.length > maxCharLimit;

  const displayedText = (isLongText && !isExpanded)
    ? `${fullText.substring(0, maxCharLimit)}...`
    : fullText;

  // Extract unique active story tracks
  const activeStoryTracks = React.useMemo(() => {
    if (!Array.isArray(features)) return [];
    const trackMap = new Map<string, { slug: string; titleEn: string; titleAr: string; color?: string }>();

    features.forEach(f => {
      // 1. Relational or expanded storyTypes array
      if (Array.isArray(f.storyTypes)) {
        f.storyTypes.forEach(st => {
          if (st && st.slug && !trackMap.has(st.slug)) {
            trackMap.set(st.slug, {
              slug: st.slug,
              titleEn: st.titleEn || st.slug,
              titleAr: st.titleAr || st.titleEn || st.slug,
              color: st.accentColor || st.color || '#10b981'
            });
          }
        });
      }
      // 2. Direct slug fields
      if (f.primaryStoryTrackSlug && !trackMap.has(f.primaryStoryTrackSlug)) {
        trackMap.set(f.primaryStoryTrackSlug, {
          slug: f.primaryStoryTrackSlug,
          titleEn: f.primaryStoryTrackSlug.toUpperCase(),
          titleAr: f.primaryStoryTrackSlug,
          color: '#8b5cf6'
        });
      }
      if (Array.isArray(f.secondaryStoryTrackSlugs)) {
        f.secondaryStoryTrackSlugs.forEach((slug: string) => {
          if (slug && !trackMap.has(slug)) {
            trackMap.set(slug, {
              slug,
              titleEn: slug.toUpperCase(),
              titleAr: slug,
              color: '#3b82f6'
            });
          }
        });
      }
    });

    return Array.from(trackMap.values());
  }, [features]);

  const filteredFeatures = React.useMemo(() => {
    if (!Array.isArray(features)) return [];
    if (selectedTrackSlug === 'ALL') return features;

    return features.filter(f => {
      const types = f.storyTypes || [];
      const hasInTypes = types.some(st => st.slug === selectedTrackSlug);
      const hasInPrimary = f.primaryStoryTrackSlug === selectedTrackSlug || f.primaryStoryTypeId === selectedTrackSlug;
      const hasInSecondary = Array.isArray(f.secondaryStoryTrackSlugs) && f.secondaryStoryTrackSlugs.includes(selectedTrackSlug);
      const hasInIds = Array.isArray(f.storyTypeIds) && f.storyTypeIds.includes(selectedTrackSlug);
      return hasInTypes || hasInPrimary || hasInSecondary || hasInIds;
    });
  }, [features, selectedTrackSlug]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <section id="whats-inside" className="py-24 md:py-36 bg-[var(--surface-default)] text-[var(--text-primary)] relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Glow */}
      <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-emerald-500/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-16">
        {/* Intro Description & Media Stage */}
        <div className={`grid grid-cols-1 ${imageUrl ? 'lg:grid-cols-2' : ''} gap-12 lg:gap-20 items-center`}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`max-w-3xl ${imageUrl ? '' : 'mx-auto text-center'}`}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "نظرة شمولية على الوجهة" : "EXPERIENCE HIGHLIGHTS"}</span>
            </span>
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-[0.9] text-[var(--text-primary)]">
              {isAr ? 'التجربة والمعالم' : "What's Inside"}
            </h2>

            {/* Expandable Text Container */}
            <div className="space-y-4">
              <p className="text-lg md:text-2xl text-[var(--text-secondary)] font-normal leading-relaxed transition-all duration-300">
                {displayedText}
              </p>

              {isLongText && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500/20 border border-[var(--border-level-2)] hover:border-emerald-500/40 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-all cursor-pointer shadow-sm"
                >
                  <span>{isExpanded ? (isAr ? "عرض أقل" : "Show Less") : (isAr ? "اقرأ المزيد" : "Read More")}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          </motion.div>

          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-[var(--border-level-2)] group shadow-2xl bg-[var(--surface-hover)]"
            >
              <img src={imageUrl} alt={isAr ? "تفاصيل التجربة" : "What's inside"} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/80 via-transparent to-transparent" />
            </motion.div>
          )}
        </div>

        {/* Experience Paths Filter Bar (Only active tracks for this attraction) */}
        {activeStoryTracks.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[var(--border-level-2)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isAr ? "مسارات التجربة التفاعلية" : "Experience Paths"}</span>
              </div>
              <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                {isAr ? `${activeStoryTracks.length} مسارات استكشاف نشطة` : `${activeStoryTracks.length} Active Story Tracks`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedTrackSlug('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTrackSlug === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-level-2)]'
                }`}
              >
                <span>{isAr ? "كافة الأنشطة" : "All Activities"}</span>
                <span className={`text-[10px] font-mono px-1.5 rounded-md ${selectedTrackSlug === 'ALL' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'text-[var(--text-tertiary)]'}`}>
                  {features?.length || 0}
                </span>
              </button>

              {activeStoryTracks.map(st => {
                const trackTitle = getStoryTrackLabel(st, isAr);
                const count = (features || []).filter(f => (f.storyTypes || []).some(t => t.slug === st.slug)).length;
                const isActive = selectedTrackSlug === st.slug;

                return (
                  <button
                    key={st.slug}
                    type="button"
                    onClick={() => setSelectedTrackSlug(st.slug)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-level-2)]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color || '#10b981' }} />
                    <span>{trackTitle}</span>
                    <span className={`text-[10px] font-mono px-1.5 rounded-md ${isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'text-[var(--text-tertiary)]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Features Bento Grid */}
        {Array.isArray(filteredFeatures) && filteredFeatures.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredFeatures.map((feature, idx) => {
              if (!feature) return null;

              const iconName = feature.icon || 'Sparkles';
              const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
              const isLarge = idx === 0 && filteredFeatures.length % 2 !== 0 && selectedTrackSlug === 'ALL';

              const titleVal = isAr 
                ? (feature.titleAr || feature.titleEn || feature.title || '')
                : (feature.titleEn || feature.title || feature.titleAr || '');

              const descVal = isAr 
                ? (feature.descriptionAr || feature.descriptionEn || feature.description || '')
                : (feature.descriptionEn || feature.description || feature.descriptionAr || '');

              const formattedTitle = formatLocalizedText(titleVal, locale);
              const formattedDesc = formatLocalizedText(descVal, locale);
              const highlightType = feature.highlightType || "ACTIVITY";
              const primaryTrack = (feature.primaryStoryTypeId ? feature.storyTypes?.find(st => st.id === feature.primaryStoryTypeId) : null) ||
                (feature.primaryStoryTrackSlug ? (feature.storyTypes?.find(st => st.slug === feature.primaryStoryTrackSlug) || { slug: feature.primaryStoryTrackSlug, titleEn: feature.primaryStoryTrackSlug }) : null) ||
                feature.storyTypes?.[0] || null;
              const secondaryTracks = (feature.storyTypes?.filter(st => st.id !== (primaryTrack as any)?.id && st.slug !== primaryTrack?.slug) ||
                (Array.isArray(feature.secondaryStoryTrackSlugs) ? feature.secondaryStoryTrackSlugs.filter(s => s !== primaryTrack?.slug).map((s: string) => ({ slug: s, titleEn: s })) : [])).slice(0, 2);

              return (
                <motion.div
                  key={feature.id || idx}
                  variants={itemVariants}
                  className={`relative overflow-hidden group bg-[var(--surface-default)] border border-[var(--border-level-2)] rounded-[2rem] flex flex-col justify-between min-h-[320px] p-8 transition-all duration-700 hover:bg-[var(--surface-hover)] hover:border-emerald-500/40 hover:shadow-2xl ${isLarge ? 'md:col-span-2' : ''} shadow-md`}
                >
                  {feature.imageUrl ? (
                    <div className="absolute inset-0">
                      <img src={feature.imageUrl} alt={formattedTitle} className="w-full h-full object-cover opacity-25 group-hover:opacity-45 group-hover:scale-105 transition-all duration-1000 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)] via-[var(--surface-default)]/80 to-transparent" />
                    </div>
                  ) : null}

                  <div className="relative z-10 flex-1 flex flex-col justify-between space-y-8">
                    {/* Header Icon, Highlight Badge & Story Track Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-level-2)] text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-500 ease-out shadow-sm">
                        {feature.iconUrl ? (
                          <img src={feature.iconUrl} alt={formattedTitle} className="w-5 h-5 object-contain" />
                        ) : (
                          <IconComponent className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Primary Story Track Badge */}
                        {primaryTrack && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/15 border border-purple-500/40 text-purple-600 dark:text-purple-300 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (primaryTrack as any).color || (primaryTrack as any).accentColor || '#a855f7' }} />
                            <span>{getStoryTrackLabel(primaryTrack, isAr)}</span>
                          </span>
                        )}

                        {/* Secondary Supporting Track Chips (Max 2) */}
                        {secondaryTracks.map((st: any, sIdx: number) => (
                          <span
                            key={st.slug || sIdx}
                            className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-300/80 border border-purple-500/20"
                          >
                            {getStoryTrackLabel(st, isAr)}
                          </span>
                        ))}

                        {/* Activity Type Badge */}
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--surface-hover)] border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 shadow-sm">
                          {getActivityTypeLabel(highlightType, isAr)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="transform group-hover:-translate-y-1 transition-transform duration-500 ease-out">
                      <h3 className="text-2xl font-bold mb-3 tracking-tight text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                        {formattedTitle}
                      </h3>
                      <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-normal group-hover:text-[var(--text-primary)] transition-colors duration-500">
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
