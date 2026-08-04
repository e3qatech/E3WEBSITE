const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');

// Handle CLI self-test execution
if (process.argv.includes('--self-test')) {
  console.log('🧪 Running Security Check Script Self-Tests...');
  
  // Test 1: Forbidden pattern matching
  const testPatterns = [/^\.env\.local$/i, /^\.vercel\//i];
  if (!testPatterns[0].test('.env.local') || !testPatterns[1].test('.vercel/project.json')) {
    console.error('❌ Self-Test 1 Failed: Pattern matching error');
    process.exit(1);
  }

  // Test 2: Forbidden keywords
  const testContent = 'prisma db push --accept-data-loss';
  const pushPattern = /prisma\s+db\s+push/i;
  const lossPattern = /--accept-data-loss/i;
  if (!pushPattern.test(testContent) || !lossPattern.test(testContent)) {
    console.error('❌ Self-Test 2 Failed: Keyword detection error');
    process.exit(1);
  }

  console.log('✅ All Security Check Self-Tests PASSED.');
  process.exit(0);
}

console.log('🔍 Executing Security Regression Checks...');
let failed = false;

// 1. Git tracked forbidden paths check
try {
  const trackedFiles = execSync('git ls-files', { cwd: rootDir, encoding: 'utf-8' }).split('\n');
  const forbiddenPatterns = [
    /^\.env\.local$/i,
    /^\.env\.production$/i,
    /^\.env\.staging$/i,
    /^\.env\.secret$/i,
    /^\.vercel\//i,
    /^\.turbo\//i,
    /node_modules\//i
  ];

  for (const file of trackedFiles) {
    const trimmed = file.trim();
    if (!trimmed) continue;
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(trimmed)) {
        console.error(`❌ SECURITY BREACH: Forbidden tracked file in git: ${trimmed}`);
        failed = true;
      }
    }
  }
} catch (e) {
  console.error('❌ Failed to run git ls-files:', e.message);
  failed = true;
}

// 2. Scan package.json, turbo.json, and source files for forbidden commands & hardcoded secrets
const filesToScan = [
  'package.json',
  'apps/web/package.json',
  'packages/prisma/package.json',
  'turbo.json'
];

const forbiddenKeywords = [
  { pattern: /prisma\s+db\s+push/i, desc: 'Forbidden "prisma db push" command' },
  { pattern: /--accept-data-loss/i, desc: 'Forbidden "--accept-data-loss" flag' },
  { pattern: /TempPassword123/, desc: 'Hardcoded default credential "TempPassword123"' },
  { pattern: /vercel_blob_rw_[a-zA-Z0-9_-]{20,}/, desc: 'Hardcoded Vercel Blob token pattern' },
  { pattern: /redis:\/\/:[a-zA-Z0-9_-]{10,}@/, desc: 'Hardcoded Redis URL password pattern' }
];

for (const relPath of filesToScan) {
  const fullPath = path.resolve(rootDir, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    for (const item of forbiddenKeywords) {
      if (item.pattern.test(content)) {
        console.error(`❌ SECURITY BREACH in ${relPath}: ${item.desc}`);
        failed = true;
      }
    }
  }
}

if (failed) {
  console.error('❌ Security regression checks FAILED.');
  process.exit(1);
}

console.log('✅ Security regression checks PASSED.');
process.exit(0);
