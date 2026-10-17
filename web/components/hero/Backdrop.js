// Static backdrop for the hero: sky, skyline, trees, shelves, the big window and hanging vines.
// Only the vines, tree tops and light shafts have motion (CSS classes in globals.css).

const BOOKS = ["#b0452a", "#d98a3a", "#6e7f48", "#3d5a73", "#8b5e3c", "#e3c28a", "#a8553a", "#5b6b8a", "#c9a14a", "#7a3f3f", "#4f7a6a"];

export function Shelf({ x, y, w, h, rows, seed, dim = 0 }) {
  const rowH = h / rows;
  const out = [];
  for (let r = 0; r < rows; r++) {
    const base = y + (r + 1) * rowH;
    let cx = x + 8;
    let i = 0;
    while (cx < x + w - 14) {
      const bw = 8 + ((i * 7 + seed + r * 3) % 10);
      const bh = rowH * (0.62 + (((i * 5 + seed + r) % 5) * 0.07));
      const tilt = (i + r + seed) % 11 === 0;
      out.push(
        <g key={`${r}-${i}`} transform={tilt ? `rotate(-6 ${cx + bw / 2} ${base})` : undefined}>
          <rect x={cx} y={base - bh} width={bw} height={bh} rx="1.4" fill={BOOKS[(i * 3 + seed + r) % BOOKS.length]} />
          <rect x={cx + 1.5} y={base - bh + 5} width={bw - 3} height="2.4" fill="#fff" opacity="0.22" />
        </g>
      );
      cx += bw + 1.2;
      i++;
    }
    out.push(<rect key={`pl${r}`} x={x} y={base} width={w} height="9" fill="#7a4a24" />);
    out.push(<rect key={`ph${r}`} x={x} y={base} width={w} height="2.5" fill="#c58b4e" />);
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#5e3a1b" />
      {out}
      {dim > 0 && <rect x={x} y={y} width={w} height={h} fill="#ffe3b3" opacity={dim} />}
    </g>
  );
}

function Tree({ x, y, r, c1 = "#b2b84e", c2 = "#d4b948", c3 = "#8fa347", sway = 0 }) {
  return (
    <g className="tree-sway" style={{ transformOrigin: `${x}px ${y + r}px`, animationDelay: `${sway}s` }}>
      <rect x={x - 5} y={y} width="10" height={r * 1.1} fill="#8a6a45" />
      <circle cx={x} cy={y - r * 0.2} r={r} fill={c1} />
      <circle cx={x - r * 0.7} cy={y + r * 0.1} r={r * 0.72} fill={c3} />
      <circle cx={x + r * 0.75} cy={y} r={r * 0.78} fill={c2} />
      <circle cx={x + r * 0.1} cy={y - r * 0.7} r={r * 0.6} fill={c2} opacity="0.9" />
    </g>
  );
}

/** Sky, glow and the city seen through the opening and the window. */
export function Skyline() {
  const row = [];
  for (let i = 0; i < 22; i++) {
    const x = 540 + i * 52;
    const h = 40 + ((i * 37) % 60);
    row.push(<rect key={i} x={x} y={470 - h} width={48} height={h + 20} fill={i % 3 === 0 ? "#efd3b4" : "#f3dcc2"} />);
  }
  return (
    <g>
      <rect width="1600" height="900" fill="url(#sky)" />
      <circle cx="1000" cy="170" r="640" fill="url(#sunglow)" />
      {/* far city */}
      <g opacity="0.8">{row}</g>
      <g opacity="0.85">
        <rect x="1160" y="330" width="170" height="150" fill="#f3dcc2" />
        <polygon points="1150,332 1245,270 1340,332" fill="#d9a77c" />
        {Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 7 }, (_, c) => <rect key={`${r}-${c}`} x={1172 + c * 23} y={348 + r * 30} width="9" height="14" fill="#e8c9a4" />)
        )}
        <rect x="1330" y="240" width="46" height="240" fill="#efd6b8" />
        <polygon points="1324,242 1353,170 1382,242" fill="#d9a77c" />
        <circle cx="1353" cy="286" r="12" fill="#fff4e0" stroke="#d1a57a" strokeWidth="2" />
        <rect x="860" y="395" width="150" height="85" fill="#f6d8c3" />
        <polygon points="850,397 935,350 1020,397" fill="#c7704a" />
        <rect x="900" y="420" width="16" height="22" fill="#e8b79a" />
        <rect x="954" y="420" width="16" height="22" fill="#e8b79a" />
      </g>
      {/* trees through the opening */}
      <g>
        <Tree x={555} y={330} r={74} sway={0} />
        <Tree x={716} y={400} r={46} c1="#c3bd52" sway={1.2} />
        <Tree x={800} y={420} r={36} sway={2.2} />
        <Tree x={1070} y={410} r={52} c1="#bcb54a" c2="#e0c04c" sway={0.6} />
        <Tree x={1130} y={430} r={40} sway={1.8} />
        <Tree x={1440} y={330} r={70} c1="#a9b24a" sway={0.9} />
      </g>
      <rect y="360" width="1600" height="190" fill="url(#haze)" />
      {/* a few distant lamp posts and monuments */}
      <rect x="772" y="340" width="12" height="130" fill="#e2c39a" opacity="0.8" />
      <rect x="988" y="372" width="18" height="100" fill="#d9ba90" opacity="0.8" />
    </g>
  );
}

