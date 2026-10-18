"use client";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

// "Four pages, one notebook" as a pinned scene stage. On wide screens the stage sticks to the
// screen and scrolling walks through four painted desk scenes (the same desk, only the things on
// it change). A cream card on the left lists the four steps; one highlight box glides between
// them. On narrow screens the scene is a normal block and the steps cycle by themselves.
// The anchors #step-1..4 and data-guide-step stay, because the Pocket guide and its tour use them.

const STEPS = [
  { n: "I.", title: "Add your notes", sub: "paste text or drop in a short PDF", detail: "Paste text or drop in a PDF. The title fills in from the file name, and a PDF is read right in your browser.", glyph: "✎" },
  { n: "II.", title: "Get your study kit", sub: "summary, 5 key points, and you can listen to it", detail: "One request makes a summary, 5 key points and a 5-question quiz. Press Listen to hear the summary read aloud.", glyph: "♪" },
  { n: "III.", title: "Ask and quiz yourself", sub: "answers come only from your notes", detail: "Ask anything: the answer quotes the line it used. Then take the quiz and see right or wrong with a reason.", glyph: "?" },
  { n: "IV.", title: "Stamp your study", sub: "your score goes on BOT Chain as a study proof", detail: "Connect MetaMask, switch to BOT Chain, stamp. You get a Study number and a link you can share.", glyph: "✓" },
];
const AUTO_MS = 6500;
const MOTES = Array.from({ length: 16 }, (_, i) => [(i * 131) % 100, 20 + ((i * 47) % 70), 3 + ((i * 5) % 4), (i * 0.55) % 7, 6 + ((i * 3) % 6)]);
// where the glyphs rise from, per scene, as % of the artwork (the mascot)
const EMIT = [[88, 30], [89, 30], [88, 26], [90, 33]];

export default function HowStage() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [wide, setWide] = useState(false);
  const root = useRef(null);
  const anchors = useRef(null);
  const chipsEl = useRef(null);
  const slider = useRef(null);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const mq = window.matchMedia("(min-width: 901px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    if (root.current) io.observe(root.current);
    return () => {
      mq.removeEventListener("change", sync);
      io.disconnect();
    };
  }, []);

  // Wide: the anchor crossing the middle of the screen is the active step; --p follows the scroll.
  useEffect(() => {
    if (!wide || !anchors.current) return undefined;
    const items = [...anchors.current.querySelectorAll("li")];
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(items.indexOf(e.target))), { rootMargin: "-48% 0px -48% 0px" });
    items.forEach((li) => io.observe(li));
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = root.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      root.current.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [wide]);

  // Narrow: the steps cycle by themselves until one is picked.
  useEffect(() => {
    if (wide || !auto || !inView || reduce) return undefined;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [wide, auto, inView, reduce, active]);

  // One highlight box glides to the active step. The chips change height while their small text
  // opens and closes, so the box is re-measured on every size change as well.
  useLayoutEffect(() => {
    const place = () => {
      const chip = chipsEl.current?.querySelectorAll(".hs-chip")[active];
      const box = slider.current;
      if (!box || !chip) return;
      box.style.height = `${chip.offsetHeight}px`;
      box.style.transform = `translateY(${chip.offsetTop}px)`;
      box.style.opacity = "1";
    };
    place();
    const ro = new ResizeObserver(place);
    if (chipsEl.current) ro.observe(chipsEl.current);
    window.addEventListener("resize", place);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [active, wide]);

  const pick = (i) => {
    setAuto(false);
    if (wide) document.getElementById(`step-${i + 1}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    else setActive(i);
  };
  const s = STEPS[active];

  return (
    <div className="hs" ref={root} data-step={active}>
      <div className="hs-stage">
        <div className="hs-scene" aria-hidden="true">
          <div className="hs-art">
            {STEPS.map((st, i) => (
              <img key={i} className={`hs-img${i === active ? " is-on" : ""}`} src={`/scene-${i + 1}.jpg`} alt="" width="1672" height="941" decoding="async" draggable="false" />
            ))}
            <div className="hs-fx">
              {MOTES.map(([l, t, z, d, dur], i) => (
                <i key={i} className="hs-mote" style={{ left: `${l}%`, top: `${t}%`, width: z, height: z, animationDelay: `${d}s`, animationDuration: `${dur}s` }} />
              ))}
              {/* glyphs drifting up from Pocket: pencil, music, question, check */}
              <div className="hs-emit" key={`g${active}`} style={{ left: `${EMIT[active][0]}%`, top: `${EMIT[active][1]}%` }}>
                {[0, 1, 2, 3].map((k) => (
                  <b key={k} style={{ "--k": k }}>{s.glyph}</b>
                ))}
              </div>
              {/* the stamp lands in step IV */}
              {active === 3 && (
                <div className="hs-stamp" key="stamp" style={{ left: "72.7%", top: "57.9%" }}>
                  <span className="ring" />
                  <span className="glow" />
                  <span className="txt">stamped ✓</span>
                </div>
              )}
            </div>
          </div>
          <div className="hs-shade" />
        </div>

        <div className="hs-card" data-guide-avoid>
          <p className="note-sm hs-kicker">pick a page</p>
          <div className="hs-chips" role="group" aria-label="Steps" ref={chipsEl}>
            <span className="hs-slider" ref={slider} aria-hidden="true" />
            {STEPS.map((st, i) => (
              <button key={st.n} type="button" className={`hs-chip${i === active ? " is-active" : i < active ? " is-done" : ""}`} aria-pressed={i === active} onClick={() => pick(i)}>
                <span className="num">{st.n}</span>
                <span className="what">{st.title}<span className="sm"><small>{st.sub}</small></span></span>
              </button>
            ))}
          </div>
          <p className="hs-detail" key={active} aria-live="polite">{s.detail}</p>
          <span className="hs-rail" aria-hidden="true"><i /></span>
        </div>
      </div>

      <ol className="hs-anchors" ref={anchors}>
        {STEPS.map((st, i) => (
          <li key={st.n} id={`step-${i + 1}`} data-guide-step={i + 1} style={{ top: `calc(${i} * var(--seg))` }}>
            <span className="sr">Step {i + 1}: {st.title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
