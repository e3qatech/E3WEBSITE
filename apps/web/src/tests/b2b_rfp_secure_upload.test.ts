import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash, randomUUID } from 'crypto';
import JSZip from 'jszip';

const { mockRedis, mockAuth, mockBlob, mockDb } = vi.hoisted(() => {
  const inMemoryUploads = new Map<string, any>();
  const inMemoryLeads = new Map<string, any>();
  const inMemoryLogs: any[] = [];
  const inMemoryActivities: any[] = [];

  return {
    mockRedis: {
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
      setnx: vi.fn().mockResolvedValue(1),
      set: vi.fn().mockResolvedValue('OK'),
      get: vi.fn().mockResolvedValue(null),
      del: vi.fn().mockResolvedValue(1),
    },
    mockAuth: vi.fn().mockResolvedValue(null),
    mockBlob: {
      get: vi.fn(),
      del: vi.fn().mockResolvedValue({}),
      put: vi.fn().mockResolvedValue({ url: 'https://private.blob/test.pdf', pathname: 'private_rfp/test.pdf' }),
    },
    mockDb: {
      uploadRecord: {
        create: vi.fn(async ({ data }: any) => {
          const rec = { ...data, id: data.id || randomUUID(), leadId: data.leadId || null, createdAt: new Date(), updatedAt: new Date() };
          inMemoryUploads.set(rec.id, rec);
          return rec;
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          return inMemoryUploads.get(where.id) || null;
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          let found = null;
          inMemoryUploads.forEach((rec) => {
            if (where.pathname && rec.pathname === where.pathname) found = rec;
          });
          return found;
        }),
        findMany: vi.fn(async ({ where }: any) => {
          const results: any[] = [];
          inMemoryUploads.forEach((rec) => {
            let matches = true;
            if (where?.leadId === null && rec.leadId !== null) matches = false;
            if (where?.status?.in && !where.status.in.includes(rec.status)) matches = false;
            if (where?.status && typeof where.status === 'string' && rec.status !== where.status) matches = false;
            if (where?.attachedAt?.lt && (!rec.attachedAt || rec.attachedAt.getTime() >= where.attachedAt.lt.getTime())) matches = false;
            if (matches) results.push(rec);
          });
          return results;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const rec = inMemoryUploads.get(where.id);
          if (!rec) throw new Error('Record not found');
          const updated = { ...rec, ...data, leadId: data.leadId !== undefined ? data.leadId : (rec.leadId || null), updatedAt: new Date() };
          inMemoryUploads.set(where.id, updated);
          return updated;
        }),
        updateMany: vi.fn(async ({ where, data }: any) => {
          let count = 0;
          inMemoryUploads.forEach((rec, id) => {
            let match = true;
            if (where.id && rec.id !== where.id) match = false;
            if (where.sessionHash && rec.sessionHash !== where.sessionHash) match = false;
            if (where.purpose && rec.purpose !== where.purpose) match = false;
            if (where.leadId === null && (rec.leadId !== null && rec.leadId !== undefined)) match = false;
            if (where.status?.in && !where.status.in.includes(rec.status)) match = false;
            if (where.status && typeof where.status === 'string' && rec.status !== where.status) match = false;
            if (where.quarantineStatus?.in && !where.quarantineStatus.in.includes(rec.quarantineStatus)) match = false;
            if (where.quarantineStatus && typeof where.quarantineStatus === 'string' && rec.quarantineStatus !== where.quarantineStatus) match = false;
            if (where.expiresAt?.gt && rec.expiresAt.getTime() <= where.expiresAt.gt.getTime()) match = false;

            if (match) {
              inMemoryUploads.set(id, { ...rec, ...data, updatedAt: new Date() });
              count++;
            }
          });
          return { count };
        }),
      },
      lead: {
        create: vi.fn(async ({ data }: any) => {
          const lead = { ...data, id: `lead-${randomUUID()}`, createdAt: new Date(), updatedAt: new Date() };
          inMemoryLeads.set(lead.id, lead);
          return lead;
        }),
      },
      leadActivity: {
        create: vi.fn(async ({ data }: any) => {
          const act = { ...data, id: `act-${randomUUID()}`, timestamp: new Date() };
          inMemoryActivities.push(act);
          return act;
        }),
      },
      systemLog: {
        create: vi.fn(async ({ data }: any) => {
          const log = { ...data, id: `log-${randomUUID()}`, timestamp: new Date() };
          inMemoryLogs.push(log);
          return log;
        }),
      },
      $transaction: vi.fn(async (callback: any) => {
        return callback(mockDb);
      }),
      _reset() {
        inMemoryUploads.clear();
        inMemoryLeads.clear();
        inMemoryLogs.length = 0;
        inMemoryActivities.length = 0;
      }
    }
  };
});

