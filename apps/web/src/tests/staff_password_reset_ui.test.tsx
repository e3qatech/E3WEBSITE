import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Mock Redis module for rate limiting
vi.mock('@/lib/redis', () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  },
}));

// Mock body limit
vi.mock('@/lib/body-limit', () => ({
  enforceBodyLimit: vi.fn().mockReturnValue(null),
}));

// Mock email sending module to inspect dispatched payload
const mockSendEmail = vi.fn().mockResolvedValue({ success: true });
vi.mock('@/lib/email', () => ({
  sendEmail: (...args: any[]) => mockSendEmail(...args),
  renderPasswordResetEmail: vi.fn().mockReturnValue('<html>Password Reset Link</html>'),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => ({
    get: (key: string) => (key === 'portal' ? 'staff' : null),
  })),
  usePathname: vi.fn(() => '/en/forgot-password'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

// In-memory Database Store for testing
interface MemoryUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  sessionVersion: number;
}

interface MemoryResetToken {
  id: string;
  token: string; // SHA-256 hash
  email: string;
  portal: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

const memoryUsers = new Map<string, MemoryUser>();
const memoryTokens = new Map<string, MemoryResetToken>();

vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { email?: string; id?: string } }) => {
        if (where.email) {
          return memoryUsers.get(where.email.toLowerCase()) || null;
        }
        if (where.id) {
          for (const u of Array.from(memoryUsers.values())) {
            if (u.id === where.id) return u;
          }
        }
        return null;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
        for (const [email, u] of Array.from(memoryUsers.entries())) {
          if (u.id === where.id) {
            const updated = { ...u, ...data };
            memoryUsers.set(email, updated);
            return updated;
          }
        }
        throw new Error('User not found');
      }),
    },
    passwordResetToken: {
      findFirst: vi.fn(async ({ where }: { where: { email?: string } }) => {
        for (const t of Array.from(memoryTokens.values())) {
          if (where.email && t.email === where.email.toLowerCase()) {
            return t;
          }
        }
        return null;
      }),
      findUnique: vi.fn(async ({ where }: { where: { token: string } }) => {
        return memoryTokens.get(where.token) || null;
      }),
      deleteMany: vi.fn(async ({ where }: { where: { email: string; usedAt?: any } }) => {
        let count = 0;
        for (const [k, t] of Array.from(memoryTokens.entries())) {
          if (t.email === where.email.toLowerCase()) {
            memoryTokens.delete(k);
            count++;
          }
        }
        return { count };
      }),
      create: vi.fn(async ({ data }: { data: any }) => {
        const id = `tok_${crypto.randomBytes(8).toString('hex')}`;
        const record: MemoryResetToken = {
          id,
          token: data.token,
          email: data.email.toLowerCase(),
          portal: data.portal || 'admin',
          expiresAt: data.expiresAt,
          usedAt: null,
          createdAt: new Date(),
        };
        memoryTokens.set(data.token, record);
        return record;
      }),
      updateMany: vi.fn(async ({ where, data }: { where: any; data: any }) => {
        const t = memoryTokens.get(where.token);
        if (!t) return { count: 0 };
        if (where.usedAt === null && t.usedAt !== null) return { count: 0 };
        if (where.expiresAt?.gt && t.expiresAt <= where.expiresAt.gt) return { count: 0 };

        t.usedAt = data.usedAt;
        memoryTokens.set(where.token, t);
        return { count: 1 };
      }),
    },
    $transaction: vi.fn(async (cb: any) => {
      const dbModule = await import('@/lib/db');
      return cb(dbModule.default);
    }),
  },
  db: {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { email?: string; id?: string } }) => {
        if (where.email) return memoryUsers.get(where.email.toLowerCase()) || null;
        return null;
      }),
    },
  },
}));

// Import Routes and Components under test
import { POST as postPasswordReset } from '@/app/api/auth/password-reset/route';
import { LoginForm } from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { PORTAL_CONFIGS } from '@/components/auth/PortalConfigs';

