"use client";
import { useEffect, useRef, useState } from "react";

// "helps you [learn]": the last word is typed, held, deleted and replaced by the next one, forever.
// The server renders the first word, screen readers always get the plain sentence, and with
// reduced motion the word simply stays "learn".
const TYPE_MS = 85;
const DELETE_MS = 45;
const HOLD_MS = 1500;
const FIRST_HOLD_MS = 2600;

export default function TypedWord({ words }) {
  const [text, setText] = useState(words[0]);
  const [typing, setTyping] = useState(false);
  const timer = useRef();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let i = 0;
    let n = words[0].length;
    let phase = "hold";
    setTyping(true);

    const tick = () => {
      const word = words[i];
      if (phase === "hold") {
        phase = "delete";
        timer.current = setTimeout(tick, i === 0 && n === word.length && !tick.started ? FIRST_HOLD_MS : HOLD_MS);
        tick.started = true;
        return;
      }
      if (phase === "delete") {
        n -= 1;
        setText(word.slice(0, Math.max(n, 0)));
        if (n <= 0) {
          i = (i + 1) % words.length;
          phase = "type";
          timer.current = setTimeout(tick, 260);
        } else timer.current = setTimeout(tick, DELETE_MS);
        return;
      }
      // type
      n += 1;
      setText(words[i].slice(0, n));
      if (n >= words[i].length) {
        phase = "hold";
        timer.current = setTimeout(tick, TYPE_MS);
      } else timer.current = setTimeout(tick, TYPE_MS);
    };

    timer.current = setTimeout(tick, 0);
    return () => clearTimeout(timer.current);
  }, [words]);

  // No fixed width on purpose: the centred sentence slides left and right as letters
  // are typed and deleted, like the headline typer on agenteco.web.id.
  return (
    <span className="typed" data-typing={typing || undefined}>
      <span className="typed-live" aria-hidden="true">
        {text}
        <i className="typed-caret" />
      </span>
      <span className="sr">{words[0]}</span>
    </span>
  );
}
