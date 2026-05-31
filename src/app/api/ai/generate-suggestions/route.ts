import { NextResponse } from "next/server";
import { generateSuggestions } from "@/lib/ai-server";
import type { GenerateSuggestionsRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateSuggestionsRequest;
    const result = await generateSuggestions(body);
    return NextResponse.json({ suggestions: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI suggestion generation failed" },
      { status: 500 }
    );
  }
}
