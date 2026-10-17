"use client";
import { useRef, useState } from "react";
import { MAX_QUESTION_CHARS } from "@/lib/limits";
import { ThinkingScribble } from "@/components/Icons";

export default function AskChat({ text }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lastQ = useRef("");

  async function ask(q) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, question: q }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMessages((m) => [...m, { role: "ai", ...data }]);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || busy) return;
    lastQ.current = q;
    setMessages((m) => [...m, { role: "me", answer: q }]);
    setQuestion("");
    ask(q);
  }

  return (
    <div>
      <h2 className="h-sec">Ask your notes</h2>
      <p className="muted" style={{ marginBottom: 16 }}>Answers come only from this document. If it isn’t in there, you’ll be told.</p>

      <div className="chat" aria-live="polite">
        {messages.length === 0 && <p className="note-sm">try: “What is the main idea?”</p>}
        {messages.map((m, i) =>
          m.role === "me" ? (
            <div key={i} className="bubble me">{m.answer}</div>
          ) : (
            <div key={i} className="bubble ai">
              {m.answer}
              {m.quote && <blockquote>{m.quote}</blockquote>}
            </div>
          )
        )}
        {busy && (
          <div className="bubble ai" aria-label="thinking">
            <span className="note-sm">thinking…</span> <ThinkingScribble />
          </div>
        )}
      </div>

      {error && (
        <div className="banner err" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={() => ask(lastQ.current)} disabled={busy}>Try again</button>
        </div>
      )}

      <form className="ask-row" onSubmit={submit}>
        <label className="sr" htmlFor="q">Your question</label>
        <input
          id="q"
          className="input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something about your notes"
          maxLength={MAX_QUESTION_CHARS}
        />
        <button className="btn btn-primary" disabled={busy || !question.trim()}>Ask</button>
      </form>
    </div>
  );
}
