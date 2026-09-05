import { describe, it, expect } from "vitest";
import React from "react";
import {
  normalizeMemberForPDF,
  TeamProfilePDFDocument,
  TeamProfileA4Page,
} from "../components/dashboard/team/TeamProfilePDFDocument";

describe("E3 Branded A4 Team Profile PDF Engine", () => {
  it("normalizes employee profile data into exact A4 branded fields", () => {
    const rawEmployee = {
      id: "emp-1",
      firstName: "Marcialou",
      lastName: "Macatangay",
      designation: "Events & Entertainment Coordinator",
      department: "Events & Entertainment",
      yearsOfExperience: 17,
      tagline: "Coordinated a large balloon-drop moment for the opening ceremony.",
      aboutSummary: "Marcialou M. Macatangay has 17 years of experience in live entertainment.",
      coreCompetencies: JSON.stringify([
        "Birthday-event coordination",
        "Live entertainment",
        "Artist and performer management",
        "Programme design",
      ]),
      projects: JSON.stringify([
        { name: "900 Park Events", year: 2024, role: "Artist Coordinator" },
        { name: "Inflatapark - City Center", year: 2025, role: "Birthday Event Coordinator" },
      ]),
      experience: JSON.stringify([
        { summary: "Coordinates birthday celebrations from concept through execution." },
        { summary: "Leads performer schedules and backstage requirements for live entertainment." },
      ]),
    };

    const normalized = normalizeMemberForPDF(rawEmployee, 0);

    expect(normalized.fullName).toBe("Marcialou Macatangay");
    expect(normalized.department).toBe("EVENTS & ENTERTAINMENT");
    expect(normalized.yearsOfExperience).toBe(17);
    expect(normalized.pageNumStr).toBe("01");
    expect(normalized.coreExpertise).toHaveLength(4);
    expect(normalized.coreExpertise[0]).toBe("Birthday-event coordination");
    expect(normalized.selectedProjects).toHaveLength(2);
    expect(normalized.selectedProjects[0].name).toBe("900 Park Events");
    expect(normalized.professionalHighlights).toHaveLength(2);
    expect(normalized.signatureContribution).toContain("balloon-drop");
  });

  it("handles empty / fallback fields gracefully without crashing", () => {
    const emptyEmployee = {};
    const normalized = normalizeMemberForPDF(emptyEmployee, 10);

    expect(normalized.fullName).toBe("E3 Team Member");
    expect(normalized.yearsOfExperience).toBe(5);
    expect(normalized.pageNumStr).toBe("11");
    expect(normalized.coreExpertise.length).toBeGreaterThan(0);
    expect(normalized.selectedProjects.length).toBeGreaterThan(0);
    expect(normalized.signatureContribution).toBeDefined();
  });

  it("constructs multi-page TeamProfilePDFDocument for bulk employee export", () => {
    const members = [
      { id: "1", firstName: "Alice", lastName: "Smith", designation: "Director" },
      { id: "2", firstName: "Bob", lastName: "Jones", designation: "Producer" },
      { id: "3", firstName: "Charlie", lastName: "Brown", designation: "Coordinator" },
    ];

    const doc = TeamProfilePDFDocument({ members });
    expect(doc).toBeDefined();
    expect(doc.props.children).toHaveLength(3);
  });
});
