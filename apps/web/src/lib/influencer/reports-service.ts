import db from '@/lib/db';
import type { CampaignMetricsSummary } from './types';

/**
 * Pure calculation function for campaign performance formulas (Section 16)
 */
export function computeMetricsFromTotals(input: {
  plannedDeliverables: number;
  completedDeliverables: number;
  publishedDeliverables: number;
  onTimeDeliverables: number;
  totalReach: number;
  totalEngagements: number;
  trackedClicks: number;
  attributedOrders: number;
  attributedTickets: number;
  grossRevenue: number;
  discountAmount: number;
  refundAmount: number;
  netRevenue: number;
  campaignSpend: number;
}) {
  const completionRate =
    input.plannedDeliverables > 0 ? (input.completedDeliverables / input.plannedDeliverables) * 100 : 0;
  const onTimeRate =
    input.publishedDeliverables > 0 ? (input.onTimeDeliverables / input.publishedDeliverables) * 100 : 0;
  const engagementRate =
    input.totalReach > 0 ? (input.totalEngagements / input.totalReach) * 100 : 0;
  const conversionRate =
    input.trackedClicks > 0 ? (input.attributedOrders / input.trackedClicks) * 100 : 0;
  const costPerTicket =
    input.attributedTickets > 0 ? input.campaignSpend / input.attributedTickets : 0;
  const attributedReturn =
    input.campaignSpend > 0
      ? ((input.netRevenue - input.campaignSpend) / input.campaignSpend) * 100
      : 0;

  return {
    completionRate,
    onTimeRate,
    engagementRate,
    conversionRate,
    costPerTicket,
    attributedReturn,
  };
}

/**
 * Calculates aggregate campaign metrics safely handling zero denominators (Section 16)
 */
