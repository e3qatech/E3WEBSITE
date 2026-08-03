const fs = require('fs');
const report = JSON.parse(fs.readFileSync('A:\\.gemini\\antigravity\\scratch\\E3 WEBSITE\\e3-qatar\\tmp\\eslint_report.json', 'utf16le'));

let noUnused = 0;
let noRequire = 0;
let preferConst = 0;

const findings = [];

for (const file of report) {
  for (const msg of file.messages) {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') noUnused++;
    if (msg.ruleId === '@typescript-eslint/no-require-imports') noRequire++;
    if (msg.ruleId === 'prefer-const') preferConst++;
    
    if (['@typescript-eslint/no-unused-vars', '@typescript-eslint/no-require-imports', 'prefer-const'].includes(msg.ruleId)) {
       findings.push(`- **${msg.ruleId}**: ${file.filePath.replace(/.*e3-qatar\\/, '')}:${msg.line}:${msg.column} - ${msg.message}`);
    }
  }
}

console.log(`### Initial Target Counts`);
console.log(`- @typescript-eslint/no-unused-vars: ${noUnused}`);
console.log(`- @typescript-eslint/no-require-imports: ${noRequire}`);
console.log(`- prefer-const: ${preferConst}`);
console.log(`\n### Detailed Findings\n`);
console.log(findings.slice(0, 50).join('\n'));
if (findings.length > 50) console.log(`... and ${findings.length - 50} more findings.`);
