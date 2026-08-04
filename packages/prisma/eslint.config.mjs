import { defineConfig, globalIgnores } from 'eslint/config'
import nextTs from 'eslint-config-next/typescript'

/**
 * packages/prisma ESLint configuration.
 *
 * This package contains one hand-written seed script (src/seed.ts).
 * No generated Prisma client is linted — node_modules contains the generated output.
 *
 * Uses the TypeScript preset from eslint-config-next/typescript
 * which provides @typescript-eslint rules appropriate for TS source.
 * No Next.js page rules or React rules are loaded because this package
 * has no JSX or Next.js App Router pages.
 */
export default defineConfig([
  ...nextTs,
  globalIgnores([
    'node_modules/**',
    'dist/**',
    'prisma/generated/**',
  ]),
])
