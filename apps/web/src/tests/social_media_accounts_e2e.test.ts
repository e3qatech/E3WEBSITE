import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: () => Promise.resolve({
    user: {
      id: 'super_admin_test',
      email: 'superadmin@eeeqa.com',
      role: 'SUPER_ADMIN',
    },
  }),
}));

import { GET as getAccounts, POST as postAccounts, DELETE as deleteAccounts } from '@/app/api/admin/social-media/accounts/route';
import { GET as getProviders } from '@/app/api/admin/social-media/providers/route';

function mockSuperAdminReq(url: string, method = 'GET', body?: any) {
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Social Media Hub Accounts End-to-End Test', () => {
  it('loads provider configs including default seeded platforms', async () => {
    const req = mockSuperAdminReq('http://localhost:3000/api/admin/social-media/providers');
    const res = await getProviders(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThanOrEqual(6);
    const providers = json.data.map((p: any) => p.provider);
    expect(providers).toContain('META_INSTAGRAM');
    expect(providers).toContain('MANUAL');
  });

  it('creates, lists, and disconnects a social account successfully', async () => {
    // 1. Create account
    const createReq = mockSuperAdminReq('http://localhost:3000/api/admin/social-media/accounts', 'POST', {
      provider: 'META_INSTAGRAM',
      username: 'e3_test_hub',
      displayName: 'E3 Test Hub Official',
      internalName: 'Instagram: @e3_test_hub',
    });

    const createRes = await postAccounts(createReq);
    const createJson = await createRes.json();

    expect(createRes.status).toBe(200);
    expect(createJson.success).toBe(true);
    expect(createJson.data.username).toBe('e3_test_hub');
    const createdId = createJson.data.id;

    // 2. Fetch accounts and verify presence
    const listReq = mockSuperAdminReq('http://localhost:3000/api/admin/social-media/accounts');
    const listRes = await getAccounts(listReq);
    const listJson = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listJson.success).toBe(true);
    const found = listJson.data.find((a: any) => a.id === createdId);
    expect(found).toBeDefined();
    expect(found.username).toBe('e3_test_hub');

    // 3. Clean up / Delete account
    const delReq = mockSuperAdminReq(`http://localhost:3000/api/admin/social-media/accounts?id=${createdId}`, 'DELETE');
    const delRes = await deleteAccounts(delReq);
    const delJson = await delRes.json();

    expect(delRes.status).toBe(200);
    expect(delJson.success).toBe(true);
  });
});
