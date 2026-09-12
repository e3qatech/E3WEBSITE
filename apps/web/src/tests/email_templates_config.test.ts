import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import {
  DEFAULT_EMAIL_TEMPLATE_CONFIG,
  replacePlaceholders,
  mergeTemplateConfig,
  getEmailTemplateConfig,
  EMAIL_TEMPLATES_SETTING_KEY,
} from '@/lib/email-templates';
import {
  renderApplicantConfirmationEmail,
  renderHRApplicationNotificationEmail,
  renderUserSupportTicketConfirmationEmail,
  renderUserB2BConfirmationEmail,
  renderCustomCandidateReplyEmail,
  getBaseEmailLayout,
} from '@/lib/email';
import { POST as postEmailSettings, GET as getEmailSettings } from '@/app/api/settings/emails/route';
import { POST as postCandidateReply } from '@/app/api/admin/careers/reply/route';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: 'admin_test_1',
      name: 'E3 Lead Recruiter',
      email: 'recruiter@e3.qa',
      role: 'SUPER_ADMIN',
    },
  }),
}));

// Mock permissions
vi.mock('@/lib/permissions', () => ({
  hasPermission: vi.fn().mockReturnValue(true),
}));

// Mock careers job-eligibility
vi.mock('@/lib/careers/job-eligibility', () => ({
  isHRAuthorized: vi.fn().mockReturnValue(true),
}));

// Mock db
const mockSettingStore: Record<string, any> = {};
const mockAppStore: Record<string, any> = {
  'app_100': {
    id: 'app_100',
    firstName: 'ابوبكر',
    lastName: 'الحاج',
    email: 'abubakeralhag375@gmail.com',
    jobTitle: 'Play Attendant (Operations)',
    status: 'NEW',
  },
};

vi.mock('@/lib/db', () => ({
  db: {
    setting: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockSettingStore[where.key] || null);
      }),
      upsert: vi.fn().mockImplementation(({ where, update, create }: any) => {
        mockSettingStore[where.key] = {
          key: where.key,
          value: update.value,
          type: update.type,
        };
        return Promise.resolve(mockSettingStore[where.key]);
      }),
    },
    jobApplication: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockAppStore[where.id] || null);
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        if (mockAppStore[where.id]) {
          Object.assign(mockAppStore[where.id], data);
        }
        return Promise.resolve(mockAppStore[where.id]);
      }),
    },
  },
  default: {
    setting: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockSettingStore[where.key] || null);
      }),
      upsert: vi.fn().mockImplementation(({ where, update, create }: any) => {
        mockSettingStore[where.key] = {
          key: where.key,
          value: update.value,
          type: update.type,
        };
        return Promise.resolve(mockSettingStore[where.key]);
      }),
    },
    jobApplication: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(mockAppStore[where.id] || null);
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        if (mockAppStore[where.id]) {
          Object.assign(mockAppStore[where.id], data);
        }
        return Promise.resolve(mockAppStore[where.id]);
      }),
    },
  },
}));