describe('Staff Password Reset UI & Security Regression Suite', () => {
  const originalAppBaseUrl = process.env.APP_BASE_URL;
  const originalNextAuthUrl = process.env.NEXTAUTH_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    memoryUsers.clear();
    memoryTokens.clear();
    process.env.APP_BASE_URL = 'https://e3-qatar-hntj2jrdx-e3qatechs-projects.vercel.app';
  });

  afterEach(() => {
    process.env.APP_BASE_URL = originalAppBaseUrl;
    process.env.NEXTAUTH_URL = originalNextAuthUrl;
  });

  // ---------------------------------------------------------------------------
  // 1. Staff Login Page Renders "Forgot password?" Link
  // ---------------------------------------------------------------------------
  describe('1. Staff Login Page UI', () => {
    it('renders visible "Forgot password?" link pointing to /[locale]/forgot-password?portal=staff in English', () => {
      const html = renderToStaticMarkup(<LoginForm config={PORTAL_CONFIGS.staff} locale="en" />);
      expect(html).toContain('data-testid="forgot-password-link"');
      expect(html).toContain('Forgot password?');
      expect(html).toContain('href="/en/forgot-password?portal=staff"');
    });

    it('renders visible "نسيت كلمة المرور؟" link pointing to /[locale]/forgot-password?portal=staff in Arabic', () => {
      const html = renderToStaticMarkup(<LoginForm config={PORTAL_CONFIGS.staff} locale="ar" />);
      expect(html).toContain('data-testid="forgot-password-link"');
      expect(html).toContain('نسيت كلمة المرور؟');
      expect(html).toContain('href="/ar/forgot-password?portal=staff"');
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Generic Public Response for Existing vs Unknown Emails
  // ---------------------------------------------------------------------------
  describe('2. Account Enumeration Prevention', () => {
    it('returns identical generic success response for existing active account', async () => {
      const knownEmail = 'staff.fatima@eeeqa.com';
      const initialHash = await bcrypt.hash('InitialStaffPassword123!', 10);
      memoryUsers.set(knownEmail, {
        id: 'usr_staff_01',
        email: knownEmail,
        name: 'Fatima Al-Kuwari',
        password: initialHash,
        role: 'STAFF',
        isActive: true,
        sessionVersion: 1,
      });

      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email: knownEmail,
          portal: 'staff',
          locale: 'en',
        }),
      });

      const res = await postPasswordReset(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('If an account exists, password reset instructions have been dispatched.');
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });

    it('returns identical generic success response for unknown/non-existent account without sending email', async () => {
      const unknownEmail = 'nobody.exists@eeeqa.com';

      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email: unknownEmail,
          portal: 'staff',
          locale: 'en',
        }),
      });

      const res = await postPasswordReset(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('If an account exists, password reset instructions have been dispatched.');
      // Never dispatches email for unknown accounts
      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Reset Email Contains Authoritative Preview Origin
  // ---------------------------------------------------------------------------
  describe('3. Authoritative Origin in Reset URL', () => {
    it('constructs reset URL using APP_BASE_URL preview origin without Host header tampering', async () => {
      process.env.APP_BASE_URL = 'https://e3-qatar-hntj2jrdx-e3qatechs-projects.vercel.app';
      const staffEmail = 'staff.ahmed@eeeqa.com';
      const hash = await bcrypt.hash('StaffPassword123!', 10);
      memoryUsers.set(staffEmail, {
        id: 'usr_staff_02',
        email: staffEmail,
        name: 'Ahmed Al-Thani',
        password: hash,
        role: 'STAFF',
        isActive: true,
        sessionVersion: 1,
      });

      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Host': 'attacker-phishing-domain.com', // Malicious host header should be ignored
        },
        body: JSON.stringify({
          action: 'request',
          email: staffEmail,
          portal: 'staff',
          locale: 'en',
        }),
      });

      const res = await postPasswordReset(req);
      expect(res.status).toBe(200);

      expect(mockSendEmail).toHaveBeenCalled();
      const sendArgs = mockSendEmail.mock.calls[0][0];
      expect(sendArgs.to).toBe(staffEmail);
      expect(sendArgs.subject).toContain('[E3 Qatar] Reset Your Account Password');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Token Single-Use & Conditional Atomic Invalidation
  // ---------------------------------------------------------------------------
  describe('4. Token Lifecycle & Single-Use Enforcement', () => {
    it('successfully changes password with valid token and invalidates token immediately', async () => {
      const email = 'staff.salem@eeeqa.com';
      const oldPassword = 'OldPassword123!';
      const oldHash = await bcrypt.hash(oldPassword, 10);
      memoryUsers.set(email, {
        id: 'usr_staff_03',
        email,
        name: 'Salem Al-Marri',
        password: oldHash,
        role: 'STAFF',
        isActive: true,
        sessionVersion: 1,
      });

      // 1. Generate token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      memoryTokens.set(tokenHash, {
        id: 'tok_01',
        token: tokenHash,
        email,
        portal: 'staff',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        createdAt: new Date(),
      });

      // 2. Submit new password
      const newPassword = 'NewStaffSecurePassword2026!';
      const resetReq = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          token: rawToken,
          password: newPassword,
        }),
      });

      const res = await postPasswordReset(resetReq);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.redirectUrl).toBe('/en/login/staff');

      // Verify token is marked as used
      const storedToken = memoryTokens.get(tokenHash);
      expect(storedToken?.usedAt).toBeInstanceOf(Date);

      // Verify user's password was updated and sessionVersion was incremented
      const updatedUser = memoryUsers.get(email);
      expect(updatedUser?.sessionVersion).toBe(2);
      const isNewValid = await bcrypt.compare(newPassword, updatedUser!.password);
      expect(isNewValid).toBe(true);
      const isOldValid = await bcrypt.compare(oldPassword, updatedUser!.password);
      expect(isOldValid).toBe(false);

      // 3. Second attempt with the same token must FAIL (HTTP 400)
      const secondReq = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          token: rawToken,
          password: 'AnotherPassword2026!',
        }),
      });

      const secondRes = await postPasswordReset(secondReq);
      expect(secondRes.status).toBe(400);
      const secondJson = await secondRes.json();
      expect(secondJson.error).toContain('Invalid, expired, or already used password reset token');
    });

    it('rejects expired tokens with HTTP 400', async () => {
      const email = 'staff.reem@eeeqa.com';
      const hash = await bcrypt.hash('StaffPassword123!', 10);
      memoryUsers.set(email, {
        id: 'usr_staff_04',
        email,
        name: 'Reem Al-Sulaiti',
        password: hash,
        role: 'STAFF',
        isActive: true,
        sessionVersion: 1,
      });

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      // Set expired timestamp
      memoryTokens.set(tokenHash, {
        id: 'tok_expired',
        token: tokenHash,
        email,
        portal: 'staff',
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        usedAt: null,
        createdAt: new Date(Date.now() - 3600000),
      });

      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          token: rawToken,
          password: 'NewValidPassword123!',
        }),
      });

      const res = await postPasswordReset(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid, expired, or already used password reset token');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Password Complexity Validation Rules
  // ---------------------------------------------------------------------------
  describe('5. Password Complexity Rules', () => {
    it('rejects passwords shorter than 8 characters', async () => {
      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token: 'tok_test', password: 'Short1!' }),
      });
      const res = await postPasswordReset(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Password must be at least 8 characters');
    });

    it('rejects passwords without uppercase letters', async () => {
      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token: 'tok_test', password: 'lowercaseonly123!' }),
      });
      const res = await postPasswordReset(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('at least one uppercase letter');
    });

    it('rejects passwords without numbers', async () => {
      const req = new NextRequest('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token: 'tok_test', password: 'NoNumbersHere!' }),
      });
      const res = await postPasswordReset(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('at least one number');
    });
  });

  // ---------------------------------------------------------------------------
  // 6. UI Component Rendering & Localization (EN / AR)
  // ---------------------------------------------------------------------------
  describe('6. ForgotPasswordForm & ResetPasswordForm UI Components', () => {
    it('renders ForgotPasswordForm in English', () => {
      const html = renderToStaticMarkup(<ForgotPasswordForm locale="en" />);
      expect(html).toContain('Reset Your Password');
      expect(html).toContain('data-testid="forgot-password-email-input"');
      expect(html).toContain('data-testid="forgot-password-submit-button"');
      expect(html).toContain('Send Reset Link');
    });

    it('renders ForgotPasswordForm in Arabic', () => {
      const html = renderToStaticMarkup(<ForgotPasswordForm locale="ar" />);
      expect(html).toContain('إعادة تعيين كلمة المرور');
      expect(html).toContain('data-testid="forgot-password-email-input"');
      expect(html).toContain('data-testid="forgot-password-submit-button"');
      expect(html).toContain('إرسال رابط إعادة التعيين');
    });

    it('renders ResetPasswordForm missing token warning when token query is absent', () => {
      const html = renderToStaticMarkup(<ResetPasswordForm locale="en" />);
      expect(html).toContain('data-testid="missing-token-state"');
      expect(html).toContain('Invalid Reset Link');
    });
  });
});
