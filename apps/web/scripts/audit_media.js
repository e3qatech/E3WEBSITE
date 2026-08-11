const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_laoj96QzNhBM@ep-frosty-poetry-atys9iw5-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
})

async function audit() {
  console.log('Auditing CMS Pages for Media Type Mismatches...');
  const pages = await prisma.pages.findMany();
  
  let fixes = 0;

  for (const page of pages) {
    let rawContent = {};
    if (page.rawContent && typeof page.rawContent === 'object') {
      rawContent = page.rawContent;
    }

    let modified = false;

    // Check heroMedia
    if (rawContent.heroMedia) {
      const url = rawContent.heroMedia.mediaUrl || '';
      const type = rawContent.heroMedia.mediaType;
      
      const isVideoUrl = /\.(mp4|webm|mov|m4v|mkv)$/i.test(url);
      const isImageUrl = /\.(jpeg|jpg|png|webp|gif|svg|avif)$/i.test(url);

      if (isVideoUrl && type === 'IMAGE') {
        console.log(`[${page.slug}] Found MP4 saved as IMAGE. Fixing to VIDEO...`);
        rawContent.heroMedia.mediaType = 'VIDEO';
        if (rawContent.hero) rawContent.hero.mediaType = 'VIDEO';
        if (rawContent.act1Hero) rawContent.act1Hero.mediaType = 'VIDEO';
        modified = true;
      }
      if (isImageUrl && type === 'VIDEO') {
        console.log(`[${page.slug}] Found Image saved as VIDEO. Fixing to IMAGE...`);
        rawContent.heroMedia.mediaType = 'IMAGE';
        if (rawContent.hero) rawContent.hero.mediaType = 'IMAGE';
        if (rawContent.act1Hero) rawContent.act1Hero.mediaType = 'IMAGE';
        modified = true;
      }
    }

    if (modified) {
      await prisma.pages.update({
        where: { id: page.id },
        data: { rawContent }
      });
      fixes++;
    }
  }

  console.log(`Audit complete. Fixed ${fixes} pages.`);
  process.exit(0);
}

audit().catch(console.error);
