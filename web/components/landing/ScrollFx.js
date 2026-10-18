"use client";
import { useEffect } from "react";

// Scroll motion for the landing sections, driven by data attributes so the sections stay
// server-rendered:
//   data-reveal[="left|right|scale"] + data-delay="ms"   fade and slide in once, when scrolled to
//   data-split                                          heading words rise in one by one
//   data-count="300"                                    number counts up from 0 when it appears
//   data-parallax="0.12"                                drifts with scroll (decor only)
// Everything shows normally without JS (hiding only starts once <html> has the "rv" class, set
// by a tiny inline script in the layout) and with prefers-reduced-motion.

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function countUp(el, target, ms = 1100) {
  const t0 = performance.now();
  const step = (now) => {
    const t = clamp((now - t0) / ms, 0, 1);
    el.textContent = String(Math.round(target * easeOut(t)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function splitWords(el) {
  if (el.dataset.splitDone || el.children.length) return;
  const words = (el.textContent || "").trim().split(/\s+/);
  el.setAttribute("aria-label", words.join(" "));
  el.textContent = "";
  words.forEach((w, i) => {
    const outer = document.createElement("span");
    outer.className = "w";
    outer.setAttribute("aria-hidden", "true");
    outer.style.setProperty("--w", String(i));
    const inner = document.createElement("span");
    inner.textContent = w;
    outer.appendChild(inner);
    el.appendChild(outer);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
  el.dataset.splitDone = "1";
}

export default function ScrollFx() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = [...document.querySelectorAll("[data-reveal], [data-split], [data-count]")];

    if (reduce) {
      reveals.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }

    document.querySelectorAll("[data-split]").forEach(splitWords);
    const counts = new Map();
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      counts.set(el, target);
      el.textContent = "0";
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const delay = Number(el.dataset.delay || 0);
          const go = () => {
            el.classList.add("is-in");
            if (counts.has(el)) countUp(el, counts.get(el));
          };
          if (delay) setTimeout(go, delay);
          else go();
          io.unobserve(el);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    // parallax: decor drifts a little against the scroll
    const par = [...document.querySelectorAll("[data-parallax]")].map((el) => ({ el, speed: Number(el.dataset.parallax) || 0.1 }));
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      par.forEach(({ el, speed }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const off = r.top + r.height / 2 - vh / 2;
        el.style.translate = `0 ${(off * speed).toFixed(1)}px`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
