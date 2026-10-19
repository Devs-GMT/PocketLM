// The PocketLM mascot (asset/pocketlm-mascot.svg) as React parts, so each named
// piece can be animated with CSS or framer-motion. Source art is 360x400; the feet
// touch the ground at y=360. Pivots (user units):
//   leaf (180,82)  arm-left (76,215)  arm-right (284,215)
//   leg-left (157,322)  leg-right (205,322)  eyes at (148,172) and (212,172)
// Gradients live in <MascotDefs/>; render it once per <svg> and pass the same `idp`.

const INK = "#30271F";

export function MascotDefs({ idp = "pm" }) {
  return (
    <defs>
      <radialGradient id={`${idp}-body`} cx="132" cy="140" r="230" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFB27C" />
        <stop offset=".55" stopColor="#FF9257" />
        <stop offset="1" stopColor="#F47B42" />
      </radialGradient>
      <linearGradient id={`${idp}-side`} x1="250" y1="100" x2="310" y2="300" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E2663A" />
        <stop offset="1" stopColor="#C4502D" />
      </linearGradient>
      <linearGradient id={`${idp}-limb`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#FF9A60" />
        <stop offset="1" stopColor="#F58249" />
      </linearGradient>
      <filter id={`${idp}-soft`} x="-30%" y="-120%" width="160%" height="340%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <clipPath id={`${idp}-clip`}>
        <path d="M180 78C240 76 288 128 296 205C304 280 262 332 180 332C98 332 56 280 64 205C72 128 120 80 180 78Z" />
      </clipPath>
    </defs>
  );
}

/** The whole character. `cls` adds class names to the moving parts: { leaf, armL, armR, legL, legR, eyeL, eyeR, body, mouth, root }. */
export function MascotArt({ idp = "pm", cls = {}, shadow = true, mouthOpen = false, eyes, mouth, cheeks = 0.5, children }) {
  const c = (k) => ["mp", `mp-${k}`, cls[k]].filter(Boolean).join(" ");
  return (
    <g className={cls.root}>
      {shadow && (
        <g className={c("shadow")} opacity=".3">
          <ellipse cx="180" cy="372" rx="100" ry="9" fill="#9C7F66" filter={`url(#${idp}-soft)`} />
        </g>
      )}
      <g className={c("legL")} style={{ transformOrigin: "157px 322px" }}>
        <rect x="138" y="312" width="38" height="48" rx="17" transform="rotate(-5 157 322)" fill={`url(#${idp}-limb)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      </g>
      <g className={c("legR")} style={{ transformOrigin: "205px 322px" }}>
        <rect x="186" y="312" width="38" height="48" rx="17" transform="rotate(5 205 322)" fill={`url(#${idp}-limb)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      </g>
      <g className={c("armL")} style={{ transformOrigin: "76px 215px" }}>
        <rect x="26" y="202" width="58" height="28" rx="14" transform="rotate(28 76 216)" fill={`url(#${idp}-limb)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      </g>
      <g className={c("armR")} style={{ transformOrigin: "284px 215px" }}>
        <rect x="276" y="202" width="58" height="28" rx="14" transform="rotate(-34 284 216)" fill={`url(#${idp}-limb)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      </g>
      <g className={c("body")} style={{ transformOrigin: "180px 330px" }}>
        <path d="M180 78C240 76 288 128 296 205C304 280 262 332 180 332C98 332 56 280 64 205C72 128 120 80 180 78Z" fill={`url(#${idp}-body)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <g clipPath={`url(#${idp}-clip)`}>
          <path d="M238 84C282 112 306 164 308 224C310 286 280 322 238 334C270 300 280 256 272 204C264 154 254 112 238 84Z" fill={`url(#${idp}-side)`} opacity=".85" />
          <path d="M90 288C118 322 160 334 206 334C236 334 262 326 282 312C250 338 214 346 176 342C134 338 104 318 90 288Z" fill="#D8663A" opacity=".5" />
        </g>
        <ellipse cx="124" cy="126" rx="24" ry="12" transform="rotate(-38 124 126)" fill="#fff" opacity=".42" />
        <ellipse cx="100" cy="158" rx="5" ry="4" fill="#fff" opacity=".38" />
      </g>
      <g className={c("cheeks")} opacity={cheeks}>
        <ellipse cx="116" cy="210" rx="17" ry="10" fill="#FF5E5E" />
        <ellipse cx="244" cy="210" rx="17" ry="10" fill="#FF5E5E" />
      </g>
      {eyes ?? (
        <>
      <g className={c("eyeL")} style={{ transformOrigin: "148px 172px" }}>
        <ellipse cx="148" cy="172" rx="12" ry="17" fill="#2E241E" />
        <circle cx="152" cy="164" r="4.6" fill="#fff" />
        <circle cx="144" cy="180" r="2.2" fill="#fff" opacity=".85" />
      </g>
      <g className={c("eyeR")} style={{ transformOrigin: "212px 172px" }}>
        <ellipse cx="212" cy="172" rx="12" ry="17" fill="#2E241E" />
        <circle cx="216" cy="164" r="4.6" fill="#fff" />
        <circle cx="208" cy="180" r="2.2" fill="#fff" opacity=".85" />
      </g>
        </>
      )}
      {mouth ?? (
      <g className={c("mouth")}>
        {mouthOpen ? (
          <>
            <path d="M160 204C168 232 192 232 200 204Z" fill="#4B2B20" stroke="#4B2B20" strokeWidth="3" strokeLinejoin="round" />
            <path d="M168 220C174 226 186 226 192 220C188 216 172 216 168 220Z" fill="#E8684F" />
          </>
        ) : (
          <>
            <path d="M162 206C170 222 190 222 198 206" stroke="#4B2B20" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M170 214C176 220 184 220 190 214C186 218 174 218 170 214Z" fill="#E8684F" opacity=".75" />
          </>
        )}
      </g>
      )}
      <g className={c("leaf")} style={{ transformOrigin: "180px 82px" }}>
        <path d="M180 82C179 68 184 56 192 46" stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <path d="M186 64C176 46 158 40 142 44C144 62 162 74 186 64Z" fill="#6E9B58" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
        <path d="M192 50C192 26 216 12 242 16C242 42 222 60 192 50Z" fill="#86B36E" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
        <path d="M198 44C210 36 222 28 236 22" stroke="#5E8A4A" strokeWidth="2" strokeLinecap="round" opacity=".8" fill="none" />
      </g>
      {children}
    </g>
  );
}

/** Small standalone mascot icon (navbar logo and similar). */
export function MascotIcon({ size = 28, idp = "pmi", className }) {
  return (
    <svg className={className} width={size} height={size * (400 / 360)} viewBox="0 0 360 400" fill="none" aria-hidden="true" focusable="false">
      <MascotDefs idp={idp} />
      <MascotArt idp={idp} />
    </svg>
  );
}

/** Round face of the mascot: the small brand mark (navbar, sidebar, avatars, favicon). */
export function FaceIcon({ size = 28, idp = "pfi", className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 1024 1024" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${idp}g`} cx="38%" cy="30%" r="85%">
          <stop offset="0" stopColor="#ffb27c" />
          <stop offset=".55" stopColor="#ff9257" />
          <stop offset="1" stopColor="#f27a40" />
        </radialGradient>
        <clipPath id={`${idp}c`}>
          <circle cx="512" cy="512" r="512" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${idp}c)`}>
        <rect width="1024" height="1024" fill={`url(#${idp}g)`} />
        <ellipse cx="260" cy="230" rx="120" ry="58" transform="rotate(-38 260 230)" fill="#fff" opacity=".28" />
        <g transform="translate(512 330) scale(1.25)">
          <path d="M0 0C-2-34 6-64 26-86" stroke="#2a1d10" strokeWidth="14" strokeLinecap="round" />
          <path d="M8-52C-26-96-84-108-132-92C-124-36-68-4 8-52Z" fill="#5b8f45" />
          <path d="M26-84C22-150 86-196 168-182C170-108 112-52 26-84Z" fill="#79ad5e" />
        </g>
        <ellipse cx="372" cy="560" rx="52" ry="74" fill="#2e241e" />
        <ellipse cx="652" cy="560" rx="52" ry="74" fill="#2e241e" />
        <circle cx="390" cy="528" r="19" fill="#fff" />
        <circle cx="670" cy="528" r="19" fill="#fff" />
        <circle cx="356" cy="596" r="9" fill="#fff" opacity=".8" />
        <circle cx="636" cy="596" r="9" fill="#fff" opacity=".8" />
        <ellipse cx="236" cy="700" rx="68" ry="40" fill="#ff5e5e" opacity=".5" />
        <ellipse cx="788" cy="700" rx="68" ry="40" fill="#ff5e5e" opacity=".5" />
        <path d="M440 690C472 764 552 764 584 690" stroke="#4b2b20" strokeWidth="22" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Closing call to action: the mascot stamps a page of notes (the stamp presses down, the mark appears). */
export function StampScene({ size = 150, idp = "stm", className }) {
  return (
    <svg className={className} width={size * (540 / 400)} height={size} viewBox="0 0 540 400" fill="none" aria-hidden="true" focusable="false">
      <MascotDefs idp={idp} />
      <MascotArt idp={idp} cls={{ armR: "st-hidearm" }}>
        {/* the sheet on the ground */}
        <g className="st-sheet">
          <path d="M318 286L496 286L528 356L290 356Z" fill="#9C7F66" opacity=".25" transform="translate(4 6)" />
          <path d="M318 282L496 282L528 352L290 352Z" fill="#FFF9EF" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M392 300H486M386 318H496M380 336H506" stroke="#CDB99D" strokeWidth="3.4" strokeLinecap="round" />
          <g className="st-mark">
            <ellipse cx="336" cy="312" rx="30" ry="14" stroke="#E2663A" strokeWidth="4" />
            <path d="M324 312l8 6 16-14" stroke="#E2663A" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
        {/* the stamp and the arm that holds it move together */}
        <g className="st-hand" style={{ transformOrigin: "284px 215px" }}>
          <rect x="319" y="212" width="26" height="28" rx="11" fill="#D8A15F" stroke={INK} strokeWidth="3.2" />
          <rect x="326" y="238" width="12" height="26" rx="4" fill="#D8A15F" stroke={INK} strokeWidth="3.2" />
          <rect x="300" y="262" width="64" height="15" rx="6" fill="#B77F43" stroke={INK} strokeWidth="3.2" />
          <rect x="304" y="277" width="56" height="8" rx="3" fill="#E2663A" stroke={INK} strokeWidth="2.6" />
          <rect x="276" y="202" width="80" height="28" rx="14" transform="rotate(34 284 216)" fill={`url(#${idp}-limb)`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        </g>
      </MascotArt>
    </svg>
  );
}
