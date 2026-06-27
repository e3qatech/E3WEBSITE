const fs = require('fs');
const path = require('path');

// A simple AST/Regex hybrid approach for converting directional Tailwind classes to logical properties
// In a real production setup, one might use an AST parser like SWC or Babel, but a well-tested regex is sufficient here.

const TARGET_DIR = path.join(__dirname, '../apps/web/src');

// Map of physical directional classes to logical classes
const classMap = {
  // Margin
  'ml-': 'ms-',
  'mr-': 'me-',
  '-ml-': '-ms-',
  '-mr-': '-me-',
  // Padding
  'pl-': 'ps-',
  'pr-': 'pe-',
  // Text alignment
  'text-left': 'text-start',
  'text-right': 'text-end',
  // Borders
  'border-l': 'border-s',
  'border-r': 'border-e',
  'border-l-': 'border-s-',
  'border-r-': 'border-e-',
  'rounded-l': 'rounded-s',
  'rounded-r': 'rounded-e',
  'rounded-tl': 'rounded-ss',
  'rounded-tr': 'rounded-se',
  'rounded-bl': 'rounded-es',
  'rounded-br': 'rounded-ee',
  // Positioning
  'left-': 'start-',
  'right-': 'end-',
  '-left-': '-start-',
  '-right-': '-end-',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // We need to carefully replace class names within strings (className="")
  // This is a naive regex approach.
  Object.keys(classMap).forEach((physical) => {
    const logical = classMap[physical];
    
    // We look for boundaries around the class name
    // e.g. " ml-4 " or `"ml-4"` or `'ml-4'` or `ml-4:` (responsive prefix would be handled differently)
    // To handle responsive prefixes like md:ml-4, we use a regex that looks for the exact class
    
    // Regex explanation:
    // (?<=['"\s:])  - Lookbehind for quote, space, or colon (responsive prefix)
    // physical      - The class prefix (e.g. ml-)
    // (?=[0-9a-zA-Z\-\[\]]|['"\s]) - Lookahead for numbers, letters, brackets (for arbitrary values like ml-[10px]), or quotes/spaces
    
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const regex = new RegExp(`(?<=['"\\s:]|^)(${escapeRegExp(physical)})(?=[0-9a-zA-Z\\-\\[\\]]|['"\\s]|$)`, 'g');
    
    if (regex.test(content)) {
      content = content.replace(regex, logical);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath.replace(TARGET_DIR, '')}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(tsx|ts|jsx|js)$/.test(file)) {
      processFile(fullPath);
    }
  });
}

console.log('Starting Tailwind Logical Properties Conversion...');
walkDir(TARGET_DIR);
console.log('Conversion Complete.');
