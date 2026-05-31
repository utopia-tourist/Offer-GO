import { NextResponse } from "next/server";
import { analyzeResume } from "@/lib/ai-server";
import type { AnalyzeResumeRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeResumeRequest;
    const result = await analyzeResume(body.resume, body.targetJob, body.jobDescription);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI resume analysis failed" },
      { status: 500 }
    );
  }
}
