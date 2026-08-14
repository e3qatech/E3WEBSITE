const fs = require('fs');
const path = require('path');

const DASHBOARD_DIR = path.join(__dirname, '..', 'apps', 'web', 'src', 'app', '[locale]', 'dashboard');
const SRC_DIR = path.join(__dirname, '..', 'apps', 'web', 'src');

function getAllPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllPageFiles(fullPath, fileList);
    } else if (file === 'page.tsx') {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function checkContent(filePath, visited = new Set()) {
  if (visited.has(filePath)) return { hasShell: false, hasHeader: false };
  visited.add(filePath);

  if (!fs.existsSync(filePath)) return { hasShell: false, hasHeader: false };

  const content = fs.readFileSync(filePath, 'utf8');

  // Check if it redirects
  if (content.includes('redirect(') && (content.split('\n').length < 20 || !content.includes('return'))) {
    return { isRedirect: true, hasShell: true, hasHeader: true };
  }

  const hasShell = content.includes('DashboardPageShell') || content.includes('AdminLayout');
  const hasHeader = content.includes('DashboardPageHeader') || content.includes('AdminHeader');

  if (hasShell && hasHeader) {
    return { hasShell: true, hasHeader: true };
  }

  // Find imported components
  const importMatches = [...content.matchAll(/import\s+(?:\{[^}]+\}|\w+)\s+from\s+['"]([^'"]+)['"]/g)];
  let subShell = hasShell;
  let subHeader = hasHeader;

  for (const match of importMatches) {
    const importPath = match[1];
    let resolvedPath = null;

    if (importPath.startsWith('@/')) {
      resolvedPath = path.join(SRC_DIR, importPath.slice(2));
    } else if (importPath.startsWith('.')) {
      resolvedPath = path.resolve(path.dirname(filePath), importPath);
    }

    if (resolvedPath) {
      for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
        const p = resolvedPath + ext;
        if (fs.existsSync(p)) {
          const subRes = checkContent(p, visited);
          if (subRes.hasShell) subShell = true;
          if (subRes.hasHeader) subHeader = true;
          break;
        }
      }
    }
  }

  return { hasShell: subShell, hasHeader: subHeader };
}

const pageFiles = getAllPageFiles(DASHBOARD_DIR);
console.log(`Found ${pageFiles.length} dashboard page.tsx files:\n`);

let missingCount = 0;

for (const pageFile of pageFiles) {
  const relPath = path.relative(DASHBOARD_DIR, pageFile);
  if (relPath === 'page.tsx') {
    console.log(`[PASS] (Home Root) ${relPath}`);
    continue;
  }

  const result = checkContent(pageFile);
  if (result.isRedirect) {
    console.log(`[PASS] (Redirect) ${relPath}`);
  } else if (result.hasShell && result.hasHeader) {
    console.log(`[PASS] ${relPath}`);
  } else {
    console.log(`[FAIL] ${relPath} - hasShell: ${result.hasShell}, hasHeader: ${result.hasHeader}`);
    missingCount++;
  }
}

console.log(`\nAudit Complete: ${pageFiles.length - 1 - missingCount}/${pageFiles.length - 1} non-home routes standardized.`);
if (missingCount > 0) {
  process.exit(1);
}
