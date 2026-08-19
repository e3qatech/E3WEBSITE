import crypto from 'crypto';
import JSZip from 'jszip';

export function compareSignatures(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export interface DocxValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Deep, comprehensive DOCX archive validation using maintained JSZip library.
 * Enforces zip-bomb defenses, macro-enabled rejection, path traversal protection,
 * and Office Open XML structural verification.
 */
export async function isValidDocxStructure(buffer: Buffer): Promise<DocxValidationResult> {
  if (!buffer || buffer.length < 100) {
    return { valid: false, error: 'File buffer too small for DOCX document' };
  }

  // 1. Must start with standard ZIP Local Header signature PK\x03\x04
  if (buffer.readUInt32LE(0) !== 0x04034b50) {
    return { valid: false, error: 'Invalid ZIP local header signature' };
  }

  try {
    const zip = await JSZip.loadAsync(buffer, { checkCRC32: true });

    const maxEntries = 500;
    const maxSingleEntrySize = 15 * 1024 * 1024; // 15MB max for single XML part
    const maxTotalUncompressedSize = 50 * 1024 * 1024; // 50MB cumulative

    const fileKeys = Object.keys(zip.files);
    if (fileKeys.length > maxEntries) {
      return { valid: false, error: `Archive exceeds maximum allowed entries (${fileKeys.length} > ${maxEntries})` };
    }

    let totalUncompressedSize = 0;
    const filenames = new Set<string>();

    for (const rawName of fileKeys) {
      const entry = zip.files[rawName];
      const normalizedName = rawName.toLowerCase().replace(/\\/g, '/');

      // Path traversal and null-byte injection prevention
      if (
        normalizedName.includes('\0') ||
        normalizedName.includes('../') ||
        normalizedName.includes('/..') ||
        normalizedName.startsWith('/')
      ) {
        return { valid: false, error: 'Dangerous path traversal in archive entry name' };
      }

      // Macro-enabled rejection (prohibit VBA binary, macros, or macro-enabled parts)
      if (
        normalizedName.includes('vbaproject.bin') ||
        normalizedName.includes('vbadatasigned.bin') ||
        normalizedName.includes('vbadata.xml') ||
        normalizedName.endsWith('.vba') ||
        (normalizedName.endsWith('.bin') && normalizedName.includes('vba'))
      ) {
        return { valid: false, error: 'Macro-enabled DOCM documents are strictly prohibited' };
      }

      // Check uncompressed size
      if (!entry.dir) {
        const uncompressedSize = (entry as any)._data?.uncompressedSize || (entry as any).uncompressedSize || 0;
        if (uncompressedSize > maxSingleEntrySize) {
          return { valid: false, error: `Archive entry ${rawName} exceeds maximum single entry limit (15MB)` };
        }
        totalUncompressedSize += uncompressedSize;
        if (totalUncompressedSize > maxTotalUncompressedSize) {
          return { valid: false, error: 'Total uncompressed archive size exceeds 50MB safety limit' };
        }
      }

      filenames.add(normalizedName);
    }

    // 2. Verify required Office Open XML part structures
    const hasContentTypes = filenames.has('[content_types].xml');
    const hasWordDocument = filenames.has('word/document.xml');

    if (!hasContentTypes || !hasWordDocument) {
      return {
        valid: false,
        error: 'Missing required Office Open XML structures ([Content_Types].xml and word/document.xml)',
      };
    }

    // 3. Inspect [Content_Types].xml content to ensure no macro-enabled overrides
    const contentTypesFile = zip.file('[Content_Types].xml') || zip.file('[content_types].xml');
    if (contentTypesFile) {
      const contentTypesText = await contentTypesFile.async('text');
      if (
        contentTypesText.includes('macroEnabled') ||
        contentTypesText.includes('application/vnd.ms-word.document.macroEnabled') ||
        contentTypesText.includes('application/vnd.ms-office.vbaProject')
      ) {
        return { valid: false, error: 'Macro-enabled package content type detected in [Content_Types].xml' };
      }
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: `Invalid or corrupt DOCX archive: ${err?.message || 'Parse error'}` };
  }
}

export function isValidMagicBytes(buffer: Buffer, ext: string): boolean {
  if (!buffer || buffer.length < 4) return false;
  
  const hex = buffer.toString('hex', 0, 4).toUpperCase();
  const hex8 = buffer.toString('hex', 0, 8).toUpperCase();
  
  switch(ext.toLowerCase()) {
    case 'pdf':
      return hex.startsWith('25504446'); // %PDF
    case 'jpeg':
    case 'jpg':
      return hex.startsWith('FFD8FF');
    case 'png':
      return hex8.startsWith('89504E470D0A1A0A');
    case 'docx':
      return hex.startsWith('504B0304'); // PK\x03\x04
    case 'doc':
    case 'zip':
      // Legacy .doc and general .zip are strictly prohibited for RFP submission
      return false;
    default:
      return true;
  }
}
