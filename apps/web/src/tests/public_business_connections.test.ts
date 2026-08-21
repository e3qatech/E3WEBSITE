import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import zlib from 'zlib';

// Helper to construct real, conforming in-memory ZIP buffers for test fixtures
function createInMemoryZip(files: Array<{ name: string; content: string | Buffer }>): Buffer {
  const localHeaders: Buffer[] = [];
  const cdHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const rawContent = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'utf8');
    const compressed = zlib.deflateRawSync(rawContent);

    // Compute CRC32
    let crc = 0 ^ (-1);
    for (let i = 0; i < rawContent.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ rawContent[i]) & 0xFF];
    }
    crc = (crc ^ (-1)) >>> 0;

    // 1. Local file header (30 bytes + filename + compressed data)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // PK\x03\x04
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // general flags
    localHeader.writeUInt16LE(8, 8); // compression method (deflate)
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0, 12); // mod date
    localHeader.writeUInt32LE(crc, 14); // crc32
    localHeader.writeUInt32LE(compressed.length, 18); // compressed size
    localHeader.writeUInt32LE(rawContent.length, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26); // filename len
    localHeader.writeUInt16LE(0, 28); // extra field len

    const localChunk = Buffer.concat([localHeader, nameBuf, compressed]);
    localHeaders.push(localChunk);

    // 2. Central directory header (46 bytes + filename)
    const cdHeader = Buffer.alloc(46);
    cdHeader.writeUInt32LE(0x02014b50, 0); // PK\x01\x02
    cdHeader.writeUInt16LE(20, 4); // version made by
    cdHeader.writeUInt16LE(20, 6); // version needed
    cdHeader.writeUInt16LE(0, 8); // flags
    cdHeader.writeUInt16LE(8, 10); // compression method
    cdHeader.writeUInt16LE(0, 12); // mod time
    cdHeader.writeUInt16LE(0, 14); // mod date
    cdHeader.writeUInt32LE(crc, 16); // crc32
    cdHeader.writeUInt32LE(compressed.length, 20); // compressed size
    cdHeader.writeUInt32LE(rawContent.length, 24); // uncompressed size
    cdHeader.writeUInt16LE(nameBuf.length, 28); // filename len
    cdHeader.writeUInt16LE(0, 30); // extra len
    cdHeader.writeUInt16LE(0, 32); // comment len
    cdHeader.writeUInt16LE(0, 34); // disk start
    cdHeader.writeUInt16LE(0, 36); // internal attr
    cdHeader.writeUInt32LE(0, 38); // external attr
    cdHeader.writeUInt32LE(offset, 42); // relative offset of local header

    cdHeaders.push(Buffer.concat([cdHeader, nameBuf]));
    offset += localChunk.length;
  }

  const localSection = Buffer.concat(localHeaders);
  const cdSection = Buffer.concat(cdHeaders);

  // 3. End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // PK\x05\x06
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // start disk
  eocd.writeUInt16LE(files.length, 8); // entries on disk
  eocd.writeUInt16LE(files.length, 10); // total entries
  eocd.writeUInt32LE(cdSection.length, 12); // cd size
  eocd.writeUInt32LE(localSection.length, 16); // cd offset
  eocd.writeUInt16LE(0, 20); // comment len

  return Buffer.concat([localSection, cdSection, eocd]);
}

// CRC32 table
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

// In-memory test store for mocks
const memoryStore = {
  rfpUploads: new Map<string, any>(),
  leads: new Map<string, any>(),
  passwordTokens: new Map<string, any>(),
};

export const mockBlobDel = vi.fn().mockResolvedValue(undefined);

