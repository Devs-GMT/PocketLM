"use client";
import { useEffect, useState } from "react";

// First-visit tutorial state. There are no accounts, so "new" means: this browser has never been offered
// the tour and has no saved notebooks. The choice is kept in localStorage:
//   null                          never offered
//   { status: "running", step }   the user said "Show me around"
//   { status: "skipped" | "done" }
const KEY = "pocketlm-tour";
const EVENT = "pocketlm:tour";
let memory = null; // used when the browser blocks storage, so the card still goes away

export function readTour() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v && typeof v === "object" ? v : memory;
  } catch {
    return memory;
  }
}

export function writeTour(value) {
  memory = value;
  try {
    value === null ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** The saved tour state. `undefined` until the browser has been read, then null or an object. */
export function useTourState() {
  const [state, setState] = useState(undefined);
  useEffect(() => {
    const sync = () => setState(readTour());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}

export const startTour = () => writeTour({ status: "running", step: 0 });
export const skipTour = () => writeTour({ status: "skipped" });