/** Window frame on the right, ladder and shelves on the left. */
export function Frames() {
  return (
    <g>
      {/* right: big window mullions */}
      <g>
        <rect x="1180" y="0" width="26" height="620" fill="#c28b4f" />
        <rect x="1180" y="0" width="7" height="620" fill="#e0b27a" />
        <rect x="1372" y="0" width="16" height="560" fill="#c8935a" />
        <rect x="1516" y="0" width="16" height="540" fill="#c8935a" />
        <rect x="1180" y="118" width="420" height="12" fill="#c8935a" />
        <rect x="1180" y="264" width="420" height="12" fill="#c8935a" />
        <rect x="1180" y="410" width="420" height="12" fill="#c8935a" />
        <rect x="1180" y="548" width="420" height="14" fill="#a8743d" />
        <rect x="1560" y="0" width="40" height="620" fill="#d79a52" opacity="0.5" />
      </g>
      {/* left: shelves, pillar, ladder */}
      <rect x="0" y="0" width="470" height="650" fill="#8e5f33" />
      <Shelf x={372} y={90} w={104} h={520} rows={7} seed={9} dim={0.22} />
      <Shelf x={0} y={0} w={238} h={650} rows={8} seed={3} />
      <rect x="236" y="0" width="30" height="650" fill="#b27a42" />
      <rect x="236" y="0" width="8" height="650" fill="#d9a468" />
      <g>
        <line x1="274" y1="650" x2="294" y2="60" stroke="#c28b4f" strokeWidth="13" strokeLinecap="round" />
        <line x1="344" y1="650" x2="364" y2="60" stroke="#c28b4f" strokeWidth="13" strokeLinecap="round" />
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 10;
          const y = 120 + t * 500;
          const lx = 294 - (y - 60) * (20 / 590) * 1 + (0);
          return <line key={i} x1={286 + (620 - y) * 0.034 - 8} y1={y} x2={356 + (620 - y) * 0.034 - 8} y2={y} stroke="#a8743d" strokeWidth="9" strokeLinecap="round" />;
        })}
      </g>
    </g>
  );
}

/** Hanging vines with swaying leaves. */
export function Vines() {
  const vine = (x, len, seed, k) => {
    const leaves = [];
    for (let i = 1; i <= 8; i++) {
      const t = i / 8;
      const lx = x + Math.sin(i * 1.6 + seed) * 16;
      const ly = t * len;
      leaves.push(<ellipse key={i} cx={lx + (i % 2 ? 14 : -14)} cy={ly} rx="15" ry="8" fill={i % 3 ? "#6f8f3e" : "#97ad4a"} transform={`rotate(${i % 2 ? 25 : -25} ${lx} ${ly})`} />);
    }
    return (
      <g key={k} className="vine" style={{ transformOrigin: `${x}px 0px`, animationDelay: `${seed * 0.7}s` }}>
        <path d={`M${x} 0 C${x - 16} ${len * 0.3} ${x + 20} ${len * 0.6} ${x + 4} ${len}`} stroke="#5d6b2d" strokeWidth="4" fill="none" strokeLinecap="round" />
        {leaves}
      </g>
    );
  };
  return (
    <g>
      {vine(300, 150, 1, "a")}
      {vine(430, 210, 2, "b")}
      {vine(520, 120, 3, "c")}
      {vine(1250, 160, 4, "d")}
      {vine(1480, 130, 5, "e")}
      <g className="vine" style={{ transformOrigin: "1560px 0px" }}>
        <path d="M1560 0 C1520 30 1560 70 1530 110" stroke="#5d6b2d" strokeWidth="5" fill="none" strokeLinecap="round" />
        {[20, 50, 80, 105].map((y, i) => (
          <ellipse key={i} cx={1540 + (i % 2 ? 22 : -4)} cy={y} rx="22" ry="10" fill="#76973f" transform={`rotate(${i % 2 ? 20 : -20} 1540 ${y})`} />
        ))}
      </g>
    </g>
  );
}
