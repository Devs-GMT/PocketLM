import { NextResponse } from "next/server";
import { guard, fail } from "@/lib/guard";
import { groqJson, AiError } from "@/lib/groq";
import { parseAnswer } from "@/lib/study-schema";
import { ASK_SYSTEM, wrapDocument } from "@/lib/prompts";
import { MIN_CHARS, MAX_CHARS, MAX_QUESTION_CHARS } from "@/lib/limits";

export const maxDuration = 60;

export async function POST(request) {
  const g = await guard(request, { name: "ask", limit: 30, windowMs: 10 * 60_000 });
  if (g.response) return g.response;

  const { text, question } = g.body || {};
  if (typeof text !== "string" || typeof question !== "string") return fail(400, "Fields 'text' and 'question' are required.");
  const doc = text.trim();
  const q = question.trim();
  if (doc.length < MIN_CHARS) return fail(400, `Text is too short (minimum ${MIN_CHARS} characters).`);
  if (doc.length > MAX_CHARS + 500) return fail(413, `Text is too long (maximum ${MAX_CHARS} characters).`);
  if (!q) return fail(400, "Question is empty.");
  if (q.length > MAX_QUESTION_CHARS) return fail(400, `Question is too long (maximum ${MAX_QUESTION_CHARS} characters).`);

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await groqJson({
        system: ASK_SYSTEM,
        user: `${wrapDocument(doc)}\n\nQuestion: ${q}`,
        maxTokens: 600,
        temperature: 0.1,
      });
      const out = parseAnswer(raw, doc);
      if (out) return NextResponse.json(out);
    }
    return fail(502, "The AI answer had the wrong format. Please try again.");
  } catch (e) {
    if (e instanceof AiError) return fail(e.status, e.message);
    return fail(500, "Something went wrong. Please try again.");
  }
}
