import { db } from '@/lib/db';
import {
  EmailTemplateConfig,
  DEFAULT_EMAIL_TEMPLATE_CONFIG,
  replacePlaceholders,
  getEmailTemplateConfig,
} from './email-templates';

export { getEmailTemplateConfig, DEFAULT_EMAIL_TEMPLATE_CONFIG };
export type { EmailTemplateConfig };

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

/**
 * Formats raw database IDs into human-friendly, easily dictatable and sharable ticket reference numbers.
 * Example: 'cmt6bo1g70000k8p08zgi408w' -> 'E3-SUP-8ZGI-408W'
 */
export function formatReadableTicketId(
  id?: string | null,
  category: 'SUPPORT' | 'PROJECT' | 'FEEDBACK' | 'CAREERS' = 'SUPPORT'
): string {
  if (!id) return 'E3-REF';
  const prefixMap: Record<string, string> = {
    SUPPORT: 'E3-SUP',
    PROJECT: 'E3-B2B',
    FEEDBACK: 'E3-FBK',
    CAREERS: 'E3-APP',
  };
  const prefix = prefixMap[category] || 'E3-REF';
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  if (clean.length <= 8) {
    return `${prefix}-${clean}`;
  }
  const suffix = clean.slice(-8);
  return `${prefix}-${suffix.slice(0, 4)}-${suffix.slice(4)}`;
}

/* ============================================================================
 * LUXURY HTML TEMPLATE RENDERERS (All user-controlled values HTML-escaped)
 * ============================================================================ */

export function getBaseEmailLayout(
  title: string,
  contentHtml: string,
  config?: EmailTemplateConfig
): string {
  const safeTitle = escapeHtml(title);
  const branding = config?.branding || DEFAULT_EMAIL_TEMPLATE_CONFIG.branding;
  const footer = config?.footer || DEFAULT_EMAIL_TEMPLATE_CONFIG.footer;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #050608;
      color: #e4e4e7;
      margin: 0;
      padding: 32px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0c0d12;
      border-radius: 16px;
      border: 1px solid #1f222e;
      overflow: hidden;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.7);
    }
    .brand-header {
      padding: 32px 28px 24px;
      text-align: center;
      border-bottom: 1px solid #181a24;
      background: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.12) 0%, rgba(12, 13, 18, 0) 70%);
    }
    .brand-logo-text {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #ffffff;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-tagline {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #10b981;
      margin: 6px 0 0 0;
      text-transform: uppercase;
    }
    .body {
      padding: 32px 28px;
    }
    .reference-box {
      background: linear-gradient(180deg, #13151f 0%, #0e1017 100%);
      border: 1px solid #272b3c;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .reference-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .reference-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #38bdf8;
      background: #08090d;
      display: inline-block;
      padding: 10px 22px;
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .reference-hint {
      font-size: 11px;
      color: #64748b;
      margin-top: 8px;
    }
    .field {
      margin-bottom: 18px;
    }
    .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #71717a;
      margin-bottom: 6px;
      font-weight: 700;
    }
    .value {
      font-size: 14px;
      color: #f4f4f5;
      background-color: #13141c;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid #222533;
      word-break: break-word;
    }
    .info-card {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 10px;
      padding: 14px 18px;
      margin-top: 24px;
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.5;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff !important;
      padding: 14px 28px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }
    .footer {
      padding: 24px 28px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #181a24;
      background-color: #08090d;
    }
    .footer a {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="brand-header">
      <div class="brand-logo-text">${escapeHtml(branding.headerLogoText)}</div>
      <div class="brand-tagline">${escapeHtml(branding.headerTagline)}</div>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} ${escapeHtml(footer.companyName)}. All rights reserved.</p>
      <p style="margin: 0 0 12px;"><a href="${escapeHtml(footer.websiteUrl)}">${escapeHtml(footer.websiteDisplay)}</a> &bull; ${escapeHtml(footer.location)} &bull; Tel: ${escapeHtml(footer.phone)}</p>
      <p style="margin: 0; font-size: 11px; color: #475569;">${escapeHtml(footer.complianceNotice)}</p>
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
  config?: EmailTemplateConfig;
}): string {
  const readableRef = formatReadableTicketId(data.ticketId, 'SUPPORT');
  const content = `
    <h2 style="color: #38bdf8; margin: 0 0 8px; font-size: 20px; font-weight: 800;">New Customer Support Ticket</h2>
    <p style="color: #94a3b8; margin: 0 0 20px; font-size: 14px;">A new support request has been submitted on the B2C portal.</p>
    
    <div class="reference-box">
      <div class="reference-label">Ticket Reference Number</div>
      <div class="reference-code">${escapeHtml(readableRef)}</div>
      ${data.ticketId ? `<div class="reference-hint">Internal DB UUID: #${escapeHtml(data.ticketId)}</div>` : ''}
    </div>

    <div class="field"><div class="label">Customer Name</div><div class="value">${escapeHtml(data.name)}</div></div>
    <div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(data.email)}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone Number</div><div class="value">${escapeHtml(data.phone)}</div></div>` : ''}
    ${data.category ? `<div class="field"><div class="label">Category</div><div class="value">${escapeHtml(data.category)}</div></div>` : ''}
    ${data.attractionId ? `<div class="field"><div class="label">Related Attraction</div><div class="value">${escapeHtml(data.attractionId)}</div></div>` : ''}
    <div class="field"><div class="label">Message & Issue Details</div><div class="value" style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(data.message)}</div></div>
  `;
  return getBaseEmailLayout('New Customer Support Ticket', content, data.config);
}

