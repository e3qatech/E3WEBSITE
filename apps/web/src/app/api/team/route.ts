import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  filterAndResolvePublicTeamMembers,
  analyzeTeamMemberDataQuality,
  isTeamAuthorized,
  validateBilingualTeamMemberInput,
} from "@/lib/team/team-resolver";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const showAll = url.searchParams.get("all") === "true";
    const locale = (url.searchParams.get("locale") || "en") as "en" | "ar";

    const session = await auth();
    const isStaff = Boolean(session?.user && isTeamAuthorized((session.user as any)?.role));

    if (showAll && isStaff) {
      const allMembers = await db.employeeProfile.findMany({
        orderBy: [
          { displayOrder: "asc" },
          { order: "asc" },
          { createdAt: "asc" },
        ],
      });

      const enriched = allMembers.map((m: any) => ({
        ...m,
        dataQuality: analyzeTeamMemberDataQuality(m, allMembers),
      }));

      return NextResponse.json(enriched);
    }

    const teamMembers = await db.employeeProfile.findMany({
      where: {
        isActive: true,
        showOnTeamPage: true,
      },
      orderBy: [
        { displayOrder: "asc" },
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });

    const safePublic = filterAndResolvePublicTeamMembers(teamMembers, locale);
    return NextResponse.json(safePublic);
  } catch (error: any) {
    console.error("[TEAM_GET_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (!isTeamAuthorized((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validation
    const validation = validateBilingualTeamMemberInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      firstNameAr,
      lastNameAr,
      designation,
      designationAr,
      department,
      departmentAr,
      yearsOfExperience,
      tagline,
      taglineAr,
      heroTaglineAr,
      aboutSummary,
      aboutSummaryAr,
      careerJourney,
      careerJourneyAr,
      keyStrengths,
      keyStrengthsAr,
      profileImage,
      isActive = false,
      showOnTeamPage = true,
      isFeatured = false,
      order = 0,
      displayOrder = 0,
      linkedinUrl,
      contactEmail,
    } = body;

    const baseSlug = `${firstName || "team"}-${lastName || "member"}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = body.slug?.trim() || `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const member = await db.employeeProfile.create({
      data: {
        slug,
        firstName: firstName || "",
        lastName: lastName || "",
        firstNameAr: firstNameAr || null,
        lastNameAr: lastNameAr || null,
        designation: designation || "Team Member",
        designationAr: designationAr || null,
        department: department || "General",
        departmentAr: departmentAr || null,
        yearsOfExperience: typeof yearsOfExperience === "number" ? yearsOfExperience : 0,
        tagline: tagline || "",
        taglineAr: taglineAr || heroTaglineAr || null,
        heroTaglineAr: heroTaglineAr || taglineAr || null,
        aboutSummary: aboutSummary || "",
        aboutSummaryAr: aboutSummaryAr || null,
        careerJourney: careerJourney || "",
        careerJourneyAr: careerJourneyAr || null,
        keyStrengths: keyStrengths || "",
        keyStrengthsAr: keyStrengthsAr || null,
        profileImage: profileImage || null,
        linkedinUrl: linkedinUrl || null,
        contactEmail: contactEmail || null,
        isActive: Boolean(isActive),
        showOnTeamPage: showOnTeamPage !== false,
        isFeatured: Boolean(isFeatured),
        order: typeof order === "number" ? order : 0,
        displayOrder: typeof displayOrder === "number" ? displayOrder : (typeof order === "number" ? order : 0),
        expertiseTags: Array.isArray(body.expertiseTags) ? body.expertiseTags : [],
        expertiseTagsAr: Array.isArray(body.expertiseTagsAr) ? body.expertiseTagsAr : null,
        coreCompetencies: Array.isArray(body.coreCompetencies) ? body.coreCompetencies : [],
        coreCompetenciesAr: Array.isArray(body.coreCompetenciesAr) ? body.coreCompetenciesAr : null,
        experience: Array.isArray(body.experience) ? body.experience : [],
        experienceAr: Array.isArray(body.experienceAr) ? body.experienceAr : null,
        projects: Array.isArray(body.projects) ? body.projects : [],
        projectsAr: Array.isArray(body.projectsAr) ? body.projectsAr : null,
        certifications: Array.isArray(body.certifications) ? body.certifications : [],
        certificationsAr: Array.isArray(body.certificationsAr) ? body.certificationsAr : null,
        education: Array.isArray(body.education) ? body.education : [],
        educationAr: Array.isArray(body.educationAr) ? body.educationAr : null,
        awards: Array.isArray(body.awards) ? body.awards : [],
        awardsAr: Array.isArray(body.awardsAr) ? body.awardsAr : null,
        skillsMatrix: Array.isArray(body.skillsMatrix) ? body.skillsMatrix : [],
        skillsMatrixAr: Array.isArray(body.skillsMatrixAr) ? body.skillsMatrixAr : null,
        mediaGallery: Array.isArray(body.mediaGallery) ? body.mediaGallery : [],
        testimonials: Array.isArray(body.testimonials) ? body.testimonials : [],
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error("[TEAM_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (!isTeamAuthorized((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const validation = validateBilingualTeamMemberInput(data);
    if (!validation.valid) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 });
    }

    const member = await db.employeeProfile.update({
      where: { id },
      data: {
        ...data,
        displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : undefined,
        order: data.order !== undefined ? Number(data.order) : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
        showOnTeamPage: data.showOnTeamPage !== undefined ? Boolean(data.showOnTeamPage) : undefined,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
      },
    });

    return NextResponse.json(member);
  } catch (error: any) {
    console.error("[TEAM_PUT_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (!isTeamAuthorized((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await db.employeeProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TEAM_DELETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
