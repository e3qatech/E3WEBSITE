import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCanonicalService } from "@/lib/services/canonical-services";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      serviceSlug,
      objective,
      venueType,
      audienceSize,
      targetDate,
      duration,
      indoorOutdoor,
      requiredModules,
      budgetRange,
      briefNotes,
      selectedRelatedServices
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required to generate your project brief." },
        { status: 400 }
      );
    }

    const canonical = serviceSlug ? getCanonicalService(serviceSlug) : null;
    const serviceName = canonical?.titleEn || serviceSlug || "General Inquire";

    const briefPayload = {
      serviceSlug,
      serviceName,
      objective: objective || "Not specified",
      venueType: venueType || "Not specified",
      audienceSize: audienceSize || "Not specified",
      targetDate: targetDate || "Flexible",
      duration: duration || "Not specified",
      indoorOutdoor: indoorOutdoor || "Not specified",
      requiredModules: Array.isArray(requiredModules) ? requiredModules : [],
      budgetRange: budgetRange || "Undisclosed",
      briefNotes: briefNotes || "",
      selectedRelatedServices: Array.isArray(selectedRelatedServices) ? selectedRelatedServices : [],
      submittedAt: new Date().toISOString()
    };

    // Store in Lead table
    const lead = await db.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        status: "NEW",
        interestServices: briefPayload,
        notes: `[PROJECT BRIEF BUILDER - ${serviceName}]\nObjective: ${briefPayload.objective}\nAudience: ${briefPayload.audienceSize}\nVenue: ${briefPayload.venueType} (${briefPayload.indoorOutdoor})\nTarget Date: ${briefPayload.targetDate}\nBudget: ${briefPayload.budgetRange}\n\nClient Notes: ${briefNotes || "None"}`,
      }
    });

    // Create initial activity log
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "PROJECT_BRIEF",
        description: `Project Brief generated for ${serviceName} (${briefPayload.objective}).`,
        author: "Project Brief Engine"
      }
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      briefSummary: {
        referenceNumber: `E3-BRF-${lead.id.slice(-6).toUpperCase()}`,
        clientName: name,
        company: company || "Direct Inquirer",
        email,
        phone: phone || "Not provided",
        serviceName,
        serviceSlug,
        objective: briefPayload.objective,
        venueType: briefPayload.venueType,
        audienceSize: briefPayload.audienceSize,
        indoorOutdoor: briefPayload.indoorOutdoor,
        targetDate: briefPayload.targetDate,
        duration: briefPayload.duration,
        budgetRange: briefPayload.budgetRange,
        requiredModules: briefPayload.requiredModules,
        relatedServices: briefPayload.selectedRelatedServices,
        notes: briefNotes || "Standard inquiry scope",
        generatedAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      }
    });
  } catch (error) {
    console.error("[PROJECT_BRIEF_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process project brief submission." },
      { status: 500 }
    );
  }
}
