import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export function fail(status, message, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

// Same-origin only (plus any origins listed in ALLOWED_ORIGINS, comma separated).
function originAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches and curl send no Origin header
  const host = request.headers.get("host");
  try {
    if (new URL(origin).host === host) return true;
  } catch {
    return false;
  }
  const extra = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return extra.includes(origin);
}

/** Runs origin check, rate limit and JSON parsing. Returns { body } or { response }. */
export async function guard(request, { name, limit, windowMs }) {
  if (!originAllowed(request)) return { response: fail(403, "Origin not allowed.") };

  const rl = rateLimit(`${name}:${clientIp(request)}`, limit, windowMs);
  if (!rl.ok) {
    const res = fail(429, `Too many requests. Try again in ${rl.retryAfter}s.`, { retryAfter: rl.retryAfter });
    res.headers.set("Retry-After", String(rl.retryAfter));
    return { response: res };
  }

  const len = Number(request.headers.get("content-length") || 0);
  if (len > 100_000) return { response: fail(413, "Request too large.") };

  try {
    return { body: await request.json() };
  } catch {
    return { response: fail(400, "Request body must be JSON.") };
  }
}
