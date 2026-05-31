import { NextResponse } from "next/server";
import { diagnoseJdMatch } from "@/lib/ai-server";
import type { DiagnoseRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DiagnoseRequest;
    const result = await diagnoseJdMatch(body.resume, body.jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI JD diagnosis failed" },
      { status: 500 }
    );
  }
}
