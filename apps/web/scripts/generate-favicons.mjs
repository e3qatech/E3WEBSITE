import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(webDir, 'public');
const appDir = path.resolve(webDir, 'src/app');

// 1. Vector SVG definition of the official E3 Logo Mark
// Bounding box of the E3 mark: x ~ 8.4 to 112.3 (~104 width), y ~ 35.4 to 108 (~73 height)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="e3-brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b403f4"/>
      <stop offset="50%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#26c2bf"/>
    </linearGradient>
    <filter id="subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#7c3aed" flood-opacity="0.35"/>
    </filter>
  </defs>
  
  <!-- Subtle dark squircle base for universal legibility across both white and dark search results/browser tabs -->
  <rect width="128" height="128" rx="28" fill="#090d16" />
  <rect width="124" height="124" x="2" y="2" rx="26" stroke="url(#e3-brand-gradient)" stroke-width="2" stroke-opacity="0.4" fill="none" />
  
  <!-- Centered E3 Emblem Vector -->
  <g transform="translate(13, 27) scale(0.98)" filter="url(#subtle-glow)">
    <!-- 3 & Upper Bar -->
    <path fill="url(#e3-brand-gradient)" d="M106.56,35.42c-4.91,7.1-9.15,13.24-13.77,19.92,1.9.89,3.26,1.52,4.61,2.17,11.41,5.45,17.06,17.74,14.2,30.86-2.41,11.07-13.56,19.65-25.68,19.76-12.49.11-23.51-8.28-26.21-20.24-.47-2.08-2.55-5.11,1.24-6.37,4.53-1.5,8.13.1,9.3,3.77,2.77,8.64,10.11,13.36,18.36,11.8,8.11-1.53,13.42-8.72,12.73-17.24-.65-8.17-7.53-14.12-16.51-14.26-3.72-.06-7.45,0-12.48,0,4.64-6.77,8.57-12.52,13.05-19.05-2.37-.24-4.09-.56-5.81-.57-21.86-.03-43.73-.08-65.59.07-3.94.03-5.66-.87-5.57-5.22.08-4.05.82-5.86,5.47-5.82,29.1.21,58.2.11,87.3.13,1.36,0,2.72.14,5.37.29Z" transform="translate(-8.4, -35.4)"/>
    <!-- E Lower Loop -->
    <path fill="url(#e3-brand-gradient)" d="M30.49,108.05c-5.82,0-11.65-.12-17.47.05-3.18.09-4.55-.94-4.51-4.3.14-10.7.11-21.41.02-32.11-.02-2.99,1.02-4.18,4.13-4.15,11.96.13,23.93.19,35.89-.03,4.31-.08,4.36,2.28,4.33,5.39-.03,3.17.22,5.92-4.45,5.76-8.02-.28-16.06.07-24.08-.17-3.79-.11-5.09,1.24-4.8,4.94.26,3.29.16,6.61.04,9.91-.11,2.87,1.14,3.85,3.94,3.81,8.34-.11,16.69.16,25.03-.11,4.33-.14,4.36,2.22,4.31,5.34-.05,3.15.29,5.98-4.44,5.73-5.96-.32-11.96-.08-17.94-.08v.02Z" transform="translate(-8.4, -35.4)"/>
  </g>
