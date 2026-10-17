// Hero background: a golden-hour university library drawn entirely in SVG, with real motion.
// People write, nod and type, the PocketLM mascots breathe, blink and hop, a student climbs
// the ladder, another walks the aisle, leaves sway and papers drift through the sunbeams.
//
// One 10 s loop tells the PocketLM story: everyone studies, the mascots help, then the
// notebooks get stamped ("stamped ✓") and the mascots jump for joy.
//
// Drawn on a 1600x900 canvas. Motion is CSS only (transform/opacity) and switches off under
// prefers-reduced-motion. The upper centre is kept calm so the headline can sit on it.

import { MascotDefs } from "@/components/MascotArt";
import { Skyline, Frames, Vines } from "@/components/hero/Backdrop";
import { Mascot, Boy, Girl, BackPerson, LadderBoy, Walker } from "@/components/hero/Characters";

function Notebook({ x, y, s = 1, stamp = true, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="52" rx="196" ry="14" fill="rgba(60,30,8,0.28)" />
      <polygon points="-172,-34 172,-34 186,46 -186,46" fill="#a8683a" stroke="#4a2a12" strokeWidth="3" strokeLinejoin="round" />
      <polygon points="-164,-27 -6,-22 -6,36 -170,32" fill="#fffaf0" />
      <polygon points="6,-22 164,-27 170,32 6,36" fill="#fff6e4" />
      <path d="M-148 -12 L-24 -9 M-150 0 L-24 3 M-152 12 L-24 15 M-154 24 L-24 27 M24 -9 L146 -12 M24 3 L148 0" stroke="#d8c3a2" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M-120 -4 q10 -8 20 0 t20 0 t20 0" stroke="#7a5a34" strokeWidth="2" fill="none" opacity="0.6" />
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cx="0" cy={-18 + i * 6.4} rx="6" ry="2.4" fill="none" stroke="#8a8f98" strokeWidth="2" />
      ))}
      {/* stamp emblem on the right page */}
      <g transform="translate(88 6)">
        <ellipse rx="28" ry="12" fill="none" stroke="#ef7a3a" strokeWidth="3.4" />
        <ellipse rx="19" ry="8" fill="none" stroke="#ef7a3a" strokeWidth="1.6" opacity="0.7" />
        <path d="M-9 0 l6 4 l12 -9" stroke="#ef7a3a" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {stamp && (
          <g>
            <ellipse className="st-glow" rx="46" ry="20" fill="url(#stampglow)" style={{ transformOrigin: "0px 0px", animationDelay: `${delay}s` }} />
            <ellipse className="st-ring" rx="30" ry="13" fill="none" stroke="#ef7a3a" strokeWidth="4" style={{ transformOrigin: "0px 0px", animationDelay: `${delay}s` }} />
            <text className="st-text" x="0" y="-34" textAnchor="middle" style={{ animationDelay: `${delay}s` }}>stamped ✓</text>
          </g>
        )}
      </g>
    </g>
  );
}

function Laptop({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-50" y="-60" width="100" height="62" rx="5" fill="#34343c" />
      <rect x="-54" y="-2" width="108" height="8" rx="3" fill="#25252b" />
    </g>
  );
}

const PAPERS = [
  [560, 640, 34, -18, 20, 0, 60],
  [760, 560, 28, 24, 24, 6, -50],
  [980, 700, 32, -8, 22, 11, 56],
  [1100, 500, 26, 30, 26, 3, -64],
  [430, 700, 24, -26, 25, 14, 46],
  [1210, 620, 30, 14, 23, 8, -48],
  [650, 760, 28, -12, 21, 17, 40],
];

const MOTES = Array.from({ length: 34 }, (_, i) => [(i * 137.5) % 1600, 120 + ((i * 53) % 560), 1.6 + ((i * 7) % 4), (i * 0.43) % 6, 5 + ((i * 3) % 5)]);

