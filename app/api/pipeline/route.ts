import { NextResponse } from "next/server";
import { runFullPipeline } from "@/lib/pipeline";
import { generateExportDocument, renderExportToText } from "@/lib/export";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userRequest = body.userRequest;

    if (typeof userRequest !== "string" || userRequest.trim().length === 0) {
      return NextResponse.json(
        { error: "userRequest must be a non-empty string" },
        { status: 400 }
      );
    }

    if (userRequest.length > 5000) {
      return NextResponse.json(
        { error: "userRequest must not exceed 5000 characters" },
        { status: 400 }
      );
    }

    // Run the full pipeline - deterministic, no loops, no recursion
    const session = runFullPipeline(userRequest.trim());

    // Generate export document
    const exportDoc = generateExportDocument(session);
    const exportText = renderExportToText(exportDoc);

    return NextResponse.json({
      session,
      exportDocument: exportDoc,
      exportText,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown pipeline error";
    console.error("[Pipeline API Error]", message);

    return NextResponse.json(
      { error: `Pipeline execution failed: ${message}` },
      { status: 500 }
    );
  }
}
