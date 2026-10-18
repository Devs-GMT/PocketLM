"use client";
import { useEffect } from "react";

// Feature cards without controls (PDF, shelf) lean toward the pointer a little and catch a soft highlight (mouse only,
// never with reduced motion). The tilt is set through CSS variables, see .ln-card in globals.css.
export default function CardFx() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return undefined;
    const cards = [...document.querySelectorAll(".ln-card:not(.ln-ask):not(.ln-proof):not(.ln-listen)")];
    const cleanups = cards.map((card) => {
      let raf = 0;
      const move = (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          card.style.setProperty("--ry", `${((x - 0.5) * 7).toFixed(2)}deg`);
          card.style.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
          card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
          card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        });
      };
      const leave = () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      return () => {
        cancelAnimationFrame(raf);
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
      };
    });
    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
