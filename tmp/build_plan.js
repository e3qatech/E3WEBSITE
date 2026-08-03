const fs = require('fs');
const report = JSON.parse(fs.readFileSync('A:\\.gemini\\antigravity\\scratch\\E3 WEBSITE\\e3-qatar\\tmp\\eslint_report_combined.json', 'utf8'));

let unusedVars = [];
let requires = [];

for (const file of report) {
  for (const msg of file.messages) {
    const relativePath = file.filePath.split('e3-qatar\\')[1].replace(/\\/g, '/');
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      unusedVars.push({ file: relativePath, line: msg.line, msg: msg.message });
    }
    if (msg.ruleId === '@typescript-eslint/no-require-imports') {
      requires.push({ file: relativePath, line: msg.line, msg: msg.message });
    }
  }
}

// Write the plan data to a text file for my own review
fs.writeFileSync('A:\\.gemini\\antigravity\\scratch\\E3 WEBSITE\\e3-qatar\\tmp\\plan_data.txt', JSON.stringify({
  unusedCount: unusedVars.length,
  requireCount: requires.length,
  unusedVars: unusedVars.slice(0, 20), // just sample a few
}, null, 2));

