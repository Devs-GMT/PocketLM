"use client";
import { useEffect, useRef, useState } from "react";

// Hero background as a looping video (about 1 MB: VP9 webm for most browsers, H.264 mp4 for Safari).
// The animated SVG scene (HeroScene) is kept as an alternative: set NEXT_PUBLIC_HERO_BG=scene to use it.
// With reduced motion, or while the video loads, the poster frame is shown instead.
//
// The loop is a crossfade: two copies of the clip are stacked; shortly before the playing one ends, the
// other starts from the beginning and fades in, so the restart is never a hard cut.
const FADE = 1.1; // seconds

function Clip({ vref, first }) {
  return (
    <video ref={vref} className={first ? "is-on" : ""} muted playsInline preload="auto" poster={first ? "/hero-poster.jpg" : undefined} disablePictureInPicture>
      <source src="/hero.webm" type="video/webm" />
      <source src="/hero.mp4" type="video/mp4" />
    </video>
  );
}

export default function HeroVideo() {
  const [still, setStill] = useState(false);
  const a = useRef(null);
  const b = useRef(null);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (still) return undefined;
    const clips = [a.current, b.current];
    if (!clips[0] || !clips[1]) return undefined;
    let cur = 0;
    let raf = 0;
    let swapping = false;

    clips[0].play().catch(() => {});

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = clips[cur];
      if (swapping || !v.duration || v.paused) return;
      if (v.duration - v.currentTime <= FADE) {
        swapping = true;
        const next = clips[1 - cur];
        next.currentTime = 0;
        next.play().then(() => {
          next.classList.add("is-on");
          const old = v;
          cur = 1 - cur;
          setTimeout(() => {
            old.classList.remove("is-on");
            old.pause();
            swapping = false;
          }, FADE * 1000 + 100);
        }).catch(() => { swapping = false; });
      }
    };
    raf = requestAnimationFrame(tick);

    const onVis = () => {
      if (document.hidden) clips[cur].pause();
      else clips[cur].play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [still]);

  return (
    <div className="hero-video" aria-hidden="true">
      {still ? (
        <img src="/hero-poster.jpg" alt="" />
      ) : (
        <>
          <Clip vref={a} first />
          <Clip vref={b} />
        </>
      )}
    </div>
  );
}
