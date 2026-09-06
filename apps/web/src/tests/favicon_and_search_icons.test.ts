import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Favicon and Search Engine Result Icon Audit', () => {
  const publicDir = path.resolve(__dirname, '../../public');
  const appDir = path.resolve(__dirname, '../app');

  it('1. Standard /favicon.ico exists and contains valid ICO header', () => {
    const icoPath = path.join(publicDir, 'favicon.ico');
    expect(fs.existsSync(icoPath)).toBe(true);

    const buf = fs.readFileSync(icoPath);
    expect(buf.length).toBeGreaterThan(1000);
    // Reserved = 0, Type = 1 (ICO)
    expect(buf.readUInt16LE(0)).toBe(0);
    expect(buf.readUInt16LE(2)).toBe(1);
    // Contains multiple resolutions (at least 3: 16, 32, 48)
    const imageCount = buf.readUInt16LE(4);
    expect(imageCount).toBeGreaterThanOrEqual(3);
  });

  it('2. Google Search 48px multiple requirements are met', () => {
    // Google strictly requires a multiple of 48px square (e.g. 48x48, 96x96, 144x144, 192x192)
    const icon48 = path.join(publicDir, 'favicon-48x48.png');
    const icon96 = path.join(publicDir, 'favicon-96x96.png');
    const icon192 = path.join(publicDir, 'favicon-192x192.png');

    expect(fs.existsSync(icon48)).toBe(true);
    expect(fs.existsSync(icon96)).toBe(true);
    expect(fs.existsSync(icon192)).toBe(true);

    // Verify PNG header and dimensions
    const buf48 = fs.readFileSync(icon48);
    expect(buf48.readUInt32BE(16)).toBe(48);
    expect(buf48.readUInt32BE(20)).toBe(48);

    const buf96 = fs.readFileSync(icon96);
    expect(buf96.readUInt32BE(16)).toBe(96);
    expect(buf96.readUInt32BE(20)).toBe(96);

    const buf192 = fs.readFileSync(icon192);
    expect(buf192.readUInt32BE(16)).toBe(192);
    expect(buf192.readUInt32BE(20)).toBe(192);
  });

  it('3. Modern scalable SVG favicon is present', () => {
    const svgPath = path.join(publicDir, 'favicon.svg');
    expect(fs.existsSync(svgPath)).toBe(true);

    const content = fs.readFileSync(svgPath, 'utf-8');
    expect(content).toContain('<svg');
    expect(content).toContain('e3-brand-gradient');
  });

  it('4. Apple Touch Icon for iOS Safari is 180x180', () => {
    const appleIcon = path.join(publicDir, 'apple-touch-icon.png');
    expect(fs.existsSync(appleIcon)).toBe(true);

    const buf = fs.readFileSync(appleIcon);
    expect(buf.readUInt32BE(16)).toBe(180);
    expect(buf.readUInt32BE(20)).toBe(180);
  });

  it('5. Web App Manifest and Schema.org Logo are configured', () => {
    const manifestPath = path.join(publicDir, 'site.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.name).toBe('E3 - Event Engineering Experts');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    const logoPath = path.join(publicDir, 'logo.png');
    expect(fs.existsSync(logoPath)).toBe(true);

    const ogPath = path.join(publicDir, 'og-image-default.jpg');
    expect(fs.existsSync(ogPath)).toBe(true);
  });

  it('6. Next.js App Router metadata files exist in src/app', () => {
    expect(fs.existsSync(path.join(appDir, 'favicon.ico'))).toBe(true);
    expect(fs.existsSync(path.join(appDir, 'icon.png'))).toBe(true);
    expect(fs.existsSync(path.join(appDir, 'apple-icon.png'))).toBe(true);
  });
});
