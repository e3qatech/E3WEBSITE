import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, '../prisma/migrations');
const dirs = readdirSync(migrationsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

console.log('====================================================');
console.log('HISTORICAL MIGRATION CHECKSUM COMPARISON (SHA-256)');
console.log('====================================================\n');

for (const dir of dirs) {
  const sqlRelPath = `apps/web/prisma/migrations/${dir}/migration.sql`;
  const localFile = path.join(migrationsDir, dir, 'migration.sql');

  let localHash = 'N/A';
  let mainHash = 'N/A (New in branch)';

  try {
    const bufLocal = readFileSync(localFile, 'utf8').replace(/\r\n/g, '\n');
    localHash = createHash('sha256').update(bufLocal).digest('hex');
  } catch (_e) {
    // Ignore read errors
  }

  try {
    const mainBuf = execSync(`git show 63acef0:${sqlRelPath}`, { encoding: 'utf8' }).replace(/\r\n/g, '\n');
    mainHash = createHash('sha256').update(mainBuf).digest('hex');
  } catch (_e) {
    // Ignore git errors
  }

  const isMatch = localHash === mainHash;
  const status = mainHash.startsWith('N/A') ? 'NEW_MIGRATION' : (isMatch ? 'BYTE_FOR_BYTE_MATCH' : 'MISMATCH_ALTERED');

  console.log(`Migration: ${dir}`);
  console.log(`  - Local Hash:  ${localHash}`);
  console.log(`  - Main Hash:   ${mainHash}`);
  console.log(`  - Status:      [${status}]\n`);
}
