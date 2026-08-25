import { describe, it, expect, vi } from 'vitest';
import { GET, POST, DELETE, PUT } from '../app/api/admin/migrate/route';

// Mock server auth
vi.mock('@/lib/server-auth', () => ({
  requireCurrentUser: vi.fn(),
  AppAuthError: class AppAuthError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
      super(message);
      this.name = 'AppAuthError';
      this.statusCode = statusCode;
    }
  }
}));

// Mock auto-migrate functions
vi.mock('@/lib/auto-migrate', () => ({
  applyPendingDatabaseMigrations: vi.fn().mockResolvedValue([]),
  publishAllContent: vi.fn().mockResolvedValue({ success: true }),
  cleanupSyntheticSmokeRecords: vi.fn().mockResolvedValue({ success: true }),
  sendDedicatedTestEmail: vi.fn().mockResolvedValue({ success: true })
}));

import { requireCurrentUser, AppAuthError } from '@/lib/server-auth';

describe('Admin Migrate Route RBAC & Authentication Enforcement', () => {
  it('rejects unauthenticated GET requests with HTTP 401', async () => {
    vi.mocked(requireCurrentUser).mockRejectedValueOnce(new AppAuthError(401, 'Unauthorized: No valid session'));

    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unauthorized');
  });

  it('rejects unauthenticated POST requests with HTTP 401', async () => {
    vi.mocked(requireCurrentUser).mockRejectedValueOnce(new AppAuthError(401, 'Unauthorized: No valid session'));

    const res = await POST();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unauthorized');
  });

  it('rejects unauthenticated DELETE requests with HTTP 401', async () => {
    vi.mocked(requireCurrentUser).mockRejectedValueOnce(new AppAuthError(401, 'Unauthorized: No valid session'));

    const res = await DELETE();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unauthorized');
  });

  it('rejects non-SUPER_ADMIN users with HTTP 403 Forbidden', async () => {
    vi.mocked(requireCurrentUser).mockResolvedValueOnce({
      id: 'user_123',
      name: 'Client User',
      email: 'client@example.com',
      role: 'CLIENT' as any,
      rawRole: 'CLIENT',
      sessionVersion: 1,
      permissions: ['b2c.read']
    });

    const res = await DELETE();
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Forbidden');
  });

  it('allows authorized SUPER_ADMIN to call DELETE', async () => {
    vi.mocked(requireCurrentUser).mockResolvedValueOnce({
      id: 'admin_123',
      name: 'Super Admin',
      email: 'admin@e3.qa',
      role: 'SUPER_ADMIN' as any,
      rawRole: 'SUPER_ADMIN',
      sessionVersion: 1,
      permissions: ['*']
    });

    const res = await DELETE();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
