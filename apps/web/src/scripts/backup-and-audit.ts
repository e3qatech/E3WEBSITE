/**
 * DB Backup + Media Audit Script
 * Exports current Service records and audits all available media assets.
 * Run: npx tsx --env-file=.env.local src/scripts/backup-and-audit.ts
 */
import db from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

const BACKUP_DIR = path.resolve(process.cwd(), '../../../.backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

async function main() {
  // Ensure backup dir exists (outside public directory and web root)
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  // ── 1. BACKUP CURRENT SERVICE RECORDS ──────────────────────────────────
  const services = await (db as any).service.findMany({
    include: {
      gallery: { orderBy: { orderIndex: 'asc' } },
      projects: true,
    },
    orderBy: { slug: 'asc' },
  });

  const backupPath = path.join(BACKUP_DIR, `services_backup_${TIMESTAMP}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(services, null, 2), 'utf-8');
  console.log(`\n✅ SERVICE BACKUP`);
  console.log(`   Path: ${backupPath}`);
  console.log(`   Records: ${services.length}`);
  console.log(`   Slugs: ${services.map((s: any) => s.slug).join(', ')}`);

  // ── 2. AUDIT AVAILABLE MEDIA ────────────────────────────────────────────
  console.log('\n📸 MEDIA LIBRARY AUDIT');
  const mediaItems = await (db as any).media.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      url: true,
      filename: true,
      mimeType: true,
      width: true,
      height: true,
      alt: true,
      createdAt: true,
    },
  }).catch(() => []);
  console.log(`   Total media items (latest 200): ${mediaItems.length}`);
  const images = mediaItems.filter((m: any) => m.mimeType?.startsWith('image/'));
  const videos = mediaItems.filter((m: any) => m.mimeType?.startsWith('video/'));
  console.log(`   Images: ${images.length}, Videos: ${videos.length}`);
  
  // Save media list
  const mediaPath = path.join(BACKUP_DIR, `media_audit_${TIMESTAMP}.json`);
  fs.writeFileSync(mediaPath, JSON.stringify(mediaItems, null, 2), 'utf-8');
  console.log(`   Media audit saved: ${mediaPath}`);
  
  // Print image URLs for review
  console.log('\n  Recent image URLs:');
  images.slice(0, 30).forEach((m: any) => {
    console.log(`   [${m.mimeType}] ${m.url}`);
  });

  // ── 3. AUDIT CASE STUDIES ───────────────────────────────────────────────
  console.log('\n📋 CASE STUDIES AUDIT');
  const cases = await (db as any).caseStudy.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      titleEn: true,
      thumbnail: true,
      heroMediaUrl: true,
      category: true,
      isPublished: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  }).catch(() => []);
  console.log(`   Published case studies: ${cases.length}`);
  cases.forEach((c: any) => {
    const thumb = c.thumbnail ? '✅' : '❌';
    const hero = c.heroMediaUrl ? '✅' : '❌';
    console.log(`   ${thumb}thumb ${hero}hero  [${c.category || 'no-cat'}] ${c.slug} — ${c.titleEn}`);
  });

  // ── 4. AUDIT ATTRACTIONS MEDIA ──────────────────────────────────────────
  console.log('\n🎡 ATTRACTIONS MEDIA AUDIT');
  const attractions = await (db as any).attraction.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      heroMediaUrl: true,
      thumbnail: true,
      gallery: {
        select: { url: true, mediaType: true },
        take: 3,
        orderBy: { orderIndex: 'asc' },
      },
    },
    take: 30,
  }).catch(() => []);
  console.log(`   Published attractions: ${attractions.length}`);
  attractions.forEach((a: any) => {
    const hero = a.heroMediaUrl ? '✅' : '❌';
    const gal = a.gallery?.length ? `${a.gallery.length} gallery` : 'no gallery';
    console.log(`   ${hero}hero  [${gal}] ${a.slug} — ${a.nameEn}`);
  });

  // ── 5. CURRENT SERVICE MEDIA STATUS ────────────────────────────────────
  console.log('\n⚙️  CURRENT SERVICE MEDIA STATUS');
  services.forEach((s: any) => {
    const hero = s.heroMediaUrl ? '✅' : '❌';
    const thumb = s.thumbnail ? '✅' : '❌';
    const gal = s.gallery?.length ? `${s.gallery.length} items` : 'empty';
    console.log(`   ${hero}hero ${thumb}thumb [gallery: ${gal}] ${s.slug}`);
    if (s.heroMediaUrl) console.log(`      → hero: ${s.heroMediaUrl}`);
  });

  await (db as any).$disconnect();
  console.log('\n✅ Audit complete.');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
