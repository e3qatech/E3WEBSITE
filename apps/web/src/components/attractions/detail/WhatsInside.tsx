'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, ChevronUp, Sparkles, Plus, Minus, ArrowUpRight } from 'lucide-react';
import { formatLocalizedText, cn } from '@/lib/utils';

interface Feature {
  id?: string;
  icon?: string;
  iconUrl?: string;
  name?: string;
  nameEn?: string;
  nameAr?: string;
  title?: string;
  titleEn?: string;
  titleAr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  descEn?: string;
  descAr?: string;
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
  if (t === 'ACTIVITY') return isAr ? 'نشاط' : 'Activity';
  if (t === 'ZONE') return isAr ? 'منطقة' : 'Zone';
  if (t === 'SHOW') return isAr ? 'عرض' : 'Show';
  if (t === 'DINING') return isAr ? 'مأكولات' : 'Dining';
  if (t === 'RETAIL') return isAr ? 'متجر' : 'Retail';
  if (t === 'SERVICE') return isAr ? 'خدمة' : 'Service';
  if (t === 'DISCOVER') return isAr ? 'استكشف' : 'Discover';
  if (t === 'EXPERIENCE') return isAr ? 'تجربة' : 'Experience';
  return isAr ? 'نشاط' : (type || 'Activity');
};

export const getStoryTrackLabel = (track?: { slug?: string; titleEn?: string; titleAr?: string }, isAr: boolean = false): string => {
  if (!track) return isAr ? 'مسار' : 'Track';
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
    return track.titleAr || track.titleEn || 'مسار';
  }
  return track.titleEn || track.slug || 'Track';
};

