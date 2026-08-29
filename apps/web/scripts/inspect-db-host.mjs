import fs from 'fs';
import path from 'path';

function inspect(filename) {
  if (!fs.existsSync(filename)) {
    console.log(filename, 'does not exist');
    return;
  }
  console.log('=== ' + filename + ' ===');
  const content = fs.readFileSync(filename, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...rest] = trimmed.split('=');
    const v = rest.join('=').replace(/^['"]|['"]$/g, '');
    if (k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('PRISMA')) {
      try {
        const cleanV = v.trim();
        if (cleanV.startsWith('postgres://') || cleanV.startsWith('postgresql://')) {
          const u = new URL(cleanV);
          console.log(`  ${k} => host: ${u.hostname}, db: ${u.pathname}, user: ${u.username}`);
        } else {
          console.log(`  ${k} => val: ${cleanV.slice(0, 15)}...`);
        }
      } catch (err) {
        console.log(`  ${k} => parse err: ${err.message}`);
      }
    }
  }
}

inspect('.env.local');
inspect('.env');
inspect('.env.preview.tmp');
inspect('.vercel/.env.preview.local');
inspect('.env.production');
