"use client";
import { useRef, useState } from "react";
import { MIN_CHARS, MAX_CHARS, MAX_PDF_PAGES } from "@/lib/limits";
import { MAX_TITLE_BYTES } from "@/lib/chain";
import { cleanText, extractPdf, PdfError, titleFromFilename, byteLength } from "@/lib/source";

export default function SourceForm({ onSubmit }) {
  const [mode, setMode] = useState("paste");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [pdfNote, setPdfNote] = useState("");
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [over, setOver] = useState(false);
  const fileRef = useRef(null);

  const chars = text.trim().length;
  const tooShort = chars > 0 && chars < MIN_CHARS;
  const tooLong = chars > MAX_CHARS;

  async function handleFile(file) {
    if (!file) return;
    setError("");
    setPdfNote("");
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("That doesn't look like a PDF. Choose a .pdf file or paste the text instead.");
      return;
    }
    setReading(true);
    try {
      const { text: t, totalPages, usedPages } = await extractPdf(file);
      setText(t);
      if (!title.trim()) setTitle(titleFromFilename(file.name));
      setPdfNote(
        totalPages > usedPages
          ? `Using the first ~${MAX_PDF_PAGES} pages (this PDF has ${totalPages}).`
          : `Read ${usedPages} page${usedPages === 1 ? "" : "s"} from ${file.name}.`
      );
      setMode("paste");
    } catch (e) {
      setError(e instanceof PdfError ? e.message : "We couldn't read that PDF. Paste the text instead.");
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function submit(e) {
    e.preventDefault();
    if (chars < MIN_CHARS) {
      setError(`Add a little more — at least ${MIN_CHARS} characters, so there's something to study.`);
      return;
    }
    setError("");
    onSubmit({ title: title.trim() || "Untitled notes", text: cleanText(text) });
  }

  return (
    <form onSubmit={submit}>
      <h2 className="h-sec">Add a source</h2>
      <p className="muted" style={{ marginBottom: 18 }}>
        One document per notebook. Your notes stay in your browser — only the study kit is made by AI.
      </p>

      <div className="mode" role="group" aria-label="Source type">
        <button type="button" aria-pressed={mode === "paste"} onClick={() => setMode("paste")}>Paste text</button>
        <button type="button" aria-pressed={mode === "pdf"} onClick={() => setMode("pdf")}>Upload a PDF</button>
      </div>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Biology chapter 3"
          maxLength={MAX_TITLE_BYTES}
        />
        {byteLength(title) > MAX_TITLE_BYTES - 10 && <span className="hint warn">Titles are limited to {MAX_TITLE_BYTES} characters.</span>}
      </div>

      {mode === "pdf" ? (
        <div className="field">
          <span className="lab">PDF (up to {MAX_PDF_PAGES} pages)</span>
          <label
            className={`drop${over ? " over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files?.[0]); }}
          >
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={(e) => handleFile(e.target.files?.[0])} />
            <span className="note">{reading ? "reading your pages…" : "drop a PDF here"}</span>
            <span className="muted">{reading ? "this happens in your browser" : "or click to choose a file"}</span>
          </label>
        </div>
      ) : (
        <div className="field">
          <label htmlFor="text">Your notes</label>
          <textarea
            id="text"
            className="textarea"
            value={text}
            onChange={(e) => { setText(e.target.value); setPdfNote(""); }}
            placeholder="Paste your notes, an article or a chapter here…"
          />
          <div className={`hint${tooShort || tooLong ? " warn" : ""}`}>
            <span>
              {tooShort && `A bit more please — at least ${MIN_CHARS} characters.`}
              {tooLong && `Using the first ${MAX_CHARS.toLocaleString("en-US")} characters.`}
              {!tooShort && !tooLong && "Plain text works best."}
            </span>
            <span>{chars.toLocaleString("en-US")} / {MAX_CHARS.toLocaleString("en-US")}</span>
          </div>
        </div>
      )}

      {pdfNote && <div className="banner info" role="status">{pdfNote}</div>}
      {error && <div className="banner err" role="alert">{error}</div>}

      <button type="submit" className="btn btn-primary" disabled={reading}>Make my study kit</button>
    </form>
  );
}