export function WhatsInside({ description, features, imageUrl, locale = 'en' }: WhatsInsideProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>('ALL');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const isAr = locale === 'ar';

  const fullText = formatLocalizedText(description, locale) || '';
  const maxCharLimit = 220;
  const isLongText = fullText.length > maxCharLimit;

  const displayedText = (isLongText && !isExpanded)
    ? `${fullText.substring(0, maxCharLimit)}...`
    : fullText;

  // Deduplicate features defensively by title/name (or ID fallback) to prevent duplicate card rendering
  const uniqueFeatures = React.useMemo(() => {
    if (!Array.isArray(features)) return [];
    const seen = new Set<string>();
    return features.filter(f => {
      if (!f) return false;
      const key = (f.titleEn || f.nameEn || f.title || f.name || f.titleAr || f.nameAr || f.id || '').toLowerCase().trim();
      if (!key) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [features]);

  // Extract unique active story tracks
  const activeStoryTracks = React.useMemo(() => {
    if (!Array.isArray(uniqueFeatures)) return [];
    const trackMap = new Map<string, { slug: string; titleEn: string; titleAr: string; color?: string }>();

    uniqueFeatures.forEach(f => {
      if (Array.isArray(f.storyTypes) && f.storyTypes.length > 0) {
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
      if (f.primaryStoryTrackSlug && !trackMap.has(f.primaryStoryTrackSlug)) {
        trackMap.set(f.primaryStoryTrackSlug, {
          slug: f.primaryStoryTrackSlug,
          titleEn: f.primaryStoryTrackSlug,
          titleAr: f.primaryStoryTrackSlug,
          color: '#10b981'
        });
      }
    });

    return Array.from(trackMap.values());
  }, [uniqueFeatures]);

  // Filter features based on active category
  const filteredFeatures = React.useMemo(() => {
    if (!Array.isArray(uniqueFeatures)) return [];
    if (selectedTrackSlug === 'ALL') return uniqueFeatures;

    return uniqueFeatures.filter(f => {
      const inTypes = Array.isArray(f.storyTypes) && f.storyTypes.some(st => st.slug === selectedTrackSlug);
      const inPrimarySlug = f.primaryStoryTrackSlug === selectedTrackSlug;
      const inSecondarySlugs = Array.isArray(f.secondaryStoryTrackSlugs) && f.secondaryStoryTrackSlugs.includes(selectedTrackSlug);
      return inTypes || inPrimarySlug || inSecondarySlugs;
    });
  }, [uniqueFeatures, selectedTrackSlug]);

  const toggleCard = (id: string) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  return (
    <section id="whats-inside" className="py-20 md:py-28 bg-[var(--surface-default)] text-[var(--text-primary)] relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Glow */}
      <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-emerald-500/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12">
        {/* Intro Description & Media Stage */}
        <div className={`grid grid-cols-1 ${imageUrl ? 'lg:grid-cols-2' : ''} gap-10 lg:gap-16 items-center`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={`max-w-3xl ${imageUrl ? '' : 'mx-auto text-center'}`}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "نظرة شمولية على الوجهة" : "EXPERIENCE HIGHLIGHTS"}</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter leading-[0.95] text-[var(--text-primary)]">
              {isAr ? 'التجربة والمعالم' : "What's Inside"}
            </h2>

            {/* Expandable Text Container */}
            <div className="space-y-4">
              <p className="text-base md:text-xl text-[var(--text-secondary)] font-normal leading-relaxed transition-all duration-300">
                {displayedText}
              </p>

              {isLongText && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500/20 border border-[var(--border-level-2)] hover:border-emerald-500/40 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-all cursor-pointer shadow-sm"
                >
                  <span>{isExpanded ? (isAr ? "عرض أقل" : "Show Less") : (isAr ? "اقرأ المزيد" : "Read More")}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </motion.div>

          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-[var(--border-level-2)] group shadow-2xl bg-[var(--surface-hover)]"
            >
              <img src={imageUrl} alt={isAr ? "تفاصيل التجربة" : "What's inside"} className="absolute inset-0 w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-default)]/60 via-transparent to-transparent" />
            </motion.div>
          )}
        </div>

        {/* Experience Paths Filter Bar */}
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTrackSlug === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-level-2)]'
                }`}
              >
                <span>{isAr ? "كافة الأنشطة" : "All Activities"}</span>
                <span className={`text-[10px] font-mono px-1.5 rounded-md ${selectedTrackSlug === 'ALL' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'text-[var(--text-tertiary)]'}`}>
                  {uniqueFeatures?.length || 0}
                </span>
              </button>

              {activeStoryTracks.map(st => {
                const trackTitle = getStoryTrackLabel(st, isAr);
                const count = (uniqueFeatures || []).filter(f => (f.storyTypes || []).some(t => t.slug === st.slug)).length;
                const isActive = selectedTrackSlug === st.slug;

                return (
                  <button
                    key={st.slug}
                    type="button"
                    onClick={() => setSelectedTrackSlug(st.slug)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
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

        {/* Features Interactive Expandable Bento Grid */}
        {Array.isArray(filteredFeatures) && filteredFeatures.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature, idx) => {
              if (!feature) return null;

              const cardId = feature.id || `card-${idx}`;
              const isCardExpanded = expandedCardId === cardId;

              const iconName = feature.icon || 'Sparkles';
              const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Sparkles;

              const titleVal = isAr 
                ? (feature.nameAr || feature.titleAr || feature.nameEn || feature.titleEn || feature.title || feature.name || '')
                : (feature.nameEn || feature.titleEn || feature.title || feature.name || feature.nameAr || feature.titleAr || '');

              const descVal = isAr 
                ? (feature.descriptionAr || feature.descriptionEn || feature.description || feature.descAr || feature.descEn || '')
                : (feature.descriptionEn || feature.description || feature.descEn || feature.descriptionAr || feature.descAr || '');

              const formattedTitle = formatLocalizedText(titleVal, locale);
              const formattedDesc = formatLocalizedText(descVal, locale);
              const highlightType = feature.highlightType || "ACTIVITY";
              const primaryTrack = (feature.primaryStoryTypeId ? feature.storyTypes?.find(st => st.id === feature.primaryStoryTypeId) : null) ||
                (feature.primaryStoryTrackSlug ? (feature.storyTypes?.find(st => st.slug === feature.primaryStoryTrackSlug) || { slug: feature.primaryStoryTrackSlug, titleEn: feature.primaryStoryTrackSlug }) : null) ||
                feature.storyTypes?.[0] || null;
              const secondaryTracks = (feature.storyTypes?.filter(st => st.id !== (primaryTrack as any)?.id && st.slug !== primaryTrack?.slug) ||
                (Array.isArray(feature.secondaryStoryTrackSlugs) ? feature.secondaryStoryTrackSlugs.filter(s => s !== primaryTrack?.slug).map((s: string) => ({ slug: s, titleEn: s })) : [])).slice(0, 2);

              return (
                <div
                  key={cardId}
                  onClick={() => toggleCard(cardId)}
                  className={cn(
                    "relative overflow-hidden group bg-neutral-950 border rounded-3xl flex flex-col justify-between transition-all duration-500 shadow-md cursor-pointer select-none",
                    isCardExpanded
                      ? "border-emerald-500 shadow-2xl ring-2 ring-emerald-500/20"
                      : "border-[var(--border-level-2)] hover:border-emerald-500/50 hover:shadow-xl"
                  )}
                  style={{ minHeight: "310px" }}
                >
                  {/* Clean Visual Background Image - High Contrast & High Visibility */}
                  {feature.imageUrl ? (
                    <div className="absolute inset-0 z-0">
                      <img
                        src={feature.imageUrl}
                        alt={formattedTitle}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-700 ease-out",
                          isCardExpanded
                            ? "opacity-95 scale-105 filter-none"
                            : "opacity-85 group-hover:opacity-100 group-hover:scale-105"
                        )}
                      />
                      {/* Ultra-subtle bottom scrim so the image stays clear */}
                      <div
                        className={cn(
                          "absolute inset-0 transition-opacity duration-300 pointer-events-none",
                          isCardExpanded
                            ? "bg-gradient-to-t from-black/95 via-black/75 to-transparent"
                            : "bg-gradient-to-t from-black/85 via-black/35 to-transparent group-hover:from-black/90"
                        )}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-purple-950/30 z-0" />
                  )}

                  {/* Top Bar: Micro Badge Tags */}
                  <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                    <div className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-emerald-400 group-hover:scale-105 transition-transform duration-300 shadow-sm shrink-0">
                      {feature.iconUrl ? (
                        <img src={feature.iconUrl} alt={formattedTitle} className="w-4 h-4 object-contain" />
                      ) : (
                        <IconComponent className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      {primaryTrack && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-purple-500/40 text-purple-300 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (primaryTrack as any).color || (primaryTrack as any).accentColor || '#a855f7' }} />
                          <span>{getStoryTrackLabel(primaryTrack, isAr)}</span>
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-emerald-500/40 text-emerald-300 shadow-sm">
                        {getActivityTypeLabel(highlightType, isAr)}
                      </span>

                      <div className="p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white/80 group-hover:text-white transition-colors">
                        {isCardExpanded ? <Minus className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Content Area: Minimal Compact Title Box (Shows image clearly) */}
                  <div className="relative z-10 p-3.5 sm:p-4 pt-0 mt-auto">
                    <div className="bg-black/55 backdrop-blur-md rounded-xl p-3 sm:p-3.5 border border-white/10 group-hover:border-emerald-500/40 transition-all duration-300 space-y-1.5">
                      {/* Image Header / Title */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors leading-snug">
                          {formattedTitle}
                        </h3>
                        <span className="text-[9px] font-mono font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-flex items-center gap-0.5 shrink-0">
                          <span>{isCardExpanded ? (isAr ? "إغلاق" : "Close") : (isAr ? "تفاصيل" : "Details")}</span>
                          <ArrowUpRight className="w-2.5 h-2.5 ms-0.5" />
                        </span>
                      </div>

                      {/* Expandable Details Body (Revealed on Hover or Click) */}
                      <div
                        className={cn(
                          "transition-all duration-400 ease-out",
                          isCardExpanded
                            ? "max-h-80 opacity-100 mt-2 pt-2 border-t border-white/10 block"
                            : "max-h-0 opacity-0 overflow-hidden group-hover:max-h-80 group-hover:opacity-100 group-hover:mt-2 group-hover:pt-2 group-hover:border-t group-hover:border-white/10"
                        )}
                      >
                        {formattedDesc && (
                          <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
                            {formattedDesc}
                          </p>
                        )}

                        {secondaryTracks.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-2">
                            <span className="text-[9px] text-neutral-400 font-mono">{isAr ? "مسارات:" : "Tracks:"}</span>
                            {secondaryTracks.map((st: any, sIdx: number) => (
                              <span
                                key={st.slug || sIdx}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              >
                                {getStoryTrackLabel(st, isAr)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
