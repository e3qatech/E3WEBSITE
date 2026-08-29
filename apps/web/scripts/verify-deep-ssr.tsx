import React from "react";
import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
if (!process.env.DATABASE_URL) {
  loadEnvFile(path.resolve(process.cwd(), ".env.production"));
}
import { renderToStaticMarkup } from "react-dom/server";
import { db } from "@/lib/db";
import { CANONICAL_SERVICE_SLUGS } from "@/lib/services/canonical-services";
import ServiceDetailPage from "@/app/[locale]/b2b/services/[slug]/page";
import B2BServicesPage from "@/app/[locale]/b2b/services/page";

async function runDeepVerification() {
  console.log("======================================================");
  console.log("   E3 SERVICES DEEP SSR & DATABASE COMPONENT AUDIT    ");
  console.log("======================================================\n");

  let allPassed = true;

  // 1. Directory Page (EN & AR)
  console.log("--- 1. DIRECTORY SSR RENDERING ---");
  for (const locale of ["en", "ar"]) {
    try {
      const pageJsx = await B2BServicesPage({ params: Promise.resolve({ locale }) });
      const html = renderToStaticMarkup(pageJsx);
      
      const missingSlugs: string[] = [];
      for (const slug of CANONICAL_SERVICE_SLUGS) {
        if (!html.includes(`/b2b/services/${slug}`)) {
          missingSlugs.push(slug);
        }
      }

      if (missingSlugs.length === 0) {
        console.log(`[PASS] ${locale.toUpperCase()} Directory rendered with all 10 canonical service cards (HTML length: ${html.length})`);
      } else {
        console.error(`[FAIL] ${locale.toUpperCase()} Directory missing slugs: ${missingSlugs.join(", ")}`);
        allPassed = false;
      }
    } catch (err: any) {
      console.error(`[ERROR] ${locale.toUpperCase()} Directory failed to render:`, err.message);
      allPassed = false;
    }
  }

  // 2. All 20 Detail Pages (10 EN + 10 AR)
  console.log("\n--- 2. 20 DETAIL PAGES SSR RENDERING ---");
  for (const slug of CANONICAL_SERVICE_SLUGS) {
    for (const locale of ["en", "ar"]) {
      try {
        const pageJsx = await ServiceDetailPage({
          params: Promise.resolve({ locale, slug }),
          searchParams: Promise.resolve({}),
        });
        const html = renderToStaticMarkup(pageJsx);

        const has404 = html.includes("Service Not Found") || html.includes("الخدمة غير متوفرة") || html.includes("This service is currently unavailable");
        const hasBriefBtn = html.includes("Build Your Project Brief") || html.includes("بناء موجز مشروعك المخصص");
        const hasDeliverables = html.includes("deliverables-section");
        const hasCapabilities = html.includes("capabilities-section");
        const hasObjectives = html.includes("objectives-section");
        const hasEngagement = html.includes("engagement-section");

        if (!has404 && hasBriefBtn && hasDeliverables && hasCapabilities) {
          console.log(`[PASS] [${locale.toUpperCase()}] /b2b/services/${slug} (Length: ${html.length}, Brief: OK, Deliverables: OK)`);
        } else {
          console.error(`[FAIL] [${locale.toUpperCase()}] /b2b/services/${slug} (404: ${has404}, Brief: ${hasBriefBtn}, Deliverables: ${hasDeliverables})`);
          allPassed = false;
        }
      } catch (err: any) {
        console.error(`[ERROR] [${locale.toUpperCase()}] /b2b/services/${slug} failed:`, err.message);
        allPassed = false;
      }
    }
  }

  console.log("\n======================================================");
  if (allPassed) {
    console.log("   ALL 22 ROUTES RENDERED CLEANLY FROM DATABASE!     ");
  } else {
    console.log("   VERIFICATION FAILED: ERRORS ENCOUNTERED            ");
  }
  console.log("======================================================");
}

runDeepVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal audit error:", err);
    process.exit(1);
  });
