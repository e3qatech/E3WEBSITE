import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { db } from '@/lib/db';
import { enforceBodyLimit } from '@/lib/body-limit';
import { rateLimit } from '@/lib/rate-limit';
import {
  EMAIL_TEMPLATES_SETTING_KEY,
  getEmailTemplateConfig,
  mergeTemplateConfig,
  invalidateEmailTemplateCache,
  DEFAULT_EMAIL_TEMPLATE_CONFIG,
  replacePlaceholders,
} from '@/lib/email-templates';
import {
  safelySendEmail,
  renderApplicantConfirmationEmail,
  renderHRApplicationNotificationEmail,
  renderUserSupportTicketConfirmationEmail,
  renderUserB2BConfirmationEmail,
} from '@/lib/email';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!hasPermission(userRole, 'settings.general.manage')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = await getEmailTemplateConfig();
    return NextResponse.json({ success: true, config, defaults: DEFAULT_EMAIL_TEMPLATE_CONFIG });
  } catch (error) {
    console.error('[GET /api/settings/emails] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (!hasPermission(userRole, 'settings.general.manage')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const limitErr = enforceBodyLimit(req, 64 * 1024);
    if (limitErr) return limitErr;

    const body = await req.json().catch(() => ({}));

    // Optional Test Dispatch feature
    if (body.testDispatch) {
      const recipient = body.recipientEmail || session.user.email || 'info@e3.qa';
      const templateKey = body.templateKey || 'applicantConfirmation';
      const previewConfig = body.previewConfig ? mergeTemplateConfig(body.previewConfig) : await getEmailTemplateConfig();

      let subject = `[E3 Test Email] Preview Diagnostic`;
      let html = '';

      switch (templateKey) {
        case 'applicantConfirmation': {
          subject = replacePlaceholders(previewConfig.applicantConfirmation.subject, {
            name: 'Test Candidate',
            jobTitle: 'Senior Event Architect',
            applicationId: 'TEST-APP-001',
          });
          html = renderApplicantConfirmationEmail({
            name: 'Test Candidate',
            jobTitle: 'Senior Event Architect',
            applicationId: 'TEST-APP-001',
            config: previewConfig,
          });
          break;
        }
        case 'hrNotification': {
          subject = replacePlaceholders(previewConfig.hrNotification.subject, {
            name: 'Test Candidate',
            jobTitle: 'Senior Event Architect',
            applicationId: 'TEST-APP-001',
          });
          html = renderHRApplicationNotificationEmail({
            name: 'Test Candidate',
            email: recipient,
            phone: '+974 5555 1234',
            jobTitle: 'Senior Event Architect',
            department: 'Production & Engineering',
            applicationId: 'TEST-APP-001',
            config: previewConfig,
          });
          break;
        }
        case 'supportConfirmation': {
          subject = replacePlaceholders(previewConfig.supportConfirmation.subject, {
            name: 'Test Guest',
            referenceCode: 'E3-SUP-TEST-999',
            ticketId: 'test_ticket_id',
          });
          html = renderUserSupportTicketConfirmationEmail({
            name: 'Test Guest',
            ticketId: 'test_ticket_id',
            config: previewConfig,
          });
          break;
        }
        case 'b2bInquiryConfirmation': {
          subject = replacePlaceholders(previewConfig.b2bInquiryConfirmation.subject, {
            name: 'Corporate Partner',
            referenceCode: 'E3-B2B-TEST-888',
            company: ' (Qatar Luxury Events)',
            leadId: 'test_lead_id',
          });
          html = renderUserB2BConfirmationEmail({
            name: 'Corporate Partner',
            company: 'Qatar Luxury Events',
            leadId: 'test_lead_id',
            config: previewConfig,
          });
          break;
        }
        default: {
          subject = `[E3 Test] Diagnostic Email`;
          html = renderApplicantConfirmationEmail({
            name: 'Test Candidate',
            jobTitle: 'Event Producer',
            applicationId: 'TEST-123',
            config: previewConfig,
          });
        }
      }

      const result = await safelySendEmail({
        to: recipient,
        subject,
        html,
        category: 'CAREERS',
      });

      return NextResponse.json({
        success: result.success,
        recipient,
        subject,
        provider: result.provider,
        messageId: result.messageId,
        error: result.error,
      });
    }

    // Standard Save Settings
    const mergedConfig = mergeTemplateConfig(body.config || body);

    await db.setting.upsert({
      where: { key: EMAIL_TEMPLATES_SETTING_KEY },
      update: {
        value: mergedConfig as any,
        type: 'EMAIL_TEMPLATE',
      },
      create: {
        key: EMAIL_TEMPLATES_SETTING_KEY,
        value: mergedConfig as any,
        type: 'EMAIL_TEMPLATE',
      },
    });

    await invalidateEmailTemplateCache();

    return NextResponse.json({
      success: true,
      config: mergedConfig,
      message: 'Email templates and reply settings saved successfully.',
    });
  } catch (error) {
    console.error('[POST /api/settings/emails] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