vi.mock('@/lib/db', () => ({
  db: mockDb,
  default: mockDb,
}));

vi.mock('@/lib/redis', () => ({
  redis: mockRedis,
}));

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}));

vi.mock('@vercel/blob', () => ({
  get: mockBlob.get,
  del: mockBlob.del,
  put: mockBlob.put,
}));

import { isValidMagicBytes, isValidDocxStructure } from '../lib/security';
import { POST as uploadHandler } from '../app/api/upload/route';
import { POST as finalizeHandler } from '../app/api/upload/finalize/route';
import { POST as ingestHandler } from '../app/api/crm/leads/ingest/route';
import { GET as downloadHandler } from '../app/api/upload/download/route';
import { POST as orphanCleanupHandler } from '../app/api/cron/orphan-cleanup/route';
import { NextRequest } from 'next/server';

async function createValidDocxBuffer(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>');
  zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>E3 Qatar RFP Specification Document</w:t></w:r></w:p></w:body></w:document>');
  return zip.generateAsync({ type: 'nodebuffer' });
}

async function createMacroDocxBuffer(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types><Override PartName="/word/document.xml" ContentType="application/vnd.ms-word.document.macroEnabled.main+xml"/></Types>');
  zip.file('word/document.xml', '<w:document/>');
  zip.file('word/vbaProject.bin', 'MALICIOUS_VBA_BIN');
  return zip.generateAsync({ type: 'nodebuffer' });
}

