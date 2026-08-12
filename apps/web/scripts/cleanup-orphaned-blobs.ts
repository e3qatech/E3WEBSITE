import { list, del } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOrphanedBlobs(dryRun = true) {
  console.log(`Starting Blob cleanup in ${dryRun ? 'DRY RUN' : 'PRODUCTION'} mode...`);

  // 1. Fetch all blobs from Vercel
  let hasMore = true;
  let cursor: string | undefined = undefined;
  const allBlobs: string[] = [];

  console.log('Fetching list of blobs from Vercel...');
  while (hasMore) {
    const response: any = await list({
      cursor,
      limit: 1000,
    });
    
    response.blobs.forEach((b: any) => allBlobs.push(b.url));
    hasMore = response.hasMore;
    cursor = response.cursor;
  }

  console.log(`Found ${allBlobs.length} total blobs in Vercel.`);

  if (allBlobs.length === 0) {
    console.log('No blobs to process. Exiting.');
    return;
  }

  // 2. Fetch all URLs from the database
  console.log('Scanning database for active references...');
  const activeUrls = new Set<string>();

  // BrandIP
  const brands = await prisma.brandIP.findMany({
    select: { primaryLogoUrl: true, compactLogoUrl: true, primaryMediaUrl: true, coverMediaUrl: true, thumbnailUrl: true }
  });
  brands.forEach(b => {
    if (b.primaryLogoUrl) activeUrls.add(b.primaryLogoUrl);
    if (b.compactLogoUrl) activeUrls.add(b.compactLogoUrl);
    if (b.primaryMediaUrl) activeUrls.add(b.primaryMediaUrl);
    if (b.coverMediaUrl) activeUrls.add(b.coverMediaUrl);
    if (b.thumbnailUrl) activeUrls.add(b.thumbnailUrl);
  });

  // Attraction
  const attractions = await prisma.attraction.findMany({
    select: { logoUrl: true, heroMediaUrl: true, heroFallbackUrl: true, heroThumbnailUrl: true }
  });
  attractions.forEach(a => {
    if (a.logoUrl) activeUrls.add(a.logoUrl);
    if (a.heroMediaUrl) activeUrls.add(a.heroMediaUrl);
    if (a.heroFallbackUrl) activeUrls.add(a.heroFallbackUrl);
    if (a.heroThumbnailUrl) activeUrls.add(a.heroThumbnailUrl);
  });

  // AttractionFeature
  const features = await prisma.attractionFeature.findMany({
    select: { imageUrl: true, iconUrl: true }
  });
  features.forEach(f => {
    if (f.imageUrl) activeUrls.add(f.imageUrl);
    if (f.iconUrl) activeUrls.add(f.iconUrl);
  });

  // AttractionGalleryItem
  const gallery = await prisma.attractionGalleryItem.findMany({
    select: { url: true }
  });
  gallery.forEach(g => {
    if (g.url) activeUrls.add(g.url);
  });

  console.log(`Found ${activeUrls.size} unique active URLs in the database.`);

  // 3. Find Orphans
  const orphanedBlobs = allBlobs.filter(url => !activeUrls.has(url));

  console.log(`Identified ${orphanedBlobs.length} orphaned blobs.`);

  // 4. Delete or report
  if (orphanedBlobs.length > 0) {
    if (dryRun) {
      console.log('\n[DRY RUN] Would delete the following orphaned blobs:');
      orphanedBlobs.forEach(url => console.log(` - ${url}`));
      console.log('\nRun with the --execute flag to perform deletion.');
    } else {
      console.log('\nDeleting orphaned blobs...');
      for (const url of orphanedBlobs) {
        try {
          await del(url);
          console.log(` ✅ Deleted: ${url}`);
        } catch (error: any) {
          console.error(` ❌ Failed to delete ${url}: ${error.message}`);
        }
      }
      console.log('Deletion complete.');
    }
  } else {
    console.log('No orphaned blobs found. Everything is clean.');
  }

  await prisma.$disconnect();
}

const isDryRun = !process.argv.includes('--execute');
cleanupOrphanedBlobs(isDryRun).catch(error => {
  console.error("Fatal error during cleanup:", error);
  process.exit(1);
});
