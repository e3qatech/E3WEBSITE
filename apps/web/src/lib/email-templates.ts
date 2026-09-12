/**
 * email-templates.ts
 *
 * Centralized, Configurable Email Reply & Template Configuration System.
 * Powers dynamic copy editing from the E3 Admin Dashboard for:
 * - Candidate Job Application Confirmations & HR Alerts
 * - B2C Customer Support Auto-Replies
 * - B2B Project Inquiry & Lead Confirmations
 * - Global Brand Header & Legal Footer Copy
 */

import { db } from '@/lib/db';
import { memoryCache } from '@/lib/cache/memory-cache';

export interface EmailFooterConfig {
  companyName: string;
  websiteUrl: string;
  websiteDisplay: string;
  phone: string;
  location: string;
  complianceNotice: string;
}

export interface EmailBrandingConfig {
  headerLogoText: string;
  headerTagline: string;
}

export interface ApplicantConfirmationConfig {
  subject: string;
  heading: string;
  greeting: string;
  body: string;
  referenceLabel: string;
  referenceHint: string;
  nextStepsTitle: string;
  nextStepsBody: string;
}

export interface HRNotificationConfig {
  subject: string;
  heading: string;
  subtitle: string;
  referenceLabel: string;
}

export interface SupportConfirmationConfig {
  subject: string;
  heading: string;
  greeting: string;
  body: string;
  referenceLabel: string;
  referenceHint: string;
  targetWindowBadge: string;
  replyGuidance: string;
}

export interface B2BInquiryConfirmationConfig {
  subject: string;
  heading: string;
  greeting: string;
  body: string;
  referenceLabel: string;
  referenceHint: string;
  followUpBadge: string;
  followUpDescription: string;
}

export interface CandidateDirectReplyConfig {
  defaultSubject: string;
  defaultNextSteps: string;
}

export interface EmailTemplateConfig {
  branding: EmailBrandingConfig;
  footer: EmailFooterConfig;
  applicantConfirmation: ApplicantConfirmationConfig;
  hrNotification: HRNotificationConfig;
  supportConfirmation: SupportConfirmationConfig;
  b2bInquiryConfirmation: B2BInquiryConfirmationConfig;
  candidateDirectReply: CandidateDirectReplyConfig;
}

export const EMAIL_TEMPLATES_SETTING_KEY = 'email_templates_config';

export const DEFAULT_EMAIL_TEMPLATE_CONFIG: EmailTemplateConfig = {
  branding: {
    headerLogoText: 'E3 QATAR',
    headerTagline: 'Event Engineering & Entertainment Landmarks',
  },
  footer: {
    companyName: 'E3 Qatar Entertainment & Events',
    websiteUrl: 'https://e3.qa',
    websiteDisplay: 'www.e3.qa',
    phone: '+974 3048 9955',
    location: 'Doha, State of Qatar',
    complianceNotice: 'Qatar PDPL Compliant: Law No. (13) of 2016 concerning Personal Data Privacy Protection.',
  },
  applicantConfirmation: {
    subject: '[E3 Qatar] Application Received: {jobTitle}',
    heading: 'Application Received',
    greeting: 'Dear {name},',
    body: 'Thank you for applying for the {jobTitle} position at E3 Qatar. We have safely received your application and resume credentials.',
    referenceLabel: 'Your Application Reference Number',
    referenceHint: 'Keep this reference for status tracking with talent acquisition. (#{applicationId})',
    nextStepsTitle: '📋 Next Steps',
    nextStepsBody: 'Our talent acquisition team reviews candidates on a rolling basis. If your profile aligns with our current operational requirements, an HR specialist will contact you directly.',
  },
  hrNotification: {
    subject: '[E3 Careers] New Application: {name} - {jobTitle}',
    heading: 'New Career Application Submitted',
    subtitle: 'A new candidate application has been submitted for talent review.',
    referenceLabel: 'Application Reference Code',
  },
  supportConfirmation: {
    subject: '[E3 Qatar] Support Request Received: {referenceCode}',
    heading: 'We Received Your Support Request',
    greeting: 'Dear {name},',
    body: 'Thank you for reaching out to E3 Qatar Support. Your inquiry has been securely registered in our operations queue and assigned to our guest relations team.',
    referenceLabel: 'Your Official Reference Number',
    referenceHint: 'Please share this reference code when calling or checking status. (#{ticketId})',
    targetWindowBadge: '⏱️ Response Target: Within 24 Business Hours',
    replyGuidance: 'Our operations team is actively reviewing your request. If you need to attach screenshots, receipts, or additional notes, simply reply directly to this email.',
  },
  b2bInquiryConfirmation: {
    subject: '[E3 Qatar] Project Inquiry Received: {referenceCode}',
    heading: 'We Received Your Project Inquiry',
    greeting: 'Dear {name}{company},',
    body: 'Thank you for engaging with E3 Qatar. We have received your project inquiry and our Business Development & Event Engineering leadership is reviewing your specifications.',
    referenceLabel: 'Your Project Reference Number',
    referenceHint: 'Keep this code handy for executive communications. (#{leadId})',
    followUpBadge: '🤝 Executive Follow-Up: Within 24 Hours',
    followUpDescription: 'An engineering lead or client account executive will connect with you to review feasibility, execution timelines, and commercial proposals.',
  },
  candidateDirectReply: {
    defaultSubject: 'Update regarding your application with E3 Qatar: {jobTitle}',
    defaultNextSteps: 'Please feel free to reply directly to this email if you have any questions or require assistance.',
  },
};

