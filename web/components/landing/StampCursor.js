"use client";
import { useEffect } from "react";

// PocketLM's own cursor: a stamp.
//   - an orange dot sits exactly on the pointer (the stamp pad)
//   - a dashed stamp ring follows it with a soft lag and turns slowly
//   - over buttons and links the ring grows and shows a check mark
//   - pressing squashes the ring like a stamp being pushed down, and letting go leaves
//     a small check-mark stamp print on the page that fades away
// Only for mouse-like pointers, never with reduced motion, hidden over the Pocket guide
// (which has its own grab cursor). The ring and dot are decoration only.

const INTERACTIVE = 'a, button, summary, [role="button"], label, input, textarea, select';

export default function StampCursor() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return undefined;

    const root = document.documentElement;
    const layer = document.createElement("div");
    layer.className = "pc-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML =
      '<div class="pc-ring"><svg viewBox="0 0 48 48"><circle class="pc-outer" cx="24" cy="24" r="21" /><circle class="pc-inner" cx="24" cy="24" r="15" /></svg><svg class="pc-check" viewBox="0 0 48 48"><path d="M15 25l7 7 12-14" /></svg></div><div class="pc-dot"></div>';
    document.body.appendChild(layer);
    const ring = layer.querySelector(".pc-ring");
    const dot = layer.querySelector(".pc-dot");

    let tx = -100;
    let ty = -100;
    let rx = -100;
    let ry = -100;
    let angle = 0;
    let raf = 0;
    let visible = false;
    let hot = false;
    let down = false;
    let overGuide = false;

    const setState = () => {
      layer.classList.toggle("is-visible", visible && !overGuide);
      layer.classList.toggle("is-hot", hot);
      layer.classList.toggle("is-down", down);
    };

    const loop = () => {
      rx += (tx - rx) * 0.2;
      ry += (ty - ry) * 0.2;
      angle += 0.35;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      ring.firstElementChild.style.transform = `rotate(${angle}deg)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      if (!visible) {
        rx = tx;
        ry = ty;
        visible = true;
        root.classList.add("pc-on");
      }
      const t = e.target instanceof Element ? e.target : null;
      hot = !!t?.closest(INTERACTIVE) && !t.closest("[data-guide-bot]");
      overGuide = !!t?.closest("[data-guide-bot]");
      setState();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      visible = false;
      setState();
    };
    const onDown = (e) => {
      if (e.button !== 0) return;
      down = true;
      setState();
    };
    const onUp = (e) => {
      if (!down) return;
      down = false;
      setState();
      if (overGuide || e.button !== 0) return;
      // leave a stamp print where it landed
      const old = document.querySelectorAll(".pc-print");
      if (old.length > 10) old[0].remove();
      const p = document.createElement("div");
      p.className = "pc-print";
      p.setAttribute("aria-hidden", "true");
      p.style.left = `${e.pageX}px`;
      p.style.top = `${e.pageY}px`;
      p.style.setProperty("--r", `${Math.round(Math.random() * 28 - 14)}deg`);
      p.innerHTML = '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" /><circle cx="24" cy="24" r="15" /><path d="M15 25l7 7 12-14" /></svg>';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      root.classList.remove("pc-on");
      layer.remove();
      document.querySelectorAll(".pc-print").forEach((n) => n.remove());
    };
  }, []);

  return null;
}
