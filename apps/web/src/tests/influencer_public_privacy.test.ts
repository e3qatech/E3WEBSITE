import { describe, it, expect } from "vitest";

describe("Influencer Public Data Projections & Qatar PDPL Privacy Rules", () => {
  const fullCreatorRecord = {
    id: "inf_123",
    displayName: "Dana Al-Ali",
    legalName: "Dana Ahmed Mohammed Al-Ali",
    email: "dana.private@example.com",
    phone: "+974 5500 1122",
    whatsapp: "+974 5500 1122",
    profileImage: "https://media.e3.qa/creators/dana.jpg",
    bioEn: "Lifestyle and family content creator based in Doha.",
    bioAr: "صانعة محتوى أسلوب حياة وعائلة في الدوحة.",
    location: "Doha, Qatar",
    nationality: "Qatari",
    isQatarBased: true,
    creatorTier: "MICRO",
    status: "ACTIVE",
    categories: ["LIFESTYLE", "FAMILY"],
    languages: ["ar", "en"],
    website: "https://danaalali.qa",
    contentSuitability: "FAMILY_FRIENDLY",
    brandSafetyStatus: "VERIFIED_SAFE",
    brandSafetyNotes: "Highly compliant with E3 guidelines. No brand conflicts.",
    agencyName: "Talent Qatar",
    agencyContactName: "Sara Agency Lead",
    agencyEmail: "sara@talentqatar.qa",
    agencyPhone: "+974 4400 9988",
    overallScore: 92.5,
    internalRating: 5,
    reliabilityScore: 98,
    publicFeatureEnabled: true,
    publicConsentAt: new Date("2026-01-15"),
    dataConsentAt: new Date("2026-01-15"),
    communicationConsentAt: new Date("2026-01-15"),
    agreedRate: 7500,
    invoiceNumber: "INV-2026-042",
    bankAccountIban: "QA12QNBA00000000123456",
  };

  function projectPublicCreator(creator: typeof fullCreatorRecord) {
    // Only active, public-consented creators can be featured
    if (
      creator.status !== "ACTIVE" ||
      !creator.publicFeatureEnabled ||
      !creator.publicConsentAt ||
      creator.brandSafetyStatus === "RESTRICTED"
    ) {
      return null;
    }

    // Explicit minimal projection
    return {
      id: creator.id,
      displayName: creator.displayName,
      profileImage: creator.profileImage,
      bioEn: creator.bioEn,
      bioAr: creator.bioAr,
      location: creator.location,
      nationality: creator.nationality,
      isQatarBased: creator.isQatarBased,
      categories: creator.categories,
      website: creator.website,
    };
  }

  it("projects only non-sensitive public fields for public directory", () => {
    const publicData = projectPublicCreator(fullCreatorRecord);
    expect(publicData).not.toBeNull();

    // Verify allowed fields
    expect(publicData?.displayName).toBe("Dana Al-Ali");
    expect(publicData?.profileImage).toBe("https://media.e3.qa/creators/dana.jpg");
    expect(publicData?.categories).toEqual(["LIFESTYLE", "FAMILY"]);

    // STRICT CHECKS: Sensitive fields MUST be undefined
    const keys = Object.keys(publicData!);
    expect(keys).not.toContain("legalName");
    expect(keys).not.toContain("email");
    expect(keys).not.toContain("phone");
    expect(keys).not.toContain("whatsapp");
    expect(keys).not.toContain("overallScore");
    expect(keys).not.toContain("internalRating");
    expect(keys).not.toContain("brandSafetyNotes");
    expect(keys).not.toContain("agencyContactName");
    expect(keys).not.toContain("agencyEmail");
    expect(keys).not.toContain("agencyPhone");
    expect(keys).not.toContain("agreedRate");
    expect(keys).not.toContain("invoiceNumber");
    expect(keys).not.toContain("bankAccountIban");
  });

  it("blocks creators without public consent from public projection", () => {
    const unconsentedCreator = {
      ...fullCreatorRecord,
      publicConsentAt: null,
    };
    expect(projectPublicCreator(unconsentedCreator as any)).toBeNull();
  });

  it("blocks non-active or restricted creators from public projection", () => {
    const prospectCreator = { ...fullCreatorRecord, status: "PROSPECT" };
    expect(projectPublicCreator(prospectCreator)).toBeNull();

    const restrictedCreator = { ...fullCreatorRecord, brandSafetyStatus: "RESTRICTED" };
    expect(projectPublicCreator(restrictedCreator)).toBeNull();
  });
});
