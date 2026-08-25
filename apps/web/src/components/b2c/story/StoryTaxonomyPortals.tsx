"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Sparkles, MapPin, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useMemo } from 'react'
import { formatLocalizedText } from '@/lib/utils'
import { localizeHref } from '@/lib/url-helper'
import { useCapabilityTier } from '@/lib/motion/capability-context'
import { isAttractionActiveByDate } from '@/lib/cms-attractions'

interface StoryTaxonomyPortalsProps {
  content: any
  locale: string
  onSelectCategory?: (category: string) => void
}

// Canonical fallback catalog ensuring 0ms instant loading on any device
export const CANONICAL_TRACK_ACTIVITIES: Record<string, any[]> = {
  drive: [
    {
      id: "act-drive-1",
      titleEn: "Electric Drift Super-Circuit",
      titleAr: "حلبة الدرفت الكهربائية الخارقة",
      descriptionEn: "High-speed indoor electric karts with hairpins, neon lighting, and digital telemetry timing.",
      descriptionAr: "كارتينج كهربائي عالي السرعة داخل الصالة مع إضاءة نيون وتوقيت رقمي متطور.",
      highlightType: "RACING",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/298ec2c1-9ff1-4cf9-b5f4-e61f9176c059.jpg",
      attractionSlug: "kids-city-driving-school",
      attractionNameEn: "Kids City Driving School",
      attractionNameAr: "مدرسة قيادة مدينة الأطفال"
    },
    {
      id: "act-drive-2",
      titleEn: "Junior Grand Prix Academy",
      titleAr: "أكاديمية سباق الجائزة الكبرى للناشئين",
      descriptionEn: "Interactive junior track with real traffic lights, road rules, and personalized driving licenses.",
      descriptionAr: "مسار تفاعلي للأطفال مع إشارات مرور حقيقية ورخص قيادة خاصة.",
      highlightType: "ACADEMY",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/72ab2c19-e5de-4554-9ae2-b1beecc7ffab.jpg",
      attractionSlug: "kids-city-driving-school",
      attractionNameEn: "Kids City Driving School",
      attractionNameAr: "مدرسة قيادة مدينة الأطفال"
    },
    {
      id: "act-drive-3",
      titleEn: "Kids City Driving Track",
      titleAr: "مسار قيادة مدينة الأطفال",
      descriptionEn: "Interactive realistic junior roadway simulation with fuel pumps and garage stops.",
      descriptionAr: "محاكاة واقعية للطرق للصغار مع محطات وقود وصيانة تفاعلية.",
      highlightType: "JUNIOR TRACK",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/762b7271-c81f-42a7-a190-3be8b3000f71.jpg",
      attractionSlug: "kids-city-driving-school",
      attractionNameEn: "Kids City Driving School",
      attractionNameAr: "مدرسة قيادة مدينة الأطفال"
    }
  ],
  achieve: [
    {
      id: "act-achieve-1",
      titleEn: "InflataPark Obstacle Gauntlet",
      titleAr: "مضمار عقبات إنفلاتابارك الحماسي",
      descriptionEn: "Conquer the continuous inflatable obstacle course and set official leaderboard times.",
      descriptionAr: "تحدَّ مسار العقبات الهوائي المتصل وحقق أفضل الأوقات.",
      highlightType: "OBSTACLES",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg",
      attractionSlug: "inflatapark-city-center-doha",
      attractionNameEn: "InflataPark City Center",
      attractionNameAr: "إنفلاتابارك سيتي سنتر"
    },
    {
      id: "act-achieve-2",
      titleEn: "Speedrun Obstacle Challenge",
      titleAr: "تحدي عقبات السرعة الخارقة",
      descriptionEn: "Multi-tiered sprint zones, climbing towers, and extreme slide drops designed for top athletes.",
      descriptionAr: "مناطق انطلاق متعددة المستويات وأبراج تسلق وزلاقات عملاقة للمحترفين.",
      highlightType: "CHALLENGE",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg",
      attractionSlug: "inflatapark-city-center-doha",
      attractionNameEn: "InflataPark City Center",
      attractionNameAr: "إنفلاتابارك سيتي سنتر"
    },
    {
      id: "act-achieve-3",
      titleEn: "High-Altitude Aerial Vault",
      titleAr: "القفز الجوي عالي الارتفاع",
      descriptionEn: "Zero-gravity drop into giant air cushioned impact zones with precision high-speed camera captures.",
      descriptionAr: "قفز حر من منصات مرتفعة نحو وسائد هوائية عملاقة مع توثيق احترافي بالفيديو.",
      highlightType: "AERIAL",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/984f661d-5185-4d2e-aa3c-4ca54b54d6e9.jpg",
      attractionSlug: "urban-arena-doha-mall",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    }
  ],
  bounce: [
    {
      id: "act-bounce-1",
      titleEn: "Mega Inflatable Megastructure",
      titleAr: "الهيكل الهوائي العملاق للقفز والمرح",
      descriptionEn: "Massive interconnected bouncy castles with launch pads, balance beams, and climbing walls.",
      descriptionAr: "قلعة هوائية عملاقة مترابطة مع منصات إطلاق وجسور توازن وجدران تسلق.",
      highlightType: "INFLATABLE",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_36_Image_0001.jpg",
      attractionSlug: "inflatapark-city-center-doha",
      attractionNameEn: "InflataPark City Center",
      attractionNameAr: "إنفلاتابارك سيتي سنتر"
    },
    {
      id: "act-bounce-2",
      titleEn: "Gravity-Free Trampoline Matrix",
      titleAr: "مصفوفة الترامبولين وانعدام الجاذبية",
      descriptionEn: "Continuous wall-to-wall trampolines with dodgeball zones and slam dunk basketball hoops.",
      descriptionAr: "مساحات ترامبولين متصلة من الجدار للجدار مع مناطق كرة الخروج وكرة السلة الهوائية.",
      highlightType: "TRAMPOLINE",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC_6565.jpg",
      attractionSlug: "urban-arena-doha-mall",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    },
    {
      id: "act-bounce-3",
      titleEn: "Airbag Stunt Drop Zone",
      titleAr: "منطقة السقوط الحر والقفز البهلواني",
      descriptionEn: "Flip, spin, and launch safely from high dive platforms into cloud-soft giant air mattresses.",
      descriptionAr: "شقلبة وقفز بهلواني آمن من منصات مرتفعة نحو وسائد هوائية متطورة.",
      highlightType: "FREESTYLE",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/Post%20Event%20Report%20InflataCity%202025%20_Page_013_Image_0007.jpg",
      attractionSlug: "inflatapark-city-center-doha",
      attractionNameEn: "InflataPark City Center",
      attractionNameAr: "إنفلاتابارك سيتي سنتر"
    }
  ],
  compete: [
    {
      id: "act-compete-1",
      titleEn: "Laser Tag Tactical Combat Arena",
      titleAr: "ميدان الليزر تاق التكتيكي المتقدم",
      descriptionEn: "Multi-level futuristic labyrinth with ultraviolet glow, smoke effects, and live team scoring.",
      descriptionAr: "متاهة مستقبلية متعددة الطوابق بإضاءة فوق بنفسجية ومؤثرات دخانية وتسجيل مباشر للنقاط.",
      highlightType: "TACTICAL",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/762b7271-c81f-42a7-a190-3be8b3000f71.jpg",
      attractionSlug: "urban-arena-doha-mall",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    },
    {
      id: "act-compete-2",
      titleEn: "Gladiator Battledome Arena",
      titleAr: "بطولة صالة المحاربين التنافسية",
      descriptionEn: "Pugil stick jousting on elevated podiums above soft air pits — ultimate balance and reflexes.",
      descriptionAr: "مبارزة على منصات مرتفعة فوق وسائد هوائية ناعمة لاختبار التوازن وردود الفعل السريعة.",
      highlightType: "TOURNAMENT",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/984f661d-5185-4d2e-aa3c-4ca54b54d6e9.jpg",
      attractionSlug: "inflatapark-city-center-doha",
      attractionNameEn: "InflataPark City Center",
      attractionNameAr: "إنفلاتابارك سيتي سنتر"
    },
    {
      id: "act-compete-3",
      titleEn: "VR Esports Battle Arena",
      titleAr: "ساحة منافسات الرياضات الإلكترونية الافتراضية",
      descriptionEn: "Immersive multiplayer VR motion tracking battles with real-time spectator display boards.",
      descriptionAr: "معارك واقع افتراضي جماعية غامرة مع تتبع حركة فوري وشاشات عرض للمشاهدين.",
      highlightType: "ESPORTS",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8138.jpg",
      attractionSlug: "urban-arena-doha-mall",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    }
  ],
  explore: [
    {
      id: "act-explore-1",
      titleEn: "Crayons & Bricks Creative STEM Studio",
      titleAr: "استوديو كرايونز آند بريكس للإبداع والعلوم",
      descriptionEn: "Giant brick construction workshops, kinetic color stations, and architectural design labs.",
      descriptionAr: "ورش بناء المكعبات العملاقة ومحطات الألوان الحركية ومختبرات التصميم المعماري للأطفال.",
      highlightType: "STEM & ART",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg",
      attractionSlug: "crayons-bricks-place-vendome",
      attractionNameEn: "Crayons & Bricks",
      attractionNameAr: "كرايونز آند بريكس"
    },
    {
      id: "act-explore-2",
      titleEn: "Glow Neon Mystery Labyrinth",
      titleAr: "متاهة النيون المتوهجة والغموض",
      descriptionEn: "Darkened sensory room with UV fluorescent obstacles, optical illusions, and hidden puzzles.",
      descriptionAr: "غرفة حسية مظلمة مع عوائق نيون متوهجة وخداع بصري وألغاز سرية لاكتشافها.",
      highlightType: "SENSORY",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC09277-2.jpg",
      attractionSlug: "crayons-bricks-place-vendome",
      attractionNameEn: "Crayons & Bricks",
      attractionNameAr: "كرايونز آند بريكس"
    },
    {
      id: "act-explore-3",
      titleEn: "Space Tribe Cosmic Explorer Zone",
      titleAr: "منطقة سبيس ترايب لاستكشاف الفضاء",
      descriptionEn: "Interactive cosmic flight simulations, planetarium domes, and zero-gravity training pods.",
      descriptionAr: "محاكاة طيران فضائي تفاعلية وقباب فلكية ومناطق تدريب انعدام الجاذبية للأطفال.",
      highlightType: "ADVENTURE",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/2809137c-b6cd-48f0-94d4-80e19c038e4e.JPG",
      attractionSlug: "space-tribe-place-vendome",
      attractionNameEn: "Space Tribe",
      attractionNameAr: "سبيس ترايب"
    }
  ],
  celebrate: [
    {
      id: "act-celebrate-1",
      titleEn: "Galactic Birthday Party Pavilions",
      titleAr: "أجنحة احتفالات أعياد الميلاد المجريّة",
      descriptionEn: "Private immersive themed birthday suites with dedicated party hosts, custom lighting, and catering.",
      descriptionAr: "أجنحة أعياد ميلاد خاصة ذات طابع فضائي غامر مع منسق حفلات خاص وإضاءة مخصصة وضيافة.",
      highlightType: "BIRTHDAYS",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC06321.jpg",
      attractionSlug: "inflatapark-city-center-doha",
      attractionNameEn: "InflataPark City Center",
      attractionNameAr: "إنفلاتابارك سيتي سنتر"
    },
    {
      id: "act-celebrate-2",
      titleEn: "VIP Private Suite & Celebration Lounge",
      titleAr: "جناح كبار الشخصيات الفاخر والاحتفالات الخاصة",
      descriptionEn: "Exclusive mezzanine lounge overlooking the arena for milestone celebrations and private gatherings.",
      descriptionAr: "صالة ميزانين حصرية تطل على الميدان الترفيهي للاحتفالات الخاصة والمناسبات الكبرى.",
      highlightType: "VIP LOUNGE",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/D85_8202.jpg",
      attractionSlug: "urban-arena-doha-mall",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    },
    {
      id: "act-celebrate-3",
      titleEn: "Glow Night Celebration Hub",
      titleAr: "مركز الليالي المضيئة الاحتفالي",
      descriptionEn: "Vibrant themed music and light sessions with glowing wristbands and energetic party zones.",
      descriptionAr: "أجواء احتفالية موسيقية مميزة مع أساور متوهجة ومناطق لعب ممتعة لجميع الأعمار.",
      highlightType: "PARTY",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC00640.jpg",
      attractionSlug: "inflatapark-city-center-doha",
      attractionNameEn: "InflataPark City Center",
      attractionNameAr: "إنفلاتابارك سيتي سنتر"
    }
  ],
  "family-time": [
    {
      id: "act-family-1",
      titleEn: "Family Wonder World & Soft Play",
      titleAr: "عالم العائلة الساحر ومنطقة اللعب الآمن",
      descriptionEn: "Multi-age exploration zones with padded toddler labyrinths, ball pits, and sensory discovery rooms.",
      descriptionAr: "مناطق استكشاف لجميع الأعمار مع متاهات آمنة للأطفال وحفر كرات وغرف حسية ممتعة.",
      highlightType: "ALL AGES",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC01674.jpg",
      attractionSlug: "inflatapark-city-center-doha",
      attractionNameEn: "InflataPark City Center",
      attractionNameAr: "إنفلاتابارك سيتي سنتر"
    },
    {
      id: "act-family-2",
      titleEn: "Parent & Toddler Exploration Hub",
      titleAr: "محور استكشاف الآباء والأطفال",
      descriptionEn: "Dedicated morning sensory sessions for toddlers with soft lighting and gentle musical journeys.",
      descriptionAr: "جلسات صباحية مخصصة للأطفال الصغار مع إضاءة هادئة وموسيقى تفاعلية خفيفة.",
      highlightType: "TODDLER",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/79a8b014-64b7-4d8f-97f3-0fedca268e8a.jpeg",
      attractionSlug: "crayons-bricks-place-vendome",
      attractionNameEn: "Crayons & Bricks",
      attractionNameAr: "كرايونز آند بريكس"
    }
  ]
};

