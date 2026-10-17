// Validates (and lightly normalises) what the model returns. No fake fallback:
// if the shape is wrong the caller retries and then reports an error.
const str = (v) => typeof v === "string" && v.trim().length > 0;

function answerIndex(a, options) {
  if (Number.isInteger(a) && a >= 0 && a < options.length) return a;
  if (typeof a === "string") {
    const t = a.trim();
    const letter = "ABCD".indexOf(t.toUpperCase());
    if (t.length === 1 && letter >= 0) return letter;
    if (/^[0-3]$/.test(t)) return Number(t);
    const byText = options.findIndex((o) => o.trim().toLowerCase() === t.toLowerCase());
    if (byText >= 0) return byText;
  }
  return -1;
}

export function parseStudyKit(raw) {
  if (!raw || !str(raw.summary)) return null;
  if (!Array.isArray(raw.keyPoints) || raw.keyPoints.length < 5 || !raw.keyPoints.every(str)) return null;
  if (!Array.isArray(raw.quiz) || raw.quiz.length < 5) return null;

  const quiz = [];
  for (const item of raw.quiz.slice(0, 5)) {
    if (!item || !str(item.q) || !Array.isArray(item.options) || item.options.length !== 4) return null;
    if (!item.options.every(str) || !str(item.why)) return null;
    const answer = answerIndex(item.answer, item.options);
    if (answer < 0) return null;
    quiz.push({ q: item.q.trim(), options: item.options.map((o) => o.trim()), answer, why: item.why.trim() });
  }
  return {
    summary: raw.summary.trim(),
    keyPoints: raw.keyPoints.slice(0, 5).map((s) => s.trim()),
    quiz,
  };
}

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

export function parseAnswer(raw, documentText) {
  if (!raw || !str(raw.answer)) return null;
  const found = raw.found !== false;
  let quote = typeof raw.quote === "string" ? raw.quote.trim() : "";
  // Only show a quote that really appears in the document.
  if (!found || !quote || !norm(documentText).includes(norm(quote))) quote = "";
  return { found, answer: raw.answer.trim(), quote };
}
