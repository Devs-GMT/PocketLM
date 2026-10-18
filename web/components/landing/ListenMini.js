"use client";
import { useEffect, useState } from "react";
import { Headphones, Pause, Play } from "@/components/Icons";
import { guessLang } from "@/lib/source";

// Reads the summary aloud with the browser's built-in voice (free, nothing leaves the device).
export default function ListenMini({ text }) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState("idle"); // idle | playing | paused

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (state === "playing") {
      synth.pause();
      setState("paused");
    } else if (state === "paused") {
      synth.resume();
      setState("playing");
    } else {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = guessLang(text);
      u.onend = () => setState("idle");
      u.onerror = () => setState("idle");
      synth.speak(u);
      setState("playing");
    }
  }

  function stop() {
    window.speechSynthesis.cancel();
    setState("idle");
  }

  return (
    <div className="listen" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <button className="btn btn-sm" onClick={toggle} aria-pressed={state === "playing"}>
        <Headphones /> {state === "playing" ? <><Pause /> Pause</> : state === "paused" ? <><Play /> Resume</> : <>Listen</>}
      </button>
      {state !== "idle" && <button className="btn btn-sm btn-ghost" onClick={stop}>Stop</button>}
    </div>
  );
}
