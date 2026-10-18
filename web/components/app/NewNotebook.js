"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MascotIcon } from "@/components/MascotArt";
import { MIN_CHARS, MAX_CHARS, MAX_PDF_PAGES } from "@/lib/limits";
import { MAX_TITLE_BYTES } from "@/lib/chain";
import { byteLength, cleanText, extractPdf, fitTitle, limitText, PdfError, sha256Hex, titleFromFilename } from "@/lib/source";
import { newId, saveNotebook, takeHandedFile } from "@/lib/notebooks";

const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default function NewNotebook() {
  const router = useRouter();
  const startMode = useSearchParams().get("mode") === "paste" ? "paste" : "pdf";
  const [mode, setMode] = useState(startMode);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null); // { name, size, pages, used }
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [over, setOver] = useState(false);
  const [phase, setPhase] = useState("form"); // form | thinking | error
  const fileRef = useRef(null);
  const titleTouched = useRef(false);

  const chars = text.trim().length;
  const tooShort = chars > 0 && chars < MIN_CHARS;
  const tooLong = chars > MAX_CHARS;

  async function handleFile(f) {
    if (!f) return;
    setError("");
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("That doesn't look like a PDF. Choose a .pdf file or paste the text instead.");
      return;
    }
    setReading(true);
    try {
      const { text: t, totalPages, usedPages } = await extractPdf(f);
      setText(t);
      setFile({ name: f.name, size: f.size, pages: totalPages, used: usedPages });
      if (!titleTouched.current) setTitle(titleFromFilename(f.name));
    } catch (e) {
      setFile(null);
      setError(e instanceof PdfError ? e.message : "We couldn't read that PDF. Paste the text instead.");
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // A PDF dropped on the home screen arrives here.
  useEffect(() => {
    const f = takeHandedFile();
    if (f) handleFile(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearFile() {
    setFile(null);
    setText("");
    setError("");
  }

  async function submit(e) {
    e?.preventDefault();
    if (chars < MIN_CHARS) {
      setError(mode === "pdf" ? "Add a PDF first, or switch to Paste text." : `Add a little more: at least ${MIN_CHARS} characters, so there's something to study.`);
      return;
    }
    setError("");
    setPhase("thinking");
    try {
      const { text: clean, cut } = limitText(cleanText(text));
      const docHash = await sha256Hex(clean);
      const res = await fetch("/api/study", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: clean }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      const id = newId();
      const now = Date.now();
      const ok = saveNotebook({
        id,
        title: fitTitle(title) || "Untitled notes",
        text: clean,
        docHash,
        kit: data,
        meta: file ? { kind: "pdf", fileName: file.name, size: file.size, pages: file.pages } : { kind: "text" },
        notice: cut ? `Your notes were long, so only the first ${MAX_CHARS.toLocaleString("en-US")} characters were used.` : "",
        answers: data.quiz.map(() => null),
        createdAt: now,
      });
      router.replace(`/app/notebook?id=${id}${ok ? "" : "&unsaved=1"}`);
      if (!ok) sessionStorage.setItem(`pocketlm.tmp.${id}`, JSON.stringify({ id, title: fitTitle(title) || "Untitled notes", text: clean, docHash, kit: data, meta: { kind: "text" }, answers: data.quiz.map(() => null), createdAt: now }));
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setPhase("error");
    }
  }

  if (phase === "thinking") {
    return (
      <div className="ap-page ap-center" role="status" aria-live="polite">
        <MascotIcon size={110} idp="apn" className="ap-think-art" />
        <p className="ap-hand ap-think-word">thinking…</p>
        <h1 className="ap-h2">Reading your notes</h1>
        <p className="ap-lede">Writing a summary, 5 key points and a 5-question quiz. This takes a few seconds.</p>
        <div className="ap-bar" aria-hidden="true"><i /></div>
      </div>
    );
  }

  return (
    <div className="ap-page ap-narrow">
      <Link href="/app" className="ap-back">← Back</Link>
      <h1 className="ap-h2">Create a new notebook</h1>
      <p className="ap-lede">Upload a PDF or paste your text to get started.</p>

      <form className="ap-form" onSubmit={submit}>
        {phase === "error" && (
          <div className="ap-alert is-err" role="alert">
            <span>{error}</span>
            <button type="button" className="ap-btn is-small" onClick={() => setPhase("form")}>Edit my notes</button>
          </div>
        )}

        <div className="ap-seg" role="tablist" aria-label="Source type">
          <button type="button" role="tab" aria-selected={mode === "pdf"} className={mode === "pdf" ? "is-on" : ""} onClick={() => setMode("pdf")}>Upload PDF</button>
          <button type="button" role="tab" aria-selected={mode === "paste"} className={mode === "paste" ? "is-on" : ""} onClick={() => setMode("paste")}>Paste text</button>
        </div>

        <div className="ap-field">
          <label htmlFor="nb-title">Title</label>
          <input
            id="nb-title"
            className="ap-input"
            value={title}
            onChange={(e) => { titleTouched.current = true; setTitle(e.target.value); }}
            placeholder="e.g. Biology chapter 3"
            maxLength={MAX_TITLE_BYTES}
          />
          {byteLength(title) > MAX_TITLE_BYTES - 10 && <span className="ap-hint is-warn">Titles are limited to {MAX_TITLE_BYTES} characters.</span>}
        </div>

        {mode === "pdf" ? (
          <div className="ap-field">
            <span className="ap-label">PDF</span>
            {file ? (
              <div className="ap-file">
                <span className="ap-file-ico" aria-hidden="true">PDF</span>
                <span className="ap-file-txt">
                  <b>{file.name}</b>
                  <small>{file.pages} page{file.pages === 1 ? "" : "s"} · {fmtSize(file.size)}{file.pages > file.used ? ` · using the first ${file.used}` : ""}</small>
                </span>
                <button type="button" className="ap-x" onClick={clearFile} aria-label="Remove this PDF">×</button>
              </div>
            ) : (
              <label
                className={`ap-drop is-wide${over ? " is-over" : ""}${reading ? " is-busy" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files?.[0]); }}
              >
                <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={(e) => handleFile(e.target.files?.[0])} />
                <span className="ap-drop-ico" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>
                </span>
                <b>{reading ? "Reading your pages…" : "Drop your PDF here"}</b>
                <small>{reading ? "This happens in your browser" : `or click to browse · up to ${MAX_PDF_PAGES} pages · PDF only`}</small>
              </label>
            )}
          </div>
        ) : (
          <div className="ap-field">
            <label htmlFor="nb-text">Your notes</label>
            <textarea
              id="nb-text"
              className="ap-input ap-area"
              value={text}
              onChange={(e) => { setText(e.target.value); setFile(null); }}
              placeholder="Paste your notes, an article or a chapter here…"
            />
            <div className={`ap-hint${tooShort || tooLong ? " is-warn" : ""}`}>
              <span>
                {tooShort && `A bit more please: at least ${MIN_CHARS} characters.`}
                {tooLong && `Only the first ${MAX_CHARS.toLocaleString("en-US")} characters will be used.`}
                {!tooShort && !tooLong && "Plain text works best."}
              </span>
              <span>{chars.toLocaleString("en-US")} / {MAX_CHARS.toLocaleString("en-US")}</span>
            </div>
          </div>
        )}

        {mode === "paste" && file && <div className="ap-alert">Text loaded from {file.name}. You can edit it above.</div>}
        {error && phase === "form" && <div className="ap-alert is-err" role="alert">{error}</div>}

        <button type="submit" className="ap-btn is-primary is-wide" disabled={reading || chars < MIN_CHARS}>
          Create study kit <span aria-hidden="true">→</span>
        </button>
        <p className="ap-fine">Your notes stay in this browser. Only the study kit request is sent to the AI.</p>
      </form>
    </div>
  );
}
