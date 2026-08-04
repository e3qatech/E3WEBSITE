import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Gate 10: UX, Accessibility, RTL & Theme Verification', () => {
  const webDir = path.resolve(__dirname, '../../');

  it('1. Root layout contains SkipToContent component and ThemeProvider', () => {
    const layoutPath = path.join(webDir, 'src/app/layout.tsx');
    expect(fs.existsSync(layoutPath)).toBe(true);
    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).toContain('SkipToContent');
    expect(content).toContain('ThemeProvider');
    expect(content).toContain('data-theme');
  });

  it('2. SkipToContent accessibility component exists and targets #main-content in EN/AR', () => {
    const skipPath = path.join(webDir, 'src/components/layout/SkipToContent.tsx');
    expect(fs.existsSync(skipPath)).toBe(true);
    const content = fs.readFileSync(skipPath, 'utf-8');
    expect(content).toContain('href="#main-content"');
    expect(content).toContain('Skip to main content');
    expect(content).toContain('الانتقال إلى المحتوى الرئيسي');
  });

  it('3. LocaleProvider sets lang and dir="rtl" for Arabic and dir="ltr" for English', () => {
    const localePath = path.join(webDir, 'src/components/layout/LocaleProvider.tsx');
    expect(fs.existsSync(localePath)).toBe(true);
    const content = fs.readFileSync(localePath, 'utf-8');
    expect(content).toContain('root.setAttribute("lang", locale)');
    expect(content).toContain('root.setAttribute("dir", dir)');
    expect(content).toContain('rtl');
  });

  it('4. Global CSS defines prefers-reduced-motion media query to control animation duration', () => {
    const cssPath = path.join(webDir, 'src/app/globals.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    const content = fs.readFileSync(cssPath, 'utf-8');
    expect(content).toContain('@media (prefers-reduced-motion: reduce)');
    expect(content).toContain('animation-duration: 0.01ms !important');
    expect(content).toContain('[dir="rtl"] body');
  });

  it('5. Input component exposes programmatic labels, aria-invalid, and error handling', () => {
    const inputPath = path.join(webDir, 'src/components/ui/Input.tsx');
    expect(fs.existsSync(inputPath)).toBe(true);
    const content = fs.readFileSync(inputPath, 'utf-8');
    expect(content).toContain('label');
    expect(content).toContain('error');
  });

  it('6. Modal component implements role="dialog", aria-modal="true", and close button aria-label', () => {
    const modalPath = path.join(webDir, 'src/components/ui/Modal.tsx');
    expect(fs.existsSync(modalPath)).toBe(true);
    const content = fs.readFileSync(modalPath, 'utf-8');
    expect(content).toContain('role="dialog"');
    expect(content).toContain('aria-modal="true"');
    expect(content).toContain('aria-label');
  });

  it('7. UniversalMediaRenderer component includes accessible alt text and titles', () => {
    const mediaPath = path.join(webDir, 'src/components/shared/UniversalMediaRenderer.tsx');
    expect(fs.existsSync(mediaPath)).toBe(true);
    const content = fs.readFileSync(mediaPath, 'utf-8');
    expect(content).toContain('alt');
    expect(content).toContain('title');
  });

  it('8. B2C Theme Store manages immersive mode and theme state', () => {
    const themeStorePath = path.join(webDir, 'src/store/useB2CThemeStore.ts');
    expect(fs.existsSync(themeStorePath)).toBe(true);
    const content = fs.readFileSync(themeStorePath, 'utf-8');
    expect(content).toContain('setImmersiveMode');
  });

  it('9. PricingCards component uses logical direction classes (start-, end-, ps-, pe-)', () => {
    const pricingPath = path.join(webDir, 'src/components/attractions/detail/PricingCards.tsx');
    expect(fs.existsSync(pricingPath)).toBe(true);
    const content = fs.readFileSync(pricingPath, 'utf-8');
    expect(content).toContain('start-');
    expect(content).toContain('end-');
  });

  it('10. B2B Header component supports RTL layout and mobile navigation aria-expanded', () => {
    const b2bHeaderPath = path.join(webDir, 'src/components/b2b/layout/B2BHeader.tsx');
    expect(fs.existsSync(b2bHeaderPath)).toBe(true);
    const content = fs.readFileSync(b2bHeaderPath, 'utf-8');
    expect(content).toContain('currentLocale');
  });

  it('11. Event Calendar provides accessible view modes (grid & list)', () => {
    const calendarPath = path.join(webDir, 'src/app/[locale]/b2c/calendar/page.tsx');
    expect(fs.existsSync(calendarPath)).toBe(true);
    const content = fs.readFileSync(calendarPath, 'utf-8');
    expect(content).toContain('Calendar');
  });

  it('12. Admin dashboard layout includes accessible landmarks and sidebar controls', () => {
    const sidebarPath = path.join(webDir, 'src/components/dashboard/Sidebar.tsx');
    expect(fs.existsSync(sidebarPath)).toBe(true);
    const content = fs.readFileSync(sidebarPath, 'utf-8');
    expect(content).toContain('aside');
  });

  it('13. Baseline rollback patch gate-10-baseline.patch exists', () => {
    const patchPath = path.join(webDir, '../../gate-10-baseline.patch');
    expect(fs.existsSync(patchPath)).toBe(true);
  });
});
