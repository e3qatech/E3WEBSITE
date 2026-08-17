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
    id: "cmqy7l8hz0008xxg44l8bp2ez",
    slug: "kidz-driving-school-city-center-doha",
    nameEn: "Kidz Driving School",
    nameAr: "مدرسة القيادة للأطفال",
    taglineEn: "Where Young Drivers Learn Safety, Responsibility, and Confidence Through Play",
    taglineAr: "حيث يتعلم السائقون الصغار السلامة والمسؤولية والثقة من خلال اللعب",
    descriptionEn: "An owned immersive traffic city concept empowering children with miniature electric vehicles, traffic signals, driving licenses, and safety education.",
    descriptionAr: "تجربة واقعية مملوكة لـ E3 للأطفال لقيادة السيارات الكهربائية الصغيرة وتعلم قواعد المرور ورخص القيادة.",
    isPublished: true,
    isFeatured: true,
    isHidden: false,
    computedStatus: "ACTIVE",
    isSpecialEvent: false,
    heroMediaType: "IMAGE",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e6016d8f-1b8e-4099-95b7-fb9acd1169eb.png",
    gallery: [{ url: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/e6016d8f-1b8e-4099-95b7-fb9acd1169eb.png" }],
    pricing: [{ price: 65, currency: "QAR", titleEn: "General Admission Ticket", titleAr: "تذكرة دخول عامة" }],
    schedules: [{ openTime: "10:00", closeTime: "22:00" }]
  },
  {
    id: "cmqy7l8iq000gxxg441lib86l",
    slug: "urban-arena",
    nameEn: "Urban Arena",
    nameAr: "أوربان أرينا",
    taglineEn: "A High-Energy Indoor Arena for Games, Challenges, and Urban Entertainment",
    taglineAr: "ساحة داخلية مليئة بالحماس للألعاب والتحديات والترفيه الحضري",
    descriptionEn: "High-octane spatial sound, laser tag, mixed-reality go-karting, mini golf, esports competitions, and interactive obstacle courses.",
    descriptionAr: "ساحة معارك الليزر والتكنولوجيا التفاعلية والرياضات الإلكترونية وسباقات الكارتينغ والميني غولف.",
    isPublished: true,
    isFeatured: true,
    isHidden: false,
    computedStatus: "ACTIVE",
    isSpecialEvent: false,
    heroMediaType: "IMAGE",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/93ab62a1-8628-4355-a687-308a8f83b42c.png",
    gallery: [{ url: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/93ab62a1-8628-4355-a687-308a8f83b42c.png" }],
    pricing: [{ price: 45, currency: "QAR", titleEn: "Game Credit / Pass", titleAr: "رصيد / بطاقة ألعاب" }],
    schedules: [{ openTime: "14:00", closeTime: "00:00" }]
  },
  {
    id: "cmqy7l8ju000oxxg42yi46l9y",
    slug: "inflata-park-city-center-doha",
    nameEn: "InflataPark",
    nameAr: "إنفلاتا بارك",
    taglineEn: "Qatar’s Indoor Inflatable Adventure Park for Active Family Fun",
    taglineAr: "حديقة مغامرات داخلية قابلة للنفخ في قطر للمتعة العائلية النشطة",
    descriptionEn: "An E3 operated indoor inflatable park covering continuous obstacle courses, giant slides, bounce zones, and family active play.",
    descriptionAr: "مجمع الألعاب الهوائية المطاطية المُدار بواسطة E3 ويمتد على مساحات واسعة من المسارات التنافسية والزلاقات العملاقة.",
    isPublished: true,
    isFeatured: true,
    isHidden: false,
    computedStatus: "ACTIVE",
    isSpecialEvent: false,
    heroMediaType: "IFRAME",
    heroMediaUrl: "https://my.spline.design/splineoraanimatedipadmockuprockenvato-PBFLfv9zxXzwC2LCNUeTijX1/",
    gallery: [{ url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop" }],
    pricing: [{ price: 35, currency: "QAR", titleEn: "25-Minute Session", titleAr: "جلسة 25 دقيقة" }, { price: 65, currency: "QAR", titleEn: "50-Minute Session", titleAr: "جلسة 50 دقيقة" }],
    schedules: [{ openTime: "12:00", closeTime: "23:00" }]
  },
  {
    id: "cmqy7l8gj0000xxg42edtd91z",
    slug: "crayons-and-bricks-place-vendome",
    nameEn: "Crayons & Bricks – Place Vendôme",
    nameAr: "كرايونز آند بريكس – بلاس فاندوم",
    taglineEn: "A Creative Play Studio Where Art, Bricks, and Imagination Come Together",
    taglineAr: "استوديو لعب إبداعي يجمع بين الفن والمكعبات والخيال",
    descriptionEn: "An owned E3 child-development realm for children to build, sculpt, draw, and experiment with spatial building blocks and STEM labs.",
    descriptionAr: "مساحة إبداعية مملوكة لـ E3 مخصصة للأطفال للاكتشاف والبناء والتلوين وورش العمل التفاعلية.",
    isPublished: true,
    isFeatured: false,
    isHidden: false,
    computedStatus: "ACTIVE",
    isSpecialEvent: false,
    heroMediaType: "IMAGE",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg",
    gallery: [{ url: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg" }],
    pricing: [{ price: 50, currency: "QAR", titleEn: "General Play Session", titleAr: "جلسة لعب عامة" }],
    schedules: [{ openTime: "10:00", closeTime: "22:00" }]
  },
  {
    id: "cmqy7l8kl000yxxg4s0x7ygkt",
    slug: "spongebob-squarepants-paw-patrol-activation-meryal",
    nameEn: "SpongeBob SquarePants & PAW Patrol Activation",
    nameAr: "فعالية سبونج بوب سكوير بانتس وباو باترول",
    taglineEn: "A Splash-Filled Character Experience Bringing Bikini Bottom and Adventure Bay to Qatar",
    taglineAr: "تجربة شخصيات مائية تجمع بين بيكيني بوتوم وأدفنتشر باي في قطر",
    descriptionEn: "Official Nickelodeon character activation featuring interactive water splash play, photo ops, and meet-and-greets at Meryal Waterpark.",
    descriptionAr: "فعالية شخصيات نيكلوديون الرسمية التفاعلية مع الألعاب المائية وجلسات التصوير واللقاءات الحية في مريال ووتر بارك.",
    isPublished: true,
    isFeatured: false,
    isHidden: false,
    computedStatus: "ACTIVE",
    isSpecialEvent: true,
    heroMediaType: "IMAGE",
    heroMediaUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/2809137c-b6cd-48f0-94d4-80e19c038e4e.JPG",
    gallery: [{ url: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/2809137c-b6cd-48f0-94d4-80e19c038e4e.JPG" }],
    pricing: [{ price: 0, currency: "QAR", titleEn: "Waterpark Guest Access", titleAr: "دخول ضيوف الحديقة المائية" }],
    schedules: [{ openTime: "10:00", closeTime: "19:00" }]
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
