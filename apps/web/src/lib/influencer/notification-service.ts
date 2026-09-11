import { sendEmail, escapeHtml } from '@/lib/email';
import { emitter } from '@/lib/emitter';

export type InfluencerNotificationType =
  | 'NEW_APPLICATION'
  | 'APPLICATION_UNDER_REVIEW'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_DECLINED'
  | 'INVITATION_ISSUED'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_DECLINED'
  | 'INVITATION_COUNTERED'
  | 'BRIEF_ISSUED'
  | 'DRAFT_SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'CONTENT_APPROVED'
  | 'PUBLISHED_URL_SUBMITTED'
  | 'POST_VERIFIED'
  | 'AGREEMENT_SIGNED'
  | 'INVOICE_SUBMITTED'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_COMPLETED';

export interface SendInfluencerNotificationInput {
  type: InfluencerNotificationType;
  recipientEmail?: string | null;
  recipientName?: string | null;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: Record<string, any>;
  dedupKey?: string;
}

// In-memory dedup set for transient deduplication window (60 seconds)
const sentDedupKeys = new Map<string, number>();

/**
 * Dispatches an in-dashboard real-time update and an email notification (if recipient email is present).
 */
export async function sendInfluencerNotification(
  input: SendInfluencerNotificationInput
): Promise<void> {
  const { type, recipientEmail, recipientName, title, message, actionUrl, metadata, dedupKey } = input;

  // Deduplication check
  if (dedupKey) {
    const lastSent = sentDedupKeys.get(dedupKey);
    const now = Date.now();
    if (lastSent && now - lastSent < 60000) {
      console.info(`[Notification Dedup] Skipped duplicate notification: ${dedupKey}`);
      return;
    }
    sentDedupKeys.set(dedupKey, now);
  }

  // 1. Broadcast real-time event to Admin dashboard via Redis/Socket.IO emitter
  try {
    emitter.emit('influencer:notification', {
      type,
      title,
      message,
      actionUrl,
      timestamp: new Date().toISOString(),
      metadata,
    });
  } catch (_e) {
    // Fail silently if socket emitter is offline
  }

  // 2. Dispatch email if recipient email is provided
  if (recipientEmail && recipientEmail.includes('@')) {
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <div style="background: #0f172a; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">E3 QATAR</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Influencer & Creator Ecosystem</p>
          </div>
          <div style="padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 0;">
              Hello ${escapeHtml(recipientName || 'Creator')},
            </p>
            <h2 style="font-size: 18px; color: #0284c7; margin-bottom: 12px;">${escapeHtml(title)}</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              ${escapeHtml(message)}
            </p>
            ${
              actionUrl
                ? `<div style="margin: 28px 0;">
                    <a href="${actionUrl.startsWith('http') ? actionUrl : `https://e3.qa${actionUrl}`}" 
                       style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; display: inline-block;">
                      Open Creator Portal
                    </a>
                   </div>`
                : ''
            }
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              This is an automated notification from E3 Qatar. For inquiries, contact marketing@e3.qa.
            </p>
          </div>
        </div>
      `;

      await sendEmail({
        to: recipientEmail,
        subject: `[E3 Qatar] ${title}`,
        html: emailHtml,
        category: 'SUPPORT',
      });
    } catch (err) {
      console.error('[Influencer Email Send Failed]', err);
    }
  }
}