export function renderUserSupportTicketConfirmationEmail(data: {
  name: string;
  ticketId?: string;
  config?: EmailTemplateConfig;
}): string {
  const cfg = data.config?.supportConfirmation || DEFAULT_EMAIL_TEMPLATE_CONFIG.supportConfirmation;
  const readableRef = formatReadableTicketId(data.ticketId, 'SUPPORT');

  const vars = {
    name: escapeHtml(data.name),
    ticketId: escapeHtml(data.ticketId || ''),
    referenceCode: escapeHtml(readableRef),
  };

  const heading = replacePlaceholders(cfg.heading, vars);
  const greeting = replacePlaceholders(cfg.greeting, vars);
  const body = replacePlaceholders(cfg.body, vars);
  const refLabel = replacePlaceholders(cfg.referenceLabel, vars);
  const refHint = replacePlaceholders(cfg.referenceHint, vars);
  const badge = replacePlaceholders(cfg.targetWindowBadge, vars);
  const guidance = replacePlaceholders(cfg.replyGuidance, vars);

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 22px; font-weight: 800;">${heading}</h2>
    <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 20px;">${greeting}</p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      ${body}
    </p>
    
    <div class="reference-box">
      <div class="reference-label">${refLabel}</div>
      <div class="reference-code">${escapeHtml(readableRef)}</div>
      <div class="reference-hint">${refHint}</div>
    </div>
    
    <div class="info-card">
      <p style="margin: 0 0 6px; font-weight: 700; color: #10b981;">${badge}</p>
      <p style="margin: 0;">${guidance}</p>
    </div>
  `;
  return getBaseEmailLayout(replacePlaceholders(cfg.subject, vars), content, data.config);
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
  config?: EmailTemplateConfig;
}): string {
  const readableRef = formatReadableTicketId(data.leadId, 'PROJECT');
  const servicesList = Array.isArray(data.interestServices) && data.interestServices.length > 0
    ? data.interestServices.map(s => `<span style="display:inline-block; background:#181a24; border: 1px solid #272b3c; padding:4px 10px; border-radius:6px; margin: 2px 4px 2px 0; font-size:12px; color:#38bdf8;">${escapeHtml(s)}</span>`).join('')
    : null;

  const content = `
    <h2 style="color: #f59e0b; margin: 0 0 8px; font-size: 20px; font-weight: 800;">New B2B Project Inquiry & Lead</h2>
    <p style="color: #94a3b8; margin: 0 0 20px; font-size: 14px;">A new corporate project request has been submitted on the B2B enterprise portal.</p>
    
    <div class="reference-box">
      <div class="reference-label">Lead Reference Code</div>
      <div class="reference-code" style="color: #f59e0b; border-color: rgba(245, 158, 11, 0.3);">${escapeHtml(readableRef)}</div>
      ${data.leadId ? `<div class="reference-hint">Internal Lead UUID: #${escapeHtml(data.leadId)}</div>` : ''}
    </div>

    <div class="field"><div class="label">Full Name</div><div class="value">${escapeHtml(data.name)}</div></div>
    ${data.company ? `<div class="field"><div class="label">Company / Organization</div><div class="value" style="font-weight: 700; color: #ffffff;">${escapeHtml(data.company)}</div></div>` : ''}
    <div class="field"><div class="label">Corporate Email</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(data.email)}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone / WhatsApp</div><div class="value">${escapeHtml(data.phone)}</div></div>` : ''}
    ${servicesList ? `<div class="field"><div class="label">Services of Interest</div><div class="value">${servicesList}</div></div>` : ''}
    ${data.rfpFileName || data.rfpUploadId ? `
      <div class="field">
        <div class="label">RFP Attachment</div>
        <div class="value" style="color:#10b981; font-weight:bold;">
          📄 ${escapeHtml(data.rfpFileName || 'RFP Document')} ${data.rfpUploadId ? `<span style="font-family: monospace; font-size: 12px; color: #94a3b8;">(Upload: #${escapeHtml(data.rfpUploadId)})</span>` : ''}
        </div>
      </div>` : ''}
    <div class="field"><div class="label">Project Brief & Requirements</div><div class="value" style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(data.message)}</div></div>
  `;
  return getBaseEmailLayout('New B2B Project Inquiry', content, data.config);
}