</svg>`;

async function generate() {
  console.log('--- Generating Brand Favicon Assets ---');

  // 1. Write SVG favicons
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
  console.log('✓ Created public/favicon.svg and public/icon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate PNG resolutions:
  // - 16x16, 32x32 (standard legacy browser tabs)
  // - 48x48 (Google search desktop requirement)
  // - 96x96 (Google search high-DPI requirement)
  // - 144x144, 192x192 (Google mobile & Android Chrome)
  // - 180x180 (Apple touch icon)
  // - 512x512 (PWA & high-res search)
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-144x144.png', size: 144 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-precomposed.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'logo.png', size: 512 },
  ];

  const pngBuffers = {};

  for (const { name, size } of sizes) {
    const buf = await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, name), buf);
    pngBuffers[size] = buf;
    console.log(`✓ Generated public/${name} (${size}x${size})`);
  }

  // Generate 1200x630 OpenGraph social share card
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="og-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#b403f4"/>
        <stop offset="50%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#26c2bf"/>
      </linearGradient>
      <radialGradient id="og-glow-1" cx="30%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#090d16" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="og-glow-2" cx="70%" cy="60%" r="50%">
        <stop offset="0%" stop-color="#26c2bf" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#090d16" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- Background -->
    <rect width="1200" height="630" fill="#080b12" />
    <rect width="1200" height="630" fill="url(#og-glow-1)" />
    <rect width="1200" height="630" fill="url(#og-glow-2)" />
    
    <!-- Outer Card Border -->
    <rect x="40" y="40" width="1120" height="550" rx="32" fill="#090d16" fill-opacity="0.6" stroke="url(#og-grad)" stroke-width="2" stroke-opacity="0.3" />
    
    <!-- Centered Brand Content -->
    <g transform="translate(180, 215)">
      <!-- Logo Squircle -->
      <rect width="200" height="200" rx="44" fill="#0c1222" stroke="url(#og-grad)" stroke-width="3" stroke-opacity="0.6" />
      <g transform="translate(20, 42) scale(1.5)">
        <path fill="url(#og-grad)" d="M106.56,35.42c-4.91,7.1-9.15,13.24-13.77,19.92,1.9.89,3.26,1.52,4.61,2.17,11.41,5.45,17.06,17.74,14.2,30.86-2.41,11.07-13.56,19.65-25.68,19.76-12.49.11-23.51-8.28-26.21-20.24-.47-2.08-2.55-5.11,1.24-6.37,4.53-1.5,8.13.1,9.3,3.77,2.77,8.64,10.11,13.36,18.36,11.8,8.11-1.53,13.42-8.72,12.73-17.24-.65-8.17-7.53-14.12-16.51-14.26-3.72-.06-7.45,0-12.48,0,4.64-6.77,8.57-12.52,13.05-19.05-2.37-.24-4.09-.56-5.81-.57-21.86-.03-43.73-.08-65.59.07-3.94.03-5.66-.87-5.57-5.22.08-4.05.82-5.86,5.47-5.82,29.1.21,58.2.11,87.3.13,1.36,0,2.72.14,5.37.29Z" transform="translate(-8.4, -35.4)"/>
        <path fill="url(#og-grad)" d="M30.49,108.05c-5.82,0-11.65-.12-17.47.05-3.18.09-4.55-.94-4.51-4.3.14-10.7.11-21.41.02-32.11-.02-2.99,1.02-4.18,4.13-4.15,11.96.13,23.93.19,35.89-.03,4.31-.08,4.36,2.28,4.33,5.39-.03,3.17.22,5.92-4.45,5.76-8.02-.28-16.06.07-24.08-.17-3.79-.11-5.09,1.24-4.8,4.94.26,3.29.16,6.61.04,9.91-.11,2.87,1.14,3.85,3.94,3.81,8.34-.11,16.69.16,25.03-.11,4.33-.14,4.36,2.22,4.31,5.34-.05,3.15.29,5.98-4.44,5.73-5.96-.32-11.96-.08-17.94-.08v.02Z" transform="translate(-8.4, -35.4)"/>
      </g>
      
      <!-- Brand Typography -->
      <text x="250" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="64" letter-spacing="4">E3 QATAR</text>
      <text x="252" y="130" fill="#26c2bf" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="24" letter-spacing="6">EVENT ENGINEERING EXPERTS</text>
      <text x="252" y="170" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="18" letter-spacing="1">Live Activations • Cultural Festivals • Brand Experiences</text>
    </g>
  </svg>`;

  const ogBuf = await sharp(Buffer.from(ogSvg))
    .jpeg({ quality: 92 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'og-image-default.jpg'), ogBuf);
  console.log(`✓ Generated public/og-image-default.jpg (1200x630, ${ogBuf.length} bytes)`);

  // 3. Generate standard ICO file (containing 16x16, 32x32, and 48x48 PNG frames)
  // ICO file format: Header (6 bytes) + Directory entries (16 bytes each) + Image data
  const icoSizes = [16, 32, 48];
  const count = icoSizes.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // Count of images

  const dirEntries = [];
  const imageBuffers = [];

  for (const size of icoSizes) {
    const imgBuf = pngBuffers[size];
    imageBuffers.push(imgBuf);

    const dir = Buffer.alloc(16);
    dir.writeUInt8(size === 256 ? 0 : size, 0); // Width
    dir.writeUInt8(size === 256 ? 0 : size, 1); // Height
    dir.writeUInt8(0, 2); // Color palette
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Color planes
    dir.writeUInt16LE(32, 6); // Bits per pixel
    dir.writeUInt32LE(imgBuf.length, 8); // Image size in bytes
    dir.writeUInt32LE(offset, 12); // Offset of image data
    dirEntries.push(dir);

    offset += imgBuf.length;
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...imageBuffers]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log(`✓ Generated public/favicon.ico (Multi-frame 16x16, 32x32, 48x48, ${icoBuffer.length} bytes)`);

  // 4. Also copy to src/app for Next.js App Router metadata conventions
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  fs.copyFileSync(path.join(publicDir, 'favicon-48x48.png'), path.join(appDir, 'icon.png'));
  fs.copyFileSync(path.join(publicDir, 'apple-touch-icon.png'), path.join(appDir, 'apple-icon.png'));
  console.log('✓ Copied favicon.ico, icon.png, and apple-icon.png to src/app/');

  // 5. Generate site.webmanifest for PWA, Android, and Google Search Rich Identity
  const manifest = {
    name: "E3 - Event Engineering Experts",
    short_name: "E3 Qatar",
    description: "Qatar's premier event engineering and entertainment agency.",
    start_url: "/",
    display: "standalone",
    background_color: "#090d16",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('✓ Generated public/site.webmanifest and public/manifest.json');

  console.log('==============================================');
  console.log('>>> ALL FAVICON ASSETS GENERATED SUCCESSFULLY <<<');
  console.log('==============================================');
}

generate().catch(err => {
  console.error('Failed to generate favicons:', err);
  process.exit(1);
});
