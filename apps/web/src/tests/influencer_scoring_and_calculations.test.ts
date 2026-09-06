import { describe, it, expect } from "vitest";
import {
  calculateInfluencerScore,
  validateScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
} from "../lib/influencer/scoring";
import { computeMetricsFromTotals } from "../lib/influencer/reports-service";

describe("Influencer Scoring & Financial Metric Calculations", () => {
  describe("Scoring Weights Validation", () => {
    it("validates that default scoring weights sum to 100%", () => {
      const isValid = validateScoringWeights(DEFAULT_SCORING_WEIGHTS);
      expect(isValid).toBe(true);
    });

    it("rejects custom weights that sum to more or less than 100%", () => {
      expect(validateScoringWeights({ ...DEFAULT_SCORING_WEIGHTS, audienceFit: 40 })).toBe(false); // 115%
      expect(validateScoringWeights({ ...DEFAULT_SCORING_WEIGHTS, reliability: 0 })).toBe(false); // 90%
    });
  });

  describe("Weighted Score Calculation", () => {
    it("calculates exact weighted score for a balanced creator profile", () => {
      const components = {
        audienceFit: 80,
        engagementQuality: 90,
        contentQuality: 85,
        brandSuitability: 100,
        eventRelevance: 70,
        reliability: 95,
      };

      // Expected:
      // (80*25 + 90*20 + 85*20 + 100*15 + 70*10 + 95*10) / 100
      // = (2000 + 1800 + 1700 + 1500 + 700 + 950) / 100
      // = 8650 / 100 = 86.5
      const score = calculateInfluencerScore(components, DEFAULT_SCORING_WEIGHTS);
      expect(score).toBeCloseTo(86.5, 1);
    });

    it("clamps component scores between 0 and 100", () => {
      const outOfBounds = {
        audienceFit: 150, // clamp to 100
        engagementQuality: -20, // clamp to 0
        contentQuality: 100,
        brandSuitability: 100,
        eventRelevance: 100,
        reliability: 100,
      };

      const score = calculateInfluencerScore(outOfBounds, DEFAULT_SCORING_WEIGHTS);
      // (100*25 + 0*20 + 100*20 + 100*15 + 100*10 + 100*10) / 100 = (2500+0+2000+1500+1000+1000)/100 = 80
      expect(score).toBe(80);
    });
  });

  describe("Campaign & Financial Attribution Formulas", () => {
    it("calculates completion rate, on-time rate, and ROI accurately", () => {
      const metrics = computeMetricsFromTotals({
        plannedDeliverables: 10,
        completedDeliverables: 8,
        publishedDeliverables: 8,
        onTimeDeliverables: 7,
        totalReach: 100000,
        totalEngagements: 8500,
        trackedClicks: 2500,
        attributedOrders: 150,
        attributedTickets: 300,
        grossRevenue: 45000,
        discountAmount: 4500,
        refundAmount: 500,
        netRevenue: 40000,
        campaignSpend: 25000,
      });

      // Completion Rate: 8 / 10 * 100 = 80%
      expect(metrics.completionRate).toBe(80);

      // On-Time Rate: 7 / 8 * 100 = 87.5%
      expect(metrics.onTimeRate).toBe(87.5);

      // Engagement Rate: 8500 / 100000 * 100 = 8.5%
      expect(metrics.engagementRate).toBe(8.5);

      // Conversion Rate: 150 / 2500 * 100 = 6%
      expect(metrics.conversionRate).toBe(6);

      // Cost Per Ticket: 25000 / 300 = 83.33 QAR
      expect(metrics.costPerTicket).toBeCloseTo(83.33, 2);

      // Attributed Return (ROI): (40000 - 25000) / 25000 * 100 = 60%
      expect(metrics.attributedReturn).toBe(60);
    });

    it("safely handles zero denominators without NaN or Infinity", () => {
      const zeroMetrics = computeMetricsFromTotals({
        plannedDeliverables: 0,
        completedDeliverables: 0,
        publishedDeliverables: 0,
        onTimeDeliverables: 0,
        totalReach: 0,
        totalEngagements: 0,
        trackedClicks: 0,
        attributedOrders: 0,
        attributedTickets: 0,
        grossRevenue: 0,
        discountAmount: 0,
        refundAmount: 0,
        netRevenue: 0,
        campaignSpend: 0,
      });

      expect(zeroMetrics.completionRate).toBe(0);
      expect(zeroMetrics.onTimeRate).toBe(0);
      expect(zeroMetrics.engagementRate).toBe(0);
      expect(zeroMetrics.conversionRate).toBe(0);
      expect(zeroMetrics.costPerTicket).toBe(0);
      expect(zeroMetrics.attributedReturn).toBe(0);
    });
  });
});
