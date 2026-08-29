import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.slice('DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g, '');
  }
}

console.log('Original dbUrl hostname:', new URL(dbUrl).hostname);

async function tryConnect(url, label) {
  console.log(`\nTesting connection [${label}]...`);
  const client = new PrismaClient({
    datasources: { db: { url } },
  });
  try {
    const count = await client.service.count();
    console.log(`SUCCESS [${label}]: service count =`, count);
    const services = await client.service.findMany({
      select: { id: true, slug: true, isVisible: true, isPublished: true, titleEn: true }
    });
    console.log('Services:', services);
    await client.$disconnect();
    return true;
  } catch (err) {
    console.error(`FAILED [${label}]:`, err.message);
    await client.$disconnect().catch(() => {});
    return false;
  }
}

async function run() {
  await tryConnect(dbUrl, 'raw dbUrl');
  
  const poolerUrl = new URL(dbUrl);
  if (!poolerUrl.hostname.includes('-pooler')) {
    const parts = poolerUrl.hostname.split('.');
    parts[0] = parts[0] + '-pooler';
    poolerUrl.hostname = parts.join('.');
  }
  poolerUrl.searchParams.set('pgbouncer', 'true');
  poolerUrl.searchParams.set('sslmode', 'require');
  await tryConnect(poolerUrl.toString(), 'with -pooler & sslmode=require & pgbouncer=true');
}

run();
