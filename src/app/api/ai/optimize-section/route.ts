import { NextResponse } from "next/server";
import { optimizeSection } from "@/lib/ai-server";
import type { OptimizeSectionRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OptimizeSectionRequest;
    const result = await optimizeSection(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI section optimization failed" },
      { status: 500 }
    );
  }
}
