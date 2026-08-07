export type CampaignPriority =
  | "EMERGENCY"
  | "CAMPAIGN"
  | "SCHEDULED"
  | "WEATHER"
  | "TIME"
  | "FALLBACK";

export type CampaignStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ExperienceCampaignPayload {
  id: string;
  internalName: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  portalScope: "SHARED" | "B2B" | "B2C";
  priority: CampaignPriority;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  scenePreset: "LEGO_MODULAR" | "CYBER_GRID" | "KINETIC_LIGHTS" | "DEFAULT";
  badgeEn?: string;
  badgeAr?: string;
  ctaTextEn?: string;
  ctaTextAr?: string;
  ctaUrl?: string;
  bannerMediaUrl?: string;
  weatherBlendMode: "OVERRIDE" | "BLEND" | "DISABLE_WEATHER";
  animationIntensity: number; // 0.1 to 1.0
  emergencyDisable: boolean;
  updatedAt?: string;
}

export const DEFAULT_EXPERIENCE_CAMPAIGN: ExperienceCampaignPayload = {
  id: "default-lego-activation",
  internalName: "LEGO Experiential Architecture Launch",
  titleEn: "LEGO® Modular Event World",
  titleAr: "عالم ليجو® المعماري التفاعلي",
  descriptionEn: "Experience Qatar's largest modular brick activation constructed through spatial engineering.",
  descriptionAr: "استكشف أضخم مجسم معماري تفاعلي في قطر مصمم بقطع ليجو® التركيبية.",
  portalScope: "SHARED",
  priority: "CAMPAIGN",
  status: "PUBLISHED",
  scenePreset: "LEGO_MODULAR",
  badgeEn: "Featured Activation",
  badgeAr: "الفعالية الكبرى الأخيرة",
  ctaTextEn: "Discover LEGO World",
  ctaTextAr: "استكشف عالم ليجو",
  ctaUrl: "/b2c",
  weatherBlendMode: "BLEND",
  animationIntensity: 0.8,
  emergencyDisable: false,
};
