import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const media = await db.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // If media.url is an external HTTP URL (e.g. Vercel Blob), redirect to it
    if (media.url && media.url.startsWith("http")) {
      return NextResponse.redirect(media.url);
    }

    const metadata = media.metadata as any;
    const base64Data = metadata?.data;

    if (!base64Data) {
      return NextResponse.json({ error: "Media content unavailable" }, { status: 404 });
    }

    // Convert Base64 back to Buffer
    const buffer = Buffer.from(base64Data, "base64");
    const totalSize = buffer.length;
    const mimeType = media.mimeType || "video/mp4";

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
