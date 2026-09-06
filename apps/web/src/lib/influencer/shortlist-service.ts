import db from '@/lib/db';
import { assertTransition, CAMPAIGN_CREATOR_TRANSITIONS } from './transitions';
import { logInfluencerAuditEvent } from './audit-service';
import { createSecureCreatorToken } from './tokens';
import { sendInfluencerNotification } from './notification-service';
import type { CollaborationType } from './types';

/**
 * Adds an influencer to a campaign's creator shortlist.
 * Enforces assignment uniqueness.
 */
export async function shortlistCreatorForCampaign({
  campaignId,
  influencerId,
  collaborationType = 'PAID',
  proposedRate,
  currency = 'QAR',
  actorId,
}: {
  campaignId: string;
  influencerId: string;
  collaborationType?: CollaborationType;
  proposedRate?: number;
  currency?: string;
  actorId?: string;
}) {
  const existing = await (db as any).campaignCreator.findUnique({
    where: {
      campaignId_influencerId: { campaignId, influencerId },
    },
  });

  if (existing) {
    throw new Error('Creator is already assigned or shortlisted for this campaign.');
  }

  const assignment = await (db as any).campaignCreator.create({
    data: {
      campaignId,
      influencerId,
      status: 'SHORTLISTED',
      collaborationType,
      proposedRate: proposedRate !== undefined ? proposedRate : null,
      currency,
    },
    include: {
      influencer: true,
      campaign: true,
    },
  });

  await logInfluencerAuditEvent({
    action: 'SHORTLIST_CREATOR',
    entity: 'CampaignCreator',
    entityId: assignment.id,
    userId: actorId,
    metadata: { campaignId, influencerId },
  });

  return assignment;
}

/**
 * Removes a shortlisted creator from a campaign
 */
export async function removeCreatorFromCampaign(assignmentId: string, actorId?: string) {
  const current = await (db as any).campaignCreator.findUnique({ where: { id: assignmentId } });
  if (!current) throw new Error('Assignment not found');

  if (['CONTRACTED', 'BRIEFED', 'IN_PROGRESS', 'COMPLETED'].includes(current.status)) {
    throw new Error(`Cannot remove creator with active status '${current.status}'. Use cancellation instead.`);
  }

  await (db as any).campaignCreator.delete({ where: { id: assignmentId } });

  await logInfluencerAuditEvent({
    action: 'REMOVE_SHORTLISTED_CREATOR',
    entity: 'CampaignCreator',
    entityId: assignmentId,
    userId: actorId,
  });

  return { success: true };
}

/**
 * Issues invitations to shortlisted creators with expiring secure portal links (Section 6 & 11)
 */
export async function issueCampaignInvitations({
  assignmentIds,
  expiryHours = 24,
  actorId,
  locale = 'en',
}: {
  assignmentIds: string[];
  expiryHours?: 24 | 48 | 72;
  actorId?: string;
  locale?: string;
}) {
  const results = [];

  for (const id of assignmentIds) {
    const assignment = await (db as any).campaignCreator.findUnique({
      where: { id },
      include: {
        influencer: true,
        campaign: true,
      },
    });

    if (!assignment) continue;

    assertTransition('CampaignCreator', CAMPAIGN_CREATOR_TRANSITIONS, assignment.status, 'INVITED');

    // 1. Generate 32-byte secure token for CAMPAIGN_INVITATION scope
    const token = await createSecureCreatorToken({
      influencerId: assignment.influencerId,
      campaignCreatorId: assignment.id,
      scope: 'CAMPAIGN_INVITATION',
      expiryHours,
      createdById: actorId,
      locale,
    });

    // 2. Update assignment status and expiration
    await (db as any).campaignCreator.update({
      where: { id },
      data: {
        status: 'INVITED',
        invitedAt: new Date(),
        invitationExpiresAt: token.expiresAt,
      },
    });

    // 3. Send creator notification with secure link
    if (assignment.influencer?.email) {
      await sendInfluencerNotification({
        type: 'INVITATION_ISSUED',
        recipientEmail: assignment.influencer.email,
        recipientName: assignment.influencer.displayName,
        title: `Campaign Invitation: ${assignment.campaign.titleEn}`,
        message: `You have been selected to collaborate with E3 Qatar on "${assignment.campaign.titleEn}". Review your campaign invitation and brief in the creator portal.`,
        actionUrl: token.portalUrl,
        dedupKey: `inv:${assignment.id}`,
      });
    }

    results.push({
      assignmentId: id,
      portalUrl: token.portalUrl,
      expiresAt: token.expiresAt,
    });
  }

  return results;
}

/**
 * Records an approval gate decision (Marketing, Budget, Client, Content, Payment)
 */
export async function recordApprovalGate({
  campaignId,
  entityType,
  entityId,
  approvalType,
  decision,
  reviewerId,
  reviewerName,
  comment,
}: {
  campaignId: string;
  entityType: string;
  entityId: string;
  approvalType: string;
  decision: 'APPROVED' | 'REJECTED' | 'PENDING';
  reviewerId?: string;
  reviewerName?: string;
  comment?: string;
}) {
  // If re-approving, mark earlier approvals for this entity as stale
  await (db as any).campaignApprovalGate.updateMany({
    where: {
      campaignId,
      entityType,
      entityId,
      approvalType,
    },
    data: { isStale: true },
  });

  const gate = await (db as any).campaignApprovalGate.create({
    data: {
      campaignId,
      entityType,
      entityId,
      approvalType,
      decision,
      reviewerId: reviewerId || null,
      reviewerName: reviewerName || null,
      comment: comment || null,
    },
  });

  await logInfluencerAuditEvent({
    action: `APPROVAL_GATE_${decision}`,
    entity: entityType,
    entityId,
    userId: reviewerId,
    metadata: { approvalType, comment },
  });

  return gate;
}
