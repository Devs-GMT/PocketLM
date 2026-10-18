"use client";
import { useEffect, useRef, useState } from "react";

// The privacy receipt, alive: type any sentence and the fingerprint (SHA-256, computed right here
// in your browser, the same way the real notebook does it) changes with every key. The sentence
// itself ends up in the "never goes on-chain" list, struck out.

const EXAMPLE = "0xf2ac346d65102da3cdcf6b9b2b4ad11a302f60377635edbf9e8fc18fb99053d6";
const short = (h) => `${h.slice(0, 6)}…${h.slice(-4)}`;

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return "0x" + [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LiveReceipt() {
  const [text, setText] = useState("");
  const [hash, setHash] = useState(EXAMPLE);
  const [flash, setFlash] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    let alive = true;
    sha256(text.trim() || "").then((h) => {
      if (!alive) return;
      setHash(text.trim() ? h : EXAMPLE);
      setFlash((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, [text]);

  const typed = text.trim();
  const rows = [
    ["Title", "Biology chapter 3"],
    ["Fingerprint", short(hash)],
    ["Score", "4/5"],
    ["Date", "Oct 17, 2026"],
    ["Wallet", "0x6763…08C1"],
  ];
  const never = [typed ? `“${typed.length > 26 ? typed.slice(0, 26) + "…" : typed}”` : "Your notes", "Your PDF", "Your questions"];

  return (
    <div className="ln-receipt" data-guide-avoid data-reveal="receipt">
      <span className="ln-tape" aria-hidden="true" />
      <p className="ln-rhead">goes on-chain</p>
      <dl>
        {rows.map(([k, v], i) => (
          <div key={k} className="ln-row" style={{ "--k": i }}>
            <dt>{k}</dt>
            <dd key={k === "Fingerprint" ? flash : undefined} className={k === "Fingerprint" && flash ? "is-flash" : undefined} title={k === "Fingerprint" ? hash : undefined}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="ln-rhead never">never goes on-chain</p>
      <ul className="ln-never">
        {never.map((t, i) => (
          <li key={i} style={{ "--k": i }}>{t}</li>
        ))}
      </ul>

      <label className="ln-try">
        <span className="note-sm">try it: type any sentence</span>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. my secret study notes" maxLength={200} autoComplete="off" spellCheck="false" />
      </label>
      <small>
        {typed ? "That fingerprint was made in your browser just now. Nobody can get your sentence back from it." : "Example values. The score is graded in your browser, so a stamp is a study log, not a grade."}
      </small>
    </div>
  );
}
