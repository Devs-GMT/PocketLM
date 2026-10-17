// Animated hero background: a cosy library in the late afternoon.
// Pure SVG + CSS (no video, no JS): light enough for phones, and every motion
// switches off under prefers-reduced-motion. Drawn on a 1600x900 canvas; the
// upper centre is kept calm so the headline can sit on top of it.

const INK = "#2a1d10";
const ORANGE = "#ef7a3a";
const KRAFT = "#b98a5e";
const BOOKS = ["#b98a5e", "#ef7a3a", "#8b5e3c", "#e9c9a0", "#8fa58a", "#d9631f", "#6f8aa8", "#c9965f", "#f4b183"];

function Shelf({ x, y, w, h, seed }) {
  const rows = 5;
  const rowH = h / rows;
  const out = [];
  for (let r = 0; r < rows; r++) {
    const base = y + (r + 1) * rowH;
    let cx = x + 10;
    let i = 0;
    while (cx < x + w - 18) {
      const bw = 9 + ((i * 7 + seed + r * 3) % 9);
      const bh = rowH * (0.55 + (((i * 5 + seed + r) % 4) * 0.1));
      out.push(<rect key={`${r}-${i}`} x={cx} y={base - bh} width={bw} height={bh} rx="1.5" fill={BOOKS[(i * 3 + seed + r) % BOOKS.length]} />);
      cx += bw + 1.5;
      i++;
    }
    out.push(<rect key={`p${r}`} x={x} y={base} width={w} height="7" fill="#9c7249" />);
  }
  return (
    <g>
      <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx="8" fill="#c9965f" />
      <rect x={x} y={y} width={w} height={h} fill="#e8cfae" />
      {out}
    </g>
  );
}

function Win({ x, y, w, h }) {
  const r = w / 2;
  const d = `M${x} ${y + h} V${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h} Z`;
  return (
    <g>
      <path d={d} fill="url(#glass)" stroke={KRAFT} strokeWidth="9" strokeLinejoin="round" />
      <path d={`M${x + r} ${y} V${y + h} M${x} ${y + h * 0.5} H${x + w}`} stroke={KRAFT} strokeWidth="5" />
      <rect x={x - 12} y={y + h} width={w + 24} height="12" rx="4" fill="#c9965f" />
    </g>
  );
}

function Lamp({ x, len, delay }) {
  return (
    <g className="sway" style={{ transformOrigin: `${x}px 0px`, animationDelay: `${delay}s` }}>
      <line x1={x} y1="-60" x2={x} y2={len} stroke={INK} strokeWidth="3" />
      <circle cx={x} cy={len + 34} r="86" fill="url(#lampglow)" className="glow" style={{ animationDelay: `${delay}s` }} />
      <path d={`M${x - 14} ${len} h28 l22 36 h-72 z`} fill="#f2a76b" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx={x} cy={len + 38} rx="26" ry="5" fill="#fff0c9" />
    </g>
  );
}

