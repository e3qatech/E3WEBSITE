import crypto from 'crypto';

export function compareSignatures(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function isValidMagicBytes(buffer: Buffer, ext: string): boolean {
  if (!buffer || buffer.length < 4) return false;
  
  const hex = buffer.toString('hex', 0, 4).toUpperCase();
  const hex8 = buffer.toString('hex', 0, 8).toUpperCase();
  
  switch(ext) {
    case 'pdf':
      return hex.startsWith('25504446'); // %PDF
    case 'jpeg':
    case 'jpg':
      return hex.startsWith('FFD8FF');
    case 'png':
      return hex8.startsWith('89504E470D0A1A0A');
    case 'doc':
      return hex8.startsWith('D0CF11E0A1B11AE1');
    case 'docx':
      return hex.startsWith('504B0304'); // PK\x03\x04
    default:
      return true; // We don't check magic bytes for other types, they fall back to ext/MIME
  }
}
