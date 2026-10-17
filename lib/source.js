import { MAX_CHARS, MAX_PDF_PAGES } from "@/lib/limits";
import { MAX_TITLE_BYTES } from "@/lib/chain";

/** Collapses whitespace so the same text always gives the same fingerprint. */
export function cleanText(s) {
  return s.replace(/\r\n?/g, "\n").replace(/[ \t\f\v]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** Trims to the character limit. Returns the text and whether it was cut. */
export function limitText(text) {
  if (text.length <= MAX_CHARS) return { text, cut: false };
  return { text: text.slice(0, MAX_CHARS).trim(), cut: true };
}

/** SHA-256 of the text as a 0x-prefixed bytes32 hex string (computed in the browser). */
export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return "0x" + [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export class PdfError extends Error {}

/** Reads the text of the first pages of a PDF in the browser with pdf.js. */
export async function extractPdf(file) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  } catch {
    throw new PdfError("We couldn't open this PDF. Try another file or paste the text instead.");
  }
  const pages = Math.min(doc.numPages, MAX_PDF_PAGES);
  const parts = [];
  for (let p = 1; p <= pages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    parts.push(content.items.map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : " ") : "")).join(""));
  }
  const text = cleanText(parts.join("\n\n"));
  if (text.length < 50) throw new PdfError("This PDF looks like images — paste the text instead.");
  return { text, totalPages: doc.numPages, usedPages: pages };
}

export function titleFromFilename(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

export const byteLength = (s) => new TextEncoder().encode(s).length;

/** Cuts a title so it fits the contract limit (counted in bytes). */
export function fitTitle(s) {
  let t = s.trim();
  while (byteLength(t) > MAX_TITLE_BYTES) t = t.slice(0, -1);
  return t.trim();
}

// Cheap language guess so the browser voice can pick a sensible accent.
export function guessLang(text) {
  const sample = ` ${text.slice(0, 2000).toLowerCase()} `;
  const id = [" yang ", " dan ", " di ", " untuk ", " dengan ", " adalah ", " pada "].filter((w) => sample.includes(w)).length;
  const en = [" the ", " and ", " of ", " to ", " is ", " that ", " with "].filter((w) => sample.includes(w)).length;
  return id > en ? "id-ID" : "en-US";
}
