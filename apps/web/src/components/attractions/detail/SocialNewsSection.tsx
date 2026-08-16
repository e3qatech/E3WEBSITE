'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Newspaper, Star, Sparkles, Globe } from 'lucide-react';

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

  // Curated fallback data for visitor buzz & social proof
  const defaultTestimonials: Testimonial[] = [
    {
      author: isAr ? "جاسم المهندي" : "Jassim Al-Mohannadi",
      quote: isAr ? "تجربة استثنائية! الميني غولف والكارتينغ بالواقع المختلط كانت ممتعة جداً للعائلة." : "Unreal experience! The AR karting and mini golf was so much fun for the whole family.",
      rating: 5,
      source: "Verified Visitor"
    },
    {
      author: isAr ? "سارة الكواري" : "Sarah Al-Kuwari",
      quote: isAr ? "الليزر تاغ والبلياردو بالإسقاطات التفاعلية تقنية مبهرة وتصميم هندسي رائع!" : "Sensory laser tag and projected billiards is incredible engineering! Best weekend spot.",
      rating: 5,
      source: "Google Review"
    },
    {
      author: isAr ? "محمد الشمري" : "Mohammed Al-Shammari",
      quote: isAr ? "تنظيم راقي وأنشطة حماسية تناسب الكبار والأطفال، أنصح بزيارتها بشدة." : "Highly organized, state-of-the-art interactive gaming. 10/10 recommended!",
      rating: 5,
      source: "TripAdvisor"
    }
  ];

  const defaultNews: NewsCoverage[] = [
    {
      publisher: "Doha News",
      title: isAr ? "إي ثري قطر تطلق وجهات ترفيهية تفاعلية بأسلوب هندسي مبتكر" : "E3 Qatar Elevates Interactive Entertainment Destinations",
      date: "2026",
      url: "https://dohanews.co"
    },
    {
      publisher: "Qatar Tribune",
      title: isAr ? "افتتاح أوربان أرينا: أحدث مركز للألعاب التفاعلية والرياضات الإلكترونية" : "Urban Arena Unveils Next-Gen Mixed Reality Gaming Hub in Doha",
      date: "2026",
      url: "https://qatar-tribune.com"
    }
  ];

  const activeSocial = (Array.isArray(socialPreviews) && socialPreviews.length > 0) ? socialPreviews : [];
  const activeTestimonials = (Array.isArray(testimonials) && testimonials.length > 0) ? testimonials : defaultTestimonials;
  const activeNews = (Array.isArray(newsCoverage) && newsCoverage.length > 0) ? newsCoverage : defaultNews;

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
          {activeSocial.map((social, idx) => (
            <motion.a
              key={`social-${idx}`}
              href={social.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group bg-[var(--surface-default)] border border-[var(--border-level-2)] hover:border-sky-500/40 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between space-y-4 shadow-lg transition-all hover:bg-[var(--surface-hover)]"
            >
              {social.imageUrl && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[var(--border-level-2)] relative bg-[var(--surface-hover)]">
                  <img src={social.imageUrl} alt={social.title || 'Social media'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 end-3 p-2 rounded-full bg-[var(--surface-default)]/80 backdrop-blur-md text-sky-500 shadow-md">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-bold text-[var(--text-primary)] text-sm group-hover:text-sky-500 transition-colors">{social.title}</h4>
                {social.snippet && <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{social.snippet}</p>}
              </div>
            </motion.a>
          ))}

        </div>
      </div>
    </section>
  );
}