export function renderUserB2BConfirmationEmail(data: {
  name: string;
  company?: string;
  leadId?: string;
  config?: EmailTemplateConfig;
}): string {
  const cfg = data.config?.b2bInquiryConfirmation || DEFAULT_EMAIL_TEMPLATE_CONFIG.b2bInquiryConfirmation;
  const readableRef = formatReadableTicketId(data.leadId, 'PROJECT');

  const vars = {
    name: escapeHtml(data.name),
    company: data.company ? ` (${escapeHtml(data.company)})` : '',
    leadId: escapeHtml(data.leadId || ''),
    referenceCode: escapeHtml(readableRef),
  };

  const heading = replacePlaceholders(cfg.heading, vars);
  const greeting = replacePlaceholders(cfg.greeting, vars);
  const body = replacePlaceholders(cfg.body, vars);
  const refLabel = replacePlaceholders(cfg.referenceLabel, vars);
  const refHint = replacePlaceholders(cfg.referenceHint, vars);
  const badge = replacePlaceholders(cfg.followUpBadge, vars);
  const desc = replacePlaceholders(cfg.followUpDescription, vars);

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 22px; font-weight: 800;">${heading}</h2>
    <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 20px;">${greeting}</p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      ${body}
    </p>
    
    <div class="reference-box">
      <div class="reference-label">${refLabel}</div>
      <div class="reference-code" style="color: #10b981; border-color: rgba(16, 185, 129, 0.3);">${escapeHtml(readableRef)}</div>
      <div class="reference-hint">${refHint}</div>
    </div>
    
    <div class="info-card">
      <p style="margin: 0 0 6px; font-weight: 700; color: #10b981;">${badge}</p>
      <p style="margin: 0;">${desc}</p>
    </div>
  `;
  return getBaseEmailLayout(replacePlaceholders(cfg.subject, vars), content, data.config);
}

export function renderAdminFeedbackEmail(data: {
  name?: string;
  email?: string;
  rating?: number | string | null;
  attractionId?: string;
  message: string;
  config?: EmailTemplateConfig;
}): string {
  const numericRating = Number(data.rating) || 0;
  const ratingDisplay = numericRating > 0
    ? '★'.repeat(numericRating) + '☆'.repeat(Math.max(0, 5 - numericRating)) + ` (${numericRating}/5)`
    : 'Not provided';

  const content = `
    <h2 style="color: #10b981; margin: 0 0 8px; font-size: 20px; font-weight: 800;">New Guest Feedback Submitted</h2>
    <p style="color: #94a3b8; margin: 0 0 20px; font-size: 14px;">A new rating and review has been received on the public portal.</p>
    
    <div class="field"><div class="label">Overall Rating</div><div class="value" style="color: #f59e0b; font-size: 18px; font-weight: bold;">${escapeHtml(ratingDisplay)}</div></div>
    <div class="field"><div class="label">Guest Name</div><div class="value">${escapeHtml(data.name || 'Anonymous Guest')}</div></div>
    ${data.email ? `<div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(data.email)}</a></div></div>` : ''}
    ${data.attractionId ? `<div class="field"><div class="label">Attraction</div><div class="value">${escapeHtml(data.attractionId)}</div></div>` : ''}
    <div class="field"><div class="label">Feedback Message</div><div class="value" style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(data.message)}</div></div>
  `;
  return getBaseEmailLayout('New Customer Feedback Received', content, data.config);
}

export function renderHRApplicationNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department?: string;
  applicationId: string;
  cvUrl?: string;
  config?: EmailTemplateConfig;
}): string {
  const cfg = data.config?.hrNotification || DEFAULT_EMAIL_TEMPLATE_CONFIG.hrNotification;
  const readableRef = formatReadableTicketId(data.applicationId, 'CAREERS');
  
  const vars = {
    name: escapeHtml(data.name),
    email: escapeHtml(data.email),
    phone: escapeHtml(data.phone || ''),
    jobTitle: escapeHtml(data.jobTitle),
    department: escapeHtml(data.department || ''),
    applicationId: escapeHtml(data.applicationId),
    referenceCode: escapeHtml(readableRef),
  };

  const heading = replacePlaceholders(cfg.heading, vars);
  const subtitle = replacePlaceholders(cfg.subtitle, vars);
  const refLabel = replacePlaceholders(cfg.referenceLabel, vars);

  const content = `
    <h2 style="color: #a855f7; margin: 0 0 8px; font-size: 20px; font-weight: 800;">${heading}</h2>
    <p style="color: #94a3b8; margin: 0 0 20px; font-size: 14px;">${subtitle}</p>
    
    <div class="reference-box">
      <div class="reference-label">${refLabel}</div>
      <div class="reference-code" style="color: #a855f7; border-color: rgba(168, 85, 247, 0.3);">${escapeHtml(readableRef)}</div>
      ${data.applicationId ? `<div class="reference-hint">Internal App UUID: #${escapeHtml(data.applicationId)}</div>` : ''}
    </div>

    <div class="field"><div class="label">Candidate Name</div><div class="value" style="font-weight: 700; color: #ffffff;">${escapeHtml(data.name)}</div></div>
    <div class="field"><div class="label">Position Applied For</div><div class="value" style="font-weight: 700; color: #10b981;">${escapeHtml(data.jobTitle)}${data.department ? ` (${escapeHtml(data.department)})` : ''}</div></div>
    <div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(data.email)}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone Number</div><div class="value">${escapeHtml(data.phone)}</div></div>` : ''}
    ${data.cvUrl ? `<div class="field"><div class="label">Resume / CV Document</div><div class="value"><a href="${escapeHtml(data.cvUrl)}" style="color: #38bdf8; font-weight: bold; text-decoration: none;" target="_blank">📄 View Attached Resume</a></div></div>` : ''}
  `;
  return getBaseEmailLayout(replacePlaceholders(cfg.subject, vars), content, data.config);
}

