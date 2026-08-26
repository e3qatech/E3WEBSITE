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

// Canonical fallback catalog matching actual published attractions in the database
export const CANONICAL_TRACK_ACTIVITIES: Record<string, any[]> = {
  drive: [
    {
      id: "act-drive-1",
      titleEn: "Driving Track",
      titleAr: "مسار القيادة",
      descriptionEn: "Interactive junior roadway simulation with real traffic rules, electric cars, and fun driving challenges.",
      descriptionAr: "مسار قيادة تفاعلي للصغار مع قواعد مرورية حقيقية وسيارات كهربائية وتحديات ممتعة.",
      highlightType: "DRIVING",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/5ca6933e-57ca-46ff-9431-dd59a1555bbf.jpg",
      attractionSlug: "kidz-driving-school-city-center-doha",
      attractionNameEn: "Kidz Driving School",
      attractionNameAr: "مدرسة كيدز لتعليم القيادة"
    },
    {
      id: "act-drive-2",
      titleEn: "Get Your Driving Licence",
      titleAr: "استلم رخصة قيادتك",
      descriptionEn: "Pass the driving challenge and receive your official personalized junior driving licence card.",
      descriptionAr: "اجتز تحدي القيادة واحصل على بطاقة رخصة القيادة المخصصة للصغار.",
      highlightType: "ACADEMY",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/b9981d50-436f-46e3-b1e9-a33287f58a0a.jpg",
      attractionSlug: "kidz-driving-school-city-center-doha",
      attractionNameEn: "Kidz Driving School",
      attractionNameAr: "مدرسة كيدز لتعليم القيادة"
    },
    {
      id: "act-drive-3",
      titleEn: "AR-Powered Racing",
      titleAr: "سباقات بتقنية الواقع المعزز",
      descriptionEn: "High-energy indoor racing experience enhanced with augmented reality interactive elements.",
      descriptionAr: "سباقات سيارات تفاعلية معززة بتأثيرات الواقع المعزز وشاشات رقمية.",
      highlightType: "RACING",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/298ec2c1-9ff1-4cf9-b5f4-e61f9176c059.jpg",
      attractionSlug: "urban-arena",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    }
  ],
  bounce: [
    {
      id: "act-bounce-1",
      titleEn: "InflataPark Adventure Zone",
      titleAr: "منطقة مغامرات إنفلاتابارك",
      descriptionEn: "Massive interconnected inflatable obstacle arenas with slides, climbing walls, and bounce zones.",
      descriptionAr: "ساحة ألعاب هوائية عملاقة مترابطة مع زلاقات وجدران تسلق ومناطق قفز ومرح.",
      highlightType: "INFLATABLE",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/7be4ab19-88bf-455c-8b7b-85d63f2a4c6b.jpg",
      attractionSlug: "inflata-park-city-center-doha",
      attractionNameEn: "InflataPark",
      attractionNameAr: "إنفلاتابارك"
    },
    {
      id: "act-bounce-2",
      titleEn: "Multi-Level Kids Soft Play",
      titleAr: "منطقة الألعاب اللينة متعددة المستويات",
      descriptionEn: "Safe, padded multi-level indoor play structure with slides, tunnels, and climbing ramps.",
      descriptionAr: "متاهات وألعاب لينة آمنة متعددة الطوابق للأطفال مع زلاقات ومسارات تسلق.",
      highlightType: "SOFT PLAY",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_13_Image_0005.jpg",
      attractionSlug: "urban-arena",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    },
    {
      id: "act-bounce-3",
      titleEn: "Soft Play Adventure",
      titleAr: "مغامرة اللعب الآمن",
      descriptionEn: "Dynamic indoor obstacle and soft play zones designed for active kids.",
      descriptionAr: "مناطق لعب ناعمة وآمنة مصممة للأطفال الحركيين مع مغامرات متنوعة.",
      highlightType: "ADVENTURE",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/30a370ab-b3ef-4444-a2b4-ab616ffd74b2.jpg",
      attractionSlug: "kidz-driving-school-city-center-doha",
      attractionNameEn: "Kidz Driving School",
      attractionNameAr: "مدرسة كيدز لتعليم القيادة"
    }
  ],
  compete: [
    {
      id: "act-compete-1",
      titleEn: "Laser Tag Arena",
      titleAr: "ساحة الليزر تاغ",
      descriptionEn: "Multi-level futuristic combat labyrinth with neon lights, obstacles, and real-time team scoring.",
      descriptionAr: "ميدان ليزر تاغ مستقبلي مع إضاءة نيون وعوائق تكتيكية وتسجيل مباشر للنقاط.",
      highlightType: "TACTICAL",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/c50b0653-e2ed-4c77-ad17-4ad023d79751.jpg",
      attractionSlug: "urban-arena",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    },
    {
      id: "act-compete-2",
      titleEn: "Paintless Paintball",
      titleAr: "البينتبول بدون طلاء",
      descriptionEn: "Adrenaline-fueled tactical combat without the mess — safe, action-packed team battles.",
      descriptionAr: "تجربة بينتبول حماسية وتكتيكية بدون ألوان — معارك جماعية آمنة ومليئة بالإثارة.",
      highlightType: "COMBAT",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/25b924f9-836e-4e76-b9d4-f45d17c98c44.jpg",
      attractionSlug: "urban-arena",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    },
    {
      id: "act-compete-3",
      titleEn: "Archery Challenge",
      titleAr: "تحدّي الرماية بالقوس",
      descriptionEn: "Test your aim, focus, and accuracy with professional-grade soft archery targets.",
      descriptionAr: "اختبر دقتك وتركيزك في مسارات رماية القوس الآمنة والممتعة.",
      highlightType: "SKILL",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/c275f36f-4d32-49a4-8a67-fba80aa790cc.jpg",
      attractionSlug: "urban-arena",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    },
    {
      id: "act-compete-4",
      titleEn: "Bazooka Ball",
      titleAr: "بازوكا بول",
      descriptionEn: "Air-powered soft foam ball launchers for fast-paced team battle tournaments.",
      descriptionAr: "قواذف كرات رغوية هوائية لمنافسات سريعة وممتعة بين الفرق.",
      highlightType: "TOURNAMENT",
      imageUrl: "https://eeeqa.com/assets/attractions/urban-arena/console-gaming.jpg",
      attractionSlug: "urban-arena",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    }
  ],
  explore: [
    {
      id: "act-explore-1",
      titleEn: "Creative Brick-Building Zone",
      titleAr: "منطقة البناء بالمكعبات",
      descriptionEn: "Endless brick construction tables where young architects design, build, and bring imaginative models to life.",
      descriptionAr: "طاولات ومساحات بناء بالمكعبات غير محدودة تتيح للأطفال تصميم وابتكار أروع المجسمات.",
      highlightType: "STEM & BUILD",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/295bd43d-b5e7-405b-8594-c42f6c84887a.jpg",
      attractionSlug: "crayons-bricks-place-vendome",
      attractionNameEn: "Crayons & Bricks - Place Vendôme",
      attractionNameAr: "كرايونز آند بريكس - بلاس فاندوم"
    },
    {
      id: "act-explore-2",
      titleEn: "Crayon Art Studio",
      titleAr: "استوديو الرسم والتلوين",
      descriptionEn: "Choose your colours and express your imagination through open-ended creative art workshops.",
      descriptionAr: "استوديو إبداعي متكامل للتلوين والرسم والتعبير الفني الحر للأطفال.",
      highlightType: "ART STUDIO",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/66bc3344-5264-4acb-a697-bdbebdc51d3d.jpg",
      attractionSlug: "crayons-bricks-place-vendome",
      attractionNameEn: "Crayons & Bricks - Place Vendôme",
      attractionNameAr: "كرايونز آند بريكس - بلاس فاندوم"
    },
    {
      id: "act-explore-3",
      titleEn: "SpongeBob’s House",
      titleAr: "منزل سبونج بوب",
      descriptionEn: "Step directly inside SpongeBob's pineapple home for immersive themed exploration and photo moments.",
      descriptionAr: "ادخل إلى منزل الأناناس الشهير لسبونج بوب وعش تجربة غامرة مع التقاط أروع الصور التذكارية.",
      highlightType: "IMMERSIVE",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/magnific_clean-and-restore-the-flo_hEDqMGTvqL.jpg",
      attractionSlug: "spongebob-squarepants-paw-patrol-activation-meryal",
      attractionNameEn: "SpongeBob & PAW Patrol",
      attractionNameAr: "سبونج بوب وباو باترول"
    },
    {
      id: "act-explore-4",
      titleEn: "Dough Modelling Station",
      titleAr: "محطة التشكيل بالعجين",
      descriptionEn: "Roll, shape, and sculpt colourful dough into animals, characters, and original 3D sculptures.",
      descriptionAr: "محطة حسية ممتعة لتشكيل العجين الملون وصنع الشخصيات والمجسمات الإبداعية.",
      highlightType: "SENSORY PLAY",
      imageUrl: "https://eeeqa.com/assets/attractions/crayons-bricks-vendome/art-showcase.jpg",
      attractionSlug: "crayons-bricks-place-vendome",
      attractionNameEn: "Crayons & Bricks - Place Vendôme",
      attractionNameAr: "كرايونز آند بريكس - بلاس فاندوم"
    }
  ],
  celebrate: [
    {
      id: "act-celebrate-1",
      titleEn: "InflataKidz Party Pavilion",
      titleAr: "جناح احتفالات إنفلاتا كيدز",
      descriptionEn: "Dedicated private party areas with themed music, balloons, and complete birthday hosting packages.",
      descriptionAr: "مساحات مخصصة للاحتفالات وأعياد الميلاد مع موسيقى تفاعلية وديكورات مبهجة وباقات متكاملة.",
      highlightType: "BIRTHDAYS",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/InflataPark%20City%20Center%20_Page_37_Image_0001.jpg",
      attractionSlug: "inflata-park-city-center-doha",
      attractionNameEn: "InflataPark",
      attractionNameAr: "إنفلاتابارك"
    },
    {
      id: "act-celebrate-2",
      titleEn: "PS5 Gaming Lounge",
      titleAr: "صالة ألعاب بلايستيشن 5",
      descriptionEn: "Next-gen gaming lounge for group parties, console tournaments, and social celebration sessions.",
      descriptionAr: "صالة ألعاب رقمية حديثة للمجموعات والاحتفالات وبطولات البلايستيشن الحماسية.",
      highlightType: "VIP GAMING",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/9710bc8f-e420-479d-b933-8c2730210f04.jpg",
      attractionSlug: "urban-arena",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    },
    {
      id: "act-celebrate-3",
      titleEn: "Face Painting Celebration",
      titleAr: "الرسم الفني على الوجه",
      descriptionEn: "Transform into your favourite characters and animals with vibrant, safe artistic face painting.",
      descriptionAr: "ألوان ورسومات فنية مبدعة على الوجه لتحويل كل طفل إلى شخصيته المفضلة.",
      highlightType: "CELEBRATION",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/DSC09277-2.jpg",
      attractionSlug: "crayons-bricks-place-vendome",
      attractionNameEn: "Crayons & Bricks - Place Vendôme",
      attractionNameAr: "كرايونز آند بريكس - بلاس فاندوم"
    }
  ],
  "family-time": [
    {
      id: "act-family-1",
      titleEn: "Multi-Level Kids Soft Play",
      titleAr: "منطقة الألعاب اللينة متعددة المستويات",
      descriptionEn: "Safe, cushioned multi-level maze with ball pits and climbing zones for toddlers and parents.",
      descriptionAr: "متاهات وحفر كرات آمنة ولينة وممتعة للأطفال الصغار والعائلات.",
      highlightType: "ALL AGES",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/_Urban%20Arena-Profile%20%281%29_Page_13_Image_0005.jpg",
      attractionSlug: "urban-arena",
      attractionNameEn: "Urban Arena",
      attractionNameAr: "أوربان أرينا"
    },
    {
      id: "act-family-2",
      titleEn: "Creative Brick-Building Zone",
      titleAr: "منطقة البناء بالمكعبات",
      descriptionEn: "Family collaboration tables for building landmark models and creative structures together.",
      descriptionAr: "طاولات بناء عائلية مشتركة لابتكار وتصميم المباني والمجسمات معاً.",
      highlightType: "FAMILY PLAY",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/295bd43d-b5e7-405b-8594-c42f6c84887a.jpg",
      attractionSlug: "crayons-bricks-place-vendome",
      attractionNameEn: "Crayons & Bricks - Place Vendôme",
      attractionNameAr: "كرايونز آند بريكس - بلاس فاندوم"
    },
    {
      id: "act-family-3",
      titleEn: "InflataPark Adventure Zone",
      titleAr: "منطقة مغامرات إنفلاتابارك",
      descriptionEn: "Exciting inflatable obstacle courses and bouncy castles for the whole family.",
      descriptionAr: "مغامرات القفز والمرح في الساحات الهوائية لجميع أفراد العائلة.",
      highlightType: "ACTIVE FAMILY",
      imageUrl: "https://zc8pi8kjx2yhjhir.public.blob.vercel-storage.com/uploads/7be4ab19-88bf-455c-8b7b-85d63f2a4c6b.jpg",
      attractionSlug: "inflata-park-city-center-doha",
      attractionNameEn: "InflataPark",
      attractionNameAr: "إنفلاتابارك"
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

