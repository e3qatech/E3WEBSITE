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
      selectedServices,
      objective,
      primaryObjective,
      projectFormat,
      projectType,
      lifespan,
      audience,
      requiredScope,
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

    const selectedSlugs: string[] = Array.isArray(selectedServices) && selectedServices.length > 0
      ? selectedServices
      : (serviceSlug ? [serviceSlug] : ["mega-events"]);

    const serviceNames = selectedSlugs
      .map((slug) => getCanonicalService(slug)?.titleEn || slug)
      .join(", ");

    const resolvedObjective = primaryObjective || objective || "Turnkey Project Delivery";
    const resolvedFormat = projectFormat || projectType || venueType || "Not specified";
    const resolvedLifespan = lifespan || duration || "Not specified";
    const resolvedAudience = audience || audienceSize || "Not specified";
    const resolvedScope = requiredScope || (Array.isArray(requiredModules) ? requiredModules.join(", ") : "Comprehensive Scope");

    const briefPayload = {
      serviceSlug: selectedSlugs[0] || "mega-events",
      selectedServices: selectedSlugs,
      serviceName: serviceNames,
      objective: resolvedObjective,
      primaryObjective: resolvedObjective,
      projectFormat: resolvedFormat,
      projectType: resolvedFormat,
      lifespan: resolvedLifespan,
      audience: resolvedAudience,
      requiredScope: resolvedScope,
      venueType: venueType || resolvedFormat,
      audienceSize: audienceSize || resolvedAudience,
      targetDate: targetDate || "Flexible",
      duration: duration || resolvedLifespan,
      indoorOutdoor: indoorOutdoor || "Not specified",
      requiredModules: Array.isArray(requiredModules) ? requiredModules : [],
      budgetRange: budgetRange || "Undisclosed",
      briefNotes: briefNotes || "",
      selectedRelatedServices: Array.isArray(selectedRelatedServices) ? selectedRelatedServices : [],
      submittedAt: new Date().toISOString()
    };

    // Store in Lead table with rich Solution Finder & Project Brief parameters
    const lead = await db.lead.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        status: "NEW",
        interestServices: briefPayload,
        notes: `[PROJECT BRIEF BUILDER - ${serviceNames}]\nObjective: ${resolvedObjective}\nFormat / Type: ${resolvedFormat}\nLifespan: ${resolvedLifespan}\nAudience: ${resolvedAudience}\nScope: ${resolvedScope}\nTarget Date: ${briefPayload.targetDate}\nBudget: ${briefPayload.budgetRange}\n\nClient Notes: ${briefNotes || "None"}`,
      }
    });

    // Create initial activity log with audit trail
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "PROJECT_BRIEF",
        description: `Project Brief generated for ${serviceNames} | Format: ${resolvedFormat} | Objective: ${resolvedObjective} | Lifespan: ${resolvedLifespan}.`,
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
        serviceName: serviceNames,
        serviceSlug: selectedSlugs[0] || "mega-events",
        selectedServices: selectedSlugs,
        objective: resolvedObjective,
        primaryObjective: resolvedObjective,
        projectFormat: resolvedFormat,
        projectType: resolvedFormat,
        lifespan: resolvedLifespan,
        audience: resolvedAudience,
        requiredScope: resolvedScope,
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