export default function HeroScene() {
  return (
    <svg className="scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <MascotDefs idp="hm" />
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff8ea" />
          <stop offset="0.5" stopColor="#ffe9c4" />
          <stop offset="1" stopColor="#ffd39b" />
        </linearGradient>
        <radialGradient id="sunglow">
          <stop offset="0" stopColor="#fffdf3" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#fff0c8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff0c8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6e2" stopOpacity="0" />
          <stop offset="0.6" stopColor="#fff2d6" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff2d6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0b668" />
          <stop offset="0.5" stopColor="#d58a3e" />
          <stop offset="1" stopColor="#a8622a" />
        </linearGradient>
        <linearGradient id="woodBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9a05c" />
          <stop offset="1" stopColor="#b97a3c" />
        </linearGradient>
        <linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe8" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff3cf" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="stampglow">
          <stop offset="0" stopColor="#ffc060" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lampglow">
          <stop offset="0" stopColor="#ffd890" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd890" stopOpacity="0" />
        </radialGradient>
        <filter id="blurBack" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.7" /></filter>
        <filter id="blurFront" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
        <clipPath id="clipBoy"><rect x="-320" y="-520" width="640" height="512" /></clipPath>
        <clipPath id="clipGirl"><rect x="-320" y="-520" width="640" height="512" /></clipPath>
      </defs>

      {/* ---------- far: sky, city, trees, shelves, window ---------- */}
      <Skyline />
      <Frames />
      <Vines />
      <g transform="translate(318 560) scale(0.62)">
        <LadderBoy />
      </g>
      <rect y="300" width="1600" height="330" fill="url(#haze)" opacity="0.55" />

      {/* ---------- middle: back tables, students, lamp, walker (softly blurred) ---------- */}
      <g filter="url(#blurBack)">
        <polygon points="470,598 930,598 962,648 440,648" fill="url(#woodBack)" />
        <rect x="440" y="648" width="522" height="50" fill="#9c6330" />
        <polygon points="1010,598 1340,598 1366,648 990,648" fill="url(#woodBack)" />
        <rect x="990" y="648" width="376" height="50" fill="#9c6330" />

        <BackPerson x={570} y={606} s={0.62} hoodie="#a89a8c" hair="#3b2418" skin="#e9b994" delay={0.2} />
        <BackPerson x={718} y={606} s={0.62} hoodie="#8e7f74" hair="#6b3f26" skin="#d9a07a" delay={1.4} bun />
        <BackPerson x={862} y={608} s={0.64} hoodie="#c9b79e" hair="#2b1b12" skin="#e9b994" delay={0.7} headphones />
        <BackPerson x={1090} y={606} s={0.62} hoodie="#b7a99a" hair="#4a2c1b" skin="#f0c29c" delay={2.1} />
        <BackPerson x={1240} y={606} s={0.62} hoodie="#9b8a7a" hair="#2b1b12" skin="#d9a07a" delay={1.1} />
        <BackPerson x={1440} y={640} s={0.78} hoodie="#8f8478" hair="#2b1b12" skin="#e9b994" delay={1.8} laptop={false} />

        <Mascot x={636} y={632} s={0.2} delay={0.5} />
        <Mascot x={950} y={632} s={0.21} delay={0.1} flip />
        <Mascot x={1170} y={632} s={0.2} delay={0.8} />

        {/* desk lamp */}
        <circle cx="1002" cy="560" r="80" fill="url(#lampglow)" className="lamp-glow" />
        <rect x="998" y="570" width="6" height="30" fill="#6b4a2b" />
        <path d="M980 572 q22 -34 44 0z" fill="#f2a24a" stroke="#6b4a2b" strokeWidth="2.5" />
        <ellipse cx="1002" cy="600" rx="18" ry="4" fill="#4a2f1a" />

        {/* a student strolling down the aisle */}
        <g transform="translate(520 720) scale(0.5)">
          <Walker delay={0} />
        </g>
      </g>

      {/* ---------- sunbeams across the room ---------- */}
      <g className="shafts">
        <polygon className="shaft shaft-a" points="1190,0 1380,0 760,900 420,900" fill="url(#shaft)" />
        <polygon className="shaft shaft-b" points="1390,0 1520,0 1020,900 800,900" fill="url(#shaft)" />
      </g>

      {/* ---------- near: foreground table, students, notebooks, mascots ---------- */}
      <polygon points="0,792 1600,792 1600,900 0,900" fill="url(#wood)" />
      <rect x="0" y="792" width="1600" height="5" fill="#f9d291" />
      <g className="streaks" opacity="0.5">
        <polygon points="120,800 420,800 330,900 -40,900" fill="#fff6dc" />
        <polygon points="700,800 980,800 940,900 600,900" fill="#fff6dc" />
        <polygon points="1180,800 1440,800 1500,900 1170,900" fill="#fff6dc" />
      </g>

      <Notebook x={300} y={830} s={1} delay={0.2} />
      <Notebook x={1290} y={836} s={1.04} delay={0.35} />

      {/* people: the body is clipped at the table edge, the writing arm sits on top */}
      <g transform="translate(260 800)">
        <g clipPath="url(#clipBoy)"><Boy part="body" /></g>
        <Boy part="arm" />
      </g>
      <g transform="translate(1330 806)">
        <g clipPath="url(#clipGirl)"><Girl part="body" /></g>
        <Girl part="arm" />
      </g>

      {/* the helpers */}
      <Mascot x={470} y={830} s={0.64} delay={0} />
      <Mascot x={1520} y={836} s={0.58} delay={0.3} flip />

      {/* desk clutter */}
      <g>
        <rect x="620" y="776" width="46" height="56" rx="7" fill="#8a5a2c" stroke="#4a2a12" strokeWidth="2.5" />
        <path d="M630 776 l-10 -34 M640 776 l2 -40 M650 776 l12 -36 M658 776 l22 -26" stroke="#2f5d8a" strokeWidth="5" strokeLinecap="round" />
        <path d="M640 776 l2 -40" stroke="#c0392b" strokeWidth="5" strokeLinecap="round" />
        <rect x="704" y="808" width="120" height="16" rx="3" fill="#3d5a73" />
        <rect x="712" y="794" width="104" height="15" rx="3" fill="#b0452a" />
        <rect x="720" y="780" width="92" height="14" rx="3" fill="#e3c28a" />
        <rect x="1010" y="820" width="130" height="16" rx="3" fill="#6e7f48" />
        <rect x="1018" y="806" width="112" height="15" rx="3" fill="#d98a3a" />
      </g>

      {/* out-of-focus foreground: lamp shade and leaves */}
      <g filter="url(#blurFront)" opacity="0.92">
        <ellipse cx="30" cy="690" rx="190" ry="46" fill="#f0a43a" />
        <rect x="26" y="700" width="14" height="120" fill="#8a5a2c" />
        <ellipse className="leaf-sway" cx="90" cy="880" rx="150" ry="46" fill="#4f6b2c" transform="rotate(-18 90 880)" />
        <ellipse className="leaf-sway leaf-b" cx="240" cy="900" rx="130" ry="38" fill="#6b8a3a" transform="rotate(12 240 900)" />
        <ellipse className="leaf-sway" cx="1540" cy="896" rx="140" ry="40" fill="#5b7a30" transform="rotate(16 1540 896)" />
      </g>

      {/* ---------- light and life on top ---------- */}
      <ellipse className="sunpulse" cx="1280" cy="140" rx="520" ry="320" fill="url(#sunglow)" style={{ mixBlendMode: "screen" }} />
      {PAPERS.map(([x, y, w, rot, dur, delay, drift], i) => (
        <g key={i} className="float" style={{ animationDuration: `${dur}s`, animationDelay: `-${delay}s`, "--dx": `${drift}px` }}>
          <g transform={`translate(${x} ${y}) rotate(${rot})`}>
            <rect x={-w / 2} y={-w * 0.65} width={w} height={w * 1.3} rx="2.5" fill="#fffdf6" stroke="#d9c7a8" strokeWidth="1.5" />
            <path d={`M${-w / 2 + 5} ${-w * 0.3} h${w - 10} M${-w / 2 + 5} 0 h${w - 14} M${-w / 2 + 5} ${w * 0.3} h${w - 10}`} stroke="#d9c7a8" strokeWidth="1.6" />
            {i % 3 === 0 && <circle cx={w * 0.18} cy={w * 0.3} r="4" fill="none" stroke="#ef7a3a" strokeWidth="2" />}
          </g>
        </g>
      ))}
      {MOTES.map(([x, y, r, d, dur], i) => (
        <circle key={i} className="mote" cx={x} cy={y} r={r} fill="#fff8de" style={{ animationDelay: `${d}s`, animationDuration: `${dur}s` }} />
      ))}
    </svg>
  );
}
