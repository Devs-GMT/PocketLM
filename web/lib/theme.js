"use client";
import { useEffect, useState } from "react";

// Light or dark look for the app screens (the landing page is always light). Light is the default.
const KEY = "pocketlm-theme";
const ATTR = "data-app-theme";

export function getTheme() {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme) {
  const el = document.documentElement;
  if (theme === "dark") el.setAttribute(ATTR, "dark");
  else el.removeAttribute(ATTR);
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* storage blocked: the choice lasts until the page closes */
  }
  applyTheme(theme);
  window.dispatchEvent(new Event("pocketlm:theme"));
}

/** The app screens use this once (in the shell): applies the saved theme and removes it when leaving the app. */
export function useAppTheme() {
  useEffect(() => {
    applyTheme(getTheme());
    return () => document.documentElement.removeAttribute(ATTR);
  }, []);
}

/** Current theme for a settings control. */
export function useTheme() {
  const [theme, set] = useState("light");
  useEffect(() => {
    const sync = () => set(getTheme());
    sync();
    window.addEventListener("pocketlm:theme", sync);
    return () => window.removeEventListener("pocketlm:theme", sync);
  }, []);
  return theme;
}

// Runs before the first paint on /app so a dark choice does not flash light.
export const THEME_BOOT = `try{if(localStorage.getItem("${KEY}")==="dark")document.documentElement.setAttribute("${ATTR}","dark")}catch(e){}`;
