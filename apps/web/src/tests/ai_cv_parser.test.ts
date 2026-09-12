import { describe, it, expect, vi } from 'vitest';
import {
  extractTextFromDocx,
  getDomainExtraction,
  sanitizeCandidateAnalysis,
  parseResumeWithAI,
} from '@/lib/careers/ai-cv-parser';
import { SENSITIVE_SECRET_KEYS } from '@/lib/settings/public-settings-dto';
import zlib from 'zlib';

describe('AI CV Parser & Multimodal Talent Intelligence Engine', () => {
  describe('1. DOCX Extraction Resilience', () => {
    it('gracefully returns empty string on corrupt, empty, or non-zip buffers', () => {
      expect(extractTextFromDocx(Buffer.from(''))).toBe('');
      expect(extractTextFromDocx(Buffer.from('random string data not a zip'))).toBe('');
      expect(extractTextFromDocx(Buffer.alloc(100))).toBe('');
    });

    it('extracts plain text from a synthetic valid DOCX zip archive', () => {
      // Build a minimal in-memory zip archive with word/document.xml
      const xmlContent =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
        '<w:body>' +
        '<w:p><w:r><w:t>John Doe Resume</w:t></w:r></w:p>' +
        '<w:p><w:r><w:t>5 Years Experience as Attraction Host in Qatar</w:t></w:r></w:p>' +
        '</w:body></w:document>';

      const xmlBuffer = Buffer.from(xmlContent, 'utf8');
      const compressedXml = zlib.deflateRawSync(xmlBuffer);

      const fileName = 'word/document.xml';
      const fnBuf = Buffer.from(fileName, 'utf8');

      // Local file header (30 bytes + fn length + compressed data)
      const lfh = Buffer.alloc(30);
      lfh.writeUInt32LE(0x04034b50, 0); // signature
      lfh.writeUInt16LE(20, 4); // version needed
      lfh.writeUInt16LE(0, 6); // flags
      lfh.writeUInt16LE(8, 8); // compression method (deflate)
      lfh.writeUInt16LE(0, 10); // time
      lfh.writeUInt16LE(0, 12); // date
      lfh.writeUInt32LE(0x12345678, 14); // crc32 dummy
      lfh.writeUInt32LE(compressedXml.length, 18); // compressed size
      lfh.writeUInt32LE(xmlBuffer.length, 22); // uncompressed size
      lfh.writeUInt16LE(fnBuf.length, 26); // file name length
      lfh.writeUInt16LE(0, 28); // extra field length

      const localFileOffset = 0;
      const localFilePart = Buffer.concat([lfh, fnBuf, compressedXml]);

      // Central directory header (46 bytes + fn length)
      const cdh = Buffer.alloc(46);
      cdh.writeUInt32LE(0x02014b50, 0); // signature
      cdh.writeUInt16LE(20, 4); // version made by
      cdh.writeUInt16LE(20, 6); // version needed
      cdh.writeUInt16LE(0, 8); // flags
      cdh.writeUInt16LE(8, 10); // compression method
      cdh.writeUInt16LE(0, 12); // time
      cdh.writeUInt16LE(0, 14); // date
      cdh.writeUInt32LE(0x12345678, 16); // crc32
      cdh.writeUInt32LE(compressedXml.length, 20); // compressed size
      cdh.writeUInt32LE(xmlBuffer.length, 24); // uncompressed size
      cdh.writeUInt16LE(fnBuf.length, 28); // file name length
      cdh.writeUInt16LE(0, 30); // extra field len
      cdh.writeUInt16LE(0, 32); // comment len
      cdh.writeUInt16LE(0, 34); // disk start
      cdh.writeUInt16LE(0, 36); // internal attrs
      cdh.writeUInt32LE(0, 38); // external attrs
      cdh.writeUInt32LE(localFileOffset, 42); // relative offset of local header

      const centralDirPart = Buffer.concat([cdh, fnBuf]);

      // End of central directory record (22 bytes)
      const eocd = Buffer.alloc(22);
      eocd.writeUInt32LE(0x06054b50, 0); // signature
      eocd.writeUInt16LE(0, 4); // disk number
      eocd.writeUInt16LE(0, 6); // start disk
      eocd.writeUInt16LE(1, 8); // entries on disk
      eocd.writeUInt16LE(1, 10); // total entries
      eocd.writeUInt32LE(centralDirPart.length, 12); // central dir size
      eocd.writeUInt32LE(localFilePart.length, 16); // central dir offset
      eocd.writeUInt16LE(0, 20); // comment length

      const zipDocx = Buffer.concat([localFilePart, centralDirPart, eocd]);
      const extracted = extractTextFromDocx(zipDocx);

      expect(extracted).toContain('John Doe Resume');
      expect(extracted).toContain('5 Years Experience as Attraction Host in Qatar');
    });
  });

  describe('2. Frontline Role Calibration & Non-Executive Profiles', () => {
    it('calibrates "Play Attendant" to guest safety, floor operations, and customer experience', () => {
      const result = getDomainExtraction('Play Attendant', 'Operations', 'Amina Al-Ansari', 'amina@test.qa');

      expect(result.summary).toContain('Play Attendant');
      expect(result.summary).not.toContain('Master of Science');
      expect(result.summary).not.toContain('PMP');

      // Check skills match frontline guest/play safety
      const skillText = result.skills.join(' ');
      expect(
        skillText.toLowerCase().includes('safety') ||
        skillText.toLowerCase().includes('guest') ||
        skillText.toLowerCase().includes('child')
      ).toBe(true);

      // Verify career history contains both role and title
      expect(result.careerHistory?.length).toBeGreaterThan(0);
      for (const item of result.careerHistory || []) {
        expect(item.role).toBeTruthy();
        expect(item.title).toBe(item.role);
        expect(item.company).toBeTruthy();
      }
    });

    it('calibrates "Ticketing Host" to ticketing, POS, and guest services', () => {
      const result = getDomainExtraction('Ticketing Host', 'Operations', 'Farhan Malik', 'farhan@test.qa');

      expect(result.skillsCategorized?.technical).toContain('Point of Sale (POS) Systems');
      expect(result.careerHistory?.[0]?.title).toBeTruthy();
    });

    it('calibrates AV Engineer to audio/visual, GrandMA, and Dante AoIP', () => {
      const result = getDomainExtraction('Lead AV Systems Engineer', 'Engineering', 'Karim Zaid', 'karim@test.qa');

      const skillText = result.skills.join(' ');
      expect(
        skillText.includes('Audio/Visual') ||
        skillText.includes('Dante') ||
        skillText.includes('Kinetic')
      ).toBe(true);
      expect(result.careerHistory?.[0]?.title).toBeTruthy();
      expect(result.careerHistory?.[0]?.role).toBeTruthy();
    });
  });

  describe('3. Timeline & Career History Schema Contract', () => {
    it('guarantees all domain extractions provide title, role, company, and period', () => {
      const rolesToTest = [
        ['Lead AV Systems Engineer', 'Engineering'],
        ['Senior Creative 3D Designer', 'Creative'],
        ['Head of Event Operations', 'Operations'],
        ['Family Play Attendant', 'Operations'],
        ['General Specialist', 'General'],
      ];

      for (const [jobTitle, department] of rolesToTest) {
        const extraction = getDomainExtraction(jobTitle, department, 'Test User', 'test@eeeqa.com');
        expect(Array.isArray(extraction.careerHistory)).toBe(true);
        expect(extraction.careerHistory?.length).toBeGreaterThan(0);

        for (const item of extraction.careerHistory || []) {
          expect(item.role).toBeDefined();
          expect(item.title).toBeDefined();
          expect(item.title).toBe(item.role);
          expect(item.company).toBeTruthy();
          expect(item.period).toBeTruthy();
        }
      }
    });

    it('sanitizes and enriches legacy mock data without dropping title/role', () => {
      const sanitized = sanitizeCandidateAnalysis(null, 'Play Attendant', 'Operations', 'Sara Ali', 'sara@e3.qa');
      expect(sanitized).not.toBeNull();
      expect(sanitized?.aiEngine).toBe('e3-talent-ai');
      expect(sanitized?.careerHistory?.[0].title).toBeTruthy();
      expect(sanitized?.careerHistory?.[0].role).toBeTruthy();
    });
  });

  describe('4. Sensitive Settings Key Masking', () => {
    it('includes geminiApiKey, gemini_api_key, and googleAiApiKey in SENSITIVE_SECRET_KEYS', () => {
      expect(SENSITIVE_SECRET_KEYS.has('geminiApiKey')).toBe(true);
      expect(SENSITIVE_SECRET_KEYS.has('gemini_api_key')).toBe(true);
      expect(SENSITIVE_SECRET_KEYS.has('googleAiApiKey')).toBe(true);
    });
  });

  describe('5. parseResumeWithAI Model Fallback and DOCX Pipeline', () => {
    it('successfully extracts structured candidate dossier and populates role & title', async () => {
      const res = await parseResumeWithAI({
        jobTitle: 'Interactive Play Attendant',
        department: 'Operations',
        candidateName: 'Layla Mansoor',
        email: 'layla@eeeqa.com',
        notes: 'Experienced in Qatar theme parks with CPR certification.',
      });

      expect(res).toBeDefined();
      expect(res.skills.length).toBeGreaterThan(0);
      expect(res.careerHistory?.length).toBeGreaterThan(0);
      expect(res.careerHistory?.[0]?.title).toBeDefined();
      expect(res.careerHistory?.[0]?.role).toBeDefined();
      expect(res.aiEngine).toBeTruthy();
      expect(res.parsedAt).toBeTruthy();
    });
  });
});
