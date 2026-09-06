import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateCreatorToken } from '@/lib/influencer/tokens';
import { submitDeliverableDraft } from '@/lib/influencer/deliverable-service';
import { updateAgreementStatus, submitInfluencerInvoice } from '@/lib/influencer/commercial-service';
import { logInfluencerAuditEvent } from '@/lib/influencer/audit-service';
import { sendInfluencerNotification } from '@/lib/influencer/notification-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const validation = await validateCreatorToken(token);

  if (!validation.isValid) {
    return NextResponse.json({ error: `Token invalid: ${validation.reason}` }, { status: 401 });
  }

  const tokenRecord = validation.tokenRecord;
  const influencer = tokenRecord.influencer;
  const campaignCreator = tokenRecord.campaignCreator;

  // Strict data projection: never expose internal notes, scores, rates of other creators, internal budgets (Section 6)
  const scopedData = {
    scope: tokenRecord.scope,
    expiresAt: tokenRecord.expiresAt,
    creator: {
      id: influencer.id,
      displayName: influencer.displayName,
      profileImage: influencer.profileImage,
      bioEn: influencer.bioEn,
      bioAr: influencer.bioAr,
      location: influencer.location,
      nationality: influencer.nationality,
      categories: influencer.categories,
      languages: influencer.languages,
      platforms: influencer.platforms.map((p: any) => ({
        platform: p.platform,
        handle: p.handle,
        profileUrl: p.profileUrl,
        followerCount: p.followerCount,
      })),
    },
    campaign: campaignCreator
      ? {
          assignmentId: campaignCreator.id,
          status: campaignCreator.status,
          collaborationType: campaignCreator.collaborationType,
          proposedRate: campaignCreator.proposedRate ? Number(campaignCreator.proposedRate) : null,
          agreedRate: campaignCreator.agreedRate ? Number(campaignCreator.agreedRate) : null,
          currency: campaignCreator.currency,
          invitedAt: campaignCreator.invitedAt,
          invitationExpiresAt: campaignCreator.invitationExpiresAt,
          campaign: {
            id: campaignCreator.campaign.id,
            titleEn: campaignCreator.campaign.titleEn,
            titleAr: campaignCreator.campaign.titleAr,
            descriptionEn: campaignCreator.campaign.descriptionEn,
            descriptionAr: campaignCreator.campaign.descriptionAr,
            campaignType: campaignCreator.campaign.campaignType,
            startDate: campaignCreator.campaign.startDate,
            endDate: campaignCreator.campaign.endDate,
            defaultUsageRights: campaignCreator.campaign.defaultUsageRights,
          },
          deliverables: campaignCreator.deliverables.map((d: any) => ({
            id: d.id,
            platform: d.platform,
            contentType: d.contentType,
            title: d.title,
            descriptionEn: d.descriptionEn,
            descriptionAr: d.descriptionAr,
            draftDueAt: d.draftDueAt,
            publishDueAt: d.publishDueAt,
            mandatoryMessageEn: d.mandatoryMessageEn,
            mandatoryMessageAr: d.mandatoryMessageAr,
            hashtags: d.hashtags,
            mentions: d.mentions,
            status: d.status,
            publishedUrl: d.publishedUrl,
            submissions: d.submissions.map((s: any) => ({
              id: s.id,
              version: s.version,
              captionEn: s.captionEn,
              captionAr: s.captionAr,
              assetIds: s.assetIds,
              externalPreviewUrl: s.externalPreviewUrl,
              submittedAt: s.submittedAt,
              reviews: s.reviews
                .filter((r: any) => !r.isClientReview) // Client internal feedback hidden
                .map((r: any) => ({
                  decision: r.decision,
                  feedbackEn: r.feedbackEn,
                  feedbackAr: r.feedbackAr,
                  createdAt: r.createdAt,
                })),
            })),
          })),
          attendance: campaignCreator.attendanceRecords.map((a: any) => ({
            id: a.id,
            eventDate: a.eventDate,
            arrivalWindowStart: a.arrivalWindowStart,
            arrivalWindowEnd: a.arrivalWindowEnd,
            guestCount: a.guestCount,
            accreditationReference: a.accreditationReference,
            qrReference: a.qrReference,
            parkingInstructions: a.parkingInstructions,
            specialRequirements: a.specialRequirements,
            status: a.status,
          })),
          promoCodes: campaignCreator.promoCodes.map((pc: any) => ({
            code: pc.code,
            discountType: pc.discountType,
            discountValue: Number(pc.discountValue),
            currency: pc.currency,
            validFrom: pc.validFrom,
            validUntil: pc.validUntil,
          })),
        }
      : null,
  };

  return NextResponse.json(scopedData);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const validation = await validateCreatorToken(token);

  if (!validation.isValid) {
    return NextResponse.json({ error: `Token invalid: ${validation.reason}` }, { status: 401 });
  }

  const tokenRecord = validation.tokenRecord;
  const influencer = tokenRecord.influencer;
  const campaignCreator = tokenRecord.campaignCreator;

  try {
    const body = await req.json();
    const action = body.action;

    if (action === 'ACCEPT_INVITATION') {
      if (!campaignCreator) throw new Error('No campaign assignment associated with this token');
      if (campaignCreator.status !== 'INVITED') {
        throw new Error(`Cannot accept invitation in '${campaignCreator.status}' state`);
      }

      const updated = await (db as any).campaignCreator.update({
        where: { id: campaignCreator.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          respondedAt: new Date(),
        },
      });

      await logInfluencerAuditEvent({
        action: 'CREATOR_ACCEPTED_INVITATION',
        entity: 'CampaignCreator',
        entityId: campaignCreator.id,
        metadata: { creatorName: influencer.displayName },
      });

      await sendInfluencerNotification({
        type: 'INVITATION_ACCEPTED',
        title: 'Creator Accepted Invitation',
        message: `${influencer.displayName} accepted the invitation for "${campaignCreator.campaign.titleEn}".`,
        actionUrl: `/en/dashboard/marketing/influencers/campaigns/${campaignCreator.campaignId}`,
      });

      return NextResponse.json(updated);
    }

    if (action === 'DECLINE_INVITATION') {
      if (!campaignCreator) throw new Error('No campaign assignment associated with this token');

      const updated = await (db as any).campaignCreator.update({
        where: { id: campaignCreator.id },
        data: {
          status: 'DECLINED',
          declinedAt: new Date(),
          respondedAt: new Date(),
          declineReason: body.declineReason || null,
        },
      });

      await logInfluencerAuditEvent({
        action: 'CREATOR_DECLINED_INVITATION',
        entity: 'CampaignCreator',
        entityId: campaignCreator.id,
        metadata: { declineReason: body.declineReason },
      });

      await sendInfluencerNotification({
        type: 'INVITATION_DECLINED',
        title: 'Creator Declined Invitation',
        message: `${influencer.displayName} declined the invitation for "${campaignCreator.campaign.titleEn}".`,
        actionUrl: `/en/dashboard/marketing/influencers/campaigns/${campaignCreator.campaignId}`,
      });

      return NextResponse.json(updated);
    }

    if (action === 'SUBMIT_CONTENT') {
      const { deliverableId, captionEn, captionAr, submissionNotes, assetIds, externalPreviewUrl } = body;

      // Ensure deliverable belongs to this scoped campaign creator
      const deliverable = await (db as any).campaignDeliverable.findFirst({
        where: { id: deliverableId, campaignCreatorId: campaignCreator?.id },
      });

      if (!deliverable) {
        throw new Error('Deliverable not found or does not belong to this creator portal session.');
      }

      const submission = await submitDeliverableDraft({
        deliverableId,
        captionEn,
        captionAr,
        submissionNotes,
        assetIds: Array.isArray(assetIds) ? assetIds : [],
        externalPreviewUrl,
        submittedByType: 'CREATOR',
        submittedById: influencer.id,
      });

      return NextResponse.json(submission, { status: 201 });
    }

    if (action === 'SUBMIT_LIVE_URL') {
      const { deliverableId, publishedUrl } = body;
      const deliverable = await (db as any).campaignDeliverable.findFirst({
        where: { id: deliverableId, campaignCreatorId: campaignCreator?.id },
      });

      if (!deliverable) throw new Error('Deliverable not found');

      const updated = await (db as any).campaignDeliverable.update({
        where: { id: deliverableId },
        data: {
          publishedUrl,
          publishedAt: new Date(),
          status: 'PUBLISHED', // Pending E3 administrative verification
        },
      });

      await sendInfluencerNotification({
        type: 'PUBLISHED_URL_SUBMITTED',
        title: 'Publication URL Submitted',
        message: `${influencer.displayName} submitted live URL for "${deliverable.title}". Administrative verification is required.`,
        actionUrl: `/en/dashboard/marketing/influencers/content-review`,
      });

      return NextResponse.json(updated);
    }

    if (action === 'UPDATE_PROFILE') {
      const { bioEn, bioAr, location, nationality, website } = body;
      const updated = await (db as any).influencer.update({
        where: { id: influencer.id },
        data: {
          bioEn: bioEn !== undefined ? bioEn : influencer.bioEn,
          bioAr: bioAr !== undefined ? bioAr : influencer.bioAr,
          location: location !== undefined ? location : influencer.location,
          nationality: nationality !== undefined ? nationality : influencer.nationality,
          website: website !== undefined ? website : influencer.website,
        },
      });

      return NextResponse.json(updated);
    }

    if (action === 'SIGN_AGREEMENT') {
      if (!campaignCreator) throw new Error('No campaign assignment associated with this token');
      const { agreementId } = body;

      const agreement = await (db as any).influencerAgreement.findFirst({
        where: { id: agreementId, campaignCreatorId: campaignCreator.id },
      });
      if (!agreement) throw new Error('Agreement not found or unauthorized');

      const updated = await updateAgreementStatus({
        agreementId,
        signedByCreator: true,
        actorId: influencer.id,
      });

      await sendInfluencerNotification({
        type: 'AGREEMENT_SIGNED',
        title: 'Agreement Signed by Creator',
        message: `${influencer.displayName} signed the agreement for "${campaignCreator.campaign.titleEn}".`,
        actionUrl: `/en/dashboard/marketing/influencers/campaigns/${campaignCreator.campaignId}`,
      });

      return NextResponse.json(updated);
    }

    if (action === 'SUBMIT_INVOICE') {
      if (!campaignCreator) throw new Error('No campaign assignment associated with this token');
      const { invoiceNumber, invoiceAssetId, amount } = body;

      if (!invoiceNumber) throw new Error('Invoice number is required');

      const payment = await submitInfluencerInvoice({
        campaignCreatorId: campaignCreator.id,
        invoiceAssetId: invoiceAssetId || null,
        invoiceNumber,
        amount: amount || Number(campaignCreator.agreedRate) || 0,
        currency: campaignCreator.currency || 'QAR',
        actorId: influencer.id,
      });

      await sendInfluencerNotification({
        type: 'INVOICE_SUBMITTED',
        title: 'Creator Submitted Invoice',
        message: `${influencer.displayName} submitted invoice #${invoiceNumber} for "${campaignCreator.campaign.titleEn}".`,
        actionUrl: `/en/dashboard/marketing/influencers/campaigns/${campaignCreator.campaignId}`,
      });

      return NextResponse.json(payment, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown portal action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

}
