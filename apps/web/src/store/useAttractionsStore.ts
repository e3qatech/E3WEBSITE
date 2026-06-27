import { create } from 'zustand';

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

export const useAttractionsStore = create<AttractionsState>((set, get) => ({
  attractions: [],
  featuredAttraction: null,
  searchQuery: '',
  statusFilter: 'All',
  isLoading: true,
  userLocation: null,
  sortMode: 'Recommended',
  
  setAttractions: (attractions) => {
    const enrichedAttractions = attractions.map(a => {
      const temporal = a.temporalStatus || {};
      let status = "COMING SOON";
      
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
        // Dynamic import to avoid breaking build if not available immediately
        const { calculateDistance } = require('@/lib/geoUtils');
        distanceKm = calculateDistance(state.userLocation.lat, state.userLocation.lng, a.coordinates.lat, a.coordinates.lng);
      }

      const { getLiveTimingStatus } = require('@/lib/timingUtils');
      const timingStatus = getLiveTimingStatus(a.operations?.schedules || []);

      return { 
        ...a,
        computedStatus: status,
        isSpecialEvent: !!temporal.isSpecialEvent,
        distanceKm,
        timingStatus
      };
    });

    const featured = enrichedAttractions.find(a => a.isFeatured) || null;

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
