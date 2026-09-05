import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// In-memory test store
interface MockUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  password?: string | null;
  isActive: boolean;
  sessionVersion: number;
}

let mockCurrentUser: {
  id: string;
  name: string;
  email: string;
  role: string;
  rawRole: string;
  sessionVersion: number;
  permissions: string[];
} | null = null;

let usersStore: MockUser[] = [];
let logsStore: any[] = [];
let accountsStore: any[] = [];
let sessionsStore: any[] = [];
let clientMembershipsStore: any[] = [];
let systemLogsStore: any[] = [];
let jobApplicationsStore: any[] = [];
let packageLeadsStore: any[] = [];
let invitationTokensStore: any[] = [];
let verificationTokensStore: any[] = [];

// Mock server-auth
vi.mock('@/lib/server-auth', () => {
  class MockAppAuthError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
      super(message);
      this.name = 'AppAuthError';
      this.statusCode = statusCode;
    }
  }

  return {
    AppAuthError: MockAppAuthError,
    requireCurrentUser: vi.fn(async () => {
      if (!mockCurrentUser) {
        throw new MockAppAuthError(401, 'Unauthorized: No valid session');
      }
      return mockCurrentUser;
    }),
  };
});

// Mock database
vi.mock('@/lib/db', () => {
  const dbMock = {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.id) {
          return usersStore.find((u) => u.id === where.id) || null;
        }
        if (where.email) {
          return usersStore.find((u) => u.email.toLowerCase() === where.email?.toLowerCase()) || null;
        }
        return null;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        let result = [...usersStore];
        if (where?.role) {
          result = result.filter((u) => u.role === where.role);
        }
        return result.map((u) => ({
          ...u,
          clientMemberships: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }),
      count: vi.fn(async ({ where }: any) => {
        let count = 0;
        for (const u of usersStore) {
          let match = true;
          if (where?.role && u.role !== where.role) match = false;
          if (where?.isActive !== undefined && u.isActive !== where.isActive) match = false;
          if (match) count++;
        }
        return count;
      }),
      create: vi.fn(async ({ data }: any) => {
        const newUser: MockUser = {
          id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: data.name || null,
          email: data.email,
          role: data.role,
          password: data.password || null,
          isActive: data.isActive ?? true,
          sessionVersion: data.sessionVersion ?? 1,
        };
        usersStore.push(newUser);
        return newUser;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = usersStore.findIndex((u) => u.id === where.id);
        if (idx === -1) throw new Error('User not found');
        const updated = { ...usersStore[idx], ...data };
        usersStore[idx] = updated;
        return updated;
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = usersStore.findIndex((u) => u.id === where.id);
        if (idx === -1) throw new Error('User not found');
        const [deleted] = usersStore.splice(idx, 1);
        return deleted;
      }),
    },
    systemLog: {
      create: vi.fn(async ({ data }: any) => {
        logsStore.push(data);
        return data;
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        systemLogsStore.forEach((item) => {
          if (where.userId && item.userId === where.userId) {
            Object.assign(item, data);
          }
        });
        return { count: 1 };
      }),
    },
    account: {
      deleteMany: vi.fn(async ({ where }: any) => {
        accountsStore = accountsStore.filter((a) => a.userId !== where.userId);
        return { count: 1 };
      }),
    },
    session: {
      deleteMany: vi.fn(async ({ where }: any) => {
        sessionsStore = sessionsStore.filter((s) => s.userId !== where.userId);
        return { count: 1 };
      }),
    },
    clientMembership: {
      deleteMany: vi.fn(async ({ where }: any) => {
        clientMembershipsStore = clientMembershipsStore.filter((m) => m.userId !== where.userId);
        return { count: 1 };
      }),
    },
    jobApplication: {
      updateMany: vi.fn(async ({ where, data }: any) => {
        jobApplicationsStore.forEach((j) => {
          if (where.userId && j.userId === where.userId) {
            Object.assign(j, data);
          }
        });
        return { count: 1 };
      }),
    },
    packageLead: {
      updateMany: vi.fn(async ({ where, data }: any) => {
        packageLeadsStore.forEach((p) => {
          if (where.assignedToId && p.assignedToId === where.assignedToId) {
            Object.assign(p, data);
          }
        });
        return { count: 1 };
      }),
    },
    invitationToken: {
      deleteMany: vi.fn(async ({ where }: any) => {
        invitationTokensStore = invitationTokensStore.filter((t) => t.createdById !== where.createdById);
        return { count: 1 };
      }),
    },
    verificationToken: {
      findUnique: vi.fn(async ({ where }: { where: { token: string } }) => {
        return verificationTokensStore.find((t) => t.token === where.token) || null;
      }),
      create: vi.fn(async ({ data }: any) => {
        verificationTokensStore.push(data);
        return data;
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = verificationTokensStore.findIndex((t) => t.token === where.token);
        if (idx !== -1) {
          const [deleted] = verificationTokensStore.splice(idx, 1);
          return deleted;
        }
        return null;
      }),
      deleteMany: vi.fn(async ({ where }: any) => {
        if (where?.identifier?.startsWith) {
          const prefix = where.identifier.startsWith;
          verificationTokensStore = verificationTokensStore.filter((t) => !t.identifier.startsWith(prefix));
        } else if (where?.identifier?.contains) {
          const substr = where.identifier.contains;
          verificationTokensStore = verificationTokensStore.filter((t) => !t.identifier.includes(substr));
        }
        return { count: 1 };
      }),
    },
    $transaction: vi.fn(async (cb: any) => {
      return cb(dbMock);
    }),
  };

  return { default: dbMock };
});

