const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export class AiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

/** Calls Groq in JSON mode and returns the parsed object. */
export async function groqJson({ system, user, maxTokens, temperature = 0.3 }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AiError("AI is not configured on the server.", 500);

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const isReasoning = model.includes("gpt-oss");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45_000);
  let res;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature,
        // gpt-oss models spend part of the budget on hidden reasoning, so give extra room.
        max_tokens: isReasoning ? maxTokens + 2000 : maxTokens,
        ...(isReasoning ? { reasoning_effort: "low" } : {}),
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (e) {
    throw new AiError(e.name === "AbortError" ? "The AI took too long. Try again." : "Could not reach the AI service.", 504);
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) throw new AiError("The AI is busy right now. Try again in a moment.", 503);
  if (!res.ok) throw new AiError("The AI service returned an error.", 502);

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  try {
    return JSON.parse(content);
  } catch {
    throw new AiError("The AI answer was not valid JSON.", 502);
  }
}
