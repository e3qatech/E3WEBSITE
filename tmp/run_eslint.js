const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packages = ['apps/web', 'packages/i18n', 'packages/prisma', 'packages/types', 'packages/ui'];

let allResults = [];
let totalVars = 0;
let totalRequire = 0;
let totalConst = 0;

for (const pkg of packages) {
  const cwd = path.resolve(__dirname, '..', pkg);
  console.log(`Running lint in ${pkg}...`);
  try {
    const result = execSync('npx eslint . --max-warnings=0 -f json', { cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    allResults.push(...JSON.parse(result));
  } catch (err) {
    if (err.stdout) {
      try {
        allResults.push(...JSON.parse(err.stdout));
      } catch (e) {
        console.error(`Could not parse JSON output from ${pkg}`);
      }
    } else {
      console.error(`Error running eslint in ${pkg}:`, err.message);
    }
  }
}

fs.writeFileSync(path.resolve(__dirname, 'eslint_report_combined.json'), JSON.stringify(allResults, null, 2));

for (const file of allResults) {
  for (const msg of file.messages) {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') totalVars++;
    if (msg.ruleId === '@typescript-eslint/no-require-imports') totalRequire++;
    if (msg.ruleId === 'prefer-const') totalConst++;
  }
}

console.log('### Initial Target Counts');
console.log(`- @typescript-eslint/no-unused-vars: ${totalVars}`);
console.log(`- @typescript-eslint/no-require-imports: ${totalRequire}`);
console.log(`- prefer-const: ${totalConst}`);
