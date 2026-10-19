"use client";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaceIcon, MascotIcon } from "@/components/MascotArt";
import { skipTour, useTourState, writeTour } from "@/lib/tour";

// Four coach marks. The first two show on Home right after "Show me around"; the other two wait until the
// user gets to a notebook and to the end of a quiz, so nothing is explained before it can be seen.
const STEPS = [
  { page: "home", chain: true, targets: [".ap-start"], title: "Start here", text: "Drop a PDF or paste your notes. Each notebook holds one document, up to 10 pages." },
  { page: "home", targets: [".ap-bar-top .ap-wbtn", ".ap-top .ap-wbtn"], title: "Your wallet is optional", text: "You only need it to stamp your study on BOT Chain. The kit, the chat and the quiz all work without one." },
  { page: "notebook", targets: [".ap-tabs"], title: "Your study kit", text: "Read the summary and key points, take the quiz, ask questions about your notes, or press Listen." },
  { page: "notebook", targets: [".ap-quiz-end .ap-btn.is-primary", ".ap-quiz-end"], title: "Stamp your study", text: "Only the title, a fingerprint of your notes and your score go on-chain. Never the notes themselves." },
];
const onPage = (page, path) => (page === "home" ? path === "/app" : path.startsWith("/app/notebook"));

const visible = (el) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};

/** The welcome pop-up offered once to a new visitor on Home. */
export function WelcomeCard({ onStart }) {
  const box = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    box.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && skipTour();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="ap-modal-bg">
      <div className="ap-modal ob-modal" role="dialog" aria-modal="true" aria-labelledby="ob-h" tabIndex={-1} ref={box}>
        <div className="ap-modal-body">
          <MascotIcon size={84} idp="obw" className="ob-mascot" />
          <h2 id="ob-h">Welcome to PocketLM!</h2>
          <p className="ap-lede">Turn your notes into a study kit, quiz yourself, then stamp what you finished on BOT Chain.</p>
          <ol className="ob-list">
            <li><b>1</b><span>Add a PDF or paste your notes</span></li>
            <li><b>2</b><span>Get a summary, key points and a quiz</span></li>
            <li><b>3</b><span>Stamp your study as a proof</span></li>
          </ol>
          <div className="ap-modal-actions">
            <button className="ap-btn is-ghost" onClick={skipTour}>Skip</button>
            <button className="ap-btn is-primary" onClick={onStart}>Show me around</button>
          </div>
          <p className="ap-fine">A quick 4-step tour. You can replay it any time from Settings.</p>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** The coach mark itself: a spotlight on the target and a small card next to it. */
export default function Tour() {
  const state = useTourState();
  const path = usePathname() || "";
  const [box, setBox] = useState(null); // { r: target rect, found: bool }
  const pop = useRef(null);
  const [pos, setPos] = useState(null);

  const running = state?.status === "running" && STEPS[state.step];
  const step = running ? STEPS[state.step] : null;
  const active = step && onPage(step.page, path);

  // find the target (it may appear a moment after the page does) and keep its rectangle fresh
  useEffect(() => {
    if (!active) {
      setBox(null);
      return undefined;
    }
    let raf = 0;
    let scrolled = false;
    // a dialog on top (the stamp dialog) pauses the tour until it is closed
    const find = () => document.querySelector(".ap-modal-bg") ? null : step.targets.map((s) => document.querySelector(s)).find((el) => el && visible(el)) || null;
    const measure = () => {
      raf = 0;
      const el = find();
      if (!el) return setBox((b) => (b ? null : b));
      if (!scrolled) {
        scrolled = true;
        el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
      const r = el.getBoundingClientRect();
      setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    const poll = setInterval(kick, 250);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();
    return () => {
      clearInterval(poll);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [active, step]);

  // place the card below the target, or above when there is no room
  useLayoutEffect(() => {
    if (!box || !pop.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(330, vw - 24);
    const h = pop.current.offsetHeight;
    const left = Math.max(12, Math.min(box.left, vw - w - 12));
    let top = box.top + box.height + 14;
    if (top + h > vh - 12) top = box.top - h - 14;
    if (top < 12) top = Math.max(12, Math.min(vh - h - 12, box.top + box.height / 2 - h / 2));
    setPos({ top, left, w });
  }, [box, state?.step]);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => e.key === "Escape" && !document.querySelector(".ap-modal-bg") && skipTour();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!active || !box) return null;
  const next = STEPS[state.step + 1];
  const label = step.chain && next ? "Next" : "Got it";
  const advance = () => (next ? writeTour({ status: "running", step: state.step + 1 }) : writeTour({ status: "done" }));

  return (
    <div className="ob-layer">
      <div className="ob-spot" style={{ top: box.top - 8, left: box.left - 8, width: box.width + 16, height: box.height + 16 }} aria-hidden="true" />
      <div
        className="ob-pop"
        ref={pop}
        role="dialog"
        aria-label={`Tutorial step ${state.step + 1} of ${STEPS.length}: ${step.title}`}
        style={pos ? { top: pos.top, left: pos.left, width: pos.w } : { top: 0, left: 0, width: Math.min(330, window.innerWidth - 24), visibility: "hidden" }}
      >
        <div className="ob-head">
          <FaceIcon size={26} idp="obp" />
          <span>Step {state.step + 1} of {STEPS.length}</span>
        </div>
        <h2>{step.title}</h2>
        <p>{step.text}</p>
        <div className="ob-actions">
          <button className="ap-btn is-ghost is-small" onClick={skipTour}>Skip tour</button>
          <button className="ap-btn is-primary is-small" onClick={advance}>{label}</button>
        </div>
      </div>
    </div>
  );
}