export function renderApplicantConfirmationEmail(data: {
  name: string;
  jobTitle: string;
  applicationId: string;
  config?: EmailTemplateConfig;
}): string {
  const cfg = data.config?.applicantConfirmation || DEFAULT_EMAIL_TEMPLATE_CONFIG.applicantConfirmation;
  const readableRef = formatReadableTicketId(data.applicationId, 'CAREERS');
  
  const vars = {
    name: escapeHtml(data.name),
    jobTitle: escapeHtml(data.jobTitle),
    applicationId: escapeHtml(data.applicationId),
    referenceCode: escapeHtml(readableRef),
    year: new Date().getFullYear(),
  };

  const heading = replacePlaceholders(cfg.heading, vars);
  const greeting = replacePlaceholders(cfg.greeting, vars);
  const body = replacePlaceholders(cfg.body, vars);
  const refLabel = replacePlaceholders(cfg.referenceLabel, vars);
  const refHint = replacePlaceholders(cfg.referenceHint, vars);
  const nextStepsTitle = replacePlaceholders(cfg.nextStepsTitle, vars);
  const nextStepsBody = replacePlaceholders(cfg.nextStepsBody, vars);

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 22px; font-weight: 800;">${heading}</h2>
    <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 20px;">${greeting}</p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      ${body}
    </p>
    
    <div class="reference-box">
      <div class="reference-label">${refLabel}</div>
      <div class="reference-code" style="color: #a855f7; border-color: rgba(168, 85, 247, 0.3);">${escapeHtml(readableRef)}</div>
      <div class="reference-hint">${refHint}</div>
    </div>
    
    <div class="info-card">
      <p style="margin: 0 0 6px; font-weight: 700; color: #a855f7;">${nextStepsTitle}</p>
      <p style="margin: 0;">${nextStepsBody}</p>
    </div>
  `;
  return getBaseEmailLayout(replacePlaceholders(cfg.subject, vars), content, data.config);
}

export function renderCustomCandidateReplyEmail(data: {
  name: string;
  jobTitle?: string;
  subject?: string;
  message: string;
  nextSteps?: string;
  config?: EmailTemplateConfig;
}): string {
  const safeName = escapeHtml(data.name);
  const safeJob = data.jobTitle ? escapeHtml(data.jobTitle) : '';
  const safeSubject = escapeHtml(data.subject || 'Application Update');

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 22px; font-weight: 800;">${safeSubject}</h2>
    <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 20px;">Dear ${safeName},</p>
    ${safeJob ? `<p style="color: #a855f7; font-size: 13px; font-weight: 700; margin: 0 0 16px;">Regarding: ${safeJob}</p>` : ''}
    
    <div style="background-color: #13141c; padding: 18px 20px; border-radius: 12px; border: 1px solid #222533; color: #e4e4e7; font-size: 14px; line-height: 1.7; white-space: pre-wrap; margin-bottom: 24px;">
${escapeHtml(data.message)}
    </div>

    ${data.nextSteps ? `
      <div class="info-card">
        <p style="margin: 0 0 6px; font-weight: 700; color: #a855f7;">📋 Next Steps & Instructions</p>
        <p style="margin: 0; line-height: 1.5;">${escapeHtml(data.nextSteps)}</p>
      </div>
    ` : ''}
  `;

  return getBaseEmailLayout(data.subject || 'Update regarding your application - E3 Qatar', content, data.config);
}

