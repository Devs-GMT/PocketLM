"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import GuideBotArt from "@/components/GuideBotArt";
import { ABOUT_LINE, BACK_LINES, CLICK_LINES, FAQ_LINES, GUIDE, HOVER_LINES, PET_LINES, STAMP_LINE, TOUR, WANDER, greeting, markVisit, readMs } from "@/components/guideTalk";

/**
 * Pocket, the landing page's guide. It follows you down the page and stands beside the headline or
 * the visual of each section, never on text, buttons or cards (it measures what is on screen and
 * steps aside). Sideways trips are a walk (legs, body bob, arm swing, leaf sway); big vertical trips
 * are a hop with squash and stretch. It looks at your cursor, plays tag, reacts to clicks, blushes when
 * petted, can be picked up and thrown, falls asleep when left alone, and has a menu (double-click or
 * Enter) with a guided tour. Landing page only.
 */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

const NAV_H = 92; // the floating navbar
const ART_RATIO = 400 / 360;
const PINK = "#FF6F8F";
const BOUNCE_FROM = 750; // release speed (px/s) from which a thrown Pocket bounces

function measure() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = vw < 640 ? 72 : 96;
  return { vw, vh, w, h: Math.round(w * ART_RATIO) };
}

// ---------------------------------------------------------------- finding room to stand

const CONTENT =
  'main :is(h1,h2,h3,h4,h5,h6,p,li,label,button,a,input,select,textarea,img,svg,summary,[role="button"],[data-guide-avoid]), footer :is(a,p,code,[data-guide-avoid]), footer .cover-card';

/** Everything the guide should not stand on, as rectangles in viewport pixels. */
function obstacles(d) {
  const out = [{ l: 0, t: 0, r: d.vw, b: NAV_H }];
  document.querySelectorAll(CONTENT).forEach((el) => {
    if (el.closest("[data-guide-bot]")) return;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > d.vh || r.right < 0 || r.left > d.vw) return;
    if (r.width * r.height > d.vw * d.vh * 0.45) return; // a backdrop (the hero scene), not content
    out.push({ l: r.left, t: r.top, r: r.right, b: r.bottom });
  });
  return out;
}

// The mascot's body and leaf, without the empty corners of its box.
const bodyBox = (x, y, d, m) => ({ l: x + d.w * 0.1 - m, t: y + d.h * 0.04 - m, r: x + d.w * 0.9 + m, b: y + d.h * 0.94 + m });
const isFree = (x, y, d, obs, m = 14) => {
  const b = bodyBox(x, y, d, m);
  return !obs.some((o) => o.l < b.r && o.r > b.l && o.t < b.b && o.b > b.t);
};

function sampleSpots(d, obs, n = 70) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = 8 + Math.random() * Math.max(1, d.vw - d.w - 16);
    // mostly at eye height, now and then up near the menu or down low
    const y = Math.random() < 0.8 ? clamp(d.vh * (0.2 + Math.random() * 0.5) - d.h / 2, NAV_H, d.vh - d.h - 8) : NAV_H + Math.random() * Math.max(1, d.vh - d.h - NAV_H - 8);
    if (isFree(x, y, d, obs)) out.push({ x, y });
  }
  return out;
}

/** Things on screen worth pointing at, each with what Pocket says about it. */
function pointOuts(d) {
  const found = [];
  const add = (els, lines) =>
    els.slice(0, 4).forEach((el) => {
      if (el.closest("[data-guide-bot]")) return;
      const r = el.getBoundingClientRect();
      if (r.top > NAV_H + 8 && r.bottom < d.vh - 30 && r.left > 10 && r.right < d.vw - 10 && r.width > 20 && r.height > 12) found.push({ rect: r, line: pickOne(lines) });
    });
  add([...document.querySelectorAll('a[href="/app"]')], ["This button opens your notebook. Press it!"]);
  add([...document.querySelectorAll(".faq summary")].slice(0, 2), ["Tap a question to see the answer!"]);
  add([...document.querySelectorAll("main h2")], ["Psst, this part is a good one!", "Read this bit, I'll wait!", "Ooh, I like this section!"]);
  return found;
}

/** A free spot right beside a rectangle (so Pocket points at it without covering it). */
function spotBeside(r, d, obs) {
  const cx = (x) => clamp(x, 8, d.vw - d.w - 8);
  const cy = (y) => clamp(y, NAV_H, d.vh - d.h - 8);
  const tries = shuffle([
    { x: r.right + 12 - d.w * 0.1, y: r.top + r.height / 2 - d.h / 2 },
    { x: r.left - d.w * 0.9 - 12, y: r.top + r.height / 2 - d.h / 2 },
    { x: r.left + r.width / 2 - d.w / 2, y: r.bottom + 8 - d.h * 0.04 },
    { x: r.left + r.width / 2 - d.w / 2, y: r.top - d.h * 0.94 - 8 },
  ]);
  for (const t of tries) {
    const x = cx(t.x);
    const y = cy(t.y);
    if (isFree(x, y, d, obs, 6)) return { x, y };
  }
  return null;
}

// ---------------------------------------------------------------- bits that float off the head

function SparkView({ spark, onDone }) {
  if (spark.confetti) {
    const { dy, rot } = spark.confetti;
    return (
      <motion.span
        aria-hidden="true"
        className="guide-confetti"
        style={{ background: spark.color }}
        initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
        animate={{ x: spark.dx, y: [0, dy, dy + 170], rotate: rot, opacity: [1, 1, 0] }}
        transition={{ duration: 1.9, ease: "easeOut", y: { duration: 1.9, times: [0, 0.3, 1], ease: ["easeOut", "easeIn"] } }}
        onAnimationComplete={() => onDone(spark.id)}
      />
    );
  }
  return (
    <motion.span
      aria-hidden="true"
      className="guide-spark"
      style={{ color: spark.color, marginLeft: spark.dx }}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: -52, scale: [0.5, 1.15, 1, 0.9] }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      onAnimationComplete={() => onDone(spark.id)}
    >
      {spark.glyph}
    </motion.span>
  );
}

const REACTIONS = CLICK_LINES;

