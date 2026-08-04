const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.resolve(rootDir, 'apps/web');
const baselinePath = path.resolve(__dirname, 'lint-baseline.json');

if (!fs.existsSync(baselinePath)) {
  console.error(`❌ Error: Baseline file not found at ${baselinePath}`);
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));

console.log('🔍 Executing ESLint scan on apps/web...');
let rawJson = '';

try {
  rawJson = execSync('npx eslint . -f json', {
    cwd: webDir,
    maxBuffer: 50 * 1024 * 1024,
    encoding: 'utf-8'
  });
} catch (error) {
  if (error.stdout) {
    rawJson = error.stdout;
  } else {
    console.error('❌ ESLint execution failed severely:', error);
    process.exit(1);
  }
}

let results;
try {
  results = JSON.parse(rawJson);
} catch (parseError) {
  console.error('❌ Failed to parse ESLint output as JSON:', parseError.message);
  process.exit(1);
}

const currentCounts = {};
let totalFindings = 0;

for (const result of results) {
  for (const message of result.messages) {
    const ruleId = message.ruleId || 'unused-eslint-disable-directive';
    currentCounts[ruleId] = (currentCounts[ruleId] || 0) + 1;
    totalFindings++;
  }
}

console.log('\n========================================');
console.log('       ESLINT BASELINE BUDGET REPORT    ');
console.log('========================================');
console.log(`Total Findings: ${totalFindings}\n`);

let failed = false;

// Check current findings against baseline budget
for (const [ruleId, currentCount] of Object.entries(currentCounts)) {
  const allowedBudget = baseline[ruleId];
  if (allowedBudget === undefined) {
    console.error(`❌ NEW UNBUDGETED LINT RULE: ${ruleId} (${currentCount} occurrences)`);
    failed = true;
  } else if (currentCount > allowedBudget) {
    console.error(`❌ LINT BUDGET BREACH: ${ruleId} -> Current: ${currentCount}, Allowed: ${allowedBudget}`);
    failed = true;
  } else {
    console.log(`✅ PASS: ${ruleId} -> Current: ${currentCount} / Budget: ${allowedBudget}`);
  }
}

// Check for missing rules (improved quality)
for (const [ruleId, allowedBudget] of Object.entries(baseline)) {
  if (currentCounts[ruleId] === undefined) {
    console.log(`🎉 IMPROVEMENT: ${ruleId} had 0 findings (Budget was ${allowedBudget})`);
  }
}

console.log('========================================\n');

if (failed) {
  console.error('❌ Lint baseline budget validation FAILED. Quality regression detected.');
  process.exit(1);
}

console.log('✅ Lint baseline budget validation PASSED.');
process.exit(0);
