import { create } from 'zustand';

export type AttractionStatus = 'All' | 'Active Now' | 'Coming Soon' | 'Special Events';

export interface AttractionGallery {
  url: string;
}

export interface AttractionPricing {
  price: number;
  currency: string;
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
  descriptionEn?: string;
  descriptionAr?: string;
  isPublished: boolean;
  isFeatured: boolean;
  gallery: AttractionGallery[];
  pricing: AttractionPricing[];
  schedules: AttractionSchedule[];
  heroMediaType?: string;
  heroMediaUrl?: string | null;
  
  // Client-side enriched state
  liveOccupancy?: LiveOccupancy;
  isOpenNow?: boolean;
}

interface AttractionsState {
  attractions: Attraction[];
  featuredAttraction: Attraction | null;
  searchQuery: string;
  statusFilter: AttractionStatus;
  isLoading: boolean;
  
  // Actions
  setAttractions: (attractions: Attraction[]) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: AttractionStatus) => void;
  updateOccupancy: (attractionId: string, currentCount: number, maxCapacity: number) => void;
}

export const useAttractionsStore = create<AttractionsState>((set) => ({
  attractions: [],
  featuredAttraction: null,
  searchQuery: '',
  statusFilter: 'All',
  isLoading: true,
  
  setAttractions: (attractions) => {
    // Process initial state (determine featured, compute `isOpenNow` safely)
    const featured = attractions.find(a => a.isFeatured) || null;
    
    // Naive local time check for `isOpenNow` - could be advanced using `date-fns-tz` 
    // against the schedule times. For now, we rely on the API `schedules` array 
    // being populated if it's open today.
    const enrichedAttractions = attractions.map(a => ({
      ...a,
      isOpenNow: a.schedules?.length > 0
    }));

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
}));