export function renderPasswordResetEmail(data: {
  name: string;
  resetUrl: string;
}): string {
  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 22px; font-weight: 800;">Password Reset Request</h2>
    <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 20px;">Hello ${escapeHtml(data.name)},</p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      We received a request to reset the password for your E3 account. Click the button below to choose a new password. This single-use link expires in <strong>1 hour</strong>.
    </p>
    
    <div class="btn-container">
      <a href="${escapeHtml(data.resetUrl)}" class="btn" style="background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);">Reset My Password</a>
    </div>
    
    <p style="color: #64748b; font-size: 12px; margin-top: 24px; line-height: 1.5; text-align: center;">
      If you did not request this password reset, please disregard this email. Your account remains fully secure.
    </p>
  `;
  return getBaseEmailLayout('Reset Your Password - E3 Qatar', content);
}

export function renderNewsletterVerificationEmail(data: {
  email: string;
  verificationUrl: string;
}): string {
  const content = `
    <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 22px; font-weight: 800;">Confirm Your Newsletter Subscription</h2>
    <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 20px;">Welcome to E3 Qatar Experiences,</p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      Please verify your email address (<strong>${escapeHtml(data.email)}</strong>) to activate VIP festival announcements, attraction ticket drops, and exclusive invitations.
    </p>
    
    <div class="btn-container">
      <a href="${escapeHtml(data.verificationUrl)}" class="btn">Confirm Subscription</a>
    </div>
    
    <p style="color: #64748b; font-size: 12px; margin-top: 24px; line-height: 1.5; text-align: center;">
      If you did not subscribe to this newsletter, no action is required.
    </p>
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
    <h2 style="color: #38bdf8; margin: 0 0 8px; font-size: 20px; font-weight: 800;">New General Inquiry</h2>
    <p style="color: #94a3b8; margin: 0 0 20px; font-size: 14px;">A general contact submission was received from the public website.</p>
    
    ${data.subject ? `<div class="field"><div class="label">Subject</div><div class="value" style="font-weight: 700; color: #ffffff;">${escapeHtml(data.subject)}</div></div>` : ''}
    <div class="field"><div class="label">Contact Name</div><div class="value">${escapeHtml(data.name)}</div></div>
    <div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(data.email)}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone Number</div><div class="value">${escapeHtml(data.phone)}</div></div>` : ''}
    <div class="field"><div class="label">Inquiry Details</div><div class="value" style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(data.message)}</div></div>
  `;
  return getBaseEmailLayout('New General Inquiry Submission', content);
}
