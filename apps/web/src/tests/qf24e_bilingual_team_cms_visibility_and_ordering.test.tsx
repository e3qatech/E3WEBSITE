import { describe, it, expect } from "vitest";
import {
  resolvePublicTeamMember,
  resolvePublicTeamList,
  isTeamMemberPubliclyEligible,
  analyzeTeamMemberDataQuality,
  validateExpertiseTags,
  validateExperienceArray,
  validateProjectsArray,
  validateBilingualTeamMemberInput,
  CanonicalEmployeeInput,
} from "@/lib/team/team-resolver";

describe("QF-24-E — Bilingual Team CMS, Visibility and Ordering", () => {
  // Test Data Setup
  const sampleMemberWithArabic: CanonicalEmployeeInput = {
    id: "cmscbl39y00008ayz90qlf3t0",
    slug: "adil-ahmed",
    firstName: "Adil",
    lastName: "Ahmed",
    firstNameAr: "عادل",
    lastNameAr: "أحمد",
    designation: "Managing Director & CEO",
    designationAr: "العضو المنتدب والرئيس التنفيذي",
    department: "Executive Management",
    departmentAr: "الإدارة التنفيذية",
    yearsOfExperience: 22,
    tagline: "Visionary entertainment and experiential leader in Qatar.",
    taglineAr: "قائد تنفيذي رائد في قطاع الترفيه وصناعة التجارب في قطر.",
    aboutSummary:
      "Adil has overseen more than 150 large-scale national events across Qatar and the GCC.",
    aboutSummaryAr:
      "أشرف عادل على أكثر من 150 فعالية وطنية كبرى في جميع أنحاء دولة قطر ودول مجلس التعاون الخليجي.",
    careerJourney: "Started in event management in 2002 and founded E3.",
    careerJourneyAr: "بدأ مسيرته في إدارة الفعاليات في عام 2002 وأسس شركة إي ثري.",
    keyStrengths: "Strategic leadership, large-scale event operations.",
    keyStrengthsAr: "القيادة الاستراتيجية وإدارة العمليات للفعاليات الكبرى.",
    profileImage: "https://e3.qa/images/team/adil-ahmed.webp",
    linkedinUrl: "https://www.linkedin.com/in/adilahmed",
    isActive: true,
    showOnTeamPage: true,
    isFeatured: true,
    displayOrder: 1,
    order: 1,
    expertiseTags: ["Leadership", "Operations", "Event Production"],
    expertiseTagsAr: ["القيادة التنفيذية", "إدارة العمليات", "إنتاج الفعاليات"],
    coreCompetencies: ["Strategic Planning", "Client Relations"],
    coreCompetenciesAr: ["التخطيط الاستراتيجي", "إدارة علاقات الشركاء"],
    experience: [
      {
        role: "Managing Director & CEO",
        company: "E3 Qatar",
        duration: "2020 - Present",
        description: "Leading overall corporate and experiential operations in Qatar.",
      },
    ],
    experienceAr: [
      {
        role: "العضو المنتدب والرئيس التنفيذي",
        company: "إي ثري قطر",
        duration: "2020 - حتى الآن",
        description: "قيادة العمليات التنفيذية وتطوير التجارب الترفيهية في قطر.",
      },
    ],
    projects: [
      {
        title: "Qatar National Day Celebration",
        client: "State of Qatar",
        year: "2022",
        role: "Executive Director",
        description: "Full production and crowd management for national parade.",
      },
    ],
    projectsAr: [
      {
        title: "احتفالات اليوم الوطني لدولة قطر",
        client: "دولة قطر",
        year: "2022",
        role: "المدير التنفيذي للإنتاج",
        description: "الإنتاج المتكامل وإدارة الحشود للعرض الوطني.",
      },
    ],
  };

  const sampleMemberMissingArabic: CanonicalEmployeeInput = {
    id: "cmstest1234567890",
    slug: "john-doe",
    firstName: "John",
    lastName: "Doe",
    designation: "Technical Coordinator",
    department: "Operations",
    yearsOfExperience: 5,
    tagline: "Specialist in sound and lighting engineering.",
    aboutSummary: "John joined E3 to coordinate live audio visual setups.",
    profileImage: "https://e3.qa/images/team/john-doe.webp",
    isActive: true,
    showOnTeamPage: true,
    isFeatured: false,
    displayOrder: 10,
    order: 10,
    expertiseTags: ["Sound Engineering", "Lighting"],
    coreCompetencies: ["Audio Mixing"],
    experience: [
      {
        role: "Sound Engineer",
        company: "E3",
        duration: "2023 - Present",
        description: "Managing audio frequencies.",
      },
    ],
  };

  describe("1. Bilingual Field Resolution & English Content Preservation", () => {
    it("preserves English fields completely when locale is 'en'", () => {
      const resolvedEn = resolvePublicTeamMember(sampleMemberWithArabic, "en");

      expect(resolvedEn.name).toBe("Adil Ahmed");
      expect(resolvedEn.designation).toBe("Managing Director & CEO");
      expect(resolvedEn.department).toBe("Executive Management");
      expect(resolvedEn.tagline).toBe("Visionary entertainment and experiential leader in Qatar.");
      expect(resolvedEn.aboutSummary).toBe(
        "Adil has overseen more than 150 large-scale national events across Qatar and the GCC."
      );
      expect(resolvedEn.expertiseTags).toEqual(["Leadership", "Operations", "Event Production"]);
      expect(resolvedEn.isFeatured).toBe(true);
      expect(resolvedEn.showOnTeamPage).toBe(true);
      expect(resolvedEn.displayOrder).toBe(1);
    });

    it("renders Arabic fields when locale is 'ar' with zero English leakage", () => {
      const resolvedAr = resolvePublicTeamMember(sampleMemberWithArabic, "ar");

      expect(resolvedAr.name).toBe("عادل أحمد");
      expect(resolvedAr.designation).toBe("العضو المنتدب والرئيس التنفيذي");
      expect(resolvedAr.department).toBe("الإدارة التنفيذية");
      expect(resolvedAr.tagline).toBe("قائد تنفيذي رائد في قطاع الترفيه وصناعة التجارب في قطر.");
      expect(resolvedAr.aboutSummary).toBe(
        "أشرف عادل على أكثر من 150 فعالية وطنية كبرى في جميع أنحاء دولة قطر ودول مجلس التعاون الخليجي."
      );
      expect(resolvedAr.expertiseTags).toEqual(["القيادة التنفيذية", "إدارة العمليات", "إنتاج الفعاليات"]);
      expect(resolvedAr.coreCompetencies).toEqual(["التخطيط الاستراتيجي", "إدارة علاقات الشركاء"]);
      expect(resolvedAr.experience[0].role).toBe("العضو المنتدب والرئيس التنفيذي");
      expect(resolvedAr.projects[0].name).toBe("احتفالات اليوم الوطني لدولة قطر");
    });
  });

  describe("2. Fail-Closed Arabic Rendering for Incomplete Profiles", () => {
    it("does not leak English bio or tagline on Arabic routes when Arabic is missing", () => {
      const resolvedAr = resolvePublicTeamMember(sampleMemberMissingArabic, "ar");

      // Bio and tagline must be empty string (NEVER English raw prose)
      expect(resolvedAr.aboutSummary).toBe("");
      expect(resolvedAr.tagline).toBe("");
      // Missing custom experience in Arabic must fail closed to empty or localized terms
      resolvedAr.experience.forEach((exp) => {
        expect(/^[A-Za-z\s]+$/.test(exp.description)).toBe(false);
      });
    });
  });

  describe("3. Arabic JSON Schema Validation & Error Reporting", () => {
    it("validates valid expertise tags array", () => {
      expect(validateExpertiseTags(["الفعاليات", "الإنتاج"]).valid).toBe(true);
      expect(validateExpertiseTags(JSON.stringify(["الفعاليات"])).valid).toBe(true);
    });

    it("rejects non-array or non-string expertise tags", () => {
      const res = validateExpertiseTags([123, null]);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("must be a string");
    });

    it("validates valid experience array", () => {
      const validExp = [
        {
          role: "مدير العمليات",
          company: "إي ثري",
          duration: "2021-2024",
          description: "إدارة الفعاليات",
        },
      ];
      expect(validateExperienceArray(validExp).valid).toBe(true);
    });

    it("rejects malformed experience array", () => {
      const invalidExp = ["not an object"];
      const res = validateExperienceArray(invalidExp);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("must be an object");
    });

    it("validates valid and invalid projects array", () => {
      const validProj = [
        {
          title: "فعالية وطنية",
          client: "وزارة الثقافة",
          year: "2023",
          role: "المدير الفني",
          description: "تنظيم متكامل",
        },
      ];
      expect(validateProjectsArray(validProj).valid).toBe(true);

      const invalidProj = ["not an object"];
      expect(validateProjectsArray(invalidProj).valid).toBe(false);
    });

    it("validates full bilingual payload and aggregates errors", () => {
      const invalidPayload = {
        expertiseTagsAr: "not valid json {",
        experienceAr: [123],
      };
      const result = validateBilingualTeamMemberInput(invalidPayload);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("4. Publication Controls & Public Eligibility", () => {
    it("marks active and visible member as eligible", () => {
      const result = isTeamMemberPubliclyEligible(sampleMemberWithArabic);
      expect(result.eligible).toBe(true);
    });

    it("fails closed when isActive is false", () => {
      const inactiveMember = { ...sampleMemberWithArabic, isActive: false };
      const result = isTeamMemberPubliclyEligible(inactiveMember);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("Profile is inactive");
    });

    it("fails closed when showOnTeamPage is false", () => {
      const hiddenMember = { ...sampleMemberWithArabic, showOnTeamPage: false };
      const result = isTeamMemberPubliclyEligible(hiddenMember);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("Profile is excluded from public team page");
    });

    it("excludes hidden and inactive members from public team list", () => {
      const list = [
        sampleMemberWithArabic,
        { ...sampleMemberWithArabic, id: "hidden-1", slug: "hidden-1", showOnTeamPage: false },
        { ...sampleMemberWithArabic, id: "inactive-1", slug: "inactive-1", isActive: false },
      ];

      const publicList = resolvePublicTeamList(list, "en");
      expect(publicList.length).toBe(1);
      expect(publicList[0].id).toBe(sampleMemberWithArabic.id);
    });
  });

  describe("5. Display Ordering & Sequencing", () => {
    it("orders members by displayOrder ascending", () => {
      const member1 = { ...sampleMemberWithArabic, id: "m1", slug: "m1", displayOrder: 10 };
      const member2 = { ...sampleMemberWithArabic, id: "m2", slug: "m2", displayOrder: 2 };
      const member3 = { ...sampleMemberWithArabic, id: "m3", slug: "m3", displayOrder: 5 };

      const sorted = resolvePublicTeamList([member1, member2, member3], "en");
      expect(sorted.map((s) => s.id)).toEqual(["m2", "m3", "m1"]);
    });
  });

  describe("6. Dashboard Data Quality Report & Badges", () => {
    it("flags missing Arabic fields with clear warnings", () => {
      const report = analyzeTeamMemberDataQuality(sampleMemberMissingArabic);
      expect(report.hasMissingArabic).toBe(true);
      expect(report.isArabicComplete).toBe(false);
      expect(report.issues.some((i) => i.code === "MISSING_ARABIC_NAME")).toBe(true);
      expect(report.issues.some((i) => i.code === "MISSING_ARABIC_DESIGNATION")).toBe(true);
      expect(report.issues.some((i) => i.code === "MISSING_ARABIC_BIO")).toBe(true);
    });

    it("confirms full bilingual profile is clean of missing Arabic warnings", () => {
      const report = analyzeTeamMemberDataQuality(sampleMemberWithArabic);
      expect(report.hasMissingArabic).toBe(false);
      expect(report.isArabicComplete).toBe(true);
      expect(report.isVisible).toBe(true);
      expect(report.isFeatured).toBe(true);
    });
  });
});
