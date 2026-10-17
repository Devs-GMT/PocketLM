// Hand-drawn SVG characters for the hero. Every part that moves is its own <g>
// with a class, so CSS can animate it (see "hero scene" in globals.css).
// Local origin of each character = bottom centre, where it meets the table.

import { MascotArt } from "@/components/MascotArt";

const INK = "#2a1508";

/* ---------------- the orange mascot (PocketLM's AI helper, official art) ---------------- */
// Placed by its feet: (x, y) is the ground point, `s` scales the 360x400 art (0.5 is about 140px tall).
export function Mascot({ x, y, s = 0.5, delay = 0, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) translate(-180 -360)`}>
      <g className="m-hop" style={{ animationDelay: `${delay}s`, transformOrigin: "180px 360px" }}>
        <g className="m-bob" style={{ animationDelay: `${delay * 1.7}s`, transformOrigin: "180px 360px" }}>
          <MascotArt
            idp="hm"
            cls={{ leaf: "m-leaf", armL: "m-armL", armR: "m-armR", eyeL: "m-eye", eyeR: "m-eye", mouth: "m-mouth" }}
          />
        </g>
      </g>
    </g>
  );
}

/* ---------------- foreground boy: cheek on hand, writing ---------------- */
export function Boy({ part = "all" }) {
  const SKIN = "#f3c9a4";
  return (
    <g>
      <g display={part === "arm" ? "none" : undefined}>
      {/* torso: light hoodie under a dark open jacket */}
      <path d="M-178 12 C-196 -80 -168 -152 -96 -180 C-60 -194 60 -194 96 -180 C168 -152 196 -80 178 12 Z" fill="#d6ccbf" />
      <path d="M-72 -184 C-40 -150 40 -150 72 -184 C40 -206 -40 -206 -72 -184Z" fill="#bdb1a2" />
      <path d="M-178 12 C-196 -80 -168 -152 -108 -178 L-66 -146 C-90 -100 -92 -44 -100 12Z" fill="#2c2b35" />
      <path d="M178 12 C196 -80 168 -152 108 -178 L66 -146 C90 -100 92 -44 100 12Z" fill="#2c2b35" />
      <path d="M-20 -150 v54 M20 -150 v54" stroke="#a89b8b" strokeWidth="3" strokeLinecap="round" />

      {/* resting arm: elbow on the table, hand holding the cheek */}
      <g className="p-breathe">
        <path d="M-132 -150 C-182 -104 -184 -52 -156 -24 C-118 -32 -86 -118 -66 -210" stroke="#2c2b35" strokeWidth="50" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <path d="M-26 -196 h52 v38 q-26 18 -52 0z" fill="#e5b48c" />

      {/* head */}
      <g className="p-head" style={{ transformOrigin: "0px -180px" }}>
        <path d="M-60 -256 C-64 -218 -42 -190 0 -186 C42 -190 64 -218 60 -256 C58 -296 32 -318 0 -318 C-32 -318 -58 -296 -60 -256Z" fill={SKIN} />
        <path d="M-52 -224 C-40 -196 -12 -188 0 -188 C12 -188 40 -196 52 -224 C42 -204 20 -196 0 -196 C-20 -196 -42 -204 -52 -224Z" fill="#e4b08a" opacity="0.6" />
        <ellipse cx="-64" cy="-252" rx="9" ry="14" fill="#e8b892" />
        <ellipse cx="64" cy="-252" rx="9" ry="14" fill="#e8b892" />
        {/* messy dark hair */}
        <path d="M-74 -248 C-92 -310 -44 -352 6 -346 C62 -350 98 -306 78 -244 C70 -270 56 -284 38 -290 C30 -272 14 -270 6 -284 C-6 -266 -26 -266 -34 -282 C-52 -276 -66 -264 -74 -248Z" fill="#3b2418" />
        <path d="M-46 -300 q-14 -22 -2 -38 M10 -340 q-6 -20 12 -30 M52 -322 q18 -16 30 -4" stroke="#3b2418" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M-40 -276 q-6 18 -2 30 M-8 -278 q-2 16 6 26 M24 -280 q8 14 4 26" stroke="#2a180f" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* face: happy closed eyes, brows, blush, smile */}
        <path d="M-37 -243 q13 11 26 0 M11 -243 q13 11 26 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M-40 -262 q14 -7 28 -1 M12 -263 q14 -6 28 1" stroke="#3b2418" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="-40" cy="-224" rx="12" ry="6.5" fill="#f08a78" opacity="0.5" />
        <ellipse cx="40" cy="-224" rx="12" ry="6.5" fill="#f08a78" opacity="0.5" />
        <path d="M-1 -236 q4 7 -1 10" stroke="#c98d68" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-11 -214 q11 11 22 0" stroke={INK} strokeWidth="3.6" fill="none" strokeLinecap="round" />
        {/* hand on the cheek */}
        <g className="p-breathe">
          <ellipse cx="-62" cy="-214" rx="26" ry="23" fill={SKIN} transform="rotate(-24 -62 -214)" />
          <path d="M-84 -226 q-4 -10 4 -14 M-72 -234 q-2 -10 7 -12 M-58 -236 q0 -10 9 -10" stroke="#d8a37c" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>

      </g>
      <g display={part === "body" ? "none" : undefined}>
      {/* writing arm + pen */}
      <g className="p-write" style={{ transformOrigin: "150px -40px" }}>
        <path d="M118 -160 C178 -122 196 -62 154 -30 C124 -18 104 -14 86 -12" stroke="#2c2b35" strokeWidth="50" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M122 -26 q-16 4 -34 12" stroke="#d6ccbf" strokeWidth="26" fill="none" strokeLinecap="round" />
        <ellipse cx="74" cy="-16" rx="24" ry="18" fill={SKIN} transform="rotate(18 74 -16)" />
        <path d="M82 -26 L26 14" stroke="#23232b" strokeWidth="9" strokeLinecap="round" />
        <path d="M30 11 L22 18" stroke="#f4d6a0" strokeWidth="6" strokeLinecap="round" />
        <path d="M62 -22 q-6 8 -2 14" stroke="#d8a37c" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      </g>
    </g>
  );
}

/* ---------------- foreground girl: hair bun, writing ---------------- */
export function Girl({ part = "all" }) {
  const SKIN = "#f4cba6";
  const HAIR = "#7b4a2e";
  return (
    <g>
      <g display={part === "arm" ? "none" : undefined}>
      {/* long hair behind the shoulders */}
      <path d="M-86 -250 C-110 -170 -118 -100 -96 -48 L96 -48 C118 -100 110 -170 86 -250Z" fill={HAIR} />
      {/* sweater */}
      <path d="M-180 14 C-198 -76 -170 -150 -98 -176 C-60 -190 60 -190 98 -176 C170 -150 198 -76 180 14 Z" fill="#c9a07a" />
      <path d="M-70 -182 C-40 -148 40 -148 70 -182 C40 -204 -40 -204 -70 -182Z" fill="#b48a64" />
      <path d="M-150 -110 q10 40 4 88 M-120 -130 q8 50 2 118 M150 -110 q-10 40 -4 88 M120 -130 q-8 50 -2 118" stroke="#b28862" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M-24 -194 h48 v36 q-24 18 -48 0z" fill="#e5b48c" />

      {/* resting arm on the right, hand next to the mascot */}
      <g className="p-breathe">
        <path d="M126 -150 C176 -116 196 -60 168 -30 C150 -16 128 -12 112 -12" stroke="#c9a07a" strokeWidth="50" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="108" cy="-14" rx="22" ry="16" fill={SKIN} />
      </g>

      {/* head */}
      <g className="p-head p-head-girl" style={{ transformOrigin: "0px -184px" }}>
        {/* bun */}
        <circle cx="14" cy="-364" r="34" fill={HAIR} />
        <circle cx="14" cy="-364" r="34" fill="none" stroke="#5e3721" strokeWidth="3" strokeDasharray="6 10" />
        <path d="M-12 -338 q26 12 52 0" stroke="#ef7a3a" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M-62 -258 C-66 -220 -44 -192 0 -188 C44 -192 66 -220 62 -258 C60 -298 34 -322 0 -322 C-34 -322 -60 -298 -62 -258Z" fill={SKIN} />
        <path d="M-54 -226 C-42 -198 -14 -190 0 -190 C14 -190 42 -198 54 -226 C44 -206 22 -198 0 -198 C-22 -198 -44 -206 -54 -226Z" fill="#e4b08a" opacity="0.55" />
        {/* bangs and side locks */}
        <path d="M-76 -250 C-92 -318 -40 -348 6 -344 C58 -346 96 -312 78 -246 C72 -276 56 -296 30 -300 C14 -280 -4 -280 -12 -296 C-34 -292 -56 -280 -66 -258 C-72 -250 -76 -250 -76 -250Z" fill={HAIR} />
        <path d="M-74 -250 C-90 -210 -86 -170 -70 -140 C-62 -170 -60 -210 -58 -246Z" fill={HAIR} />
        <path d="M74 -250 C90 -210 86 -170 70 -140 C62 -170 60 -210 58 -246Z" fill={HAIR} />
        <path d="M-30 -312 q14 18 8 40 M10 -318 q10 20 0 42" stroke="#5e3721" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* eyes, looking down at the notebook */}
        <g className="p-eyes" style={{ transformOrigin: "0px -240px" }}>
          <ellipse cx="-25" cy="-238" rx="10" ry="12.5" fill="#4a2a18" />
          <ellipse cx="25" cy="-238" rx="10" ry="12.5" fill="#4a2a18" />
          <circle cx="-22" cy="-242" r="3.6" fill="#fff" />
          <circle cx="28" cy="-242" r="3.6" fill="#fff" />
        </g>
        <path d="M-38 -252 q13 -8 26 0 M12 -252 q13 -8 26 0" stroke="#2a150a" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="-42" cy="-222" rx="12" ry="6.5" fill="#f08a78" opacity="0.55" />
        <ellipse cx="42" cy="-222" rx="12" ry="6.5" fill="#f08a78" opacity="0.55" />
        <path d="M0 -234 q3 7 -1 9" stroke="#c98d68" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-10 -212 q10 10 20 0" stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      </g>

      </g>
      <g display={part === "body" ? "none" : undefined}>
      {/* writing arm (viewer-left) with pen */}
      <g className="p-write p-write-b" style={{ transformOrigin: "-156px -40px" }}>
        <path d="M-120 -156 C-180 -118 -198 -60 -156 -28 C-126 -16 -100 -12 -80 -10" stroke="#c9a07a" strokeWidth="50" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M-124 -24 q18 4 38 12" stroke="#e2c2a0" strokeWidth="24" fill="none" strokeLinecap="round" />
        <ellipse cx="-74" cy="-14" rx="23" ry="17" fill={SKIN} transform="rotate(-16 -74 -14)" />
        <path d="M-80 -24 L-28 14" stroke="#2b3f66" strokeWidth="9" strokeLinecap="round" />
        <path d="M-32 11 L-24 18" stroke="#f4d6a0" strokeWidth="6" strokeLinecap="round" />
      </g>
      </g>
    </g>
  );
}

/* ---------------- background students (smaller, typing or reading) ---------------- */
export function BackPerson({ x, y, s = 1, hoodie = "#9a8a7c", hair = "#3b2418", skin = "#e9b994", delay = 0, headphones = false, laptop = true, bun = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-62 4 C-70 -50 -52 -96 0 -100 C52 -96 70 -50 62 4Z" fill={hoodie} />
      <path d="M-26 -100 q26 18 52 0 q-26 -16 -52 0z" fill="#00000022" />
      <g className="p-head p-head-back" style={{ transformOrigin: "0px -96px", animationDelay: `${delay}s` }}>
        <circle cx="0" cy="-130" r="31" fill={skin} />
        <path d="M-34 -132 C-36 -166 -8 -176 8 -172 C34 -172 42 -150 34 -128 C28 -142 14 -150 -4 -148 C-18 -146 -30 -140 -34 -132Z" fill={hair} />
        {bun && <circle cx="6" cy="-170" r="14" fill={hair} />}
        {headphones && (
          <g>
            <path d="M-36 -134 C-36 -176 36 -176 36 -134" stroke="#e8e0d4" strokeWidth="6" fill="none" />
            <rect x="-42" y="-142" width="12" height="24" rx="6" fill="#e8e0d4" />
            <rect x="30" y="-142" width="12" height="24" rx="6" fill="#e8e0d4" />
          </g>
        )}
        <circle cx="-11" cy="-126" r="2.6" fill={INK} />
        <circle cx="11" cy="-126" r="2.6" fill={INK} />
      </g>
      {laptop && (
        <g>
          <rect x="-50" y="-74" width="100" height="62" rx="5" fill="#34343c" />
          <rect x="-44" y="-68" width="88" height="50" rx="3" fill="#d9ecff" opacity="0.9" className="screen" style={{ animationDelay: `${delay}s` }} />
          <rect x="-54" y="-14" width="108" height="8" rx="3" fill="#25252b" />
          <g className="p-type" style={{ animationDelay: `${delay}s` }}>
            <ellipse cx="-30" cy="-6" rx="13" ry="8" fill={skin} />
            <ellipse cx="30" cy="-6" rx="13" ry="8" fill={skin} />
          </g>
        </g>
      )}
    </g>
  );
}

/* ---------------- the boy climbing the library ladder ---------------- */
export function LadderBoy() {
  return (
    <g>
      <g className="p-climb">
        <rect x="-20" y="-10" width="16" height="60" rx="6" fill="#33333d" />
        <rect x="4" y="-10" width="16" height="60" rx="6" fill="#2b2b35" />
        <rect x="-26" y="-92" width="52" height="92" rx="20" fill="#cfc7bd" />
        <rect x="-32" y="-84" width="24" height="74" rx="10" fill="#2e3340" />
        <rect x="8" y="-84" width="24" height="74" rx="10" fill="#2e3340" opacity="0" />
        <circle cx="0" cy="-114" r="19" fill="#3a2a22" />
        <path d="M-17 -112 a17 17 0 0 0 34 0z" fill="#3a2a22" />
        <g className="p-reach" style={{ transformOrigin: "16px -84px" }}>
          <path d="M16 -84 L30 -150" stroke="#cfc7bd" strokeWidth="14" strokeLinecap="round" />
          <circle cx="31" cy="-156" r="8" fill="#e9b994" />
          <rect x="22" y="-174" width="20" height="26" rx="2" fill="#b0452a" />
        </g>
      </g>
    </g>
  );
}

/* ---------------- a student strolling down the aisle ---------------- */
export function Walker({ delay = 0 }) {
  return (
    <g className="p-walk" style={{ animationDelay: `${delay}s` }}>
      <g className="leg leg-a" style={{ transformOrigin: "0px -52px" }}>
        <rect x="-11" y="-54" width="15" height="56" rx="7" fill="#3b3a45" />
        <ellipse cx="-2" cy="2" rx="14" ry="6" fill="#26252c" />
      </g>
      <g className="leg leg-b" style={{ transformOrigin: "0px -52px" }}>
        <rect x="-4" y="-54" width="15" height="56" rx="7" fill="#464553" />
        <ellipse cx="6" cy="2" rx="14" ry="6" fill="#2c2b33" />
      </g>
      <rect x="-24" y="-130" width="48" height="84" rx="18" fill="#c78d5f" />
      <rect x="-36" y="-124" width="22" height="62" rx="9" fill="#3a2f2a" />
      <circle cx="0" cy="-152" r="21" fill="#e9b994" />
      <path d="M-22 -150 a22 22 0 0 1 44 -2 q-10 -12 -22 -10 q-14 0 -22 12z" fill="#2b1b12" />
    </g>
  );
}