export function StoryTaxonomyPortals({ content, locale, onSelectCategory }: StoryTaxonomyPortalsProps) {
  const isAr = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()
  const capabilityTier = useCapabilityTier()
  const _isReducedMotion = capabilityTier === 'minimal'

  const selector = content?.intentSelector || {}
  
  const [dbStoryTypes, setDbStoryTypes] = useState<any[]>(content?.storyDiscovery?.storyTypes || content?.storyTypes || [])
  const [showAllActivities, setShowAllActivities] = useState(false)
  const mobileScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/b2c/story-types?active=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbStoryTypes(data)
        }
      })
      .catch(console.error)
  }, [])

  // Map database Story Types to frontend options, extracting actual activations / activities
  const options = useMemo(() => {
    return (dbStoryTypes || [])
      .filter((st: any) => st && st.isActive !== false)
      .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map(st => {
        const publishedFeatures = (st.features || []).filter((f: any) => !f.attraction || (f.attraction.isPublished !== false && isAttractionActiveByDate(f.attraction)))
        const jsonActivations = st.activations || st.activities || []
        
        const explicitActivities = [
          ...jsonActivations,
          ...publishedFeatures.map((f: any) => ({
            id: f.id,
            titleEn: f.titleEn || f.nameEn,
            titleAr: f.titleAr || f.nameAr,
            descriptionEn: f.descriptionEn,
            descriptionAr: f.descriptionAr,
            highlightType: f.highlightType || "Activity",
            imageUrl: f.imageUrl || f.attraction?.heroThumbnailUrl || f.attraction?.heroMediaUrl,
            attractionSlug: f.attraction?.slug,
            attractionNameEn: f.attraction?.nameEn,
            attractionNameAr: f.attraction?.nameAr
          }))
        ]

        const uniqueAttractionsMap = new Map()
        publishedFeatures.forEach((f: any) => {
          if (f.attraction && isAttractionActiveByDate(f.attraction) && !uniqueAttractionsMap.has(f.attraction.slug)) {
            uniqueAttractionsMap.set(f.attraction.slug, f.attraction)
          }
        })
        const attractions = Array.from(uniqueAttractionsMap.values())

        const normalizedSlug = (st.slug || '').toLowerCase().trim();
        const fallbackKey = normalizedSlug === 'family' ? 'family-time' : normalizedSlug;
        const canonicalFallbackActivities = CANONICAL_TRACK_ACTIVITIES[fallbackKey] || CANONICAL_TRACK_ACTIVITIES.compete || [];

        const INACTIVE_ATTRACTION_SLUGS = new Set([
          'inflatacity-2025',
          'inflatacity-2024',
          'inflatarun-2025',
          'inflatarun-2024',
          'inflatarun-2023',
          'lego-shows-qatar-2024',
          'lego-shows-qatar-2025',
          'summer-entertainment-city',
          'national-sports-day-2022',
          'udc-national-sport-day-2026',
          'doha-balloon-parade-2022',
          'asian-town-sports-carnival',
          'afc-football-fest-2023',
          'le-marche-2024',
          'tudor-pit-stop-challenge-2025',
          'influencer-cup-dinner-gala',
          'world-cup-2022-fanzone',
          'winter-activation-place-vendome',
          'festival-inflatapark-dfc',
          'rush-action-park',
          'inflatacity-city-center'
        ]);

        const rawActivities = explicitActivities.length > 0
          ? explicitActivities
          : attractions.length > 0
          ? attractions.map((attr: any) => ({
              id: attr.slug,
              titleEn: attr.nameEn,
              titleAr: attr.nameAr,
              descriptionEn: attr.taglineEn,
              descriptionAr: attr.taglineAr,
              highlightType: "Venue",
              imageUrl: attr.heroThumbnailUrl || attr.heroMediaUrl,
              attractionSlug: attr.slug,
              attractionNameEn: attr.nameEn,
              attractionNameAr: attr.nameAr
            }))
          : canonicalFallbackActivities;

        const displayActivities = rawActivities.filter((act: any) => {
          if (!act) return false;
          const slug = (act.attractionSlug || '').toLowerCase().trim();
          if (slug && INACTIVE_ATTRACTION_SLUGS.has(slug)) return false;
          const nameEn = (act.attractionNameEn || '').toLowerCase();
          const titleEn = (act.titleEn || '').toLowerCase();
          if (nameEn.includes('2024') || nameEn.includes('2025') || nameEn.includes('2023') || nameEn.includes('2022')) return false;
          if (titleEn.includes('2024') || titleEn.includes('2025') || titleEn.includes('2023') || titleEn.includes('2022')) return false;
          return true;
        });

        const titleEnStr = formatLocalizedText(st.titleEn || st.nameEn || st.slug || '', 'en')
        const titleArStr = formatLocalizedText(st.titleAr || st.nameAr || st.titleEn || st.slug || '', 'ar')

        return {
          id: st.slug || st.id || 'story-type',
          labelEn: titleEnStr || st.slug || st.id || 'Story Type',
          labelAr: titleArStr || titleEnStr || st.slug || st.id || 'نوع القصة',
          category: String(titleEnStr || st.slug || st.id || 'CATEGORY').toUpperCase(),
          mediaUrl: st.coverMediaUrl 
            || displayActivities[0]?.imageUrl 
            || 'https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/762b7271-c81f-42a7-a190-3be8b3000f71.jpg',
          accentColor: st.accentColor || '#a855f7',
          orderIndex: st.orderIndex ?? 0,
          hasPublishedActivities: displayActivities.length > 0,
          activities: displayActivities
        }
      })
  }, [dbStoryTypes]);

  // Initialize active taxonomy from URL parameter ?story=... or default
  const paramStory = searchParams?.get('story')
  const initialOption = options.find((o: any) => o.id === paramStory || o.category === paramStory?.toUpperCase()) || options[0] || {}

  const [activeId, setActiveId] = useState(initialOption.id || '')
  
  useEffect(() => {
    if (options.length > 0 && !activeId && !paramStory) {
      setActiveId(options[0].id)
    }
  }, [options, activeId, paramStory])

  useEffect(() => {
    if (paramStory && options.length > 0) {
      const match = options.find((o: any) => o.id === paramStory || o.category === paramStory.toUpperCase())
      if (match) setActiveId(match.id)
    }
  }, [paramStory, options])

  useEffect(() => {
    setShowAllActivities(false)
  }, [activeId])

  const activeOption = options.find((o: any) => o.id === activeId) || options[0] || {}

  const handleSelect = (option: any) => {
    if (activeId === option.id) return
    setActiveId(option.id)
    onSelectCategory?.(option.category || option.id)

    const newParams = new URLSearchParams(searchParams?.toString() || '')
    newParams.set('story', option.id)
    router.replace(`?${newParams.toString()}`, { scroll: false })
  }

  const scrollMobile = (direction: 'left' | 'right') => {
    if (!mobileScrollRef.current) return
    const scrollAmount = direction === 'left' ? -220 : 220
    mobileScrollRef.current.scrollBy({ left: isAr ? -scrollAmount : scrollAmount, behavior: 'smooth' })
  }

  if (options.length === 0) {
    return (
      <section
        id="story-portals-section"
        className="relative py-20 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-[var(--surface-default)] text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "مسارات الحكايات — DIMENSIONAL DOORWAYS — استكشاف الحكايات والأنشطة" : "STORY TRACKS & DIMENSIONAL DOORWAYS — STORY DISCOVERY"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {isAr ? (selector.titleAr || "أي نوع من الحكايات تريد أن تعيشها اليوم؟") : (selector.titleEn || "What Kind of Story Do You Want Today?")}
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light max-w-xl mx-auto">
            {isAr ? "لا توجد مسارات حكايات مفعلة حالياً." : "No story tracks currently published."}
          </p>

          <div className="pt-2">
            <a
              href={localizeHref("/b2c/attractions", locale)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-105"
            >
              <span>{isAr ? "استكشف جميع التجارب" : "Explore All Attractions"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    )
  }

  const INITIAL_LIMIT = 6
  const totalCount = activeOption.activities?.length || 0
  const visibleActivities = showAllActivities 
    ? (activeOption.activities || []) 
    : (activeOption.activities?.slice(0, INITIAL_LIMIT) || [])
  const hasMore = totalCount > INITIAL_LIMIT

  const selectedTitle = isAr ? activeOption.labelAr : activeOption.labelEn

  return (
    <section
      id="story-portals-section"
      className="relative py-20 bg-[var(--bg-level-1)] text-[var(--text-primary)] border-b border-[var(--border-level-2)] overflow-hidden transition-colors duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Background Decorative Glow Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-40">
        <div 
          className="absolute top-1/3 start-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[140px] transition-all duration-1000"
          style={{ backgroundColor: activeOption.accentColor ? `${activeOption.accentColor}35` : 'rgba(168, 85, 247, 0.2)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/30 bg-[var(--surface-default)] text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? "مسارات الحكايات — DIMENSIONAL DOORWAYS — استكشاف الحكايات والأنشطة" : "STORY TRACKS & DIMENSIONAL DOORWAYS — STORY DISCOVERY"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            {formatLocalizedText(isAr ? (selector.titleAr || "أي نوع من الحكايات تريد أن تعيشها اليوم؟") : (selector.titleEn || "What Kind of Story Do You Want Today?"), locale)}
          </h2>
          
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light max-w-2xl mx-auto">
            {formatLocalizedText(isAr 
              ? (selector.descriptionAr || "اختر مسار الحكاية الذي يثير شغفك لتكشف أحدث الوجهات والتجارب الترفيهية الحية المناسبة لذوقك.") 
              : (selector.descriptionEn || "Choose the story track that excites you to unlock active live entertainment destinations matching your mood."), locale)}
          </p>
        </div>

        {/* Carousel Header / Controls */}
        <div className="flex items-center justify-between pb-2">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            {isAr ? "تصفح مسارات الحكايات" : "EXPLORE STORY TRACKS"} ({options.length})
          </div>
          <div className="flex items-center gap-2 lg:hidden bg-[var(--surface-default)]/90 border border-[var(--border-level-2)] rounded-2xl p-1 shadow-md">
            <button
              onClick={() => scrollMobile('left')}
              className="p-2 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all cursor-pointer shadow-sm"
              aria-label="Scroll left"
            >
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => scrollMobile('right')}
              className="p-2 rounded-xl bg-[var(--surface-hover)] hover:bg-emerald-500 hover:text-slate-950 text-[var(--text-secondary)] transition-all cursor-pointer shadow-sm"
              aria-label="Scroll right"
            >
              {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 6 High-Energy Horizontal Doorways Cards — Clean 6-Column Grid on Desktop, Smooth Swipe on Mobile */}
        <div
          ref={mobileScrollRef}
          className="flex lg:grid lg:grid-cols-6 gap-3 sm:gap-4 xl:gap-5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 pt-2 px-1 scrollbar-none snap-x snap-mandatory"
        >
          {options.map((option) => {
            const isSelected = activeId === option.id
            const labelText = isAr ? option.labelAr : option.labelEn

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className={`group relative shrink-0 lg:shrink w-[160px] sm:w-[185px] lg:w-full h-72 sm:h-80 rounded-3xl p-4 sm:p-5 flex flex-col justify-between text-start overflow-hidden border transition-all duration-300 cursor-pointer snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                  isSelected
                    ? 'border-transparent shadow-2xl z-10'
                    : 'border-[var(--border-level-2)] bg-[var(--surface-default)]/70 hover:border-purple-500/40 hover:bg-[var(--surface-default)] shadow-md hover:-translate-y-1'
                }`}
                style={{
                  borderColor: isSelected ? option.accentColor : undefined,
                  boxShadow: isSelected 
                    ? `0 0 0 2px ${option.accentColor}, 0 12px 30px -10px ${option.accentColor}70` 
                    : undefined
                }}
              >
                {/* Background Image / Ambient Artwork */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={option.mediaUrl}
                    alt={labelText}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isSelected ? 'scale-105 opacity-90' : 'opacity-70 group-hover:opacity-85 group-hover:scale-105'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                </div>

                {/* Accent glow on selected */}
                {isSelected && (
                  <div 
                    className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-color"
                    style={{ backgroundColor: option.accentColor }}
                  />
                )}

                {/* Top Badge: Category Identifier & Open Icon */}
                <div className="relative z-10 flex items-center justify-between w-full gap-1.5">
                  <span 
                    className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-wider border shadow-sm transition-colors truncate max-w-[110px]"
                    style={{
                      backgroundColor: isSelected ? option.accentColor : 'rgba(0,0,0,0.6)',
                      color: '#ffffff',
                      borderColor: isSelected ? option.accentColor : 'rgba(255,255,255,0.2)'
                    }}
                    title={labelText}
                  >
                    {labelText}
                  </span>

                  <div className="w-6 h-6 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-md">
                    <ArrowUpRight
                      className={`w-3.5 h-3.5 shrink-0 transition-all duration-300 text-white ${isSelected ? 'translate-x-0.5 -translate-y-0.5 scale-110' : 'group-hover:scale-110'}`}
                      style={isSelected ? { color: option.accentColor } : {}}
                    />
                  </div>
                </div>

                {/* Oversized Typographic Doorway Name */}
                <div className="relative z-10 mt-auto w-full">
                  <h3 className="text-base sm:text-lg xl:text-xl font-black uppercase tracking-tight break-words leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {labelText}
                  </h3>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Story Intent Banner and Actual Activities Grid */}
        <AnimatePresence mode="wait">
          {activeOption.id && (
            <motion.div
              key={activeOption.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 max-w-6xl mx-auto"
            >
              <div
                className="p-5 sm:p-6 rounded-3xl border border-purple-500/30 bg-[var(--surface-default)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl transition-all duration-500"
                style={{ borderColor: `${activeOption.accentColor}50`, backgroundColor: `color-mix(in srgb, ${activeOption.accentColor} 10%, var(--surface-default))` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-lg border border-purple-500/40 shrink-0" style={{ backgroundColor: `${activeOption.accentColor}30`, borderColor: `${activeOption.accentColor}60`, color: activeOption.accentColor }}>
                    ✦
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest block" style={{ color: activeOption.accentColor }}>
                      {isAr ? "الحكاية المختارة" : "SELECTED STORY TYPE"}
                    </span>
                    <h4 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                      {selectedTitle} — {isAr ? "الأنشطة والتجارب المتاحة اليوم" : "Active Experiences Available Today"}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-[var(--surface-default)] text-[var(--text-secondary)] border border-[var(--border-level-2)] font-bold shadow-sm">
                    {isAr ? `${totalCount} تجارب متاحة` : `${totalCount} Experiences Available`}
                  </span>
                </div>
              </div>

              {/* Grid of actual activities / activations for this story type */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleActivities.map((act: any, idx: number) => {
                  const actTitle = formatLocalizedText(isAr ? (act.titleAr || act.titleEn) : (act.titleEn || act.titleAr), locale)
                  const venueName = formatLocalizedText(isAr ? (act.attractionNameAr || act.attractionNameEn) : (act.attractionNameEn || act.attractionNameAr), locale)
                  const badgeText = formatLocalizedText(act.highlightType || "ACTIVITY", locale)

                  return (
                    <a
                      key={act.id || idx}
                      href={localizeHref(`/b2c/attractions/${act.attractionSlug || 'all'}`, locale)}
                      className="group relative overflow-hidden rounded-3xl border border-[var(--border-level-2)] bg-slate-950 p-5 flex flex-col justify-between min-h-[220px] sm:min-h-[240px] transition-all duration-500 hover:border-purple-500/50 hover:shadow-2xl hover:-translate-y-1 shadow-lg"
                    >
                      {/* Background Image (High visibility, minimal overlay) */}
                      {act.imageUrl && (
                        <div className="absolute inset-0 z-0 overflow-hidden">
                          <img
                            src={act.imageUrl}
                            alt={actTitle}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-95"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        </div>
                      )}

                      {/* Header Badge */}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-black/60 text-white border border-white/20 backdrop-blur-md shadow-md">
                          {badgeText}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-md text-white opacity-90 group-hover:opacity-100 transition-all group-hover:scale-110 group-hover:bg-purple-500 group-hover:border-purple-400 shadow-md">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Card Footer: Clean Title + Venue Tag (Image is unobstructed) */}
                      <div className="relative z-10 space-y-2 mt-auto pt-8">
                        <h5 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:text-purple-300 transition-colors leading-snug">
                          {actTitle}
                        </h5>

                        {/* Venue Tag */}
                        {venueName && (
                          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs font-mono text-white/90">
                            <span className="flex items-center gap-1.5 font-bold text-purple-300 drop-shadow-sm">
                              <MapPin className="w-3.5 h-3.5 text-purple-400" />
                              <span>{venueName}</span>
                            </span>
                            <span className="text-white/80 group-hover:text-white font-bold transition-colors">
                              {isAr ? "استكشف ↗" : "Explore ↗"}
                            </span>
                          </div>
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>

              {/* Show More / Show Less Button */}
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setShowAllActivities(!showAllActivities)}
                    className="px-6 py-3 rounded-2xl border border-purple-500/40 bg-[var(--surface-default)] hover:bg-[var(--surface-hover)] text-purple-600 dark:text-purple-300 font-bold text-xs uppercase tracking-wider transition-all shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer"
                    style={{ borderColor: activeOption.accentColor ? `${activeOption.accentColor}60` : undefined }}
                  >
                    <span>
                      {showAllActivities
                        ? (isAr ? "عرض أقل" : "Show Less")
                        : (isAr ? `عرض المزيد (${totalCount - INITIAL_LIMIT} تجارب أخرى)` : `Show More (${totalCount - INITIAL_LIMIT} More Experiences)`)}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllActivities ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

