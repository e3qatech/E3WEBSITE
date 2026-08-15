import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isTeamAuthorized } from "@/lib/team/team-resolver";

export async function POST(request: Request) {
  return handleReorder(request);
}

export async function PUT(request: Request) {
  return handleReorder(request);
}

async function handleReorder(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (!isTeamAuthorized((session.user as any)?.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    let itemsToUpdate: { id: string; displayOrder: number }[] = [];

    if (Array.isArray(body.orderedIds)) {
      itemsToUpdate = body.orderedIds.map((id: string, index: number) => ({
        id,
        displayOrder: index,
      }));
    } else if (Array.isArray(body.items)) {
      itemsToUpdate = body.items.map((item: any, index: number) => ({
        id: item.id,
        displayOrder: typeof item.displayOrder === "number" ? item.displayOrder : index,
      }));
    } else {
      return NextResponse.json(
        { error: "Invalid payload. Provide 'orderedIds' string array or 'items' array." },
        { status: 400 }
      );
    }

    if (itemsToUpdate.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Execute atomic transaction for all member order updates
    const updates = itemsToUpdate.map((item) =>
      db.employeeProfile.update({
        where: { id: item.id },
        data: {
          displayOrder: item.displayOrder,
          order: item.displayOrder,
        },
      })
    );

    await db.$transaction(updates);

    return NextResponse.json({
      success: true,
      count: itemsToUpdate.length,
      message: "Team display ordering updated transactionally",
    });
  } catch (error: any) {
    console.error("[TEAM_REORDER_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update display order" },
      { status: 500 }
    );
  }
}
