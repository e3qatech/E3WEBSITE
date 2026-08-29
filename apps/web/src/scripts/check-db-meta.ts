import db from '../lib/db';

async function main() {
  const count = await (db as any).service.count();
  const recent = await (db as any).service.findMany({
    select: { slug: true, updatedAt: true, createdAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 12,
  });
  console.log('Service total rows:', count);
  console.log('Most recently modified (desc):');
  recent.forEach((r: any) => {
    console.log(` - slug=${r.slug}  updatedAt=${r.updatedAt.toISOString()}`);
  });
  await (db as any).$disconnect();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
