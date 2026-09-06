import db from '@/lib/db';
import { assertTransition, APPLICATION_STATUS_TRANSITIONS } from './transitions';
import { logInfluencerAuditEvent } from './audit-service';
import { sendInfluencerNotification } from './notification-service';
import { normalizeEmail, normalizePhone, type PublicApplicationInput } from './validations';
import type { ApplicationStatus } from './types';

/**
 * Handles public creator application intake with duplicate detection and normalization.
 * Returns a neutral success message regardless of prior existence to prevent email enumeration.
 */
export async function submitPublicApplication(input: PublicApplicationInput) {
  const cleanEmail = normalizeEmail(input.email);
  const cleanPhone = normalizePhone(input.phone);

  // 1. Check for duplicate pending application
  const existingApp = await (db as any).influencerApplication.findFirst({
    where: {
      status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      submittedDataJson: {
        path: ['email'],
        equals: cleanEmail,
      },
    },
  });

  if (existingApp) {
    // Return neutral success response (Section 7)
    return {
      success: true,
      messageEn: 'Your application has been received. Our marketing team will review your profile.',
      messageAr: 'تم استلام طلبك بنجاح. سيقوم فريق التسويق بمراجعة ملفك الشخصي.',
      isDuplicate: true,
    };
  }

  // 2. Check if influencer already exists in directory by email
  let existingInfluencer = null;
  if (cleanEmail) {
    existingInfluencer = await (db as any).influencer.findFirst({
      where: { email: cleanEmail },
    });
  }

  // 3. Create or link Influencer
  let influencerId = existingInfluencer?.id;
  if (!influencerId) {
    const baseSlug = input.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let slug = baseSlug;
    let count = 1;
    while (await (db as any).influencer.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const createdInf = await (db as any).influencer.create({
      data: {
        displayName: input.displayName,
        legalName: input.legalName,
        slug,
        email: cleanEmail,
        phone: cleanPhone,
        whatsapp: input.whatsapp ? normalizePhone(input.whatsapp) : cleanPhone,
        bioEn: input.bioEn,
        bioAr: input.bioAr || null,
        location: input.location,
        nationality: input.nationality,
        isQatarBased: input.isQatarBased,
        preferredLocale: input.preferredLocale,
        status: 'APPLICATION_SUBMITTED',
        categories: input.categories,
        languages: input.languages,
        website: input.website || null,
        agencyName: input.agencyName || null,
        agencyContactName: input.agencyContactName || null,
        agencyEmail: input.agencyEmail ? normalizeEmail(input.agencyEmail) : null,
        agencyPhone: input.agencyPhone || null,
        publicFeatureEnabled: false, // Default false until staff approval & consent
        dataConsentAt: input.dataConsent ? new Date() : null,
        communicationConsentAt: input.communicationConsent ? new Date() : null,
        publicConsentAt: input.publicFeatureConsent ? new Date() : null,
      },
    });

    influencerId = createdInf.id;

    // Attach platforms
    for (const profile of input.socialProfiles) {
      try {
        await (db as any).influencerPlatform.create({
          data: {
            influencerId,
            platform: profile.platform,
            handle: profile.handle,
            profileUrl: profile.profileUrl,
            followerCount: profile.followerCount || 0,
          },
        });
      } catch (_platformErr) {
        // Ignore duplicate platform constraint error
      }
    }
  }

  // 4. Create InfluencerApplication record
  const application = await (db as any).influencerApplication.create({
    data: {
      influencerId,
      status: 'SUBMITTED',
      source: 'PUBLIC_FORM',
      submittedDataJson: input as any,
    },
  });

  // 5. Audit Log
  await logInfluencerAuditEvent({
    action: 'SUBMIT_APPLICATION',
    entity: 'InfluencerApplication',
    entityId: application.id,
    metadata: { displayName: input.displayName, email: cleanEmail },
  });

  // 6. Notify admin team
  await sendInfluencerNotification({
    type: 'NEW_APPLICATION',
    title: 'New Creator Application',
    message: `${input.displayName} submitted a new creator application for Qatar campaigns.`,
    actionUrl: `/en/dashboard/marketing/influencers/applications`,
    dedupKey: `app:${application.id}`,
  });

  return {
    success: true,
    applicationId: application.id,
    messageEn: 'Your application has been received. Our marketing team will review your profile.',
    messageAr: 'تم استلام طلبك بنجاح. سيقوم فريق التسويق بمراجعة ملفك الشخصي.',
    isDuplicate: false,
  };
}

/**
 * Reviews a creator application (UNDER_REVIEW, MORE_INFORMATION_REQUIRED, APPROVED, DECLINED)
 */
export async function reviewApplication({
  applicationId,
  decision,
  reviewerId,
  reviewNotes,
}: {
  applicationId: string;
  decision: ApplicationStatus;
  reviewerId: string;
  reviewNotes?: string;
}) {
  const app = await (db as any).influencerApplication.findUnique({
    where: { id: applicationId },
    include: { influencer: true },
  });

  if (!app) throw new Error('Application not found');

  assertTransition('Application', APPLICATION_STATUS_TRANSITIONS, app.status, decision);

  // Execute in transaction
  const updated = await (db as any).$transaction(async (tx: any) => {
    const updatedApp = await tx.influencerApplication.update({
      where: { id: applicationId },
      data: {
        status: decision,
        reviewerId,
        reviewNotes,
        reviewedAt: new Date(),
      },
    });

    // Cascade status to influencer if approved or declined
    if (app.influencerId) {
      if (decision === 'APPROVED') {
        await tx.influencer.update({
          where: { id: app.influencerId },
          data: { status: 'APPROVED' },
        });
      } else if (decision === 'DECLINED') {
        await tx.influencer.update({
          where: { id: app.influencerId },
          data: { status: 'ARCHIVED' },
        });
      } else if (decision === 'UNDER_REVIEW') {
        await tx.influencer.update({
          where: { id: app.influencerId },
          data: { status: 'UNDER_REVIEW' },
        });
      }
    }

    return updatedApp;
  });

  await logInfluencerAuditEvent({
    action: 'REVIEW_APPLICATION',
    entity: 'InfluencerApplication',
    entityId: applicationId,
    userId: reviewerId,
    metadata: { decision, reviewNotes },
  });

  // Notify creator
  if (app.influencer?.email) {
    const isApproved = decision === 'APPROVED';
    await sendInfluencerNotification({
      type: isApproved ? 'APPLICATION_APPROVED' : 'APPLICATION_DECLINED',
      recipientEmail: app.influencer.email,
      recipientName: app.influencer.displayName,
      title: isApproved ? 'Welcome to E3 Qatar Creator Roster' : 'Update on your E3 Qatar Creator Application',
      message: isApproved
        ? 'Congratulations! Your creator profile has been approved for E3 Qatar campaigns and activations.'
        : 'Thank you for your interest in E3 Qatar. We have reviewed your application and will keep your profile on file for future opportunities.',
      dedupKey: `review:${applicationId}:${decision}`,
    });
  }

  return updated;
}

/**
 * Lists creator applications with pagination and status filtering
 */
export async function listApplications(params: {
  status?: ApplicationStatus;
  page?: number;
  pageSize?: number;
} = {}) {
  const { status, page = 1, pageSize = 20 } = params;
  const where: any = {};
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    (db as any).influencerApplication.findMany({
      where,
      include: {
        influencer: {
          include: {
            platforms: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    (db as any).influencerApplication.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

