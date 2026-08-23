import { db } from '@/lib/db';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  category?: 'SUPPORT' | 'CONTACT' | 'FEEDBACK' | 'PROJECT' | 'CAREERS' | 'AUTH' | 'NEWSLETTER';
}

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  provider: 'resend' | 'console';
  error?: string;
}

/**
 * Escapes HTML characters in user-supplied strings to prevent HTML injection in email bodies.
 */
export function escapeHtml(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips HTML tags to produce a clean plain-text fallback.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves recipient email address for notification categories based on env vars or database settings.
 *
 * Required environment variables:
 * - SUPPORT_NOTIFICATION_EMAIL
 * - CONTACT_NOTIFICATION_EMAIL
 * - FEEDBACK_NOTIFICATION_EMAIL
 * - PROJECT_NOTIFICATION_EMAIL
 * - CAREERS_NOTIFICATION_EMAIL
 */
export async function getNotificationTargetEmail(
  category: 'SUPPORT' | 'CONTACT' | 'FEEDBACK' | 'PROJECT' | 'CAREERS' | 'AUTH' | 'NEWSLETTER'
): Promise<string> {
  const envMap: Record<string, string | undefined> = {
    SUPPORT: process.env.SUPPORT_NOTIFICATION_EMAIL,
    CONTACT: process.env.CONTACT_NOTIFICATION_EMAIL,
    FEEDBACK: process.env.FEEDBACK_NOTIFICATION_EMAIL,
    PROJECT: process.env.PROJECT_NOTIFICATION_EMAIL || process.env.CONTACT_NOTIFICATION_EMAIL,
    CAREERS: process.env.CAREERS_NOTIFICATION_EMAIL || process.env.CONTACT_NOTIFICATION_EMAIL,
  };

  if (envMap[category]) {
    return envMap[category]!;
  }

  // Fallback to database setting if available
  try {
    const settingKeyMap: Record<string, string> = {
      SUPPORT: 'supportEmail',
      CONTACT: 'contactEmail',
      FEEDBACK: 'feedbackEmail',
      PROJECT: 'projectEmail',
      CAREERS: 'careersEmail',
    };
    const settingKey = settingKeyMap[category];
    if (settingKey) {
      const setting = await db.setting.findUnique({ where: { key: settingKey } });
      if (setting?.value) return String(setting.value);
    }
  } catch (_e) {
    // Silent catch for DB unavailable
  }

  const defaultEmails: Record<string, string> = {
    SUPPORT: 'info@eeeqa.com',
    CONTACT: 'info@eeeqa.com',
    FEEDBACK: 'info@eeeqa.com',
    PROJECT: 'info@eeeqa.com',
    CAREERS: 'info@eeeqa.com',
  };

  return defaultEmails[category] || 'info@eeeqa.com';
}

/**
 * Core sendEmail function using authoritative Resend API.
 *
 * Requirements:
 * - Production never reports success when an email was only logged to console.
 * - Missing RESEND_API_KEY, invalid sender, or provider failure returns a controlled failure.
 * - No secrets or raw provider error payloads are exposed to public callers.
 * - EMAIL_FROM_ADDRESS must use a domain verified by Resend.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailDispatchResult> {
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const fromAddress = options.from || process.env.EMAIL_FROM_ADDRESS || 'E3 Qatar <noreply@notifications.eeeqa.com>';
  const plainText = options.text || htmlToPlainText(options.html);

  const isProduction =
    process.env.VERCEL_ENV === 'production' ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'production');

  let resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    try {
      const setting = await db.setting.findFirst({
        where: { key: { in: ['resendApiKey', 'emailGatewayKey', 'resend_api_key'] } },
      });
      if (setting?.value && !String(setting.value).startsWith('••••')) {
        resendApiKey = String(setting.value);
      }
    } catch (_dbErr) {
      // Ignore DB read failure
    }
  }

  // 1. Resend API Transport
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: recipients,
          subject: options.subject,
          html: options.html,
          text: plainText,
          reply_to: options.replyTo,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMessage = errJson?.message || `HTTP ${res.status}`;
        console.error(`[EMAIL_RESEND_HTTP_ERROR] Status: ${res.status}, Message: ${errMessage}`);
        return {
          success: false,
          provider: 'resend',
          error: `Resend error: ${errMessage}`,
        };
      }

      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        messageId: data.id || `resend_${Date.now()}`,
        provider: 'resend',
      };
    } catch (err: any) {
      console.error('[EMAIL_SEND_RESEND_ERROR]', err?.message || 'Network error');
      return {
        success: false,
        provider: 'resend',
        error: 'Email delivery failed due to network error',
      };
    }
  }

  // 2. Production fail-closed check: Never report success in production without RESEND_API_KEY
  if (isProduction) {
    console.error('[EMAIL_DELIVERY_BLOCKED] RESEND_API_KEY is not configured in Production');
    return {
      success: false,
      provider: 'resend',
      error: 'Email service is unconfigured in production',
    };
  }

  // 3. Dev / Mock Console Transport for Local Development & Testing only
  const mockMsgId = `msg_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  console.log('\n================================================================');
  console.log('[EMAIL_DISPATCH_DEV_CONSOLE]');
  console.log(`From:     ${fromAddress}`);
  console.log(`To:       ${recipients.join(', ')}`);
  if (options.replyTo) console.log(`ReplyTo:  ${options.replyTo}`);
  console.log(`Subject:  ${options.subject}`);
  console.log(`Category: ${options.category || 'GENERAL'}`);
  console.log('--- Plain Text Content ---');
  console.log(plainText.substring(0, 300) + (plainText.length > 300 ? '...' : ''));
  console.log('================================================================\n');

  return {
    success: true,
    messageId: mockMsgId,
    provider: 'console',
  };
}

/**
 * Non-blocking safe wrapper around sendEmail.
 * Will log errors but never throw unhandled exceptions to calling route handlers.
 */
export async function safelySendEmail(options: SendEmailOptions): Promise<EmailDispatchResult> {
  try {
    return await sendEmail(options);
  } catch (err: any) {
    console.error('[EMAIL_SAFE_SEND_FAILED]', err?.message || err);
    return {
      success: false,
      provider: 'resend',
      error: 'Unexpected email dispatch error',
    };
  }
}

/* ============================================================================
 * HTML TEMPLATE RENDERERS (All user-controlled values HTML-escaped)
 * ============================================================================ */

function getBaseEmailLayout(title: string, contentHtml: string): string {
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 12px; border: 1px solid #27272a; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #10b981 100%); padding: 28px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: #f0fdf4; margin: 6px 0 0 0; font-size: 13px; font-weight: 500; }
    .body { padding: 32px 24px; }
    .field { margin-bottom: 20px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #a1a1aa; margin-bottom: 6px; font-weight: 700; }
    .value { font-size: 14px; color: #fafafa; background-color: #09090b; padding: 12px 16px; border-radius: 8px; border: 1px solid #27272a; word-break: break-word; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background-color: #10b981; color: #09090b; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; background-color: #09090b; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>E3 Qatar Platform</h1>
      <p>${safeTitle}</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} E3 Qatar Entertainment & Events. All rights reserved.</p>
      <p><a href="https://e3.qa">www.e3.qa</a> | Doha, State of Qatar</p>
    </div>
  </div>
</body>
</html>`;
}

export function renderAdminSupportTicketEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  ticketId?: string;
  category?: string;
  attractionId?: string;
}): string {
  const content = `
    <h2 style="color: #38bdf8; margin-top: 0;">New Customer Support Ticket</h2>
    <p style="color: #cbd5e1;">A new support request has been submitted on the B2C portal.</p>
    
    ${data.ticketId ? `<div class="field"><div class="label">Ticket ID</div><div class="value" style="font-family: monospace; color: #38bdf8; font-weight: bold;">#${escapeHtml(data.ticketId)}</div></div>` : ''}
    <div class="field"><div class="label">Customer Name</div><div class="value">${escapeHtml(data.name)}</div></div>
    <div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8;">${escapeHtml(data.email)}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone Number</div><div class="value">${escapeHtml(data.phone)}</div></div>` : ''}
    ${data.category ? `<div class="field"><div class="label">Category</div><div class="value">${escapeHtml(data.category)}</div></div>` : ''}
    ${data.attractionId ? `<div class="field"><div class="label">Related Attraction</div><div class="value">${escapeHtml(data.attractionId)}</div></div>` : ''}
    <div class="field"><div class="label">Message & Issue Details</div><div class="value" style="white-space: pre-wrap;">${escapeHtml(data.message)}</div></div>
  `;
  return getBaseEmailLayout('New Customer Support Ticket', content);
}

export function renderUserSupportTicketConfirmationEmail(data: {
  name: string;
  ticketId?: string;
}): string {
  const content = `
    <h2 style="color: #38bdf8; margin-top: 0;">We Received Your Support Request</h2>
    <p style="color: #cbd5e1;">Dear ${escapeHtml(data.name)},</p>
    <p style="color: #cbd5e1; line-height: 1.6;">Thank you for reaching out to E3 Qatar Support. We have received your inquiry and our operations team is reviewing your ticket.</p>
    
    ${data.ticketId ? `<div class="field"><div class="label">Your Reference Ticket ID</div><div class="value" style="font-family: monospace; color: #38bdf8; font-weight: bold;">#${escapeHtml(data.ticketId)}</div></div>` : ''}
    
    <p style="color: #94a3b8; font-size: 14px; margin-top: 24px; line-height: 1.5;">Our support representative will follow up with you within 24 business hours. If you have additional details to provide, simply reply to this email.</p>
  `;
  return getBaseEmailLayout('Support Request Received - E3 Qatar', content);
}

export function renderAdminProjectRequestEmail(data: {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message: string;
  leadId?: string;
  interestServices?: string[];
  rfpUploadId?: string;
  rfpUrl?: string;
  rfpFileName?: string;
}): string {
  const servicesList = Array.isArray(data.interestServices) && data.interestServices.length > 0
    ? data.interestServices.map(s => `<span style="display:inline-block; background:#27272a; padding:4px 8px; border-radius:4px; margin-right:6px; font-size:12px;">${escapeHtml(s)}</span>`).join('')
    : null;

  const content = `
    <h2 style="color: #f59e0b; margin-top: 0;">New B2B Project Inquiry & Lead</h2>
    <p style="color: #cbd5e1;">A new corporate project request has been submitted on the B2B portal.</p>
    
    ${data.leadId ? `<div class="field"><div class="label">Lead Reference ID</div><div class="value" style="font-family: monospace; color: #f59e0b; font-weight: bold;">${escapeHtml(data.leadId)}</div></div>` : ''}
    <div class="field"><div class="label">Full Name</div><div class="value">${escapeHtml(data.name)}</div></div>
    ${data.company ? `<div class="field"><div class="label">Company / Organization</div><div class="value">${escapeHtml(data.company)}</div></div>` : ''}
    <div class="field"><div class="label">Corporate Email</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8;">${escapeHtml(data.email)}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone / WhatsApp</div><div class="value">${escapeHtml(data.phone)}</div></div>` : ''}
    ${servicesList ? `<div class="field"><div class="label">Services of Interest</div><div class="value">${servicesList}</div></div>` : ''}
    ${data.rfpFileName || data.rfpUploadId ? `
      <div class="field">
        <div class="label">RFP Attachment</div>
        <div class="value" style="color:#10b981; font-weight:bold;">
          📄 ${escapeHtml(data.rfpFileName || 'RFP Document')} ${data.rfpUploadId ? `<span style="font-family: monospace; font-size: 12px; color: #94a3b8;">(Upload: #${escapeHtml(data.rfpUploadId)})</span>` : ''}
        </div>
      </div>` : ''}
    <div class="field"><div class="label">Project Brief & Details</div><div class="value" style="white-space: pre-wrap;">${escapeHtml(data.message)}</div></div>
  `;
  return getBaseEmailLayout('New B2B Project Inquiry', content);
}

export function renderUserB2BConfirmationEmail(data: {
  name: string;
  company?: string;
  leadId?: string;
}): string {
  const content = `
    <h2 style="color: #10b981; margin-top: 0;">We Received Your Project Inquiry</h2>
    <p style="color: #cbd5e1;">Dear ${escapeHtml(data.name)}${data.company ? ` (${escapeHtml(data.company)})` : ''},</p>
    <p style="color: #cbd5e1; line-height: 1.6;">Thank you for contacting E3 Qatar. We have received your project inquiry and our Business Development & Event Engineering team is reviewing your requirements.</p>
    
    ${data.leadId ? `<div class="field"><div class="label">Your Reference Number</div><div class="value" style="font-family: monospace; color: #10b981; font-weight: bold;">${escapeHtml(data.leadId)}</div></div>` : ''}
    
    <p style="color: #94a3b8; font-size: 14px; margin-top: 24px; line-height: 1.5;">An executive specialist will connect with you within 24 hours to discuss execution frameworks, timelines, and delivery plans.</p>
  `;
  return getBaseEmailLayout('Project Inquiry Received - E3 Qatar', content);
}

export function renderAdminFeedbackEmail(data: {
  name?: string;
  email?: string;
  rating?: number | string | null;
  attractionId?: string;
  message: string;
}): string {
  const numericRating = Number(data.rating) || 0;
  const ratingDisplay = numericRating > 0
    ? '★'.repeat(numericRating) + '☆'.repeat(Math.max(0, 5 - numericRating)) + ` (${numericRating}/5)`
    : 'Not provided';

  const content = `
    <h2 style="color: #10b981; margin-top: 0;">New Guest Feedback Submitted</h2>
    <p style="color: #cbd5e1;">A new rating and review has been received on the public portal.</p>
    
    <div class="field"><div class="label">Overall Rating</div><div class="value" style="color: #f59e0b; font-size: 16px; font-weight: bold;">${escapeHtml(ratingDisplay)}</div></div>
    <div class="field"><div class="label">Guest Name</div><div class="value">${escapeHtml(data.name || 'Anonymous')}</div></div>
    ${data.email ? `<div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8;">${escapeHtml(data.email)}</a></div></div>` : ''}
    ${data.attractionId ? `<div class="field"><div class="label">Attraction ID</div><div class="value">${escapeHtml(data.attractionId)}</div></div>` : ''}
    <div class="field"><div class="label">Feedback Message</div><div class="value" style="white-space: pre-wrap;">${escapeHtml(data.message)}</div></div>
  `;
  return getBaseEmailLayout('New Customer Feedback Received', content);
}

export function renderHRApplicationNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department?: string;
  applicationId: string;
  cvUrl?: string;
}): string {
  const content = `
    <h2 style="color: #a855f7; margin-top: 0;">New Career Application Submitted</h2>
    <p style="color: #cbd5e1;">A new candidate application has been submitted for review.</p>
    
    <div class="field"><div class="label">Application ID</div><div class="value" style="font-family: monospace; color: #a855f7; font-weight: bold;">#${escapeHtml(data.applicationId)}</div></div>
    <div class="field"><div class="label">Candidate Name</div><div class="value">${escapeHtml(data.name)}</div></div>
    <div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8;">${escapeHtml(data.email)}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone Number</div><div class="value">${escapeHtml(data.phone)}</div></div>` : ''}
    <div class="field"><div class="label">Position Applied For</div><div class="value" style="font-weight: bold;">${escapeHtml(data.jobTitle)}${data.department ? ` (${escapeHtml(data.department)})` : ''}</div></div>
    ${data.cvUrl ? `<div class="field"><div class="label">Resume / CV Document</div><div class="value"><a href="${escapeHtml(data.cvUrl)}" style="color: #38bdf8; font-weight: bold;" target="_blank">View Resume Document</a></div></div>` : ''}
  `;
  return getBaseEmailLayout('New Career Application - E3 Qatar', content);
}

export function renderApplicantConfirmationEmail(data: {
  name: string;
  jobTitle: string;
  applicationId: string;
}): string {
  const content = `
    <h2 style="color: #10b981; margin-top: 0;">Application Received</h2>
    <p style="color: #cbd5e1;">Dear ${escapeHtml(data.name)},</p>
    <p style="color: #cbd5e1; line-height: 1.6;">Thank you for applying for the <strong>${escapeHtml(data.jobTitle)}</strong> role at E3 Qatar. We have safely received your application and resume.</p>
    
    <div class="field"><div class="label">Your Application Reference</div><div class="value" style="font-family: monospace; color: #10b981; font-weight: bold;">#${escapeHtml(data.applicationId)}</div></div>
    
    <p style="color: #94a3b8; font-size: 14px; margin-top: 24px; line-height: 1.5;">Our talent acquisition team will review your qualifications. If your experience matches our operational needs, an HR representative will contact you for the next steps.</p>
  `;
  return getBaseEmailLayout('Application Received - E3 Qatar Careers', content);
}

export function renderPasswordResetEmail(data: {
  name: string;
  resetUrl: string;
}): string {
  const content = `
    <h2 style="color: #f43f5e; margin-top: 0;">Password Reset Request</h2>
    <p style="color: #cbd5e1;">Hello ${escapeHtml(data.name)},</p>
    <p style="color: #cbd5e1; line-height: 1.6;">We received a request to reset the password for your E3 account. Click the button below to choose a new password. This single-use link will expire in 1 hour.</p>
    
    <div class="btn-container">
      <a href="${escapeHtml(data.resetUrl)}" class="btn" style="background-color: #f43f5e; color: #ffffff;">Reset My Password</a>
    </div>
    
    <p style="color: #71717a; font-size: 12px; margin-top: 24px; line-height: 1.5;">If you did not request this password reset, please ignore this email or contact security at support@e3.qa. Your password will remain unchanged.</p>
  `;
  return getBaseEmailLayout('Reset Your Password - E3 Qatar', content);
}

export function renderNewsletterVerificationEmail(data: {
  email: string;
  verificationUrl: string;
}): string {
  const content = `
    <h2 style="color: #10b981; margin-top: 0;">Confirm Your Newsletter Subscription</h2>
    <p style="color: #cbd5e1;">Thank you for subscribing to E3 Qatar Event & Attraction updates.</p>
    <p style="color: #cbd5e1; line-height: 1.6;">Please verify your email address (<strong>${escapeHtml(data.email)}</strong>) to start receiving exclusive ticket releases, festival launches, and attraction announcements.</p>
    
    <div class="btn-container">
      <a href="${escapeHtml(data.verificationUrl)}" class="btn">Confirm Subscription</a>
    </div>
    
    <p style="color: #71717a; font-size: 12px; margin-top: 24px; line-height: 1.5;">If you did not subscribe to this newsletter, no action is required.</p>
  `;
  return getBaseEmailLayout('Confirm Your Subscription - E3 Qatar', content);
}

export function renderAdminGeneralInquiryEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): string {
  const content = `
    <h2 style="color: #38bdf8; margin-top: 0;">New General Inquiry</h2>
    <p style="color: #cbd5e1;">A general contact submission was received.</p>
    
    ${data.subject ? `<div class="field"><div class="label">Subject</div><div class="value">${escapeHtml(data.subject)}</div></div>` : ''}
    <div class="field"><div class="label">Contact Name</div><div class="value">${escapeHtml(data.name)}</div></div>
    <div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8;">${escapeHtml(data.email)}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone Number</div><div class="value">${escapeHtml(data.phone)}</div></div>` : ''}
    <div class="field"><div class="label">Inquiry Details</div><div class="value" style="white-space: pre-wrap;">${escapeHtml(data.message)}</div></div>
  `;
  return getBaseEmailLayout('New General Inquiry Submission', content);
}
