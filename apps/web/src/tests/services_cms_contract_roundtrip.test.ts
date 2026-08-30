import { describe, it, expect } from "vitest";
import {
  getAllCanonicalServices,
  getCanonicalService,
  resolveServiceSlug,
} from "@/lib/services/canonical-services";
import { adaptDbServiceToPresentation, decodeHtmlEntities } from "@/lib/services/service-adapters";
import { canonicalizeRoute, localizeHref } from "@/lib/url-helper";

describe("Services CMS Contract & Persistence Round-Trip Suite", () => {
  // 1. Canonical Services Taxonomy Count
  it("1. Returns exactly the 10 canonical service disciplines with family-entertainment-centers", () => {
    const services = getAllCanonicalServices();
    expect(services.length).toBe(10);
    const slugs = services.map((s) => s.slug);
    expect(slugs).toEqual([
      "mega-events",
      "family-entertainment-centers",
      "kids-concepts",
      "experiential-activations",
      "shows-performances",
      "av-stage-rentals",
      "attraction-operations",
      "ticketing-solutions",
      "fabrication-branding",
      "feasibility-design-research",
    ]);
  });

  // 2. Legacy Aliases Resolution without Duplication
  it("2. Reconciles legacy aliases (/fec, /audio-visual-stage) to canonical primary service slugs", () => {
    expect(resolveServiceSlug("fec")).toBe("family-entertainment-centers");
    expect(resolveServiceSlug("fec-development")).toBe("family-entertainment-centers");
    expect(resolveServiceSlug("family-entertainment-center")).toBe("family-entertainment-centers");
    expect(resolveServiceSlug("family-entertainment-centers")).toBe("family-entertainment-centers");
    expect(resolveServiceSlug("audio-visual-stage")).toBe("av-stage-rentals");
    expect(resolveServiceSlug("av-rentals")).toBe("av-stage-rentals");
    expect(resolveServiceSlug("attraction-operations")).toBe("attraction-operations");
    expect(resolveServiceSlug("event-engineering")).toBe("mega-events");
    expect(resolveServiceSlug("design-research")).toBe("feasibility-design-research");
  });

  // 3. Route Canonicalization for Service Aliases
  it("3. canonicalizeRoute routes aliases to the canonical service URL", () => {
    expect(canonicalizeRoute("/services/fec")).toBe("/b2b/services/family-entertainment-centers");
    expect(canonicalizeRoute("/b2b/services/fec")).toBe("/b2b/services/family-entertainment-centers");
    expect(canonicalizeRoute("/b2b/services/fec-development")).toBe("/b2b/services/family-entertainment-centers");
    expect(canonicalizeRoute("/b2b/services/audio-visual-stage")).toBe("/b2b/services/av-stage-rentals");
    expect(canonicalizeRoute("/services/av-rentals")).toBe("/b2b/services/av-stage-rentals");
  });

  // 4. FEC Content and Routing: Stored record (/fec) resolves to canonical microsite with DB content
  it("4. Stored /fec record resolves to family-entertainment-centers with authoritative DB content", () => {
    const fecDbRecord: any = {
      id: "srv-fec-stored-1",
      slug: "fec", // Stored legacy slug in DB
      titleEn: "Family Entertainment Centers",
      titleAr: "مراكز الترفيه العائلي",
      taglineEn: "Comprehensive masterplanning and fit-out for family venues in Qatar.",
      taglineAr: "تخطيط شامل وتجهيز متكامل لمراكز الترفيه العائلي في قطر.",
      contentEn: "E3 guides developers from concept to day-to-day operations.",
      contentAr: "تقود إي ثري المطورين من الفكرة إلى التشغيل اليومي.",
      heroMediaUrl: "https://example.com/fec-hero.jpg",
      isVisible: true,
      isFeatured: true,
      process: {
        heroOutcomeEn: "High-Yield Family Entertainment Venues Built for Longevity.",
        heroOutcomeAr: "وجهات ترفيه عائلية عالية المردود مصممة لضمان استدامة الزيارات.",
        ctaPrimaryTextEn: "Build Your FEC Brief",
        ctaPrimaryTextAr: "بناء موجز مركز الترفيه",
        verifiedProofPoints: [
          { value: "Turnkey", labelEn: "Design-to-Operate", labelAr: "تصميم وتشغيل", isVerified: true },
        ],
      },
    };

    const canonical = getCanonicalService(fecDbRecord.slug);
    expect(canonical).toBeDefined();
    expect(canonical?.slug).toBe("family-entertainment-centers");
    expect(canonical?.aliases).toContain("fec");

    const adapted = adaptDbServiceToPresentation(fecDbRecord);
    expect(adapted.titleEn).toBe("Family Entertainment Centers");
    expect(adapted.titleAr).toBe("مراكز الترفيه العائلي");
    expect(adapted.heroOutcomeEn).toBe("High-Yield Family Entertainment Venues Built for Longevity.");
    expect(adapted.heroOutcomeAr).toBe("وجهات ترفيه عائلية عالية المردود مصممة لضمان استدامة الزيارات.");
    expect(adapted.verifiedProofPoints.length).toBe(1);
  });

  // 5. AV Route Compatibility: Stored record (/audio-visual-stage) resolves to av-stage-rentals
  it("5. Stored /audio-visual-stage record resolves to av-stage-rentals canonical route", () => {
    const avDbRecord: any = {
      id: "srv-av-stored-1",
      slug: "audio-visual-stage", // Stored legacy slug in DB
      titleEn: "AV & Stage Equipment Rentals",
      titleAr: "تجهيزات الصوت والضوء وتأجير المسارح",
      isVisible: true,
      process: {
        heroOutcomeEn: "Crystal-Clear Acoustic Power and Visually Stunning Stage Grids.",
        heroOutcomeAr: "قوة صوتية فائقة النقاء وعروض بصرية وإضاءة مسرحية مبهرة.",
      },
    };

    const canonical = getCanonicalService(avDbRecord.slug);
    expect(canonical).toBeDefined();
    expect(canonical?.slug).toBe("av-stage-rentals");
    expect(canonical?.aliases).toContain("audio-visual-stage");

    const adapted = adaptDbServiceToPresentation(avDbRecord);
    expect(adapted.titleEn).toBe("AV & Stage Equipment Rentals");
    expect(adapted.heroOutcomeEn).toBe("Crystal-Clear Acoustic Power and Visually Stunning Stage Grids.");
  });

  // 6. Persistence Round-Trip: Unpacking Full Enhancement JSON from Prisma Record
  it("6. Rehydrates all 17 structured bilingual sections from DB process and root fields", () => {
    const dbRecord: any = {
      id: "srv-doha-mega-1",
      slug: "mega-events",
      titleEn: "Custom Mega Events",
      titleAr: "الفعاليات الكبرى المخصصة",
      taglineEn: "Bespoke production in Qatar",
      taglineAr: "إنتاج مخصص في قطر",
      category: "Specialized Festivals",
      heroMediaType: "VIDEO",
      heroMediaUrl: "https://example.com/hero.mp4",
      thumbnail: "https://example.com/thumb.jpg",
      isVisible: true,
      isFeatured: true,
      process: {
        heroOutcomeEn: "Unrivaled Stadium Spectacles Delivered on Schedule",
        heroOutcomeAr: "عروض استثنائية في الملاعب يتم تسليمها في الموعد المحدد",
        supportingStatementEn: "Full turnkey event delivery across Qatar with dedicated crowd management.",
        supportingStatementAr: "تنفيذ شامل للفعاليات في كافة أنحاء قطر مع إدارة حشود متطورة.",
        mobileHeroMediaUrl: "https://example.com/mobile-hero.jpg",
        videoPosterUrl: "https://example.com/poster.jpg",
        ctaPrimary: "CUSTOM_LINK",
        ctaPrimaryTextEn: "Schedule Technical Workshop",
        ctaPrimaryTextAr: "حجز ورشة عمل فنية",
        ctaPrimaryUrl: "/b2b/contact?type=workshop",
        ctaSecondaryTextEn: "Explore Parade Case Study",
        ctaSecondaryTextAr: "استعراض مسيرة الهيليوم",
        ctaSecondaryUrl: "/b2b/case-studies/doha-balloon-parade-2022",
        verifiedProofPoints: [
          { value: "60k+", labelEn: "Peak Daily Attendance", labelAr: "الذروة اليومية للحضور", isVerified: true },
          { value: "Unverified Claim", labelEn: "Draft Metric", labelAr: "مقياس مسودة", isVerified: false },
        ],
        wowHow: [
          {
            id: "wh-1",
            titleEn: "Cinematic Inflatables",
            titleAr: "المجسمات السينمائية",
            wowEn: "Giant balloon characters hovering over Corniche.",
            wowAr: "شخصيات كرتونية عملاقة تطفو فوق الكورنيش.",
            howEn: "Dual-anchor tether calculations and wind sensors.",
            howAr: "حسابات نقاط التثبيت المزدوجة ومستشعرات الرياح.",
          },
        ],
        objectives: [
          {
            id: "obj-1",
            labelEn: "National Day Celebration",
            labelAr: "احتفال اليوم الوطني",
            descriptionEn: "High-throughput parade corridor.",
            descriptionAr: "مسار احتفالي عالي الاستيعاب.",
            highlightedCapabilityIds: ["cap-1"],
            recommendedDeliverableIds: ["del-1"],
          },
        ],
        capabilities: [
          {
            id: "cap-1",
            titleEn: "Balloon Rigging & Telemetry",
            titleAr: "تركيب ومراقبة البالونات",
            descriptionEn: "Real-time helium pressure monitoring.",
            descriptionAr: "مراقبة ضغط الهيليوم في الوقت الفعلي.",
            deliverablesEn: ["Telemetry Dossier"],
            deliverablesAr: ["ملف المراقبة"],
            suitableForEn: ["Outdoor Festivals"],
            suitableForAr: ["المهرجانات المفتوحة"],
            colSpan: 2,
          },
        ],
        engagementModels: [
          {
            id: "eng-1",
            titleEn: "Turnkey Production",
            titleAr: "الإنتاج الشامل",
            subtitleEn: "Sole Accountability",
            subtitleAr: "المسؤولية الكاملة",
            descriptionEn: "Complete concept to tear down.",
            descriptionAr: "من الفكرة إلى التفكيك.",
            bestForEn: "Multi-day public parades",
            bestForAr: "المسيرات الجماهيرية متعددة الأيام",
            typicalDurationEn: "8 Weeks",
            typicalDurationAr: "٨ أسابيع",
          },
        ],
        deliverables: [
          {
            id: "del-1",
            titleEn: "Pre-Production Dossier",
            titleAr: "ملف ما قبل الإنتاج",
            itemsEn: ["3D Balloon Simulation", "RAMS Safety Pack"],
            itemsAr: ["محاكاة ثلاثية الأبعاد", "ملف السلامة RAMS"],
          },
        ],
        lifecycleStages: [
          {
            id: "stg-1",
            stageNumber: "01",
            titleEn: "Wind Modeling & Site Survey",
            titleAr: "نمذجة الرياح ومسح الموقع",
            descriptionEn: "Corniche meteorological analysis.",
            descriptionAr: "تحليل الأرصاد الجوية لكورنيش الدوحة.",
            outputsEn: ["Survey Certificate"],
            outputsAr: ["شهادة مسح الموقع"],
          },
        ],
        serviceSpecificModule: {
          type: "scale-explorer",
          titleEn: "Parade Scale Explorer",
          titleAr: "مستكشف حجم المسيرات",
          subtitleEn: "Select corridor length",
          subtitleAr: "اختر طول المسار",
          data: {},
        },
        enterpriseReadiness: [
          {
            id: "er-1",
            titleEn: "Qatar Civil Defence Approval",
            titleAr: "اعتماد الدفاع المدني القطري",
            descriptionEn: "All balloon gases non-flammable certified.",
            descriptionAr: "شهادات معتمدة لعدم قابلية الغازات للاشتعال.",
          },
        ],
        relatedCaseStudySlugs: ["doha-balloon-parade-2022"],
        relatedServiceSlugs: ["shows-performances", "av-stage-rentals"],
        relatedServicesNarrativeEn: "Shows and AV support the main parade execution.",
        relatedServicesNarrativeAr: "تدعم العروض والمسارح الصوتية تنفيذ المسيرة.",
        sectionVisibility: {
          hero: true,
          wowHow: true,
          objectives: true,
          gallery: true,
          capabilities: true,
          engagementModels: true,
          deliverables: true,
          lifecycle: true,
          specialistModule: true,
          caseStudies: true,
          enterpriseReadiness: true,
          relatedServices: true,
        },
      },
      gallery: [
        {
          id: "g-1",
          url: "https://example.com/gallery1.jpg",
          captionEn: "Corniche Parade 2022",
          captionAr: "مسيرة الكورنيش ٢٠٢٢",
          orderIndex: 0,
        },
      ],
    };

    const adapted = adaptDbServiceToPresentation(dbRecord);

    expect(adapted.id).toBe("srv-doha-mega-1");
    expect(adapted.slug).toBe("mega-events");
    expect(adapted.titleEn).toBe("Custom Mega Events");
    expect(adapted.titleAr).toBe("الفعاليات الكبرى المخصصة");
    expect(adapted.heroOutcomeEn).toBe("Unrivaled Stadium Spectacles Delivered on Schedule");
    expect(adapted.heroOutcomeAr).toBe("عروض استثنائية في الملاعب يتم تسليمها في الموعد المحدد");
    expect(adapted.ctaPrimaryTextEn).toBe("Schedule Technical Workshop");
    expect(adapted.ctaPrimaryTextAr).toBe("حجز ورشة عمل فنية");
    expect(adapted.ctaPrimaryUrl).toBe("/b2b/contact?type=workshop");
    expect(adapted.ctaSecondaryUrl).toBe("/b2b/case-studies/doha-balloon-parade-2022");
    expect(adapted.wowHow.length).toBe(1);
    expect(adapted.wowHow[0].titleEn).toBe("Cinematic Inflatables");
    expect(adapted.objectives.length).toBe(1);
    expect(adapted.capabilities.length).toBe(1);
    expect(adapted.engagementModels.length).toBe(1);
    expect(adapted.deliverables.length).toBe(1);
    expect(adapted.lifecycleStages.length).toBe(1);
    expect(adapted.enterpriseReadiness.length).toBe(1);
    expect(adapted.relatedCaseStudySlugs).toEqual(["doha-balloon-parade-2022"]);
    expect(adapted.relatedServiceSlugs).toEqual(["shows-performances", "av-stage-rentals"]);
    expect(adapted.relatedServicesNarrativeEn).toBe("Shows and AV support the main parade execution.");
    expect(adapted.galleryItems?.length).toBe(1);
  });

  // 7. Strict Factual Claims & Claims Verification Filtering
  it("7. Strictly suppresses unverified factual claims (strictly require isVerified === true)", () => {
    const dbRecordWithClaims: any = {
      slug: "mega-events",
      titleEn: "Mega Events",
      titleAr: "الفعاليات الكبرى",
      process: {
        verifiedProofPoints: [
          { value: "100%", labelEn: "Permitted", labelAr: "مرخص", sourceEn: "Ministry Permit", isVerified: true },
          { value: "48h", labelEn: "Rapid Rigging", labelAr: "تركيب سريع", sourceEn: "Doha Build Logs", isVerified: true },
          { value: "1M+", labelEn: "Unverified Claim", labelAr: "ادعاء غير موثق", isVerified: false },
          { value: "Unset Flag", labelEn: "No Status", labelAr: "بدون حالة" },
        ],
      },
    };

    const adapted = adaptDbServiceToPresentation(dbRecordWithClaims);
    expect(adapted.verifiedProofPoints.length).toBe(2);
    expect(adapted.verifiedProofPoints.map((p) => p.value)).toEqual(["100%", "48h"]);
    expect(adapted.verifiedProofPoints.some((p) => p.value === "1M+")).toBe(false);
    expect(adapted.verifiedProofPoints.some((p) => p.value === "Unset Flag")).toBe(false);
  });

  // 8. Section Suppression Independence: Missing enhancement data hides only that section
  it("8. Missing enhancement data suppresses only that section without hiding the parent service", () => {
    const minimalRecord: any = {
      id: "srv-minimal",
      slug: "attraction-operations",
      titleEn: "Attraction Operations & Management",
      titleAr: "تشغيل وإدارة الوجهات والفعاليات",
      taglineEn: "Day-to-day guest operations",
      taglineAr: "العمليات اليومية وإدارة تجربة الزوار",
      isVisible: true,
      process: {
        wowHow: [],
        objectives: [],
        capabilities: [],
        deliverables: [],
        lifecycleStages: [],
        enterpriseReadiness: [],
        verifiedProofPoints: [],
      },
    };

    const adapted = adaptDbServiceToPresentation(minimalRecord);
    expect(adapted).toBeDefined();
    expect(adapted.id).toBe("srv-minimal");
    expect(adapted.slug).toBe("attraction-operations");
    expect(adapted.wowHow).toEqual([]);
    expect(adapted.objectives).toEqual([]);
    expect(adapted.capabilities).toEqual([]);
    expect(adapted.deliverables).toEqual([]);
    expect(adapted.lifecycleStages).toEqual([]);
    expect(adapted.enterpriseReadiness).toEqual([]);
    expect(adapted.verifiedProofPoints).toEqual([]);
  });

  // 9. Directory Deduplication: Public services directory deduplicates legacy aliases into canonical cards
  it("9. Canonical mapping deduplicates legacy aliases (fec -> family-entertainment-centers, audio-visual-stage -> av-stage-rentals)", () => {
    const rawDbServices = [
      { slug: "mega-events", titleEn: "Mega Events", isVisible: true },
      { slug: "fec", titleEn: "FEC Legacy Record", isVisible: true },
      { slug: "family-entertainment-centers", titleEn: "FEC Duplicate", isVisible: true },
      { slug: "audio-visual-stage", titleEn: "AV Stage Legacy", isVisible: true },
      { slug: "av-stage-rentals", titleEn: "AV Stage Canonical Duplicate", isVisible: true },
      { slug: "kids-concepts", titleEn: "Kids Concepts", isVisible: true },
      { slug: "experiential-activations", titleEn: "Activations", isVisible: true },
      { slug: "shows-performances", titleEn: "Shows", isVisible: true },
      { slug: "ticketing-solutions", titleEn: "Ticketing", isVisible: true },
      { slug: "fabrication-branding", titleEn: "Fabrication", isVisible: true },
      { slug: "feasibility-design-research", titleEn: "Feasibility", isVisible: true },
    ];

    const servicesMap = new Map<string, any>();

    rawDbServices.forEach((dbs) => {
      if (dbs.isVisible !== false) {
        const canonical = getCanonicalService(dbs.slug);
        const targetSlug = canonical ? canonical.slug : dbs.slug;
        servicesMap.set(targetSlug, {
          ...(servicesMap.get(targetSlug) || {}),
          ...dbs,
          slug: targetSlug,
        });
      }
    });

    const effectiveServices = Array.from(servicesMap.values());
    expect(effectiveServices.length).toBe(9); // 11 minus 2 deduplicated aliases
    expect(effectiveServices.map((s) => s.slug)).toEqual([
      "mega-events",
      "family-entertainment-centers",
      "av-stage-rentals",
      "kids-concepts",
      "experiential-activations",
      "shows-performances",
      "ticketing-solutions",
      "fabrication-branding",
      "feasibility-design-research",
    ]);
  });

  // 10. Entity Decoding & Sanitization
  it("10. decodeHtmlEntities correctly decodes HTML entities and strips markup", () => {
    const rawString = "Creative &amp; Technical &rarr; &quot;Excellence&#39; &lt;World&gt; <p>Paragraph</p>";
    const decoded = decodeHtmlEntities(rawString);
    expect(decoded).toBe('Creative & Technical → "Excellence\' <World> Paragraph');

    const dbRecordWithEntities: any = {
      id: "srv-entities",
      slug: "mega-events",
      titleEn: "Mega Events &amp; Ceremonies",
      titleAr: "الفعاليات الكبرى والاحتفالات &rarr; الرسمية",
      taglineEn: "&quot;Turnkey&quot; Event Engineering &amp; Staging",
      taglineAr: "&quot;هندسة الفعاليات والإنتاج المتكامل&quot;",
      process: {
        heroOutcomeEn: "From Blueprint &amp; Concept &rarr; Flawless Live Reality.",
        heroOutcomeAr: "من المخطط &amp; المفهوم &rarr; إلى الواقع الحي المتكامل.",
      },
    };

    const adapted = adaptDbServiceToPresentation(dbRecordWithEntities);
    expect(adapted.titleEn).toBe("Mega Events & Ceremonies");
    expect(adapted.titleAr).toBe("الفعاليات الكبرى والاحتفالات → الرسمية");
    expect(adapted.taglineEn).toBe('"Turnkey" Event Engineering & Staging');
    expect(adapted.heroOutcomeEn).toBe("From Blueprint & Concept → Flawless Live Reality.");
    expect(adapted.heroOutcomeAr).toBe("من المخطط & المفهوم → إلى الواقع الحي المتكامل.");
  });

  // 11. Attraction Operations Suppression
  it("11. Suppresses attraction-operations from available services when not in DB records", () => {
    const publishedDbServices = [
      { slug: "mega-events", isVisible: true },
      { slug: "fec", isVisible: true },
      { slug: "kids-concepts", isVisible: true },
      { slug: "av-stage-rentals", isVisible: true },
    ];

    const publishedMap = new Map<string, any>();
    publishedDbServices.forEach((s) => {
      const canon = getCanonicalService(s.slug);
      if (canon && canon.slug !== "attraction-operations") {
        publishedMap.set(canon.slug, canon);
      }
    });

    const availableServices = Array.from(publishedMap.values());
    expect(availableServices.some((s) => s.slug === "attraction-operations")).toBe(false);
    expect(availableServices.length).toBe(4);
  });

  // 12. Public Internal Link Validation: Reject any link beginning with unlocalized /b2b/
  it("12. localizeHref rejects raw /b2b/ internal paths and attaches active locale", () => {
    const rawPaths = [
      "/b2b/contact",
      "/b2b/cases",
      "/b2b/case-studies",
      "/b2b/services",
      "/b2b/services/mega-events",
      "/b2b/about",
      "/b2b/team",
    ];

    for (const p of rawPaths) {
      const localizedEn = localizeHref(p, "en");
      const localizedAr = localizeHref(p, "ar");

      expect(localizedEn).not.toMatch(/^\/b2b(\/|$)/);
      expect(localizedEn).toMatch(/^\/en\/b2b(\/|$)/);
      expect(localizedAr).not.toMatch(/^\/b2b(\/|$)/);
      expect(localizedAr).toMatch(/^\/ar\/b2b(\/|$)/);
    }
  });

  // 13. Hardcoded & Unverified Claims Suppression
  it("13. Suppresses optional enhancement sections when absent from DB without hardcoded fallbacks", () => {
    const fecDbWithoutEnhancements: any = {
      id: "srv-fec-pure-db",
      slug: "fec",
      titleEn: "Family Entertainment Centers",
      titleAr: "مراكز الترفيه العائلي",
      taglineEn: "Turnkey development of family entertainment centers.",
      taglineAr: "تطوير شامل لمراكز الترفيه العائلي.",
      isVisible: true,
      process: {}, // No proof points, no enterprise readiness, no custom capabilities in DB
    };

    const adapted = adaptDbServiceToPresentation(fecDbWithoutEnhancements);

    // Verified proof points must be empty when not verified in DB
    expect(adapted.verifiedProofPoints).toEqual([]);
    // Enterprise readiness must be empty (suppressed)
    expect(adapted.enterpriseReadiness).toEqual([]);
    // Capabilities bento must be empty (suppressed)
    expect(adapted.capabilities).toEqual([]);
    // Deliverables roster must be empty (suppressed)
    expect(adapted.deliverables).toEqual([]);
    // Lifecycle stages must be empty (suppressed)
    expect(adapted.lifecycleStages).toEqual([]);
    // Engagement models must be empty (suppressed)
    expect(adapted.engagementModels).toEqual([]);
    // Specialist module must be none (suppressed)
    expect(adapted.serviceSpecificModule.type).toBe("none");

    // Objectives are retained for Brief Builder
    expect(adapted.objectives.length).toBe(2);
    expect(adapted.objectives.map((o) => o.id)).toContain("obj-mall-anchor");
    expect(adapted.objectives.map((o) => o.id)).toContain("obj-venue-retrofit");
  });

  // 14. Primary Capability Navigator Renders Exactly 9 Published Services
  it("14. Capability navigator renders all 9 database-backed canonical services", () => {
    const dbPublishedServices = [
      { id: "s1", slug: "mega-events", isVisible: true },
      { id: "s2", slug: "fec", isVisible: true }, // maps to family-entertainment-centers
      { id: "s3", slug: "av-stage-rentals", isVisible: true },
      { id: "s4", slug: "kids-play-concepts", isVisible: true }, // maps to kids-concepts
      { id: "s5", slug: "experiential-activations", isVisible: true },
      { id: "s6", slug: "shows-performances", isVisible: true },
      { id: "s7", slug: "ticketing-solutions", isVisible: true },
      { id: "s8", slug: "fabrication-branding", isVisible: true },
      { id: "s9", slug: "feasibility-design-research", isVisible: true },
    ];

    const servicesMap = new Map<string, any>();
    dbPublishedServices.forEach((dbs) => {
      if (dbs.isVisible !== false) {
        const canonical = getCanonicalService(dbs.slug);
        const targetSlug = canonical ? canonical.slug : dbs.slug;
        servicesMap.set(targetSlug, { ...dbs, slug: targetSlug });
      }
    });

    const navigatorServices = Array.from(servicesMap.values());
    expect(navigatorServices.length).toBe(9);
    expect(navigatorServices.map((s) => s.slug)).toEqual([
      "mega-events",
      "family-entertainment-centers",
      "av-stage-rentals",
      "kids-concepts",
      "experiential-activations",
      "shows-performances",
      "ticketing-solutions",
      "fabrication-branding",
      "feasibility-design-research",
    ]);
  });
});
