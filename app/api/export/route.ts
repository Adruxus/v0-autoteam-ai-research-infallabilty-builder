import { NextResponse } from "next/server";
import { generateExportDocument, renderExportToText } from "@/lib/export";
import type { ResearchSession } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session: ResearchSession = body.session;

    if (!session || !session.id) {
      return NextResponse.json(
        { error: "A valid session object is required" },
        { status: 400 }
      );
    }

    const exportDoc = generateExportDocument(session);
    const exportText = renderExportToText(exportDoc);

    // Return as downloadable text file
    return new NextResponse(exportText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="research_${session.id}.txt"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown export error";
    console.error("[Export API Error]", message);

    return NextResponse.json(
      { error: `Export failed: ${message}` },
      { status: 500 }
    );
  }
}