// Mock DB
vi.mock('@/lib/db', () => ({
  db: {
    setting: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    inquiry: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'inq_auto_999', ...data })
      ),
    },
    feedback: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'fb_auto_888', ...data })
      ),
    },
    lead: {
      create: vi.fn().mockImplementation(({ data }: any) => {
        const record = { id: 'lead_auto_777', ...data };
        memoryStore.leads.set(record.id, record);
        return Promise.resolve(record);
      }),
    },
    user: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        if (where.email === 'registered@e3.qa' || where.id === 'usr_reg_01') {
          return Promise.resolve({
            id: 'usr_reg_01',
            email: 'registered@e3.qa',
            name: 'Registered User',
            isActive: true,
            sessionVersion: 1,
          });
        }
        return Promise.resolve(null);
      }),
      update: vi.fn().mockResolvedValue({ id: 'usr_reg_01', sessionVersion: 2 }),
    },
    passwordResetToken: {
      create: vi.fn().mockImplementation(({ data }: any) => {
        memoryStore.passwordTokens.set(data.token, data);
        return Promise.resolve({ id: 'prt_1', ...data });
      }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        const record = memoryStore.passwordTokens.get(where.token);
        if (record) return Promise.resolve(record);

        const validHash = crypto.createHash('sha256').update('valid_token_123').digest('hex');
        if (where.token === validHash) {
          return Promise.resolve({
            id: 'prt_1',
            token: validHash,
            email: 'registered@e3.qa',
            portal: 'admin',
            expiresAt: new Date(Date.now() + 3600000),
            usedAt: null,
          });
        }
        return Promise.resolve(null);
      }),
      updateMany: vi.fn().mockImplementation(({ where, data }: any) => {
        const validHash = crypto.createHash('sha256').update('valid_token_123').digest('hex');
        if (where.token === validHash && where.usedAt === null) {
          return Promise.resolve({ count: 1 });
        }
        const record = memoryStore.passwordTokens.get(where.token);
        if (record && !record.usedAt && new Date(record.expiresAt) > new Date()) {
          record.usedAt = data.usedAt;
          return Promise.resolve({ count: 1 });
        }
        return Promise.resolve({ count: 0 });
      }),
      update: vi.fn().mockResolvedValue({ id: 'prt_1', usedAt: new Date() }),
    },
    rfpUpload: {
      create: vi.fn().mockImplementation(({ data }: any) => {
        const id = `rfp_${Math.random().toString(36).substring(2, 9)}`;
        const record = { id, ...data };
        memoryStore.rfpUploads.set(id, record);
        return Promise.resolve(record);
      }),
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(memoryStore.rfpUploads.get(where.id) || null);
      }),
      findMany: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue({ id: 'rfp_del' }),
      updateMany: vi.fn().mockImplementation(({ where, data }: any) => {
        const record = memoryStore.rfpUploads.get(where.id);
        if (record && record.status === where.status && record.leadId === where.leadId) {
          record.status = data.status;
          record.leadId = data.leadId;
          return Promise.resolve({ count: 1 });
        }
        return Promise.resolve({ count: 0 });
      }),
    },
    leadActivity: {
      create: vi.fn().mockResolvedValue({ id: 'act_1' }),
    },
    subscriber: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'sub_1', ...data })
      ),
      upsert: vi.fn().mockImplementation(({ create }: any) =>
        Promise.resolve({ id: 'sub_1', ...create })
      ),
      update: vi.fn().mockResolvedValue({ id: 'sub_1', isVerified: true }),
    },
    systemLog: {
      create: vi.fn().mockResolvedValue({ id: 'sys_1' }),
    },
    $transaction: vi.fn().mockImplementation((callback: any) => {
      return callback({
        rfpUpload: {
          findUnique: vi.fn().mockImplementation(({ where }: any) => {
            return Promise.resolve(memoryStore.rfpUploads.get(where.id) || null);
          }),
          updateMany: vi.fn().mockImplementation(({ where, data }: any) => {
            const record = memoryStore.rfpUploads.get(where.id);
            if (record && record.status === where.status && record.leadId === where.leadId) {
              record.status = data.status;
              record.leadId = data.leadId;
              return Promise.resolve({ count: 1 });
            }
            return Promise.resolve({ count: 0 });
          }),
        },
        lead: {
          create: vi.fn().mockImplementation(({ data }: any) => {
            const record = { id: `lead_${Math.random().toString(36).substring(2, 9)}`, ...data };
            memoryStore.leads.set(record.id, record);
            return Promise.resolve(record);
          }),
        },
        leadActivity: {
          create: vi.fn().mockResolvedValue({ id: 'act_1' }),
        },
        passwordResetToken: {
          updateMany: vi.fn().mockImplementation(({ where, data }: any) => {
            const validHash = crypto.createHash('sha256').update('valid_token_123').digest('hex');
            if (where.token === validHash && where.usedAt === null) {
              return Promise.resolve({ count: 1 });
            }
            const record = memoryStore.passwordTokens.get(where.token);
            if (record && !record.usedAt && new Date(record.expiresAt) > new Date()) {
              record.usedAt = data.usedAt;
              return Promise.resolve({ count: 1 });
            }
            return Promise.resolve({ count: 0 });
          }),
          findUnique: vi.fn().mockImplementation(({ where }: any) => {
            const record = memoryStore.passwordTokens.get(where.token);
            if (record) return Promise.resolve(record);
            const validHash = crypto.createHash('sha256').update('valid_token_123').digest('hex');
            if (where.token === validHash) {
              return Promise.resolve({
                id: 'prt_1',
                token: validHash,
                email: 'registered@e3.qa',
                portal: 'admin',
                expiresAt: new Date(Date.now() + 3600000),
                usedAt: null,
              });
            }
            return Promise.resolve(null);
          }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'usr_reg_01',
            email: 'registered@e3.qa',
            name: 'Registered User',
            isActive: true,
            sessionVersion: 1,
          }),
          update: vi.fn().mockResolvedValue({ id: 'usr_reg_01', sessionVersion: 2 }),
        },
      });
    }),
  },
  default: {
    setting: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    inquiry: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'inq_auto_999', ...data })
      ),
    },
    feedback: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'fb_auto_888', ...data })
      ),
    },
    lead: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'lead_auto_777', ...data })
      ),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'usr_reg_01',
        email: 'registered@e3.qa',
        name: 'Registered User',
        isActive: true,
        sessionVersion: 1,
      }),
      update: vi.fn().mockResolvedValue({ id: 'usr_reg_01', sessionVersion: 2 }),
    },
    passwordResetToken: {
      create: vi.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'prt_1', ...data })
      ),
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        const validHash = crypto.createHash('sha256').update('valid_token_123').digest('hex');
        if (where.token === validHash) {
          return Promise.resolve({
            id: 'prt_1',
            token: validHash,
            email: 'registered@e3.qa',
            portal: 'admin',
            expiresAt: new Date(Date.now() + 3600000),
            usedAt: null,
          });
        }
        return Promise.resolve(null);
      }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 'prt_1', usedAt: new Date() }),
    },
    rfpUpload: {
      create: vi.fn().mockImplementation(({ data }: any) => {
        const id = `rfp_${Math.random().toString(36).substring(2, 9)}`;
        const record = { id, ...data };
        memoryStore.rfpUploads.set(id, record);
        return Promise.resolve(record);
      }),
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        return Promise.resolve(memoryStore.rfpUploads.get(where.id) || null);
      }),
      findMany: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue({ id: 'rfp_del' }),
      updateMany: vi.fn().mockImplementation(({ where, data }: any) => {
        const record = memoryStore.rfpUploads.get(where.id);
        if (record && record.status === where.status && record.leadId === where.leadId) {
          record.status = data.status;
          record.leadId = data.leadId;
          return Promise.resolve({ count: 1 });
        }
        return Promise.resolve({ count: 0 });
      }),
    },
    $transaction: vi.fn().mockImplementation((callback: any) => {
      return callback({
        rfpUpload: {
          findUnique: vi.fn().mockImplementation(({ where }: any) => {
            return Promise.resolve(memoryStore.rfpUploads.get(where.id) || null);
          }),
          updateMany: vi.fn().mockImplementation(({ where, data }: any) => {
            const record = memoryStore.rfpUploads.get(where.id);
            if (record && record.status === where.status && record.leadId === where.leadId) {
              record.status = data.status;
              record.leadId = data.leadId;
              return Promise.resolve({ count: 1 });
            }
            return Promise.resolve({ count: 0 });
          }),
        },
        lead: {
          create: vi.fn().mockImplementation(({ data }: any) => {
            const record = { id: `lead_${Math.random().toString(36).substring(2, 9)}`, ...data };
            memoryStore.leads.set(record.id, record);
            return Promise.resolve(record);
          }),
        },
        leadActivity: {
          create: vi.fn().mockResolvedValue({ id: 'act_1' }),
        },
        passwordResetToken: {
          updateMany: vi.fn().mockImplementation(({ where, data }: any) => {
            const validHash = crypto.createHash('sha256').update('valid_token_123').digest('hex');
            if (where.token === validHash && where.usedAt === null) {
              return Promise.resolve({ count: 1 });
            }
            const record = memoryStore.passwordTokens.get(where.token);
            if (record && !record.usedAt && new Date(record.expiresAt) > new Date()) {
              record.usedAt = data.usedAt;
              return Promise.resolve({ count: 1 });
            }
            return Promise.resolve({ count: 0 });
          }),
          findUnique: vi.fn().mockImplementation(({ where }: any) => {
            const record = memoryStore.passwordTokens.get(where.token);
            if (record) return Promise.resolve(record);
            const validHash = crypto.createHash('sha256').update('valid_token_123').digest('hex');
            if (where.token === validHash) {
              return Promise.resolve({
                id: 'prt_1',
                token: validHash,
                email: 'registered@e3.qa',
                portal: 'admin',
                expiresAt: new Date(Date.now() + 3600000),
                usedAt: null,
              });
            }
            return Promise.resolve(null);
          }),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'usr_reg_01',
            email: 'registered@e3.qa',
            name: 'Registered User',
            isActive: true,
            sessionVersion: 1,
          }),
          update: vi.fn().mockResolvedValue({ id: 'usr_reg_01', sessionVersion: 2 }),
        },
      });
    }),
  },
}));

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

