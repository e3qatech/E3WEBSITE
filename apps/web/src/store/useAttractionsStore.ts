import { create } from 'zustand';
import { calculateDistance } from '@/lib/geoUtils';
import { getLiveTimingStatus } from '@/lib/timingUtils';

export type AttractionStatus = 'All' | 'Active Now' | 'Coming Soon' | 'Special Events' | 'Past';

export interface AttractionGallery {
  url: string;
}

export interface AttractionPricing {
  price: number;
  discount?: number | null;
  currency: string;
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  type?: string;
}

export interface AttractionSchedule {
  openTime: string;
  closeTime: string;
}

export interface LiveOccupancy {
  currentCount: number;
  maxCapacity: number;
}

export interface Attraction {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  taglineEn?: string | null;
  taglineAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isHidden: boolean;
  gallery: AttractionGallery[];
  pricing: AttractionPricing[];
  schedules: AttractionSchedule[];
  
  heroMediaType?: string;
  heroMediaUrl?: string | null;
  heroFallbackUrl?: string | null;
  heroThumbnailUrl?: string | null;
  
  mapUrl?: string | null;
  ticketingUrl?: string | null;
  
  features?: any | null;
  partnerOffers?: any | null;
  partners?: any | null;
  socialPreviews?: any | null;
  newsCoverage?: any | null;
  operations?: any | null;
  temporalStatus?: any | null;
  coordinates?: { lat: number; lng: number } | null;
  
  // Client-side enriched state
  liveOccupancy?: LiveOccupancy;
  computedStatus?: string;
  isSpecialEvent?: boolean;
  distanceKm?: number;
  timingStatus?: import('@/lib/timingUtils').TimingStatus;
}

export type SortMode = 'Recommended' | 'Distance' | 'PriceLowToHigh' | 'PriceHighToLow';

interface AttractionsState {
  attractions: Attraction[];
  featuredAttraction: Attraction | null;
  searchQuery: string;
  statusFilter: AttractionStatus;
  isLoading: boolean;
  userLocation: { lat: number, lng: number } | null;
  sortMode: SortMode;
  
  // Actions
  setAttractions: (attractions: Attraction[]) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: AttractionStatus) => void;
  updateOccupancy: (attractionId: string, currentCount: number, maxCapacity: number) => void;
  setUserLocation: (lat: number, lng: number) => void;
  setSortMode: (mode: SortMode) => void;
}

