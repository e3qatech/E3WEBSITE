import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";
import { DEFAULT_EXPERIENCE_CAMPAIGN, ExperienceCampaignPayload } from "@/types/experience-composer";

export async function GET() {
  try {
    const record = await db.setting.findUnique({
      where: { key: "experience_composer_campaign" },
    });

    if (!record || !record.value) {
      return NextResponse.json(DEFAULT_EXPERIENCE_CAMPAIGN);
    }

    return NextResponse.json(record.value as unknown as ExperienceCampaignPayload);
  } catch (error: any) {
    return NextResponse.json(DEFAULT_EXPERIENCE_CAMPAIGN);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    const updatedRecord = await db.setting.upsert({
      where: { key: "experience_composer_campaign" },
      update: {
        value: body,
        type: "UI",
      },
      create: {
        key: "experience_composer_campaign",
        value: body,
        type: "UI",
      },
    });

    return NextResponse.json(updatedRecord.value);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Failed to update campaign" }, { status });
  }
}