/**
 * Replaces `{key}` tokens with provided variables.
 */
export function replacePlaceholders(template: string, vars: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const val = vars[key];
    return val !== undefined && val !== null ? String(val) : match;
  });
}

/**
 * Deeply merges user-saved partial config onto default config.
 */
export function mergeTemplateConfig(partial: any): EmailTemplateConfig {
  if (!partial || typeof partial !== 'object') {
    return { ...DEFAULT_EMAIL_TEMPLATE_CONFIG };
  }

  return {
    branding: {
      ...DEFAULT_EMAIL_TEMPLATE_CONFIG.branding,
      ...(partial.branding || {}),
    },
    footer: {
      ...DEFAULT_EMAIL_TEMPLATE_CONFIG.footer,
      ...(partial.footer || {}),
    },
    applicantConfirmation: {
      ...DEFAULT_EMAIL_TEMPLATE_CONFIG.applicantConfirmation,
      ...(partial.applicantConfirmation || {}),
    },
    hrNotification: {
      ...DEFAULT_EMAIL_TEMPLATE_CONFIG.hrNotification,
      ...(partial.hrNotification || {}),
    },
    supportConfirmation: {
      ...DEFAULT_EMAIL_TEMPLATE_CONFIG.supportConfirmation,
      ...(partial.supportConfirmation || {}),
    },
    b2bInquiryConfirmation: {
      ...DEFAULT_EMAIL_TEMPLATE_CONFIG.b2bInquiryConfirmation,
      ...(partial.b2bInquiryConfirmation || {}),
    },
    candidateDirectReply: {
      ...DEFAULT_EMAIL_TEMPLATE_CONFIG.candidateDirectReply,
      ...(partial.candidateDirectReply || {}),
    },
  };
}

/**
 * Loads the active EmailTemplateConfig from the database with a fast memory cache fallback.
 */
export async function getEmailTemplateConfig(): Promise<EmailTemplateConfig> {
  try {
    return await memoryCache.getOrSet(
      'email_templates_config_cache',
      60_000,
      async () => {
        const setting = await db.setting.findUnique({
          where: { key: EMAIL_TEMPLATES_SETTING_KEY },
        });

        if (setting?.value) {
          try {
            const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
            return mergeTemplateConfig(parsed);
          } catch (_err) {
            console.warn('[EMAIL_CONFIG_PARSE_FAILED] Falling back to default email config');
          }
        }
        return DEFAULT_EMAIL_TEMPLATE_CONFIG;
      }
    );
  } catch (_e) {
    return DEFAULT_EMAIL_TEMPLATE_CONFIG;
  }
}

/**
 * Invalidate template cache when modified by admin.
 */
export async function invalidateEmailTemplateCache(): Promise<void> {
  try {
    memoryCache.invalidate('email_templates_config_cache');
  } catch (_e) {
    // Ignore cache clear error
  }
}