// Mock body-limit and rate-limit
vi.mock('@/lib/body-limit', () => ({
  enforceBodyLimit: vi.fn().mockReturnValue(null),
}));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Email Templates & Dynamic Reply Mechanism Suite', () => {
  const originalVercelEnv = process.env.VERCEL_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERCEL_ENV;
  });

  afterAll(() => {
    if (originalVercelEnv) process.env.VERCEL_ENV = originalVercelEnv;
    else delete process.env.VERCEL_ENV;
  });

  describe('1. Default Template Configuration & Fallbacks', () => {
    it('should have standard default footer pointing to www.e3.qa and Qatar phone', () => {
      expect(DEFAULT_EMAIL_TEMPLATE_CONFIG.footer.websiteDisplay).toBe('www.e3.qa');
      expect(DEFAULT_EMAIL_TEMPLATE_CONFIG.footer.websiteUrl).toBe('https://e3.qa');
      expect(DEFAULT_EMAIL_TEMPLATE_CONFIG.footer.phone).toBe('+974 3048 9955');
      expect(DEFAULT_EMAIL_TEMPLATE_CONFIG.footer.complianceNotice).toContain('Qatar PDPL Compliant');
    });

    it('should have standard default applicant confirmation copy with variable tokens', () => {
      const applicant = DEFAULT_EMAIL_TEMPLATE_CONFIG.applicantConfirmation;
      expect(applicant.subject).toContain('{jobTitle}');
      expect(applicant.greeting).toContain('{name}');
      expect(applicant.heading).toBe('Application Received');
      expect(applicant.nextStepsTitle).toContain('Next Steps');
    });
  });

  describe('2. Variable Token Replacer', () => {
    it('should replace dynamic {tokens} accurately', () => {
      const template = 'Hello {name}, your application for {jobTitle} has reference #{referenceCode}.';
      const result = replacePlaceholders(template, {
        name: 'ابوبكر الحاج',
        jobTitle: 'Play Attendant (Operations)',
        referenceCode: 'E3-APP-8ZGI-408W',
      });
      expect(result).toBe('Hello ابوبكر الحاج, your application for Play Attendant (Operations) has reference #E3-APP-8ZGI-408W.');
    });

    it('should leave unknown tokens intact without throwing errors', () => {
      const template = 'Subject: {title} on {date}';
      const result = replacePlaceholders(template, { title: 'Launch' });
      expect(result).toBe('Subject: Launch on {date}');
    });
  });

  describe('3. Deep Config Merger', () => {
    it('should preserve defaults when merging partial overrides', () => {
      const partial = {
        footer: {
          phone: '+974 5574 1543',
        },
        applicantConfirmation: {
          heading: 'تم استلام طلب التوظيف',
        },
      };

      const merged = mergeTemplateConfig(partial);
      expect(merged.footer.phone).toBe('+974 5574 1543');
      expect(merged.footer.websiteDisplay).toBe('www.e3.qa'); // Preserved default
      expect(merged.applicantConfirmation.heading).toBe('تم استلام طلب التوظيف');
      expect(merged.applicantConfirmation.greeting).toBe('Dear {name},'); // Preserved default
    });
  });

  describe('4. HTML Email Template Renderers with Custom Config', () => {
    it('should render applicant confirmation with customized footer and copy', () => {
      const customConfig = mergeTemplateConfig({
        footer: {
          websiteDisplay: 'www.e3.qa/careers',
          phone: '+974 3048 9955',
        },
        applicantConfirmation: {
          heading: 'تم استقبال طلبك بنجاح',
          nextStepsTitle: 'ملاحظة الموارد البشرية',
        },
      });

      const html = renderApplicantConfirmationEmail({
        name: 'ابوبكر الحاج',
        jobTitle: 'Play Attendant (Operations)',
        applicationId: 'app_999',
        config: customConfig,
      });

      expect(html).toContain('تم استقبال طلبك بنجاح');
      expect(html).toContain('ابوبكر الحاج');
      expect(html).toContain('Play Attendant (Operations)');
      expect(html).toContain('www.e3.qa/careers');
      expect(html).toContain('+974 3048 9955');
      expect(html).toContain('Qatar PDPL Compliant');
    });

    it('should render HR application notification with correct candidate data and footer', () => {
      const html = renderHRApplicationNotificationEmail({
        name: 'ابوبكر الحاج',
        email: 'abubakeralhag375@gmail.com',
        phone: '+97455741543',
        jobTitle: 'Play Attendant (Operations)',
        department: 'Operations',
        applicationId: 'app_100',
        cvUrl: 'https://e3.qa/cv.pdf',
      });

      expect(html).toContain('ابوبكر الحاج');
      expect(html).toContain('Play Attendant (Operations)');
      expect(html).toContain('abubakeralhag375@gmail.com');
      expect(html).toContain('+97455741543');
      expect(html).toContain('www.e3.qa');
    });

    it('should render custom direct candidate reply email', () => {
      const html = renderCustomCandidateReplyEmail({
        name: 'ابوبكر الحاج',
        jobTitle: 'Play Attendant (Operations)',
        subject: 'دعوة لمقابلة شخصية - E3 Qatar',
        message: 'يسرنا دعوتك لحضور مقابلة شخصية في مقر الشركة غداً الساعة ١٠ صباحاً.',
        nextSteps: 'يرجى إحضار أصل البطاقة الشخصية القطرية وجواز السفر.',
      });

      expect(html).toContain('دعوة لمقابلة شخصية - E3 Qatar');
      expect(html).toContain('ابوبكر الحاج');
      expect(html).toContain('Regarding: Play Attendant (Operations)');
      expect(html).toContain('يسرنا دعوتك لحضور مقابلة شخصية');
      expect(html).toContain('يرجى إحضار أصل البطاقة الشخصية القطرية');
      expect(html).toContain('www.e3.qa');
    });
  });

  describe('5. Email Settings API Endpoint (/api/settings/emails)', () => {
    it('GET should return current template settings and defaults', async () => {
      const req = new Request('http://localhost:3000/api/settings/emails');
      const res = await getEmailSettings(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.config.footer.websiteDisplay).toBe('www.e3.qa');
    });

    it('POST should update and persist custom email template settings', async () => {
      const req = new Request('http://localhost:3000/api/settings/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            footer: {
              phone: '+974 5113 8418',
            },
          },
        }),
      });

      const res = await postEmailSettings(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.config.footer.phone).toBe('+974 5113 8418');
    });
  });

  describe('6. Recruiter Candidate Reply API Endpoint (/api/admin/careers/reply)', () => {
    it('POST should validate input and send direct email reply to candidate', async () => {
      const req = new Request('http://localhost:3000/api/admin/careers/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: 'app_100',
          recipientEmail: 'abubakeralhag375@gmail.com',
          subject: 'Interview Scheduled: Play Attendant',
          message: 'We are pleased to invite you for an in-person interview at E3 HQ.',
          nextSteps: 'Please confirm by replying to this email.',
          updateStatus: 'INTERVIEW',
        }),
      });

      const res = await postCandidateReply(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.recipient).toBe('abubakeralhag375@gmail.com');
      expect(mockAppStore['app_100'].status).toBe('INTERVIEW');
    });

    it('POST should reject invalid payload without message or subject', async () => {
      const req = new Request('http://localhost:3000/api/admin/careers/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: 'app_100',
          subject: '',
          message: '',
        }),
      });

      const res = await postCandidateReply(req);
      expect(res.status).toBe(400);
    });
  });
});
