import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "@/app/api/b2b/cases/[id]/route";
import { POST } from "@/app/api/b2b/cases/route";
import { adaptDbCaseStudyToPresentation } from "@/lib/case-studies/case-adapters";
import { CaseScopeTimeline } from "@/components/b2b/cases/CaseScopeTimeline";
import { ImpactMetricsGrid } from "@/components/b2b/cases/ImpactMetricsGrid";
import { CaseBeforeAfterSlider } from "@/components/b2b/cases/CaseBeforeAfterSlider";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

// Mock auth session as SUPER_ADMIN
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "admin-1", email: "admin@e3.qa", role: "SUPER_ADMIN" },
  }),
}));

// In-memory DB mock storing case studies
const memoryStore = new Map<string, any>();

vi.mock("@/lib/db", () => {
  const mockDb = {
    caseStudy: {
      findFirst: vi.fn().mockImplementation(({ where }: any) => {
        const idOrSlug = where?.OR?.[0]?.id || where?.OR?.[1]?.slug || where?.id || where?.slug;
        const all = Array.from(memoryStore.values());
        for (const record of all) {
          if (record.id === idOrSlug || record.slug === idOrSlug) {
            return Promise.resolve({ ...record });
          }
        }
        return Promise.resolve(null);
      }),
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        const idOrSlug = where?.id || where?.slug;
        const all = Array.from(memoryStore.values());
        for (const record of all) {
          if (record.id === idOrSlug || record.slug === idOrSlug) {
            return Promise.resolve({ ...record });
          }
        }
        return Promise.resolve(null);
      }),
      findMany: vi.fn().mockImplementation(() => {
        return Promise.resolve(Array.from(memoryStore.values()));
      }),
      create: vi.fn().mockImplementation(({ data }: any) => {
        const record = { id: `cs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, ...data };
        memoryStore.set(record.id, record);
        return Promise.resolve(record);
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        const record = memoryStore.get(where.id);
        if (!record) throw new Error("Record not found");
        const updated = { ...record, ...data, updatedAt: new Date() };
        memoryStore.set(where.id, updated);
        return Promise.resolve(updated);
      }),
      delete: vi.fn().mockImplementation(({ where }: any) => {
        const record = memoryStore.get(where.id);
        memoryStore.delete(where.id);
        return Promise.resolve(record);
      }),
    },
    caseStudyTeamMember: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: vi.fn().mockImplementation(async (cb: any) => {
      return cb(mockDb);
    }),
  };

  return {
    db: mockDb,
    default: mockDb,
  };
});

describe("Case Study Persistence & Full Round-Trip Regression Suite", () => {
  const realisticDohaBalloonFixture = {
    id: "cs_doha_balloon_2022",
    slug: "doha-balloon-parade-2022",
    titleEn: "Doha Balloon Parade 2022",
    titleAr: "مهرجان الدوحة للمناطيد ٢٠٢٢",
    clientName: "Qatar Tourism & Visit Qatar",
    year: 2022,
    category: "Mega Events & Festivals",
    heroImageUrl: "https://eeeqa.com/media/cases/doha-balloon/hero.webp",
    heroMediaType: "IMAGE",
    thumbnailUrl: "https://eeeqa.com/media/cases/doha-balloon/thumb.webp",
    thumbnailMediaType: "IMAGE",
    clientLogoUrl: "https://eeeqa.com/media/cases/doha-balloon/client-logo.svg",
    challengeEn: "Deliver Qatar's inaugural giant aerial float parade under severe coastal wind constraints in Lusail.",
    challengeAr: "تنفيذ أول مهرجان استعراضي للمناطيد والمجسمات الهوائية في قطر مع مراعاة سرعات الرياح الساحلية في لوسيل.",
    solutionEn: "Engineered 30 custom aerodynamic helium floats with synchronized DMX tracking and crowd safety perimeters.",
    solutionAr: "هندسة ٣٠ مجسماً هوائياً ديناميكياً مع أنظمة إضاءة DMX متزامنة وإدارة محكمة لمسارات وسلامة الجمهور.",
    resultEn: "Achieved record 65,000+ daily attendance with 100% safety record and global media coverage.",
    resultAr: "تحقيق رقم قياسي تجاوز ٦٥ ألف زائر يومياً مع سجل أمان تام وتغطية إعلامية عالمية واسعة.",
    isFeatured: true,
    isPublished: true,
    metrics: [
      {
        id: "m-1",
        prefix: "",
        valueEn: "65,000",
        valueAr: "٦٥,٠٠٠",
        suffix: "+",
        labelEn: "Daily Spectators",
        labelAr: "زائر يومياً",
        sourceEn: "Audited by Qatar Tourism Intelligence",
        sourceAr: "موثق من هيئة السياحة القطرية",
        isHighlighted: true,
      },
      {
        id: "m-2",
        prefix: "",
        valueEn: "30",
        valueAr: "٣٠",
        suffix: " Floats",
        labelEn: "Giant Aerodynamic Floats",
        labelAr: "مجسم هوائي عملاق",
        sourceEn: "E3 Technical Production Manifest",
        sourceAr: "سجل الإنتاج الفني لشركة E3",
        isHighlighted: false,
      },
      {
        id: "m-3",
        prefix: "",
        valueEn: "2.8",
        valueAr: "٢.٨",
        suffix: " km",
        labelEn: "Parade Corridor Length",
        labelAr: "طول مسار المهرجان",
        sourceEn: "GIS Lusail Boulevard Survey",
        sourceAr: "المسح الجغرافي لدرب لوسيل",
        isHighlighted: false,
      },
      {
        id: "m-4",
        prefix: "",
        valueEn: "100",
        valueAr: "١٠٠",
        suffix: "%",
        labelEn: "Safety & Airspace Compliance",
        labelAr: "امتثال الأمان والملاحة الجوية",
        sourceEn: "Civil Aviation Authority Certificate",
        sourceAr: "شهادة الهيئة العامة للطيران المدني",
        isHighlighted: true,
      },
      {
        id: "m-5",
        prefix: "",
        valueEn: "14",
        valueAr: "١٤",
        suffix: " Days",
        labelEn: "Rapid Turnkey Deployment",
        labelAr: "أيام التنفيذ الشامل",
        sourceEn: "Project Milestone Log",
        sourceAr: "جدول الإنجاز الزمني",
        isHighlighted: false,
      },
      {
        id: "m-6",
        prefix: "",
        valueEn: "120",
        valueAr: "١٢٠",
        suffix: "+",
        labelEn: "DMX Lighting Heads Synchronized",
        labelAr: "وحدة إضاءة متزامنة",
        sourceEn: "Show Control Rigging Schema",
        sourceAr: "مخطط الإضاءة والتحكم الفني",
        isHighlighted: false,
      },
      {
        id: "m-7",
        prefix: "",
        valueEn: "450",
        valueAr: "٤٥٠",
        suffix: " Staff",
        labelEn: "Marshalling & Safety Crew",
        labelAr: "طاقم التنظيم والسلامة الميدانية",
        sourceEn: "Crowd Operations Audit",
        sourceAr: "سجل إدارة الحشود الميداني",
        isHighlighted: false,
      },
      {
        id: "m-8",
        prefix: "+",
        valueEn: "85",
        valueAr: "٨٥",
        suffix: "M",
        labelEn: "Global Digital Impressions",
        labelAr: "ظهور رقمي عالمي",
        sourceEn: "Media Analytics Consortium",
        sourceAr: "تقرير التحليلات الإعلامية",
        isHighlighted: true,
      },
      {
        id: "m-9",
        prefix: "",
        valueEn: "99.4",
        valueAr: "٩٩.٤",
        suffix: "%",
        labelEn: "Visitor Satisfaction Index",
        labelAr: "مؤشر رضا الزوار",
        sourceEn: "Post-Event Independent Survey",
        sourceAr: "استبيان الجمهور المستقل",
        isHighlighted: false,
      },
    ],
    technicalSpecs: {
      durationEn: "14 Days Rapid Deployment",
      durationAr: "١٤ يوماً للتنفيذ السريع المتكامل",
      scaleEn: "2.8 km Linear Boulevard Corridor / 65k Peak Flow",
      scaleAr: "مسار بطول ٢.٨ كم في درب لوسيل بسعة ٦٥ ألف زائر",
      locationEn: "Lusail Boulevard, Doha, Qatar",
      locationAr: "درب لوسيل، الدوحة، دولة قطر",
      deliverablesEn: [
        "30 Aerodynamic Helium Float Structures",
        "DMX Synchronized Show Control & Lighting Array",
        "Public Safety Barriers & Crowd Corridor Engineering",
        "Civil Aviation Airspace Authorization & Pilot Management",
      ],
      deliverablesAr: [
        "تصنيع وتجهيز ٣٠ مجسماً هوائياً عملاقاً",
        "شبكة إضاءة متزامنة مع نظام التحكم المركزي",
        "هندسة حواجز السلامة وتوزيع مسارات الحشود",
        "تنسيق تراخيص الملاحة الجوية وإدارة طواقم التحليق",
      ],
    },
    servicesUsed: ["mega-events", "spatial-design", "experiential-marketing"],
    beforeAfter: {
      enabled: true,
      beforeImageUrl: "https://eeeqa.com/media/cases/doha-balloon/before.webp",
      afterImageUrl: "https://eeeqa.com/media/cases/doha-balloon/after.webp",
      beforeCaptionEn: "Standard Boulevard Infrastructure Prior to Build",
      beforeCaptionAr: "البنية التحتية الاعتيادية للشارع قبل الإطلاق",
      afterCaptionEn: "Immersive Festival Corridor in Full Operation",
      afterCaptionAr: "المسار الاحتفالي المتكامل أثناء العرض الحي",
    },
    gallery: [
      {
        id: "gal-1",
        url: "https://eeeqa.com/media/cases/doha-balloon/gal-1.webp",
        mediaType: "IMAGE",
        captionEn: "Opening Night Parade",
        captionAr: "الليلة الافتتاحية للمهرجان",
      },
    ],
    testimonials: [
      {
        quoteEn: "E3 delivered world-class execution under challenging wind conditions.",
        quoteAr: "قدمت شركة E3 إنجازاً بمعايير عالمية متفوقة على تحديات الرياح والطقس.",
        authorEn: "Event Operations Director",
        authorAr: "مدير العمليات والفعاليات",
        companyEn: "Qatar Tourism",
        companyAr: "قطر للسياحة",
        isVerified: true,
      },
    ],
    seo: {
      metaTitleEn: "Doha Balloon Parade 2022 — E3 Event Engineering",
      metaTitleAr: "مهرجان الدوحة للمناطيد ٢٠٢٢ — هندسة الفعاليات E3",
    },
  };

  beforeEach(() => {
    memoryStore.clear();
    memoryStore.set(realisticDohaBalloonFixture.id, { ...realisticDohaBalloonFixture });
  });

  it("1. Submitted payload contains every affected new field", () => {
    const payload = {
      slug: realisticDohaBalloonFixture.slug,
      titleEn: realisticDohaBalloonFixture.titleEn,
      titleAr: realisticDohaBalloonFixture.titleAr,
      technicalSpecs: realisticDohaBalloonFixture.technicalSpecs,
      servicesUsed: realisticDohaBalloonFixture.servicesUsed,
      metrics: realisticDohaBalloonFixture.metrics,
      beforeAfter: realisticDohaBalloonFixture.beforeAfter,
      isPublished: true,
      isFeatured: true,
    };

    expect(payload.technicalSpecs.durationEn).toBe("14 Days Rapid Deployment");
    expect(payload.technicalSpecs.durationAr).toBe("١٤ يوماً للتنفيذ السريع المتكامل");
    expect(payload.technicalSpecs.scaleEn).toContain("2.8 km");
    expect(payload.technicalSpecs.scaleAr).toContain("٢.٨ كم");
    expect(payload.technicalSpecs.locationEn).toContain("Lusail Boulevard");
    expect(payload.technicalSpecs.locationAr).toContain("درب لوسيل");
    expect(payload.technicalSpecs.deliverablesEn.length).toBe(4);
    expect(payload.technicalSpecs.deliverablesAr.length).toBe(4);
    expect(payload.servicesUsed).toEqual(["mega-events", "spatial-design", "experiential-marketing"]);
    expect(payload.metrics.length).toBe(9);
  });

  it("2. API accepts and stores every affected field via PUT", async () => {
    const req = new Request("http://localhost:3000/api/b2b/cases/cs_doha_balloon_2022", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(realisticDohaBalloonFixture),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "cs_doha_balloon_2022" }) });
    expect(res.status).toBe(200);

    const stored = memoryStore.get("cs_doha_balloon_2022");
    expect(stored).toBeDefined();
    expect(stored.technicalSpecs).toEqual(realisticDohaBalloonFixture.technicalSpecs);
    expect(stored.servicesUsed).toEqual(realisticDohaBalloonFixture.servicesUsed);
    expect(stored.metrics).toEqual(realisticDohaBalloonFixture.metrics);
    expect(stored.beforeAfter).toEqual(realisticDohaBalloonFixture.beforeAfter);
  });

  it("2b. API creates new case study with every affected field via POST", async () => {
    const newCasePayload = {
      ...realisticDohaBalloonFixture,
      slug: "new-doha-festival-2025",
      titleEn: "New Doha Festival 2025",
      titleAr: "مهرجان الدوحة الجديد ٢٠٢٥",
    };

    const req = new Request("http://localhost:3000/api/b2b/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCasePayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    const created = memoryStore.get(json.caseStudy.id);
    expect(created).toBeDefined();
    expect(created.slug).toBe("new-doha-festival-2025");
    expect(created.technicalSpecs).toEqual(newCasePayload.technicalSpecs);
    expect(created.servicesUsed).toEqual(newCasePayload.servicesUsed);
    expect(created.metrics).toEqual(newCasePayload.metrics);
    expect(created.beforeAfter).toEqual(newCasePayload.beforeAfter);
  });

  it("3. Existing unrelated fields are completely preserved after update", async () => {
    const updatePayload = {
      ...realisticDohaBalloonFixture,
      technicalSpecs: {
        ...realisticDohaBalloonFixture.technicalSpecs,
        locationEn: "Updated Lusail Arena",
      },
    };

    const req = new Request("http://localhost:3000/api/b2b/cases/cs_doha_balloon_2022", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "cs_doha_balloon_2022" }) });
    expect(res.status).toBe(200);

    const stored = memoryStore.get("cs_doha_balloon_2022");
    expect(stored.slug).toBe("doha-balloon-parade-2022");
    expect(stored.clientName).toBe("Qatar Tourism & Visit Qatar");
    expect(stored.year).toBe(2022);
    expect(stored.category).toBe("Mega Events & Festivals");
    expect(stored.isFeatured).toBe(true);
    expect(stored.isPublished).toBe(true);
    expect(stored.heroImageUrl).toBe("https://eeeqa.com/media/cases/doha-balloon/hero.webp");
    expect(stored.challengeEn).toBe(realisticDohaBalloonFixture.challengeEn);
    expect(stored.solutionEn).toBe(realisticDohaBalloonFixture.solutionEn);
    expect(stored.resultEn).toBe(realisticDohaBalloonFixture.resultEn);
    expect(stored.testimonials.length).toBe(1);
    expect(stored.gallery.length).toBe(1);
  });

  it("4. EN and AR values remain strictly separate across all bilingual fields", () => {
    const specs = realisticDohaBalloonFixture.technicalSpecs;
    expect(specs.durationEn).not.toBe(specs.durationAr);
    expect(specs.scaleEn).not.toBe(specs.scaleAr);
    expect(specs.locationEn).not.toBe(specs.locationAr);
    expect(specs.deliverablesEn).not.toEqual(specs.deliverablesAr);

    realisticDohaBalloonFixture.metrics.forEach((metric) => {
      expect(metric.labelEn).not.toBe(metric.labelAr);
      expect(metric.sourceEn).not.toBe(metric.sourceAr);
    });
  });

  it("5. Multiline deliverables preserve items and exact ordering", () => {
    const specs = realisticDohaBalloonFixture.technicalSpecs;
    expect(specs.deliverablesEn[0]).toBe("30 Aerodynamic Helium Float Structures");
    expect(specs.deliverablesEn[1]).toBe("DMX Synchronized Show Control & Lighting Array");
    expect(specs.deliverablesEn[2]).toBe("Public Safety Barriers & Crowd Corridor Engineering");
    expect(specs.deliverablesEn[3]).toBe("Civil Aviation Airspace Authorization & Pilot Management");

    expect(specs.deliverablesAr[0]).toBe("تصنيع وتجهيز ٣٠ مجسماً هوائياً عملاقاً");
    expect(specs.deliverablesAr[1]).toBe("شبكة إضاءة متزامنة مع نظام التحكم المركزي");
  });

  it("6. All nine metric citations persist independently with prefixes and suffixes", () => {
    const metrics = realisticDohaBalloonFixture.metrics;
    expect(metrics.length).toBe(9);

    // Verify independent citation preservation for every single metric
    const citationsEn = metrics.map((m) => m.sourceEn);
    const citationsAr = metrics.map((m) => m.sourceAr);

    expect(citationsEn.filter(Boolean).length).toBe(9);
    expect(citationsAr.filter(Boolean).length).toBe(9);
    expect(citationsEn[0]).toBe("Audited by Qatar Tourism Intelligence");
    expect(citationsAr[0]).toBe("موثق من هيئة السياحة القطرية");
    expect(citationsEn[3]).toBe("Civil Aviation Authority Certificate");
    expect(citationsEn[7]).toBe("Media Analytics Consortium");
  });

  it("7. Editor rehydration properly restores technicalSpecs, metrics citations, beforeAfter, and servicesUsed", () => {
    const dbRecord = memoryStore.get("cs_doha_balloon_2022");

    // Simulate page.tsx server normalization
    let rawTech: any = dbRecord.technicalSpecs;
    if (typeof rawTech === "string") rawTech = JSON.parse(rawTech);

    const normalizedMetrics = dbRecord.metrics.map((m: any) => ({
      id: m?.id || undefined,
      prefix: m?.prefix || "",
      valueEn: m?.valueEn || m?.value || "",
      valueAr: m?.valueAr || m?.value || "",
      suffix: m?.suffix || "",
      labelEn: m?.labelEn || m?.label || "",
      labelAr: m?.labelAr || m?.label || "",
      sourceEn: m?.sourceEn || m?.source || "",
      sourceAr: m?.sourceAr || m?.source || "",
      isHighlighted: Boolean(m?.isHighlighted),
    }));

    expect(rawTech.durationEn).toBe("14 Days Rapid Deployment");
    expect(rawTech.scaleEn).toContain("2.8 km");
    expect(rawTech.locationEn).toContain("Lusail Boulevard");
    expect(rawTech.deliverablesEn.length).toBe(4);
    expect(rawTech.deliverablesAr.length).toBe(4);

    expect(normalizedMetrics.length).toBe(9);
    expect(normalizedMetrics[0].sourceEn).toBe("Audited by Qatar Tourism Intelligence");
    expect(normalizedMetrics[0].sourceAr).toBe("موثق من هيئة السياحة القطرية");
    expect(normalizedMetrics[7].prefix).toBe("+");
    expect(normalizedMetrics[7].suffix).toBe("M");

    expect(dbRecord.beforeAfter.enabled).toBe(true);
    expect(dbRecord.beforeAfter.beforeImageUrl).toBe("https://eeeqa.com/media/cases/doha-balloon/before.webp");
    expect(dbRecord.servicesUsed).toEqual(["mega-events", "spatial-design", "experiential-marketing"]);
  });

  it("8. Public EN/AR presentation adapter correctly shapes presentation model", () => {
    const dbRecord = memoryStore.get("cs_doha_balloon_2022");
    const presentation = adaptDbCaseStudyToPresentation(dbRecord);

    expect(presentation.scopeTimeline.durationEn).toBe("14 Days Rapid Deployment");
    expect(presentation.scopeTimeline.durationAr).toBe("١٤ يوماً للتنفيذ السريع المتكامل");
    expect(presentation.scopeTimeline.scaleEn).toContain("2.8 km");
    expect(presentation.scopeTimeline.locationEn).toContain("Lusail Boulevard");
    expect(presentation.scopeTimeline.deliverablesEn?.length).toBe(4);
    expect(presentation.scopeTimeline.deliverablesAr?.length).toBe(4);
    expect(presentation.scopeTimeline.disciplines).toEqual(["mega-events", "spatial-design", "experiential-marketing"]);

    expect(presentation.metrics.length).toBe(9);
    expect(presentation.metrics[0].sourceEn).toBe("Audited by Qatar Tourism Intelligence");
    expect(presentation.metrics[0].sourceAr).toBe("موثق من هيئة السياحة القطرية");

    expect(presentation.beforeAfter?.enabled).toBe(true);
    expect(presentation.beforeAfter?.beforeImageUrl).toBe("https://eeeqa.com/media/cases/doha-balloon/before.webp");
    expect(presentation.beforeAfter?.afterImageUrl).toBe("https://eeeqa.com/media/cases/doha-balloon/after.webp");
  });

  it("9. Missing optional fields suppress only their own public UI sections", () => {
    const minimalRecord = {
      id: "cs_minimal",
      slug: "minimal-case",
      titleEn: "Minimal Case Study",
      titleAr: "دراسة حالة مصغرة",
      clientName: "Private Client",
      year: 2023,
      isPublished: true,
      metrics: [],
      technicalSpecs: {},
      servicesUsed: [],
      beforeAfter: null,
      testimonials: [],
      gallery: [],
    };

    const presentation = adaptDbCaseStudyToPresentation(minimalRecord);

    // ImpactMetricsGrid returns null when metrics empty
    const metricsHtml = renderToStaticMarkup(
      React.createElement(ImpactMetricsGrid, { locale: "en", metrics: presentation.metrics })
    );
    expect(metricsHtml).toBe("");

    // CaseScopeTimeline returns null when scope is empty
    const scopeHtml = renderToStaticMarkup(
      React.createElement(CaseScopeTimeline, { locale: "en", scope: presentation.scopeTimeline })
    );
    expect(scopeHtml).toBe("");

    // CaseBeforeAfterSlider returns null when beforeAfter is null
    const beforeAfterHtml = renderToStaticMarkup(
      React.createElement(CaseBeforeAfterSlider, { locale: "en", beforeAfter: presentation.beforeAfter })
    );
    expect(beforeAfterHtml).toBe("");
  });

  it("10. Saving these fields does not alter publication, featured status, media or slug", async () => {
    const initialRecord = memoryStore.get("cs_doha_balloon_2022");
    expect(initialRecord.isPublished).toBe(true);
    expect(initialRecord.isFeatured).toBe(true);
    expect(initialRecord.slug).toBe("doha-balloon-parade-2022");

    const req = new Request("http://localhost:3000/api/b2b/cases/cs_doha_balloon_2022", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...initialRecord,
        technicalSpecs: {
          ...initialRecord.technicalSpecs,
          durationEn: "16 Days Extended",
        },
      }),
    });

    await PUT(req, { params: Promise.resolve({ id: "cs_doha_balloon_2022" }) });

    const updatedRecord = memoryStore.get("cs_doha_balloon_2022");
    expect(updatedRecord.isPublished).toBe(true);
    expect(updatedRecord.isFeatured).toBe(true);
    expect(updatedRecord.slug).toBe("doha-balloon-parade-2022");
    expect(updatedRecord.heroImageUrl).toBe("https://eeeqa.com/media/cases/doha-balloon/hero.webp");
    expect(updatedRecord.technicalSpecs.durationEn).toBe("16 Days Extended");
  });
});
