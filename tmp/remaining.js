const fs = require('fs');
const report = JSON.parse(fs.readFileSync('A:\\.gemini\\antigravity\\scratch\\E3 WEBSITE\\e3-qatar\\tmp\\eslint_report_combined.json', 'utf8'));

const out = [];
for (const file of report) {
  const rel = file.filePath.split('e3-qatar\\')[1].replace(/\\/g, '/');
  for (const msg of file.messages) {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      out.push(`${rel}:${msg.line}:${msg.column} - ${msg.message}`);
    }
  }
}
fs.writeFileSync('A:\\.gemini\\antigravity\\scratch\\E3 WEBSITE\\e3-qatar\\tmp\\remaining.md', out.join('\n'));
