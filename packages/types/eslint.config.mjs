import { defineConfig, globalIgnores } from 'eslint/config'
import nextTs from 'eslint-config-next/typescript'

/**
 * packages/types ESLint configuration.
 *
 * This package contains one hand-written type stub (src/index.ts — currently empty).
 * Uses @typescript-eslint rules via nextTs preset.
 * No Next.js page rules or React rules are loaded.
 */
export default defineConfig([
  ...nextTs,
  globalIgnores([
    'node_modules/**',
    'dist/**',
  ]),
])