let mockAuthSession: any = null;
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockImplementation(() => Promise.resolve(mockAuthSession)),
}));

vi.mock('@/lib/body-limit', () => ({
  enforceBodyLimit: vi.fn().mockReturnValue(null),
}));

vi.mock('@/lib/email', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/email')>();
  return {
    ...actual,
    sendEmail: vi.fn().mockResolvedValue({
      success: true,
      provider: 'mock',
      messageId: 'mock_msg_123',
    }),
    safelySendEmail: vi.fn().mockResolvedValue({
      success: true,
      provider: 'mock',
      messageId: 'mock_msg_123',
    }),
  };
});

vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockImplementation((pathname: string) => {
    return Promise.resolve({
      pathname,
      url: `https://blob.vercel-storage.com/${pathname}`,
    });
  }),
  get: vi.fn().mockImplementation((pathname: string) => {
    return Promise.resolve({
      pathname,
      stream: () => 'mock-stream',
    });
  }),
  del: vi.fn().mockImplementation((pathname: string) => {
    mockBlobDel(pathname);
    return Promise.resolve(undefined);
  }),
}));

import { POST as postChat } from '@/app/api/chat/route';
import { POST as postPasswordReset } from '@/app/api/auth/password-reset/route';
import { POST as postB2CContact } from '@/app/api/contact/b2c/route';
import { POST as postLeadsIngest } from '@/app/api/crm/leads/ingest/route';
import { POST as postSubscribe } from '@/app/api/subscribe/route';
import { POST as postAdminEmailTest } from '@/app/api/admin/email/test/route';
import { POST as postUpload } from '@/app/api/upload/route';
import { GET as getDownload } from '@/app/api/upload/download/route';
import { isValidDocxOoxml, isValidMagicBytes, parseZipCentralDirectory } from '@/lib/security';

