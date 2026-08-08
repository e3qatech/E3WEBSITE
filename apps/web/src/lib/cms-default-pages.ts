/**
 * Default Content seeds for CMS Pages.
 * Prevents form clearing / empty text inputs on cold starts, empty DBs, or deployments.
 */

export const DEFAULT_B2C_LANDING_CONTENT = {
  hero: {
    mediaType: "VIDEO",
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    headerEn: "E3 PULSE MASKED WORLDS",
    headerAr: "استكشف عالم إي ثري الترفيهي",
    subHeaderEn: "Qatar premier immersive attractions and kinetic entertainment.",
    subHeaderAr: "تجارب ترفيهية غامرة ومدن ألعاب فضائية في قطر",
    showSearch: true,
  },
  maskedVideo: {
    enabled: true,
    defaultPortal: "customer",
    preset: "ORGANIC_WINDOW",
    rendererMode: "STANDARD",
    scale: 1,
    positionX: 0,
    positionY: 0,
    edgeSoftness: 12,
    distortionAmount: 0,
    idleBreathe: true,
    cursorResponse: true,
    customSvgMask: "",
    customerDesktopVideo: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    customerMobileVideo: "",
    customerPoster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    customerFallbackImage: "",
    customerMaskPreset: "ORGANIC_WINDOW",
    customerAccent: "#10b981",
    customerAltEn: "E3 Pulse Customer Attractions Video",
    customerAltAr: "فيديو تجارب زوار إي ثري الترفيهية",
    organizerDesktopVideo: "https://assets.mixkit.co/videos/preview/mixkit-laser-lights-in-a-stage-show-41551-large.mp4",
    organizerMobileVideo: "",
    organizerPoster: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop",
    organizerFallbackImage: "",
    organizerMaskPreset: "PORTAL_ARCH",
    organizerAccent: "#3b82f6",
    organizerAltEn: "E3 Atelier Event Engineering Video",
    organizerAltAr: "فيديو هندسة وإنتاج الفعاليات",
  },
  featuredTitleEn: "FEATURED EXPERIENCES & ATTRACTIONS",
  featuredTitleAr: "التجارب والوجهات المميزة",
  gridTitleEn: "EXPLORE ALL QATAR ATTRACTIONS",
  gridTitleAr: "استكشف جميع الوجهات الترفيهية",
  subscribe: {
    titleEn: "JOIN THE E3 PULSE INSIDERS",
    titleAr: "انضم إلى النشرة البريدية لـ إي ثري",
    subtitleEn: "Get exclusive access to VIP attraction launches, secret pop-ups, and early ticket drops.",
    subtitleAr: "احصل على وصول حصري لإطلاق الوجهات الجديدة وتذاكر الفعاليات القادمة.",
  },
  cta: {
    titleEn: "READY TO EXPERIENCE E3 QATAR?",
    titleAr: "هل أنت مستعد لخوض تجربة إي ثري؟",
    buttonTextEn: "EXPLORE ALL ATTRACTIONS",
    buttonTextAr: "استكشف كافة الوجهات",
    buttonUrl: "/b2c/attractions",
  },
  careersCta: {
    titleEn: "SHAPE THE FUTURE OF ENTERTAINMENT",
    titleAr: "صمّم مستقبل الترفيه والفعاليات معنا",
    subtitleEn: "Join the E3 creative, technology, and production engineering team in Qatar.",
    subtitleAr: "انضم لفريق الهندسة والإنتاج والتكنولوجيا في قطر.",
    buttonTextEn: "EXPLORE CAREERS",
    buttonTextAr: "استكشف الوظائف المتاحة",
    buttonUrl: "/careers",
  },
  motion: {
    motionEnabled: true,
    motionPreset: "MEDIA_CINEMATIC",
    motionIntensity: "MEDIUM",
    heroSceneType: "CINEMATIC_MEDIA",
    particleDensity: 50,
    ctaEmphasisStyle: "SHIMMER",
  },
  portalSwitcher: {
    customerLabelEn: "Customer",
    customerLabelAr: "الزائر",
    organizerLabelEn: "Organizer",
    organizerLabelAr: "المنظّم",
    customerUrl: "/b2c",
    organizerUrl: "/b2b",
    organizerLoginLabelEn: "Organizer Login",
    organizerLoginLabelAr: "تسجيل دخول المنظم",
    organizerLoginUrl: "/login/business",
    switcherVisible: true,
    organizerLoginVisible: true,
  },
  faqs: [
    {
      questionEn: "How do I book tickets for E3 attractions?",
      questionAr: "كيف يمكنني حجز تذاكر تجارب إي ثري؟",
      answerEn: "You can easily browse all attractions on this portal and click 'Book Tickets' to purchase digital passes directly.",
      answerAr: "يمكنك تصفح جميع الوجهات في البوابة والضغط على 'احجز التذاكر' لشراء التذاكر الرقمية فوراً.",
    },
    {
      questionEn: "Are attractions suitable for families and kids?",
      questionAr: "هل الوجهات مناسبة للعائلات والأطفال؟",
      answerEn: "Yes! E3 Qatar provides experiences designed for all age groups, including dedicated family zones and immersive kids areas.",
      answerAr: "نعم! توفر إي ثري قطر تجارب مصممة لجميع الفئات العمرية بما في ذلك مناطق عائلية ومناطق أطفال مخصصة.",
    }
  ],
  footer: {
    mediaType: "IMAGE",
    mediaUrl: "",
  }
};

/**
 * Deeply merges target object with default fallback values.
 * Keeps user-provided values if non-empty, otherwise falls back to defaults.
 */
export function getMergedCMSPageContent(slug: string, rawContent?: any) {
  if (slug !== 'b2c-landing') return rawContent || {};

  const defaults = DEFAULT_B2C_LANDING_CONTENT;
  const raw = rawContent || {};

  return {
    ...defaults,
    ...raw,
    hero: {
      ...defaults.hero,
      ...(raw.hero || {}),
    },
    maskedVideo: {
      ...defaults.maskedVideo,
      ...(raw.maskedVideo || {}),
    },
    featuredTitleEn: raw.featuredTitleEn ?? defaults.featuredTitleEn,
    featuredTitleAr: raw.featuredTitleAr ?? defaults.featuredTitleAr,
    gridTitleEn: raw.gridTitleEn ?? defaults.gridTitleEn,
    gridTitleAr: raw.gridTitleAr ?? defaults.gridTitleAr,
    subscribe: {
      ...defaults.subscribe,
      ...(raw.subscribe || {}),
    },
    cta: {
      ...defaults.cta,
      ...(raw.cta || {}),
    },
    careersCta: {
      ...defaults.careersCta,
      ...(raw.careersCta || {}),
    },
    portalSwitcher: {
      ...defaults.portalSwitcher,
      ...(raw.portalSwitcher || {}),
    },
    faqs: (raw.faqs && raw.faqs.length > 0) ? raw.faqs : defaults.faqs,
  };
}
