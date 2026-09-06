import type { InfluencerScoringWeights, InfluencerScoreBreakdown } from './types';

export const DEFAULT_SCORING_WEIGHTS: InfluencerScoringWeights = {
  audienceFitWeight: 25,
  engagementQualityWeight: 20,
  contentQualityWeight: 20,
  brandSuitabilityWeight: 15,
  eventRelevanceWeight: 10,
  reliabilityWeight: 10,
};

export interface ScoreComponentsInput {
  audienceFit?: number | null;
  engagementQuality?: number | null;
  contentQuality?: number | null;
  brandSuitability?: number | null;
  eventRelevance?: number | null;
  reliability?: number | null;
}

/**
 * Validates that scoring weights sum to 100
 */
export function validateWeightsSum(weights: InfluencerScoringWeights): boolean {
  const sum =
    weights.audienceFitWeight +
    weights.engagementQualityWeight +
    weights.contentQualityWeight +
    weights.brandSuitabilityWeight +
    weights.eventRelevanceWeight +
    weights.reliabilityWeight;
  return sum === 100;
}

/**
 * Ergonomic alias for weight validation
 */
export function validateScoringWeights(weights: any): boolean {
  const normalized: InfluencerScoringWeights = {
    audienceFitWeight: weights.audienceFit !== undefined ? weights.audienceFit : (weights.audienceFitWeight ?? 0),
    engagementQualityWeight: weights.engagementQuality !== undefined ? weights.engagementQuality : (weights.engagementQualityWeight ?? 0),
    contentQualityWeight: weights.contentQuality !== undefined ? weights.contentQuality : (weights.contentQualityWeight ?? 0),
    brandSuitabilityWeight: weights.brandSuitability !== undefined ? weights.brandSuitability : (weights.brandSuitabilityWeight ?? 0),
    eventRelevanceWeight: weights.eventRelevance !== undefined ? weights.eventRelevance : (weights.eventRelevanceWeight ?? 0),
    reliabilityWeight: weights.reliability !== undefined ? weights.reliability : (weights.reliabilityWeight ?? 0),
  };
  return validateWeightsSum(normalized);
}

/**
 * Calculates the weighted score based on component scores (0-100) and weights.
 * Returns null if not enough information (any critical component missing).
 */
export function calculateWeightedScore(
  components: ScoreComponentsInput,
  weights: InfluencerScoringWeights = DEFAULT_SCORING_WEIGHTS
): InfluencerScoreBreakdown | null {
  const {
    audienceFit,
    engagementQuality,
    contentQuality,
    brandSuitability,
    eventRelevance,
    reliability,
  } = components;

  // "Show 'Not enough information' instead of manufacturing a score"
  if (
    audienceFit === undefined || audienceFit === null ||
    engagementQuality === undefined || engagementQuality === null ||
    contentQuality === undefined || contentQuality === null ||
    brandSuitability === undefined || brandSuitability === null
  ) {
    return null;
  }

  // Bound each component between 0 and 100
  const clamp = (val: number) => Math.min(100, Math.max(0, val));

  const cAudience = clamp(audienceFit);
  const cEngage = clamp(engagementQuality);
  const cContent = clamp(contentQuality);
  const cBrand = clamp(brandSuitability);
  const cEvent = clamp(eventRelevance ?? 50); // Neutral default if not yet assigned to specific event
  const cReliable = clamp(reliability ?? 75); // Neutral-high default for new unrated creators

  const weightedTotal =
    (cAudience * weights.audienceFitWeight +
      cEngage * weights.engagementQualityWeight +
      cContent * weights.contentQualityWeight +
      cBrand * weights.brandSuitabilityWeight +
      cEvent * weights.eventRelevanceWeight +
      cReliable * weights.reliabilityWeight) /
    100;

  return {
    audienceFit: cAudience,
    engagementQuality: cEngage,
    contentQuality: cContent,
    brandSuitability: cBrand,
    eventRelevance: cEvent,
    reliability: cReliable,
    totalScore: Math.round(weightedTotal * 100) / 100,
    isAdvisoryOnly: true,
    weightsUsed: weights,
  };
}

/**
 * Returns total score as a number directly or null
 */
export function calculateInfluencerScore(
  components: ScoreComponentsInput,
  weights?: any
): number | null {
  const normalizedWeights: InfluencerScoringWeights = weights
    ? {
        audienceFitWeight: weights.audienceFitWeight ?? weights.audienceFit ?? 25,
        engagementQualityWeight: weights.engagementQualityWeight ?? weights.engagementQuality ?? 20,
        contentQualityWeight: weights.contentQualityWeight ?? weights.contentQuality ?? 20,
        brandSuitabilityWeight: weights.brandSuitabilityWeight ?? weights.brandSuitability ?? 15,
        eventRelevanceWeight: weights.eventRelevanceWeight ?? weights.eventRelevance ?? 10,
        reliabilityWeight: weights.reliabilityWeight ?? weights.reliability ?? 10,
      }
    : DEFAULT_SCORING_WEIGHTS;

  const result = calculateWeightedScore(components, normalizedWeights);
  return result ? result.totalScore : null;
}

/**
 * Retrieves the currently active scoring configuration weights from database
 */
export async function getScoringWeights(): Promise<InfluencerScoringWeights> {
  const db = (await import('@/lib/db')).default;
  const config = await (db as any).influencerScoringConfig.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return config
    ? {
        audienceFitWeight: config.audienceFitWeight,
        engagementQualityWeight: config.engagementQualityWeight,
        contentQualityWeight: config.contentQualityWeight,
        brandSuitabilityWeight: config.brandSuitabilityWeight,
        eventRelevanceWeight: config.eventRelevanceWeight,
        reliabilityWeight: config.reliabilityWeight,
      }
    : DEFAULT_SCORING_WEIGHTS;
}


