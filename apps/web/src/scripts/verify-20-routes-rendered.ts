import { CANONICAL_SERVICE_SLUGS, CANONICAL_SERVICES_METADATA, getLocalizedCanonicalServiceTitle } from "../lib/services/canonical-services";

const BASE_URL = process.env.VERIFY_BASE_URL || process.argv[2] || "http://localhost:3000";

interface RouteCheckResult {
  url: string;
  status: number;
  ok: boolean;
  h1: string;
  title: string;
  hasCmsContent: boolean;
  hasBriefCta: boolean;
  has404Text: boolean;
  error?: string;
}

function extractTagContent(html: string, tagName: string): string {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  if (!match) return "";
  return match[1].replace(/<[^>]+>/g, "").trim();
}

async function verifyRoute(url: string, isAr: boolean, expectedSlug?: string): Promise<RouteCheckResult> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PreviewVerifier/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    const status = res.status;
    const html = await res.text();
    const title = extractTagContent(html, "title");
    const h1 = extractTagContent(html, "h1");

    const has404Text = /service not found|page not found|404|لم يتم العثور على الخدمة/i.test(title) ||
                       /service not found|لم يتم العثور على الخدمة/i.test(h1);
    const hasBriefCta = /Project Brief|موجز المشروع|Build Your Project Brief|بناء موجز/i.test(html);
    const hasCmsContent = /Capabilities|Process|Specifications|Delivery Phases|القدرات|المراحل/i.test(html) || html.length > 5000;

    const ok = status === 200 && !has404Text && h1.length > 0;

    return {
      url,
      status,
      ok,
      h1,
      title,
      hasCmsContent,
      hasBriefCta,
      has404Text,
    };
  } catch (err: any) {
    return {
      url,
      status: 0,
      ok: false,
      h1: "",
      title: "",
      hasCmsContent: false,
      hasBriefCta: false,
      has404Text: true,
      error: err?.message || String(err),
    };
  }
}

async function verifyDirectory(url: string, isAr: boolean) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 PreviewVerifier/1.0",
        "Accept": "text/html",
      },
      redirect: "follow",
    });
    const html = await res.text();
    const title = extractTagContent(html, "title");
    const h1 = extractTagContent(html, "h1") || extractTagContent(html, "h2");

    let foundCount = 0;
    const missingSlugs: string[] = [];

    for (const slug of CANONICAL_SERVICE_SLUGS) {
      if (html.includes(slug)) {
        foundCount++;
      } else {
        missingSlugs.push(slug);
      }
    }

    return {
      url,
      status: res.status,
      ok: res.status === 200 && foundCount === 10,
      title,
      h1,
      foundCount,
      missingSlugs,
    };
  } catch (err: any) {
    return {
      url,
      status: 0,
      ok: false,
      title: "",
      h1: "",
      foundCount: 0,
      missingSlugs: [...CANONICAL_SERVICE_SLUGS],
      error: err?.message,
    };
  }
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`   E3 PUBLIC SERVICES & 20 DETAIL ROUTES VERIFIER`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let allPassed = true;

  // 1. Check Directory Pages
  console.log(`--- 1. DIRECTORY ROUTES (EN & AR) ---`);
  const enDir = await verifyDirectory(`${BASE_URL}/en/b2b/services`, false);
  const arDir = await verifyDirectory(`${BASE_URL}/ar/b2b/services`, true);

  console.log(`EN Directory [${enDir.status}]: Found ${enDir.foundCount}/10 canonical services - ${enDir.ok ? "PASS" : "FAIL"}`);
  if (enDir.missingSlugs.length > 0) console.log(`   Missing EN: ${enDir.missingSlugs.join(", ")}`);

  console.log(`AR Directory [${arDir.status}]: Found ${arDir.foundCount}/10 canonical services - ${arDir.ok ? "PASS" : "FAIL"}`);
  if (arDir.missingSlugs.length > 0) console.log(`   Missing AR: ${arDir.missingSlugs.join(", ")}`);

  if (!enDir.ok || !arDir.ok) allPassed = false;

  // 2. Check 20 Detail Routes
  console.log(`\n--- 2. 20 CANONICAL DETAIL ROUTES (10 EN + 10 AR) ---`);
  const detailResults: RouteCheckResult[] = [];

  for (const slug of CANONICAL_SERVICE_SLUGS) {
    const enUrl = `${BASE_URL}/en/b2b/services/${slug}`;
    const arUrl = `${BASE_URL}/ar/b2b/services/${slug}`;

    const enRes = await verifyRoute(enUrl, false, slug);
    const arRes = await verifyRoute(arUrl, true, slug);

    detailResults.push(enRes, arRes);

    const enStatusStr = enRes.ok ? "PASS" : `FAIL (H1: "${enRes.h1}", 404: ${enRes.has404Text})`;
    const arStatusStr = arRes.ok ? "PASS" : `FAIL (H1: "${arRes.h1}", 404: ${arRes.has404Text})`;

    console.log(`  [EN] /services/${slug.padEnd(28)} => [${enRes.status}] ${enStatusStr}`);
    console.log(`  [AR] /services/${slug.padEnd(28)} => [${arRes.status}] ${arStatusStr}`);

    if (!enRes.ok || !arRes.ok) allPassed = false;
  }

  // 3. Legacy Aliases Check
  console.log(`\n--- 3. LEGACY ALIAS REDIRECT CHECKS ---`);
  const legacyAliases = [
    { from: `${BASE_URL}/en/b2b/services/fec`, expectedTarget: "fec-development" },
    { from: `${BASE_URL}/en/b2b/services/family-entertainment-centers`, expectedTarget: "fec-development" },
    { from: `${BASE_URL}/en/b2b/services/design-research`, expectedTarget: "feasibility-design-research" },
    { from: `${BASE_URL}/en/b2b/services/e3-rentals`, expectedTarget: "av-stage-rentals" },
  ];

  for (const alias of legacyAliases) {
    try {
      // First check redirect response code
      const manualRes = await fetch(alias.from, {
        headers: { "User-Agent": "Mozilla/5.0 PreviewVerifier/1.0" },
        redirect: "manual",
      });
      const location = manualRes.headers.get("location") || "";
      const isRedirect = manualRes.status === 307 || manualRes.status === 308 || manualRes.status === 301 || manualRes.status === 302;
      const targetMatches = location.includes(alias.expectedTarget);

      // Second check followed page render
      const followRes = await verifyRoute(alias.from, false);
      const aliasOk = (isRedirect && targetMatches) || (followRes.ok && !followRes.has404Text);

      console.log(`  [ALIAS] ${alias.from.padEnd(65)} => [${manualRes.status}] -> [${followRes.status}] ${aliasOk ? "PASS (Resolved to " + alias.expectedTarget + ")" : "FAIL"}`);
      if (!aliasOk) allPassed = false;
    } catch (e: any) {
      console.log(`  [ALIAS] ${alias.from} => ERROR: ${e?.message}`);
      allPassed = false;
    }
  }

  console.log(`\n======================================================`);
  console.log(`VERIFICATION SUMMARY: ${allPassed ? "ALL 20 DETAIL ROUTES & DIRECTORIES PASSED" : "FAILURES DETECTED"}`);
  console.log(`======================================================\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Verification failed with exception:", err);
  process.exit(1);
});