export const DEFAULT_FALLBACK_ATTRACTIONS: Attraction[] = [
  {
    id: "attraction-snow-park",
    slug: "snow-park-doha",
    nameEn: "Snow Dunes & Ice World",
    nameAr: "تلال الثلج وعالم الجليد",
    taglineEn: "Doha's First Arctic Snow & Ice Adventure Park",
    taglineAr: "أول حديقة مغامرات ثلجية قطبية في الدوحة",
    descriptionEn: "Experience sub-zero indoor snow dunes, ice slides, snowmobiles, and magical winter experiences for the whole family.",
    descriptionAr: "استمتع بالمغامرات الثلجية المغلقة، الزلاجات الجليدية، ودراجات الثلج وتجارب الشتاء الساحرة للعائلة.",
    isPublished: true,
    isFeatured: true,
    isHidden: false,
    computedStatus: "ACTIVE",
    isSpecialEvent: true,
    heroMediaType: "IMAGE",
    heroMediaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop",
    gallery: [{ url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop" }],
    pricing: [{ price: 120, currency: "QAR" }],
    schedules: [{ openTime: "10:00", closeTime: "22:00" }]
  },
  {
    id: "attraction-kinetic-arena",
    slug: "kinetic-arena",
    nameEn: "Kinetic Dome & Laser Arena",
    nameAr: "قبة الضوء وساحة الليزر",
    taglineEn: "High-octane spatial sound and laser combat arena",
    taglineAr: "ساحة معارك الليزر والتكنولوجيا التفاعلية",
    descriptionEn: "Immersive laser tag, kinetic light domes, interactive esports stages, and multi-player VR battles.",
    descriptionAr: "عالم ألعاب الليزر التفاعلية، العروض الضوئية، وبطولات الألعاب الإلكترونية الجيرسكوبية.",
    isPublished: true,
    isFeatured: false,
    isHidden: false,
    computedStatus: "ACTIVE",
    isSpecialEvent: false,
    heroMediaType: "IMAGE",
    heroMediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    gallery: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop" }],
    pricing: [{ price: 95, currency: "QAR" }],
    schedules: [{ openTime: "12:00", closeTime: "00:00" }]
  },
  {
    id: "attraction-kids-space",
    slug: "kids-galaxy-city",
    nameEn: "Kids Galaxy & Discovery City",
    nameAr: "عالم الأطفال ومدينة الاكتشاف",
    taglineEn: "Creative play, space exploration, and interactive workshops",
    taglineAr: "ألعاب تفاعلية، استكشاف الفضاء، وورش عمل إبداعية للأطفال",
    descriptionEn: "Safe, interactive learning and play zones, giant trampoline parks, and space exploration adventures for kids.",
    descriptionAr: "مناطق ألعاب تعليمية وتفاعلية آمنة، صالات القفز المطاطية، ومغامرات استكشاف الفضاء للأطفال.",
    isPublished: true,
    isFeatured: false,
    isHidden: false,
    computedStatus: "ACTIVE",
    isSpecialEvent: false,
    heroMediaType: "IMAGE",
    heroMediaUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
    gallery: [{ url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop" }],
    pricing: [{ price: 75, currency: "QAR" }],
    schedules: [{ openTime: "09:00", closeTime: "21:00" }]
  },
  {
    id: "attraction-winter-fest",
    slug: "doha-winter-festival",
    nameEn: "Doha Winter Lights Festival",
    nameAr: "مهرجان أضواء الدوحة الشتوي",
    taglineEn: "Seasonal celebration with live music, drone shows, and gourmet food trucks",
    taglineAr: "احتفال موسمي، عروض الدرون المضيئة، ومطاعم فاخرة",
    descriptionEn: "Spectacular nocturnal drone light shows, international musical acts, artisan food markets, and carnival rides.",
    descriptionAr: "عروض الطائرات بدون طيار المضيئة، عروض موسيقية عالمية، وأسوق المأكولات والمهرجانات.",
    isPublished: true,
    isFeatured: false,
    isHidden: false,
    computedStatus: "COMING SOON",
    isSpecialEvent: true,
    heroMediaType: "IMAGE",
    heroMediaUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop",
    gallery: [{ url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop" }],
    pricing: [{ price: 150, currency: "QAR" }],
    schedules: [{ openTime: "16:00", closeTime: "01:00" }]
  }
];

export const useAttractionsStore = create<AttractionsState>((set, get) => ({
  attractions: [],
  featuredAttraction: null,
  searchQuery: '',
  statusFilter: 'All',
  isLoading: true,
  userLocation: null,
  sortMode: 'Recommended',
  
  setAttractions: (incomingAttractions) => {
    const attractionsToEnrich = (incomingAttractions && incomingAttractions.length > 0) 
      ? incomingAttractions 
      : DEFAULT_FALLBACK_ATTRACTIONS;

    const enrichedAttractions = attractionsToEnrich.map(a => {
      const temporal = a.temporalStatus || {};
      let status = a.computedStatus || "COMING SOON";
      
      if (temporal.statusOverride && temporal.statusOverride !== "NONE" && temporal.statusOverride !== "") {
         if (temporal.statusOverride === "FORCE_ACTIVE") status = "ACTIVE";
         else if (temporal.statusOverride === "FORCE_INCOMING") status = "COMING SOON";
         else if (temporal.statusOverride === "FORCE_PAST") status = "PAST";
      } else if (temporal.isPermanent) {
         status = "ACTIVE";
      } else if (temporal.startDate && temporal.endDate) {
         const now = new Date();
         const start = new Date(temporal.startDate);
         const end = new Date(temporal.endDate);
         if (now < start) status = "COMING SOON";
         else if (now > end) status = "PAST";
         else status = "ACTIVE";
      }
      let distanceKm = undefined;
      const state = get();
      if (state.userLocation && a.coordinates?.lat && a.coordinates?.lng) {
        distanceKm = calculateDistance(state.userLocation.lat, state.userLocation.lng, a.coordinates.lat, a.coordinates.lng);
      }

      const timingStatus = a.operations?.schedules ? getLiveTimingStatus(a.operations.schedules) : undefined;

      return { 
        ...a,
        computedStatus: status,
        isSpecialEvent: a.isSpecialEvent ?? !!temporal.isSpecialEvent,
        distanceKm,
        timingStatus
      };
    });

    const featured = enrichedAttractions.find(a => a.isFeatured) || enrichedAttractions[0] || null;

    set({ attractions: enrichedAttractions, featuredAttraction: featured, isLoading: false });
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setStatusFilter: (status) => set({ statusFilter: status }),
  
  updateOccupancy: (attractionId, currentCount, maxCapacity) => set((state) => ({
    attractions: state.attractions.map(a => 
      a.id === attractionId 
        ? { ...a, liveOccupancy: { currentCount, maxCapacity } } 
        : a
    ),
    featuredAttraction: state.featuredAttraction?.id === attractionId
      ? { ...state.featuredAttraction, liveOccupancy: { currentCount, maxCapacity } }
      : state.featuredAttraction
  })),
  
  setUserLocation: (lat, lng) => {
    set({ userLocation: { lat, lng } });
    // Re-trigger distances
    get().setAttractions(get().attractions);
  },
  
  setSortMode: (mode) => set({ sortMode: mode }),
}));
