"use client";
import { useEffect, useRef, useState } from "react";

// Small working toys inside the feature cards (example content, no AI call):
//   AskDemo   pick a question, watch the answer arrive with the line it came from
//   StampToy  press the stamp

const QA = [
  { q: "What does chlorophyll absorb?", a: "Red and blue light.", quote: "Chlorophyll absorbs red and blue light and reflects green light." },
  { q: "Where does the Calvin cycle occur?", a: "In the stroma of the chloroplasts.", quote: "In the Calvin cycle, which occurs in the stroma, ATP and NADPH are used to fix carbon dioxide into glucose." },
  { q: "Who won the 2018 World Cup?", a: "That isn’t in your notes, so I can’t answer it.", quote: "" },
];

export function AskDemo() {
  const [cur, setCur] = useState(0);
  const [stage, setStage] = useState("done"); // dots | typing | done
  const [shown, setShown] = useState(QA[0].a.split(" ").length);
  const timers = useRef([]);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => timers.current.forEach((t) => clearTimeout(t) || clearInterval(t));
  }, []);

  const ask = (i) => {
    timers.current.forEach((t) => clearTimeout(t) || clearInterval(t));
    timers.current = [];
    setCur(i);
    const words = QA[i].a.split(" ");
    if (reduce.current) {
      setShown(words.length);
      setStage("done");
      return;
    }
    setShown(0);
    setStage("dots");
    timers.current.push(
      setTimeout(() => {
        setStage("typing");
        let n = 0;
        const id = setInterval(() => {
          n += 1;
          setShown(n);
          if (n >= words.length) {
            clearInterval(id);
            setStage("done");
          }
        }, 110);
        timers.current.push(id);
      }, 650)
    );
  };

  const item = QA[cur];
  const words = item.a.split(" ");
  return (
    <div className="ln-askdemo">
      <div className="ln-chips ln-qchips" role="group" aria-label="Try a question">
        {QA.map((x, i) => (
          <button key={x.q} type="button" className={i === cur ? "on" : ""} onClick={() => ask(i)} aria-pressed={i === cur}>{x.q}</button>
        ))}
      </div>
      <div className="ln-chat small" aria-live="polite">
        <div className="ln-bubble me">{item.q}</div>
        {stage === "dots" ? (
          <div className="ln-bubble ai ln-typing"><i /><i /><i /></div>
        ) : (
          <div className="ln-bubble ai">
            {words.slice(0, shown).join(" ")}
            {stage === "done" && item.quote && <blockquote>{item.quote}</blockquote>}
          </div>
        )}
      </div>
    </div>
  );
}

export function StampToy() {
  const [n, setN] = useState(12);
  const [tick, setTick] = useState(0);
  return (
    <button type="button" className="ln-stamptoy" onClick={() => { setN((v) => v + 1); setTick((t) => t + 1); }} aria-label={`Press the stamp. Study number ${n}.`}>
      <svg key={tick} viewBox="0 0 64 64" width="72" height="72" aria-hidden="true" className={tick ? "thunk" : ""}>
        <circle cx="32" cy="32" r="27" fill="none" stroke="#ef7a3a" strokeWidth="4" />
        <circle cx="32" cy="32" r="20" fill="none" stroke="#ef7a3a" strokeWidth="1.8" opacity=".7" />
        <path d="M20 33l8 8 17-18" fill="none" stroke="#ef7a3a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="note-sm">{tick ? `Study #${n} stamped!` : "press the stamp"}</span>
    </button>
  );
}
