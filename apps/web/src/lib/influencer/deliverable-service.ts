import db from '@/lib/db';
import { logInfluencerAuditEvent } from './audit-service';
import { sendInfluencerNotification } from './notification-service';
import type { DeliverableStatus, ContentReviewDecision, SocialPlatform, ContentType } from './types';

/**
 * Creates a deliverable specification for an assigned creator
 */
export async function createDeliverable(input: {
  campaignCreatorId: string;
  platform: SocialPlatform;
  contentType: ContentType;
  title: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  quantity?: number;
  draftDueAt?: Date | string | null;
  publishDueAt?: Date | string | null;
  approvalRequired?: boolean;
  clientApprovalRequired?: boolean;
  mandatoryMessageEn?: string | null;
  mandatoryMessageAr?: string | null;
  hashtags?: string[];
  mentions?: string[];
  promoCodeId?: string | null;
  trackingLinkId?: string | null;
  usageRights?: string | null;
  assignedReviewerId?: string | null;
  actorId?: string;
}) {
  const deliverable = await (db as any).campaignDeliverable.create({
    data: {
      campaignCreatorId: input.campaignCreatorId,
      platform: input.platform,
      contentType: input.contentType,
      title: input.title,
      descriptionEn: input.descriptionEn || null,
      descriptionAr: input.descriptionAr || null,
      quantity: input.quantity || 1,
      draftDueAt: input.draftDueAt ? new Date(input.draftDueAt) : null,
      publishDueAt: input.publishDueAt ? new Date(input.publishDueAt) : null,
      approvalRequired: input.approvalRequired !== undefined ? input.approvalRequired : true,
      clientApprovalRequired: Boolean(input.clientApprovalRequired),
      mandatoryMessageEn: input.mandatoryMessageEn || null,
      mandatoryMessageAr: input.mandatoryMessageAr || null,
      hashtags: input.hashtags || [],
      mentions: input.mentions || [],
      promoCodeId: input.promoCodeId || null,
      trackingLinkId: input.trackingLinkId || null,
      usageRights: input.usageRights || null,
      status: 'PLANNED',
      assignedReviewerId: input.assignedReviewerId || null,
    },
  });

  await logInfluencerAuditEvent({
    action: 'CREATE_DELIVERABLE',
    entity: 'CampaignDeliverable',
    entityId: deliverable.id,
    userId: input.actorId,
    metadata: { title: deliverable.title, platform: deliverable.platform },
  });

  return deliverable;
}

/**
 * Creates an immutable versioned content submission (Section 13)
 */
export async function submitDeliverableDraft({
  deliverableId,
  captionEn,
  captionAr,
  submissionNotes,
  assetIds,
  externalPreviewUrl,
  submittedByType = 'CREATOR',
  submittedById,
}: {
  deliverableId: string;
  captionEn?: string | null;
  captionAr?: string | null;
  submissionNotes?: string | null;
  assetIds: string[];
  externalPreviewUrl?: string | null;
  submittedByType?: 'CREATOR' | 'ADMIN';
  submittedById?: string;
}) {
  const deliverable = await (db as any).campaignDeliverable.findUnique({
    where: { id: deliverableId },
    include: {
      campaignCreator: {
        include: {
          influencer: true,
          campaign: true,
        },
      },
    },
  });

  if (!deliverable) throw new Error('Deliverable not found');

  // Compute next version number
  const latestSubmission = await (db as any).contentSubmission.findFirst({
    where: { deliverableId },
    orderBy: { version: 'desc' },
  });
  const nextVersion = latestSubmission ? latestSubmission.version + 1 : 1;

  // Create submission inside a transaction and transition status
  const submission = await (db as any).$transaction(async (tx: any) => {
    const sub = await tx.contentSubmission.create({
      data: {
        deliverableId,
        version: nextVersion,
        captionEn: captionEn || null,
        captionAr: captionAr || null,
        submissionNotes: submissionNotes || null,
        assetIds,
        externalPreviewUrl: externalPreviewUrl || null,
        submittedByType,
        submittedById: submittedById || null,
      },
    });

    await tx.campaignDeliverable.update({
      where: { id: deliverableId },
      data: { status: 'SUBMITTED' },
    });

    return sub;
  });

  await logInfluencerAuditEvent({
    action: 'SUBMIT_CONTENT',
    entity: 'ContentSubmission',
    entityId: submission.id,
    userId: submittedById,
    metadata: { deliverableId, version: nextVersion },
  });

  // Notify assigned reviewer or admin
  await sendInfluencerNotification({
    type: 'DRAFT_SUBMITTED',
    title: `Draft Submitted (v${nextVersion}): ${deliverable.title}`,
    message: `${deliverable.campaignCreator.influencer.displayName} submitted a new draft for "${deliverable.title}". Review is required.`,
    actionUrl: `/en/dashboard/marketing/influencers/content-review`,
    dedupKey: `draft:${submission.id}`,
  });

  return submission;
}

/**
 * Reviews a content submission (Section 13)
 */
