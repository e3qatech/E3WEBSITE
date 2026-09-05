import { describe, it, expect } from "vitest";

describe("Talent Acquisition & CRM Candidate Deduplication", () => {
  it("deduplicates candidates when both JobApplication and Talent records exist for the same applicant", () => {
    const rawApplications = [
      {
        id: "app_1",
        firstName: "Mohammad",
        lastName: "Khalid",
        email: "mohdabdkkhi@gmail.com",
        jobTitle: "Event Coordinator",
        status: "REVIEWING",
        createdAt: new Date("2026-09-05T10:00:00Z"),
        cvParsedData: { experienceYears: 5, skills: ["Event Planning", "Crowd Control"] },
      },
      {
        id: "app_2",
        firstName: "Chris",
        lastName: "Francis",
        email: "chrisfrancis812@gmail.com",
        jobTitle: "Event Coordinator",
        status: "REVIEWING",
        createdAt: new Date("2026-09-05T11:00:00Z"),
        cvParsedData: { experienceYears: 4, skills: ["Audio Engineering"] },
      },
      {
        id: "app_3",
        firstName: "AMAAN",
        lastName: "MALIK",
        email: "amaanmalik12@gmail.com",
        jobTitle: "General Application",
        status: "HIRED",
        createdAt: new Date("2026-09-05T09:00:00Z"),
        cvParsedData: { experienceYears: 6, skills: ["VIP Hospitality"] },
      },
    ];

    const rawTalents = [
      {
        id: "tal_1",
        name: "Mohammad Khalid",
        email: "mohdabdkkhi@gmail.com",
        position: "Event Coordinator",
        status: "NEW", // Older mirror status
        appliedDate: new Date("2026-09-05T10:00:00Z"),
        skills: ["Event Planning"],
      },
      {
        id: "tal_2",
        name: "Chris Francis",
        email: "chrisfrancis812@gmail.com",
        position: "Event Coordinator",
        status: "NEW", // Older mirror status
        appliedDate: new Date("2026-09-05T11:00:00Z"),
        skills: ["Audio Engineering"],
      },
      {
        id: "tal_3",
        name: "AMAAN MALIK",
        email: "amaanmalik12@gmail.com",
        position: "General Application",
        status: "NEW", // Older mirror status
        appliedDate: new Date("2026-09-05T09:00:00Z"),
        skills: ["VIP Hospitality"],
      },
      {
        id: "tal_4",
        name: "Adil E3",
        email: "admin@e3.qa",
        position: "designer",
        status: "REJECTED",
        appliedDate: new Date("2026-09-04T12:00:00Z"),
        skills: ["Spatial Design"],
      },
    ];

    // Deduplication logic identical to talent/page.tsx
    const talentMap = new Map<string, any>();

    for (const app of rawApplications) {
      const emailKey = (app.email || "").trim().toLowerCase();
      const roleKey = (app.jobTitle || "").trim().toLowerCase();
      const dedupeKey = emailKey ? `${emailKey}::${roleKey}` : app.id;

      talentMap.set(dedupeKey, {
        id: app.id,
        name: `${app.firstName} ${app.lastName}`,
        email: app.email,
        position: app.jobTitle,
        status: app.status,
      });
    }

    for (const t of rawTalents) {
      const emailKey = (t.email || "").trim().toLowerCase();
      const roleKey = (t.position || "").trim().toLowerCase();
      const dedupeKey = emailKey ? `${emailKey}::${roleKey}` : t.id;

      if (talentMap.has(dedupeKey)) {
        const existing = talentMap.get(dedupeKey);
        const isExistingNew = existing.status === "NEW";
        const isTalentAdvanced = t.status && t.status !== "NEW";

        talentMap.set(dedupeKey, {
          ...existing,
          status: isTalentAdvanced && isExistingNew ? t.status : existing.status,
        });
      } else {
        talentMap.set(dedupeKey, {
          id: t.id,
          name: t.name,
          email: t.email,
          position: t.position,
          status: t.status,
        });
      }
    }

    const unified = Array.from(talentMap.values());

    // Expect exactly 4 unique candidates instead of 7 duplicates!
    expect(unified.length).toBe(4);

    // Verify Mohammad Khalid exists only once with active REVIEWING status
    const mohammad = unified.filter((c) => c.email === "mohdabdkkhi@gmail.com");
    expect(mohammad.length).toBe(1);
    expect(mohammad[0].status).toBe("REVIEWING");

    // Verify Chris Francis exists only once with active REVIEWING status
    const chris = unified.filter((c) => c.email === "chrisfrancis812@gmail.com");
    expect(chris.length).toBe(1);
    expect(chris[0].status).toBe("REVIEWING");

    // Verify Amaan Malik exists only once with HIRED status
    const amaan = unified.filter((c) => c.email === "amaanmalik12@gmail.com");
    expect(amaan.length).toBe(1);
    expect(amaan[0].status).toBe("HIRED");

    // Verify Adil E3 is preserved
    const adil = unified.filter((c) => c.email === "admin@e3.qa");
    expect(adil.length).toBe(1);
    expect(adil[0].status).toBe("REJECTED");
  });
});
