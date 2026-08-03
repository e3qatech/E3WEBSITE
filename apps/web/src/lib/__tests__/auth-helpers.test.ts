import test from 'node:test';
import assert from 'node:assert';
import Module from 'node:module';

let mockSessionResult: any = null;
let mockUserDbResult: any = null;
let redirectPath: string | null = null;

const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id.endsWith('/auth') || id === '@/lib/auth' || id.endsWith('auth.ts')) {
    return {
      auth: async () => mockSessionResult
    };
  }
  if (id.endsWith('/db') || id === '@/lib/db' || id.endsWith('db.ts')) {
    return {
      db: {
        user: {
          findUnique: async () => mockUserDbResult
        }
      }
    };
  }
  if (id === 'next/navigation') {
    return {
      redirect: (path: string) => {
        redirectPath = path;
        throw new Error(`REDIRECT_TO_${path}`);
      }
    };
  }
  return originalRequire.apply(this, [id]);
};

// Now import the auth-helpers
const { requireSession, requireRole, requireApiSession, requireApiRole } = require('../auth-helpers');

test('Auth Helpers Security Matrix', async (t) => {

  t.afterEach(() => {
    mockSessionResult = null;
    mockUserDbResult = null;
    redirectPath = null;
  });

  await t.test('1. requireSession redirects to login if no session is active', async () => {
    mockSessionResult = null;

    await assert.rejects(
      async () => {
        await requireSession();
      },
      (err: any) => err.message === 'REDIRECT_TO_/auth/login'
    );
  });

  await t.test('2. requireSession redirects to login if user is not found in database', async () => {
    mockSessionResult = { user: { id: 'user-1' } };
    mockUserDbResult = null;

    await assert.rejects(
      async () => {
        await requireSession();
      },
      (err: any) => err.message === 'REDIRECT_TO_/auth/login'
    );
  });

  await t.test('3. requireSession redirects to login if user is inactive (disabled)', async () => {
    mockSessionResult = { user: { id: 'user-1' } };
    mockUserDbResult = {
      id: 'user-1',
      role: 'SUPER_ADMIN',
      isActive: false,
      name: 'Disabled User'
    };

    await assert.rejects(
      async () => {
        await requireSession();
      },
      (err: any) => err.message === 'REDIRECT_TO_/auth/login'
    );
  });

  await t.test('4. requireSession returns user if session is active and user is active', async () => {
    mockSessionResult = { user: { id: 'user-1' } };
    mockUserDbResult = {
      id: 'user-1',
      email: 'admin@e3.qa',
      role: 'SUPER_ADMIN',
      isActive: true,
      name: 'Admin User'
    };

    const user = await requireSession();
    assert.strictEqual(user.id, 'user-1');
    assert.strictEqual(user.isActive, true);
    assert.strictEqual(user.role, 'SUPER_ADMIN');
  });

  await t.test('5. requireRole redirects to dashboard if user does not have allowed role', async () => {
    mockSessionResult = { user: { id: 'user-1' } };
    mockUserDbResult = {
      id: 'user-1',
      email: 'client@e3.qa',
      role: 'CLIENT',
      isActive: true,
      name: 'Client User'
    };

    await assert.rejects(
      async () => {
        await requireRole(['SUPER_ADMIN', 'SALES_ADMIN']);
      },
      (err: any) => err.message === 'REDIRECT_TO_/dashboard'
    );
  });

  await t.test('6. requireRole returns user if user has one of allowed roles', async () => {
    mockSessionResult = { user: { id: 'user-1' } };
    mockUserDbResult = {
      id: 'user-1',
      email: 'sales@e3.qa',
      role: 'SALES_ADMIN',
      isActive: true,
      name: 'Sales Admin'
    };

    const user = await requireRole(['SUPER_ADMIN', 'SALES_ADMIN']);
    assert.strictEqual(user.role, 'SALES_ADMIN');
  });

  await t.test('7. requireApiSession returns 401 if no session active', async () => {
    mockSessionResult = null;
    const res = await requireApiSession();
    assert.ok('error' in res);
    assert.strictEqual(res.status, 401);
  });

  await t.test('8. requireApiSession returns 403 if user is inactive (deactivated)', async () => {
    mockSessionResult = { user: { id: 'user-1' } };
    mockUserDbResult = {
      id: 'user-1',
      role: 'SUPPORT_ADMIN',
      isActive: false,
      name: 'Inactive Staff'
    };

    const res = await requireApiSession();
    assert.ok('error' in res);
    assert.strictEqual(res.status, 403);
  });

  await t.test('9. requireApiRole returns 403 if user does not have correct role', async () => {
    mockSessionResult = { user: { id: 'user-1' } };
    mockUserDbResult = {
      id: 'user-1',
      role: 'STAFF',
      isActive: true,
      name: 'Staff User'
    };

    const res = await requireApiRole(['SUPER_ADMIN']);
    assert.ok('error' in res);
    assert.strictEqual(res.status, 403);
  });
});

// Restore original require after tests complete
test.after(() => {
  Module.prototype.require = originalRequire;
});
