const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const searchExts = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];
const searchPaths = [
  path.join(projectRoot, 'apps', 'web', 'src'),
  path.join(projectRoot, 'apps', 'web'), // to catch server.js, etc.
  path.join(projectRoot, 'packages')
];

let filesModified = 0;
let linesRemoved = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'tmp') {
        scanDir(fullPath);
      }
    } else if (searchExts.some(ext => entry.name.endsWith(ext))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      const newLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '// eslint-disable-next-line @typescript-eslint/no-unused-vars' || 
            line.trim() === '// eslint-disable-next-line @typescript-eslint/no-require-imports') {
          linesRemoved++;
          modified = true;
          // Skip this line
        } else {
          newLines.push(line);
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, newLines.join('\n'));
        filesModified++;
      }
    }
  }
}

for (const p of searchPaths) {
  if (fs.existsSync(p)) {
    // Avoid double scanning apps/web/src by only scanning apps/web non-recursively for the root files?
    // Actually, simple dedup
  }
}

const scanned = new Set();
function runScan(dir) {
  if (scanned.has(dir)) return;
  scanned.add(dir);
  scanDir(dir);
}

runScan(path.join(projectRoot, 'apps', 'web', 'src'));
runScan(path.join(projectRoot, 'apps', 'web')); // Will rescan src, but that's fine, it will just not find any more.
runScan(path.join(projectRoot, 'packages'));

console.log(`Files modified: ${filesModified}`);
console.log(`Suppressions removed: ${linesRemoved}`);
