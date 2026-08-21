import crypto from 'crypto';

export function compareSignatures(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export interface ZipCentralDirectoryEntry {
  filename: string;
  uncompressedSize: number;
  compressedSize: number;
  compressionMethod: number;
  flags: number;
  localHeaderOffset: number;
}

export interface ZipValidationResult {
  valid: boolean;
  reason?: string;
  entries?: ZipCentralDirectoryEntry[];
  totalUncompressedSize?: number;
}

/**
 * Complete, secure ZIP archive parser & validator.
 *
 * Enforces:
 *  - Real local and central directory signature validation (PK\x03\x04 and PK\x01\x02)
 *  - EOCD offset boundary cross-checks
 *  - Rejection of path traversal (..), absolute paths, and null bytes
 *  - Rejection of encrypted / password-protected archives
 *  - Supported compression methods (STORE=0 and DEFLATE=8)
 *  - Decompression bomb defenses (per-entry limit 25MB, cumulative expanded limit 100MB, extreme compression ratio >100:1)
 *  - Strict header consistency between central directory and local headers
 */
export function parseAndValidateZipArchive(buffer: Buffer): ZipValidationResult {
  if (!buffer || buffer.length < 30) {
    return { valid: false, reason: 'Buffer too small' };
  }

  // 1. Validate initial Local File Header signature 0x04034b50 (PK\x03\x04)
  if (buffer.readUInt32LE(0) !== 0x04034b50) {
    return { valid: false, reason: 'Invalid ZIP magic header' };
  }

  // 2. Find End of Central Directory (EOCD) signature 0x06054b50 (PK\x05\x06) from end of buffer
  let eocdOffset = -1;
  const maxSearch = Math.min(buffer.length, 65557); // 22 byte EOCD + max 65535 comment length
  for (let i = buffer.length - 22; i >= buffer.length - maxSearch; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    return { valid: false, reason: 'Missing End of Central Directory (EOCD) record' };
  }

  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  const cdSize = buffer.readUInt32LE(eocdOffset + 12);
  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);

  // Enforce safe archive limits: entry count between 1 and 1000
  if (totalEntries === 0 || totalEntries > 1000) {
    return { valid: false, reason: `Invalid entry count (${totalEntries})` };
  }
  if (cdOffset + cdSize > eocdOffset || cdOffset >= buffer.length) {
    return { valid: false, reason: 'Corrupt central directory boundary' };
  }

  let offset = cdOffset;
  let totalUncompressedSize = 0;
  const entries: ZipCentralDirectoryEntry[] = [];

  for (let i = 0; i < totalEntries; i++) {
    if (offset + 46 > buffer.length) {
      return { valid: false, reason: 'Truncated central directory record' };
    }
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      return { valid: false, reason: 'Invalid central directory signature' };
    }

    const flags = buffer.readUInt16LE(offset + 8);
    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const filenameLen = buffer.readUInt16LE(offset + 28);
    const extraLen = buffer.readUInt16LE(offset + 30);
    const commentLen = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);

    // Reject encrypted or strong-encrypted entries
    if ((flags & 0x0001) !== 0 || (flags & 0x0040) !== 0) {
      return { valid: false, reason: 'Encrypted entries are forbidden' };
    }

    // Supported compression methods: 0 (STORE) and 8 (DEFLATE)
    if (compressionMethod !== 0 && compressionMethod !== 8) {
      return { valid: false, reason: `Unsupported compression method (${compressionMethod})` };
    }

    const filenameOffset = offset + 46;
    if (filenameOffset + filenameLen > buffer.length) {
      return { valid: false, reason: 'Truncated entry filename' };
    }

    const filename = buffer.toString('utf8', filenameOffset, filenameOffset + filenameLen);

    // Reject path traversal and illegal character patterns
    if (
      filename.includes('..') ||
      filename.startsWith('/') ||
      filename.startsWith('\\') ||
      filename.includes('\0')
    ) {
      return { valid: false, reason: `Illegal path in archive: ${filename}` };
    }

    // Decompression bomb defenses:
    // 1. Single entry uncompressed size max 25MB
    if (uncompressedSize > 25 * 1024 * 1024) {
      return { valid: false, reason: `Entry exceeds maximum uncompressed size: ${filename}` };
    }

    // 2. Cumulative uncompressed size max 100MB
    totalUncompressedSize += uncompressedSize;
    if (totalUncompressedSize > 100 * 1024 * 1024) {
      return { valid: false, reason: 'Total uncompressed size exceeds 100MB limit' };
    }

    // 3. Compression ratio limit (max 100:1 ratio for entries > 64KB)
    if (uncompressedSize > 64 * 1024) {
      if (compressedSize === 0) {
        return { valid: false, reason: `Invalid zero compressed size for non-empty entry: ${filename}` };
      }
      const ratio = uncompressedSize / compressedSize;
      if (ratio > 100) {
        return { valid: false, reason: `Dangerous compression ratio (${Math.round(ratio)}:1) for entry: ${filename}` };
      }
    }

    // 4. Validate corresponding local header consistency
    if (localHeaderOffset + 30 > buffer.length) {
      return { valid: false, reason: 'Local header offset out of bounds' };
    }
    if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
      return { valid: false, reason: 'Local header signature mismatch' };
    }
    const localNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
    if (localHeaderOffset + 30 + localNameLen > buffer.length) {
      return { valid: false, reason: 'Local header filename truncated' };
    }
    const localName = buffer.toString('utf8', localHeaderOffset + 30, localHeaderOffset + 30 + localNameLen);
    if (localName !== filename) {
      return { valid: false, reason: 'Local and central directory filename mismatch' };
    }

    entries.push({
      filename,
      uncompressedSize,
      compressedSize,
      compressionMethod,
      flags,
      localHeaderOffset,
    });

    offset += 46 + filenameLen + extraLen + commentLen;
  }

  return { valid: true, entries, totalUncompressedSize };
}

export function isValidDocxOoxml(buffer: Buffer): boolean {
  const result = parseAndValidateZipArchive(buffer);
  if (!result.valid || !result.entries || result.entries.length === 0) {
    return false;
  }

  const hasContentTypes = result.entries.some(e => e.filename === '[Content_Types].xml');
  const hasWordDocument = result.entries.some(e => e.filename === 'word/document.xml');

  return hasContentTypes && hasWordDocument;
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
    default:
      return true; // Other MIME types fall back to standard validation
  }
}
