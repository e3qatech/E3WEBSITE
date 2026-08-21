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
}

export function parseZipCentralDirectory(buffer: Buffer): {
  entries: ZipCentralDirectoryEntry[];
  totalUncompressedSize: number;
} | null {
  if (!buffer || buffer.length < 22) return null;

  // Find End of Central Directory (EOCD) signature 0x06054b50 (PK\x05\x06) from end of buffer
  let eocdOffset = -1;
  const maxSearch = Math.min(buffer.length, 65557); // 22 byte EOCD + max 65535 comment length
  for (let i = buffer.length - 22; i >= buffer.length - maxSearch; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) return null;

  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  const cdSize = buffer.readUInt32LE(eocdOffset + 12);
  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);

  // Enforce safe archive limits: max 1000 entries
  if (totalEntries === 0 || totalEntries > 1000) return null;
  if (cdOffset + cdSize > eocdOffset || cdOffset >= buffer.length) return null;

  let offset = cdOffset;
  let totalUncompressedSize = 0;
  const entries: ZipCentralDirectoryEntry[] = [];

  for (let i = 0; i < totalEntries; i++) {
    if (offset + 46 > buffer.length) return null;
    if (buffer.readUInt32LE(offset) !== 0x02014b50) return null; // Central Directory file header signature (PK\x01\x02)

    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const filenameLen = buffer.readUInt16LE(offset + 28);
    const extraLen = buffer.readUInt16LE(offset + 30);
    const commentLen = buffer.readUInt16LE(offset + 32);

    totalUncompressedSize += uncompressedSize;
    // Enforce safe total uncompressed size limit: max 100MB
    if (totalUncompressedSize > 100 * 1024 * 1024) return null;

    const filenameOffset = offset + 46;
    if (filenameOffset + filenameLen > buffer.length) return null;

    const filename = buffer.toString('utf8', filenameOffset, filenameOffset + filenameLen);
    entries.push({ filename, uncompressedSize, compressedSize });

    offset += 46 + filenameLen + extraLen + commentLen;
  }

  return { entries, totalUncompressedSize };
}

export function isValidDocxOoxml(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 30) return false;
  // Must start with PK\x03\x04
  if (buffer.readUInt32LE(0) !== 0x04034b50) return false;

  const parsed = parseZipCentralDirectory(buffer);
  if (!parsed || !parsed.entries || parsed.entries.length === 0) return false;

  const hasContentTypes = parsed.entries.some(e => e.filename === '[Content_Types].xml');
  const hasWordDocument = parsed.entries.some(e => e.filename === 'word/document.xml');

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
