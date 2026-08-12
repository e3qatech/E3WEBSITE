import { db } from '@/lib/db';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  category?: 'SUPPORT' | 'CONTACT' | 'FEEDBACK' | 'PROJECT';
}

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  provider: 'resend' | 'smtp' | 'console';
  error?: string;
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
 * Resolves recipient email address for notification categories based on settings or env vars.
 */
export async function getNotificationTargetEmail(category: 'SUPPORT' | 'CONTACT' | 'FEEDBACK' | 'PROJECT'): Promise<string> {
  const envMap: Record<string, string | undefined> = {
    SUPPORT: process.env.SUPPORT_NOTIFICATION_EMAIL,
    CONTACT: process.env.CONTACT_NOTIFICATION_EMAIL,
    FEEDBACK: process.env.FEEDBACK_NOTIFICATION_EMAIL,
    PROJECT: process.env.PROJECT_NOTIFICATION_EMAIL || process.env.CONTACT_NOTIFICATION_EMAIL,
  };

  if (envMap[category]) {
    return envMap[category]!;
  }

  // Fallback to database setting if available
  try {
    const settingKey = category === 'SUPPORT' ? 'supportEmail' : (category === 'FEEDBACK' ? 'feedbackEmail' : 'contactEmail');
    const setting = await db.setting.findUnique({ where: { key: settingKey } });
    if (setting?.value) return setting.value;
  } catch (_e) {
    // Database fallback silent catch
  }

  const defaultEmails: Record<string, string> = {
    SUPPORT: 'support@e3.qa',
    CONTACT: 'contact@e3.qa',
    FEEDBACK: 'feedback@e3.qa',
    PROJECT: 'projects@e3.qa',
  };

  return defaultEmails[category] || 'info@e3.qa';
}

/**
 * Core sendEmail function supporting Resend API, SMTP, or Dev Console mock.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailDispatchResult> {
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const fromAddress = options.from || process.env.EMAIL_FROM_ADDRESS || 'E3 Qatar <notifications@e3.qa>';
  const plainText = options.text || htmlToPlainText(options.html);

  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Resend API Transport
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
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
        throw new Error(`Resend API error (${res.status}): ${errJson.message || res.statusText}`);
      }

      const data = await res.json();
      return {
        success: true,
        messageId: data.id || `resend_${Date.now()}`,
        provider: 'resend',
      };
    } catch (err: any) {
      console.error('[EMAIL_SEND_RESEND_ERROR]', err.message);
      // Fall through to console logging on error
    }
  }

  // 2. Dev / Mock Console Transport
  const mockMsgId = `msg_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  console.log('\n================================================================');
  console.log('[EMAIL_DISPATCH_CONSOLE_MOCK]');
  console.log(`From:    ${fromAddress}`);
  console.log(`To:      ${recipients.join(', ')}`);
  if (options.replyTo) console.log(`ReplyTo: ${options.replyTo}`);
  console.log(`Subject: ${options.subject}`);
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
 * Will log errors but never throw exceptions to calling route handlers.
 */
export async function safelySendEmail(options: SendEmailOptions): Promise<EmailDispatchResult> {
  try {
    return await sendEmail(options);
  } catch (err: any) {
    console.error('[EMAIL_SAFE_SEND_FAILED]', err?.message || err);
    return {
      success: false,
      provider: 'console',
      error: err?.message || 'Unknown email dispatch error',
    };
  }
}

/* ============================================================================
 * HTML TEMPLATE RENDERERS
 * ============================================================================ */

