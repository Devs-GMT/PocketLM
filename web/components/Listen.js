"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { guessLang } from "@/lib/source";

const RATES = [0.8, 1, 1.25, 1.5];
const BARS = Array.from({ length: 44 }, (_, i) => 18 + Math.round(((Math.sin(i * 1.7) + Math.sin(i * 0.55 + 1)) / 2 + 1) * 34));

const sentencesOf = (t) => (t.replace(/\s+/g, " ").match(/[^.!?。]+[.!?。]*\s*/g) || [t]).map((s) => s.trim()).filter(Boolean);

// Reads the summary aloud with the browser's built-in voice (free, nothing leaves the device).
// The voice has no timeline, so progress and the skip buttons work by sentence.
export default function Listen({ text }) {
  const [supported, setSupported] = useState(null);
  const [state, setState] = useState("idle"); // idle | playing | paused
  const [idx, setIdx] = useState(0);
  const [rate, setRate] = useState(1);
  const parts = useRef(sentencesOf(text));
  const pos = useRef(0);
  const rateRef = useRef(1);
  const run = useRef(0); // bumps when a new reading starts, so old callbacks are ignored

  useEffect(() => {
    parts.current = sentencesOf(text);
  }, [text]);

  useEffect(() => {
    setSupported("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  const speakFrom = useCallback((i) => {
    const synth = window.speechSynthesis;
    const id = ++run.current;
    synth.cancel();
    pos.current = i;
    setIdx(i);
    if (i >= parts.current.length) {
      setState("idle");
      pos.current = 0;
      setIdx(0);
      return;
    }
    const u = new SpeechSynthesisUtterance(parts.current[i]);
    u.lang = guessLang(text);
    u.rate = rateRef.current;
    u.onend = () => id === run.current && speakFrom(i + 1);
    u.onerror = (e) => id === run.current && e.error !== "interrupted" && e.error !== "canceled" && setState("idle");
    synth.speak(u);
    setState("playing");
  }, [text]);

  if (supported === null) return <div className="ap-listen" aria-hidden="true" />;
  if (!supported) {
    return (
      <div className="ap-listen">
        <h2 className="ap-h3">Listening mode</h2>
        <p className="ap-lede">This browser has no built-in voice, so Listen isn't available here. Try Chrome, Edge or Safari.</p>
      </div>
    );
  }

  const total = parts.current.length;
  const toggle = () => {
    const synth = window.speechSynthesis;
    if (state === "playing") {
      synth.pause();
      setState("paused");
    } else if (state === "paused") {
      synth.resume();
      setState("playing");
    } else speakFrom(pos.current >= total ? 0 : pos.current);
  };
  const skip = (d) => speakFrom(Math.min(total, Math.max(0, pos.current + d)));
  const stop = () => {
    run.current++;
    window.speechSynthesis.cancel();
    pos.current = 0;
    setIdx(0);
    setState("idle");
  };
  const changeRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    rateRef.current = next;
    if (state === "playing") speakFrom(pos.current);
  };
  const playing = state === "playing";

  return (
    <div className="ap-listen">
      <div className="ap-listen-head">
        <h2 className="ap-h3">Listening mode</h2>
        <p className="ap-lede">Let PocketLM read your summary out loud. It uses your browser's own voice.</p>
      </div>

      <div className={`ap-wave${playing ? " is-playing" : ""}`} aria-hidden="true">
        {BARS.map((h, i) => (
          <i key={i} className={i / BARS.length <= (idx + (state === "idle" ? 0 : 0.5)) / Math.max(1, total) ? "is-past" : ""} style={{ height: `${h}%`, animationDelay: `${(i % 9) * 0.09}s` }} />
        ))}
      </div>
      <div className="ap-listen-meta">
        <span>{state === "idle" ? "Ready" : `Sentence ${Math.min(idx + 1, total)} of ${total}`}</span>
        <span>{total} sentence{total === 1 ? "" : "s"}</span>
      </div>

      <div className="ap-controls">
        <button className="ap-chipbtn" onClick={changeRate} aria-label={`Speed ${rate} times, change`}>{rate}x</button>
        <button className="ap-round" onClick={() => skip(-1)} aria-label="Previous sentence" disabled={state === "idle"}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM20 6v12L9.5 12z" /></svg>
        </button>
        <button className="ap-round is-big" onClick={toggle} aria-label={playing ? "Pause" : state === "paused" ? "Resume" : "Play"}>
          {playing ? (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
          ) : (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <button className="ap-round" onClick={() => skip(1)} aria-label="Next sentence" disabled={state === "idle"}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM4 6v12l10.5-6z" /></svg>
        </button>
        <button className="ap-chipbtn" onClick={stop} disabled={state === "idle"}>Stop</button>
      </div>
    </div>
  );
}