// Import route handlers under test
import { DELETE as deleteUserHandler, PATCH as patchUserHandler } from '../app/api/admin/users/[id]/route';
import { POST as createUserHandler, GET as listUsersHandler } from '../app/api/admin/users/route';
import { POST as passwordResetHandler } from '../app/api/auth/password-reset/route';
import { POST as registerHandler } from '../app/api/auth/register/route';
import { isAuthorizedForPortal, normalizeRole } from '@/lib/auth-roles';

describe('User Management: Hardened Freeze, Delete, RBAC Escalation & Password Reset Suite', () => {
  beforeEach(async () => {
    usersStore = [
      {
        id: 'user-super-1',
        name: 'Master Admin',
        email: 'admin@e3.qa',
        role: 'SUPER_ADMIN',
        password: await bcrypt.hash('MasterAdmin123!', 10),
        isActive: true,
        sessionVersion: 1,
      },
      {
        id: 'user-events-1',
        name: 'Events Lead',
        email: 'events@e3.qa',
        role: 'EVENTS_ADMIN',
        password: await bcrypt.hash('EventsLead123!', 10),
        isActive: true,
        sessionVersion: 1,
      },
      {
        id: 'user-staff-1',
        name: 'Staff Operator',
        email: 'staff@e3.qa',
        role: 'STAFF',
        password: await bcrypt.hash('StaffPass123!', 10),
        isActive: true,
        sessionVersion: 1,
      },
    ];

    logsStore = [];
    accountsStore = [{ id: 'acc-1', userId: 'user-staff-1' }];
    sessionsStore = [{ id: 'sess-1', userId: 'user-staff-1' }];
    clientMembershipsStore = [];
    systemLogsStore = [{ id: 'log-1', userId: 'user-staff-1' }];
    jobApplicationsStore = [{ id: 'job-1', userId: 'user-staff-1' }];
    packageLeadsStore = [{ id: 'lead-1', assignedToId: 'user-staff-1' }];
    invitationTokensStore = [{ id: 'inv-1', createdById: 'user-staff-1' }];
    verificationTokensStore = [];

    // Default authenticated caller is Master Super Admin
    mockCurrentUser = {
      id: 'user-super-1',
      name: 'Master Admin',
      email: 'admin@e3.qa',
      role: 'SUPER_ADMIN',
      rawRole: 'SUPER_ADMIN',
      sessionVersion: 1,
      permissions: ['*'],
    };
  });

  describe('1. User Account Deletion (DELETE /api/admin/users/[id])', () => {
    it('rejects unauthenticated requests with 401', async () => {
      mockCurrentUser = null;
      const res = await deleteUserHandler(new Request('http://localhost/api/admin/users/user-staff-1'), {
        params: Promise.resolve({ id: 'user-staff-1' }),
      });
      expect(res.status).toBe(401);
    });

    it('rejects unauthorized roles (e.g. STAFF without rbac.manage) with 403', async () => {
      mockCurrentUser = {
        id: 'user-staff-1',
        name: 'Staff Operator',
        email: 'staff@e3.qa',
        role: 'STAFF',
        rawRole: 'STAFF',
        sessionVersion: 1,
        permissions: ['duty.view'],
      };

      const res = await deleteUserHandler(new Request('http://localhost/api/admin/users/user-events-1'), {
        params: Promise.resolve({ id: 'user-events-1' }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Forbidden');
    });

    it('rejects self-deletion attempts by the logged in administrator with 403', async () => {
      const res = await deleteUserHandler(new Request('http://localhost/api/admin/users/user-super-1'), {
        params: Promise.resolve({ id: 'user-super-1' }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('You cannot delete your own active account');
    });

    it('rejects non-superadmin attempting to delete a Super Admin', async () => {
      // Sub-admin with rbac.manage permission but role is not SUPER_ADMIN
      mockCurrentUser = {
        id: 'user-events-1',
        name: 'Events Lead',
        email: 'events@e3.qa',
        role: 'SUPPORT_ADMIN',
        rawRole: 'SUPPORT_ADMIN',
        sessionVersion: 1,
        permissions: ['rbac.manage'],
      };

      const res = await deleteUserHandler(new Request('http://localhost/api/admin/users/user-super-1'), {
        params: Promise.resolve({ id: 'user-super-1' }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Only a Super Admin can delete a Super Admin account');
    });

    it('prevents deleting the only remaining Super Admin account', async () => {
      // Create a second super admin caller
      usersStore.push({
        id: 'user-super-2',
        name: 'Secondary Admin',
        email: 'admin2@e3.qa',
        role: 'SUPER_ADMIN',
        isActive: true,
        sessionVersion: 1,
      });

      mockCurrentUser = {
        id: 'user-super-2',
        name: 'Secondary Admin',
        email: 'admin2@e3.qa',
        role: 'SUPER_ADMIN',
        rawRole: 'SUPER_ADMIN',
        sessionVersion: 1,
        permissions: ['*'],
      };

      // Temporarily leave only 1 Super Admin in DB count
      usersStore = usersStore.filter((u) => u.id !== 'user-super-2');

      const res = await deleteUserHandler(new Request('http://localhost/api/admin/users/user-super-1'), {
        params: Promise.resolve({ id: 'user-super-1' }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Cannot delete the only remaining Super Admin account');
    });

    it('successfully deletes a user and cascades/unlinks all foreign relations atomically', async () => {
      const res = await deleteUserHandler(new Request('http://localhost/api/admin/users/user-staff-1'), {
        params: Promise.resolve({ id: 'user-staff-1' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.id).toBe('user-staff-1');

      // Verify user was deleted from store
      expect(usersStore.find((u) => u.id === 'user-staff-1')).toBeUndefined();

      // Verify relations unlinked
      expect(accountsStore.filter((a) => a.userId === 'user-staff-1')).toHaveLength(0);
      expect(sessionsStore.filter((s) => s.userId === 'user-staff-1')).toHaveLength(0);
      expect(systemLogsStore[0].userId).toBeNull();
      expect(jobApplicationsStore[0].userId).toBeNull();
      expect(packageLeadsStore[0].assignedToId).toBeNull();

      // Verify audit log recorded
      expect(logsStore).toContainEqual(
        expect.objectContaining({
          action: 'USER_DELETED',
          entity: 'User',
          entityId: 'user-staff-1',
          userId: 'user-super-1',
        })
      );
    });
  });

  describe('2. User Freeze & Update API (PATCH /api/admin/users/[id])', () => {
    it('freezing a user sets isActive: false and increments sessionVersion to immediately revoke sessions', async () => {
      const target = usersStore.find((u) => u.id === 'user-staff-1')!;
      expect(target.isActive).toBe(true);
      const initialVersion = target.sessionVersion;

      const req = new Request('http://localhost/api/admin/users/user-staff-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });

      const res = await patchUserHandler(req, { params: Promise.resolve({ id: 'user-staff-1' }) });
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.isActive).toBe(false);
      expect(data.sessionVersion).toBe(initialVersion + 1);

      // Verify DB record
      const updatedUser = usersStore.find((u) => u.id === 'user-staff-1')!;
      expect(updatedUser.isActive).toBe(false);
      expect(updatedUser.sessionVersion).toBe(initialVersion + 1);

      // Verify audit log
      expect(logsStore).toContainEqual(
        expect.objectContaining({
          action: 'USER_FROZEN',
          entityId: 'user-staff-1',
        })
      );
    });

    it('unfreezing a frozen user restores isActive: true', async () => {
      // First freeze
      usersStore.find((u) => u.id === 'user-staff-1')!.isActive = false;

      const req = new Request('http://localhost/api/admin/users/user-staff-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });

      const res = await patchUserHandler(req, { params: Promise.resolve({ id: 'user-staff-1' }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isActive).toBe(true);

      expect(logsStore).toContainEqual(
        expect.objectContaining({
          action: 'USER_UNFROZEN',
          entityId: 'user-staff-1',
        })
      );
    });

    it('rejects prototype pollution attacks on PATCH with 400', async () => {
      const req = new Request('http://localhost/api/admin/users/user-staff-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: '{"__proto__": {"isAdmin": true}, "name": "Hacker"}',
      });

      const res = await patchUserHandler(req, { params: Promise.resolve({ id: 'user-staff-1' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Malformed');
    });

    it('prevents non-superadmins from escalating roles to SUPER_ADMIN', async () => {
      mockCurrentUser = {
        id: 'user-events-1',
        name: 'Events Lead',
        email: 'events@e3.qa',
        role: 'SUPPORT_ADMIN',
        rawRole: 'SUPPORT_ADMIN',
        sessionVersion: 1,
        permissions: ['rbac.manage'],
      };

      const req = new Request('http://localhost/api/admin/users/user-staff-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'SUPER_ADMIN' }),
      });

      const res = await patchUserHandler(req, { params: Promise.resolve({ id: 'user-staff-1' }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Only Super Admin can assign the Super Admin role');
    });

    it('prevents freezing or demoting the last active Super Admin', async () => {
      const req = new Request('http://localhost/api/admin/users/user-super-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });

      const res = await patchUserHandler(req, { params: Promise.resolve({ id: 'user-super-1' }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Cannot demote or freeze the last remaining active Super Admin');
    });

    it('admin password update hashes with bcrypt and increments sessionVersion', async () => {
      const target = usersStore.find((u) => u.id === 'user-staff-1')!;
      const oldVersion = target.sessionVersion;

      const req = new Request('http://localhost/api/admin/users/user-staff-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'BrandNewSecurePassword2026!' }),
      });

      const res = await patchUserHandler(req, { params: Promise.resolve({ id: 'user-staff-1' }) });
      expect(res.status).toBe(200);

      const updated = usersStore.find((u) => u.id === 'user-staff-1')!;
      expect(updated.sessionVersion).toBe(oldVersion + 1);
      const isMatch = await bcrypt.compare('BrandNewSecurePassword2026!', updated.password!);
      expect(isMatch).toBe(true);

      expect(logsStore).toContainEqual(
        expect.objectContaining({
          action: 'USER_PASSWORD_RESET_ADMIN',
          entityId: 'user-staff-1',
        })
      );
    });
  });

  describe('3. User Creation API (POST /api/admin/users)', () => {
    it('creates new user with normalized role, active status, and sessionVersion: 1', async () => {
      const req = new Request('http://localhost/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Package Specialist',
          email: 'packages@e3.qa',
          role: 'EVENTS_ADMIN',
          password: 'Password123!',
        }),
      });

      const res = await createUserHandler(req);
      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.email).toBe('packages@e3.qa');
      expect(data.isActive).toBe(true);
      expect(data.sessionVersion).toBe(1);

      // Verify in store
      const inStore = usersStore.find((u) => u.email === 'packages@e3.qa');
      expect(inStore).toBeDefined();
      expect(inStore?.name).toBe('Package Specialist');

      expect(logsStore).toContainEqual(
        expect.objectContaining({
          action: 'USER_CREATED',
          userId: 'user-super-1',
        })
      );
    });

    it('rejects duplicate email with 409 Conflict', async () => {
      const req = new Request('http://localhost/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate Admin',
          email: 'admin@e3.qa',
          role: 'STAFF',
        }),
      });

      const res = await createUserHandler(req);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toContain('already exists');
    });

    it('rejects invalid email formats via Zod schema', async () => {
      const req = new Request('http://localhost/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Bad Email User',
          email: 'not-an-email',
          role: 'STAFF',
        }),
      });

      const res = await createUserHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Valid email address is required');
    });

    it('prevents non-superadmin from creating a Super Admin account', async () => {
      mockCurrentUser = {
        id: 'user-events-1',
        name: 'Events Lead',
        email: 'events@e3.qa',
        role: 'SUPPORT_ADMIN',
        rawRole: 'SUPPORT_ADMIN',
        sessionVersion: 1,
        permissions: ['rbac.manage'],
      };

      const req = new Request('http://localhost/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Rogue Admin',
          email: 'rogue@e3.qa',
          role: 'SUPER_ADMIN',
        }),
      });

      const res = await createUserHandler(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Only Super Admin can create Super Admin accounts');
    });
  });

  describe('4. Forgot & Reset Password Flow Security (POST /api/auth/password-reset)', () => {
    it('returns generic response for frozen account and does not generate reset token', async () => {
      // Freeze events user
      usersStore.find((u) => u.id === 'user-events-1')!.isActive = false;

      const req = new Request('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email: 'events@e3.qa',
          portal: 'events',
          locale: 'en',
        }),
      });

      const res = await passwordResetHandler(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Ensure no verification token was created in DB for the frozen account
      expect(verificationTokensStore).toHaveLength(0);
    });

    it('generates SHA-256 hashed single-use token with events portal and locale identifier', async () => {
      // Set test environment flag to receive raw token in test
      const originalEnv = process.env.NODE_ENV;
      const originalVitest = process.env.VITEST;
      (process.env as any).NODE_ENV = 'test';
      process.env.VITEST = 'true';

      const req = new Request('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          email: 'events@e3.qa',
          portal: 'events',
          locale: 'ar',
        }),
      });

      const res = await passwordResetHandler(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.resetToken).toBeDefined();

      const rawToken = data.resetToken;
      const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      // Check verification token record
      expect(verificationTokensStore).toHaveLength(1);
      const record = verificationTokensStore[0];
      expect(record.token).toBe(expectedHash);
      expect(record.identifier).toBe('pwd_reset:events@e3.qa:events:ar');

      (process.env as any).NODE_ENV = originalEnv;
      process.env.VITEST = originalVitest;
    });

    it('rejects password reset if user account was frozen after token was issued', async () => {
      const rawToken = 'test-raw-token-12345';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      verificationTokensStore.push({
        token: tokenHash,
        identifier: 'pwd_reset:events@e3.qa:events:en',
        expires: new Date(Date.now() + 60 * 60 * 1000),
      });

      // Freeze user
      usersStore.find((u) => u.id === 'user-events-1')!.isActive = false;

      const req = new Request('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          token: rawToken,
          password: 'ValidPassword123!',
        }),
      });

      const res = await passwordResetHandler(req as any);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('account has been frozen');
    });

    it('completes password reset, increments sessionVersion, deletes token, and redirects to events portal with active locale', async () => {
      const rawToken = 'test-raw-token-events-qa';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      verificationTokensStore.push({
        token: tokenHash,
        identifier: 'pwd_reset:events@e3.qa:events:ar',
        expires: new Date(Date.now() + 60 * 60 * 1000),
      });

      const initialVersion = usersStore.find((u) => u.id === 'user-events-1')!.sessionVersion;

      const req = new Request('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          token: rawToken,
          password: 'BrandNewSecureEventsPassword123!',
        }),
      });

      const res = await passwordResetHandler(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.redirectUrl).toBe('/ar/login/events');

      // Token deleted immediately (single-use)
      expect(verificationTokensStore).toHaveLength(0);

      // Password updated & sessionVersion bumped
      const updatedUser = usersStore.find((u) => u.id === 'user-events-1')!;
      expect(updatedUser.sessionVersion).toBe(initialVersion + 1);
      const isCorrect = await bcrypt.compare('BrandNewSecureEventsPassword123!', updatedUser.password!);
      expect(isCorrect).toBe(true);
    });

    it('rejects reusing the same token after reset has completed', async () => {
      const rawToken = 'reused-token-test';
      const req = new Request('http://localhost/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          token: rawToken,
          password: 'AnotherPassword123!',
        }),
      });

      const res = await passwordResetHandler(req as any);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid, expired, or already used');
    });
  });

  describe('5. Dashboard Access Approval & Strict Portal Isolation Suite', () => {
    it('approving a user via PATCH /api/admin/users/[id] sets isActive: true and logs USER_APPROVED', async () => {
      // Create a pending/inactive user
      usersStore.push({
        id: 'user-pending-1',
        name: 'Pending Admin Candidate',
        email: 'pending@e3.qa',
        role: 'STAFF',
        isActive: false,
        sessionVersion: 1,
      });

      const req = new Request('http://localhost/api/admin/users/user-pending-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true, isActive: true }),
      });

      const res = await patchUserHandler(req, { params: Promise.resolve({ id: 'user-pending-1' }) });
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.isActive).toBe(true);
      const inStore = usersStore.find((u) => u.id === 'user-pending-1');
      expect(inStore?.isActive).toBe(true);

      expect(logsStore).toContainEqual(
        expect.objectContaining({
          action: 'USER_APPROVED',
          entityId: 'user-pending-1',
        })
      );
    });

    it('rejects public self-registration attempting admin, HR, or staff roles with 403', async () => {
      const maliciousRoles = ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'STAFF', 'EVENTS_ADMIN', 'OPERATIONS_ADMIN'];

      for (const forbiddenRole of maliciousRoles) {
        const req = new Request('http://localhost/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Malicious Actor',
            email: `hacker-${forbiddenRole.toLowerCase()}@example.com`,
            password: 'StrongPassword123!',
            role: forbiddenRole,
          }),
        });

        const res = await registerHandler(req as any);
        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.error).toContain('Administrative and staff accounts cannot be self-registered');
      }
    });

    it('allows public self-registration for CANDIDATE (applicant) and CLIENT (business)', async () => {
      const candidateReq = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Real Applicant',
          email: 'applicant-valid@example.com',
          password: 'StrongPassword123!',
          role: 'CANDIDATE',
        }),
      });

      const candidateRes = await registerHandler(candidateReq as any);
      expect(candidateRes.status).toBe(200);
      const candidateData = await candidateRes.json();
      expect(candidateData.success).toBe(true);
      expect(candidateData.user.role).toBe('CANDIDATE');

      const clientReq = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Enterprise Client',
          email: 'client-valid@company.com',
          password: 'StrongPassword123!',
          role: 'CLIENT',
        }),
      });

      const clientRes = await registerHandler(clientReq as any);
      expect(clientRes.status).toBe(200);
      const clientData = await clientRes.json();
      expect(clientData.success).toBe(true);
      expect(clientData.user.role).toBe('CLIENT');
    });

    it('strictly denies CANDIDATE and CLIENT roles from accessing the admin dashboard portal', () => {
      expect(isAuthorizedForPortal('CANDIDATE', 'admin')).toBe(false);
      expect(isAuthorizedForPortal('APPLICANT', 'admin')).toBe(false);
      expect(isAuthorizedForPortal('CLIENT', 'admin')).toBe(false);
      expect(isAuthorizedForPortal('BUSINESS_USER', 'admin')).toBe(false);

      // Only administrative and staff roles are permitted for admin dashboard portal
      expect(isAuthorizedForPortal('SUPER_ADMIN', 'admin')).toBe(true);
      expect(isAuthorizedForPortal('SALES_ADMIN', 'admin')).toBe(true);
      expect(isAuthorizedForPortal('SUPPORT_ADMIN', 'admin')).toBe(true);
      expect(isAuthorizedForPortal('HR_ADMIN', 'admin')).toBe(true);
      expect(isAuthorizedForPortal('OPERATIONS_ADMIN', 'admin')).toBe(true);
    });

    it('strictly isolates CANDIDATE to careers portal and CLIENT to business portal', () => {
      expect(isAuthorizedForPortal('CANDIDATE', 'careers')).toBe(true);
      expect(isAuthorizedForPortal('CANDIDATE', 'business')).toBe(false);

      expect(isAuthorizedForPortal('CLIENT', 'business')).toBe(true);
      expect(isAuthorizedForPortal('CLIENT', 'careers')).toBe(false);
    });
  });
});
