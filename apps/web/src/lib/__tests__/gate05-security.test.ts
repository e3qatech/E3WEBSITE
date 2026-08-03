import test from 'node:test';
import assert from 'node:assert';
import Module from 'node:module';
import crypto from 'crypto';

let mockSessionResult: any = null;
let mockUserDbResult: any = null;

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
        },
        feedback: {
          create: async (args: any) => ({ id: 'fb-1', ...args.data })
        },
        inquiry: {
          create: async (args: any) => ({ id: 'inq-1', ...args.data })
        },
        media: {
          create: async (args: any) => ({ id: 'med-1', ...args.data }),
          findUnique: async () => ({ id: 'med-1', url: 'https://blob/1.jpg' }),
          delete: async () => ({ id: 'med-1' })
        },
        eventSchedule: {
          update: async () => ({ id: 'sched-1' })
        }
      }
    };
  }
  return originalRequire.apply(this, [id]);
};

// Import handlers after module hook setup
const { POST: uploadPOST } = require('../../app/api/upload/route');
const { POST: contactB2CPOST } = require('../../app/api/contact/b2c/route');
const { POST: bookingQubePOST } = require('../../app/api/webhooks/bookingqube/route');

test('Gate 05 Rapid Audit Security Matrix', async (t) => {

  t.afterEach(() => {
    mockSessionResult = null;
    mockUserDbResult = null;
  });

  await t.test('1. Invalid payload returns 400', async () => {
    const req = new Request('http://localhost/api/contact/b2c', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ actionType: 'SUPPORT_TICKET', name: 'A' }) // missing email & message
    });
    const res = await contactB2CPOST(req);
    assert.strictEqual(res.status, 400);
  });

  await t.test('2. Oversized public upload is rejected with 400', async () => {
    const formData = new FormData();
    formData.append('context', 'public_resume');
    const largeBlob = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'application/pdf' });
    formData.append('file', largeBlob, 'resume.pdf');

    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData
    });
    const res = await uploadPOST(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  await t.test('3. Disallowed file MIME/extension is rejected with 400', async () => {
    const formData = new FormData();
    formData.append('context', 'public_resume');
    const exeBlob = new Blob(['binary'], { type: 'application/x-msdownload' });
    formData.append('file', exeBlob, 'malware.exe');

    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData
    });
    const res = await uploadPOST(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  await t.test('4. Unsigned webhook is rejected with 401', async () => {
    const req = new Request('http://localhost/api/webhooks/bookingqube', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'evt_1', type: 'ticket.purchased', scheduleId: 'sch_1', quantity: 2 })
    });
    const res = await bookingQubePOST(req);
    assert.strictEqual(res.status, 401);
  });

  await t.test('5. Valid signed webhook is processed and duplicate is idempotent', async () => {
    const secret = process.env.BOOKINGQUBE_WEBHOOK_SECRET || 'mock_secret';
    const payloadStr = JSON.stringify({ id: 'evt_unique_100', type: 'ticket.purchased', scheduleId: 'sch_1', quantity: 2 });
    const hmac = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

    const req1 = new Request('http://localhost/api/webhooks/bookingqube', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bookingqube-signature': hmac
      },
      body: payloadStr
    });
    const res1 = await bookingQubePOST(req1);
    assert.strictEqual(res1.status, 200);
    const json1 = await res1.json();
    assert.strictEqual(json1.received, true);

    // Replay exact duplicate event
    const req2 = new Request('http://localhost/api/webhooks/bookingqube', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bookingqube-signature': hmac
      },
      body: payloadStr
    });
    const res2 = await bookingQubePOST(req2);
    assert.strictEqual(res2.status, 200);
    const json2 = await res2.json();
    assert.strictEqual(json2.status, 'duplicate_ignored');
  });

  await t.test('6. Honeypot spam submission returns 400', async () => {
    const req = new Request('http://localhost/api/contact/b2c', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        actionType: 'SUPPORT_TICKET',
        name: 'Spammer',
        email: 'spam@bot.com',
        message: 'Buy cheap items!',
        website_hp: 'http://spam.url'
      })
    });
    const res = await contactB2CPOST(req);
    assert.strictEqual(res.status, 400);
  });

});

test.after(() => {
  Module.prototype.require = originalRequire;
});
