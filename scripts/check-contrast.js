const fs = require('fs');
const path = require('path');

// Extract colors from globals.css
const cssPath = path.join(__dirname, '../apps/web/src/app/globals.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Helper to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
function getLuminance(r, g, b) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Calculate contrast ratio
function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (lightest + 0.05) / (darkest + 0.05);
}

// Very basic extraction of hex variables
const colors = {};
const regex = /--([a-zA-Z0-9-]+):\s*(#[a-fA-F0-9]{6});/g;
let match;
while ((match = regex.exec(cssContent)) !== null) {
  colors[match[1]] = match[2];
}

console.log("WCAG 2.1 AA Color Contrast Checker");
console.log("----------------------------------");

// Define combinations to check (Text vs Background)
const combinations = [
  { text: 'text-primary', bg: 'bg-level-1' },
  { text: 'text-secondary', bg: 'bg-level-1' },
  { text: 'text-primary', bg: 'surface-default' },
  { text: 'color-primary', bg: 'surface-default' },
];

let failed = 0;

combinations.forEach(combo => {
  const textHex = colors[combo.text];
  const bgHex = colors[combo.bg];
  
  if (!textHex || !bgHex) {
    console.log(`Skipping ${combo.text} on ${combo.bg} (Not found as hex)`);
    return;
  }

  const textRgb = hexToRgb(textHex);
  const bgRgb = hexToRgb(bgHex);
  
  const ratio = getContrastRatio(textRgb, bgRgb).toFixed(2);
  
  // Normal text requires 4.5:1, Large text 3:1
  const passNormal = ratio >= 4.5;
  const passLarge = ratio >= 3.0;

  console.log(`[${combo.text}] on [${combo.bg}]`);
  console.log(`Ratio: ${ratio}:1`);
  console.log(`Normal Text: ${passNormal ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Large Text:  ${passLarge ? '✅ PASS' : '❌ FAIL'}`);
  console.log('---');
  
  if (!passNormal) failed++;
});

if (failed > 0) {
  console.error(`\nFound ${failed} WCAG AA violations.`);
  process.exit(1);
} else {
  console.log('\nAll checked combinations pass WCAG AA standards!');
}
