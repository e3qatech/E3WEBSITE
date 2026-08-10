export interface SocialChannelRecord {
  id: string
  platform: 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'FACEBOOK' | 'LINKEDIN' | 'X'
  channelName: string
  handle: string
  profileUrl: string
  feedMode: 'OFFICIAL_API' | 'CURATED_CMS' | 'INDIVIDUAL_OEMBED' | 'MANUAL_MEDIA' | 'CACHED_FALLBACK'
  syncEnabled: boolean
  isVisible: boolean
  sortPriority: number
  ctaLabelEn?: string
  ctaLabelAr?: string
  lastSyncTime?: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED_TOKEN'
}

export interface SocialPostRecord {
  id: string
  platform: 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'FACEBOOK' | 'LINKEDIN' | 'X'
  postUrl: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL'
  mediaUrl: string
  posterUrl?: string
  captionEn: string
  captionAr: string
  originalCaption?: string
  platformPostId: string
  postDate: string
  isApproved: boolean
  isFeatured: boolean
  isVisible: boolean
  relatedBrandSlug?: string
  relatedAttractionSlug?: string
}

export const DEFAULT_SOCIAL_CHANNELS: SocialChannelRecord[] = [
  {
    id: "social-instagram-main",
    platform: "INSTAGRAM",
    channelName: "E3 Qatar Official Instagram",
    handle: "@e3qatar",
    profileUrl: "https://instagram.com/e3qatar",
    feedMode: "CURATED_CMS",
    syncEnabled: true,
    isVisible: true,
    sortPriority: 1,
    ctaLabelEn: "Follow @e3qatar on Instagram",
    ctaLabelAr: "تابع @e3qatar على إنستغرام",
    lastSyncTime: new Date().toISOString(),
    status: "CONNECTED"
  },
  {
    id: "social-youtube-main",
    platform: "YOUTUBE",
    channelName: "E3 Entertainment Worlds YouTube",
    handle: "@e3qatar_official",
    profileUrl: "https://youtube.com/@e3qatar_official",
    feedMode: "CURATED_CMS",
    syncEnabled: true,
    isVisible: true,
    sortPriority: 2,
    ctaLabelEn: "Subscribe to E3 YouTube",
    ctaLabelAr: "اشترك في قناة إي ثري على يوتيوب",
    lastSyncTime: new Date().toISOString(),
    status: "CONNECTED"
  },
  {
    id: "social-tiktok-main",
    platform: "TIKTOK",
    channelName: "E3 Qatar TikTok Channel",
    handle: "@e3.qatar",
    profileUrl: "https://tiktok.com/@e3.qatar",
    feedMode: "CURATED_CMS",
    syncEnabled: true,
    isVisible: true,
    sortPriority: 3,
    ctaLabelEn: "Watch E3 Moments on TikTok",
    ctaLabelAr: "شاهد لحظات إي ثري على تيك توك",
    lastSyncTime: new Date().toISOString(),
    status: "CONNECTED"
  }
]

export const DEFAULT_SOCIAL_POSTS: SocialPostRecord[] = [
  {
    id: "post-ig-01",
    platform: "INSTAGRAM",
    postUrl: "https://instagram.com/p/C_e3qatar1",
    mediaType: "VIDEO",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    captionEn: "Night lights glowing at Urban Arena Qatar! Who's ready for the weekend competition?",
    captionAr: "أضواء الساحة الحضرية تشتعل! من مستعد لمنافسات عطلة نهاية الأسبوع؟",
    platformPostId: "ig_12345",
    postDate: "2026-08-09T18:30:00Z",
    isApproved: true,
    isFeatured: true,
    isVisible: true,
    relatedAttractionSlug: "urban-arena"
  },
  {
    id: "post-ig-02",
    platform: "INSTAGRAM",
    postUrl: "https://instagram.com/p/C_e3qatar2",
    mediaType: "IMAGE",
    mediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop",
    captionEn: "Pure joy bouncing at InflataPark! Over 5,000 sqm of continuous obstacle courses.",
    captionAr: "بهجة غير محدودة في إنفلاتابارك! أكثر من ٥٠٠٠ متر مربع من الألعاب الهوائية.",
    platformPostId: "ig_67890",
    postDate: "2026-08-08T15:00:00Z",
    isApproved: true,
    isFeatured: true,
    isVisible: true,
    relatedAttractionSlug: "inflatapark"
  },
  {
    id: "post-yt-01",
    platform: "YOUTUBE",
    postUrl: "https://youtube.com/watch?v=e3qatar_highlights",
    mediaType: "VIDEO",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glowing-light-bulb-41525-large.mp4",
    posterUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop",
    captionEn: "Official Grand Opening Recap of Kids City Driving School in Doha Festival City.",
    captionAr: "الملخص الرسمي لافتتاح مدينة قيادة الأطفال في دوحة فستيفال سيتي.",
    platformPostId: "yt_99887",
    postDate: "2026-08-07T12:00:00Z",
    isApproved: true,
    isFeatured: true,
    isVisible: true,
    relatedAttractionSlug: "kids-driving-school"
  }
]
