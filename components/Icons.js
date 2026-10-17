// Hand-drawn style line icons (own drawings, round caps, slightly wobbly paths).
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export function HandWave({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...base}>
      <path d="M17 26V13.5a2.5 2.5 0 0 1 5 0V24" />
      <path d="M22 23V9.5a2.5 2.5 0 0 1 5 0V23.5" />
      <path d="M27 23.5V12a2.5 2.5 0 0 1 5 0v14" />
      <path d="M32 18.5a2.5 2.5 0 0 1 5 0V29c0 7-4.8 12-11.5 12-4.6 0-7.4-2.4-10-6.2L9.6 28a2.4 2.4 0 0 1 3.9-2.7L17 29.5" />
      <path d="M6 9c1.6-2.4 4-3.6 6.6-3.8M3.5 14.2c.2-2.2 1-3.8 2.4-5.2" />
    </svg>
  );
}

export function Pencil({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <path d="M5 27l1.4-6.2L22.6 4.6a2.6 2.6 0 0 1 3.7 3.7L10.2 24.4z" />
      <path d="M20 7.2l4.8 4.8M6.4 20.8l4.8 4.8" />
    </svg>
  );
}

export function Headphones({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <path d="M5 21v-5a11 11 0 0 1 22 0v5" />
      <rect x="4" y="19" width="6" height="9" rx="2.4" />
      <rect x="22" y="19" width="6" height="9" rx="2.4" />
    </svg>
  );
}

export function Pause({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M8 5v14M16 5v14" />
    </svg>
  );
}

export function Play({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M8 5.5l11 6.5-11 6.5z" />
    </svg>
  );
}

export function Lock({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <rect x="6" y="14" width="20" height="14" rx="4" />
      <path d="M10.5 14v-3.5a5.5 5.5 0 0 1 11 0V14" />
      <path d="M16 19.5v3" />
    </svg>
  );
}

export function Fingerprint({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <path d="M8 13a8 8 0 0 1 16 0v3" />
      <path d="M12 26c1-2 1.5-4.4 1.5-7a2.5 2.5 0 0 1 5 0c0 3.4-.6 6.2-2 8.5" />
      <path d="M8 18c0 3-.4 5-1.4 7M24 19c0 2.4-.3 4.4-1 6.2" />
      <path d="M16 12.5a3.5 3.5 0 0 0-3.5 3.5" />
    </svg>
  );
}

export function Feather({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <path d="M6 26C6 14 13 6 26 5c0 12-7 19-17 19" />
      <path d="M6 26L18 14" />
    </svg>
  );
}

export function Scribble() {
  return (
    <svg viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 9c12-6 20 3 32-2s22 4 34-1 22 3 34-1 12 2 16 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ThinkingScribble() {
  return (
    <svg width="150" height="30" viewBox="0 0 150 30" aria-hidden="true">
      <path d="M4 18c10-14 18 12 28-2s18 10 28-2 18 10 28-2 18 8 28-1 14 4 26 0" fill="none" stroke="var(--orange)" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
