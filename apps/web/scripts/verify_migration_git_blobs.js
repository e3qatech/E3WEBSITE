const { execSync } = require('child_process');
const { readdirSync } = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../prisma/migrations');
const dirs = readdirSync(migrationsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

console.log('====================================================');
console.log('HISTORICAL MIGRATION GIT BLOB VERIFICATION (rev-parse)');
console.log('====================================================\n');

let allHistoricalMatch = true;

for (const dir of dirs) {
  const sqlRelPath = `apps/web/prisma/migrations/${dir}/migration.sql`;

  let mainBlob = 'N/A';
  let headBlob = 'N/A';
  let diffExitCode = 0;

  try {
    mainBlob = execSync(`git rev-parse origin/main:${sqlRelPath}`, { encoding: 'utf8' }).trim();
  } catch (e) {
    mainBlob = 'N/A (New in branch)';
  }

  try {
    headBlob = execSync(`git rev-parse HEAD:${sqlRelPath}`, { encoding: 'utf8' }).trim();
  } catch (e) {
    headBlob = 'N/A';
  }

  let diffStatus = 'MATCH (exit-code 0)';
  if (!mainBlob.startsWith('N/A')) {
    try {
      execSync(`git diff --exit-code origin/main -- ${sqlRelPath}`, { encoding: 'utf8' });
    } catch (e) {
      diffExitCode = e.status || 1;
      diffStatus = `DIFF DETECTED (exit-code ${diffExitCode})`;
      allHistoricalMatch = false;
    }
  } else {
    diffStatus = 'NEW MIGRATION ON BRANCH';
  }

  const isMatch = mainBlob === headBlob;

  console.log(`Migration: ${dir}`);
  console.log(`  - origin/main Blob ID: ${mainBlob}`);
  console.log(`  - HEAD Blob ID:        ${headBlob}`);
  console.log(`  - Blob Match:          ${isMatch ? 'PASS (100% Identical)' : (mainBlob.startsWith('N/A') ? 'NEW MIGRATION' : 'FAIL')}`);
  console.log(`  - Git Diff Check:      ${diffStatus}\n`);
}

console.log(`Final Historical Blob Identity Verdict: ${allHistoricalMatch ? 'PASS (Every historical migration is 100% identical Git object)' : 'FAIL'}`);
