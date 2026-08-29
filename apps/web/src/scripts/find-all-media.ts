import db from '../lib/db';

async function main() {
  const allUrls = new Set<string>();

  // Scrape Pages
  const pages = await (db as any).pages.findMany();
  pages.forEach((p: any) => {
    const s = JSON.stringify(p);
    const matches = s.match(/https:\/\/[^"\s\\]+\.(jpg|jpeg|png|webp|mp4|MP4)/g) || [];
    matches.forEach((u: string) => allUrls.add(u));
  });

  // Scrape Attractions
  const attrs = await (db as any).attraction.findMany({ include: { gallery: true } });
  attrs.forEach((a: any) => {
    const s = JSON.stringify(a);
    const matches = s.match(/https:\/\/[^"\s\\]+\.(jpg|jpeg|png|webp|mp4|MP4)/g) || [];
    matches.forEach((u: string) => allUrls.add(u));
  });

  // Scrape CaseStudies
  const cases = await (db as any).caseStudy.findMany();
  cases.forEach((c: any) => {
    const s = JSON.stringify(c);
    const matches = s.match(/https:\/\/[^"\s\\]+\.(jpg|jpeg|png|webp|mp4|MP4)/g) || [];
    matches.forEach((u: string) => allUrls.add(u));
  });

  // Scrape Media
  const media = await (db as any).media.findMany();
  media.forEach((m: any) => {
    allUrls.add(m.url);
    if (m.thumbnailUrl) allUrls.add(m.thumbnailUrl);
  });

  // Scrape Services
  const svcs = await (db as any).service.findMany({ include: { gallery: true } });
  svcs.forEach((svc: any) => {
    const s = JSON.stringify(svc);
    const matches = s.match(/https:\/\/[^"\s\\]+\.(jpg|jpeg|png|webp|mp4|MP4)/g) || [];
    matches.forEach((u: string) => allUrls.add(u));
  });

  console.log('TOTAL UNIQUE ASSETS FOUND:', allUrls.size);
  const arr = Array.from(allUrls).sort();
  arr.forEach((u: string, i: number) => console.log(`[${i + 1}] ${u}`));

  await (db as any).$disconnect();
}

main().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
