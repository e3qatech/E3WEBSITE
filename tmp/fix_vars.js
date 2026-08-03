const fs = require('fs');
const path = require('path');
const report = JSON.parse(fs.readFileSync('A:\\.gemini\\antigravity\\scratch\\E3 WEBSITE\\e3-qatar\\tmp\\eslint_report_combined.json', 'utf8'));

let fixes = 0;

for (const file of report) {
  let lines = null;
  const filePath = file.filePath;
  if (!fs.existsSync(filePath)) continue;

  let modified = false;

  for (const msg of file.messages) {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      if (!lines) lines = fs.readFileSync(filePath, 'utf8').split('\n');
      
      const lineIdx = msg.line - 1;
      let lineStr = lines[lineIdx];
      if (!lineStr) continue;

      const match = msg.message.match(/'([^']+)'/);
      if (!match) continue;
      const varName = match[1];

      // Fix 1: unused catch params: catch (e) or catch (err) or catch (error)
      if ((varName === 'e' || varName === 'err' || varName === 'error') && lineStr.includes(`catch (${varName})`)) {
        lines[lineIdx] = lineStr.replace(`catch (${varName})`, 'catch');
        modified = true;
        fixes++;
      }
      else if ((varName === 'e' || varName === 'err' || varName === 'error') && lineStr.includes(`catch (${varName}: any)`)) {
        lines[lineIdx] = lineStr.replace(`catch (${varName}: any)`, 'catch');
        modified = true;
        fixes++;
      }

      // Fix 2: isRTL from useLocale
      else if (varName === 'isRTL' && lineStr.includes('isRTL')) {
        // e.g. const { isRTL } = useLocale();
        if (lineStr.match(/const\s*{\s*isRTL\s*}\s*=/)) {
          lines[lineIdx] = lineStr.replace(/const\s*{\s*isRTL\s*}\s*=/, 'const {} =');
          modified = true;
          fixes++;
        }
        else if (lineStr.match(/,\s*isRTL/)) {
          lines[lineIdx] = lineStr.replace(/,\s*isRTL/, '');
          modified = true;
          fixes++;
        }
        else if (lineStr.match(/isRTL\s*,/)) {
          lines[lineIdx] = lineStr.replace(/isRTL\s*,/, '');
          modified = true;
          fixes++;
        }
      }

      // Fix 3: unused state vars: const [mounted, setMounted]
      else if (varName === 'mounted' && lineStr.includes('[mounted, setMounted]')) {
        lines[lineIdx] = lineStr.replace('[mounted, setMounted]', '[, setMounted]');
        modified = true;
        fixes++;
      }
      else if (varName === 'loading' && lineStr.includes('[loading, setLoading]')) {
        lines[lineIdx] = lineStr.replace('[loading, setLoading]', '[, setLoading]');
        modified = true;
        fixes++;
      }
      else if (varName === 'error' && lineStr.includes('[error, setError]')) {
        lines[lineIdx] = lineStr.replace('[error, setError]', '[, setError]');
        modified = true;
        fixes++;
      }
      else if (varName === 'theme' && lineStr.includes('[theme, setTheme]')) {
        lines[lineIdx] = lineStr.replace('[theme, setTheme]', '[, setTheme]');
        modified = true;
        fixes++;
      }
      else if (varName === 'isAr' && lineStr.includes('[isAr, setIsAr]')) {
        lines[lineIdx] = lineStr.replace('[isAr, setIsAr]', '[, setIsAr]');
        modified = true;
        fixes++;
      }
      
      // Fix 4: destructured Next.js params: const { params } = props;
      else if (varName === 'params' && lineStr.includes('params')) {
        if (lineStr.match(/const\s*{\s*params\s*}\s*=\s*(?:props|{.*})?;?/)) {
           // careful not to break other destructures
        }
      }
      
      // Fix 5: e from events: (e) =>
      else if (varName === 'e' && (lineStr.includes('(e)') || lineStr.includes('(e:'))) {
        // We will just rename it to _e to allow TS to ignore it if configured, or just leave it for manual
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Fixed in ${filePath}`);
  }
}

console.log(`Auto-fixed ${fixes} simple variables`);
