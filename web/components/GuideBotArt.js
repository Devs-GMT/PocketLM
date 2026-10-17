"use client";
import { motion } from "framer-motion";
import { MascotArt, MascotDefs } from "@/components/MascotArt";

// Pocket, the guide: the official mascot art with mood-specific eyes and mouths drawn over
// the named parts. Limbs, leaf and body are animated by .guide-* classes in globals.css.
const EYE = "#2E241E";
const MOUTH = "#4B2B20";
const PINK = "#FF6F8F";
const HEART = "M0 15 C-16 3 -20 -9 -12 -16 C-6 -21 0 -18 0 -12 C0 -18 6 -21 12 -16 C20 -9 16 3 0 15 Z";
const SPIRAL = "M0 0 a3 3 0 0 1 6 0 a7 7 0 0 1 -14 0 a11 11 0 0 1 22 0 a15 15 0 0 1 -30 0";
const EYES_X = [148, 212];

function Normal({ rx = 12, ry = 17, xs = EYES_X }) {
  return xs.map((cx) => (
    <g key={cx} className="guide-eye" style={{ transformOrigin: `${cx}px 172px` }}>
      <ellipse cx={cx} cy="172" rx={rx} ry={ry} fill={EYE} />
      <circle cx={cx + 4} cy={172 - ry * 0.47} r="4.6" fill="#fff" />
      <circle cx={cx - 4} cy={172 + ry * 0.47} r="2.2" fill="#fff" opacity=".85" />
    </g>
  ));
}

const arc = (cx, up = true) => <path key={cx} d={`M${cx - 16} 178 Q${cx} ${up ? 150 : 200} ${cx + 16} 178`} stroke={EYE} strokeWidth="7" strokeLinecap="round" fill="none" />;

function eyesFor(mood) {
  switch (mood) {
    case "happy":
    case "blush":
    case "wave":
      return EYES_X.map((cx) => arc(cx));
    case "love":
      return EYES_X.map((cx) => <path key={cx} d={HEART} transform={`translate(${cx} 170) scale(1.15)`} fill={PINK} />);
    case "wink":
      return (
        <>
          <Normal xs={[148]} />
          {arc(212)}
        </>
      );
    case "surprised":
    case "lifted":
      return <Normal rx={14} ry={22} />;
    case "falling":
      return <Normal rx={15} ry={25} />;
    case "dizzy":
      return EYES_X.map((cx) => (
        <g key={cx} transform={`translate(${cx} 172)`}>
          <path d={SPIRAL} stroke={EYE} strokeWidth="4" strokeLinecap="round" fill="none" className="guide-spin" />
        </g>
      ));
    case "sad":
      return (
        <>
          <Normal rx={11} ry={15} />
          <path d="M128 146 L166 156 M232 146 L194 156" stroke={EYE} strokeWidth="6" strokeLinecap="round" />
        </>
      );
    case "yawn":
      return (
        <>
          <path d="M132 160 L162 172 L132 184" stroke={EYE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M228 160 L198 172 L228 184" stroke={EYE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case "sleep":
      return EYES_X.map((cx) => arc(cx, false));
    default:
      return <Normal />;
  }
}

function mouthFor(mood) {
  switch (mood) {
    case "happy":
    case "wave":
      return (
        <g>
          <path d="M160 204 C168 236 192 236 200 204Z" fill={MOUTH} stroke={MOUTH} strokeWidth="3" strokeLinejoin="round" />
          <path d="M168 222 C174 229 186 229 192 222 C188 217 172 217 168 222Z" fill="#E8684F" />
        </g>
      );
    case "surprised":
    case "lifted":
      return <ellipse cx="180" cy="216" rx="8" ry="11" fill={MOUTH} />;
    case "falling":
      return <path d="M157 202 Q180 252 203 202Z" fill={MOUTH} stroke={MOUTH} strokeWidth="3" strokeLinejoin="round" />;
    case "dizzy":
      return <path d="M156 216 q6 -9 12 0 t12 0 t12 0 t12 0" stroke={MOUTH} strokeWidth="3.4" strokeLinecap="round" fill="none" />;
    case "sad":
      return <path d="M162 222 Q180 204 198 222" stroke={MOUTH} strokeWidth="3.4" strokeLinecap="round" fill="none" />;
    case "yawn":
      return <ellipse cx="180" cy="220" rx="12" ry="17" fill={MOUTH} />;
    case "sleep":
      return <path d="M170 214 Q180 221 190 214" stroke={MOUTH} strokeWidth="3" strokeLinecap="round" fill="none" />;
    case "wink":
      return <path d="M162 210 C172 224 192 222 200 204" stroke={MOUTH} strokeWidth="3.4" strokeLinecap="round" fill="none" />;
    default:
      return undefined; // the official smile
  }
}

export default function GuideBotArt({ mood, blink, walking, lookX, lookY, className = "" }) {
  const eyes = (
    <motion.g style={{ x: lookX, y: lookY }}>{eyesFor(mood)}</motion.g>
  );
  const mouth = mouthFor(mood);
  return (
    <svg
      className={`guide-art mood-${mood}${blink ? " is-blink" : ""}${walking ? " is-walking" : ""} ${className}`}
      viewBox="0 0 360 400"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <MascotDefs idp="gb" />
      <g className="guide-bob" style={{ transformOrigin: "180px 360px" }}>
        <MascotArt
          idp="gb"
          cls={{ leaf: "guide-leaf", armL: "guide-armL", armR: "guide-armR", legL: "guide-legL", legR: "guide-legR", body: "guide-body" }}
          eyes={eyes}
          mouth={mouth ? <g>{mouth}</g> : undefined}
          cheeks={mood === "blush" || mood === "love" ? 0.9 : 0.5}
        >
          {mood === "sad" && <path d="M244 150 q8 16 0 22 q-8 -6 0 -22Z" fill="#9fd4ff" stroke="#5aa6e0" strokeWidth="2" />}
        </MascotArt>
      </g>
    </svg>
  );
}
