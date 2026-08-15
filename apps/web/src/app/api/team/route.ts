import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  filterAndResolvePublicTeamMembers,
  analyzeTeamMemberDataQuality,
  isTeamAuthorized,
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
        orderBy: { order: "asc" },
      });

      const enriched = allMembers.map((m: any) => ({
        ...m,
        dataQuality: analyzeTeamMemberDataQuality(m, allMembers),
      }));

      return NextResponse.json(enriched);
    }

    const teamMembers = await db.employeeProfile.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
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
    const {
      firstName,
      lastName,
      firstNameAr,
      lastNameAr,
      designation,
      designationAr,
      department,
      yearsOfExperience,
      tagline,
      aboutSummary,
      aboutSummaryAr,
      profileImage,
      isActive = false, // Default to hidden/inactive until published (QF-24 requirement)
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
        yearsOfExperience: typeof yearsOfExperience === "number" ? yearsOfExperience : 0,
        tagline: tagline || "",
        aboutSummary: aboutSummary || "",
        aboutSummaryAr: aboutSummaryAr || null,
        profileImage: profileImage || null,
        linkedinUrl: linkedinUrl || null,
        contactEmail: contactEmail || null,
        isActive: Boolean(isActive),
        careerJourney: body.careerJourney || "",
        keyStrengths: body.keyStrengths || "",
        expertiseTags: Array.isArray(body.expertiseTags) ? body.expertiseTags : [],
        coreCompetencies: Array.isArray(body.coreCompetencies) ? body.coreCompetencies : [],
        experience: Array.isArray(body.experience) ? body.experience : [],
        projects: Array.isArray(body.projects) ? body.projects : [],
        certifications: Array.isArray(body.certifications) ? body.certifications : [],
        education: Array.isArray(body.education) ? body.education : [],
        awards: Array.isArray(body.awards) ? body.awards : [],
        skillsMatrix: Array.isArray(body.skillsMatrix) ? body.skillsMatrix : [],
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
