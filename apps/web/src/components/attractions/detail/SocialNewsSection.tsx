'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Quote, Newspaper, ExternalLink } from 'lucide-react';

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
  const hasSocial = Array.isArray(socialPreviews) && socialPreviews.length > 0;
  const hasTestimonials = Array.isArray(testimonials) && testimonials.length > 0;
  const hasNews = Array.isArray(newsCoverage) && newsCoverage.length > 0;

  if (!hasSocial && !hasTestimonials && !hasNews) {
    return null;
  }

  return (
    <section className="py-24 bg-zinc-950 text-white border-t border-zinc-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black uppercase tracking-tight"
            >
              {locale === 'ar' ? 'الجميع يتحدث عنا' : 'Everyone is Talking'}
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              className="h-1 w-24 bg-emerald-500 mt-6"
              style={{ transformOrigin: locale === 'ar' ? 'right' : 'left' }}
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-8 hide-scrollbar cursor-grab active:cursor-grabbing">
        <div className="flex gap-6 px-6 md:px-12 w-max mx-auto md:mx-0">
          
          {/* Social Previews */}
          {hasSocial && socialPreviews.map((social, idx) => (
            <motion.a
              href={social.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              key={`social-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="block w-80 md:w-96 shrink-0 bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors group relative"
            >
              {(social.imageUrl || (social as any).image) ? (
                <div className="h-48 w-full bg-zinc-800 relative overflow-hidden">
                  <img 
                    src={social.imageUrl || (social as any).image} 
                    alt={social.title || 'Social preview'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 end-4 bg-zinc-950/60 backdrop-blur-md p-2 rounded-full">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-zinc-800 to-zinc-900 relative flex items-center justify-center">
                  <MessageCircle className="w-12 h-12 text-zinc-700" />
                  <div className="absolute top-4 end-4 bg-zinc-950/60 backdrop-blur-md p-2 rounded-full">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{social.title || 'Check this out'}</h3>
                {social.snippet && <p className="text-zinc-400 text-sm line-clamp-3 mb-4">{social.snippet}</p>}
                {social.platform && (
                  <span className="inline-block px-3 py-1 bg-zinc-800 text-xs font-bold uppercase tracking-wider rounded-md text-zinc-300">
                    {social.platform}
                  </span>
                )}
              </div>
            </motion.a>
          ))}

          {/* Testimonials */}
          {hasTestimonials && testimonials.map((testimonial, idx) => (
            <motion.div
              key={`test-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (hasSocial ? socialPreviews.length : 0) * 0.1 + idx * 0.1 }}
              className="w-80 md:w-96 shrink-0 bg-zinc-900 rounded-3xl p-8 border border-zinc-800 flex flex-col justify-between"
            >
              <div>
                <Quote className="w-10 h-10 text-emerald-500 mb-6 opacity-50" />
                <p className="text-lg md:text-xl font-medium leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-lg">{testimonial.author?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <h4 className="font-bold">{testimonial.author || 'Visitor'}</h4>
                  {testimonial.source && <p className="text-sm text-zinc-500">{testimonial.source}</p>}
                </div>
              </div>
            </motion.div>
          ))}

          {/* News Coverage */}
          {hasNews && newsCoverage.map((news, idx) => (
            <motion.a
              href={news.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              key={`news-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: ((hasSocial ? socialPreviews.length : 0) + (hasTestimonials ? testimonials.length : 0)) * 0.1 + idx * 0.1 }}
              className="block w-80 md:w-96 shrink-0 bg-emerald-950 rounded-3xl p-8 border border-emerald-900/50 hover:border-emerald-500/50 transition-colors group relative"
            >
              <div className="absolute top-6 end-6">
                <ExternalLink className="w-5 h-5 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
              </div>
              <Newspaper className="w-10 h-10 text-emerald-500 mb-6" />
              {news.date && <p className="text-emerald-500/80 text-sm font-mono mb-4">{news.date}</p>}
              <h3 className="font-bold text-xl md:text-2xl mb-4 leading-tight">{news.title}</h3>
              {news.publisher && (
                <div className="inline-flex items-center gap-2 mt-auto">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold tracking-wider text-emerald-100">{news.publisher}</span>
                </div>
              )}
            </motion.a>
          ))}

        </div>
      </div>
      
      {/* Scroll Hint */}
      <div className="max-w-7xl mx-auto px-6 mt-4 flex justify-end md:hidden">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Swipe to explore →</p>
      </div>
    </section>
  );
}
