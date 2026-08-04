import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Gate 06: Prisma Database Lifecycle & Safety Audit', () => {
  const webDir = path.resolve(__dirname, '../../');
  const rootDir = path.resolve(__dirname, '../../../../');

  it('1. Authoritative schema is apps/web/prisma/schema.prisma', () => {
    const webSchemaPath = path.join(webDir, 'prisma/schema.prisma');
    expect(fs.existsSync(webSchemaPath)).toBe(true);

    const schemaContent = fs.readFileSync(webSchemaPath, 'utf-8');
    expect(schemaContent).toContain('model User');
    expect(schemaContent).toContain('model Setting');
    expect(schemaContent).toContain('sessionVersion');
  });

  it('2. Build scripts contain ZERO database mutation commands (no db push, no migrate dev)', () => {
    const webPkgPath = path.join(webDir, 'package.json');
    const webPkg = JSON.parse(fs.readFileSync(webPkgPath, 'utf-8'));

    const buildScript = webPkg.scripts?.build || '';
    expect(buildScript).not.toContain('db push');
    expect(buildScript).not.toContain('migrate dev');
    expect(buildScript).not.toContain('migrate reset');
    expect(buildScript).toContain('prisma generate');
  });

  it('3. Codebase package scripts contain ZERO --accept-data-loss flags', () => {
    const rootPkgPath = path.join(rootDir, 'package.json');
    const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));

    const allScripts = JSON.stringify(rootPkg.scripts || {});
    expect(allScripts).not.toContain('--accept-data-loss');
  });

  it('4. Seed script includes explicit Production environment guard', () => {
    const seedPath = path.join(webDir, 'prisma/seed.ts');
    const seedContent = fs.readFileSync(seedPath, 'utf-8');

    expect(seedContent).toContain('[SEED GUARD]');
    expect(seedContent).toContain('process.exit(1)');
  });

  it('5. Packages/prisma package.json does not contain db:push', () => {
    const pkgPrismaPath = path.join(rootDir, 'packages/prisma/package.json');
    if (fs.existsSync(pkgPrismaPath)) {
      const pkgContent = JSON.parse(fs.readFileSync(pkgPrismaPath, 'utf-8'));
      expect(pkgContent.scripts?.['db:push']).toBeUndefined();
    }
  });

  it('6. Database connection singleton uses globalThis reuse in Development', () => {
    const dbModulePath = path.join(webDir, 'src/lib/db.ts');
    const dbContent = fs.readFileSync(dbModulePath, 'utf-8');

    expect(dbContent).toContain('globalThis.prismaGlobal');
    expect(dbContent).toContain("process.env.NODE_ENV !== 'production'");
  });

  it('7. Migration history contains 20260803174500_add_user_session_version', () => {
    const migrationDir = path.join(webDir, 'prisma/migrations/20260803174500_add_user_session_version/migration.sql');
    expect(fs.existsSync(migrationDir)).toBe(true);

    const sql = fs.readFileSync(migrationDir, 'utf-8');
    expect(sql).toContain('ALTER TABLE "User" ADD COLUMN "sessionVersion"');
  });
});