export default function GuideBot() {
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState(false); // hiding lasts for this visit only: a refresh brings Pocket back
  const [dim, setDim] = useState(measure);
  const dimRef = useRef(dim);
  const [mood, setMoodState] = useState("idle");
  const moodRef = useRef("idle");
  const [blink, setBlink] = useState(false);
  const [bubble, setBubble] = useState(null);
  const [sparks, setSparks] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [walking, setWalking] = useState(false);
  const [airborne, setAirborne] = useState(false);
  const [menu, setMenu] = useState(null);
  const [touring, setTouring] = useState(false);

  const posX = useMotionValue(-400);
  const posY = useMotionValue(0);
  const bobY = useMotionValue(0);
  const bodyY = useMotionValue(0);
  const bodyRot = useMotionValue(0);
  const scaleX = useSpring(1, { stiffness: 260, damping: 12 });
  const scaleY = useSpring(1, { stiffness: 260, damping: 12 });
  const lookX = useSpring(0, { stiffness: 120, damping: 18 });
  const lookY = useSpring(0, { stiffness: 120, damping: 18 });
  const lean = useSpring(0, { stiffness: 70, damping: 16 });
  const rotate = useTransform([lean, bodyRot], ([a, b]) => a + b);

  const moveCtl = useRef([]);
  const hopTimer = useRef();
  const bounceRaf = useRef(0);
  const moodTimer = useRef();
  const bubbleTimer = useRef();
  const homeTimer = useRef();
  const sleepTimer = useRef();
  const tapTimer = useRef();
  const sparkId = useRef(0);
  const bubbleId = useRef(0);
  const home = useRef(GUIDE.hero.at);
  const sectionKey = useRef("hero");
  const seen = useRef(new Set());
  const clicks = useRef([]);
  const reactions = useRef(0);
  const touch = useRef(null);
  const scheduleRoamRef = useRef(() => {});
  const dodge = useRef({ count: 0, until: 0, last: 0, first: 0 });
  const menuRef = useRef(false);
  const tourRef = useRef(false);
  const startTourRef = useRef(() => {});
  const stopTourRef = useRef(() => {});
  const lastSaid = useRef(0);
  const sticky = useRef(false);
  const taps = useRef([]);
  const lastTap = useRef(0);
  const botEl = useRef(null);

  const setMood = useCallback((m, ms) => {
    clearTimeout(moodTimer.current);
    moodRef.current = m;
    setMoodState(m);
    if (ms) {
      moodTimer.current = setTimeout(() => {
        const next = touch.current && (touch.current.moved || touch.current.held) ? "lifted" : "idle";
        moodRef.current = next;
        setMoodState(next);
      }, ms);
    }
  }, []);

  const say = useCallback(
    (text, ms = 3200, keep = false) => {
      clearTimeout(bubbleTimer.current);
      sticky.current = keep;
      const d = dimRef.current;
      const bx = posX.get();
      const by = posY.get();
      // Put the bubble where it covers nothing: above or below, left or right aligned, wide to narrow.
      const obs = obstacles(d);
      const preferRight = bx + d.w / 2 > d.vw / 2;
      const sides = preferRight ? [true, false] : [false, true];
      const overlap = (below, right, maxW) => {
        const w = Math.min(maxW, 30 + text.length * 7);
        const lines = Math.ceil((text.length * 7) / Math.max(40, w - 30));
        const h = lines * 20 + 26;
        const l = right ? bx + d.w - w : bx;
        const t = below ? by + d.h - 4 : by + 6 - h;
        if (l < 4 || l + w > d.vw - 4 || t < 4 || t + h > d.vh - 4) return Infinity;
        return obs.filter((o) => o.l < l + w + 4 && o.r > l - 4 && o.t < t + h + 4 && o.b > t - 4).length;
      };
      let pick = { below: by < 150, right: preferRight, maxW: Math.min(250, d.vw - 24) };
      let least = Infinity;
      search: for (const maxW of [250, 210, 170]) {
        for (const below of by < 150 ? [true, false] : [false, true]) {
          for (const right of sides) {
            const n = overlap(below, right, maxW);
            if (n < least) {
              least = n;
              pick = { below, right, maxW: Math.min(maxW, d.vw - 24) };
              if (n === 0) break search;
            }
          }
        }
      }
      lastSaid.current = Date.now();
      bubbleId.current += 1;
      setBubble({ text, key: bubbleId.current, ...pick });
      bubbleTimer.current = setTimeout(() => {
        sticky.current = false;
        setBubble(null);
      }, ms);
    },
    [posX, posY]
  );

  // Lines nobody asked for wait their turn: at most one every 7 s, never while held, in the menu or on tour.
  const chat = useCallback(
    (text, ms) => {
      if (menuRef.current || tourRef.current || touch.current) return false;
      if (Date.now() - lastSaid.current < 7000) return false;
      say(text, ms ?? readMs(text));
      return true;
    },
    [say]
  );

  const burst = useCallback((glyph, color, count = 3) => {
    const made = Array.from({ length: count }, (_, i) => ({ id: (sparkId.current += 1), glyph, color, dx: (i - (count - 1) / 2) * 26 + (Math.random() * 10 - 5) }));
    setSparks((s) => [...s, ...made]);
  }, []);
  const dropSpark = useCallback((id) => setSparks((s) => s.filter((x) => x.id !== id)), []);
  const confetti = useCallback(() => {
    if (reduce) return;
    const colors = ["#ef7a3a", "#ffd27a", "#86b36e", "#ff8fb5", "#5ec8ff", "#b07cff"];
    const made = Array.from({ length: 22 }, (_, i) => ({ id: (sparkId.current += 1), glyph: "", color: colors[i % colors.length], dx: (Math.random() - 0.5) * 230, confetti: { dy: -60 - Math.random() * 90, rot: (Math.random() - 0.5) * 720 } }));
    setSparks((s) => [...s, ...made]);
  }, [reduce]);

  const fx = useCallback(
    (kind) => {
      if (reduce) return;
      switch (kind) {
        case "hop":
          animate(bodyY, [0, -20, 0, -9, 0], { duration: 0.7, ease: "easeOut" });
          break;
        case "jump":
          animate(bodyY, [0, -30, 0], { duration: 0.55, ease: "easeOut" });
          scaleX.set(1.12);
          scaleY.set(1.12);
          setTimeout(() => {
            scaleX.set(1);
            scaleY.set(1);
          }, 260);
          break;
        case "tilt":
          animate(bodyRot, [0, -13, 11, 0], { duration: 0.7, ease: "easeInOut" });
          break;
        case "spin":
          animate(bodyRot, [0, 360], { duration: 0.85, ease: [0.3, 0, 0.2, 1] }).then(() => bodyRot.set(0));
          animate(bodyY, [0, -16, 0], { duration: 0.85, ease: "easeOut" });
          break;
        case "nod":
          animate(bodyY, [0, 7, 0, 7, 0], { duration: 0.7, ease: "easeInOut" });
          break;
        case "sway":
          animate(bodyRot, [0, -6, 6, -6, 6, 0], { duration: 2.2, ease: "easeInOut" });
          break;
        case "wobble":
          animate(bodyRot, [0, -10, 10, -8, 8, -5, 5, 0], { duration: 1.8 });
          break;
        default:
      }
    },
    [reduce, bodyY, bodyRot, scaleX, scaleY]
  );

  // ---- moving around: a walk for sideways trips, a hop for big vertical ones

  const bounds = useCallback(() => {
    const d = dimRef.current;
    return { minX: 0, maxX: d.vw - d.w, minY: 72, maxY: d.vh - d.h };
  }, []);

  const stopMove = useCallback(() => {
    moveCtl.current.forEach((c) => c.stop());
    moveCtl.current = [];
    clearTimeout(hopTimer.current);
    cancelAnimationFrame(bounceRaf.current);
    setWalking(false);
    setAirborne(false);
    lean.set(0);
  }, [lean]);

  const moveTo = useCallback(
    (x, y, fast = false) => {
      stopMove();
      if (reduce) {
        posX.set(x);
        posY.set(y);
        return;
      }
      const x0 = posX.get();
      const y0 = posY.get();
      const dx = x - x0;
      const dy = y - y0;
      const dist = Math.hypot(dx, dy);
      if (dist < 3) return;
      const jump = Math.abs(dy) > 120 && Math.abs(dy) > Math.abs(dx) * 0.45;
      if (!jump) {
        const dur = clamp(dist / (fast ? 520 : 230), 0.4, 6);
        const ease = [0.45, 0, 0.35, 1];
        setWalking(true);
        lean.set(Math.sign(dx) * 6);
        lookX.set(Math.sign(dx) * 10);
        const cx = animate(posX, x, { duration: dur, ease });
        const cy = animate(posY, y, { duration: dur, ease });
        moveCtl.current = [cx, cy];
        cx.then(() => {
          setWalking(false);
          lean.set(0);
          lookX.set(0);
        });
        return;
      }
      // crouch, spring up, arc over, land
      const air = clamp(dist / 650, 0.55, 1.15);
      const apex = Math.min(y0, y) - clamp(Math.abs(dy) * 0.35 + 60, 70, 160);
      scaleX.set(1.12);
      scaleY.set(0.82);
      hopTimer.current = setTimeout(() => {
        scaleX.set(0.92);
        scaleY.set(1.14);
        setAirborne(true);
        lookX.set(0);
        const cx = animate(posX, x, { duration: air, ease: "easeInOut" });
        const cy = animate(posY, [y0, apex, y], { duration: air, times: [0, 0.45, 1], ease: ["easeOut", "easeIn"] });
        moveCtl.current = [cx, cy];
        cx.then(() => {
          setAirborne(false);
          scaleX.set(1.14);
          scaleY.set(0.84);
          setTimeout(() => {
            scaleX.set(1);
            scaleY.set(1);
          }, 150);
        });
      }, 140);
    },
    [reduce, stopMove, posX, posY, lean, lookX, scaleX, scaleY]
  );

  const anchor = useCallback((at) => {
    const { vw, vh, w, h } = dimRef.current;
    return { x: clamp(at.x * vw - w / 2, 8, vw - w - 8), y: clamp(at.y * vh - h / 2, NAV_H, vh - h - 8) };
  }, []);

  // The spot a section prefers, or the nearest one that no text, button or card is under.
  const placeNear = useCallback(
    (at) => {
      const a = anchor(at);
      const d = dimRef.current;
      const obs = obstacles(d);
      if (isFree(a.x, a.y, d, obs)) return a;
      const spots = sampleSpots(d, obs, 90);
      if (!spots.length) return { x: d.vw - d.w - 8, y: d.vh - d.h - 10 }; // nowhere free (phones): a corner
      spots.sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y));
      return spots[0];
    },
    [anchor]
  );

  const spotFor = useCallback(
    (key) => {
      const d = dimRef.current;
      if (key.startsWith("step-")) {
        const el = document.getElementById(key);
        if (el) {
          const s = spotBeside(el.getBoundingClientRect(), d, obstacles(d));
          if (s) return s;
        }
        return placeNear(home.current);
      }
      if (GUIDE[key]?.at) home.current = GUIDE[key].at;
      return placeNear(home.current);
    },
    [placeNear]
  );

  const goHome = useCallback(() => {
    const a = placeNear(home.current);
    moveTo(a.x, a.y);
  }, [placeNear, moveTo]);

  const scheduleHome = useCallback(
    (ms) => {
      clearTimeout(homeTimer.current);
      homeTimer.current = setTimeout(goHome, ms);
    },
    [goHome]
  );

  // ---- sleeping

  const bump = useCallback(() => {
    clearTimeout(sleepTimer.current);
    if (moodRef.current === "yawn") setMood("idle");
    const doze = () => {
      if (moodRef.current === "sleep") return;
      if (moodRef.current !== "idle" || menuRef.current || tourRef.current || touch.current) {
        sleepTimer.current = setTimeout(doze, 5000);
        return;
      }
      setMood("yawn");
      setBubble(null);
      if (!reduce) {
        scaleY.set(1.1);
        scaleX.set(0.95);
        setTimeout(() => {
          scaleX.set(1);
          scaleY.set(1);
        }, 900);
      }
      sleepTimer.current = setTimeout(() => {
        if (moodRef.current === "yawn") setMood("sleep");
      }, 1900);
    };
    sleepTimer.current = setTimeout(doze, 20000);
  }, [setMood, reduce, scaleX, scaleY]);

  const wake = useCallback(
    (line) => {
      if (moodRef.current !== "sleep") return;
      setMood("surprised", 1400);
      fx("jump");
      burst("!", "#ef7a3a", 1);
      if (line) say(line, 2800);
    },
    [setMood, fx, burst, say]
  );

  // ---- reacting

  const dizzy = useCallback(() => {
    setMood("dizzy", 2800);
    fx("wobble");
    burst("★", "#ffd27a", 3);
    say("Okay, okay… I'm dizzy! x_x", 2600);
  }, [setMood, fx, burst, say]);

  const react = useCallback(() => {
    bump();
    scheduleRoamRef.current(11000);
    const now = Date.now();
    clicks.current = clicks.current.filter((t) => now - t < 1500);
    clicks.current.push(now);
    if (moodRef.current === "sleep") return wake("Oh! I wasn't sleeping… much.");
    if (clicks.current.length >= 5) {
      clicks.current = [];
      return dizzy();
    }
    const n = reactions.current++;
    if (n % 6 === 5) {
      setMood("happy", 1800);
      fx("hop");
      return say(`Need a reminder? ${GUIDE[sectionKey.current]?.line ?? ""}`, 4200);
    }
    const [kind, line] = REACTIONS[n % REACTIONS.length];
    switch (kind) {
      case "happy":
        setMood("happy", 1800);
        fx("hop");
        burst("✦", "#ffd27a", 2);
        break;
      case "surprised":
        setMood("surprised", 1400);
        fx("jump");
        burst("!", "#ef7a3a", 1);
        break;
      case "wink":
        setMood("wink", 1800);
        fx("tilt");
        burst("✦", "#ffd27a", 2);
        break;
      case "love":
        setMood("love", 2200);
        fx("hop");
        burst("♥", PINK, 3);
        break;
      default:
        setMood("happy", 1600);
        fx("spin");
    }
    say(line, 2600);
  }, [bump, wake, dizzy, setMood, fx, burst, say]);

  // ---- the menu (double-click, or Enter)

  const openMenu = useCallback(() => {
    const d = dimRef.current;
    const bx = posX.get();
    const by = posY.get();
    const w = 214;
    const h = 214;
    const fits = (o) => {
      const l = o.right ? bx + d.w - w : bx;
      const t = o.below ? by + d.h - 4 : by + 6 - h;
      return l >= 4 && l + w <= d.vw - 4 && t >= NAV_H && t + h <= d.vh - 4;
    };
    const right = bx + d.w / 2 > d.vw / 2;
    const options = [
      { below: false, right },
      { below: true, right },
      { below: false, right: !right },
      { below: true, right: !right },
    ];
    clearTimeout(bubbleTimer.current);
    setBubble(null);
    menuRef.current = true;
    setMenu(options.find(fits) ?? options[0]);
    setMood("happy", 1200);
    fx("hop");
  }, [posX, posY, setMood, fx]);

  const closeMenu = useCallback(() => {
    menuRef.current = false;
    setMenu(null);
  }, []);

  // ---- pointer: click, hold, drag, throw

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    stopMove();
    clearTimeout(homeTimer.current);
    bump();
    scheduleRoamRef.current(14000);
    const t = { id: e.pointerId, sx: e.clientX, sy: e.clientY, bx: posX.get(), by: posY.get(), moved: false, held: false, trail: [{ x: e.clientX, y: e.clientY, t: performance.now() }], dizz: 0, dir: { x: 0, y: 0 }, lastT: performance.now() };
    t.holdTimer = setTimeout(() => {
      if (touch.current !== t || t.moved) return;
      t.held = true;
      setMood("lifted");
      scaleX.set(1.06);
      scaleY.set(0.9);
    }, 180);
    touch.current = t;
  };

  const onPointerMove = (e) => {
    const t = touch.current;
    if (!t || t.id !== e.pointerId) return;
    const dx = e.clientX - t.sx;
    const dy = e.clientY - t.sy;
    if (!t.moved && Math.hypot(dx, dy) > 6) {
      t.moved = true;
      clearTimeout(t.holdTimer);
      setDragging(true);
      setBubble(null);
      setMood("lifted");
      scaleX.set(1.06);
      scaleY.set(0.9);
    }
    if (!t.moved) return;
    const b = bounds();
    posX.set(clamp(t.bx + dx, b.minX - 20, b.maxX + 20));
    posY.set(clamp(t.by + dy, b.minY, b.maxY));
    const now = performance.now();
    const prev = t.trail[t.trail.length - 1];
    t.trail.push({ x: e.clientX, y: e.clientY, t: now });
    while (t.trail.length > 2 && now - t.trail[0].t > 700) t.trail.shift();
    // Shaking makes it dizzy: every sharp change of direction adds up, and the feeling fades while held still.
    t.dizz = Math.max(0, t.dizz - (now - t.lastT) / 450);
    t.lastT = now;
    for (const axis of ["x", "y"]) {
      const v = axis === "x" ? e.clientX - prev.x : e.clientY - prev.y;
      if (Math.abs(v) > 3) {
        const sign = Math.sign(v);
        if (t.dir[axis] && sign !== t.dir[axis]) t.dizz += 1;
        t.dir[axis] = sign;
      }
    }
    if (t.dizz >= 3.5) {
      t.dizz = 2.5;
      if (moodRef.current !== "dizzy") dizzy();
      else setMood("dizzy", 2200);
    }
  };

  // A hard throw is a ball: gravity, bounces off the walls, ceiling and floor (losing speed, squashing),
  // arms flailing, then it rolls to a stop, recovers and walks back to its spot.
  const throwIt = (vx0, vy0) => {
    const GRAVITY = 1700;
    const WALL = 0.8;
    const FLOOR = 0.72;
    const AIR = 0.45;
    const MAX_SPEED = 4200;
    const sp = Math.hypot(vx0, vy0);
    let vx = (vx0 * Math.min(1, MAX_SPEED / sp)) | 0;
    let vy = (vy0 * Math.min(1, MAX_SPEED / sp)) | 0;
    let x = posX.get();
    let y = posY.get();
    const t0 = performance.now();
    let last = t0;
    let loudest = 0;
    if (moodRef.current !== "dizzy") setMood("falling");
    const squash = (axis, speed) => {
      if (speed < 260) return;
      const k = clamp(speed / 2400, 0.06, 0.3);
      loudest = Math.max(loudest, speed);
      if (axis === "x") {
        scaleX.set(1 - k);
        scaleY.set(1 + k * 0.6);
      } else {
        scaleY.set(1 - k);
        scaleX.set(1 + k * 0.6);
      }
      setTimeout(() => {
        scaleX.set(1);
        scaleY.set(1);
      }, 70);
    };
    const done = () => {
      cancelAnimationFrame(bounceRaf.current);
      if (moodRef.current === "falling") setMood("dizzy", 1600);
      if (loudest > 1800) fx("wobble");
      scheduleHome(2200);
    };
    const step = (now) => {
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      vy += GRAVITY * dt;
      const drag = Math.exp(-AIR * dt);
      vx *= drag;
      vy *= drag;
      x += vx * dt;
      y += vy * dt;
      const b = bounds();
      if (x < b.minX) {
        x = b.minX;
        if (vx < 0) {
          squash("x", -vx);
          vx = -vx * WALL;
        }
      } else if (x > b.maxX) {
        x = b.maxX;
        if (vx > 0) {
          squash("x", vx);
          vx = -vx * WALL;
        }
      }
      if (y < b.minY) {
        y = b.minY;
        if (vy < 0) {
          squash("y", -vy);
          vy = -vy * WALL;
        }
      } else if (y >= b.maxY) {
        y = b.maxY;
        if (vy > 0) {
          squash("y", vy);
          vy = vy * FLOOR < 170 ? 0 : -vy * FLOOR;
        }
      }
      const onFloor = y >= b.maxY - 0.5 && vy === 0;
      if (onFloor) vx *= Math.exp(-5 * dt);
      posX.set(x);
      posY.set(y);
      if ((onFloor && Math.abs(vx) < 30) || now - t0 > 8000) return done();
      bounceRaf.current = requestAnimationFrame(step);
    };
    bounceRaf.current = requestAnimationFrame(step);
  };

  const onPointerEnd = (e) => {
    const t = touch.current;
    if (!t || t.id !== e.pointerId) return;
    touch.current = null;
    clearTimeout(t.holdTimer);
    scaleX.set(1);
    scaleY.set(1);
    setDragging(false);
    if (!t.moved) {
      if (t.held) {
        setMood("happy", 1500);
        fx("hop");
        say("Phew! Thanks for putting me down gently.", 2800);
      } else tap();
      return;
    }
    const last = t.trail[t.trail.length - 1];
    const first = t.trail.find((s) => last.t - s.t < 90) ?? t.trail[0];
    const dt = Math.max(16, last.t - first.t) / 1000;
    const vx = (last.x - first.x) / dt;
    const vy = (last.y - first.y) / dt;
    const b = bounds();
    let bounced = false;
    if (moodRef.current === "dizzy") {
      posX.set(clamp(posX.get(), b.minX, b.maxX));
      posY.set(clamp(posY.get(), b.minY, b.maxY));
    } else {
      const speed = Math.hypot(vx, vy);
      if (!reduce && speed > BOUNCE_FROM) {
        bounced = true;
        throwIt(vx, vy);
      } else {
        setMood("happy", 2600);
        if (speed > 600) say("Wheee! Again, again!", 2200);
        const spring = { type: "inertia", power: 0.6, timeConstant: 320, bounceStiffness: 320, bounceDamping: 18 };
        moveCtl.current = [animate(posX, posX.get(), { ...spring, velocity: vx, min: b.minX, max: b.maxX }), animate(posY, posY.get(), { ...spring, velocity: vy, min: b.minY, max: b.maxY })];
      }
    }
    if (!bounced) scheduleHome(4200);
    scheduleRoamRef.current(12000);
  };

  // One tap reacts (a beat later, in case a second tap makes it a double-click); a double tap opens the menu;
  // five quick taps make it dizzy; a tap during the tour ends the tour.
  const tap = () => {
    const now = Date.now();
    taps.current = taps.current.filter((x) => now - x < 1600);
    taps.current.push(now);
    if (tourRef.current) return stopTourRef.current(true);
    if (taps.current.length >= 5) {
      taps.current = [];
      clearTimeout(tapTimer.current);
      closeMenu();
      return dizzy();
    }
    if (menuRef.current) {
      lastTap.current = 0;
      return closeMenu();
    }
    if (now - lastTap.current < 320) {
      clearTimeout(tapTimer.current);
      lastTap.current = 0;
      return openMenu();
    }
    lastTap.current = now;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(react, 300);
  };

  const sayFromMenu = (line, m = "happy", f = "hop") => {
    closeMenu();
    setMood(m, 1800);
    fx(f);
    say(line, readMs(line));
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      return menuRef.current ? closeMenu() : openMenu();
    }
    if (e.key === " ") {
      e.preventDefault();
      react();
    }
    if (e.key === "Escape") {
      closeMenu();
      stopTourRef.current(true);
    }
  };

  const hideGuide = () => {
    stopTourRef.current(false);
    closeMenu();
    setBubble(null);
    stopMove();
    setHidden(true);
  };
  const showGuide = () => {
    seen.current.clear();
    setHidden(false);
  };

  // ---- life: arriving, following the page, watching the cursor, blinking, sleeping

  useEffect(() => {
    if (hidden) return undefined;
    let arrived = false;
    let roamT;
    const opening = greeting(markVisit());

    // Exploring: while nobody is playing with it, it strolls to another empty part of the page, now and
    // then stopping beside a button or heading to say what it is.
    const roam = () => {
      if (touch.current || document.hidden || moodRef.current !== "idle" || menuRef.current || tourRef.current) return scheduleRoam(4000);
      const d = dimRef.current;
      const obs = obstacles(d);
      const here = { x: posX.get(), y: posY.get() };
      const stops = Math.random() < 0.6 ? shuffle(pointOuts(d)) : [];
      for (const p of stops) {
        const spot = spotBeside(p.rect, d, obs);
        if (!spot) continue;
        moveTo(spot.x, spot.y);
        setTimeout(() => {
          if (touch.current || moodRef.current !== "idle") return;
          lookX.set(clamp((p.rect.left + p.rect.width / 2 - (spot.x + d.w / 2)) / 120, -1, 1) * 12);
          lookY.set(clamp((p.rect.top + p.rect.height / 2 - (spot.y + d.h / 2)) / 120, -1, 1) * 8);
          if (!chat(p.line, 4600)) return;
          setMood("happy", 1400);
          fx("hop");
        }, 3400);
        return scheduleRoam();
      }
      const spots = sampleSpots(d, obs, 80).filter((s) => Math.hypot(s.x - here.x, s.y - here.y) > 180);
      if (spots.length) {
        const s = pickOne(spots);
        moveTo(s.x, s.y);
        if (Math.random() < 0.35) setTimeout(() => moodRef.current === "idle" && !touch.current && chat(pickOne(WANDER), 2600), 2600);
      }
      return scheduleRoam();
    };
    const scheduleRoam = (ms = 8000 + Math.random() * 5000) => {
      clearTimeout(roamT);
      if (reduce) return;
      roamT = setTimeout(roam, ms);
    };
    scheduleRoamRef.current = scheduleRoam;

    // After scrolling stops, step aside if the page has moved something under it.
    const relocateIfCovered = () => {
      if (touch.current || moodRef.current === "lifted") return;
      const d = dimRef.current;
      const obs = obstacles(d);
      const cx = posX.get();
      const cy = posY.get();
      if (isFree(cx, cy, d, obs)) return scheduleRoam();
      const spots = sampleSpots(d, obs, 90);
      if (!spots.length) return undefined;
      spots.sort((p, q) => Math.hypot(p.x - cx, p.y - cy) - Math.hypot(q.x - cx, q.y - cy));
      moveTo(spots[0].x, spots[0].y);
      return scheduleRoam();
    };

    // Tag: dash at it with the cursor and it scoots away, twice, then it lets you catch it.
    const tryDodge = (m) => {
      const now = Date.now();
      const dg = dodge.current;
      if (now < dg.until || now - dg.last < 1500) return;
      if (now - dg.first > 15000) {
        dg.count = 0;
        dg.first = now;
      }
      dg.last = now;
      if (dg.count >= 2) {
        dg.until = now + 25000;
        dg.count = 0;
        setMood("happy", 1800);
        fx("hop");
        say("Okay, okay, you got me!", 2600);
        return;
      }
      dg.count++;
      const d = dimRef.current;
      const obs = obstacles(d);
      const spots = sampleSpots(d, obs, 90)
        .filter((s) => Math.hypot(s.x + d.w / 2 - m.x, s.y + d.h / 2 - m.y) > 260)
        .sort((p, q) => Math.hypot(q.x - posX.get(), q.y - posY.get()) - Math.hypot(p.x - posX.get(), p.y - posY.get()));
      if (!spots.length) return;
      const s = pickOne(spots.slice(0, 5));
      moveTo(s.x, s.y, true);
      setMood("wink", 1500);
      say(dg.count === 1 ? "Can't catch me!" : "Hehe, too slow!", 1800);
      scheduleRoam();
    };

    const arrive = (key, first = false) => {
      if (!GUIDE[key]) return;
      sectionKey.current = key;
      arrived = true;
      const a = spotFor(key);
      if (first) {
        // walk in from the left edge
        posX.set(-dimRef.current.w - 60);
        posY.set(a.y);
      }
      clearTimeout(homeTimer.current);
      moveTo(a.x, a.y);
      scheduleRoam(first ? 11000 : undefined);
      bump();
      if (moodRef.current === "sleep") setMood("idle");
      if (!seen.current.has(key)) {
        seen.current.add(key);
        const line = first ? opening : GUIDE[key].line;
        setTimeout(
          () => {
            if (sectionKey.current !== key || touch.current || tourRef.current) return;
            setMood("happy", 1500);
            fx("hop");
            say(line, Math.max(4800, readMs(line)));
            if (key === "cta") confetti();
          },
          first ? 2600 : 2000
        );
      }
    };

    // Which section (or step of "how it works") is in the middle of the screen.
    const keyOf = () => {
      const mid = window.innerHeight * 0.55;
      let key = "hero";
      document.querySelectorAll("[data-guide-section]").forEach((el) => {
        if (el.getBoundingClientRect().top <= mid) key = el.dataset.guideSection;
      });
      if (key === "how") {
        document.querySelectorAll("[data-guide-step]").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top <= mid && r.bottom >= mid - 20) key = `step-${el.dataset.guideStep}`;
        });
      }
      return key;
    };

    let pending = keyOf();
    let settle = setTimeout(() => arrive(pending, true), 1600);
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (tourRef.current) return;
        pending = keyOf();
        clearTimeout(settle);
        clearTimeout(roamT);
        if (!sticky.current) {
          clearTimeout(bubbleTimer.current);
          setBubble(null);
        }
        settle = setTimeout(() => (!arrived || pending !== sectionKey.current ? arrive(pending, !arrived) : relocateIfCovered()), 1300);
        if (moodRef.current === "sleep") setMood("idle");
        bump();
      });
    };

    const onResize = () => {
      const d = measure();
      dimRef.current = d;
      setDim(d);
      stopMove();
      const a = spotFor(sectionKey.current);
      posX.set(a.x);
      posY.set(a.y);
    };

    // Petting: the cursor strokes back and forth over it without pressing. It blushes and sends hearts.
    const strokes = { dir: 0, flips: [], last: -1e9, line: -1e9 };
    const pet = (m, p, speed, now) => {
      const r = botEl.current?.getBoundingClientRect();
      if (!r) return;
      const inside = m.x > r.left + r.width * 0.1 && m.x < r.right - r.width * 0.1 && m.y > r.top && m.y < r.bottom - r.height * 0.06;
      if (!inside) {
        strokes.flips = [];
        strokes.dir = 0;
        return;
      }
      const dx = m.x - p.x;
      if (Math.abs(dx) < 1.5 || speed > 1400) return;
      const dir = Math.sign(dx);
      if (strokes.dir && dir !== strokes.dir) strokes.flips.push(now);
      strokes.dir = dir;
      strokes.flips = strokes.flips.filter((t) => now - t < 2500);
      if (strokes.flips.length < 4 || now - strokes.last < 3500 || touch.current || menuRef.current || tourRef.current) return;
      if (!["idle", "happy", "blush", "sleep", "yawn"].includes(moodRef.current)) return;
      strokes.flips = [];
      strokes.last = now;
      bump();
      setMood("blush", 2800);
      if (!reduce) animate(bodyRot, [0, -7, 7, -4, 0], { duration: 1.1, ease: "easeInOut" });
      burst("♥", PINK, 2);
      if (now - strokes.line > 12000) {
        strokes.line = now;
        say(pickOne(PET_LINES), 2400);
      }
    };

    // Eyes and lean follow the cursor.
    let mouse = null;
    let prev = null;
    let outsideAt = 0;
    let mRaf = 0;
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      mouse = { x: e.clientX, y: e.clientY };
      const now = performance.now();
      if (prev && now > prev.t) {
        const speed = (Math.hypot(mouse.x - prev.x, mouse.y - prev.y) / (now - prev.t)) * 1000;
        const d = dimRef.current;
        const dist = Math.hypot(mouse.x - (posX.get() + d.w / 2), mouse.y - (posY.get() + d.h / 2));
        if (dist > 140) outsideAt = now;
        if (dist < 85 && now - outsideAt < 250 && speed > 1000 && moodRef.current === "idle" && !touch.current && !menuRef.current && !tourRef.current) tryDodge(mouse);
        if (e.buttons === 0) pet(mouse, prev, speed, now);
      }
      prev = { x: mouse.x, y: mouse.y, t: now };
      if (mRaf) return;
      mRaf = requestAnimationFrame(() => {
        mRaf = 0;
        if (!mouse) return;
        const d = dimRef.current;
        const dx = mouse.x - (posX.get() + d.w / 2);
        const dy = mouse.y - (posY.get() + d.h * 0.45);
        lookX.set(clamp(dx / 260, -1, 1) * 12);
        lookY.set(clamp(dy / 260, -1, 1) * 8);
        if (!walkingNow()) lean.set(clamp(dx / 600, -1, 1) * 5);
      });
    };
    const walkingNow = () => moveCtl.current.length > 0;

    let blinkTimer;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => setBlink(false), 130);
          scheduleBlink();
        },
        2600 + Math.random() * 3200
      );
    };
    if (!reduce) scheduleBlink();

    // Gentle float while it stands.
    const bob = reduce ? undefined : animate(bobY, [0, -4, 0], { duration: 3.4, repeat: Infinity, ease: "easeInOut" });

    // ---- reacting to the page

    const busy = () => touch.current !== null || menuRef.current || tourRef.current;

    // A button into the app: perk up on hover (once in a while), wave when it is pressed.
    const appLink = (t) => (t instanceof Element ? t.closest('a[href^="/app"]') : null);
    const hovered = new Map();
    const onOver = (e) => {
      if (e.pointerType !== "mouse") return;
      const a = appLink(e.target);
      if (!a || a.closest("[data-guide-bot]") || moodRef.current !== "idle") return;
      const href = a.getAttribute("href") ?? "";
      if (Date.now() - (hovered.get(href) ?? 0) < 20000) return;
      if (!chat(pickOne(HOVER_LINES), 2600)) return;
      hovered.set(href, Date.now());
      setMood("wave", 1800);
      fx("hop");
    };
    const onDocDown = (e) => {
      const inBot = e.target instanceof Element && e.target.closest("[data-guide-bot]") !== null;
      if (menuRef.current && !inBot) closeMenu();
      if (inBot || !appLink(e.target)) return;
      setMood("wave", 2000);
      burst("👋", "#ffd27a", 1);
      say("See you inside!", 2000, true);
    };

    // FAQ: a nod for every question opened.
    let faqAt = 0;
    const onToggle = (e) => {
      const d = e.target;
      if (!(d instanceof HTMLDetailsElement) || !d.open || !d.closest(".faq")) return;
      if (busy() || Date.now() - faqAt < 4000) return;
      faqAt = Date.now();
      bump();
      setMood("happy", 1500);
      fx("nod");
      say(pickOne(FAQ_LINES), 2200);
    };

    // Back to the tab after a while: it missed you.
    let awayAt = 0;
    const onVisibility = () => {
      if (document.hidden) {
        awayAt = Date.now();
        return;
      }
      const away = awayAt ? Date.now() - awayAt : 0;
      awayAt = 0;
      if (away < 4000 || busy()) return;
      bump();
      setMood("happy", 2000);
      fx("jump");
      burst("♥", PINK, 2);
      say(pickOne(BACK_LINES), 2800);
    };

    // Idle: every so often it looks around, hums or stretches.
    let idleT;
    const idle = () => {
      idleT = setTimeout(idle, 9000 + Math.random() * 7000);
      if (reduce || document.hidden || moodRef.current !== "idle" || busy() || Date.now() - lastSaid.current < 4000) return;
      const act = pickOne(["look", "hum", "stretch"]);
      if (act === "look") {
        lookX.set(-12);
        setTimeout(() => lookX.set(12), 900);
        setTimeout(() => lookX.set(0), 1900);
      } else if (act === "hum") {
        fx("sway");
        for (const ms of [0, 700, 1400]) setTimeout(() => burst("♪", "#ef7a3a", 1), ms);
      } else {
        setMood("happy", 900);
        scaleY.set(1.12);
        scaleX.set(0.93);
        setTimeout(() => {
          scaleX.set(1);
          scaleY.set(1);
        }, 520);
      }
    };
    idleT = setTimeout(idle, 12000);

    // ---- the guided tour: it scrolls the page section by section and explains each one

    let tourT;
    let tourPoll;
    const SCROLL_KEYS = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
    const onTourInterrupt = (e) => {
      if (e instanceof KeyboardEvent && !SCROLL_KEYS.includes(e.key)) return;
      stopTour(true);
    };
    const endTour = () => {
      tourRef.current = false;
      clearTimeout(tourT);
      clearInterval(tourPoll);
      window.removeEventListener("wheel", onTourInterrupt);
      window.removeEventListener("touchmove", onTourInterrupt);
      window.removeEventListener("keydown", onTourInterrupt);
    };
    function stopTour(interrupted) {
      if (!tourRef.current) return;
      endTour();
      setTouring(false);
      scheduleRoam();
      if (interrupted) {
        setMood("happy", 1500);
        say("Okay, you drive! Double-click me if you want the tour again.", 3800, true);
      }
    }
    const tourStep = (i) => {
      if (!tourRef.current) return;
      if (i >= TOUR.length) return stopTour(false);
      const stop = TOUR[i];
      const el = document.querySelector(stop.target);
      if (!el) return tourStep(i + 1);
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: stop.beside ? "center" : "start" });
      // wait for the page to stop moving, walk to the stop, then talk
      let prevY = -1;
      let still = 0;
      clearInterval(tourPoll);
      tourPoll = setInterval(() => {
        const y = window.scrollY;
        still = y === prevY ? still + 1 : 0;
        prevY = y;
        if (still < 3) return;
        clearInterval(tourPoll);
        if (!tourRef.current) return;
        sectionKey.current = stop.key;
        const a = spotFor(stop.key);
        moveTo(a.x, a.y);
        const trip = reduce ? 200 : 600 + Math.min(4500, (Math.hypot(a.x - posX.get(), a.y - posY.get()) / 230) * 1000);
        tourT = setTimeout(() => {
          if (!tourRef.current) return;
          setMood("happy", 1500);
          fx("hop");
          say(`(${i + 1}/${TOUR.length}) ${stop.line}`, stop.ms);
          if (stop.key === "cta") confetti();
          tourT = setTimeout(() => tourStep(i + 1), stop.ms + 250);
        }, trip);
      }, 120);
    };
    startTourRef.current = () => {
      if (tourRef.current) return;
      tourRef.current = true;
      setTouring(true);
      closeMenu();
      clearTimeout(roamT);
      bump();
      window.addEventListener("wheel", onTourInterrupt, { passive: true });
      window.addEventListener("touchmove", onTourInterrupt, { passive: true });
      window.addEventListener("keydown", onTourInterrupt);
      setMood("happy", 1500);
      fx("jump");
      say("Let's go! I'll scroll for you.", 1700);
      tourT = setTimeout(() => tourStep(0), 1500);
    };
    stopTourRef.current = stopTour;

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerdown", onDocDown);
    document.addEventListener("toggle", onToggle, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearTimeout(settle);
      clearTimeout(roamT);
      clearTimeout(blinkTimer);
      clearTimeout(homeTimer.current);
      clearTimeout(sleepTimer.current);
      clearTimeout(bubbleTimer.current);
      clearTimeout(moodTimer.current);
      clearTimeout(idleT);
      clearTimeout(tapTimer.current);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(mRaf);
      bob?.stop();
      stopMove();
      endTour();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDocDown);
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [hidden, reduce, spotFor, moveTo, stopMove, bump, say, chat, fx, burst, confetti, setMood, closeMenu, posX, posY, bobY, bodyRot, scaleX, scaleY, lookX, lookY, lean]);

  // Dreams: a "z" drifts up every so often while it sleeps.
  useEffect(() => {
    if (mood !== "sleep") return undefined;
    const id = setInterval(() => burst("z", "#ef7a3a", 1), 1800);
    return () => clearInterval(id);
  }, [mood, burst]);

  if (hidden) {
    return (
      <button type="button" data-guide-bot onClick={showGuide} className="guide-show">
        ✦ Show Pocket
      </button>
    );
  }

  // With reduced motion Pocket keeps one calm pose (the speech bubble still works); in the air it looks excited.
  const shown = reduce ? "idle" : airborne && mood === "idle" ? "happy" : mood;
  return (
    <motion.div data-guide-bot className={`guide${menu ? " is-menu" : ""}`} style={{ x: posX, y: posY, width: dim.w, height: dim.h }}>
      <span className="sr" role="status" aria-live="polite">{bubble?.text ?? ""}</span>

      {bubble && (
        <motion.div
          key={bubble.key}
          aria-hidden="true"
          initial={{ opacity: 0, y: bubble.below ? -6 : 6, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          className={`guide-bubble${bubble.below ? " is-below" : ""}${bubble.right ? " is-right" : ""}`}
          style={{ maxWidth: bubble.maxW }}
        >
          {bubble.text}
          <span className="guide-tail" />
        </motion.div>
      )}

      {menu && (
        <motion.div
          data-guide-menu
          role="menu"
          aria-label="Pocket's menu"
          initial={{ opacity: 0, y: menu.below ? -6 : 6, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          onKeyDown={(e) => e.key === "Escape" && (closeMenu(), botEl.current?.focus())}
          className={`guide-menu${menu.below ? " is-below" : ""}${menu.right ? " is-right" : ""}`}
        >
          <MenuItem autoFocus label="Take the tour" hint="I'll scroll you through it" onClick={() => startTourRef.current()} />
          <MenuItem label="What is PocketLM?" hint="In one breath" onClick={() => sayFromMenu(ABOUT_LINE)} />
          <MenuItem label="What gets stamped?" hint="And what never does" onClick={() => sayFromMenu(STAMP_LINE, "wink", "tilt")} />
          <MenuItem label="Hide me" hint="Bring me back any time" onClick={hideGuide} />
        </motion.div>
      )}

      <motion.div className="guide-float" style={{ y: bobY }}>
        <motion.div
          ref={botEl}
          role="button"
          tabIndex={0}
          aria-label="Pocket, the PocketLM guide. Click to say hi, double-click or press Enter for the menu, drag to move."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onPointerEnter={(e) => e.pointerType === "mouse" && wake("Oh! I was just resting my eyes.")}
          onKeyDown={onKeyDown}
          className={`guide-body${dragging ? " is-dragging" : ""}`}
          style={{ y: bodyY, rotate, scaleX, scaleY, originX: 0.5, originY: 0.92 }}
        >
          <GuideBotArt mood={shown} blink={blink} walking={walking} lookX={lookX} lookY={lookY} />
          {sparks.map((s) => (
            <SparkView key={s.id} spark={s} onDone={dropSpark} />
          ))}
        </motion.div>
        <button type="button" onClick={hideGuide} onPointerDown={(e) => e.stopPropagation()} aria-label="Hide the guide" title="Hide the guide" className="guide-x">
          ×
        </button>
        {touring && (
          <button type="button" onClick={() => stopTourRef.current(true)} onPointerDown={(e) => e.stopPropagation()} className="guide-stop">
            Stop tour
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

function MenuItem({ label, hint, onClick, autoFocus }) {
  return (
    <button type="button" role="menuitem" autoFocus={autoFocus} onClick={onClick} className="guide-menu-item">
      <span>{label}</span>
      <small>{hint}</small>
    </button>
  );
}
