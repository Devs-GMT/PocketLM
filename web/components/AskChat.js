"use client";
import { useEffect, useRef, useState } from "react";
import { MAX_QUESTION_CHARS } from "@/lib/limits";
import { MascotIcon } from "@/components/MascotArt";

const IDEAS = ["What is the main idea?", "Explain it in simpler words", "Give me an example from the notes"];

// `messages` live in the notebook, so the chat stays when you switch tabs.
export default function AskChat({ text, messages, setMessages }) {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(-1);
  const lastQ = useRef("");
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages.length, busy]);

  async function ask(q) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, question: q }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMessages((m) => [...m, { role: "ai", ...data }]);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function send(q) {
    q = q.trim();
    if (!q || busy) return;
    lastQ.current = q;
    setMessages((m) => [...m, { role: "me", answer: q }]);
    setQuestion("");
    ask(q);
  }

  async function copy(i, t) {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(i);
      setTimeout(() => setCopied(-1), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="ap-ask">
      <div className="ap-chat" aria-live="polite">
        {messages.length === 0 && (
          <div className="ap-chat-empty">
            <MascotIcon size={64} idp="apq" />
            <p className="ap-hand">ask me anything about your notes!</p>
            <p className="ap-fine">Answers come only from this document. If it isn't in there, you'll be told.</p>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "me" ? (
            <div key={i} className="ap-msg is-me"><p>{m.answer}</p></div>
          ) : (
            <div key={i} className="ap-msg is-ai">
              <span className="ap-avatar" aria-hidden="true"><MascotIcon size={26} idp={`apa${i}`} /></span>
              <div>
                <p>{m.answer}</p>
                {m.quote && <blockquote>{m.quote}</blockquote>}
                <button className="ap-linkbtn" onClick={() => copy(i, m.answer)}>{copied === i ? "Copied" : "Copy"}</button>
              </div>
            </div>
          )
        )}
        {busy && (
          <div className="ap-msg is-ai" aria-label="thinking">
            <span className="ap-avatar" aria-hidden="true"><MascotIcon size={26} idp="apat" /></span>
            <div className="ap-dots"><i /><i /><i /></div>
          </div>
        )}
        <div ref={end} />
      </div>

      {error && (
        <div className="ap-alert is-err" role="alert">
          <span>{error}</span>
          <button className="ap-btn is-small" onClick={() => ask(lastQ.current)} disabled={busy}>Try again</button>
        </div>
      )}

      {messages.length === 0 && (
        <div className="ap-ideas">
          {IDEAS.map((q) => <button key={q} className="ap-chipbtn" onClick={() => send(q)} disabled={busy}>{q}</button>)}
        </div>
      )}

      <form className="ap-compose" onSubmit={(e) => { e.preventDefault(); send(question); }}>
        <label className="sr" htmlFor="ask-q">Your question</label>
        <input id="ask-q" className="ap-input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask anything about this document…" maxLength={MAX_QUESTION_CHARS} autoComplete="off" />
        <button className="ap-send" disabled={busy || !question.trim()} aria-label="Send question">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </form>
    </div>
  );
}