export async function reviewSubmission({
  submissionId,
  decision,
  feedbackEn,
  feedbackAr,
  reviewerId,
  reviewerType = 'STAFF',
  isClientReview = false,
}: {
  submissionId: string;
  decision: ContentReviewDecision;
  feedbackEn?: string | null;
  feedbackAr?: string | null;
  reviewerId?: string;
  reviewerType?: 'STAFF' | 'CLIENT';
  isClientReview?: boolean;
}) {
  const submission = await (db as any).contentSubmission.findUnique({
    where: { id: submissionId },
    include: {
      deliverable: {
        include: {
          campaignCreator: {
            include: {
              influencer: true,
              campaign: true,
            },
          },
        },
      },
    },
  });

  if (!submission) throw new Error('Submission not found');

  const deliverable = submission.deliverable;

  // Execute in transaction
  const review = await (db as any).$transaction(async (tx: any) => {
    const rev = await tx.contentReview.create({
      data: {
        submissionId,
        decision,
        reviewerId: reviewerId || null,
        reviewerType,
        feedbackEn: feedbackEn || null,
        feedbackAr: feedbackAr || null,
        isClientReview,
      },
    });

    // Determine deliverable status
    let nextStatus: DeliverableStatus = deliverable.status;
    if (decision === 'APPROVED' || decision === 'APPROVED_WITH_NOTES') {
      nextStatus = 'APPROVED';
    } else if (decision === 'REVISION_REQUESTED') {
      nextStatus = 'REVISION_REQUESTED';
    } else if (decision === 'REJECTED') {
      nextStatus = 'CANCELLED';
    } else if (decision === 'ESCALATED') {
      nextStatus = 'UNDER_REVIEW';
    }

    await tx.campaignDeliverable.update({
      where: { id: deliverable.id },
      data: { status: nextStatus },
    });

    return rev;
  });

  await logInfluencerAuditEvent({
    action: `REVIEW_${decision}`,
    entity: 'ContentReview',
    entityId: review.id,
    userId: reviewerId,
    metadata: { submissionId, decision, feedbackEn },
  });

  // Notify creator of decision
  const creator = deliverable.campaignCreator.influencer;
  if (creator?.email) {
    const isApproved = decision === 'APPROVED' || decision === 'APPROVED_WITH_NOTES';
    await sendInfluencerNotification({
      type: isApproved ? 'CONTENT_APPROVED' : 'REVISION_REQUESTED',
      recipientEmail: creator.email,
      recipientName: creator.displayName,
      title: isApproved ? `Content Approved: ${deliverable.title}` : `Revisions Requested: ${deliverable.title}`,
      message: isApproved
        ? `Your submission for "${deliverable.title}" was approved. You may proceed with publication according to the campaign schedule.`
        : `Feedback was provided on your submission for "${deliverable.title}": ${feedbackEn || 'Please review notes in portal and submit a revision.'}`,
      dedupKey: `rev:${review.id}`,
    });
  }

  return review;
}

/**
 * Verifies public publication of a deliverable (Section 13)
 */
export async function verifyPublication({
  deliverableId,
  publishedUrl,
  verifiedById,
}: {
  deliverableId: string;
  publishedUrl: string;
  verifiedById?: string;
}) {
  const deliverable = await (db as any).campaignDeliverable.findUnique({
    where: { id: deliverableId },
  });

  if (!deliverable) throw new Error('Deliverable not found');

  // Validate URL
  try {
    const parsed = new URL(publishedUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
  } catch (_e) {
    throw new Error('A valid public URL is required to verify publication.');
  }

  const updated = await (db as any).campaignDeliverable.update({
    where: { id: deliverableId },
    data: {
      publishedUrl,
      publishedAt: deliverable.publishedAt || new Date(),
      verifiedAt: new Date(),
      verifiedById: verifiedById || null,
      status: 'VERIFIED',
    },
  });

  await logInfluencerAuditEvent({
    action: 'VERIFY_PUBLICATION',
    entity: 'CampaignDeliverable',
    entityId: deliverableId,
    userId: verifiedById,
    metadata: { publishedUrl },
  });

  return updated;
}

/**
 * Transfers rights-cleared approved UGC to the Media Library (Section 17)
 */
export async function transferUgcToMediaLibrary({
  deliverableId,
  actorId,
}: {
  deliverableId: string;
  actorId?: string;
}) {
  const deliverable = await (db as any).campaignDeliverable.findUnique({
    where: { id: deliverableId },
    include: {
      campaignCreator: {
        include: {
          influencer: true,
          campaign: true,
        },
      },
      submissions: {
        orderBy: { version: 'desc' },
        take: 1,
      },
    },
  });

  if (!deliverable) throw new Error('Deliverable not found');
  if (deliverable.status !== 'APPROVED' && deliverable.status !== 'VERIFIED' && deliverable.status !== 'COMPLETED') {
    throw new Error('Content must have final approval before transferring to Media Library.');
  }

  const latestSub = deliverable.submissions[0];
  const creator = deliverable.campaignCreator.influencer;
  const campaign = deliverable.campaignCreator.campaign;

  const transferredRecords = [];

  // Transfer each asset ID as a Media record
  for (const assetUrl of latestSub?.assetIds || []) {
    const media = await (db as any).media.create({
      data: {
        url: assetUrl,
        type: 'IMAGE',
        mimeType: 'image/jpeg',
        size: 0,
        alt: {
          en: `UGC by ${creator.displayName} for ${campaign.titleEn}`,
          ar: `محتوى تم إنشاؤه بواسطة ${creator.displayName} لحملة ${campaign.titleAr}`,
        },
        metadata: {
          source: 'INFLUENCER_UGC',
          influencerId: creator.id,
          creatorName: creator.displayName,
          campaignId: campaign.id,
          campaignTitle: campaign.titleEn,
          deliverableId: deliverable.id,
          publishedUrl: deliverable.publishedUrl || null,
          transferredAt: new Date().toISOString(),
          transferredBy: actorId || 'System',
        },
        uploadedBy: actorId || null,
      },
    });
    transferredRecords.push(media);
  }

  await logInfluencerAuditEvent({
    action: 'TRANSFER_TO_MEDIA_LIBRARY',
    entity: 'CampaignDeliverable',
    entityId: deliverableId,
    userId: actorId,
    metadata: { transferredCount: transferredRecords.length },
  });

  return transferredRecords;
}