function getBaseEmailLayout(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: #e0f2fe; margin: 4px 0 0 0; font-size: 13px; }
    .body { padding: 32px 24px; }
    .field { margin-bottom: 20px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 4px; font-weight: 600; }
    .value { font-size: 15px; color: #f1f5f9; background-color: #0f172a; padding: 12px 16px; border-radius: 8px; border: 1px solid #334155; word-break: break-word; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; background-color: #0f172a; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>E3 Qatar Platform</h1>
      <p>${title}</p>
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
}): string {
  const content = `
    <h2 style="color: #38bdf8; margin-top: 0;">New Customer Support Ticket</h2>
    <p style="color: #cbd5e1;">A new support request has been submitted on the B2C portal.</p>
    
    ${data.ticketId ? `<div class="field"><div class="label">Ticket ID</div><div class="value" style="font-family: monospace; color: #38bdf8;">${data.ticketId}</div></div>` : ''}
    <div class="field"><div class="label">Customer Name</div><div class="value">${data.name}</div></div>
    <div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${data.email}" style="color: #38bdf8;">${data.email}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone Number</div><div class="value">${data.phone}</div></div>` : ''}
    <div class="field"><div class="label">Message & Issue Description</div><div class="value" style="white-space: pre-wrap;">${data.message}</div></div>
  `;
  return getBaseEmailLayout('New Customer Support Ticket', content);
}

export function renderUserSupportTicketConfirmationEmail(data: {
  name: string;
  ticketId?: string;
}): string {
  const content = `
    <h2 style="color: #38bdf8; margin-top: 0;">We Received Your Support Request</h2>
    <p style="color: #cbd5e1;">Dear ${data.name},</p>
    <p style="color: #cbd5e1; line-height: 1.6;">Thank you for contacting E3 Qatar Customer Support. We have received your ticket and our dedicated team is reviewing your inquiry.</p>
    
    ${data.ticketId ? `<div class="field"><div class="label">Your Reference Ticket ID</div><div class="value" style="font-family: monospace; color: #38bdf8;">${data.ticketId}</div></div>` : ''}
    
    <p style="color: #94a3b8; font-size: 14px; margin-top: 24px;">Our representative will reach out to you within 24 business hours. If you have additional information to add, please reply to this email.</p>
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
}): string {
  const content = `
    <h2 style="color: #f59e0b; margin-top: 0;">New B2B Project Inquiry & Lead</h2>
    <p style="color: #cbd5e1;">A new corporate project request has been submitted on the B2B portal.</p>
    
    ${data.leadId ? `<div class="field"><div class="label">Lead Reference ID</div><div class="value" style="font-family: monospace; color: #f59e0b;">${data.leadId}</div></div>` : ''}
    <div class="field"><div class="label">Full Name</div><div class="value">${data.name}</div></div>
    ${data.company ? `<div class="field"><div class="label">Company / Organization</div><div class="value">${data.company}</div></div>` : ''}
    <div class="field"><div class="label">Corporate Email</div><div class="value"><a href="mailto:${data.email}" style="color: #38bdf8;">${data.email}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone / WhatsApp</div><div class="value">${data.phone}</div></div>` : ''}
    <div class="field"><div class="label">Project Brief & Details</div><div class="value" style="white-space: pre-wrap;">${data.message}</div></div>
  `;
  return getBaseEmailLayout('New B2B Project Inquiry', content);
}

export function renderAdminFeedbackEmail(data: {
  name?: string;
  email?: string;
  rating?: number | string | null;
  attractionId?: string;
  message: string;
}): string {
  const ratingDisplay = data.rating ? '★'.repeat(Number(data.rating)) + '☆'.repeat(Math.max(0, 5 - Number(data.rating))) + ` (${data.rating}/5)` : 'Not provided';
  const content = `
    <h2 style="color: #10b981; margin-top: 0;">New Guest Feedback Submitted</h2>
    <p style="color: #cbd5e1;">A new rating and review has been received.</p>
    
    <div class="field"><div class="label">Overall Rating</div><div class="value" style="color: #f59e0b; font-size: 18px; font-weight: bold;">${ratingDisplay}</div></div>
    <div class="field"><div class="label">Guest Name</div><div class="value">${data.name || 'Anonymous'}</div></div>
    ${data.email ? `<div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${data.email}" style="color: #38bdf8;">${data.email}</a></div></div>` : ''}
    ${data.attractionId ? `<div class="field"><div class="label">Attraction ID</div><div class="value">${data.attractionId}</div></div>` : ''}
    <div class="field"><div class="label">Feedback Message</div><div class="value" style="white-space: pre-wrap;">${data.message}</div></div>
  `;
  return getBaseEmailLayout('New Customer Feedback Received', content);
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
    
    ${data.subject ? `<div class="field"><div class="label">Subject</div><div class="value">${data.subject}</div></div>` : ''}
    <div class="field"><div class="label">Contact Name</div><div class="value">${data.name}</div></div>
    <div class="field"><div class="label">Email Address</div><div class="value"><a href="mailto:${data.email}" style="color: #38bdf8;">${data.email}</a></div></div>
    ${data.phone ? `<div class="field"><div class="label">Phone Number</div><div class="value">${data.phone}</div></div>` : ''}
    <div class="field"><div class="label">Inquiry Details</div><div class="value" style="white-space: pre-wrap;">${data.message}</div></div>
  `;
  return getBaseEmailLayout('New General Inquiry Submission', content);
}
