import { NextResponse } from "next/server";
import { optimizeResume } from "@/lib/ai-server";
import type { OptimizeResumeRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OptimizeResumeRequest;
    const result = await optimizeResume(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI resume optimization failed" },
      { status: 500 }
    );
  }
}
