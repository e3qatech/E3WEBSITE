import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  sendEmail,
  safelySendEmail,
  htmlToPlainText,
  getNotificationTargetEmail,
  renderAdminSupportTicketEmail,
  renderUserSupportTicketConfirmationEmail,
  renderAdminProjectRequestEmail,
  renderAdminFeedbackEmail,
  renderAdminGeneralInquiryEmail,
} from '@/lib/email';

// Mock DB
vi.mock('@/lib/db', () => ({
  db: {
    setting: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        if (where.key === 'supportEmail') return Promise.resolve({ value: 'custom-support@e3.qa' });
        if (where.key === 'contactEmail') return Promise.resolve({ value: 'custom-contact@e3.qa' });
        return Promise.resolve(null);
      }),
    },
    inquiry: {
      create: vi.fn().mockResolvedValue({ id: 'inq_test_101', type: 'SUPPORT' }),
    },
    feedback: {
      create: vi.fn().mockResolvedValue({ id: 'fb_test_101', rating: 5 }),
    },
    lead: {
      create: vi.fn().mockResolvedValue({ id: 'lead_test_101', status: 'NEW' }),
    },
    $transaction: vi.fn().mockImplementation((cb: any) => cb({
      lead: { create: vi.fn().mockResolvedValue({ id: 'lead_tx_101' }) },
      inquiry: { create: vi.fn().mockResolvedValue({ id: 'inq_tx_101' }) },
    })),
  },
  default: {
    feedback: {
      create: vi.fn().mockResolvedValue({ id: 'fb_test_102' }),
    },
  },
}));

// Mock redis & rate limit
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/body-limit', () => ({
  enforceBodyLimit: vi.fn().mockReturnValue(null),
}));

import { POST as postB2CContact } from '@/app/api/contact/b2c/route';
import { POST as postB2BContact } from '@/app/api/contact/b2b/route';
import { POST as postB2BFeedback } from '@/app/api/b2b/feedback/route';

