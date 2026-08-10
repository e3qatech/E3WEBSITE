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

// Default verified company executive profiles
export const DEFAULT_CORE_TEAM: CoreTeamRecord[] = [
  {
    id: "team-abdullah-al-kubaisi",
    slug: "abdullah-al-kubaisi",
    nameEn: "Abdullah Al Kubaisi",
    nameAr: "عبدالله الكبيسي",
    roleEn: "Chairman",
    roleAr: "رئيس مجلس الإدارة",
    bioEn: "Providing strategic stewardship, corporate governance, and vision for E3's entertainment and event engineering ecosystem.",
    bioAr: "التوجيه الاستراتيجي والحوكمة وإيقاد الرؤية الاستثمارية لمنظومة إي ثري الترفيهية والهندسية.",
    portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    featureOnB2CLanding: true,
    isCoreTeam: true,
    b2cOrder: 1,
    profileCtaLabelEn: "View Leadership Profile",
    profileCtaLabelAr: "عرض الملف القيادي",
    showProfileLink: true,
    b2cVisibility: true,
    status: "PUBLISHED"
  },
  {
    id: "team-adil-ahmed",
    slug: "adil-ahmed",
    nameEn: "Adil Ahmed",
    nameAr: "عادل أحمد",
    roleEn: "Managing Director & CEO",
    roleAr: "العضو المنتدب والرئيس التنفيذي",
    bioEn: "Directing overall operational strategy, landmark project execution, and commercial growth across Qatar and international markets.",
    bioAr: "قيادة الاستراتيجية التشغيلية والتوسع التجاري وتنفيذ المشاريع الترفيهية الكبرى في قطر.",
    portrait: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
    featureOnB2CLanding: true,
    isCoreTeam: true,
    b2cOrder: 2,
    profileCtaLabelEn: "View Executive Profile",
    profileCtaLabelAr: "عرض الملف التنفيذي",
    showProfileLink: true,
    b2cVisibility: true,
    status: "PUBLISHED"
  },
  {
    id: "team-mohammad-ali-awada",
    slug: "mohammad-ali-awada",
    nameEn: "Mohammad Ali Awada",
    nameAr: "محمد علي عواضة",
    roleEn: "General Manager",
    roleAr: "المدير العام",
    bioEn: "Overseeing day-to-day operations, venue engineering teams, venue privatizations, and guest satisfaction across all E3 sites.",
    bioAr: "الإشراف على العمليات اليومية وهندسة الفعاليات وإدارة فريق التشغيل وضمان جودة التجارب.",
    portrait: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop",
    featureOnB2CLanding: true,
    isCoreTeam: true,
    b2cOrder: 3,
    profileCtaLabelEn: "View Operations Profile",
    profileCtaLabelAr: "عرض الملف التشغيلي",
    showProfileLink: true,
    b2cVisibility: true,
    status: "PUBLISHED"
  },
  {
    id: "team-ebrahim-karolia",
    slug: "ebrahim-karolia",
    nameEn: "Ebrahim Karolia",
    nameAr: "إبراهيم كاروليا",
    roleEn: "Senior Project Manager",
    roleAr: "كبير مديري المشاريع",
    bioEn: "Leading technical delivery, structural engineering, crowd safety logistics, and rapid-deployment event builds.",
    bioAr: "إدارة التسليم الفني والهندسة الإنشائية ولوجستيات السلامة والتجهيز السريع للوجهات.",
    portrait: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
    featureOnB2CLanding: true,
    isCoreTeam: true,
    b2cOrder: 4,
    profileCtaLabelEn: "View Projects Profile",
    profileCtaLabelAr: "عرض ملف المشاريع",
    showProfileLink: true,
    b2cVisibility: true,
    status: "PUBLISHED"
  }
]
