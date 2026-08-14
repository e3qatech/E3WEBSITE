const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../apps/web/.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) {
        const k = t.substring(0, eq).trim();
        let v = t.substring(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

const prisma = new PrismaClient();

async function main() {
  const cases = await prisma.caseStudy.findMany({
    include: { attraction: true },
    orderBy: { createdAt: 'desc' }
  });

  const diagnostic = cases.map(c => ({
    slug: c.slug,
    isPublished: c.isPublished,
    isVisible: c.isVisible ?? undefined,
    status: c.status ?? undefined,
    isFeatured: c.isFeatured,
    attraction_isPublished: c.attraction ? c.attraction.isPublished : null,
    attraction_isHidden: c.attraction ? c.attraction.isHidden : null,
  }));

  console.log("DIAGNOSTIC_RESULT_JSON=" + JSON.stringify(diagnostic));
}

main().catch(console.error).finally(() => prisma.$disconnect());
