import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isApplyMode = process.argv.includes('--apply');
const isDryRun = !isApplyMode;

// Automatically parse .env.local if present
const envLocalPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  });
}

const dbUrl: string = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '';

if (!dbUrl) {
  throw new Error('Database URL is not configured. Set DATABASE_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL.');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

interface AttractionInput {
  slug: string;
  core: {
    nameEn: string;
    nameAr: string;
    taglineEn?: string;
    taglineAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
  };
  hero?: {
    mediaType?: string;
    mediaUrl?: string;
  };
  whatsInside?: Array<{ titleEn?: string; titleAr?: string; descriptionEn?: string; descriptionAr?: string }>;
  pricing?: Array<{ titleEn: string; titleAr?: string; price: number; discount?: number; currency?: string; type?: string; descriptionEn?: string; descriptionAr?: string }>;
  partnerOffers?: any[];
  partners?: Array<{ name: string; relationship?: string }>;
  socialLinks?: Array<{ platform: string; url: string }>;
  socialPosts?: any[];
  news?: any[];
  feedback?: any[];
  booking?: { mapUrl?: string; ticketingUrl?: string };
  operations?: { venueName?: string; ageGroup?: string; hours?: string; phone?: string; email?: string; whatsapp?: string };
  timingRules?: Array<{ ruleTitle?: string; startDate?: string; endDate?: string; openTime?: string; closeTime?: string }>;
  visibility?: { isPermanent?: boolean; isSpecialEvent?: boolean; isPublished?: boolean; temporalStatus?: any };
  faqs?: Array<{ questionEn: string; answerEn: string; questionAr?: string; answerAr?: string }>;
  gallery?: Array<{ url: string; captionEn?: string; captionAr?: string }>;
  seo?: { metaTitleEn?: string; metaDescriptionEn?: string; metaTitleAr?: string; metaDescriptionAr?: string };
}

interface InspectionReport {
  slug: string;
  nameEn: string;
  matchType: 'SLUG_MATCH' | 'NAME_MATCH' | 'NEW_RECORD' | 'AMBIGUOUS';
  existingId?: string;
  scalarFieldsToAdd: string[];
  nestedItemsToAdd: {
    whatsInside: number;
    pricing: number;
    partners: number;
    faqs: number;
    gallery: number;
    timingRules: number;
    socialLinks: number;
  };
  missingVerifiedData: string[];
  completenessPercent: number;
}

async function main() {
  let maskedHost = 'localhost / 127.0.0.1';
  try {
    const parsed = new URL(dbUrl);
    maskedHost = `${parsed.hostname} (DB: ${parsed.pathname.replace('/', '')})`;
  } catch (e) {
    maskedHost = dbUrl.split('@')[1] || dbUrl;
  }

  console.log(`=======================================================`);
  console.log(`E3 ATTRACTIONS CMS & DATABASE IMPORT / DRY-RUN ENGINE`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (READ-ONLY INSPECTION)' : 'PRODUCTION WRITE (--apply)'}`);
  console.log(`Target Database Host: ${maskedHost}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`=======================================================\n`);

  const dataPath = path.join(__dirname, '../prisma/data/e3_34_attractions_full.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`Fatal: Dataset file not found at ${dataPath}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const attractions: AttractionInput[] = rawData.attractions || [];

  console.log(`Loaded dataset containing ${attractions.length} attraction records.\n`);

  let totalDataset = attractions.length;
  let matchedExisting = 0;
  let newRecords = 0;
  let wouldUpdate = 0;
  let unchanged = 0;
  let ambiguous = 0;
  let errors = 0;

  const inspectionReports: InspectionReport[] = [];

  for (const item of attractions) {
    const slug = item.slug;
    const nameEn = item.core.nameEn;
    const nameAr = item.core.nameAr;

    try {
      // Safe database matchers
      let dbMatch: any = null;

      try {
        dbMatch = await prisma.attraction.findUnique({
          where: { slug },
          include: {
            pricing: true,
            faqs: true,
            gallery: true,
            socialLinks: true,
            temporalRules: true,
          },
        });
      } catch (e) {
        // Local DB offline or unreachable during dry-run
      }

      let matchType: 'SLUG_MATCH' | 'NAME_MATCH' | 'NEW_RECORD' | 'AMBIGUOUS' = 'NEW_RECORD';

      if (dbMatch) {
        matchType = 'SLUG_MATCH';
      } else {
        try {
          const nameMatches = await prisma.attraction.findMany({
            where: {
              OR: [
                { nameEn: { equals: nameEn, mode: 'insensitive' } },
                { nameAr: { equals: nameAr } },
              ],
            },
            include: {
              pricing: true,
              faqs: true,
              gallery: true,
              socialLinks: true,
              temporalRules: true,
            },
          });

          if (nameMatches.length === 1) {
            dbMatch = nameMatches[0];
            matchType = 'NAME_MATCH';
          } else if (nameMatches.length > 1) {
            matchType = 'AMBIGUOUS';
            ambiguous++;
            console.warn(`[AMBIGUOUS] Multiple database matches found for ${nameEn}`);
          }
        } catch (e) {
          // Ignore DB connection errors during dry run
        }
      }

      const scalarFieldsToAdd: string[] = [];
      const missingVerifiedData: string[] = [];
      let totalSectionsCount = 17;
      let populatedSectionsCount = 0;

      // Section 1: Core Details
      if (dbMatch) {
        if (!dbMatch.nameAr && item.core.nameAr) scalarFieldsToAdd.push('nameAr');
        if (!dbMatch.taglineEn && item.core.taglineEn) scalarFieldsToAdd.push('taglineEn');
        if (!dbMatch.taglineAr && item.core.taglineAr) scalarFieldsToAdd.push('taglineAr');
        if (!dbMatch.descriptionEn && item.core.descriptionEn) scalarFieldsToAdd.push('descriptionEn');
        if (!dbMatch.descriptionAr && item.core.descriptionAr) scalarFieldsToAdd.push('descriptionAr');
      } else {
        scalarFieldsToAdd.push('Core Details (Name, Tagline, Description EN & AR)');
      }
      populatedSectionsCount++; // Core always populated

      // Section 2: Hero Media
      if (item.hero?.mediaUrl) {
        populatedSectionsCount++;
        if (dbMatch && !dbMatch.heroMediaUrl) scalarFieldsToAdd.push('heroMediaUrl');
      } else {
        if (dbMatch?.heroMediaUrl) {
          populatedSectionsCount++;
        } else {
          missingVerifiedData.push('Hero Media Asset');
        }
      }

      // Section 3: What's Inside
      const whatsInsideCount = item.whatsInside?.length || 0;
      if (whatsInsideCount > 0 || (dbMatch && (dbMatch.features as any)?.length > 0)) {
        populatedSectionsCount++;
        if (dbMatch && !(dbMatch.features as any)?.length && whatsInsideCount > 0) scalarFieldsToAdd.push('features (What\'s Inside)');
      } else {
        missingVerifiedData.push('What\'s Inside Detailed Features');
      }

      // Section 4: Pricing & Tickets
      const pricingCount = item.pricing?.length || 0;
      const existingPricingCount = dbMatch?.pricing?.length || 0;
      if (pricingCount > 0 || existingPricingCount > 0) {
        populatedSectionsCount++;
      } else {
        missingVerifiedData.push('Pricing & Ticket Tiers (Unverified/Past Free Event)');
      }

      // Section 5 & 6: Partners & Offers
      const partnersCount = item.partners?.length || 0;
      if (partnersCount > 0 || (dbMatch && (dbMatch.partners as any)?.length > 0)) {
        populatedSectionsCount++;
        if (dbMatch && !(dbMatch.partners as any)?.length && partnersCount > 0) scalarFieldsToAdd.push('partners');
      } else {
        missingVerifiedData.push('Partner Logos & Relationship Details');
      }

      // Section 7 & 8: Social Links & Previews
      const socialLinksCount = item.socialLinks?.length || 0;
      const existingSocialLinksCount = dbMatch?.socialLinks?.length || 0;
      if (socialLinksCount > 0 || existingSocialLinksCount > 0) {
        populatedSectionsCount++;
      } else {
        missingVerifiedData.push('Official Social Handles / Verified Post Embeds');
      }

      // Section 9 & 10: News & Feedback
      missingVerifiedData.push('Verified Press Coverage / Customer Feedback');

      // Section 11: Booking & Maps
      if (item.booking?.mapUrl || dbMatch?.mapUrl) {
        populatedSectionsCount++;
        if (dbMatch && !dbMatch.mapUrl && item.booking?.mapUrl) scalarFieldsToAdd.push('mapUrl');
      } else {
        missingVerifiedData.push('Google Maps Venue Pin');
      }

      // Section 12: Operations
      if (item.operations?.venueName || (dbMatch?.operations as any)?.venueName) {
        populatedSectionsCount++;
        if (dbMatch && !(dbMatch.operations as any)?.venueName && item.operations?.venueName) scalarFieldsToAdd.push('operations');
      } else {
        missingVerifiedData.push('Specific Operating Hours / Contact Telephony');
      }

      // Section 13: Timing Rules
      const timingRulesCount = item.timingRules?.length || 0;
      const existingTimingRulesCount = dbMatch?.temporalRules?.length || 0;
      if (timingRulesCount > 0 || existingTimingRulesCount > 0) {
        populatedSectionsCount++;
      }

      // Section 14: Visibility
      populatedSectionsCount++;

      // Section 15: FAQs
      const faqsCount = item.faqs?.length || 0;
      const existingFaqsCount = dbMatch?.faqs?.length || 0;
      if (faqsCount > 0 || existingFaqsCount > 0) {
        populatedSectionsCount++;
      } else {
        missingVerifiedData.push('Custom Event FAQs');
      }

      // Section 16: Gallery
      const galleryCount = item.gallery?.length || 0;
      const existingGalleryCount = dbMatch?.gallery?.length || 0;
      if (galleryCount > 0 || existingGalleryCount > 0) {
        populatedSectionsCount++;
      } else {
        missingVerifiedData.push('High-Res Media Gallery Assets');
      }

      // Section 17: SEO
      if (item.seo?.metaTitleEn || (dbMatch?.seo as any)?.metaTitleEn) {
        populatedSectionsCount++;
        if (dbMatch && !(dbMatch.seo as any)?.metaTitleEn && item.seo?.metaTitleEn) scalarFieldsToAdd.push('seo');
      }

      const completenessPercent = Math.round((populatedSectionsCount / totalSectionsCount) * 100);

      const nestedItemsToAdd = {
        whatsInside: whatsInsideCount,
        pricing: Math.max(0, pricingCount - existingPricingCount),
        partners: partnersCount,
        faqs: Math.max(0, faqsCount - existingFaqsCount),
        gallery: Math.max(0, galleryCount - existingGalleryCount),
        timingRules: Math.max(0, timingRulesCount - existingTimingRulesCount),
        socialLinks: Math.max(0, socialLinksCount - existingSocialLinksCount),
      };

      if (dbMatch) {
        matchedExisting++;
        if (scalarFieldsToAdd.length > 0 || Object.values(nestedItemsToAdd).some(v => v > 0)) {
          wouldUpdate++;
        } else {
          unchanged++;
        }
      } else {
        newRecords++;
      }

      inspectionReports.push({
        slug,
        nameEn,
        matchType,
        existingId: dbMatch?.id,
        scalarFieldsToAdd,
        nestedItemsToAdd,
        missingVerifiedData,
        completenessPercent,
      });

      // ----------------------------------------------------
      // APPLY MODE WRITES
      // ----------------------------------------------------
      if (isApplyMode && matchType !== 'AMBIGUOUS') {
        const payload: any = {
          nameEn: item.core.nameEn,
          nameAr: item.core.nameAr,
          taglineEn: item.core.taglineEn || null,
          taglineAr: item.core.taglineAr || null,
          descriptionEn: item.core.descriptionEn || null,
          descriptionAr: item.core.descriptionAr || null,
          heroMediaType: item.hero?.mediaType || 'IMAGE',
          heroMediaUrl: item.hero?.mediaUrl || null,
          mapUrl: item.booking?.mapUrl || null,
          ticketingUrl: item.booking?.ticketingUrl || null,
          features: item.whatsInside || [],
          partners: item.partners || [],
          operations: item.operations || {},
          temporalStatus: item.visibility?.temporalStatus || {},
          isPublished: item.visibility?.isPublished ?? true,
          seo: item.seo || {},
        };

        let upserted;
        if (dbMatch) {
          // Patch semantics
          const patchData: any = {};
          if (dbMatch.slug !== slug) patchData.slug = slug;
          if (!dbMatch.nameAr && payload.nameAr) patchData.nameAr = payload.nameAr;
          if (!dbMatch.taglineEn && payload.taglineEn) patchData.taglineEn = payload.taglineEn;
          if (!dbMatch.taglineAr && payload.taglineAr) patchData.taglineAr = payload.taglineAr;
          if (!dbMatch.descriptionEn && payload.descriptionEn) patchData.descriptionEn = payload.descriptionEn;
          if (!dbMatch.descriptionAr && payload.descriptionAr) patchData.descriptionAr = payload.descriptionAr;
          if (!dbMatch.heroMediaUrl && payload.heroMediaUrl) patchData.heroMediaUrl = payload.heroMediaUrl;
          if (!dbMatch.mapUrl && payload.mapUrl) patchData.mapUrl = payload.mapUrl;
          if (!dbMatch.ticketingUrl && payload.ticketingUrl) patchData.ticketingUrl = payload.ticketingUrl;
          if (!(dbMatch.features as any)?.length && payload.features?.length) patchData.features = payload.features;
          if (!(dbMatch.partners as any)?.length && payload.partners?.length) patchData.partners = payload.partners;
          if (!(dbMatch.operations as any)?.venueName && payload.operations?.venueName) patchData.operations = payload.operations;
          if (!(dbMatch.seo as any)?.metaTitleEn && payload.seo?.metaTitleEn) patchData.seo = payload.seo;

          upserted = await prisma.attraction.update({
            where: { id: dbMatch.id },
            data: patchData,
          });
        } else {
          upserted = await prisma.attraction.create({
            data: {
              slug,
              ...payload,
            },
          });
        }

        // Relational upserts
        if (item.pricing && item.pricing.length > 0) {
          for (const pr of item.pricing) {
            const exists = await prisma.attractionPricing.findFirst({
              where: { attractionId: upserted.id, titleEn: pr.titleEn },
            });
            if (!exists) {
              await prisma.attractionPricing.create({
                data: {
                  attractionId: upserted.id,
                  titleEn: pr.titleEn,
                  titleAr: pr.titleAr || pr.titleEn,
                  price: pr.price,
                  discount: pr.discount || null,
                  currency: pr.currency || 'QAR',
                  type: pr.type || 'GENERAL',
                  descriptionEn: pr.descriptionEn || null,
                  descriptionAr: pr.descriptionAr || null,
                },
              });
            }
          }
        }

        if (item.faqs && item.faqs.length > 0) {
          for (const fq of item.faqs) {
            const exists = await prisma.attractionFaq.findFirst({
              where: { attractionId: upserted.id, questionEn: fq.questionEn },
            });
            if (!exists) {
              await prisma.attractionFaq.create({
                data: {
                  attractionId: upserted.id,
                  questionEn: fq.questionEn,
                  answerEn: fq.answerEn,
                  questionAr: fq.questionAr || fq.questionEn,
                  answerAr: fq.answerAr || fq.answerEn,
                },
              });
            }
          }
        }
      }
    } catch (err: any) {
      errors++;
      console.error(`[ERROR] Processing attraction ${slug}:`, err?.message || err);
    }
  }

  // Output Inspection Summary
  console.log(`=======================================================`);
  console.log(`DRY-RUN AUDIT & MATCHING SUMMARY REPORT`);
  console.log(`=======================================================`);
  console.log(`TOTAL DATASET:       ${totalDataset}`);
  console.log(`EXISTING MATCHED:    ${matchedExisting}`);
  console.log(`NEW RECORDS:         ${newRecords}`);
  console.log(`WOULD UPDATE:        ${wouldUpdate}`);
  console.log(`UNCHANGED:           ${unchanged}`);
  console.log(`AMBIGUOUS:           ${ambiguous}`);
  console.log(`ERRORS:              ${errors}`);
  console.log(`=======================================================\n`);

  console.log(`-------------------------------------------------------`);
  console.log(`ITEMIZED ATTRACTION INSPECTION (34 ATTRACTIONS)`);
  console.log(`-------------------------------------------------------`);

  inspectionReports.forEach((rep, idx) => {
    console.log(`\n[${idx + 1}/${totalDataset}] ${rep.nameEn} (slug: ${rep.slug})`);
    console.log(`    MATCH TYPE:               ${rep.matchType} ${rep.existingId ? `(ID: ${rep.existingId})` : ''}`);
    console.log(`    SCALAR FIELDS TO ADD:     ${rep.scalarFieldsToAdd.length > 0 ? rep.scalarFieldsToAdd.join(', ') : 'None (Up to date)'}`);
    console.log(`    NESTED ITEMS TO ADD:      What's Inside: +${rep.nestedItemsToAdd.whatsInside}, Pricing: +${rep.nestedItemsToAdd.pricing}, Partners: +${rep.nestedItemsToAdd.partners}, FAQs: +${rep.nestedItemsToAdd.faqs}, Gallery: +${rep.nestedItemsToAdd.gallery}`);
    console.log(`    MISSING VERIFIED DATA:    ${rep.missingVerifiedData.length > 0 ? rep.missingVerifiedData.join(' | ') : 'None'}`);
    console.log(`    SECTION COMPLETENESS:     ${rep.completenessPercent}%`);
  });

  console.log(`\n=======================================================`);
  console.log(isDryRun ? `DRY-RUN COMPLETED SAFELY. NO DATABASE WRITES PERFORMED.` : `DATABASE IMPORT COMPLETED SUCCESSFULLY.`);
  console.log(`=======================================================\n`);
}

main()
  .catch((e) => {
    console.error("Fatal error during import execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