describe('Email Notification Service Engine', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. HTML to Plain Text Converter', () => {
    it('should strip HTML tags and format whitespace cleanly', () => {
      const html = `
        <html>
          <body>
            <h1>Support Ticket</h1>
            <p>Hello <b>World</b>!</p>
            <style>body { color: red; }</style>
          </body>
        </html>
      `;
      const text = htmlToPlainText(html);
      expect(text).toContain('Support Ticket');
      expect(text).toContain('Hello World!');
      expect(text).not.toContain('<h1>');
      expect(text).not.toContain('<style>');
    });
  });

  describe('2. Recipient Target Resolution', () => {
    it('should resolve custom database setting emails when present', async () => {
      const supportEmail = await getNotificationTargetEmail('SUPPORT');
      expect(supportEmail).toBe('custom-support@e3.qa');

      const contactEmail = await getNotificationTargetEmail('CONTACT');
      expect(contactEmail).toBe('custom-contact@e3.qa');
    });

    it('should default to category fallback emails if no db setting or env var exists', async () => {
      delete process.env.FEEDBACK_NOTIFICATION_EMAIL;
      const feedbackEmail = await getNotificationTargetEmail('FEEDBACK');
      expect(feedbackEmail).toBe('feedback@e3.qa');
    });
  });

  describe('3. Template Rendering', () => {
    it('should render Admin Support Ticket HTML template', () => {
      const html = renderAdminSupportTicketEmail({
        name: 'Sarah Connor',
        email: 'sarah@skynet.com',
        phone: '+974 5555 1234',
        message: 'Cannot access purchased ticket QR code',
        ticketId: 'inq_999',
      });
      expect(html).toContain('New Customer Support Ticket');
      expect(html).toContain('Sarah Connor');
      expect(html).toContain('sarah@skynet.com');
      expect(html).toContain('inq_999');
    });

    it('should render User Support Confirmation HTML template', () => {
      const html = renderUserSupportTicketConfirmationEmail({
        name: 'Ahmad Al-Mansoor',
        ticketId: 'inq_888',
      });
      expect(html).toContain('We Received Your Support Request');
      expect(html).toContain('Ahmad Al-Mansoor');
      expect(html).toContain('inq_888');
    });

    it('should render Admin Project Request HTML template', () => {
      const html = renderAdminProjectRequestEmail({
        name: 'Jassim Al-Thani',
        company: 'Qatar Media Corp',
        email: 'jassim@qmc.qa',
        phone: '+974 4444 0000',
        message: 'Requesting RFP for esports arena AV deployment',
        leadId: 'lead_555',
      });
      expect(html).toContain('New B2B Project Inquiry');
      expect(html).toContain('Qatar Media Corp');
      expect(html).toContain('lead_555');
    });

    it('should render Admin Feedback HTML template with star ratings', () => {
      const html = renderAdminFeedbackEmail({
        name: 'Fatima',
        email: 'fatima@example.qa',
        rating: 5,
        attractionId: 'virtuocity',
        message: 'Outstanding gaming setup and staff!',
      });
      expect(html).toContain('New Guest Feedback Submitted');
      expect(html).toContain('★★★★★');
      expect(html).toContain('Outstanding gaming setup and staff!');
    });

    it('should render Admin General Inquiry HTML template', () => {
      const html = renderAdminGeneralInquiryEmail({
        name: 'Omar',
        email: 'omar@example.com',
        subject: 'Partnership Inquiry',
        message: 'Interested in sponsoring InflataRUN 2026',
      });
      expect(html).toContain('New General Inquiry');
      expect(html).toContain('Partnership Inquiry');
      expect(html).toContain('InflataRUN 2026');
    });
  });

  describe('4. Provider Dispatch & Safe Execution Wrapper', () => {
    it('should dispatch via Console Mock when no RESEND_API_KEY is present', async () => {
      delete process.env.RESEND_API_KEY;
      const res = await sendEmail({
        to: 'admin@e3.qa',
        subject: 'Test Email Dispatch',
        html: '<p>Test content</p>',
        category: 'SUPPORT',
      });
      expect(res.success).toBe(true);
      expect(res.provider).toBe('console');
      expect(res.messageId).toContain('msg_mock_');
    });

    it('safelySendEmail should catch errors gracefully without throwing', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const res = await safelySendEmail({
        to: 'invalid-email-test',
        subject: 'Error Test',
        html: '<p>Error</p>',
      });
      expect(res.success).toBe(true);
      spy.mockRestore();
    });
  });

  describe('5. API Route Email Integration Verification', () => {
    it('POST /api/contact/b2c with SUPPORT_TICKET triggers DB save and returns 201', async () => {
      const req = new NextRequest('http://localhost/api/contact/b2c', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          actionType: 'SUPPORT_TICKET',
          name: 'Support Guest',
          email: 'support_guest@example.qa',
          phone: '+974 3333 4444',
          message: 'Lost ticket confirmation',
        }),
      });

      const res = await postB2CContact(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe('inq_test_101');
    });

    it('POST /api/contact/b2c with FEEDBACK triggers DB save and returns 201', async () => {
      const req = new NextRequest('http://localhost/api/contact/b2c', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          actionType: 'FEEDBACK',
          name: 'Feedback Guest',
          email: 'guest@example.qa',
          rating: 5,
          message: 'Great experience!',
        }),
      });

      const res = await postB2CContact(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe('fb_test_101');
    });

    it('POST /api/contact/b2b with PROJECT_REQUEST triggers DB save and returns 201', async () => {
      const req = new NextRequest('http://localhost/api/contact/b2b', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          actionType: 'PROJECT_REQUEST',
          name: 'Corporate Client',
          company: 'Doha Tech Group',
          email: 'client@dohatech.qa',
          message: 'VR Zone installation project proposal',
        }),
      });

      const res = await postB2BContact(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.lead.id).toBe('lead_tx_101');
    });

    it('POST /api/b2b/feedback triggers DB save and returns 201', async () => {
      const req = new NextRequest('http://localhost/api/b2b/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'B2B Partner',
          email: 'partner@example.com',
          title: 'Great Portal',
          message: 'Loved the B2B dashboard',
          rating: '5',
        }),
      });

      const res = await postB2BFeedback(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe('fb_test_102');
    });
  });

});
