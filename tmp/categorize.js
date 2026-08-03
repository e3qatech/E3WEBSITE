const fs = require('fs');
const report = JSON.parse(fs.readFileSync('A:\\.gemini\\antigravity\\scratch\\E3 WEBSITE\\e3-qatar\\tmp\\eslint_report_combined.json', 'utf8'));

let imports = 0;
let locals = 0;
let params = 0;
let requires = [];

for (const file of report) {
  for (const msg of file.messages) {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      if (msg.message.includes('is assigned a value but never used')) locals++;
      else if (msg.message.includes('is defined but never used')) imports++; // Could also be locals, but usually it's variables/imports
      else params++; 
      // Actually eslint's msg for no-unused-vars varies. Let's just group by exact message type.
    }
    if (msg.ruleId === '@typescript-eslint/no-require-imports') {
      requires.push({ file: file.filePath, msg: msg.message, line: msg.line });
    }
  }
}

const msgCounts = {};
for (const file of report) {
  for (const msg of file.messages) {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      let key = msg.message;
      if (key.startsWith("'")) {
         key = key.replace(/'[^']+'/, "'VAR'");
      }
      msgCounts[key] = (msgCounts[key] || 0) + 1;
    }
  }
}

console.log("Message Types:", msgCounts);
console.log("Requires:", requires);
