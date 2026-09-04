"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  ExternalLink, 
  X, 
  Sparkles, 
  Video,
  Globe,
  ArrowRight
} from 'lucide-react';

interface SocialFeedProps {
  feedId: string;
  locale?: string;
  attractionId?: string;
  brandId?: string;
  limit?: number;
  layoutOverride?: 'GRID' | 'MASONRY' | 'CAROUSEL' | 'FEATURED_HERO';
  className?: string;
}

export function SocialFeed({
  feedId,
  locale = 'en',
  attractionId,
  brandId,
  limit,
  layoutOverride,
  className = '',
}: SocialFeedProps) {
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(true);
  const [feedConfig, setFeedConfig] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [lightboxPost, setLightboxPost] = useState<any | null>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        const query = new URLSearchParams({
          locale,
          ...(attractionId ? { attractionId } : {}),
          ...(brandId ? { brandId } : {}),
          ...(limit ? { limit: String(limit) } : {}),
        });

        const res = await fetch(`/api/social-media/feeds/${feedId}?${query.toString()}`);
        const json = await res.json();

        if (res.ok && json.success && json.data) {
          setFeedConfig(json.data.feed);
          setPosts(json.data.posts || []);
        }
      } catch (err) {
        console.error('[SOCIAL_FEED_LOAD_ERROR]', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [feedId, locale, attractionId, brandId, limit]);

  if (loading) {
    return (
      <div className={`py-12 space-y-6 ${className}`}>
        <div className="h-8 bg-slate-800/50 rounded-xl w-48 animate-pulse mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="aspect-[4/5] bg-slate-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!feedConfig || posts.length === 0) {
    return (
      <div className={`py-12 text-center text-slate-400 text-xs ${className}`}>
        {feedConfig?.emptyStateText || (isAr ? 'لا تتوفر منشورات تواصل حالياً.' : 'No social posts available at the moment.')}
      </div>
    );
  }

  const layout = layoutOverride || feedConfig.layout || 'GRID';

  const getPlatformIcon = (provider: string) => {
    switch (provider) {
      case 'META_INSTAGRAM': return <Share2 className="w-3.5 h-3.5 text-pink-400" />;
      case 'META_FACEBOOK': return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case 'YOUTUBE': return <Video className="w-3.5 h-3.5 text-red-500" />;
      default: return <Share2 className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className={`space-y-8 ${className}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Grid or Masonry Layout */}
      {(layout === 'GRID' || layout === 'MASONRY') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              onClick={() => setLightboxPost(post)}
              onMouseEnter={() => setActiveVideoId(post.id)}
              onMouseLeave={() => setActiveVideoId(null)}
              className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-purple-500/20 shadow-xl hover:border-purple-500/60 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                {post.mediaType === 'VIDEO' || post.mediaType === 'REEL' ? (
                  <video
                    src={post.mediaUrl}
                    poster={post.thumbnailUrl}
                    muted
                    loop
                    playsInline
                    autoPlay={activeVideoId === post.id}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={post.mediaUrl || post.thumbnailUrl}
                    alt={post.caption || 'E3 Social Post'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Top Badge */}
                {feedConfig.showPlatformBadge && (
                  <div className="absolute top-3.5 start-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-purple-500/30 text-white text-[10px] font-bold">
                    {getPlatformIcon(post.provider)}
                    <span className="uppercase tracking-wider">{post.provider.replace('META_', '')}</span>
                  </div>
                )}

                {/* Caption Overlay */}
                <div className="absolute bottom-4 start-4 end-4 space-y-2">
                  {feedConfig.showAccountName && (
                    <div className="flex items-center gap-2">
                      <img
                        src={post.authorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                        alt={post.authorName}
                        className="w-6 h-6 rounded-full object-cover border border-purple-400/40"
                      />
                      <span className="text-xs font-bold text-white tracking-wide">{post.authorName}</span>
                    </div>
                  )}

                  {feedConfig.showCaptions && post.caption && (
                    <p className="text-xs text-slate-200 font-light line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>
                  )}

                  {feedConfig.showEngagement && (
                    <div className="flex items-center gap-4 text-[11px] font-mono text-pink-400 pt-1">
                      {post.likeCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-pink-400/20" />
                          <span>{post.likeCount}</span>
                        </span>
                      )}
                      {post.commentCount > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{post.commentCount}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Follow CTA Bar */}
      {feedConfig.enableFollowCta && (
        <div className="flex items-center justify-center pt-4">
          <a
            href="https://instagram.com/e3qatar"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300/20" />
            <span>{feedConfig.followCtaText}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
          </a>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPost(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-slate-900 border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4"
            >
              <button
                onClick={() => setLightboxPost(null)}
                className="absolute top-4 end-4 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
                {lightboxPost.mediaType === 'VIDEO' || lightboxPost.mediaType === 'REEL' ? (
                  <video src={lightboxPost.mediaUrl} controls autoPlay className="w-full max-h-[60vh] object-contain" />
                ) : (
                  <img src={lightboxPost.mediaUrl} alt="Post" className="w-full max-h-[60vh] object-contain" />
                )}
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={lightboxPost.authorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                      alt={lightboxPost.authorName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{lightboxPost.authorName}</h4>
                      <p className="text-[10px] text-slate-400">@{lightboxPost.authorUsername}</p>
                    </div>
                  </div>

                  <a
                    href={lightboxPost.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-pink-400 font-bold hover:underline"
                  >
                    <span>View Original Post</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-200 font-light leading-relaxed">{lightboxPost.caption}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