describe('Public Business Connections & Security Hardening Final Regression Suite', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    memoryStore.rfpUploads.clear();
    memoryStore.leads.clear();
    memoryStore.passwordTokens.clear();
    mockAuthSession = null;
    mockBlobDel.mockClear();
    delete process.env.RFP_BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.APP_BASE_URL;
  });

  describe('1. Upload Authentication & Alternate Path Rejection', () => {
    it('should reject context="public_rfp" in JSON client-token generation path', async () => {
      const req = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'blob.generate-client-token',
          payload: { pathname: 'private_rfps/test.pdf', clientPayload: JSON.stringify({ context: 'public_rfp' }) },
        }),
      });

      const res = await postUpload(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it('should reject fabricated cookie substring matching for private/CMS uploads', async () => {
      mockAuthSession = null;

      const formData = new FormData();
      formData.append('context', 'cms_media');
      formData.append('file', new File(['test'], 'image.png', { type: 'image/png' }));

      const req = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        headers: {
          cookie: 'next-auth.session-token=fabricated_token_value; admin=1; authjs=true',
        },
        body: formData,
      });

      const res = await postUpload(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Authentication required');
    });

    it('should reject unknown upload contexts with 400 Bad Request', async () => {
      const formData = new FormData();
      formData.append('context', 'malicious_arbitrary_context');
      formData.append('file', new File(['test'], 'doc.pdf', { type: 'application/pdf' }));

      const req = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await postUpload(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Unknown upload context');
    });
  });

  describe('2. Real DOCX ZIP Structure Validation', () => {
    it('should validate a real in-memory valid DOCX ZIP with [Content_Types].xml and word/document.xml', () => {
      const validDocx = createInMemoryZip([
        { name: '[Content_Types].xml', content: '<?xml version="1.0"?><Types/>' },
        { name: 'word/document.xml', content: '<?xml version="1.0"?><w:document/>' },
      ]);

      const parsed = parseZipCentralDirectory(validDocx);
      expect(parsed).not.toBeNull();
      expect(parsed?.entries.length).toBe(2);
      expect(isValidDocxOoxml(validDocx)).toBe(true);
      expect(isValidMagicBytes(validDocx, 'docx')).toBe(true);
    });

    it('should reject a generic ZIP archive without Word document entries', () => {
      const genericZip = createInMemoryZip([
        { name: 'notes.txt', content: 'hello world' },
        { name: 'data.json', content: '{"key":1}' },
      ]);

      const parsed = parseZipCentralDirectory(genericZip);
      expect(parsed).not.toBeNull();
      expect(isValidDocxOoxml(genericZip)).toBe(false);
    });

    it('should reject corrupt ZIP bytes and fake string buffers', () => {
      const corruptBytes = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00, 0x12, 0x34]);
      expect(parseZipCentralDirectory(corruptBytes)).toBeNull();
      expect(isValidDocxOoxml(corruptBytes)).toBe(false);

      const fakeSubstringBuffer = Buffer.from('PK\x03\x04 fake data containing [Content_Types].xml and word/document.xml but no EOCD');
      expect(isValidDocxOoxml(fakeSubstringBuffer)).toBe(false);
    });
  });

  describe('3. Public Storage Configuration Error Redaction & Blob Failure Cleanup', () => {
    it('should redact internal env variable details and return standard error when RFP storage is unavailable', async () => {
      delete process.env.RFP_BLOB_READ_WRITE_TOKEN;

      const pdfBuffer = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(100)]);
      const formData = new FormData();
      formData.append('context', 'public_rfp');
      formData.append('file', new File([pdfBuffer], 'proposal.pdf', { type: 'application/pdf' }));

      const req = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await postUpload(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json).toEqual({
        success: false,
        code: 'RFP_STORAGE_UNAVAILABLE',
        error: 'Document upload is temporarily unavailable.',
      });
      // Environment variable name must NOT be leaked
      expect(JSON.stringify(json)).not.toContain('RFP_BLOB_READ_WRITE_TOKEN');
    });

    it('should clean up uploaded blob if database record creation fails', async () => {
      process.env.RFP_BLOB_READ_WRITE_TOKEN = 'test_rfp_token';

      // Mock database error on create
      const dbModule = await import('@/lib/db');
      const dbSpy1 = vi.spyOn(dbModule.db.rfpUpload, 'create').mockRejectedValue(new Error('DB connection failure'));
      const dbSpy2 = vi.spyOn((dbModule.default as any).rfpUpload, 'create').mockRejectedValue(new Error('DB connection failure'));

      const pdfBuffer = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(100)]);
      const formData = new FormData();
      formData.append('context', 'public_rfp');
      formData.append('file', new File([pdfBuffer], 'proposal.pdf', { type: 'application/pdf' }));

      const req = new NextRequest('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await postUpload(req);
      expect(res.status).toBe(500);
      expect(mockBlobDel).toHaveBeenCalled();
      dbSpy1.mockRestore();
      dbSpy2.mockRestore();
    });
  });

  describe('4. Record-ID-Only RFP Download & Canonical Permission RBAC', () => {
    it('should reject direct pathname queries targeting private_rfps/', async () => {
      mockAuthSession = { user: { id: 'u_admin', role: 'SUPER_ADMIN' } };

      const req = new NextRequest('http://localhost/api/upload/download?pathname=private_rfps/masterplan.pdf');
      const res = await getDownload(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('RFP documents must be accessed via uploadId');
    });

    it('should verify canonical crm.rfp.documents.read capability for RFP download', async () => {
      process.env.RFP_BLOB_READ_WRITE_TOKEN = 'test_rfp_token';
      const uploadId = 'rfp_doc_attached_100';

      memoryStore.rfpUploads.set(uploadId, {
        id: uploadId,
        purpose: 'B2B_RFP',
        pathname: 'private_rfps/masterplan.pdf',
        originalFileName: 'masterplan.pdf',
        fileSize: 50000,
        status: 'ATTACHED',
        leadId: 'lead_verified_01',
      });

      // 1. SUPER_ADMIN: Allowed (wildcard)
      mockAuthSession = { user: { id: 'u1', role: 'SUPER_ADMIN' } };
      const resSuper = await getDownload(new NextRequest(`http://localhost/api/upload/download?uploadId=${uploadId}`));
      expect(resSuper.status).toBe(200);

      // 2. SALES_ADMIN: Allowed (canonical capability)
      mockAuthSession = { user: { id: 'u2', role: 'SALES_ADMIN' } };
      const resSales = await getDownload(new NextRequest(`http://localhost/api/upload/download?uploadId=${uploadId}`));
      expect(resSales.status).toBe(200);

      // 3. SUPPORT_ADMIN: Denied
      mockAuthSession = { user: { id: 'u3', role: 'SUPPORT_ADMIN' } };
      const resSupport = await getDownload(new NextRequest(`http://localhost/api/upload/download?uploadId=${uploadId}`));
      expect(resSupport.status).toBe(403);

      // 4. B2C_ADMIN: Denied
      mockAuthSession = { user: { id: 'u4', role: 'B2C_ADMIN' } };
      const resB2C = await getDownload(new NextRequest(`http://localhost/api/upload/download?uploadId=${uploadId}`));
      expect(resB2C.status).toBe(403);

      // 5. HR_ADMIN: Denied
      mockAuthSession = { user: { id: 'u5', role: 'HR_ADMIN' } };
      const resHR = await getDownload(new NextRequest(`http://localhost/api/upload/download?uploadId=${uploadId}`));
      expect(resHR.status).toBe(403);

      // 6. STAFF: Denied
      mockAuthSession = { user: { id: 'u6', role: 'STAFF' } };
      const resStaff = await getDownload(new NextRequest(`http://localhost/api/upload/download?uploadId=${uploadId}`));
      expect(resStaff.status).toBe(403);
    });

    it('should reject RFP download when record is not in ATTACHED state or leadId is null', async () => {
      process.env.RFP_BLOB_READ_WRITE_TOKEN = 'test_rfp_token';
      mockAuthSession = { user: { id: 'u_admin', role: 'SUPER_ADMIN' } };

      const unattachedId = 'rfp_doc_unattached';
      memoryStore.rfpUploads.set(unattachedId, {
        id: unattachedId,
        purpose: 'B2B_RFP',
        pathname: 'private_rfps/spec.pdf',
        originalFileName: 'spec.pdf',
        fileSize: 10000,
        status: 'VALIDATED', // Not attached to lead yet
        leadId: null,
      });

      const res = await getDownload(new NextRequest(`http://localhost/api/upload/download?uploadId=${unattachedId}`));
      expect(res.status).toBe(404);
    });
  });

  describe('5. Hardened Lead Ingest & 400/409 Error Mapping', () => {
    it('should require rfpUploadId and rfpClaimToken together', async () => {
      const req = new NextRequest('http://localhost/api/crm/leads/ingest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Khalid Al-Thani',
          email: 'khalid@qatar.qa',
          rfpUploadId: 'rfp_solo_id',
          // Missing claim token
        }),
      });

      const res = await postLeadsIngest(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Both rfpUploadId and rfpClaimToken must be provided together');
    });

    it('should return safe 400 for invalid claim token and safe 409 for already attached RFP', async () => {
      const rawClaim = crypto.randomBytes(32).toString('hex');
      const claimHash = crypto.createHash('sha256').update(rawClaim).digest('hex');
      const uploadId = 'rfp_lifecycle_201';

      memoryStore.rfpUploads.set(uploadId, {
        id: uploadId,
        purpose: 'B2B_RFP',
        pathname: 'private_rfps/brief.pdf',
        originalFileName: 'brief.pdf',
        fileSize: 10000,
        claimTokenHash: claimHash,
        status: 'VALIDATED',
        leadId: null,
        expiresAt: new Date(Date.now() + 3600000),
      });

      // 1. Invalid claim token -> 400 Bad Request
      const badClaimReq = new NextRequest('http://localhost/api/crm/leads/ingest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Client',
          email: 'client@qatar.qa',
          rfpUploadId: uploadId,
          rfpClaimToken: 'wrong_claim_token',
        }),
      });
      const badClaimRes = await postLeadsIngest(badClaimReq);
      expect(badClaimRes.status).toBe(400);

      // 2. Valid claim token -> 201 Created
      const goodClaimReq = new NextRequest('http://localhost/api/crm/leads/ingest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Client',
          email: 'client@qatar.qa',
          rfpUploadId: uploadId,
          rfpClaimToken: rawClaim,
        }),
      });
      const goodClaimRes = await postLeadsIngest(goodClaimReq);
      expect(goodClaimRes.status).toBe(201);

      // 3. Second claim on already attached upload -> 409 Conflict
      const secondClaimReq = new NextRequest('http://localhost/api/crm/leads/ingest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Concurrent Client',
          email: 'concurrent@qatar.qa',
          rfpUploadId: uploadId,
          rfpClaimToken: rawClaim,
        }),
      });
      const secondClaimRes = await postLeadsIngest(secondClaimReq);
      expect(secondClaimRes.status).toBe(409);
    });
  });

  describe('6. Password Reset Security & Strict Test-Only Token Guard', () => {
    it('should never expose resetToken in non-test runtime environments', async () => {
      const origNodeEnv = process.env.NODE_ENV;
      const origVitest = process.env.VITEST;

      try {
        (process.env as any).NODE_ENV = 'production';
        delete process.env.VITEST;
        process.env.APP_BASE_URL = 'https://eeeqa.com';

        const req = new NextRequest('http://localhost/api/auth/password-reset', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action: 'request',
            email: 'registered@e3.qa',
          }),
        });

        const res = await postPasswordReset(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.resetToken).toBeUndefined();
      } finally {
        (process.env as any).NODE_ENV = origNodeEnv;
        process.env.VITEST = origVitest;
      }
    });
  });

  describe('7. Chatbot & Public Support Invariants', () => {
    it('should return honest unconfigured state and fallback to info@eeeqa.com', async () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_AI_API_KEY;

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Where is E3 Qatar located?' }],
          locale: 'en',
        }),
      });

      const res = await postChat(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.available).toBe(false);
      expect(json.message).toContain('info@eeeqa.com');
      expect(json.escalationUrl).toBe('/en/b2c/contact');
    });

    it('should accept SUPPORT_TICKET and return real persisted ticket ID', async () => {
      const req = new NextRequest('http://localhost/api/contact/b2c', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          actionType: 'SUPPORT_TICKET',
          name: 'Sarah Al-Mansouri',
          email: 'sarah@example.com',
          phone: '+974 5500 9988',
          category: 'BOOKING_INQUIRY',
          message: 'Can I reschedule my InflataCity tickets for Friday?',
        }),
      });

      const res = await postB2CContact(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.id).toBe('inq_auto_999');
    });

    it('should create an unverified subscriber and dispatch verification email', async () => {
      const req = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          actionType: 'SUBSCRIBE',
          email: 'subscriber@example.com',
        }),
      });

      const res = await postSubscribe(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('check your email');
    });

    it('should allow authorized admin to trigger test email dispatch', async () => {
      mockAuthSession = {
        user: { id: 'usr_admin', email: 'admin@eeeqa.com', role: 'SUPER_ADMIN', name: 'Master Admin' },
      };

      const req = new NextRequest('http://localhost/api/admin/email/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ recipientEmail: 'test@eeeqa.com' }),
      });

      const res = await postAdminEmailTest(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.recipient).toBe('test@eeeqa.com');
    });
  });
});
