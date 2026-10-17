"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useAnimationControls, useMotionValue, useReducedMotion } from "framer-motion";
import { MascotIcon } from "@/components/MascotArt";

const NAV = [
  { id: "how", label: "How it works", href: "#how", icon: "flow" },
  { id: "privacy", label: "Privacy", href: "#privacy", icon: "shield" },
  { id: "faq", label: "FAQ", href: "#faq", icon: "question" },
];

const PILL_SPRING = { type: "spring", stiffness: 480, damping: 36, mass: 0.7 };

function Icon({ name }) {
  const common = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, className: "nav-ico" };
  if (name === "flow")
    return (
      <svg {...common}>
        <circle cx="2.6" cy="8" r="1.3" />
        <circle cx="8" cy="8" r="1.3" />
        <circle cx="13.4" cy="8" r="1.3" />
        <path d="M3.9 8H6.7M9.3 8H12.1" />
      </svg>
    );
  if (name === "shield")
    return (
      <svg {...common}>
        <path d="M8 1.8 3 3.6v4c0 3 2 5 5 6.6 3-1.6 5-3.6 5-6.6v-4L8 1.8Z" />
        <path d="m5.9 8 1.5 1.5L10.3 6.6" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M6.3 6.2a1.8 1.8 0 0 1 3.5.6c0 1.2-1.8 1.6-1.8 2.6M8 11.6h.01" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="nav-arrow">
      <path d="M3 6h6" />
      <path d="M6.5 3.5 9 6l-2.5 2.5" />
    </svg>
  );
}

/** The mascot mark: says hello once after load, every ~11 s, and when touched. */
function MascotLogo() {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const busy = useRef(false);

  const hop = async () => {
    if (reduce || busy.current) return;
    busy.current = true;
    await controls.start({ y: [0, -7, 0, -3, 0], rotate: [0, -8, 7, -3, 0], scale: [1, 1.1, 1, 1.04, 1], transition: { duration: 0.9, ease: "easeOut" } });
    busy.current = false;
  };

  useEffect(() => {
    if (reduce) return;
    const first = setTimeout(hop, 1600);
    const again = setInterval(hop, 11000);
    return () => {
      clearTimeout(first);
      clearInterval(again);
    };
    // hop only touches refs and stable controls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <motion.span animate={controls} onHoverStart={hop} onTapStart={hop} className="nav-mark">
      <MascotIcon size={30} idp="nvm" />
    </motion.span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState(null);

  // One pill for all links, always mounted: it slides between links, grows in when a section
  // becomes active and shrinks out in place when none is (back on the hero).
  const linkRefs = useRef({});
  const pillX = useMotionValue(0);
  const pillWidth = useMotionValue(0);
  const pillVisible = scrolled && activeId !== null;
  const wasPillVisible = useRef(false);

  useLayoutEffect(() => {
    const link = activeId ? linkRefs.current[activeId] : null;
    if (link) {
      if (wasPillVisible.current && pillVisible) {
        animate(pillX, link.offsetLeft, PILL_SPRING);
        animate(pillWidth, link.offsetWidth, PILL_SPRING);
      } else {
        pillX.set(link.offsetLeft);
        pillWidth.set(link.offsetWidth);
      }
    }
    wasPillVisible.current = pillVisible;
  }, [activeId, pillVisible, pillX, pillWidth]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      let current = null;
      for (const item of NAV) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top - 140 <= 0) current = item.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className={`nav-wrap${scrolled ? " is-scrolled" : ""}`}>
      <nav className="nav-bar" aria-label="Main">
        <Link href="/" className="nav-brand">
          <MascotLogo />
          <span>pocketLM</span>
        </Link>

        <div className="nav-links">
          <motion.span
            aria-hidden="true"
            className="nav-pill"
            style={{ x: pillX, width: pillWidth }}
            initial={false}
            animate={pillVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={PILL_SPRING}
          />
          {NAV.map((item) => {
            const active = activeId === item.id;
            return (
              <a
                key={item.id}
                ref={(el) => {
                  linkRefs.current[item.id] = el;
                }}
                href={item.href}
                onClick={(e) => go(e, item.id)}
                aria-current={active ? "true" : undefined}
                className={`nav-link${active ? " is-active" : ""}`}
              >
                <Icon name={item.icon} />
                {item.label}
              </a>
            );
          })}
        </div>

        <Link href="/app" className="nav-cta">
          Open my notebook
          <span className="nav-chip">
            <ArrowIcon />
          </span>
        </Link>
      </nav>
    </div>
  );
}
