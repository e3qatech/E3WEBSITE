/**
 * Universal Rich-Text & Multilingual Text Normalizer
 * Safely parses, normalizes, and extracts clean plain text from strings,
 * ProseMirror/TipTap JSON trees, JSON-stringified payloads, and localized dictionaries.
 * Guarantees zero "[object Object]" artifacts in rendered HTML.
 */

export function extractPlainTextFromNode(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);

  if (node.text && typeof node.text === 'string') {
    return node.text;
  }

  if (Array.isArray(node)) {
    return node.map(extractPlainTextFromNode).filter(Boolean).join(' ');
  }

  if (Array.isArray(node.content)) {
    return node.content.map(extractPlainTextFromNode).filter(Boolean).join(' ');
  }

  if (node.value && typeof node.value === 'string') {
    return node.value;
  }

  return '';
}

export function cleanObjectObjectResidue(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  let cleaned = text.trim();
  const hadBracketPrefix = cleaned.startsWith('[');

  // Strip various manifestations of [object Object] residue
  cleaned = cleaned
    .replace(/^\[object\s+Object\]/gi, '')
    .replace(/^\[object\s+Object/gi, '')
    .replace(/\[object\s+Object\]$/gi, '')
    .replace(/\[object\s+Object\]/gi, ' ')
    .trim();

  // If there was an open bracket prefix stripped, also clean trailing unmatched bracket
  if (hadBracketPrefix && cleaned.endsWith(']')) {
    cleaned = cleaned.substring(0, cleaned.length - 1).trim();
  }

  // If the entire text was just [object Object], return empty string
  if (cleaned.toLowerCase() === '[object object]' || cleaned.toLowerCase() === '[object') {
    return '';
  }

  return cleaned;
}

export function normalizeRichText(val: any, locale: string = 'en'): string {
  if (val === null || val === undefined) return '';

  // 1. Primitive string
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return '';

    // Check if it's a JSON string
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeRichText(parsed, locale);
      } catch {
        // Not valid JSON, proceed to clean plain string
      }
    }

    return cleanObjectObjectResidue(trimmed);
  }

  // 2. Number or boolean
  if (typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }

  // 3. Array of nodes or strings
  if (Array.isArray(val)) {
    const extracted = val.map(item => normalizeRichText(item, locale)).filter(Boolean).join(' ');
    return cleanObjectObjectResidue(extracted);
  }

  // 4. Object
  if (typeof val === 'object') {
    // 4a. Multilingual dictionary { en: "...", ar: "..." }
    if ('en' in val || 'ar' in val) {
      const selected = locale === 'ar' ? (val.ar || val.en) : (val.en || val.ar);
      return normalizeRichText(selected, locale);
    }

    // 4b. Multilingual entity keys (nameEn/nameAr, titleEn/titleAr, descriptionEn/descriptionAr)
    if (locale === 'ar') {
      if (val.titleAr || val.nameAr || val.descriptionAr || val.questionAr || val.answerAr) {
        return normalizeRichText(val.titleAr || val.nameAr || val.descriptionAr || val.questionAr || val.answerAr, locale);
      }
    }
    if (val.titleEn || val.nameEn || val.descriptionEn || val.questionEn || val.answerEn) {
      return normalizeRichText(val.titleEn || val.nameEn || val.descriptionEn || val.questionEn || val.answerEn, locale);
    }

    // 4c. ProseMirror / TipTap Document Node { type: "doc", content: [...] }
    if (val.type === 'doc' || Array.isArray(val.content) || val.text) {
      const extracted = extractPlainTextFromNode(val);
      return cleanObjectObjectResidue(extracted);
    }

    // 4d. Fallback object parsing: try values
    const stringValues = Object.values(val).filter(v => typeof v === 'string' || typeof v === 'number');
    if (stringValues.length > 0) {
      const extracted = stringValues.join(' ');
      return cleanObjectObjectResidue(extracted);
    }

    return '';
  }

  return '';
}
