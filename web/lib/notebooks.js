"use client";
import { useCallback, useEffect, useState } from "react";

// Notebooks live only in this browser (localStorage). Nothing here is sent to a server;
// the notes are only sent to the AI when a study kit or an answer is requested.
const KEY = "pocketlm.notebooks.v1";
const MAX_SAVED = 30;
const EVENT = "pocketlm:notebooks";

function readAll() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_SAVED)));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch {
    return false;
  }
}

export const newId = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export function listNotebooks() {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getNotebook(id) {
  return readAll().find((n) => n.id === id) || null;
}

/** Saves (or updates) one notebook. Returns false when the browser refused to store it. */
export function saveNotebook(nb) {
  const rest = readAll().filter((n) => n.id !== nb.id);
  return writeAll([{ ...nb, updatedAt: Date.now() }, ...rest]);
}

export function patchNotebook(id, patch) {
  const cur = getNotebook(id);
  if (!cur) return false;
  return saveNotebook({ ...cur, ...patch });
}

export function deleteNotebook(id) {
  return writeAll(readAll().filter((n) => n.id !== id));
}

export function clearNotebooks() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

/** The saved notebooks, kept in sync across tabs and pages. `null` until the browser has been read. */
export function useNotebooks() {
  const [list, setList] = useState(null);
  const refresh = useCallback(() => setList(listNotebooks()), []);
  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return list;
}

export const quizScore = (nb) => (nb.answers || []).reduce((n, a, i) => n + (a !== null && a === nb.kit.quiz[i]?.answer ? 1 : 0), 0);
export const quizDone = (nb) => !!nb.answers && nb.answers.length === nb.kit.quiz.length && nb.answers.every((a) => a !== null);

export const shortDate = (ms) => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const shortDateTime = (ms) =>
  new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// A PDF picked on the home screen is handed to the "new notebook" page here (a File cannot go in a URL).
let pending = null;
export const handOffFile = (f) => { pending = f; };
export const takeHandedFile = () => { const f = pending; pending = null; return f; };
