import { NextResponse } from "next/server";
import { guard, fail } from "@/lib/guard";
import { groqJson, AiError } from "@/lib/groq";
import { parseStudyKit } from "@/lib/study-schema";
import { STUDY_SYSTEM, wrapDocument } from "@/lib/prompts";
import { MIN_CHARS, MAX_CHARS } from "@/lib/limits";

export const maxDuration = 60;

export async function POST(request) {
  const g = await guard(request, { name: "study", limit: 10, windowMs: 10 * 60_000 });
  if (g.response) return g.response;

  const text = g.body?.text;
  if (typeof text !== "string") return fail(400, "Field 'text' is required.");
  const clean = text.trim();
  if (clean.length < MIN_CHARS) return fail(400, `Text is too short (minimum ${MIN_CHARS} characters).`);
  if (clean.length > MAX_CHARS + 500) return fail(413, `Text is too long (maximum ${MAX_CHARS} characters).`);

  try {
    // One automatic retry if the model returns the wrong shape.
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await groqJson({
        system: STUDY_SYSTEM,
        user: wrapDocument(clean),
        maxTokens: 2500,
        temperature: attempt === 0 ? 0.3 : 0.1,
      });
      const kit = parseStudyKit(raw);
      if (kit) return NextResponse.json(kit);
    }
    return fail(502, "The AI answer had the wrong format. Please try again.");
  } catch (e) {
    if (e instanceof AiError) return fail(e.status, e.message);
    return fail(500, "Something went wrong. Please try again.");
  }
}
