"use client";
import { useRef, useState } from "react";
import SourceForm from "@/components/SourceForm";
import StudyKit from "@/components/StudyKit";
import { ThinkingScribble } from "@/components/Icons";
import { limitText, sha256Hex, fitTitle } from "@/lib/source";
import { MAX_CHARS } from "@/lib/limits";

export default function Studio() {
  const [phase, setPhase] = useState("source"); // source | thinking | error | kit
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const last = useRef(null);

  async function generate(src) {
    last.current = src;
    setPhase("thinking");
    setError("");
    try {
      const { text, cut } = limitText(src.text);
      const docHash = await sha256Hex(text);
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSession({
        title: fitTitle(src.title) || "Untitled notes",
        text,
        docHash,
        kit: data,
        notice: cut ? `Your notes were long, so only the first ${MAX_CHARS.toLocaleString("en-US")} characters were used.` : "",
      });
      setPhase("kit");
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setPhase("error");
    }
  }

  function reset() {
    setSession(null);
    setPhase("source");
  }

  if (phase === "kit" && session) return <StudyKit key={session.docHash} {...session} onReset={reset} />;

  return (
    <div className="nb">
      <div className="nb-label">
        <small>Name:</small>
        <b>{last.current?.title || "my new notebook"}</b>
      </div>
      <div className="nb-page">
        {phase === "source" && <SourceForm onSubmit={generate} />}
        {phase === "thinking" && (
          <div className="thinking" role="status" aria-live="polite">
            <span className="word">thinking…</span>
            <ThinkingScribble />
            <p className="muted">Reading your notes and writing your study kit.</p>
          </div>
        )}
        {phase === "error" && (
          <div>
            <h2 className="h-sec">That didn’t work</h2>
            <div className="banner err" role="alert">{error}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => generate(last.current)}>Try again</button>
              <button className="btn" onClick={reset}>Edit my notes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
