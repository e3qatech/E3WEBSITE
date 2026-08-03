const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'eslint_report_combined.json'), 'utf8'));

let filesFixed = 0;
let varsFixed = 0;

for (const file of report) {
  const unusedVars = file.messages.filter(m => m.ruleId === '@typescript-eslint/no-unused-vars');
  if (unusedVars.length === 0) continue;

  const filePath = file.filePath;
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');

  // Sort messages descending by line and column so we don't mess up earlier offsets
  unusedVars.sort((a, b) => {
    if (a.line !== b.line) return b.line - a.line;
    return b.column - a.column;
  });

  let fileModified = false;

  for (const msg of unusedVars) {
    if (msg.line !== msg.endLine) continue; // Skip multiline for safety

    const lineIdx = msg.line - 1;
    const line = lines[lineIdx];
    
    // We get the exact string that ESLint flagged
    const flaggedText = line.substring(msg.column - 1, msg.endColumn - 1);
    
    // Try to safely remove or replace it
    let newLine = line;

    // Is it in a destructuring pattern like `{ isRTL }` or `{ foo, isRTL, bar }`?
    // Let's check if the text is surrounded by { } or , or :
    if (line.includes(`{ ${flaggedText} }`)) {
      newLine = line.replace(`{ ${flaggedText} }`, `{}`);
    } else if (line.includes(` ${flaggedText},`)) {
      newLine = line.replace(` ${flaggedText},`, ``);
    } else if (line.includes(`, ${flaggedText} `)) {
      newLine = line.replace(`, ${flaggedText} `, ` `);
    } else if (line.includes(`, ${flaggedText}}`)) {
      newLine = line.replace(`, ${flaggedText}}`, `}`);
    } else if (line.includes(`{ ${flaggedText},`)) {
      newLine = line.replace(`{ ${flaggedText},`, `{`);
    } else if (line.includes(`{${flaggedText}}`)) {
      newLine = line.replace(`{${flaggedText}}`, `{}`);
    } else if (line.includes(`const ${flaggedText} =`)) {
      // It's a simple const var declaration. Remove the whole line?
      newLine = `// REMOVED ${flaggedText}`;
    } else if (line.includes(`catch (${flaggedText})`)) {
      newLine = line.replace(`catch (${flaggedText})`, `catch`);
    } else if (line.includes(`catch(${flaggedText})`)) {
      newLine = line.replace(`catch(${flaggedText})`, `catch`);
    } else if (line.includes(`(${flaggedText}, `)) {
      // Param like (item, i) where item is unused
      newLine = line.replace(`(${flaggedText}, `, `(_${flaggedText}, `);
    } else if (line.includes(`, ${flaggedText})`)) {
      // Param like (item, i) where i is unused
      newLine = line.replace(`, ${flaggedText})`, `)`);
    } else if (line.includes(`...${flaggedText} }`)) {
      // rest param
      newLine = line.replace(`...${flaggedText} }`, `..._${flaggedText} }`);
    } else {
      // Just prefix it with _ to satisfy TS
      const before = line.substring(0, msg.column - 1);
      const after = line.substring(msg.endColumn - 1);
      newLine = before + `_${flaggedText}` + after;
    }

    if (newLine === `// REMOVED ${flaggedText}`) {
       // if it's the only thing on the line, we can clear it.
       // actually, let's just clear the line if there's no await or anything.
       if (!line.includes('await') && !line.includes('use')) {
           lines[lineIdx] = '';
           fileModified = true;
           varsFixed++;
       } else {
           // We'll leave it but just use the function
           // E.g. `const foo = useBar();` -> `useBar();`
           lines[lineIdx] = line.replace(`const ${flaggedText} = `, '');
           fileModified = true;
           varsFixed++;
       }
    } else if (newLine !== line) {
      lines[lineIdx] = newLine;
      fileModified = true;
      varsFixed++;
    } else {
      console.log(`Could not automatically fix ${flaggedText} in ${filePath}:${msg.line}`);
    }
  }

  if (fileModified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    filesFixed++;
  }
}

console.log(`Fixed ${varsFixed} variables in ${filesFixed} files.`);
