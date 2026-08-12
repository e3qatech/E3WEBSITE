import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    let base64Data: string | null = null;
    let mimeType: string = "image/jpeg";

    // 1. Primary lookup: db.media table in PostgreSQL
    try {
      const media = await db.media.findUnique({ where: { id } });
      if (media) {
        if (media.url && media.url.startsWith("http")) {
          return NextResponse.redirect(media.url);
        }
        const metadata = media.metadata as any;
        base64Data = metadata?.data || null;
        mimeType = media.mimeType || "image/jpeg";
      }
    } catch (_dbErr) {}

    // 2. Secondary lookup: db.siteSettings table in PostgreSQL
    if (!base64Data) {
      try {
        const setting = await (db as any).siteSettings.findUnique({
          where: { key: `cms_media_${id}` },
        });
        if (setting && setting.value) {
          base64Data = setting.value.base64Data || null;
          mimeType = setting.value.mime || "image/jpeg";
        }
      } catch (_settingErr) {}
    }

    // 3. Tertiary lookup: in-memory store
    if (!base64Data) {
      const globalMediaStore = (globalThis as any).__globalMediaStore;
      const cached = globalMediaStore?.[id];
      if (cached) {
        base64Data = cached.base64Data;
        mimeType = cached.mime || "image/jpeg";
      }
    }

    if (!base64Data) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Convert Base64 back to Buffer cleanly
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "").replace(/\s+/g, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    const totalSize = buffer.length;

    // Support HTTP Range requests for HTML5 video seeking & streaming
    const rangeHeader = req.headers.get("range");

    if (rangeHeader && mimeType.startsWith("video/")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      const chunkSize = end - start + 1;

      const chunk = buffer.subarray(start, end + 1);

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Full file response for images or non-range requests
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": totalSize.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(`[GET /api/media/${id}] error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
