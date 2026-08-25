'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Newspaper, Star, Sparkles, Globe, Share2 } from 'lucide-react';

interface SocialPreview {
  platform?: string;
  url?: string;
  imageUrl?: string;
  title?: string;
  snippet?: string;
}

interface Testimonial {
  author?: string;
  quote?: string;
  rating?: number;
  source?: string;
}

interface NewsCoverage {
  publisher?: string;
  title?: string;
  url?: string;
  date?: string;
}

interface SocialNewsSectionProps {
  socialPreviews?: SocialPreview[] | null;
  testimonials?: Testimonial[] | null;
  newsCoverage?: NewsCoverage[] | null;
  locale?: string;
}

export function SocialNewsSection({
  socialPreviews,
  testimonials,
  newsCoverage,
  locale = 'en'
}: SocialNewsSectionProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'SOCIAL' | 'REVIEWS' | 'NEWS'>('ALL');
  const isAr = locale === 'ar';

  const activeSocial = (Array.isArray(socialPreviews) && socialPreviews.length > 0)
    ? socialPreviews.filter(s => s && (s.url || s.imageUrl || s.title) && !s.url?.includes('example.com'))
    : [];

  const activeTestimonials = (Array.isArray(testimonials) && testimonials.length > 0)
    ? testimonials.filter(t => t && t.quote && t.author && !t.quote.toLowerCase().includes('demo quote') && !t.author.toLowerCase().includes('placeholder'))
    : [];

  const activeNews = (Array.isArray(newsCoverage) && newsCoverage.length > 0)
    ? newsCoverage.filter(n => n && n.title && n.url && n.url !== '#' && !n.url.includes('example.com') && !n.title.toLowerCase().includes('placeholder'))
    : [];

  if (activeSocial.length === 0 && activeTestimonials.length === 0 && activeNews.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-[var(--surface-default)] text-[var(--text-primary)] border-t border-[var(--border-level-2)] overflow-hidden relative" dir={isAr ? "rtl" : "ltr"}>
      {/* Background Subtle Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Header & Category Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border-level-2)] pb-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isAr ? "أصداء المجتمع والصحافة" : "SOCIAL PULSE & MEDIA HONORS"}</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[var(--text-primary)]">
              {isAr ? "الجميع يتحدث عن إي ثري" : "Everyone is Talking"}
            </h2>
          </div>

          {/* Filter Switcher */}
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-default)]/90 backdrop-blur-md border border-[var(--border-level-2)] shadow-md">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
                activeTab === 'ALL' ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
              }`}
            >
              {isAr ? "الكل" : "All Buzz"}
            </button>
            <button
              onClick={() => setActiveTab('REVIEWS')}
              className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
                activeTab === 'REVIEWS' ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
              }`}
            >
              {isAr ? "آراء الزوار" : "Visitor Quotes"}
            </button>
            <button
              onClick={() => setActiveTab('NEWS')}
              className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
                activeTab === 'NEWS' ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] font-bold'
              }`}
            >
              {isAr ? "الصحافة والإعلام" : "In the News"}
            </button>
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Visitor Testimonial Quotes */}
          {(activeTab === 'ALL' || activeTab === 'REVIEWS') && activeTestimonials.map((t, idx) => (
            <motion.div
              key={`testi-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-purple-500/40 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-lg transition-all hover:bg-[var(--surface-hover)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Quote className="w-8 h-8 text-purple-500 opacity-70" />
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-normal italic">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-level-2)] flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)]">{t.author}</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  {t.source || "VERIFIED VISITOR"}
                </span>
              </div>
            </motion.div>
          ))}

          {/* News Coverage Cards */}
          {(activeTab === 'ALL' || activeTab === 'NEWS') && activeNews.map((news, idx) => (
            <motion.a
              key={`news-${idx}`}
              href={news.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-emerald-500/40 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-lg transition-all hover:bg-[var(--surface-hover)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Newspaper className="w-7 h-7 text-emerald-500" />
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {news.publisher || "PRESS"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors leading-snug">
                  {news.title}
                </h3>
              </div>

              <div className="pt-4 border-t border-[var(--border-level-2)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
                <span>{news.date || "2026"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1 font-bold">
                  {isAr ? "قراءة المقال ↗" : "Read Article ↗"}
                </span>
              </div>
            </motion.a>
          ))}

          {/* Social Previews */}
          {(activeTab === 'ALL' || activeTab === 'SOCIAL') && activeSocial.map((social, idx) => {
            const platform = String(social.platform || 'INSTAGRAM').toUpperCase()
            const isInstagram = platform.includes('INSTAGRAM')
            const isTikTok = platform.includes('TIKTOK')
            const isYouTube = platform.includes('YOUTUBE')
            const isFacebook = platform.includes('FACEBOOK')

            return (
              <motion.a
                key={`social-${idx}`}
                href={social.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-purple-500/50 rounded-3xl p-7 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-lg transition-all hover:bg-[var(--surface-hover)] hover:shadow-2xl"
              >
                {social.imageUrl ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[var(--border-level-2)] relative bg-[var(--surface-hover)]">
                    <img src={social.imageUrl} alt={social.title || 'Social media'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 end-3 p-2 rounded-full bg-[var(--surface-default)]/80 backdrop-blur-md text-purple-400 shadow-md">
                      <Globe className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border shadow-sm ${
                      isInstagram ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' :
                      isTikTok ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                      isYouTube ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                      isFacebook ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                      'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    }`}>
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--surface-subtle)] border border-[var(--border-level-2)] text-[var(--text-secondary)]">
                      {platform}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-base group-hover:text-purple-400 transition-colors">
                    {social.title || social.url}
                  </h4>
                  {social.snippet ? (
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{social.snippet}</p>
                  ) : (
                    <p className="text-xs text-[var(--text-tertiary)] mt-1 font-mono">{social.url}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-[var(--border-level-2)] flex items-center justify-between text-xs text-purple-400 font-bold">
                  <span>{isAr ? "متابعة الحساب" : "Follow Channel"}</span>
                  <span>↗</span>
                </div>
              </motion.a>
            )
          })}

        </div>
      </div>
    </section>
  );
}
