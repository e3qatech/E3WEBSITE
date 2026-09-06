import type {
  InfluencerStatus,
  ApplicationStatus,
  CampaignStatus,
  CampaignCreatorStatus,
  DeliverableStatus,
  PaymentStatus,
} from './types';

/**
 * Centralized State Transition Maps across the Influencer & Creator domain.
 * Enforces business flow rules and prevents illegal or arbitrary status jumps.
 */

export const INFLUENCER_STATUS_TRANSITIONS: Record<InfluencerStatus, readonly InfluencerStatus[]> = {
  PROSPECT: ['INVITED', 'APPLICATION_SUBMITTED', 'UNDER_REVIEW', 'ARCHIVED'],
  INVITED: ['APPLICATION_SUBMITTED', 'UNDER_REVIEW', 'ARCHIVED'],
  APPLICATION_SUBMITTED: ['UNDER_REVIEW', 'ARCHIVED'],
  UNDER_REVIEW: ['MORE_INFORMATION_REQUIRED', 'APPROVED', 'RESTRICTED', 'ARCHIVED'],
  MORE_INFORMATION_REQUIRED: ['UNDER_REVIEW', 'ARCHIVED'],
  APPROVED: ['ACTIVE', 'PAUSED', 'RESTRICTED', 'ARCHIVED'],
  ACTIVE: ['PAUSED', 'RESTRICTED', 'ARCHIVED'],
  PAUSED: ['ACTIVE', 'RESTRICTED', 'ARCHIVED'],
  RESTRICTED: ['UNDER_REVIEW', 'ARCHIVED'],
  ARCHIVED: ['PROSPECT', 'UNDER_REVIEW'],
} as const;

export const APPLICATION_STATUS_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED', 'WITHDRAWN'],
  SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN'],
  UNDER_REVIEW: ['MORE_INFORMATION_REQUIRED', 'APPROVED', 'DECLINED', 'WITHDRAWN'],
  MORE_INFORMATION_REQUIRED: ['UNDER_REVIEW', 'WITHDRAWN', 'DECLINED'],
  APPROVED: [],
  DECLINED: ['UNDER_REVIEW'], // Administrative appeal / reconsideration
  WITHDRAWN: [],
} as const;

export const CAMPAIGN_STATUS_TRANSITIONS: Record<CampaignStatus, readonly CampaignStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED', 'ARCHIVED'],
  PENDING_APPROVAL: ['APPROVED', 'DRAFT', 'CANCELLED'],
  APPROVED: ['INVITING', 'ACTIVE', 'PAUSED', 'CANCELLED'],
  INVITING: ['ACTIVE', 'PAUSED', 'CANCELLED'],
  ACTIVE: ['PAUSED', 'COMPLETED', 'CANCELLED'],
  PAUSED: ['ACTIVE', 'CANCELLED'],
  COMPLETED: ['ARCHIVED'],
  CANCELLED: ['ARCHIVED'],
  ARCHIVED: [],
} as const;

export const CAMPAIGN_CREATOR_TRANSITIONS: Record<CampaignCreatorStatus, readonly CampaignCreatorStatus[]> = {
  SHORTLISTED: ['APPROVAL_REQUIRED', 'APPROVED', 'CANCELLED'],
  APPROVAL_REQUIRED: ['APPROVED', 'SHORTLISTED', 'CANCELLED'],
  APPROVED: ['INVITED', 'CANCELLED'],
  INVITED: ['ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED'],
  ACCEPTED: ['NEGOTIATING', 'CONTRACTED', 'CANCELLED'],
  NEGOTIATING: ['CONTRACTED', 'DECLINED', 'CANCELLED'],
  CONTRACTED: ['BRIEFED', 'CANCELLED'],
  BRIEFED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  DECLINED: [],
  EXPIRED: ['INVITED'], // Re-issue invitation
  CANCELLED: [],
} as const;

export const DELIVERABLE_STATUS_TRANSITIONS: Record<DeliverableStatus, readonly DeliverableStatus[]> = {
  PLANNED: ['BRIEFED', 'DRAFT_DUE', 'CANCELLED'],
  BRIEFED: ['DRAFT_DUE', 'SUBMITTED', 'CANCELLED'],
  DRAFT_DUE: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'CANCELLED'],
  UNDER_REVIEW: ['REVISION_REQUESTED', 'APPROVED', 'CANCELLED'],
  REVISION_REQUESTED: ['SUBMITTED', 'CANCELLED'],
  APPROVED: ['SCHEDULED', 'PUBLISHED', 'CANCELLED'],
  SCHEDULED: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['VERIFIED', 'CANCELLED'],
  VERIFIED: ['METRICS_COLLECTED', 'COMPLETED', 'CANCELLED'],
  METRICS_COLLECTED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
} as const;

export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  NOT_APPLICABLE: ['RATE_PROPOSED', 'CANCELLED'],
  RATE_PROPOSED: ['RATE_APPROVED', 'CANCELLED'],
  RATE_APPROVED: ['INVOICE_REQUIRED', 'CANCELLED'],
  INVOICE_REQUIRED: ['INVOICE_RECEIVED', 'ON_HOLD', 'CANCELLED'],
  INVOICE_RECEIVED: ['PAYMENT_SUBMITTED', 'ON_HOLD', 'CANCELLED'],
  PAYMENT_SUBMITTED: ['PAID', 'ON_HOLD', 'CANCELLED'],
  PAID: [],
  ON_HOLD: ['INVOICE_REQUIRED', 'INVOICE_RECEIVED', 'PAYMENT_SUBMITTED', 'CANCELLED'],
  CANCELLED: [],
} as const;

/**
 * Validates if a transition is permitted.
 */
export function isTransitionAllowed<T extends string>(
  transitions: Record<T, readonly T[]>,
  currentStatus: T,
  targetStatus: T
): boolean {
  if (currentStatus === targetStatus) return true; // Idempotent no-op
  const allowed = transitions[currentStatus];
  return Boolean(allowed && (allowed as readonly string[]).includes(targetStatus));
}

/**
 * Asserts that a transition is allowed or throws an error.
 */
export function assertTransition<T extends string>(
  entityName: string,
  transitions: Record<T, readonly T[]>,
  currentStatus: T,
  targetStatus: T
): void {
  if (!isTransitionAllowed(transitions, currentStatus, targetStatus)) {
    throw new Error(
      `Illegal ${entityName} status transition from '${currentStatus}' to '${targetStatus}'. Allowed: [${
        (transitions[currentStatus] || []).join(', ')
      }]`
    );
  }
}

// Ergonomic aliases
export const isValidTransition = isTransitionAllowed;
export const INFLUENCER_TRANSITIONS = INFLUENCER_STATUS_TRANSITIONS;
export const APPLICATION_TRANSITIONS = APPLICATION_STATUS_TRANSITIONS;
export const CAMPAIGN_TRANSITIONS = CAMPAIGN_STATUS_TRANSITIONS;
export const DELIVERABLE_TRANSITIONS = DELIVERABLE_STATUS_TRANSITIONS;
export const PAYMENT_TRANSITIONS = PAYMENT_STATUS_TRANSITIONS;

