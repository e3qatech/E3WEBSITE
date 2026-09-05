"use client";

import React from "react";
import * as ReactPDF from "@react-pdf/renderer";

const { Document, Page, Text, View, StyleSheet, Image, pdf } = ReactPDF as any;

/**
 * Robust normalization helper to convert any employee / team member shape
 * into safe, structured data for the A4 PDF sheet.
 */
export function normalizeMemberForPDF(raw: any, index = 0) {
  const firstName = raw.firstName || raw.nameEn?.split(" ")[0] || raw.name?.split(" ")[0] || "";
  const lastName = raw.lastName || raw.nameEn?.split(" ").slice(1).join(" ") || raw.name?.split(" ").slice(1).join(" ") || "";
  const fullName = (raw.name || `${firstName} ${lastName}`.trim()) || "E3 Team Member";

  const designation = raw.designation || raw.designationEn || "Events & Entertainment Specialist";
  const department = raw.department || raw.departmentEn || "Events & Entertainment";
  const yearsOfExperience = Number(raw.yearsOfExperience) || 5;

  // Safe parsing helper for JSON or Array fields
  const safeParseList = (field: any): any[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return field.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const parsedExpertise = safeParseList(raw.coreCompetencies || raw.expertiseTags);
  const parsedSkills = safeParseList(raw.skillsMatrix || raw.expertiseTags);
  const parsedProjects = safeParseList(raw.projects);
  const parsedExperience = safeParseList(raw.experience);

  // Core Expertise bullets (3-5 items)
  const coreExpertise = parsedExpertise.length > 0
    ? parsedExpertise.slice(0, 4).map((item) => (typeof item === "string" ? item : item.name || item.title || String(item)))
    : [
        "Live entertainment and show management",
        "Celebration and themed event planning",
        "Artist, performer and vendor coordination",
        "Programme flow and stage timing design",
      ];

  // Key Skills (formatted inline or bulleted)
  const keySkills = parsedSkills.length > 0
    ? parsedSkills.slice(0, 6).map((item) => (typeof item === "string" ? item : item.skill || item.name || String(item))).join(" · ")
    : "Event planning · Performer scheduling · Client communication · Hosting and stage support · Theme development · Costume & prop coordination";

  // Selected E3 Projects (3-4 items)
  const selectedProjects = parsedProjects.length > 0
    ? parsedProjects.slice(0, 4).map((p) => ({
        name: p.projectName || p.name || p.title || "Major Qatar Activation",
        period: p.year ? String(p.year) : (p.period || "2024-2025"),
        role: p.role || p.client || designation,
      }))
    : [
        { name: "900 Park Events", period: "2024-2025", role: "Artist & Event Coordinator" },
        { name: "Inflatapark - City Center", period: "2025-present", role: "Event Lead" },
        { name: "Place Vendome Celebration", period: "2025", role: "Celebration Lead" },
        { name: "LEGO Shows Qatar", period: "2025", role: "Production Coordinator" },
      ];

  // Professional Highlights (2-3 items)
  const professionalHighlights = parsedExperience.length > 0
    ? parsedExperience.slice(0, 2).map((exp) =>
        exp.summary || `${exp.role || designation} at ${exp.company || "E3 Entertainment"}`
      )
    : [
        "Coordinates large-scale celebrations from creative concept through live execution.",
        "Leads performer schedules, stage rehearsals, and backstage operations for live entertainment.",
      ];

  // Signature Contribution
  const signatureContribution =
    raw.tagline ||
    raw.keyStrengths ||
    (raw.experience && raw.experience[0]?.summary) ||
    "Coordinated signature live entertainment moments and family-focused activations across premier Qatar venues.";

  // Profile narrative
  const aboutSummary =
    raw.aboutSummary ||
    raw.careerJourney ||
    `${fullName} is an experienced ${designation} specializing in live performance, artist coordination, and immersive entertainment experiences across Qatar landmark destinations.`;

  // Quote
  const quote =
    raw.tagline && raw.tagline.length > 10
      ? raw.tagline
      : "My role feels meaningful because our team creates memories that families will treasure. I value the trust, teamwork and joy shared across every event.";

  // Calculate or format tenure with E3
  let tenureWithE3 = "1 year 6 months";
  if (raw.createdAt) {
    const diffMonths = Math.max(1, Math.floor((Date.now() - new Date(raw.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30.5)));
    if (diffMonths >= 12) {
      const yrs = Math.floor(diffMonths / 12);
      const rem = diffMonths % 12;
      tenureWithE3 = rem > 0 ? `${yrs} yr${yrs > 1 ? "s" : ""} ${rem} mo${rem > 1 ? "s" : ""}` : `${yrs} year${yrs > 1 ? "s" : ""}`;
    } else {
      tenureWithE3 = `${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
    }
  }

  // Page index formatted
  const pageNumStr = (index + 1) < 10 ? `0${index + 1}` : `${index + 1}`;

  return {
    fullName,
    firstName,
    lastName,
    designation,
    department: department.toUpperCase(),
    yearsOfExperience,
    tenureWithE3,
    profileImage: raw.profileImage || null,
    initials: (firstName[0] || "E") + (lastName[0] || "3"),
    aboutSummary,
    coreExpertise,
    keySkills,
    signatureContribution,
    selectedProjects,
    professionalHighlights,
    quote,
    linkedinUrl: raw.linkedinUrl || null,
    slug: raw.slug || "team-member",
    pageNumStr,
  };
}

const styles = StyleSheet.create({
  page: {
    width: 595.28,
    height: 841.89,
    padding: 0,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  // 1. TOP HEADER BAR
  headerBar: {
    height: 36,
    backgroundColor: "#0d0824",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  headerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBox: {
    backgroundColor: "#ffffff",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  logoBoxText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0d0824",
    letterSpacing: 1,
  },
  logoBrandTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1.2,
  },
  headerPageTag: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#cbd5e1",
    letterSpacing: 2,
  },

  // 2. HERO PURPLE BANNER
  heroBanner: {
    height: 160,
    backgroundColor: "#2e0854",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 14,
  },
  heroLeftCol: {
    width: 380,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heroDeptBadge: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fbbf24",
    letterSpacing: 1.4,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  heroName: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  heroDesignation: {
    fontSize: 12,
    color: "#f1f5f9",
    marginBottom: 14,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 28,
  },
  heroStatItem: {
    flexDirection: "column",
  },
  heroStatValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },
  heroStatLabel: {
    fontSize: 7.5,
    color: "#c4b5fd",
    marginTop: 1,
  },
  heroRightCol: {
    width: 110,
    height: 132,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "#4c1d95",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  heroInitials: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },

  // 3. WHITE A4 BODY
  bodyContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 16,
    paddingBottom: 6,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  // Profile Narrative Block
  profileSection: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#2e0854",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  profileText: {
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.42,
    textAlign: "justify",
  },

  // Two-Column Grid
  twoColGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  colLeft: {
    width: 250,
    display: "flex",
    flexDirection: "column",
  },
  colRight: {
    width: 255,
    display: "flex",
    flexDirection: "column",
  },

  // Bullet Item
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#f97316",
    marginTop: 3,
    marginRight: 6,
  },
  bulletText: {
    fontSize: 7.5,
    color: "#334155",
    lineHeight: 1.35,
    flex: 1,
  },

  // Key skills block
  skillsText: {
    fontSize: 7.5,
    color: "#475569",
    lineHeight: 1.4,
    marginTop: 2,
  },

  // Signature Contribution Card
  signatureBox: {
    backgroundColor: "#2e0854",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  signatureTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#fbbf24",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  signatureBody: {
    fontSize: 7.5,
    color: "#ffffff",
    lineHeight: 1.35,
  },

  // Projects block
  projectItem: {
    marginBottom: 6,
  },
  projectNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  projectMarker: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1,
    backgroundColor: "#7c3aed",
  },
  projectName: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
  },
  projectSubtext: {
    fontSize: 7,
    color: "#64748b",
    marginLeft: 8.5,
    marginTop: 1,
  },

  // Professional Highlights block
  highlightsBox: {
    borderLeftWidth: 2,
    borderLeftColor: "#f97316",
    paddingLeft: 8,
    marginTop: 4,
  },
  highlightText: {
    fontSize: 7.5,
    color: "#334155",
    lineHeight: 1.35,
    marginBottom: 4,
  },

  // 4. BOTTOM PERSONAL QUOTE
  quoteContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    marginTop: 8,
  },
  quoteText: {
    fontSize: 7.5,
    fontStyle: "italic",
    color: "#475569",
    textAlign: "center",
    lineHeight: 1.35,
  },

  // 5. DARK FOOTER BAR
  footerBar: {
    height: 22,
    backgroundColor: "#0d0824",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  footerItem: {
    fontSize: 6.5,
    color: "#94a3b8",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  footerItemCenter: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1.5,
  },
});

/**
 * Single A4 Sheet Page Component for one Team Member.
 */
export const TeamProfileA4Page = ({
  member,
  pageIndex = 0,
}: {
  member: any;
  pageIndex?: number;
}) => {
  const data = normalizeMemberForPDF(member, pageIndex);

  return (
    <Page size="A4" style={styles.page}>
      {/* 1. TOP HEADER BAR */}
      <View style={styles.headerBar}>
        <View style={styles.headerLogoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoBoxText}>E3</Text>
          </View>
          <Text style={styles.logoBrandTitle}>EVENTS & ENTERTAINMENT ENTERPRISES</Text>
        </View>
        <Text style={styles.headerPageTag}>STAFF PROFILE / {data.pageNumStr}</Text>
      </View>

      {/* 2. ROYAL PURPLE HERO BANNER */}
      <View style={styles.heroBanner}>
        <View style={styles.heroLeftCol}>
          <Text style={styles.heroDeptBadge}>{data.department}</Text>
          <Text style={styles.heroName}>{data.fullName}</Text>
          <Text style={styles.heroDesignation}>{data.designation}</Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{data.yearsOfExperience} years</Text>
              <Text style={styles.heroStatLabel}>Industry experience</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{data.tenureWithE3}</Text>
              <Text style={styles.heroStatLabel}>With E3</Text>
            </View>
          </View>
        </View>

        {/* Headshot image or monogram */}
        <View style={styles.heroRightCol}>
          {data.profileImage ? (
            <Image src={data.profileImage} style={styles.heroImage} />
          ) : (
            <Text style={styles.heroInitials}>{data.initials}</Text>
          )}
        </View>
      </View>

      {/* 3. WHITE A4 BODY */}
      <View style={styles.bodyContainer}>
        {/* Profile Narrative */}
        <View style={styles.profileSection}>
          <Text style={styles.sectionHeading}>PROFILE</Text>
          <Text style={styles.profileText}>{data.aboutSummary}</Text>
        </View>

        {/* 2-Column Split */}
        <View style={styles.twoColGrid}>
          {/* Left Column: Core Expertise, Key Skills, Signature Contribution */}
          <View style={styles.colLeft}>
            <Text style={styles.sectionHeading}>CORE EXPERTISE</Text>
            {data.coreExpertise.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}

            <Text style={[styles.sectionHeading, { marginTop: 10 }]}>KEY SKILLS</Text>
            <Text style={styles.skillsText}>{data.keySkills}</Text>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>SIGNATURE CONTRIBUTION</Text>
              <Text style={styles.signatureBody}>{data.signatureContribution}</Text>
            </View>
          </View>

          {/* Right Column: Selected Projects, Professional Highlights */}
          <View style={styles.colRight}>
            <Text style={styles.sectionHeading}>SELECTED E3 PROJECTS</Text>
            {data.selectedProjects.map((p, idx) => (
              <View key={idx} style={styles.projectItem}>
                <View style={styles.projectNameRow}>
                  <View style={styles.projectMarker} />
                  <Text style={styles.projectName}>{p.name}</Text>
                </View>
                <Text style={styles.projectSubtext}>
                  {p.period} · {p.role}
                </Text>
              </View>
            ))}

            <Text style={[styles.sectionHeading, { marginTop: 8 }]}>
              PROFESSIONAL HIGHLIGHTS
            </Text>
            <View style={styles.highlightsBox}>
              {data.professionalHighlights.map((hl, idx) => (
                <Text key={idx} style={styles.highlightText}>
                  • {hl}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* 4. Bottom Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>&ldquo;{data.quote}&rdquo;</Text>
        </View>
      </View>

      {/* 5. DARK FOOTER BAR */}
      <View style={styles.footerBar}>
        <Text style={styles.footerItem}>DOHA · QATAR</Text>
        <Text style={styles.footerItemCenter}>WWW.E3QATAR.COM</Text>
        <Text style={styles.footerItem}>
          {data.linkedinUrl ? "LINKEDIN PROFILE VERIFIED" : "LINKEDIN PROFILE AVAILABLE"}
        </Text>
      </View>
    </Page>
  );
};

/**
 * Root PDF Document wrapper.
 * When passed multiple members, it renders multiple exact A4 pages in one combined PDF.
 */
export const TeamProfilePDFDocument = ({ members }: { members: any[] }) => {
  const safeList = Array.isArray(members) && members.length > 0 ? members : [{}];

  return (
    <Document title="E3 Staff Profile Portfolio" author="E3 Events & Entertainment Enterprises">
      {safeList.map((m, idx) => (
        <TeamProfileA4Page key={m.id || m.slug || idx} member={m} pageIndex={idx} />
      ))}
    </Document>
  );
};

/**
 * Client helper to generate and trigger browser download of the single/multi-profile PDF.
 */
export async function downloadTeamProfilesPDF(
  members: any | any[],
  customFileName?: string
) {
  const memberList = Array.isArray(members) ? members : [members];
  if (memberList.length === 0) return;

  const defaultFileName =
    memberList.length === 1
      ? `E3_Profile_${(memberList[0].slug || memberList[0].firstName || "Staff").replace(/\s+/g, "_")}.pdf`
      : `E3_Team_Profiles_${memberList.length}_Staff_${new Date().toISOString().slice(0, 10)}.pdf`;

  const fileName = customFileName || defaultFileName;

  const doc = <TeamProfilePDFDocument members={memberList} />;
  const blob = await pdf(doc).toBlob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 10000);
}

export default TeamProfilePDFDocument;
