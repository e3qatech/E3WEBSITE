import crypto from 'crypto';

export function compareSignatures(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function isValidDocxOoxml(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 30) return false;
  // Must start with PK\x03\x04
  const isZip = buffer.toString('hex', 0, 4).toUpperCase() === '504B0304';
  if (!isZip) return false;
  // Must contain OOXML document structure markers
  const contentTypesMarker = Buffer.from('[Content_Types].xml');
  const wordMarker = Buffer.from('word/');
  return buffer.includes(contentTypesMarker) && buffer.includes(wordMarker);
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