export async function calculateCampaignMetrics(campaignId: string): Promise<CampaignMetricsSummary> {
  const campaign = await (db as any).influencerCampaign.findUnique({
    where: { id: campaignId },
    include: {
      creatorAssignments: {
        include: {
          deliverables: true,
          attendanceRecords: true,
        },
      },
      conversions: true,
      trackingLinks: true,
      promoCodes: true,
    },
  });

  if (!campaign) throw new Error('Campaign not found');

  const creatorCount = campaign.creatorAssignments.length;
  const deliverables = campaign.creatorAssignments.flatMap((ca: any) => ca.deliverables);
  const deliverablesPlanned = deliverables.length;
  const deliverablesCompleted = deliverables.filter((d: any) => d.status === 'VERIFIED' || d.status === 'COMPLETED').length;

  const completionRate = deliverablesPlanned > 0 ? (deliverablesCompleted / deliverablesPlanned) * 100 : 0;

  // On-time rate
  const publishedDeliverables = deliverables.filter((d: any) => d.publishedAt);
  const onTimeDeliverables = publishedDeliverables.filter((d: any) => {
    if (!d.publishDueAt) return true;
    return new Date(d.publishedAt) <= new Date(d.publishDueAt);
  });
  const onTimeRate = publishedDeliverables.length > 0 ? (onTimeDeliverables.length / publishedDeliverables.length) * 100 : 100;

  // Aggregate engagement figures
  let views = 0;
  let likes = 0;
  let comments = 0;
  let shares = 0;
  let saves = 0;
  let reach = 0;

  for (const d of deliverables) {
    views += d.metricsViews || 0;
    likes += d.metricsLikes || 0;
    comments += d.metricsComments || 0;
    shares += d.metricsShares || 0;
    saves += d.metricsSaves || 0;
    reach += d.metricsReach || 0;
  }

  const engagement = likes + comments + shares + saves;
  const engagementRateDenominator: 'reach' | 'views' = reach > 0 ? 'reach' : 'views';
  const denominatorVal = reach > 0 ? reach : views;
  const engagementRate = denominatorVal > 0 ? (engagement / denominatorVal) * 100 : 0;

  // Attendance
  const attendances = campaign.creatorAssignments.flatMap((ca: any) => ca.attendanceRecords);
  const eventAttendance = attendances.filter((a: any) => a.status === 'CHECKED_IN' || a.status === 'CHECKED_OUT').length;

  // Conversions & Financials
  let ticketCount = 0;
  let grossRevenue = 0;
  let discountAmount = 0;
  let refundAmount = 0;
  let netRevenue = 0;

  for (const c of campaign.conversions) {
    ticketCount += c.ticketCount || 0;
    grossRevenue += Number(c.grossRevenue) || 0;
    discountAmount += Number(c.discountAmount) || 0;
    refundAmount += Number(c.refundAmount) || 0;
    netRevenue += Number(c.netRevenue) || 0;
  }

  const promoCodeRedemptions = (campaign.conversions || []).filter((c: any) => c.promoCodeId).length;

  // Tracking clicks & conversion rate
  let totalClicks = 0;
  for (const link of (campaign.trackingLinks || [])) {
    totalClicks += link.clickCount || 0;
  }
  const conversionRate = totalClicks > 0 ? ((campaign.conversions || []).length / totalClicks) * 100 : 0;

  const campaignSpend = Number(campaign.budget) || 0;
  const costPerEngagement = engagement > 0 ? campaignSpend / engagement : 0;
  const costPerTicket = ticketCount > 0 ? campaignSpend / ticketCount : 0;
  const attributedReturn = campaignSpend > 0 ? ((netRevenue - campaignSpend) / campaignSpend) * 100 : 0;

  return {
    creatorCount,
    deliverablesPlanned,
    deliverablesCompleted,
    completionRate: Math.round(completionRate * 10) / 10,
    onTimeRate: Math.round(onTimeRate * 10) / 10,
    reach,
    views,
    likes,
    comments,
    shares,
    saves,
    engagement,
    engagementRate: Math.round(engagementRate * 100) / 100,
    engagementRateDenominator,
    eventAttendance,
    promoCodeRedemptions,
    ticketCount,
    grossRevenue: Math.round(grossRevenue * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    refundAmount: Math.round(refundAmount * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
    campaignSpend: Math.round(campaignSpend * 100) / 100,
    costPerEngagement: Math.round(costPerEngagement * 100) / 100,
    costPerTicket: Math.round(costPerTicket * 100) / 100,
    attributedReturn: Math.round(attributedReturn * 10) / 10,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
}

/**
 * Generates a comprehensive Close-Out Report for campaign archiving (Section 16)
 */
export async function generateCampaignCloseOutReport(campaignId: string) {
  const campaign = await (db as any).influencerCampaign.findUnique({
    where: { id: campaignId },
    include: {
      creatorAssignments: {
        include: {
          influencer: true,
          deliverables: true,
          attendanceRecords: true,
        },
      },
      conversions: true,
    },
  });

  if (!campaign) throw new Error('Campaign not found');

  const metrics = await calculateCampaignMetrics(campaignId);

  return {
    campaignId: campaign.id,
    titleEn: campaign.titleEn,
    titleAr: campaign.titleAr,
    internalCode: campaign.internalCode,
    campaignType: campaign.campaignType,
    clientName: campaign.clientName || 'Internal E3 Activation',
    duration: `${new Date(campaign.startDate).toLocaleDateString()} – ${new Date(campaign.endDate).toLocaleDateString()}`,
    metrics,
    creators: campaign.creatorAssignments.map((ca: any) => ({
      creatorId: ca.influencer.id,
      displayName: ca.influencer.displayName,
      tier: ca.influencer.creatorTier,
      agreedRate: ca.agreedRate ? Number(ca.agreedRate) : 0,
      deliverablesCompleted: ca.deliverables.filter((d: any) => d.status === 'VERIFIED' || d.status === 'COMPLETED').length,
      deliverablesTotal: ca.deliverables.length,
      attendanceStatus: ca.attendanceRecords[0]?.status || 'N/A',
      rating: ca.performanceRating || null,
    })),
    generatedAt: new Date().toISOString(),
  };
}
