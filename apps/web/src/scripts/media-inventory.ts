import db from '../lib/db';

async function main() {
  const svcs = await (db as any).service.findMany({
    select: {
      slug: true, heroMediaUrl: true, thumbnail: true,
      gallery: { select: { url: true, captionEn: true }, orderBy: { orderIndex: 'asc' } }
    }
  });
  svcs.forEach((s: any) => {
    console.log('=== ' + s.slug + ' ===');
    console.log('  hero: ' + (s.heroMediaUrl || 'NONE'));
    console.log('  thumb: ' + (s.thumbnail || 'NONE'));
    s.gallery.forEach((g: any, i: number) => console.log('  gal[' + i + ']: ' + g.url));
  });

  // Also fetch media table
  const media = await (db as any).media.findMany({
    take: 100, orderBy: { createdAt: 'desc' },
    select: { id: true, url: true, type: true }
  });
  console.log('\n=== MEDIA TABLE ===');
  console.log('Total media records:', media.length);
  media.forEach((m: any) => console.log('  [' + m.type + '] ' + m.url));

  // Fetch case studies
  const cases = await (db as any).caseStudy.findMany({
    where: { isPublished: true },
    select: { id: true, slug: true, titleEn: true, heroImageUrl: true, thumbnailUrl: true, category: true },
    take: 50
  });
  console.log('\n=== CASE STUDIES ===');
  cases.forEach((c: any) => {
    console.log('  [' + (c.category || 'no-cat') + '] ' + c.slug);
    console.log('    hero: ' + (c.heroImageUrl || 'NONE'));
    console.log('    thumb: ' + (c.thumbnailUrl || 'NONE'));
  });

  // Fetch attractions with gallery
  const attrs = await (db as any).attraction.findMany({
    where: { isPublished: true },
    select: {
      id: true, slug: true, nameEn: true, heroMediaUrl: true, heroThumbnailUrl: true,
      gallery: { select: { url: true, captionEn: true }, take: 5, orderBy: { orderIndex: 'asc' } }
    },
    take: 30
  });
  console.log('\n=== ATTRACTIONS ===');
  attrs.forEach((a: any) => {
    console.log('  ' + a.slug + ' — ' + a.nameEn);
    console.log('    hero: ' + (a.heroMediaUrl || 'NONE'));
    console.log('    thumb: ' + (a.heroThumbnailUrl || 'NONE'));
    a.gallery?.forEach((g: any, i: number) => console.log('    gal[' + i + ']: ' + g.url));
  });

  await (db as any).$disconnect();
}
main().catch((e: Error) => { console.error(e.message); process.exit(1); });
