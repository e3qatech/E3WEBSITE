import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { DEFAULT_PDF_CONFIG, PDFLetterheadConfig } from "@/components/dashboard/b2c/PDFLetterheadManagerModal";

const PDF_SETTING_KEY = "b2c_pdf_letterhead_config";

export async function GET(_req: NextRequest) {
  try {
    const settingModel = (db as any).setting || (db as any).siteSettings;
    if (settingModel) {
      const record = await settingModel.findFirst({
        where: { key: PDF_SETTING_KEY },
      });

      if (record?.value) {
        try {
          const parsed = typeof record.value === "string" ? JSON.parse(record.value) : record.value;
          return NextResponse.json({
            success: true,
            data: { ...DEFAULT_PDF_CONFIG, ...parsed },
          });
        } catch {
          // fallback to default
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: DEFAULT_PDF_CONFIG,
    });
  } catch (error: any) {
    console.error("[GET /api/b2c/pdf-settings] Error:", error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_PDF_CONFIG,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const newConfig: PDFLetterheadConfig = {
      ...DEFAULT_PDF_CONFIG,
      ...body,
    };

    const settingModel = (db as any).setting || (db as any).siteSettings;
    if (settingModel) {
      const existing = await settingModel.findFirst({
        where: { key: PDF_SETTING_KEY },
      });

      const valueStr = JSON.stringify(newConfig);

      if (existing) {
        await settingModel.update({
          where: { id: existing.id },
          data: { value: valueStr },
        });
      } else {
        await settingModel.create({
          data: {
            key: PDF_SETTING_KEY,
            value: valueStr,
            type: "JSON",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: newConfig,
      message: "PDF Letterhead & Quote settings saved successfully.",
    });
  } catch (error: any) {
    console.error("[POST /api/b2c/pdf-settings] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save PDF settings" },
      { status: 500 }
    );
  }
}
