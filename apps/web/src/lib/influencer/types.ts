import type {
  InfluencerStatus,
  ApplicationStatus,
  CampaignStatus,
  CampaignCreatorStatus,
  DeliverableStatus,
  ContentReviewDecision,
  PaymentStatus,
  SocialPlatform,
  CreatorTier,
  CampaignType,
  CollaborationType,
  ContentType,
  InfluencerDocumentType,
  AttendanceStatus,
  PortalTokenScope,
  DiscountType,
  UsageRightsStatus,
  BrandSafetyStatus,
  ApprovalType,
} from '@prisma/client';

export type {
  InfluencerStatus,
  ApplicationStatus,
  CampaignStatus,
  CampaignCreatorStatus,
  DeliverableStatus,
  ContentReviewDecision,
  PaymentStatus,
  SocialPlatform,
  CreatorTier,
  CampaignType,
  CollaborationType,
  ContentType,
  InfluencerDocumentType,
  AttendanceStatus,
  PortalTokenScope,
  DiscountType,
  UsageRightsStatus,
  BrandSafetyStatus,
  ApprovalType,
};

export interface PublicCreatorProfile {
  id: string;
  displayName: string;
  slug: string;
  profileImage: string | null;
  bioEn: string | null;
  bioAr: string | null;
  categories: string[];
  languages: string[];
  isQatarBased: boolean;
  creatorTier: CreatorTier;
  platforms: {
    platform: SocialPlatform;
    handle: string;
    profileUrl: string;
    followerCount: number;
  }[];
}

export interface InfluencerScoringWeights {
  audienceFitWeight: number; // default: 25
  engagementQualityWeight: number; // default: 20
  contentQualityWeight: number; // default: 20
  brandSuitabilityWeight: number; // default: 15
  eventRelevanceWeight: number; // default: 10
  reliabilityWeight: number; // default: 10
}

export interface InfluencerScoreBreakdown {
  audienceFit: number;
  engagementQuality: number;
  contentQuality: number;
  brandSuitability: number;
  eventRelevance: number;
  reliability: number;
  totalScore: number;
  isAdvisoryOnly: true;
  weightsUsed: InfluencerScoringWeights;
}

export interface CampaignMetricsSummary {
  creatorCount: number;
  deliverablesPlanned: number;
  deliverablesCompleted: number;
  completionRate: number;
  onTimeRate: number;
  reach: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement: number;
  engagementRate: number;
  engagementRateDenominator: 'reach' | 'views';
  eventAttendance: number;
  promoCodeRedemptions: number;
  ticketCount: number;
  grossRevenue: number;
  discountAmount: number;
  refundAmount: number;
  netRevenue: number;
  campaignSpend: number;
  costPerEngagement: number;
  costPerTicket: number;
  attributedReturn: number;
  conversionRate: number;
}
