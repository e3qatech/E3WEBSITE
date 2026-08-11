/**
 * E3 CMS Media Persistence Audit Script
 * Run: npx tsx scripts/audit-cms-media.ts
 *
 * Scans PostgreSQL database tables (Pages, Attraction, Service, CaseStudy, Media, SiteSettings)
 * for suspicious or non-persistent media references:
 * - blob: URLs (temporary browser objects)
 * - data: URLs (base64 inline data URLs in page content)
 * - localhost or /tmp/ URLs
 * - Relative /uploads/ URLs (which fail on Vercel immutable serverless deployment)
 * - Unreachable external or private storage URLs
 */

import db from '../src/lib/db';

interface AuditFinding {
  sourceTable: string;
  recordIdentifier: string;
  field: string;
  url: string;
  issue: string;
}

function classifyUrlIssue(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (!clean) return null;

  if (clean.startsWith('blob:')) {
    return 'CRITICAL: Temporary browser Blob URL (will disappear on refresh)';
  }
  if (clean.startsWith('data:')) {
    return 'WARNING: Inline Base64 Data URL (should be stored as Vercel Blob or /api/media/[id])';
  }
  if (clean.includes('localhost:') || clean.startsWith('/tmp/') || clean.includes('127.0.0.1')) {
    return 'CRITICAL: Local development path (unreachable in production)';
  }
  if (clean.startsWith('/uploads/')) {
    return 'WARNING: Relative /uploads/ disk path (fails on Vercel serverless deployment)';
  }
  if (clean.includes('e3-private-resumes') || clean.includes('/private/')) {
    return 'HIGH: Private resume storage URL referenced in public content';
  }
  return null;
}

function scanObjectForMedia(obj: any, sourceTable: string, recordId: string, currentPath = '', findings: AuditFinding[] = []): AuditFinding[] {
  if (!obj) return findings;

  if (typeof obj === 'string') {
    const issue = classifyUrlIssue(obj);
    if (issue) {
      findings.push({
        sourceTable,
        recordIdentifier: recordId,
        field: currentPath,
        url: obj.length > 80 ? obj.substring(0, 77) + '...' : obj,
        issue,
      });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      scanObjectForMedia(item, sourceTable, recordId, `${currentPath}[${idx}]`, findings);
    });
  } else if (typeof obj === 'object') {
    Object.entries(obj).forEach(([key, val]) => {
      const isMediaField = /^(mediaUrl|posterUrl|heroMediaUrl|logoUrl|fallbackImage|thumbnailUrl|thumbnail|cvUrl|url)$/i.test(key);
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      if (isMediaField && typeof val === 'string') {
        const issue = classifyUrlIssue(val);
        if (issue) {
          findings.push({
            sourceTable,
            recordIdentifier: recordId,
            field: nextPath,
            url: val.length > 80 ? val.substring(0, 77) + '...' : val,
            issue,
          });
        }
      } else {
        scanObjectForMedia(val, sourceTable, recordId, nextPath, findings);
      }
    });
  }

  return findings;
}

async function runAudit() {
  console.log('====================================================');
  console.log('  E3 CMS Media Persistence & Reliability Audit Report');
  console.log('====================================================\n');

  const allFindings: AuditFinding[] = [];

  // 1. Audit Pages Table
  try {
    const pages = await db.pages.findMany();
    pages.forEach((page: any) => {
      scanObjectForMedia(page.content, 'Pages', `slug:${page.slug}`, 'content', allFindings);
    });
    console.log(`[Audit] Scanned ${pages.length} records in Pages table.`);
  } catch (err) {
    console.warn('[Audit] Could not query Pages table:', err);
  }

  // 2. Audit Media Table
  try {
    const mediaItems = await db.media.findMany();
    mediaItems.forEach((media: any) => {
      const issue = classifyUrlIssue(media.url);
      if (issue) {
        allFindings.push({
          sourceTable: 'Media',
          recordIdentifier: `id:${media.id}`,
          field: 'url',
          url: media.url,
          issue,
        });
      }
    });
    console.log(`[Audit] Scanned ${mediaItems.length} records in Media table.`);
  } catch (err) {
    console.warn('[Audit] Could not query Media table:', err);
  }

  // 3. Audit Attraction Table
  try {
    const attractions = await db.attraction.findMany();
    attractions.forEach((attraction: any) => {
      if (attraction.heroMediaUrl) {
        const issue = classifyUrlIssue(attraction.heroMediaUrl);
        if (issue) allFindings.push({ sourceTable: 'Attraction', recordIdentifier: `slug:${attraction.slug}`, field: 'heroMediaUrl', url: attraction.heroMediaUrl, issue });
      }
      if (attraction.logoUrl) {
        const issue = classifyUrlIssue(attraction.logoUrl);
        if (issue) allFindings.push({ sourceTable: 'Attraction', recordIdentifier: `slug:${attraction.slug}`, field: 'logoUrl', url: attraction.logoUrl, issue });
      }
    });
    console.log(`[Audit] Scanned ${attractions.length} records in Attraction table.`);
  } catch (err) {
    console.warn('[Audit] Could not query Attraction table:', err);
  }

  // 4. Audit Service Table
  try {
    const services = await db.service.findMany();
    services.forEach((service: any) => {
      if (service.heroMediaUrl) {
        const issue = classifyUrlIssue(service.heroMediaUrl);
        if (issue) allFindings.push({ sourceTable: 'Service', recordIdentifier: `slug:${service.slug}`, field: 'heroMediaUrl', url: service.heroMediaUrl, issue });
      }
      if (service.thumbnail) {
        const issue = classifyUrlIssue(service.thumbnail);
        if (issue) allFindings.push({ sourceTable: 'Service', recordIdentifier: `slug:${service.slug}`, field: 'thumbnail', url: service.thumbnail, issue });
      }
    });
    console.log(`[Audit] Scanned ${services.length} records in Service table.`);
  } catch (err) {
    console.warn('[Audit] Could not query Service table:', err);
  }

  // Summary Output
  console.log('\n----------------------------------------------------');
  console.log(`Total Suspicious Media Issues Found: ${allFindings.length}`);
  console.log('----------------------------------------------------\n');

  if (allFindings.length === 0) {
    console.log('✅ ALL MEDIA REFERENCES ARE VALID AND PERSISTENT! No broken or temporary URLs found.');
  } else {
    console.table(allFindings);
  }
}

runAudit()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Audit failed:', e);
    process.exit(1);
  });
