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
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
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
  }, [features]);

  // Filter features based on active category
  const filteredFeatures = React.useMemo(() => {
    if (!Array.isArray(features)) return [];
    if (selectedTrackSlug === 'ALL') return features;

    return features.filter(f => {
      const inTypes = Array.isArray(f.storyTypes) && f.storyTypes.some(st => st.slug === selectedTrackSlug);
      const inPrimarySlug = f.primaryStoryTrackSlug === selectedTrackSlug;
      const inSecondarySlugs = Array.isArray(f.secondaryStoryTrackSlugs) && f.secondaryStoryTrackSlugs.includes(selectedTrackSlug);
      return inTypes || inPrimarySlug || inSecondarySlugs;
    });
  }, [features, selectedTrackSlug]);

  const toggleCard = (id: string) => {
    setExpandedCardId(prev => (prev === id ? null : id));
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
                    "relative overflow-hidden group bg-[var(--surface-default)] border rounded-[2rem] flex flex-col justify-between transition-all duration-500 shadow-lg cursor-pointer select-none",
                    isCardExpanded
                      ? "border-emerald-500 shadow-2xl ring-2 ring-emerald-500/20 bg-[var(--surface-hover)]"
                      : "border-[var(--border-level-2)] hover:border-emerald-500/50 hover:shadow-2xl hover:bg-[var(--surface-hover)]"
                  )}
                  style={{ minHeight: "340px" }}
                >
                  {/* Clean Visual Background Image (Overlay fade removed on hover/active for full image clarity) */}
                  {feature.imageUrl ? (
                    <div className="absolute inset-0 z-0">
                      <img
                        src={feature.imageUrl}
                        alt={formattedTitle}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-700 ease-out",
                          isCardExpanded
                            ? "opacity-90 scale-105 filter-none"
                            : "opacity-75 group-hover:opacity-100 group-hover:scale-105"
                        )}
                      />
                      {/* Gradient scrim - subtle at top, dynamic at bottom for text contrast */}
                      <div
                        className={cn(
                          "absolute inset-0 transition-opacity duration-500 pointer-events-none",
                          isCardExpanded
                            ? "bg-gradient-to-t from-neutral-950/95 via-neutral-950/70 to-black/20"
                            : "bg-gradient-to-t from-neutral-950/90 via-neutral-950/40 to-black/20 group-hover:from-neutral-950/95 group-hover:via-neutral-950/60"
                        )}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-[var(--surface-default)] to-purple-950/20 z-0" />
                  )}

                  {/* Top Bar: Icon, Badges & Expand Indicator */}
                  <div className="relative z-10 p-6 sm:p-7 flex items-center justify-between gap-3">
                    <div className="p-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-emerald-400 group-hover:scale-110 group-hover:border-emerald-500/50 transition-all duration-300 shadow-sm shrink-0">
                      {feature.iconUrl ? (
                        <img src={feature.iconUrl} alt={formattedTitle} className="w-5 h-5 object-contain" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      {/* Primary Story Track Badge */}
                      {primaryTrack && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-purple-500/40 text-purple-300 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (primaryTrack as any).color || (primaryTrack as any).accentColor || '#a855f7' }} />
                          <span>{getStoryTrackLabel(primaryTrack, isAr)}</span>
                        </span>
                      )}

                      {/* Activity Type Badge */}
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-emerald-500/40 text-emerald-300 shadow-sm">
                        {getActivityTypeLabel(highlightType, isAr)}
                      </span>

                      {/* Expand Indicator Chevron Pill */}
                      <div className="p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white/80 group-hover:text-white transition-colors">
                        {isCardExpanded ? <Minus className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Content Area: Title (Always Visible) & Description (Revealed on Hover/Click) */}
                  <div className="relative z-10 p-6 sm:p-7 pt-0 mt-auto">
                    <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 group-hover:border-emerald-500/40 transition-all duration-500 space-y-2.5">
                      {/* Image Header / Title */}
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors leading-snug">
                          {formattedTitle}
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-flex items-center gap-0.5">
                          <span>{isCardExpanded ? (isAr ? "إغلاق" : "Close") : (isAr ? "تفاصيل" : "Details")}</span>
                          <ArrowUpRight className="w-3 h-3 ms-0.5" />
                        </span>
                      </div>

                      {/* Expandable Details Body (Shows on Click OR Hover) */}
                      <div
                        className={cn(
                          "transition-all duration-500 ease-out",
                          isCardExpanded
                            ? "max-h-96 opacity-100 mt-3 pt-3 border-t border-white/10 block"
                            : "max-h-0 opacity-0 overflow-hidden group-hover:max-h-96 group-hover:opacity-100 group-hover:mt-3 group-hover:pt-3 group-hover:border-t group-hover:border-white/10"
                        )}
                      >
                        {formattedDesc && (
                          <p className="text-sm text-neutral-200 leading-relaxed font-normal">
                            {formattedDesc}
                          </p>
                        )}

                        {secondaryTracks.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-3">
                            <span className="text-[10px] text-neutral-400 uppercase font-mono">{isAr ? "مسارات إضافية:" : "Additional Tracks:"}</span>
                            {secondaryTracks.map((st: any, sIdx: number) => (
                              <span
                                key={st.slug || sIdx}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30"
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
