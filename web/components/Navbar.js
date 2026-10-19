"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useAnimationControls, useMotionValue, useReducedMotion } from "framer-motion";
import { FaceIcon } from "@/components/MascotArt";

const NAV = [
  { id: "how", label: "How it works", href: "#how", icon: "flow" },
  { id: "features", label: "Features", href: "#features", icon: "spark" },
  { id: "privacy", label: "Privacy", href: "#privacy", icon: "shield" },
  { id: "who", label: "Who it's for", href: "#who", icon: "people" },
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
  if (name === "spark")
    return (
      <svg {...common}>
        <path d="M8 1.8 9.4 6.6 14.2 8 9.4 9.4 8 14.2 6.6 9.4 1.8 8 6.6 6.6Z" />
      </svg>
    );
  if (name === "people")
    return (
      <svg {...common}>
        <circle cx="6" cy="5.6" r="2.2" />
        <path d="M1.8 13c.3-2.3 2-3.6 4.2-3.6s3.9 1.3 4.2 3.6" />
        <circle cx="11.4" cy="6.4" r="1.7" />
        <path d="M11.2 9.6c1.7.1 3 1.1 3.2 3" />
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
      <FaceIcon size={30} idp="nvm" />
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
      // past the end of the last linked section (final call to action, footer): no link is "current"
      const last = document.getElementById(NAV[NAV.length - 1].id);
      if (current === NAV[NAV.length - 1].id && last && last.getBoundingClientRect().bottom - 140 <= 0) current = null;
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
          <span>PocketLM</span>
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