function Student({ x, ty, s, skin, hair, shirt, long, delay }) {
  return (
    <g transform={`translate(${x} ${ty}) scale(${s})`}>
      <rect x="-37" y="-84" width="74" height="112" rx="30" fill={shirt} />
      <g className="nod" style={{ animationDelay: `${delay}s` }}>
        {long && <rect x="-30" y="-122" width="60" height="62" rx="24" fill={hair} />}
        <circle cx="0" cy="-112" r="26" fill={skin} />
        <path d="M-28 -112 A28 28 0 0 1 28 -112 Q10 -126 -6 -120 Q-20 -118 -28 -104 Z" fill={hair} />
        <circle cx="-9" cy="-107" r="2.5" fill={INK} />
        <circle cx="9" cy="-107" r="2.5" fill={INK} />
        <path d="M-6 -97 q6 5 12 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

function Notebook({ cx, ty, s = 1, glow = true, press = false, delay = 0 }) {
  return (
    <g transform={`translate(${cx} ${ty}) scale(${s})`}>
      <polygon points="-106,4 106,4 112,48 -112,48" fill={KRAFT} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="-96,10 -4,14 -4,42 -100,38" fill="#fffdf9" stroke={INK} strokeWidth="1.5" />
      <polygon points="4,14 96,10 100,38 4,42" fill="#fffdf9" stroke={INK} strokeWidth="1.5" />
      <path d="M-86 20 L-14 23 M-88 28 L-14 31 M-90 35 L-14 37 M14 23 L84 20 M14 31 L86 28" stroke="#d9c7b0" strokeWidth="2" strokeLinecap="round" />
      <g transform="translate(52 27)">
        <ellipse rx="19" ry="8.5" fill="none" stroke={ORANGE} strokeWidth="3" className={press ? "press-ring" : glow ? "stamp-glow" : undefined} style={{ animationDelay: `${delay}s` }} />
        <path d="M-7 0 l5 3 l9 -7" stroke={ORANGE} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" className={press ? "press-ring" : glow ? "stamp-glow" : undefined} style={{ animationDelay: `${delay}s` }} />
      </g>
    </g>
  );
}

function Robot({ x, ty, s = 1, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${ty}) scale(${s})`}>
      <ellipse cx="0" cy="30" rx="26" ry="6" fill="rgba(42,29,16,0.2)" />
      <g className="bob" style={{ animationDelay: `${delay}s` }}>
        <line x1="0" y1="-36" x2="0" y2="-50" stroke={INK} strokeWidth="2.5" />
        <circle cx="0" cy="-53" r="5" fill={ORANGE} stroke={INK} strokeWidth="2" />
        <rect x="-24" y="-36" width="48" height="62" rx="11" fill={KRAFT} stroke={INK} strokeWidth="2.5" />
        <rect x="-24" y="-36" width="9" height="62" rx="4" fill="#9c7249" />
        <rect x="-12" y="-28" width="30" height="26" rx="7" fill="#fff4e6" stroke={INK} strokeWidth="1.8" />
        <circle cx="-3" cy="-17" r="3.2" fill={INK} />
        <circle cx="10" cy="-17" r="3.2" fill={INK} />
        <path d="M-1 -9 q5 4 10 0" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="-14" y="10" width="34" height="5" rx="2.5" fill="#fff4e6" opacity="0.7" />
        <rect x="-14" y="26" width="10" height="6" rx="3" fill={INK} />
        <rect x="10" y="26" width="10" height="6" rx="3" fill={INK} />
      </g>
    </g>
  );
}

function Table({ y, x = 0, w = 1600, bottom = 900, opacity = 1 }) {
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height="46" fill="#d9b287" />
      <rect x={x} y={y} width={w} height="4" fill="#ecc99b" />
      <rect x={x} y={y + 46} width={w} height={bottom - y - 46} fill="#a9784a" />
      <rect x={x} y={y + 46} width={w} height="8" fill="#8e6038" />
    </g>
  );
}

const NOTES = [
  [420, 760, 14, 18, 0, -24], [610, 700, 18, 16, 3, 30], [820, 650, 20, 20, 6, -10], [1010, 720, 16, 17, 2, 22],
  [1220, 690, 19, 19, 8, -32], [120, 640, 17, 18, 5, 18], [1500, 660, 18, 16, 1, -18], [700, 820, 15, 21, 9, 26],
];

const DUST = Array.from({ length: 26 }, (_, i) => [
  (i * 173) % 1600,
  260 + ((i * 97) % 520),
  1.4 + ((i * 3) % 3),
  (i * 0.37) % 4,
]);

export default function HeroScene() {
  return (
    <svg className="scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3e2" />
          <stop offset="1" stopColor="#f6dcba" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#ffe2ad" />
        </linearGradient>
        <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lampglow">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dcba" stopOpacity="0" />
          <stop offset="1" stopColor="#f6dcba" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* back wall and floor */}
      <rect width="1600" height="900" fill="url(#wall)" />
      <rect y="600" width="1600" height="300" fill="#e5c195" />

      {/* shelves and windows */}
      <Shelf x={24} y={250} w={170} h={340} seed={2} />
      <Shelf x={1406} y={250} w={170} h={340} seed={5} />
      <Win x={250} y={270} w={150} h={300} />
      <Win x={1200} y={270} w={150} h={300} />
      <polygon className="ray" points="262,330 396,330 800,900 520,900" fill="url(#ray)" />
      <polygon className="ray ray2" points="1204,330 1338,330 1080,900 800,900" fill="url(#ray)" />

      {/* hanging lamps */}
      <Lamp x={560} len={300} delay={0} />
      <Lamp x={1040} len={300} delay={1.6} />

      {/* back row of students (smaller, hazier) */}
      <g>
        <Student x={300} ty={590} s={0.6} skin="#f2c9a5" hair="#5a3a22" shirt="#fff4e6" delay={0.4} />
        <Student x={470} ty={590} s={0.6} skin="#a9714b" hair={INK} shirt="#8fa58a" long delay={1.2} />
        <Student x={1130} ty={590} s={0.6} skin="#d9a074" hair="#8b4b1f" shirt="#ef7a3a" delay={0.9} />
        <Student x={1300} ty={590} s={0.6} skin="#7a4a2c" hair={INK} shirt="#f4c7a8" long delay={1.8} />
        <Table y={590} x={200} w={400} opacity="0.9" />
        <Table y={590} x={1030} w={400} opacity="0.9" />
        <Notebook cx={300} ty={594} s={0.6} delay={0.5} />
        <Notebook cx={470} ty={594} s={0.6} delay={1.7} />
        <Notebook cx={1130} ty={594} s={0.6} delay={1.1} />
        <Notebook cx={1300} ty={594} s={0.6} delay={2.2} />
        <Robot x={385} ty={598} s={0.6} delay={0.2} />
        <Robot x={1215} ty={598} s={0.6} delay={1} />
        <rect y="470" width="1600" height="260" fill="url(#haze)" />
      </g>

      {/* floating notes and dust */}
      {NOTES.map(([x, y, w, h, d, rot], i) => (
        <g key={i} className="float" style={{ animationDelay: `${d}s`, animationDuration: `${15 + (i % 4) * 3}s`, "--dx": `${(i % 2 ? -1 : 1) * (26 + i * 4)}px` }}>
          <g transform={`translate(${x} ${y}) rotate(${rot})`}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="2" fill="#fffdf9" stroke="#d9c7b0" strokeWidth="1.5" />
            <path d={`M${-w / 2 + 3} ${-h / 6} h${w - 6} M${-w / 2 + 3} ${h / 5} h${w - 10}`} stroke="#d9c7b0" strokeWidth="1.5" />
            {i % 3 === 0 && <circle cx={w / 5} cy={h / 6} r="3.5" fill="none" stroke={ORANGE} strokeWidth="1.8" />}
          </g>
        </g>
      ))}
      {DUST.map(([x, y, r, d], i) => (
        <circle key={i} className="dust" cx={x} cy={y} r={r} fill="#fff" style={{ animationDelay: `${d}s` }} />
      ))}

      {/* front table, students, notebooks, robots */}
      <Student x={190} ty={770} s={1} skin="#f2c9a5" hair={INK} shirt="#ef7a3a" long delay={0} />
      <Student x={440} ty={770} s={1} skin="#d9a074" hair="#5a3a22" shirt="#6f8aa8" delay={1.4} />
      <Student x={1160} ty={770} s={1} skin="#a9714b" hair={INK} shirt="#fff4e6" delay={0.7} />
      <Student x={1410} ty={770} s={1} skin="#f2c9a5" hair="#8b4b1f" shirt="#8fa58a" long delay={2.1} />
      <Table y={770} />
      <Notebook cx={190} ty={775} delay={0.3} />
      <Notebook cx={440} ty={775} delay={1.5} />
      <Notebook cx={1160} ty={775} delay={0.9} />
      <Notebook cx={1410} ty={775} delay={2.3} />
      <Notebook cx={800} ty={774} s={1.3} press />
      <Robot x={316} ty={792} delay={0.6} />
      <Robot x={1286} ty={792} delay={1.3} />
      <Robot x={650} ty={796} s={1.1} delay={0.2} />
      <Robot x={955} ty={796} s={1.1} delay={1.8} />

      {/* the stamp that presses the centre notebook */}
      <g transform="translate(868 836)">
        <g className="press-tool">
          <circle cx="0" cy="-104" r="15" fill="#3a2815" />
          <rect x="-6" y="-92" width="12" height="44" fill="#6b4a2b" />
          <rect x="-36" y="-52" width="72" height="18" rx="7" fill={ORANGE} stroke={INK} strokeWidth="2.5" />
          <rect x="-31" y="-36" width="62" height="8" rx="3" fill="#d9631f" />
        </g>
      </g>
    </svg>
  );
}
