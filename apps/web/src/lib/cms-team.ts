export interface CoreTeamRecord {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  roleEn: string
  roleAr: string
  bioEn: string
  bioAr: string
  portrait: string
  mobilePortrait?: string
  backgroundFootage?: string
  featureOnB2CLanding: boolean
  isCoreTeam: boolean
  b2cOrder: number
  profileCtaLabelEn?: string
  profileCtaLabelAr?: string
  showProfileLink?: boolean
  b2cVisibility: boolean
  relatedProjectSlug?: string
  status: 'DRAFT' | 'PUBLISHED'
}

export const DEFAULT_CORE_TEAM: CoreTeamRecord[] = [
  {
    id: "team-founder-ceo",
    slug: "sheikh-nasser-al-thani",
    nameEn: "Sheikh Nasser Al-Thani",
    nameAr: "الشيخ ناصر آل ثاني",
    roleEn: "Founder & Managing Director",
    roleAr: "المؤسس والمدير التنفيذي",
    bioEn: "Pioneering immersive entertainment destinations and high-impact experiential venues across Qatar and the GCC.",
    bioAr: "قيادة ابتكار الوجهات الترفيهية والتجارب الاستثنائية الحية في قطر والخليج العربي.",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    backgroundFootage: "https://assets.mixkit.co/videos/preview/mixkit-bright-lights-of-a-ferris-wheel-at-night-41544-large.mp4",
    featureOnB2CLanding: true,
    isCoreTeam: true,
    b2cOrder: 1,
    profileCtaLabelEn: "View Vision Profile",
    profileCtaLabelAr: "عرض الملف الرؤيوي",
    showProfileLink: true,
    b2cVisibility: true,
    status: "PUBLISHED"
  },
  {
    id: "team-head-creatives",
    slug: "tarik-hassan",
    nameEn: "Tarik Hassan",
    nameAr: "طارق حسان",
    roleEn: "Chief Creative Officer & Spatial Experience Director",
    roleAr: "رئيس القطاع الإبداعي ومدير التجارب التفاعلية",
    bioEn: "Architecting kinetic light environments, inflatable mega-structures, and narrative theme concepts for E3.",
    bioAr: "تصميم وإخراج العوالم التفاعلية، البيئات الضوئية، والساحات الترفيهية الكبرى.",
    portrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
    backgroundFootage: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glowing-light-bulb-41525-large.mp4",
    featureOnB2CLanding: true,
    isCoreTeam: true,
    b2cOrder: 2,
    profileCtaLabelEn: "View Creative Portfolio",
    profileCtaLabelAr: "عرض الأعمال الإبداعية",
    showProfileLink: true,
    b2cVisibility: true,
    status: "PUBLISHED"
  },
  {
    id: "team-head-operations",
    slug: "fatima-al-kuwari",
    nameEn: "Fatima Al-Kuwari",
    nameAr: "فاطمة الكواري",
    roleEn: "Director of Operations & Guest Experience",
    roleAr: "مديرة العمليات وتجربة الزوار",
    bioEn: "Ensuring world-class crowd safety, operational excellence, and everlasting guest memories across all Qatar parks.",
    bioAr: "إدارة تشغيل الوجهات الترفيهية وضمان أعلى مستويات السلامة والرفاهية لزوار إي ثري.",
    portrait: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    featureOnB2CLanding: true,
    isCoreTeam: true,
    b2cOrder: 3,
    profileCtaLabelEn: "View Operational Strategy",
    profileCtaLabelAr: "عرض الاستراتيجية التشغيلية",
    showProfileLink: true,
    b2cVisibility: true,
    status: "PUBLISHED"
  }
]
