const { readFileSync, readdirSync } = require('fs');
const { createHash } = require('crypto');
const { execSync } = require('child_process');
const path = require('path');

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
  } catch (e) {}

  try {
    const mainBuf = execSync(`git show 63acef0:${sqlRelPath}`, { encoding: 'utf8' }).replace(/\r\n/g, '\n');
    mainHash = createHash('sha256').update(mainBuf).digest('hex');
  } catch (e) {}

  const isMatch = localHash === mainHash;
  const status = mainHash.startsWith('N/A') ? 'NEW_MIGRATION' : (isMatch ? 'BYTE_FOR_BYTE_MATCH' : 'MISMATCH_ALTERED');

  console.log(`Migration: ${dir}`);
  console.log(`  - Local Hash:  ${localHash}`);
  console.log(`  - Main Hash:   ${mainHash}`);
  console.log(`  - Status:      [${status}]\n`);
}
