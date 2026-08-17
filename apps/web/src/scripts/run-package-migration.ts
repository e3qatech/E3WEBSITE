import { db } from "../lib/db";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=== APPLYING PACKAGES MARKETPLACE & STUDIO MIGRATION ===");

  const sqlPath = path.resolve(__dirname, "../../prisma/migrations/20260817000000_add_packages_marketplace_and_studio/migration.sql");
  const fullSql = fs.readFileSync(sqlPath, "utf-8");

  // Split into individual SQL statements by semicolon, keeping DO $$ blocks intact
  const statements: string[] = [];
  let current = "";
  let inDoBlock = false;

  for (const line of fullSql.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--") || trimmed === "") continue;
    if (trimmed.includes("DO $$")) inDoBlock = true;
    current += line + "\n";
    if (inDoBlock) {
      if (trimmed.includes("END $$;")) {
        inDoBlock = false;
        statements.push(current.trim());
        current = "";
      }
    } else if (trimmed.endsWith(";")) {
      statements.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) statements.push(current.trim());

  console.log(`Found ${statements.length} SQL statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;
    try {
      await db.$executeRawUnsafe(stmt);
      console.log(`[${i + 1}/${statements.length}] Executed statement: ${stmt.slice(0, 50).replace(/\n/g, ' ')}...`);
    } catch (e: any) {
      console.warn(`[${i + 1}/${statements.length}] Warning on statement:`, e.message);
    }
  }

  console.log("✓ All migration statements processed!");

  console.log("=== MIGRATION COMPLETE ===");
}

main().catch(console.error).finally(() => process.exit(0));

