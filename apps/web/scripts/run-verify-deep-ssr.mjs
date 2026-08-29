import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env.local'));
if (!process.env.DATABASE_URL) {
  loadEnvFile(path.resolve(process.cwd(), '.env.production'));
}

execSync('npx tsx scripts/verify-deep-ssr.tsx', {
  stdio: 'inherit',
  env: process.env,
});
