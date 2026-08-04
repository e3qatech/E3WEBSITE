import { defineConfig, globalIgnores } from 'eslint/config'
import nextTs from 'eslint-config-next/typescript'
import nextVitals from 'eslint-config-next/core-web-vitals'

/**
 * packages/ui ESLint configuration.
 *
 * This package contains React UI source (src/index.ts — currently empty but typed as React).
 * Uses Core Web Vitals + TypeScript presets matching apps/web,
 * which enables React Hooks rules appropriate for shared React components.
 * Next.js page-specific rules (@next/next/*) are included but will only trigger
 * on Next.js-specific patterns, which are not expected in this shared component library.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    'node_modules/**',
    'dist/**',
  ]),
])
