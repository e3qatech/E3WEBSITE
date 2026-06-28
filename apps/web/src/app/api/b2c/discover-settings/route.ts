import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "B2C_DISCOVER_PAGE_SETTINGS" }
    });

    if (!setting) {
      // Default structure
      return NextResponse.json({
        hero: {
          titleEn: "The \"Wow & How\" Philosophy",
          titleAr: "فلسفة الإبهار والتميز",
          subtitleEn: "Fusing the physical \"Wow\" of immersive entertainment with the transparent operational \"How\" of Qatari execution engineering.",
          subtitleAr: "نجمع بين الإبهار المادي للترفيه الغامر والتميز الهندسي لدولة قطر",
          mediaType: "ORBS", // IMAGE, VIDEO, ORBS
          mediaUrl: ""
        },
        heritage: {
          title: "Our Heritage",
          description: "Deeply rooted in Qatar, E3 has delivered the nation's most iconic tourist landmarks. From the Guinness-certified 1,055-meter InflataRun track to the Doha Balloon Parade hosting over 760,000 attendees, our legacy is built on monumental execution.",
          vision: "Delivering results-oriented marketing programs and interactive FECs globally.",
          mission: "Inspiring fun and everlasting memories through groundbreaking live events.",
          values: "Honesty, direct relationships, and unyielding commitment to delivering on promises."
        },
        team: [
          { name: "Abdullah Al Kubaisi", role: "Chairman", desc: "National alignment & strategic partnerships." },
          { name: "Adil Ahmed", role: "Managing Director & CEO", desc: "Global resources & operations." },
          { name: "Mohammad Ali Awada", role: "General Manager", desc: "Directing physical landmark properties." },
          { name: "Ebrahim Karolia", role: "Sr. Project Manager", desc: "AV rigging, fabrication, custom builds." }
        ],
        careers: {
          title: "Join the Crew",
          description: "E3 is expanding. We are currently actively seeking freelance event crew staffing and scaling our Lusail corporate office.",
          nlpText: "Our automated NLP system extracts structural skills (AV logistics, rigging, etc.) and pushes them directly to our Talent database."
        }
      });
    }

    return NextResponse.json(JSON.parse(setting.value));
  } catch (error) {
    console.error("Failed to fetch discover settings", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "SUPPORT_ADMIN", "ADMIN"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const setting = await prisma.setting.upsert({
      where: { key: "B2C_DISCOVER_PAGE_SETTINGS" },
      update: { value: JSON.stringify(data) },
      create: { key: "B2C_DISCOVER_PAGE_SETTINGS", value: JSON.stringify(data) }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error("Failed to save discover settings", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