describe('B2B RFP Secure Direct Client Upload & Complete Lifecycle Hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb._reset();
    mockAuth.mockResolvedValue(null);
    process.env.RFP_BLOB_READ_WRITE_TOKEN = 'test_rfp_token_sec_123';
    process.env.CRON_SECRET = 'cron_test_secret_abc';
  });

  describe('1. File Signatures & Format Restrictions', () => {
    it('accepts valid PDF magic bytes (%PDF- / 0x25504446)', () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
      expect(isValidMagicBytes(pdfBuffer, 'pdf')).toBe(true);
    });

    it('strictly rejects legacy .doc files due to macro vulnerabilities', () => {
      const docBuffer = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
      expect(isValidMagicBytes(docBuffer, 'doc')).toBe(false);
    });

    it('strictly rejects raw .zip archives', () => {
      const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
      expect(isValidMagicBytes(zipBuffer, 'zip')).toBe(false);
    });
  });

  describe('2. Maintained JSZip DOCX Structural & Macro Inspection', () => {
    it('accepts genuine DOCX with [Content_Types].xml and word/document.xml', async () => {
      const validDocx = await createValidDocxBuffer();
      const res = await isValidDocxStructure(validDocx);
      expect(res.valid).toBe(true);
    });

    it('rejects DOCX containing vbaProject.bin macros (DOCM threat)', async () => {
      const macroDocx = await createMacroDocxBuffer();
      const res = await isValidDocxStructure(macroDocx);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Macro-enabled');
    });

    it('rejects fake DOCX missing word/document.xml', async () => {
      const zip = new JSZip();
      zip.file('[Content_Types].xml', '<Types/>');
      zip.file('other.txt', 'hello');
      const fakeDocx = await zip.generateAsync({ type: 'nodebuffer' });

      const res = await isValidDocxStructure(fakeDocx);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Missing required Office Open XML structures');
    });

    it('rejects entry names containing dangerous path traversal', async () => {
      const zip = new JSZip();
      zip.file('../[Content_Types].xml', '<Types/>');
      zip.file('word/document.xml', '<w:document/>');
      const traversalDocx = await zip.generateAsync({ type: 'nodebuffer' });

      const res = await isValidDocxStructure(traversalDocx);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Dangerous path traversal');
    });
  });

  describe('3. Direct Upload Token Generation & Options', () => {
    it('returns 503 and redacted error if dedicated RFP storage token is unconfigured', async () => {
      delete process.env.RFP_BLOB_READ_WRITE_TOKEN;

      const req = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'e3_upload_session=test_token_sess',
        },
        body: JSON.stringify({
          type: 'blob.generate-client-token',
          payload: {
            pathname: 'quote.pdf',
            callbackUrl: 'http://localhost:3000/api/upload',
            clientPayload: JSON.stringify({ context: 'b2b_rfp', originalName: 'quote.pdf' }),
          },
        }),
      });

      const res = await uploadHandler(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json).toEqual({
        success: false,
        code: 'RFP_STORAGE_UNAVAILABLE',
        error: 'Document upload is temporarily unavailable.',
      });

      // Strict security invariant: Never leak internal env var names, storage names, or process.env to public client
      const rawBody = JSON.stringify(json);
      expect(rawBody).not.toContain('RFP_BLOB_READ_WRITE_TOKEN');
      expect(rawBody).not.toContain('TOKEN');
      expect(rawBody).not.toContain('process.env');
    });

    it('rejects forbidden file extensions for B2B RFP', async () => {
      process.env.RFP_BLOB_READ_WRITE_TOKEN = 'test_token';

      const req = new Request('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'e3_upload_session=test_token_sess',
        },
        body: JSON.stringify({
          type: 'blob.generate-client-token',
          payload: {
            pathname: 'script.exe',
            callbackUrl: 'http://localhost:3000/api/upload',
            clientPayload: JSON.stringify({ context: 'b2b_rfp', originalName: 'script.exe' }),
          },
        }),
      });

      const res = await uploadHandler(req);
      expect(res.status).toBe(400);
    });
  });

  describe('4. Concurrency-Safe Finalization: INITIATED -> VALIDATING -> VALIDATED', () => {
    it('concurrent finalization test: exactly one request claims INITIATED -> VALIDATING, competing request gets 409', async () => {
      const sessionToken = 'concurrent_finalize_session';
      const sessionHash = createHash('sha256').update(sessionToken).digest('hex');

      const uploadId = randomUUID();
      await mockDb.uploadRecord.create({
        data: {
          id: uploadId,
          purpose: 'B2B_RFP',
          pathname: `private_rfp/${uploadId}.pdf`,
          originalFilename: 'quote.pdf',
          extension: 'pdf',
          mimeType: 'application/pdf',
          sizeBytes: 0,
          sessionHash,
          status: 'INITIATED',
          quarantineStatus: 'UNSCANNED',
          expiresAt: new Date(Date.now() + 3600 * 1000),
        }
      });

      const validPdfBuffer = Buffer.from('%PDF-1.4 sample content');
      mockBlob.get.mockResolvedValue({
        stream: validPdfBuffer,
        body: validPdfBuffer,
      });

      const makeFinalizeReq = () => new Request('http://localhost:3000/api/upload/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `e3_upload_session=${sessionToken}`,
        },
        body: JSON.stringify({ uploadId }),
      });

      const [res1, res2] = await Promise.all([
        finalizeHandler(makeFinalizeReq()),
        finalizeHandler(makeFinalizeReq()),
      ]);

      const statuses = [res1.status, res2.status].sort();
      expect(statuses).toEqual([200, 409]); // Exactly one 200 OK and one 409 Conflict

      const record = await mockDb.uploadRecord.findUnique({ where: { id: uploadId } });
      expect(record.status).toBe('VALIDATED');
    });

    it('rejects and immediately deletes oversized (>25MB) uploaded blob during finalization', async () => {
      const sessionToken = 'oversize_session';
      const sessionHash = createHash('sha256').update(sessionToken).digest('hex');

      const uploadId = randomUUID();
      await mockDb.uploadRecord.create({
        data: {
          id: uploadId,
          purpose: 'B2B_RFP',
          pathname: `private_rfp/${uploadId}.pdf`,
          originalFilename: 'huge.pdf',
          extension: 'pdf',
          mimeType: 'application/pdf',
          sizeBytes: 0,
          sessionHash,
          status: 'INITIATED',
          quarantineStatus: 'UNSCANNED',
          expiresAt: new Date(Date.now() + 3600 * 1000),
        }
      });

      // Declared size 30MB
      mockBlob.get.mockResolvedValueOnce({
        size: 30 * 1024 * 1024,
        stream: Buffer.from('%PDF-1.4 dummy'),
      });

      const req = new Request('http://localhost:3000/api/upload/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `e3_upload_session=${sessionToken}`,
        },
        body: JSON.stringify({ uploadId }),
      });

      const res = await finalizeHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('File size exceeds 25MB limit');
      expect(mockBlob.del).toHaveBeenCalledWith(`private_rfp/${uploadId}.pdf`, expect.any(Object));

      const updatedRecord = await mockDb.uploadRecord.findUnique({ where: { id: uploadId } });
      expect(updatedRecord.status).toBe('REJECTED');
    });
  });

  describe('4. Strict Attachment Status Security: Only VALIDATED Permitted', () => {
    const prohibitedStatuses = ['INITIATED', 'UPLOADED', 'VALIDATING', 'REJECTED', 'EXPIRED', 'DELETED'];

    prohibitedStatuses.forEach((prohibitedStatus) => {
      it(`strictly rejects lead attachment when upload is in ${prohibitedStatus} state`, async () => {
        const sessionToken = `session_for_${prohibitedStatus}`;
        const sessionHash = createHash('sha256').update(sessionToken).digest('hex');

        const uploadId = randomUUID();
        await mockDb.uploadRecord.create({
          data: {
            id: uploadId,
            purpose: 'B2B_RFP',
            pathname: `private_rfp/${uploadId}.pdf`,
            originalFilename: 'specs.pdf',
            extension: 'pdf',
            mimeType: 'application/pdf',
            sizeBytes: 1024,
            sessionHash,
            status: prohibitedStatus,
            quarantineStatus: 'UNSCANNED',
            expiresAt: new Date(Date.now() + 3600 * 1000),
          }
        });

        const req = new Request('http://localhost:3000/api/crm/leads/ingest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `e3_upload_session=${sessionToken}`,
          },
          body: JSON.stringify({
            name: 'Fatima Al-Kuwari',
            email: 'fatima@example.qa',
            uploadId,
          }),
        });

        const res = await ingestHandler(req);
        expect(res.status).toBe(409); // Rejected
        const json = await res.json();
        expect(json.error).toContain('Upload association failed');
      });
    });

    it('accepts attachment strictly when status is VALIDATED and quarantineStatus is UNSCANNED', async () => {
      const sessionToken = 'session_for_validated';
      const sessionHash = createHash('sha256').update(sessionToken).digest('hex');

      const uploadId = randomUUID();
      await mockDb.uploadRecord.create({
        data: {
          id: uploadId,
          purpose: 'B2B_RFP',
          pathname: `private_rfp/${uploadId}.pdf`,
          originalFilename: 'valid_specs.pdf',
          extension: 'pdf',
          mimeType: 'application/pdf',
          sizeBytes: 2048,
          sessionHash,
          status: 'VALIDATED',
          quarantineStatus: 'UNSCANNED',
          expiresAt: new Date(Date.now() + 3600 * 1000),
        }
      });

      const req = new Request('http://localhost:3000/api/crm/leads/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `e3_upload_session=${sessionToken}`,
        },
        body: JSON.stringify({
          name: 'Tariq Al-Emadi',
          email: 'tariq@example.qa',
          uploadId,
        }),
      });

      const res = await ingestHandler(req);
      expect(res.status).toBe(201);
      const record = await mockDb.uploadRecord.findUnique({ where: { id: uploadId } });
      expect(record.status).toBe('ATTACHED');
    });
  });

  describe('5. Authoritative CRM Sales Clearance for Download', () => {
    it('allows SUPER_ADMIN and SALES_ADMIN to download attached RFP document', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'sales-1', role: 'SALES_ADMIN', email: 'sales@e3.qa' } });

      const uploadId = randomUUID();
      await mockDb.uploadRecord.create({
        data: {
          id: uploadId,
          purpose: 'B2B_RFP',
          pathname: `private_rfp/${uploadId}.pdf`,
          originalFilename: 'event_brief.pdf',
          extension: 'pdf',
          mimeType: 'application/pdf',
          sizeBytes: 4000,
          sessionHash: 'hash_123',
          status: 'ATTACHED',
          leadId: 'lead-999',
          quarantineStatus: 'UNSCANNED',
          expiresAt: new Date(Date.now() + 3600 * 1000),
        }
      });

      mockBlob.get.mockResolvedValueOnce({
        stream: Buffer.from('%PDF-1.4 event content'),
      });

      const req = new NextRequest(`http://localhost:3000/api/upload/download?uploadId=${uploadId}`);
      const res = await downloadHandler(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="event_brief.pdf"');
      expect(res.headers.get('X-Quarantine-Status')).toBe('UNSCANNED');
    });

    it('strictly denies STAFF, HR_ADMIN, and CLIENT roles from downloading B2B RFP attachments', async () => {
      mockAuth.mockResolvedValueOnce({ user: { id: 'staff-2', role: 'STAFF', email: 'staff@e3.qa' } });

      const uploadId = randomUUID();
      await mockDb.uploadRecord.create({
        data: {
          id: uploadId,
          purpose: 'B2B_RFP',
          pathname: `private_rfp/${uploadId}.pdf`,
          originalFilename: 'rfp.pdf',
          extension: 'pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1000,
          sessionHash: 'hash',
          status: 'ATTACHED',
          leadId: 'lead-1',
          quarantineStatus: 'UNSCANNED',
          expiresAt: new Date(Date.now() + 3600 * 1000),
        }
      });

      const req = new NextRequest(`http://localhost:3000/api/upload/download?uploadId=${uploadId}`);
      const res = await downloadHandler(req);

      expect(res.status).toBe(403);
    });
  });

  describe('6. Authenticated Orphan Cleanup Cron', () => {
    it('rejects unauthorized cron invocations missing valid CRON_SECRET header', async () => {
      const req = new NextRequest('http://localhost:3000/api/cron/orphan-cleanup', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer wrong_secret' },
      });

      const res = await orphanCleanupHandler(req);
      expect(res.status).toBe(401);
    });

    it('cleans expired unattached uploads and preserves ATTACHED uploads', async () => {
      const expiredId = randomUUID();
      await mockDb.uploadRecord.create({
        data: {
          id: expiredId,
          purpose: 'B2B_RFP',
          pathname: `private_rfp/${expiredId}.pdf`,
          originalFilename: 'unattached_expired.pdf',
          extension: 'pdf',
          mimeType: 'application/pdf',
          sizeBytes: 100,
          sessionHash: 'hash_expired',
          status: 'EXPIRED',
          leadId: null,
          quarantineStatus: 'UNSCANNED',
          expiresAt: new Date(Date.now() - 3600 * 1000),
        }
      });

      const attachedId = randomUUID();
      await mockDb.uploadRecord.create({
        data: {
          id: attachedId,
          purpose: 'B2B_RFP',
          pathname: `private_rfp/${attachedId}.pdf`,
          originalFilename: 'attached_lead_doc.pdf',
          extension: 'pdf',
          mimeType: 'application/pdf',
          sizeBytes: 500,
          sessionHash: 'hash_attached',
          status: 'ATTACHED',
          leadId: 'lead-active-1',
          quarantineStatus: 'UNSCANNED',
          expiresAt: new Date(Date.now() + 3600 * 1000),
        }
      });

      const req = new NextRequest('http://localhost:3000/api/cron/orphan-cleanup', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer cron_test_secret_abc' },
      });

      const res = await orphanCleanupHandler(req);
      expect(res.status).toBe(200);

      const expiredRec = await mockDb.uploadRecord.findUnique({ where: { id: expiredId } });
      expect(expiredRec.status).toBe('DELETED');

      const attachedRec = await mockDb.uploadRecord.findUnique({ where: { id: attachedId } });
      expect(attachedRec.status).toBe('ATTACHED'); // Untouched!
    });

    it('proves an old ATTACHED document (attached 120 days ago) is NEVER deleted when retention is disabled', async () => {
      delete process.env.ENABLE_ATTACHED_RFP_RETENTION;
      delete process.env.RFP_ATTACHMENT_RETENTION_DAYS;

      const oldAttachedId = randomUUID();
      await mockDb.uploadRecord.create({
        data: {
          id: oldAttachedId,
          purpose: 'B2B_RFP',
          pathname: `private_rfp/${oldAttachedId}.pdf`,
          originalFilename: 'old_attached_rfp.pdf',
          extension: 'pdf',
          mimeType: 'application/pdf',
          sizeBytes: 5000,
          sessionHash: 'old_hash',
          status: 'ATTACHED',
          leadId: 'lead-historical-1',
          quarantineStatus: 'UNSCANNED',
          attachedAt: new Date(Date.now() - 120 * 24 * 3600 * 1000), // 120 days ago
          expiresAt: new Date(Date.now() - 120 * 24 * 3600 * 1000),
        }
      });

      const req = new NextRequest('http://localhost:3000/api/cron/orphan-cleanup', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer cron_test_secret_abc' },
      });

      const res = await orphanCleanupHandler(req);
      expect(res.status).toBe(200);

      const record = await mockDb.uploadRecord.findUnique({ where: { id: oldAttachedId } });
      expect(record.status).toBe('ATTACHED'); // Firmly untouched!
    });
  });
});
